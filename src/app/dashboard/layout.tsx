"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import { ChevronRight, Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { UserProvider, useUser } from "@/context/UserContext";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <UserProvider>
            <DashboardContent>{children}</DashboardContent>
        </UserProvider>
    );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { profile, loading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    return (
        <div className="h-screen bg-[#030303] text-white flex overflow-hidden font-sans relative">
            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid-subtle [mask-image:linear-gradient(to_bottom,black,transparent)] opacity-40" />
            </div>

            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-[#0a0a0a]/40 backdrop-blur-xl border-b border-white/[0.05] flex items-center justify-between px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg lg:hidden transition-colors">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="hidden lg:flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
                            <span className="hover:text-primary transition-colors cursor-pointer">Dashboard</span>
                            <ChevronRight className="w-3 h-3" strokeWidth={3} />
                            <span className="text-white">Workspace 01</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">System Online</span>
                        </div>
                        <button className="p-2 hover:bg-white/5 rounded-xl text-white/40 transition-all hover:text-white">
                            <Bell className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <div className="h-4 w-px bg-white/[0.05] mx-1" />

                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 pl-2 group transition-all"
                            >
                                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-primary font-bold shadow-inner border border-white/[0.1] text-xs group-hover:border-primary/50 transition-colors">
                                    {profile?.full_name
                                        ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                        : '??'
                                    }
                                </div>
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setUserMenuOpen(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="p-2 space-y-1">
                                                <div className="px-3 py-2 border-b border-white/5 mb-1">
                                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Account Profile</p>
                                                    <p className="text-xs font-medium text-white/90 truncate">{profile?.full_name || 'User'}</p>
                                                    <p className="text-[9px] text-white/20 truncate">{profile?.email}</p>
                                                </div>
                                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors group">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-primary transition-colors" />
                                                    Account Settings
                                                </button>
                                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors group">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-primary transition-colors" />
                                                    Billing & Usage
                                                </button>
                                                <div className="h-px bg-white/5 my-1" />
                                                <LogoutButton />
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
