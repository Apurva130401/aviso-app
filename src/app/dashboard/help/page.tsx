"use client";

import React from "react";
import { Search, Book, MessageCircle, FileText, Video, PlayCircle, ExternalLink, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function HelpPage() {
    const categories = [
        { title: "Getting Started", icon: <PlayCircle size={20} className="text-accent" />, count: "12 Articles" },
        { title: "Neural Sync", icon: <Book size={20} className="text-primary" />, count: "8 Articles" },
        { title: "Billing & Plans", icon: <FileText size={20} className="text-white/40" />, count: "5 Articles" },
        { title: "API Usage", icon: <Video size={20} className="text-accent" />, count: "15 Articles" },
    ];

    return (
        <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto py-8">
                <h1 className="text-3xl font-black tracking-tight text-white mb-4">
                    How can we <span className="text-accent italic">Help?</span>
                </h1>
                <div className="relative group max-w-lg mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                    <Input placeholder="Search documentation, guides, and more..." className="pl-12 h-14 bg-[#0a0a0a]/60 border-white/5 rounded-2xl text-sm shadow-xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((cat, i) => (
                    <Card key={i} className="p-8 bg-[#0a0a0a]/40 border-white/5 rounded-[32px] hover:border-accent/20 transition-all group flex flex-col items-center text-center cursor-pointer">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-6 group-hover:scale-110 transition-all duration-500">
                            {cat.icon}
                        </div>
                        <h3 className="text-sm font-bold text-white mb-2">{cat.title}</h3>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">{cat.count}</p>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                <Card className="p-10 bg-accent/5 border-accent/10 rounded-[48px] border-dashed flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <MessageCircle size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight mb-2">Live Support</h3>
                        <p className="text-sm text-white/40 max-w-xs mx-auto">Expected response time is under 15 minutes for Pro tier users.</p>
                    </div>
                    <Button className="h-12 px-8 bg-accent text-black font-black uppercase tracking-widest text-[10px] rounded-xl">
                        Start Conversation
                    </Button>
                </Card>

                <Card className="p-10 bg-white/5 border-white/5 rounded-[48px] flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                        <HelpCircle size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight mb-2">Community Discord</h3>
                        <p className="text-sm text-white/40 max-w-xs mx-auto">Connect with other designers and neural engineers.</p>
                    </div>
                    <Button variant="outline" className="h-12 px-8 border-white/10 text-white/60 hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px]">
                        Join Discord <ExternalLink size={14} className="ml-2" />
                    </Button>
                </Card>
            </div>
        </div>
    );
}
