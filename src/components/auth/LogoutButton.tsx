"use client";

import { useState } from "react";
import { logout } from "@/app/auth/actions";
import { motion, AnimatePresence } from "motion/react";

export function LogoutButton() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoggingOut(false);
        }
    };

    return (
        <>
            <form onSubmit={handleLogout} className="w-full h-full p-0 m-0">
                <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-colors group">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500/20 group-hover:bg-rose-500 transition-colors" />
                    Logout
                </button>
            </form>

            <AnimatePresence>
                {isLoggingOut && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030303]/60 backdrop-blur-xl"
                    >
                        <div className="flex flex-col items-center gap-8">
                            <div className="relative w-16 h-16">
                                {/* Outer spinning ring */}
                                <motion.div
                                    className="absolute inset-0 rounded-full border-t-2 border-primary border-r-2 border-transparent"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />

                                {/* Inner spinning ring */}
                                <motion.div
                                    className="absolute inset-2 rounded-full border-b-2 border-rose-500 border-l-2 border-transparent opacity-80"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />

                                {/* Center dot */}
                                <motion.div
                                    className="absolute inset-0 flex items-center justify-center"
                                    animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1, 0.9] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className="w-4 h-4 bg-gradient-to-br from-rose-500/50 to-primary/50 blur-[1px] rounded-full" />
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col items-center gap-2"
                            >
                                <p className="text-xs uppercase tracking-[0.3em] font-bold text-white/60">
                                    Logging out
                                </p>
                                <p className="text-[10px] text-white/30 tracking-widest uppercase">
                                    Securely ending session
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
