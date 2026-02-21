"use client";

import React from "react";
import { motion } from "motion/react";
import { LayoutGrid, Plus, History, Briefcase, Palette, Settings, HelpCircle, LogOut, Menu, X, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import Link from "next/link";
import { usePathname } from "next/navigation";


export const Sidebar = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => {
    const pathname = usePathname();
    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-white/[0.05] transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
            <div className="h-full flex flex-col">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 text-black font-black">
                        A
                    </div>
                    {isOpen && <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Aviso</span>}
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    <SidebarItem href="/dashboard" icon={<LayoutGrid strokeWidth={1.5} className="w-4 h-4" />} label="Overview" active={pathname === "/dashboard"} />
                    <SidebarItem href="/dashboard/create" icon={<Plus strokeWidth={1.5} className="w-4 h-4" />} label="New Campaign" active={pathname === "/dashboard/create"} />
                    <SidebarItem href="/dashboard/history" icon={<History strokeWidth={1.5} className="w-4 h-4" />} label="History" active={pathname === "/dashboard/history"} />
                    <SidebarItem href="/dashboard/assets" icon={<Briefcase strokeWidth={1.5} className="w-4 h-4" />} label="Assets" active={pathname === "/dashboard/assets"} />
                    <SidebarItem href="/dashboard/studio" icon={<Palette strokeWidth={1.5} className="w-4 h-4" />} label="Studio" active={pathname === "/dashboard/studio"} />
                    <SidebarItem href="/dashboard/billing" icon={<CreditCard strokeWidth={1.5} className="w-4 h-4" />} label="Billing" active={pathname === "/dashboard/billing"} />

                    <div className="pt-6 pb-2 px-4">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Support Systems</p>
                    </div>
                    <SidebarItem href="/dashboard/settings" icon={<Settings strokeWidth={1.5} className="w-5 h-5" />} label="Settings" active={pathname === "/dashboard/settings"} />
                    <SidebarItem href="/dashboard/help" icon={<HelpCircle strokeWidth={1.5} className="w-5 h-5" />} label="Help Center" active={pathname === "/dashboard/help"} />
                </nav>

                <div className="p-6 border-t border-white/[0.05]">
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.05] rounded-[24px] p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Resource Usage</p>
                            <p className="text-[10px] font-bold text-white">12 / 50</p>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-4">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "24%" }}
                                className="h-full bg-gradient-to-r from-accent to-primary"
                            />
                        </div>
                        <Button className="w-full h-10" variant="primary" size="sm">
                            Upgrade Plan
                        </Button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

const SidebarItem = ({ icon, label, active, href, onClick }: { icon: React.ReactNode; label: string; active?: boolean; href?: string; onClick?: () => void }) => {
    const content = (
        <div
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-bold transition-all group relative overflow-hidden",
                active
                    ? "text-white"
                    : "text-white/40 hover:text-white hover:bg-white/[0.02]"
            )}
        >
            {active && (
                <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-white/[0.05] rounded-2xl border border-white/5"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <span className={cn(
                "relative z-10 transition-colors duration-300",
                active ? "text-primary" : "text-white/40 group-hover:text-accent"
            )}>
                {icon}
            </span>
            <span className="relative z-10 transition-colors tracking-tight uppercase text-[9px]">
                {label}
            </span>
        </div>
    );

    if (href) {
        return <Link href={href} className="block w-full">{content}</Link>;
    }

    return (
        <button onClick={onClick} className="w-full">
            {content}
        </button>
    );
};

const Card = ({ className, children, hover }: { className?: string; children: React.ReactNode; hover?: boolean }) => {
    return (
        <div className={cn("bg-surface border border-border-subtle rounded-xl", className)}>
            {children}
        </div>
    );
};
