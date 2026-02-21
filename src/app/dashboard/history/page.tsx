"use client";

import React from "react";
import { motion } from "motion/react";
import { Search, Filter, ArrowRight, CheckCircle2, AlertCircle, Clock, MoreVertical, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

import { getCampaignHistoryAction } from "@/app/actions";

export default function HistoryPage() {
    const [campaigns, setCampaigns] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function loadData() {
            const result = await getCampaignHistoryAction();
            if (result.success && result.data) {
                setCampaigns(result.data.map((c: any) => ({
                    id: c.id,
                    name: c.url,
                    date: new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    status: c.status,
                    reach: "...", // Placeholder as we don't track reach yet
                    conv: "...", // Placeholder
                    platform: ["FB", "IG"] // Placeholder
                })));
            }
            setLoading(false);
        }
        loadData();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-2">
                        Campaign <span className="text-accent italic">History</span>
                    </h1>
                    <p className="text-sm text-white/40 font-medium tracking-wide">
                        Audit and performance logs for all historical campaign executions.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                        <Input placeholder="Search archives..." className="pl-10 h-11 bg-[#0a0a0a]/60 border-white/5 rounded-xl text-sm w-[250px]" />
                    </div>
                    <Button variant="outline" className="h-11 border-white/5 bg-white/5 text-white/40 hover:text-white rounded-xl">
                        <Filter className="w-4 h-4 mr-2" /> Filter
                    </Button>
                </div>
            </div>

            <Card className="bg-[#0a0a0a]/40 border-white/5 rounded-[32px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Campaign Spec</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Execution Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Performance</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Platforms</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {campaigns.map((c) => (
                                <tr key={c.id} className="group hover:bg-white/[0.01] transition-colors cursor-pointer">
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-white group-hover:text-accent transition-colors truncate max-w-[200px]">{c.name}</p>
                                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-0.5">ID: {c.id.slice(0, 8)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs text-white/60 font-medium">{c.date}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            {c.status === 'completed' ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                                            ) : c.status === 'failed' ? (
                                                <AlertCircle className="w-3.5 h-3.5 text-red-500/50" />
                                            ) : (
                                                <Clock className="w-3.5 h-3.5 text-accent animate-pulse" />
                                            )}
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest",
                                                c.status === 'completed' ? "text-primary" : c.status === 'failed' ? "text-red-500/50" : "text-accent"
                                            )}>{c.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{c.reach} REACH</span>
                                            <span className="text-[11px] font-black text-white">{c.conv} CR</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-1.5">
                                            {c.platform.map((p: string) => (
                                                <span key={p} className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[9px] font-black text-white/40">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" className="h-8 w-8 text-white/20 hover:text-white rounded-lg p-0">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" className="h-8 w-8 text-white/20 hover:text-white rounded-lg p-0">
                                                <MoreVertical className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-white/5 flex items-center justify-between">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Showing 5 of 128 executions</p>
                    <div className="flex gap-2">
                        <Button disabled variant="ghost" className="h-8 px-4 text-[9px] font-black uppercase tracking-widest text-white/20">Previous</Button>
                        <Button variant="ghost" className="h-8 px-4 text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white">Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
