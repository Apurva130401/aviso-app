"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Grid, List, Download, Share2, MoreHorizontal, Image as ImageIcon, FileText, Layout, Copy, ExternalLink, Globe, Palette, Instagram, Facebook, Twitter, Linkedin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

import { getUserAssetsAction } from "@/app/actions";

export default function AssetsPage() {
    const [assets, setAssets] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedAsset, setSelectedAsset] = useState<any | null>(null);

    React.useEffect(() => {
        async function loadData() {
            setLoading(true);
            const result = await getUserAssetsAction();
            if (result.success && result.data) {
                setAssets(result.data);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

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
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 h-11">
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
                {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="aspect-square rounded-[32px] bg-white/5 animate-pulse" />
                    ))
                ) : assets.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                            <Layout className="w-8 h-8" />
                        </div>
                        <p className="text-white/40 font-medium">No assets generated yet.</p>
                    </div>
                ) : (
                    assets.map((asset) => {
                        const isCopy = asset.type === 'copy' || asset.type === 'creative_set';
                        const metadata = asset.content ? JSON.parse(asset.content) : (asset.metadata || {});
                        const platform = metadata.platform || 'General';

                        return (
                            <motion.div key={asset.id} whileHover={{ y: -4 }} className="group cursor-pointer" onClick={() => setSelectedAsset(asset)}>
                                <Card className="aspect-square bg-[#0a0a0a]/40 border-white/5 rounded-[32px] overflow-hidden flex flex-col relative group-hover:border-accent/30 transition-all duration-500 shadow-xl">
                                    {/* Preview Area */}
                                    <div className="flex-1 bg-white/[0.02] flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute top-4 left-4 z-10">
                                            <Badge variant="secondary" className="bg-black/60 backdrop-blur-md border-white/10 text-[8px] tracking-widest px-2">{platform.toUpperCase()}</Badge>
                                        </div>

                                        {isCopy ? (
                                            <div className="p-8 space-y-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                                <div className="w-12 h-1 bg-accent/20 rounded-full" />
                                                <div className="w-full h-1 bg-white/10 rounded-full" />
                                                <div className="w-2/3 h-1 bg-white/10 rounded-full" />
                                                <FileText className="w-8 h-8 text-accent/20 absolute bottom-6 right-6" />
                                            </div>
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                                        )}

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-md">
                                            <Button variant="secondary" className="h-10 w-10 rounded-full bg-white/10 border-white/10 text-white hover:bg-accent hover:text-black p-0 transition-all">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Bottom Info */}
                                    <div className="p-5 border-t border-white/5 space-y-1 bg-white/[0.01]">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">{platform} {asset.type}</p>
                                            <MoreHorizontal className="w-3 h-3 text-white/20" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                                                {new Date(asset.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Asset Preview Modal */}
            <Modal
                isOpen={!!selectedAsset}
                onClose={() => setSelectedAsset(null)}
                title="Asset Preview"
                className="max-w-3xl"
            >
                {selectedAsset && (() => {
                    const metadata = selectedAsset.content ? JSON.parse(selectedAsset.content) : (selectedAsset.metadata || {});
                    const platform = metadata.platform || 'General';

                    return (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-white tracking-tight uppercase tracking-widest">{platform} Creative</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Globe className="w-3 h-3 text-white/20" />
                                            <p className="text-xs text-white/40 font-medium truncate max-w-[300px]">{selectedAsset.campaigns?.url}</p>
                                        </div>
                                    </div>
                                </div>
                                <Badge className="bg-accent/10 text-accent border-accent/20 px-3 py-1 uppercase tracking-[0.2em] font-black text-[9px]">
                                    {selectedAsset.type}
                                </Badge>
                            </div>

                            <Card className="p-8 bg-black/40 border-white/5 rounded-3xl space-y-6">
                                {platform === 'google' ? (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Headlines</p>
                                            <div className="grid gap-2">
                                                {metadata.headlines?.map((h: string, i: number) => (
                                                    <div key={i} className="p-4 bg-white/5 rounded-xl text-sm font-bold text-accent border-l-2 border-accent/40">{h}</div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Descriptions</p>
                                            <div className="grid gap-2">
                                                {metadata.descriptions?.map((d: string, i: number) => (
                                                    <p key={i} className="p-4 bg-white/5 rounded-xl text-xs font-medium text-white/50 leading-relaxed italic">"{d}"</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {metadata.headline && (
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Headline</p>
                                                <p className="text-lg font-black text-white leading-tight">{metadata.headline}</p>
                                            </div>
                                        )}
                                        {(metadata.primaryText || metadata.postContent) && (
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Body copy</p>
                                                <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                                                    <p className="text-sm font-medium text-white/60 leading-relaxed whitespace-pre-wrap">
                                                        {metadata.primaryText || metadata.postContent}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {metadata.cta && (
                                            <div className="flex items-center gap-3">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Call to Action:</p>
                                                <Badge className="bg-primary/10 text-primary border-primary/20">{metadata.cta}</Badge>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>

                            <div className="flex gap-4">
                                <Button
                                    className="flex-1 h-14 bg-accent text-black font-black uppercase tracking-[0.2em] rounded-2xl"
                                    onClick={() => copyToClipboard(JSON.stringify(metadata, null, 2))}
                                >
                                    <Copy className="mr-3 w-4 h-4" /> Copy Full Data
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="h-14 px-8 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest"
                                    onClick={() => window.open('/studio', '_blank')}
                                >
                                    <Palette className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    );
                })()}
            </Modal>
        </div>
    );
}

