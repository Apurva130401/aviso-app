"use client";

import React from "react";
import { User, Lock, Bell, Shield, Key, Globe, ExternalLink, Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-white mb-2">
                    System <span className="text-accent italic">Settings</span>
                </h1>
                <p className="text-sm text-white/40 font-medium tracking-wide">
                    Manage your account preferences, security, and neural engine configurations.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation */}
                <div className="lg:col-span-1 space-y-1">
                    {[
                        { label: "Profile", icon: <User size={16} />, active: true },
                        { label: "Security", icon: <Lock size={16} /> },
                        { label: "Notifications", icon: <Bell size={16} /> },
                        { label: "API Keys", icon: <Key size={16} /> },
                        { label: "Connected Apps", icon: <Globe size={16} /> },
                    ].map((item, i) => (
                        <button key={i} className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                            item.active ? "bg-accent/10 text-accent border border-accent/20" : "text-white/20 hover:text-white hover:bg-white/5"
                        )}>
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="p-8 bg-[#0a0a0a]/40 border-white/5 rounded-[32px] space-y-8">
                        <div>
                            <h3 className="text-lg font-black text-white tracking-tight mb-1">Profile Configuration</h3>
                            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">General information and public identity.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Full Name</label>
                                <Input defaultValue="Apurva R." className="h-12 bg-black/40 border-white/[0.05] rounded-2xl focus:ring-accent/40 text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Email Address</label>
                                <Input defaultValue="apurva@syncflo.xyz" className="h-12 bg-black/40 border-white/[0.05] rounded-2xl focus:ring-accent/40 text-sm" />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-white">Public Profile</p>
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">Make your workspace profile visible to others.</p>
                            </div>
                            <div className="w-10 h-5 bg-accent rounded-full p-1 flex items-center justify-end">
                                <div className="w-3 h-3 bg-white rounded-full" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" className="h-11 px-6 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white">Cancel</Button>
                            <Button className="h-11 px-8 bg-accent text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-accent/5">
                                <Save className="w-3.5 h-3.5 mr-2" /> Save Changes
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-8 bg-red-500/5 border-red-500/10 rounded-[32px] border-dashed">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-red-500/80 tracking-tight mb-1">Danger Zone</h3>
                                <p className="text-[10px] text-red-500/40 font-black uppercase tracking-widest">Permanent account actions and workspace deletion.</p>
                            </div>
                            <Button variant="outline" className="border-red-500/20 text-red-500/60 hover:bg-red-500/10 hover:text-red-500 font-black uppercase tracking-widest text-[9px] h-10 px-6">
                                Delete Workspace
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
