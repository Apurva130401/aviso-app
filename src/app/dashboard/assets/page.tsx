"use client";

import React from "react";
import { motion } from "motion/react";
import { Search, Grid, List, Download, Share2, MoreHorizontal, Image as ImageIcon, FileText, Layout } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

import { getUserAssetsAction } from "@/app/actions";

export default function AssetsPage() {
    const [assets, setAssets] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function loadData() {
            const result = await getUserAssetsAction();
            if (result.success && result.data) {
                setAssets(result.data.map((a: any) => ({
                    id: a.id,
                    type: a.type === 'image' ? 'image' : a.type === 'copy' ? 'copy' : 'set',
                    name: a.type === 'image' ? (a.metadata?.platform + " Ad.png") : (a.metadata?.platform + " Copy.txt"),
                    size: "...", // Placeholder
                    date: new Date(a.created_at).toLocaleDateString(),
                    preview: a.type === 'image' ? "/assets/p1.jpg" : null, // Placeholder
                    campaign: a.campaigns?.url || "Unknown"
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
                        Creative <span className="text-accent italic">Assets</span>
                    </h1>
                    <p className="text-sm text-white/40 font-medium tracking-wide">
                        Centralized repository for all generated imagery, copy, and creative constructs.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                        <Input placeholder="Search assets..." className="pl-10 h-11 bg-[#0a0a0a]/60 border-white/5 rounded-xl text-sm w-[250px]" />
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                        <Button variant="ghost" className="h-9 w-9 bg-accent text-black rounded-lg p-0">
                            <Grid className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" className="h-9 w-9 text-white/20 hover:text-white rounded-lg p-0">
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {assets.map((asset) => (
                    <motion.div key={asset.id} whileHover={{ y: -4 }} className="group">
                        <Card className="aspect-square bg-[#0a0a0a]/40 border-white/5 rounded-[32px] overflow-hidden flex flex-col relative">
                            {/* Preview Area */}
                            <div className="flex-1 bg-white/[0.02] flex items-center justify-center relative overflow-hidden">
                                {asset.type === 'image' ? (
                                    <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                ) : asset.type === 'copy' ? (
                                    <FileText className="w-8 h-8 text-primary/40 group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <Layout className="w-8 h-8 text-accent/40 group-hover:scale-110 transition-transform duration-500" />
                                )}

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                    <Button variant="secondary" className="h-9 w-9 rounded-full bg-white/10 border-white/10 text-white hover:bg-accent hover:text-black p-0">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                    <Button variant="secondary" className="h-9 w-9 rounded-full bg-white/10 border-white/10 text-white hover:bg-primary hover:text-black p-0">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Bottom Info */}
                            <div className="p-5 border-t border-white/5 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-bold text-white truncate max-w-[120px]">{asset.name}</p>
                                    <MoreHorizontal className="w-3 h-3 text-white/20" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{asset.size}</span>
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{asset.date}</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
