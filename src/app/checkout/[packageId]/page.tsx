"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, Tag, ArrowLeft, Loader2, Zap, Check, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getDashboardStatsAction } from "@/app/actions";
import { packages, calculateFinalAmount, Coupon } from "@/config/billing";
import { validateCouponAction } from "@/app/actions/billing.actions";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const packageId = params.packageId as string;

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Coupon state
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [couponError, setCouponError] = useState("");

    const pkg = packages[packageId];

    useEffect(() => {
        if (!pkg) {
            router.replace('/dashboard/billing');
            return;
        }

        const loadProfile = async () => {
            const res = await getDashboardStatsAction();
            if (res.success) setProfile(res.data);
            setLoading(false);
        };
        loadProfile();
    }, [pkg, router]);

    if (!pkg) return null; // or a loading spinner

    const baseAmountValue = pkg.amount;
    const finalAmountValue = calculateFinalAmount(pkg.amount, appliedCoupon);
    const discountValue = baseAmountValue - finalAmountValue;

    const handleApplyCoupon = async () => {
        setCouponError("");
        if (!couponInput.trim()) return;

        setValidatingCoupon(true);
        const code = couponInput.trim().toUpperCase();

        // Use the backend action to validate directly against Supabase securely
        const validCoupon = await validateCouponAction(code, pkg.id);

        if (!validCoupon) {
            setCouponError("Invalid coupon code or not applicable to this package.");
            setValidatingCoupon(false);
            return;
        }

        setAppliedCoupon(validCoupon);
        setCouponInput("");
        setValidatingCoupon(false);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponError("");
    };

    const handleCheckout = async () => {
        setProcessing(true);
        try {
            // Step 1: Create Order locally fetching final amount
            const res = await fetch("/api/billing/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ packageId: pkg.id, couponCode: appliedCoupon?.code || undefined })
            });

            const data = await res.json();

            if (data.success && data.orderId) {
                // Step 2: Initialize Razorpay SDK
                const options = {
                    key: data.key,
                    amount: data.amount,
                    currency: data.currency,
                    name: "Aviso App",
                    description: `${pkg.name} Top-up`,
                    order_id: data.orderId,
                    handler: async function (response: any) {
                        try {
                            // Step 3: Verify Payment and add credits
                            const verifyRes = await fetch("/api/billing/verify-payment", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                    packageId: pkg.id,
                                    couponCode: appliedCoupon?.code || undefined
                                })
                            });

                            const verifyData = await verifyRes.json();
                            if (verifyData.success) {
                                router.push(`/dashboard/billing?success=true&credits=${verifyData.creditsAdded}`);
                            } else {
                                alert("Failed to verify payment: " + verifyData.error);
                            }
                        } catch (e) {
                            console.error("Verification error", e);
                            alert("Payment verification error.");
                        } finally {
                            setProcessing(false);
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            setProcessing(false);
                        }
                    },
                    prefill: { email: profile?.email || "" },
                    theme: { color: "#FFFFFF" },
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                alert("Error initializing payment: " + data.error);
                setProcessing(false);
            }
        } catch (error) {
            console.error("Payment Error:", error);
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8 relative">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div>
                <button
                    onClick={() => router.push('/dashboard/billing')}
                    className="inline-flex items-center text-xs font-black uppercase tracking-widest text-white/40 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={14} className="mr-2" /> Back to Packages
                </button>
                <h1 className="text-3xl font-black tracking-tight text-white mb-2">Secure Checkout</h1>
                <p className="text-sm text-white/40 font-medium tracking-wide">
                    Complete your transaction securely. Cancel anytime.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Order Details & Coupon */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[32px]">
                        <h3 className="text-lg font-black text-white tracking-tight mb-6">Package Details</h3>

                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                                <Zap className="text-primary w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white">{pkg.name}</h4>
                                <p className="text-sm text-white/50 font-medium mt-1 mb-4">{pkg.description}</p>

                                <ul className="space-y-2">
                                    {pkg.features.map((feat, j) => (
                                        <li key={j} className="flex items-center gap-2 text-[11px] font-bold text-white/40">
                                            <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 bg-[#0a0a0a]/40 border-white/5 rounded-[32px]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                                <Tag size={16} />
                            </div>
                            <h3 className="text-lg font-black text-white tracking-tight">Have a Coupon?</h3>
                        </div>

                        {appliedCoupon ? (
                            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/20 p-2 rounded-lg"><Tag size={14} className="text-primary" /></div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-widest">{appliedCoupon.code}</p>
                                        <p className="text-[10px] text-primary/80 font-bold mt-0.5">{appliedCoupon.description}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemoveCoupon}
                                    className="text-white/40 hover:text-red-400 text-xs font-bold"
                                >
                                    Remove
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Enter code (e.g. WELCOME20)"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value)}
                                        className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all uppercase"
                                    />
                                    <Button
                                        onClick={handleApplyCoupon}
                                        disabled={!couponInput.trim() || validatingCoupon}
                                        className="h-12 px-6 bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white hover:text-black transition-colors min-w-[100px]"
                                    >
                                        {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Apply"}
                                    </Button>
                                </div>
                                {couponError && (
                                    <p className="text-red-400 text-xs font-bold mt-3 pl-1 flex items-center gap-1.5 animate-in fade-in zoom-in-95">
                                        <ShieldCheck size={12} /> {couponError}
                                    </p>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="p-8 bg-white/[0.03] border-white/5 rounded-[32px] sticky top-8">
                        <h3 className="text-lg font-black text-white tracking-tight mb-6">Order Summary</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center text-sm font-bold text-white/60">
                                <span>Base Price</span>
                                <span>${(baseAmountValue / 100).toFixed(2)}</span>
                            </div>

                            <AnimatePresence>
                                {discountValue > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex justify-between items-center text-sm font-black text-primary overflow-hidden"
                                    >
                                        <span>Discount</span>
                                        <span>-${(discountValue / 100).toFixed(2)}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="pt-6 border-t border-white/10 mb-8">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-black uppercase tracking-widest text-white/40">Total</span>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-white tracking-tighter">${(finalAmountValue / 100).toFixed(2)}</span>
                                    <p className="text-[10px] font-bold text-white/20 mt-1 uppercase tracking-widest">USD</p>
                                </div>
                            </div>
                        </div>

                        <Button
                            disabled={processing}
                            onClick={handleCheckout}
                            className="w-full h-14 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,165,0,0.3)] flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                            ) : (
                                <><CreditCard size={16} /> Proceed to Payment</>
                            )}
                        </Button>

                        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            <ShieldCheck size={12} className="text-white/40" /> Secure encrypted checkout
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
