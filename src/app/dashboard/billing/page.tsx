"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, Zap, Check, ShieldCheck, Download, Plus, Loader2, Tag, Ticket, ArrowRight, Sparkles, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getDashboardStatsAction, getPaymentHistoryAction } from "@/app/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { packages } from "@/config/billing";
import { getAvailableCouponsAction } from "@/app/actions/billing.actions";

export default function BillingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [profile, setProfile] = useState<any>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

    const success = searchParams.get('success');
    const creditsAddedParam = searchParams.get('credits');
    const [showSuccess, setShowSuccess] = useState(false);
    const [creditsAdded, setCreditsAdded] = useState(0);
    const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

    const loadData = async () => {
        const [statsResult, historyResult, couponsResult] = await Promise.all([
            getDashboardStatsAction(),
            getPaymentHistoryAction(),
            getAvailableCouponsAction()
        ]);
        if (statsResult.success) {
            setProfile(statsResult.data);
        }
        if (historyResult.success && historyResult.data) {
            setInvoices(historyResult.data);
        }
        if (couponsResult) {
            setAvailableCoupons(couponsResult);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        // Check if returning from a successful checkout
        if (success === "true") {
            const added = Number(creditsAddedParam);
            if (added) {
                setCreditsAdded(added);
                setShowSuccess(true);
            }
            // Clean up URL
            window.history.replaceState({}, '', '/dashboard/billing');
        }
    }, [searchParams, success, creditsAddedParam]);

    const handleDownloadInvoice = async (paymentId: string) => {
        try {
            setDownloadingInvoice(paymentId);
            const res = await fetch(`/api/view-invoice?paymentId=${paymentId}`);
            if (!res.ok) {
                alert("Failed to load invoice");
                return;
            }

            const htmlContent = await res.text();

            // Open blank tab and write dynamic HTML
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(htmlContent);
                newWindow.document.close();
            } else {
                alert("Please allow popups to view your invoice.");
            }
        } catch (error) {
            console.error("Download Error:", error);
            alert("Error downloading invoice.");
        } finally {
            setDownloadingInvoice(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const topUpPackages = Object.values(packages);

    return (
        <div className="space-y-12 pb-20 relative">

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[32px] max-w-sm w-full relative overflow-hidden text-center"
                        >
                            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
                            <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 text-primary relative z-10">
                                <Zap size={32} strokeWidth={3} className="animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight mb-2 relative z-10">Top-up Successful!</h2>
                            <p className="text-white/60 text-sm font-medium mb-8 relative z-10">
                                {creditsAdded} credits have been added to your workspace. Start generating more high-converting content.
                            </p>
                            <Button
                                onClick={() => setShowSuccess(false)}
                                className="w-full h-12 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white/90"
                            >
                                Continue
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Content */}
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                    <Sparkles size={12} /> Pay-As-You-Go Layer
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
                    Billing & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ff8c00] italic">Credit Top-ups</span>
                </h1>
                <p className="text-base text-white/40 font-medium tracking-wide max-w-xl">
                    Manage your neural credits on a customized pay-as-you-go basis. Expand your workspace resources securely and instantly.
                </p>
            </div>

            {/* Usage Bar */}
            <Card className="p-8 bg-white/[0.03] border-white/5 rounded-[32px] overflow-hidden relative group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-white tracking-tight">Neural Credit Balance</h3>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Workspace 01</p>
                    </div>
                    <div className="flex-1 max-w-md space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                            <span className="text-primary">{profile?.creditsUsed || 0} Used</span>
                            <span className="text-white/20">{profile?.creditsTotal || 100} Total</span>
                        </div>
                        <div className="h-2.5 bg-black/50 border border-white/5 rounded-full overflow-hidden inline-flex w-full relative">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, ((profile?.creditsUsed || 0) / (profile?.creditsTotal || 100)) * 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-primary to-accent relative"
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1em_1em] animate-stripes"></div>
                            </motion.div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-white/30">
                            <span>Balance: {(profile?.creditsTotal || 100) - (profile?.creditsUsed || 0)} available</span>
                        </div>
                    </div>
                    <Button
                        onClick={() => document.getElementById('topup-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="h-12 px-8 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-primary transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,165,0,0.3)]"
                    >
                        Top Up Credits <Plus className="ml-2 w-4 h-4" />
                    </Button>
                </div>
                <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-primary/10 transition-colors duration-500 -rotate-12 translate-x-4 -translate-y-4">
                    <Zap size={140} strokeWidth={3} />
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Plans Grid */}
                <div id="topup-section" className="lg:col-span-3 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <Zap size={16} strokeWidth={3} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-white">Select a Package</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {topUpPackages.map((pkg, i) => (
                            <Card key={pkg.id} className={cn(
                                "p-8 bg-[#0a0a0a]/60 border-white/5 rounded-[40px] flex flex-col space-y-8 relative group hover:border-white/20 hover:bg-[#111] transition-all duration-300",
                                pkg.bestValue && "border-primary/30 bg-primary/5 hover:border-primary/50"
                            )}>
                                {pkg.bestValue && (
                                    <div className="absolute -top-3 inset-x-0 flex justify-center">
                                        <div className="bg-primary text-black text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(255,165,0,0.4)]">
                                            Most Popular
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">{pkg.name}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className={cn(
                                            "text-4xl font-black tracking-tighter transition-colors",
                                            pkg.bestValue ? "text-primary" : "text-white group-hover:text-primary"
                                        )}>{pkg.price}</span>
                                        <span className="text-xs text-white/20 font-bold tracking-wider">USD</span>
                                    </div>
                                    <div className="mt-3 inline-flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                        <Zap size={12} className="text-primary" />
                                        <span className="text-white/60 font-bold text-[11px] tracking-wide">{pkg.creditsLabel}</span>
                                    </div>
                                </div>

                                <ul className="flex-1 space-y-4">
                                    {pkg.features.map((feat, j) => (
                                        <li key={j} className="flex items-start gap-3 text-xs font-bold text-white/50 leading-relaxed">
                                            <div className="mt-0.5 min-w-[14px]">
                                                <Check className="w-3.5 h-3.5 text-primary" strokeWidth={4} />
                                            </div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    onClick={() => router.push(`/checkout/${pkg.id}`)}
                                    className={cn(
                                        "w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-between px-6 transition-all duration-300",
                                        pkg.bestValue
                                            ? "bg-primary hover:bg-primary/90 text-black shadow-[0_5px_20px_rgba(255,165,0,0.3)]"
                                            : "bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black hover:border-transparent"
                                    )}
                                >
                                    <span>Select Plan</span>
                                    <ArrowRight size={14} className={cn(
                                        "transition-transform group-hover:translate-x-1",
                                        pkg.bestValue ? "text-black" : "text-white group-hover:text-black"
                                    )} />
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Coupons Section Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                            <Tag size={14} strokeWidth={3} />
                        </div>
                        <h2 className="text-xl font-black tracking-tight text-white">Active Offers</h2>
                    </div>

                    <div className="space-y-4">
                        {availableCoupons.map((coupon, idx) => (
                            <Card key={idx} className="p-5 bg-gradient-to-br from-[#111] to-[#0a0a0a] border-white/5 rounded-3xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Ticket size={64} className="text-primary -rotate-45 translate-x-6 -translate-y-4" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs text-white/60 font-bold mb-3">{coupon.description}</p>
                                    <div className="inline-flex items-center gap-2 bg-black/50 border border-white/10 px-3 py-2 rounded-xl">
                                        <span className="text-primary font-black tracking-widest text-xs uppercase">{coupon.code}</span>
                                    </div>
                                    {coupon.validFor && coupon.validFor.length > 0 && (
                                        <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-4">
                                            Valid for: {coupon.validFor.map((id: string) => packages[id]?.name || id).join(', ')}
                                        </p>
                                    )}
                                </div>
                            </Card>
                        ))}
                        <Card className="p-6 bg-[#0a0a0a]/40 border-dashed border-white/10 rounded-3xl text-center">
                            <p className="text-xs text-white/40 font-medium">Apply these codes at checkout</p>
                        </Card>
                    </div>
                </div>
            </div>

            {/* History */}
            <div className="pt-8 relative z-10">
                <Card className="bg-[#0a0a0a]/60 border-white/5 rounded-[40px] overflow-hidden backdrop-blur-xl">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 border border-white/5">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">Payment History</h3>
                                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Recent transactions and tax invoices.</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-black/20">
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/30">Invoice ID</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/30">Billing Date</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/30">Amount</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/30">Status</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/30 text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <Clock size={24} className="text-white/10" />
                                                <p className="text-xs font-bold text-white/30 tracking-wide">No payment history found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : invoices.map((inv) => (
                                    <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6 text-xs font-black text-white/50 uppercase tracking-widest">{inv.id.substring(0, 12)}</td>
                                        <td className="px-8 py-6 text-xs font-bold text-white/40">{new Date(inv.created_at).toLocaleDateString()}</td>
                                        <td className="px-8 py-6 text-sm font-black text-white">${inv.amount?.toFixed(2)}</td>
                                        <td className="px-8 py-6">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                                                <ShieldCheck size={12} /> {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownloadInvoice(inv.id)}
                                                disabled={downloadingInvoice === inv.id}
                                                className="h-10 w-10 p-0 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                            >
                                                {downloadingInvoice === inv.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Download size={16} />
                                                )}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
