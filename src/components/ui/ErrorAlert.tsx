"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle, RefreshCcw, ShieldCheck } from "lucide-react";
import { Button } from "./Button";

interface ErrorAlertProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export function ErrorAlert({
    isOpen,
    onClose,
    title = "Model Encountered an Error",
    message = "The AI engine ran into a problem while processing your request.",
}: ErrorAlertProps) {
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
                        className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl shadow-red-500/10"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />

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
                                <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 relative">
                                    <AlertTriangle className="w-8 h-8" />
                                    <motion.div
                                        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2.5, repeat: Infinity }}
                                        className="absolute inset-0 rounded-3xl bg-red-500/20 blur-xl"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">System Interruption Detected</p>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-3">
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-4">
                                    <div className="p-2 rounded-xl bg-red-500/10 text-red-400 shrink-0">
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                    <p className="text-xs font-medium text-white/60 leading-relaxed">
                                        {message}{" "}
                                        <span className="text-white font-bold">Please try again.</span>
                                    </p>
                                </div>

                                {/* No Credits Deducted notice */}
                                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center gap-3">
                                    <ShieldCheck className="w-4 h-4 text-white/30 shrink-0" />
                                    <p className="text-[10px] font-bold text-white/30 leading-relaxed uppercase tracking-widest">
                                        No credits were deducted for this attempt.
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={onClose}
                                    className="w-full h-14 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10 transition-all"
                                >
                                    <RefreshCcw className="mr-2 w-4 h-4" />
                                    Try Again
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
