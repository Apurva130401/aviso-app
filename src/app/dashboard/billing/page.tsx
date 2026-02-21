"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CreditCard, Zap, Check, ShieldCheck, Clock, Download, Plus, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getDashboardStatsAction } from "@/app/actions";
import { createSubscriptionAction } from "@/app/auth/billing";
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

    useEffect(() => {
        async function loadData() {
            const result = await getDashboardStatsAction();
            if (result.success) {
                setProfile(result.data);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const handleUpgrade = async (planName: string) => {
        if (planName === 'Starter') return;

        setProcessingPlan(planName);
        try {
            const { key } = await (await import("@/app/auth/billing")).getRazorpayKeyAction();
            const result = await createSubscriptionAction(planName);

            if (result.success && result.subscriptionId) {
                const options = {
                    key: key,
                    subscription_id: result.subscriptionId,
                    name: "Aviso App",
                    description: `${planName} Subscription`,
                    handler: function (response: any) {
                        alert("Payment successful! Your plan will be updated shortly.");
                        window.location.reload();
                    },
                    prefill: {
                        email: profile?.email || "",
                    },
                    theme: {
                        color: "#FFFFFF",
                    },
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                alert("Error creating subscription: " + result.error);
            }
        } catch (error) {
            console.error("Payment Error:", error);
        } finally {
            setProcessingPlan(null);
        }
    };

    const plans = [
        { name: "Starter", price: "$0", features: ["1,000 Credits/mo", "Basic Neural Nodes", "Standard Support"], current: profile?.planTier === 'Starter' },
        { name: "Pro", price: "$49", features: ["15,000 Credits/mo", "Advanced Neural Sync", "Priority Support", "Custom Brand Models"], current: profile?.planTier === 'Pro' },
        { name: "Enterprise", price: "Custom", features: ["Unlimited Credits", "Dedicated Infrastructure", "24/7 Neural Audit", "On-prem Deployment"], current: profile?.planTier === 'Enterprise' },
    ];

    const invoices = [
        { id: "INV-2026-001", date: "Feb 01, 2026", amount: "$49.00", status: "paid" },
    ];

    return (
        <div className="space-y-12 pb-20">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div>
                <h1 className="text-3xl font-black tracking-tight text-white mb-2">
                    Billing & <span className="text-accent italic">Subscriptions</span>
                </h1>
                <p className="text-sm text-white/40 font-medium tracking-wide">
                    Manage your neural credits, subscription tiers, and financial operations.
                </p>
            </div>

            {/* Usage Bar */}
            <Card className="p-8 bg-white/[0.03] border-white/5 rounded-[32px] overflow-hidden relative group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-1">
                        <h3 className="text-lg font-black text-white tracking-tight">Neural Credit Usage</h3>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Workspace 01 / {profile?.planTier || 'Starter'} Tier</p>
                    </div>
                    <div className="flex-1 max-w-md space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                            <span className="text-primary">{profile?.creditsUsed || 0} Used</span>
                            <span className="text-white/20">{profile?.creditsTotal || 1000} Total</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, ((profile?.creditsUsed || 0) / (profile?.creditsTotal || 1000)) * 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-primary to-accent"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={() => handleUpgrade('Pro')}
                        className="h-11 px-6 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-accent transition-colors"
                    >
                        Buy Credits <Plus className="ml-2 w-3.5 h-3.5" />
                    </Button>
                </div>
                <div className="absolute top-0 right-0 p-8 text-primary/10 -rotate-12 translate-x-4 -translate-y-4">
                    <Zap size={120} strokeWidth={3} />
                </div>
            </Card>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, i) => (
                    <Card key={i} className={cn(
                        "p-8 bg-[#0a0a0a]/40 border-white/5 rounded-[40px] flex flex-col space-y-8 relative group hover:border-white/10 transition-all",
                        plan.current && "border-primary/20 bg-primary/5"
                    )}>
                        {plan.current && (
                            <div className="absolute top-4 right-8 bg-primary text-black text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                                Active Plan
                            </div>
                        )}
                        <div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">{plan.name}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white tracking-tighter">{plan.price}</span>
                                {plan.price !== "Custom" && <span className="text-xs text-white/20 font-bold">/mo</span>}
                            </div>
                        </div>

                        <ul className="flex-1 space-y-4">
                            {plan.features.map((feat, j) => (
                                <li key={j} className="flex items-center gap-3 text-[11px] font-bold text-white/60">
                                    <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
                                    {feat}
                                </li>
                            ))}
                        </ul>

                        <Button
                            variant={plan.current ? "secondary" : "outline"}
                            disabled={plan.current || processingPlan !== null}
                            onClick={() => handleUpgrade(plan.name)}
                            className={cn(
                                "w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]",
                                plan.current ? "bg-white/5 border-white/10 text-white cursor-default" : "border-white/5 text-white/40 hover:text-white"
                            )}
                        >
                            {processingPlan === plan.name ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : plan.current ? (
                                "Current Plan"
                            ) : (
                                "Upgrade"
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
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="px-8 py-5 text-xs font-black text-white/60 uppercase tracking-widest">{inv.id}</td>
                                    <td className="px-8 py-5 text-xs font-bold text-white/40">{inv.date}</td>
                                    <td className="px-8 py-5 text-xs font-black text-white">{inv.amount}</td>
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
