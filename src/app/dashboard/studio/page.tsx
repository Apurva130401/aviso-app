"use client";

import React from "react";
import { motion } from "motion/react";
import {
    Palette, Type, ImageIcon, Layers, Move, MousePointer2,
    Settings2, Download, Play, Save, ChevronLeft, ChevronRight,
    Maximize2, Smartphone, Monitor, Instagram
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function StudioPage() {
    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
            {/* Studio Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
                        <Palette className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight uppercase">Creative <span className="text-accent italic">Studio</span></h1>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Workspace 01 / Ad Unit Refinement</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-white/20 hover:text-white rounded-lg">
                            <Smartphone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 bg-accent text-black rounded-lg">
                            <Instagram className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-white/20 hover:text-white rounded-lg">
                            <Monitor className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="h-6 w-px bg-white/5 mx-1" />
                    <Button variant="ghost" className="h-10 px-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white">
                        <Save className="w-3.5 h-3.5 mr-2" /> Save Draft
                    </Button>
                    <Button className="h-10 px-6 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/10">
                        Export <Download className="w-3.5 h-3.5 ml-2" />
                    </Button>
                </div>
            </div>

            {/* Design Workspace */}
            <div className="flex-1 flex gap-6 min-h-0">
                {/* Left Toolbar */}
                <Card className="w-20 bg-[#0a0a0a]/40 border-white/5 rounded-[32px] flex flex-col items-center py-8 gap-6 shadow-xl">
                    {[
                        { icon: <MousePointer2 />, active: true },
                        { icon: <Move /> },
                        { icon: <ImageIcon /> },
                        { icon: <Type /> },
                        { icon: <Layers /> },
                        { icon: <Settings2 /> },
                    ].map((tool, i) => (
                        <button key={i} className={cn(
                            "p-3 rounded-2xl transition-all duration-300 relative group",
                            tool.active ? "bg-accent/10 text-accent border border-accent/20" : "text-white/20 hover:text-white hover:bg-white/5"
                        )}>
                            {React.cloneElement(tool.icon as React.ReactElement, { size: 20 })}
                            {tool.active && <motion.div layoutId="active-tool" className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-4 bg-accent rounded-full" />}
                        </button>
                    ))}
                </Card>

                {/* Canvas Area */}
                <div className="flex-1 bg-black/60 rounded-[48px] border-2 border-dashed border-white/5 flex items-center justify-center relative overflow-hidden group shadow-inner">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />

                    <Card className="w-[360px] h-[640px] bg-white text-black rounded-3xl shadow-2xl overflow-hidden relative group/canvas scale-90 lg:scale-100 transition-transform">
                        {/* Mock Ad Content */}
                        <div className="h-full flex flex-col">
                            <div className="flex-1 bg-neutral-100 flex items-center justify-center">
                                <div className="text-center opacity-20">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Visual Layer</p>
                                </div>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="h-2 w-1/3 bg-black/10 rounded-full" />
                                <div className="space-y-2">
                                    <div className="h-4 w-full bg-black rounded-sm" />
                                    <div className="h-4 w-4/5 bg-black rounded-sm" />
                                </div>
                                <div className="pt-4">
                                    <div className="h-10 w-full bg-blue-600 rounded-lg" />
                                </div>
                            </div>
                        </div>

                        {/* Canvas Overlays on Hover */}
                        <div className="absolute inset-0 border-4 border-accent opacity-0 group-hover/canvas:opacity-100 transition-opacity pointer-events-none" />
                    </Card>

                    {/* Viewport Helpers */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#0a0a0a]/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 shadow-2xl">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white"><ChevronLeft size={16} /></Button>
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">360 x 640 (9:16)</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white"><ChevronRight size={16} /></Button>
                        <div className="w-px h-4 bg-white/10" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white font-black text-[9px]">100%</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white"><Maximize2 size={14} /></Button>
                    </div>
                </div>

                {/* Properties Panel */}
                <Card className="w-80 bg-[#0a0a0a]/40 border-white/5 rounded-[32px] p-8 space-y-8 shadow-xl overflow-y-auto min-h-0">
                    <div>
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Object Properties</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Opacity</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="w-4/5 h-full bg-primary" />
                                    </div>
                                    <span className="text-[10px] font-black text-white/60">80%</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">X Pos</label>
                                    <div className="bg-white/5 p-2 rounded-xl text-center text-xs font-black">12px</div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Y Pos</label>
                                    <div className="bg-white/5 p-2 rounded-xl text-center text-xs font-black">42px</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Color Palette</h3>
                        <div className="grid grid-cols-4 gap-3">
                            {['#000000', '#FFFFFF', '#FBBF24', '#10B981', '#3b82f6', '#ef4444', '#8b5cf6', '#f472b6'].map(color => (
                                <button key={color} className="aspect-square rounded-lg border border-white/5 transition-transform hover:scale-110 shadow-lg" style={{ backgroundColor: color }} />
                            ))}
                            <button className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 hover:border-white/20 hover:text-white transition-all">+</button>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5">
                        <Button variant="secondary" className="w-full h-12 bg-white/5 border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                            <Play className="w-3.5 h-3.5 mr-2" /> Live Preview
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
