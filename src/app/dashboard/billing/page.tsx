"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, Zap, Check, ShieldCheck, Clock, Download, Plus, Loader2, X, PartyPopper } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getDashboardStatsAction, getPaymentHistoryAction } from "@/app/actions";
import Script from "next/script";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function BillingPage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processingPlan, setProcessingPlan] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [creditsAdded, setCreditsAdded] = useState(0);
    const [invoices, setInvoices] = useState<any[]>([]);

    const loadData = async () => {
        const [statsResult, historyResult] = await Promise.all([
            getDashboardStatsAction(),
            getPaymentHistoryAction()
        ]);
        if (statsResult.success) {
            setProfile(statsResult.data);
        }
        if (historyResult.success && historyResult.data) {
            setInvoices(historyResult.data);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleTopUp = async (packageId: string) => {
        setProcessingPlan(packageId);
        try {
            const res = await fetch("/api/billing/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ packageId })
            });

            const data = await res.json();

            if (data.success && data.orderId) {
                const options = {
                    key: data.key,
                    amount: data.amount,
                    currency: data.currency,
                    name: "Aviso App",
                    description: "Neural Credits Top-up",
                    order_id: data.orderId,
                    handler: async function (response: any) {
                        try {
                            const verifyRes = await fetch("/api/billing/verify-payment", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                    packageId
                                })
                            });
                            const verifyData = await verifyRes.json();
                            if (verifyData.success) {
                                setCreditsAdded(verifyData.creditsAdded);
                                setShowSuccess(true);
                                loadData(); // refresh credits silently
                            } else {
                                alert("Failed to verify payment: " + verifyData.error);
                            }
                        } catch (e) {
                            console.error("Verification error", e);
                            alert("Payment verification error.");
                        }
                    },
                    prefill: { email: profile?.email || "" },
                    theme: { color: "#FFFFFF" },
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                alert("Error initializing payment: " + data.error);
            }
        } catch (error) {
            console.error("Payment Error:", error);
        } finally {
            setProcessingPlan(null);
        }
    };

    const topUpPackages = [
        { id: "starter", name: "Starter Refill", price: "$10", credits: "1000 Credits", features: ["1 Text-only Campaign", "Basic Email Support"] },
        { id: "growth", name: "Growth Refill", price: "$25", credits: "3000 Credits", features: ["Ideal for Image Gen", "Priority Queue", "Email Support"], bestValue: true },
        { id: "pro", name: "Pro Bulk", price: "$50", credits: "7500 Credits", features: ["Maximum Margin", "Dedicated Rep", "24/7 Support"] },
    ];

    return (
        <div className="space-y-12 pb-20 relative">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

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

            <div>
                <h1 className="text-3xl font-black tracking-tight text-white mb-2">
                    Billing & <span className="text-accent italic">Credit Top-ups</span>
                </h1>
                <p className="text-sm text-white/40 font-medium tracking-wide">
                    Manage your neural credits on a pay-as-you-go basis. No monthly commitments.
                </p>
            </div>

            {/* Usage Bar */}
            <Card className="p-8 bg-white/[0.03] border-white/5 rounded-[32px] overflow-hidden relative group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-1">
                        <h3 className="text-lg font-black text-white tracking-tight">Neural Credit Balance</h3>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Workspace 01 / Pay-As-You-Go</p>
                    </div>
                    <div className="flex-1 max-w-md space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                            <span className="text-primary">{profile?.creditsUsed || 0} Used</span>
                            <span className="text-white/20">{profile?.creditsTotal || 100} Total</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, ((profile?.creditsUsed || 0) / (profile?.creditsTotal || 100)) * 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-primary to-accent"
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-white/30">
                            <span>Balance: {(profile?.creditsTotal || 100) - (profile?.creditsUsed || 0)}</span>
                        </div>
                    </div>
                    <Button
                        onClick={() => document.getElementById('topup-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="h-11 px-6 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-accent transition-colors"
                    >
                        Top Up Credits <Plus className="ml-2 w-3.5 h-3.5" />
                    </Button>
                </div>
                <div className="absolute top-0 right-0 p-8 text-primary/10 -rotate-12 translate-x-4 -translate-y-4">
                    <Zap size={120} strokeWidth={3} />
                </div>
            </Card>

            {/* Plans */}
            <div id="topup-section" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topUpPackages.map((pkg, i) => (
                    <Card key={i} className={cn(
                        "p-8 bg-[#0a0a0a]/40 border-white/5 rounded-[40px] flex flex-col space-y-8 relative group hover:border-white/10 transition-all",
                        pkg.bestValue && "border-primary/20 bg-primary/5"
                    )}>
                        {pkg.bestValue && (
                            <div className="absolute top-4 right-8 bg-primary text-black text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                                Best Value
                            </div>
                        )}
                        <div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">{pkg.name}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white tracking-tighter">{pkg.price}</span>
                                <span className="text-xs text-white/20 font-bold">one-time</span>
                            </div>
                            <div className="mt-2 text-primary font-bold text-sm tracking-wide">{pkg.credits}</div>
                        </div>

                        <ul className="flex-1 space-y-4">
                            {pkg.features.map((feat, j) => (
                                <li key={j} className="flex items-center gap-3 text-[11px] font-bold text-white/60">
                                    <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
                                    {feat}
                                </li>
                            ))}
                        </ul>

                        <Button
                            variant={pkg.bestValue ? "secondary" : "outline"}
                            disabled={processingPlan !== null}
                            onClick={() => handleTopUp(pkg.id)}
                            className={cn(
                                "w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]",
                                pkg.bestValue ? "bg-white/5 border-white/10 hover:bg-white text-black transition-colors" : "border-white/5 text-white/40 hover:text-white"
                            )}
                        >
                            {processingPlan === pkg.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Buy Credits"
                            )}
                        </Button>
                    </Card>
                ))}
            </div>

            {/* History */}
            <Card className="bg-[#0a0a0a]/40 border-white/5 rounded-[32px] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white tracking-tight">Payment History</h3>
                            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Recent transactions and tax invoices.</p>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-white/20">Invoice ID</th>
                                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-white/20">Billing Date</th>
                                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-white/20">Amount</th>
                                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-white/20">Status</th>
                                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-white/20 text-right">PDF</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-8 text-center text-xs font-medium text-white/40">No payment history found.</td>
                                </tr>
                            ) : invoices.map((inv) => (
                                <tr key={inv.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="px-8 py-5 text-xs font-black text-white/60 uppercase tracking-widest">{inv.id.substring(0, 12)}</td>
                                    <td className="px-8 py-5 text-xs font-bold text-white/40">{new Date(inv.created_at).toLocaleDateString()}</td>
                                    <td className="px-8 py-5 text-xs font-black text-white">${inv.amount?.toFixed(2)}</td>
                                    <td className="px-8 py-5">
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest">
                                            <ShieldCheck size={10} /> {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/20 hover:text-white rounded-lg">
                                            <Download size={14} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

