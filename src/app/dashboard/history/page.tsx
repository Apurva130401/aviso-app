"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    MoreVertical,
    Search,
    Filter,
    ArrowUpRight,
    Play,
    FileText,
    Globe,
    Zap,
    RefreshCcw
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

import { getCampaignHistoryAction, getCampaignAssetsAction } from "@/app/actions";

export default function HistoryPage() {
    const [campaigns, setCampaigns] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
    const [campaignAssets, setCampaignAssets] = useState<any[]>([]);
    const [loadingAssets, setLoadingAssets] = useState(false);

    React.useEffect(() => {
        async function loadData() {
            setLoading(true);
            const result = await getCampaignHistoryAction();
            if (result.success && result.data) {
                setCampaigns(result.data);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const handleViewDetails = async (campaign: any) => {
        setSelectedCampaign(campaign);
        setLoadingAssets(true);
        const result = await getCampaignAssetsAction(campaign.id);
        if (result.success && result.data) {
            setCampaignAssets(result.data);
        }
        setLoadingAssets(false);
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-2">
                        Campaign <span className="text-accent italic">History</span>
                    </h1>
                    <p className="text-sm text-white/40 font-medium tracking-wide">
                        Strategic log of all neural synthesis cycles and platform executions.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                        <Input placeholder="Filter sequences..." className="pl-10 h-11 bg-[#0a0a0a]/60 border-white/5 rounded-xl text-sm w-[250px]" />
                    </div>
                </div>
            </div>

            <Card className="bg-[#0a0a0a]/40 border-white/5 rounded-[40px] overflow-hidden shadow-2xl backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Sequence / ID</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Target URL</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Timestamp</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6">
                                            <div className="h-4 bg-white/5 rounded-lg w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-white/20 font-medium">
                                        No campaigns found in current sector.
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map((c) => (
                                    <tr key={c.id} className="group hover:bg-white/[0.01] transition-colors cursor-pointer" onClick={() => handleViewDetails(c)}>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                                    <Zap className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-white tracking-widest uppercase">
                                                        SEQ-{c.id.slice(0, 8)}
                                                    </span>
                                                    <span className="text-[9px] font-medium text-accent italic">
                                                        Neural Path: {c.tone || 'Balanced'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 max-w-[200px]">
                                                <Globe className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                                                <span className="text-[11px] font-medium text-white/40 truncate hover:text-white transition-colors">
                                                    {c.url}
                                                </span>
                                            </div>
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
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" className="h-9 px-4 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-accent group-hover:bg-accent/10 transition-all">
                                                    Examine
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={!!selectedCampaign} onClose={() => setSelectedCampaign(null)} title="Campaign Intelligence Details">
                {selectedCampaign && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-[20px] bg-white/5 border border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-1">Sequence ID</span>
                                <span className="text-xs font-black text-white uppercase tracking-widest">SEQ-{selectedCampaign.id.slice(0, 8)}</span>
                            </div>
                            <div className="p-4 rounded-[20px] bg-white/5 border border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-1">Neural Path</span>
                                <span className="text-xs font-black text-accent italic uppercase tracking-widest">{selectedCampaign.tone}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 px-1">Linked Assets</h3>
                            <div className="space-y-3">
                                {loadingAssets ? (
                                    <div className="flex items-center justify-center p-12">
                                        <RefreshCcw className="w-6 h-6 text-accent animate-spin" />
                                    </div>
                                ) : campaignAssets.length === 0 ? (
                                    <div className="p-8 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                        <p className="text-[11px] font-medium text-white/20 uppercase tracking-widest">No assets salvaged for this sequence.</p>
                                    </div>
                                ) : (
                                    campaignAssets.map((asset) => {
                                        const metadata = asset.metadata || {};
                                        const platform = metadata.platform || 'general';
                                        return (
                                            <div key={asset.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-accent/20 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-accent">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-white uppercase tracking-widest">{platform} Ad Set</p>
                                                        <p className="text-[9px] font-medium text-white/20 uppercase tracking-widest">{new Date(asset.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" className="h-9 w-9 rounded-xl bg-white/5 p-0 text-white/40 hover:text-accent transition-colors">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 rounded-xl bg-accent text-black font-black uppercase tracking-widest text-[10px] hover:scale-[1.01] transition-all"
                            onClick={() => setSelectedCampaign(null)}
                        >
                            Close Intel Log
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
