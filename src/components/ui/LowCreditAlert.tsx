"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, AlertTriangle, ArrowRight, X } from "lucide-react";
import { Button } from "./Button";
import { useRouter } from "next/navigation";

interface LowCreditAlertProps {
    isOpen: boolean;
    onClose: () => void;
    requiredCredits?: number;
}

export function LowCreditAlert({ isOpen, onClose, requiredCredits = 2 }: LowCreditAlertProps) {
    const router = useRouter();

    const handleTopUp = () => {
        router.push("/dashboard/billing");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Alert Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl shadow-accent/10"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-accent/10 to-transparent pointer-events-none" />

                        <div className="relative p-8 space-y-6">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Icon & Title */}
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent relative">
                                    <Zap className="w-8 h-8" />
                                    <motion.div
                                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 rounded-3xl bg-accent/20 blur-xl"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white tracking-tight">Credits Low</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Neural Engine Paused</p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-4">
                                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-white/60 leading-relaxed">
                                            Your intelligence balance is insufficient for this generation cycle.
                                            This action requires <span className="text-white font-bold">{requiredCredits} credits</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={handleTopUp}
                                    className="w-full h-14 bg-accent text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20"
                                >
                                    Refuel Credits <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    className="w-full h-12 bg-transparent text-white/40 hover:text-white font-bold uppercase tracking-widest text-[10px] transition-all"
                                >
                                    Dismiss Log
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
