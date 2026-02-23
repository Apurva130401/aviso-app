"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Globe, Target, Zap, Megaphone, Facebook, Search, Linkedin, Twitter,
    ArrowRight, Loader2, CheckCircle2, ChevronRight, Layout,
    Palette, MessageSquare, ArrowLeft, RefreshCcw, Instagram, Plus
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { analyzeBrandAction, generateTonesAction, generateAdsAction } from "@/app/actions";
import { BrandAnalysis } from "@/lib/gemini";
import { cn } from "@/lib/utils";

type Step = "input" | "analysis" | "tone-selection" | "final-ads";

export default function CreateCampaignPage() {
    const [step, setStep] = useState<Step>("input");
    const [url, setUrl] = useState("");
    const [goal, setGoal] = useState("");
    const [context, setContext] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Configuration
    const [platforms, setPlatforms] = useState<string[]>(["facebook", "instagram", "google"]);
    const [includeImages, setIncludeImages] = useState(true);

    // Step Data
    const [analysis, setAnalysis] = useState<BrandAnalysis | null>(null);
    const [campaignId, setCampaignId] = useState<string | null>(null);
    const [toneOptions, setToneOptions] = useState<string[]>([]);
    const [selectedTone, setSelectedTone] = useState<string | null>(null);
    const [finalAds, setFinalAds] = useState<any>(null);

    const handleStartAnalysis = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        setLoading(true);
        setError(null);
        const result = await analyzeBrandAction(url, goal, context);
        if (result.success) {
            setAnalysis(result.data!);
            setCampaignId(result.campaignId!);
            setStep("analysis");
        } else {
            setError(result.error!);
        }
        setLoading(false);
    };

    const handleProceedToTone = async () => {
        if (!analysis) return;
        setLoading(true);
        const result = await generateTonesAction(analysis);
        if (result.success) {
            setToneOptions(result.data!);
            setStep("tone-selection");
        } else {
            setError(result.error!);
        }
        setLoading(false);
    };

    const handleGenerateAds = async (tone: string) => {
        setSelectedTone(tone);
        setLoading(true);
        const result = await generateAdsAction(analysis!, tone, platforms, {}, includeImages, campaignId!);
        if (result.success) {
            setFinalAds(result.data!);
            setStep("final-ads");
        } else {
            setError(result.error!);
        }
        setLoading(false);
    };

    const startOver = () => {
        setStep("input");
        setAnalysis(null);
        setCampaignId(null);
        setToneOptions([]);
        setSelectedTone(null);
        setFinalAds(null);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <AnimatePresence mode="wait">
            {step === "input" && (
                <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-[1.5] space-y-6">
                            <Card className="p-8 border-white/5 bg-[#0a0a0a]/40 backdrop-blur-md rounded-3xl space-y-8">
                                <div>
                                    <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                                        <Plus className="w-5 h-5 text-accent" />
                                        Campaign Strategy
                                    </h2>
                                    <p className="text-xs text-white/30 font-medium tracking-wide mt-1">Define the core objective and intelligence source.</p>
                                </div>

                                <form onSubmit={handleStartAnalysis} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">Brand URL</label>
                                            <div className="relative group">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors w-4 h-4" strokeWidth={1.5} />
                                                <Input
                                                    type="url"
                                                    placeholder="https://brand.com"
                                                    required
                                                    value={url}
                                                    onChange={(e) => setUrl(e.target.value)}
                                                    className="pl-12 h-12 bg-black/40 border-white/[0.05] rounded-2xl focus:ring-accent/40 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">Success Metric</label>
                                            <div className="relative group">
                                                <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors w-4 h-4" strokeWidth={1.5} />
                                                <Input
                                                    type="text"
                                                    placeholder="e.g. Maximize ROI"
                                                    value={goal}
                                                    onChange={(e) => setGoal(e.target.value)}
                                                    className="pl-12 h-12 bg-black/40 border-white/[0.05] rounded-2xl focus:ring-accent/40 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">Creative Brief / Context</label>
                                        <div className="relative group">
                                            <MessageSquare className="absolute left-4 top-4 text-white/20 group-focus-within:text-accent transition-colors w-4 h-4" strokeWidth={1.5} />
                                            <Textarea
                                                placeholder="Add specific requirements or constraints..."
                                                value={context}
                                                onChange={(e) => setContext(e.target.value)}
                                                className="pl-12 pt-4 h-32 bg-black/40 border-white/[0.05] rounded-2xl focus:ring-accent/40 text-sm resize-none"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        loading={loading}
                                        size="lg"
                                        className="w-full h-14 text-sm bg-gradient-to-r from-accent to-primary text-black font-black uppercase tracking-[0.2em] rounded-2xl"
                                    >
                                        Initiate Analysis <ArrowRight className="ml-3 w-4 h-4" strokeWidth={3} />
                                    </Button>
                                </form>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { label: "Token Efficiency", val: "94.2%", color: "text-accent" },
                                    { label: "System Load", val: "Lo-Lat", color: "text-white/60" },
                                    { label: "Estimated ROI", val: "+14.8%", color: "text-primary" }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/5 border border-white/[0.03] p-4 rounded-2xl flex flex-col gap-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">{stat.label}</span>
                                        <span className={cn("text-lg font-black tracking-tight", stat.color)}>{stat.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <Card className="p-6 border-white/5 bg-[#0a0a0a]/40 backdrop-blur-md rounded-3xl space-y-6 h-full">
                                <div>
                                    <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Deployment Protocol</h3>
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] cursor-pointer group hover:bg-white/5 transition-colors">
                                        <span className="text-[11px] font-bold text-white/60 group-hover:text-white uppercase tracking-widest">AI Generated Visuals</span>
                                        <div
                                            onClick={() => setIncludeImages(!includeImages)}
                                            className={cn("w-10 h-5 rounded-full p-1 transition-all flex items-center shadow-inner relative overflow-hidden", includeImages ? "bg-accent" : "bg-white/5")}
                                        >
                                            <div className={cn("w-3 h-3 bg-white rounded-full transition-all shadow-xl z-10", includeImages ? "translate-x-5" : "translate-x-0")} />
                                        </div>
                                    </label>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Target Platforms</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: "facebook", label: "FaceBook", icon: <Facebook /> },
                                                { id: "instagram", label: "Instagram", icon: <Instagram /> },
                                                { id: "google", label: "Google", icon: <Search /> },
                                                { id: "twitter", label: "Twitter", icon: <Twitter /> },
                                                { id: "linkedin", label: "LinkedIn", icon: <Linkedin /> }
                                            ].map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => setPlatforms(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 text-left",
                                                        platforms.includes(p.id)
                                                            ? "bg-accent/10 border-accent/40 text-accent"
                                                            : "bg-black/40 border-white/[0.05] text-white/20 hover:border-white/10"
                                                    )}
                                                >
                                                    <div className={cn("p-1.5 rounded-lg", platforms.includes(p.id) ? "bg-accent/20" : "bg-white/5")}>
                                                        {React.isValidElement(p.icon) && React.cloneElement(p.icon as React.ReactElement<any>, { className: "w-3 h-3", strokeWidth: 2 })}
                                                    </div>
                                                    <span className="text-[10px] font-black tracking-widest uppercase">{p.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </motion.div>
            )}

            {step === "analysis" && analysis && (
                <motion.div key="analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                                Intelligence Insight <span className="text-accent italic">Module 01</span>
                            </h2>
                            <p className="text-xs text-white/30 font-medium tracking-wide mt-1">Foundational brand data extracted from source URL.</p>
                        </div>
                        <Button variant="ghost" onClick={() => setStep("input")} className="text-white/40 hover:text-white transition-all font-bold uppercase tracking-widest text-[9px] group">
                            <ArrowLeft className="mr-2 w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Discovery
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { icon: <Zap className="text-accent" />, title: "Core Identity", content: analysis.coreIdentity },
                            { icon: <Megaphone className="text-primary" />, title: "Voice & Tone", content: analysis.voiceTone },
                            { icon: <Target className="text-accent" />, title: "Audience Persona", content: analysis.targetAudience },
                            { icon: <Zap className="text-primary" />, title: "Strategic UVP", content: analysis.uvp }
                        ].map((item, i) => (
                            <Card key={i} className="p-6 space-y-4 bg-[#0a0a0a]/40 border-white/5 rounded-3xl hover:border-accent/20 transition-all duration-500 shadow-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-white">
                                        {React.isValidElement(item.icon) && React.cloneElement(item.icon as React.ReactElement<any>, { strokeWidth: 1.5, className: "w-4 h-4" })}
                                    </div>
                                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-white/30">{item.title}</h4>
                                </div>
                                <p className="text-white/60 leading-relaxed text-sm font-medium tracking-wide">{item.content}</p>
                            </Card>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <Card className="flex-1 p-6 space-y-4 bg-black/40 border-white/5 rounded-3xl">
                            <div className="flex items-center gap-3 text-accent">
                                <Palette className="w-4 h-4" strokeWidth={1.5} />
                                <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">Atmospheric Extraction</h3>
                            </div>
                            <div className="flex gap-4">
                                {analysis.colorPalette.map(color => (
                                    <div key={color} className="flex-1">
                                        <div className="h-12 rounded-xl shadow-lg mb-2 border border-white/[0.05]" style={{ backgroundColor: color }} />
                                        <p className="text-center text-[9px] font-mono font-black text-white/20 uppercase tracking-widest">{color}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="md:w-1/3 p-6 flex flex-col justify-center items-center gap-4 bg-accent/5 border-accent/10 rounded-3xl border-dashed">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                <RefreshCcw className="w-6 h-6 text-accent animate-spin-slow" />
                            </div>
                            <p className="text-[10px] font-black text-accent uppercase tracking-widest text-center">Engine Ready</p>
                        </Card>
                    </div>

                    <Button
                        size="lg"
                        className="w-full h-14 bg-accent text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.005] transition-all shadow-xl shadow-accent/5"
                        onClick={handleProceedToTone}
                        loading={loading}
                    >
                        Proceed to Narrative Layer <ArrowRight className="ml-3 w-4 h-4" strokeWidth={3} />
                    </Button>
                </motion.div>
            )}

            {step === "tone-selection" && (
                <motion.div key="tone" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-8">
                    <div className="text-center max-w-2xl mx-auto py-8">
                        <h2 className="text-3xl font-black tracking-tight mb-2 text-white">Narrative <span className="text-accent italic">Architecture</span></h2>
                        <p className="text-sm text-white/40 font-medium tracking-wide">Select the emotional resonance for this campaign execution.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {toneOptions.map((tone, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.01, y: -2 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => handleGenerateAds(tone)}
                                disabled={loading}
                                className="text-left bg-[#0a0a0a]/60 backdrop-blur-md p-8 rounded-[32px] border border-white/5 group hover:border-accent/30 transition-all duration-500 relative overflow-hidden h-full shadow-lg"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 text-accent flex items-center justify-center font-black text-xs mb-6 group-hover:bg-accent/10 transition-all">
                                    0{i + 1}
                                </div>
                                <p className="text-lg font-bold text-white/60 leading-tight group-hover:text-white transition-all tracking-tight">{tone}</p>
                            </motion.button>
                        ))}
                    </div>

                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-6"
                        >
                            <div className="relative">
                                <div className="w-16 h-16 border-2 border-primary/20 rounded-full" />
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 w-16 h-16 border-t-2 border-primary rounded-full"
                                />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-lg tracking-tight text-white uppercase tracking-[0.2em]">Synthesizing</p>
                                <p className="text-white/40 text-xs font-medium mt-1">Optimizing creative assets...</p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {step === "final-ads" && finalAds && (
                <motion.div key="final" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
                    <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0a0a0a]/40 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-xl">
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-white mb-1">Campaign <span className="text-accent italic">Neural Synthesis</span></h2>
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="text-[10px] border-accent/20 bg-accent/5 text-accent font-black tracking-widest uppercase py-1 px-3">Generation Complete</Badge>
                                <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest max-w-md truncate">Primary Metric: {goal || 'Balanced Intelligence'}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Button onClick={startOver} variant="ghost" className="h-12 px-6 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                <RefreshCcw className="w-3.5 h-3.5 mr-2" /> New Cycle
                            </Button>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {Object.entries(finalAds).filter(([platform]) => platforms.includes(platform)).map(([platform, variants]: [string, any]) => {
                            const variant = variants[0]; // Show the first one as primary
                            if (platform === 'adImage') return null;

                            return (
                                <motion.div
                                    key={platform}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="group"
                                >
                                    <Card className="bg-[#0a0a0a]/60 backdrop-blur-xl border-white/5 rounded-[32px] overflow-hidden flex flex-col h-full shadow-2xl group-hover:border-accent/20 transition-all duration-500">
                                        {/* Social Mockup Header */}
                                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-primary p-[1.5px]">
                                                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                                        <Zap className="w-5 h-5 text-accent" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-black text-white uppercase tracking-widest">{platform}</span>
                                                        <CheckCircle2 className="w-3 h-3 text-primary fill-primary/10" />
                                                    </div>
                                                    <span className="text-[9px] font-medium text-white/30 uppercase tracking-[0.2em]">Neural Dispatch</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-white/20" />
                                                <div className="w-1 h-1 rounded-full bg-white/20" />
                                                <div className="w-1 h-1 rounded-full bg-white/20" />
                                            </div>
                                        </div>

                                        {/* Visual/Image Mockup Area */}
                                        <div className="aspect-square bg-white/[0.03] relative overflow-hidden group/img">
                                            {finalAds.adImage ? (
                                                <img src={finalAds.adImage} alt="Neural Creative" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
                                                    <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/10">
                                                        <Layout className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">No Visual Assets</p>
                                                        <p className="text-[8px] font-medium text-white/10 uppercase mt-1 tracking-widest">Procedural generation failed or bypassed.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Interaction Bar */}
                                        <div className="px-5 py-3 flex items-center justify-between border-b border-white/5">
                                            <div className="flex gap-4">
                                                <RefreshCcw className="w-4 h-4 text-white/40" />
                                                <RefreshCcw className="w-4 h-4 text-white/40" />
                                                <RefreshCcw className="w-4 h-4 text-white/40" />
                                            </div>
                                            <RefreshCcw className="w-4 h-4 text-white/40" />
                                        </div>

                                        {/* Ad Content Preview */}
                                        <div className="flex-1 p-5 space-y-4">
                                            {platform === 'google' ? (
                                                <div className="space-y-3">
                                                    <div className="space-y-1">
                                                        {variant.headlines?.slice(0, 3).map((h: string, i: number) => (
                                                            <p key={i} className="text-sm font-bold text-accent leading-tight line-clamp-1 border-l-2 border-accent/40 pl-3">{h}</p>
                                                        ))}
                                                    </div>
                                                    <div className="space-y-1.5 pt-1">
                                                        {variant.descriptions?.slice(0, 2).map((d: string, i: number) => (
                                                            <p key={i} className="text-[11px] font-medium text-white/50 leading-relaxed">{d}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {variant.headline && (
                                                        <p className="text-[13px] font-black text-white tracking-tight leading-tight">{variant.headline}</p>
                                                    )}
                                                    {(variant.primaryText || variant.postContent) && (
                                                        <p className="text-[11px] font-medium text-white/50 leading-relaxed line-clamp-4">
                                                            {variant.primaryText || variant.postContent}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* CTA Section */}
                                        {variant.cta && (
                                            <div className="px-5 pb-5">
                                                <div className="w-full py-2.5 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-between px-4 group/cta hover:bg-accent hover:text-black transition-all cursor-pointer">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{variant.cta}</span>
                                                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/cta:translate-x-1" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Global Actions */}
                                        <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
                                            <Button
                                                variant="ghost"
                                                onClick={() => copyToClipboard(JSON.stringify(variant, null, 2))}
                                                className="flex-1 h-10 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                                            >
                                                Copy Intelligence
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => window.open('/studio', '_blank')}
                                                className="w-10 h-10 rounded-xl bg-white/5 p-0 hover:bg-primary hover:text-black transition-all"
                                            >
                                                <Palette className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
