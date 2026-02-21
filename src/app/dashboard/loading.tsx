"use client";

import React from "react";
import { motion } from "motion/react";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030303] backdrop-blur-md">
            <div className="flex flex-col items-center gap-6">
                <div className="relative w-16 h-16">
                    {/* Outer spinning ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-t-2 border-primary border-r-2 border-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {/* Inner spinning ring (opposite direction) */}
                    <motion.div
                        className="absolute inset-2 rounded-full border-b-2 border-accent border-l-2 border-transparent opacity-80"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Center static/pulsing logo (optional, can be removed to be purely minimal) */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1, 0.9] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="w-6 h-6 bg-gradient-to-br from-accent/50 to-primary/50 blur-[2px] rounded-full" />
                    </motion.div>
                </div>
                
                {/* Optional minimalistic text */}
                {/* <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40"
                >
                    Loading
                </motion.p> */}
            </div>
        </div>
    );
}
