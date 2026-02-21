/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
    Globe,
    Target,
    Zap,
    Megaphone,
    Facebook,
    Search,
    Linkedin,
    Twitter,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Copy,
    Sparkles,
    RefreshCcw,
    ChevronRight,
    Layout,
    Type as TypeIcon,
    MousePointerClick,
    FileText,
    Instagram,
    Palette,
    MessageSquare,
    ArrowLeft,
    Download,
    Send,
    Settings,
    History,
    Briefcase,
    HelpCircle,
    LogOut,
    User,
    Bell,
    Menu,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
    analyzeBrand,
    generateToneOptions,
    generateFinalAds,
    refineContent,
    BrandAnalysis
} from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type Step = 'input' | 'analysis' | 'tone-selection' | 'final-ads';

const PLATFORM_OPTIONS = [
    {
        id: 'facebook',
        label: 'Facebook',
        icon: <Facebook className="w-4 h-4" />,
        copyTypes: [
            { id: 'headline', label: 'Headline', icon: <TypeIcon className="w-3 h-3" /> },
            { id: 'primaryText', label: 'Primary Text', icon: <FileText className="w-3 h-3" /> },
            { id: 'cta', label: 'CTA', icon: <MousePointerClick className="w-3 h-3" /> }
        ]
    },
    {
        id: 'instagram',
        label: 'Instagram',
        icon: <Instagram className="w-4 h-4" />,
        copyTypes: [
            { id: 'headline', label: 'Headline', icon: <TypeIcon className="w-3 h-3" /> },
            { id: 'primaryText', label: 'Primary Text', icon: <FileText className="w-3 h-3" /> },
            { id: 'cta', label: 'CTA', icon: <MousePointerClick className="w-3 h-3" /> }
        ]
    },
    {
        id: 'google',
        label: 'Google Search',
        icon: <Search className="w-4 h-4" />,
        copyTypes: [
            { id: 'headlines', label: 'Headlines', icon: <TypeIcon className="w-3 h-3" /> },
            { id: 'descriptions', label: 'Descriptions', icon: <FileText className="w-3 h-3" /> }
        ]
    },
    {
        id: 'twitter',
        label: 'Twitter Ads',
        icon: <Twitter className="w-4 h-4" />,
        copyTypes: [
            { id: 'postContent', label: 'Ad Copy', icon: <FileText className="w-3 h-3" /> }
        ]
    },
    {
        id: 'linkedin',
        label: 'LinkedIn',
        icon: <Linkedin className="w-4 h-4" />,
        copyTypes: [
            { id: 'postContent', label: 'Ad Copy', icon: <FileText className="w-3 h-3" /> }
        ]
    }
];

export default function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [step, setStep] = useState<Step>('input');
    const [url, setUrl] = useState('');
    const [goal, setGoal] = useState('');
    const [context, setContext] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Configuration
    const [platforms, setPlatforms] = useState<string[]>(['facebook', 'instagram', 'google']);
    const [platformSettings, setPlatformSettings] = useState<Record<string, string[]>>({
        facebook: ['headline', 'primaryText', 'cta'],
        instagram: ['headline', 'primaryText', 'cta'],
        google: ['headlines', 'descriptions'],
        twitter: ['postContent'],
        linkedin: ['postContent']
    });
    const [includeImages, setIncludeImages] = useState(true);

    // Step Data
    const [analysis, setAnalysis] = useState<BrandAnalysis | null>(null);
    const [analysisRefinement, setAnalysisRefinement] = useState('');
    const [toneOptions, setToneOptions] = useState<string[]>([]);
    const [selectedTone, setSelectedTone] = useState<string | null>(null);
    const [finalAds, setFinalAds] = useState<any>(null);

    // Handlers
    const handleStartAnalysis = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        setLoading(true);
        setError(null);
        try {
            const data = await analyzeBrand(url, goal, context);
            setAnalysis(data);
            setStep('analysis');
        } catch (err) {
            setError('Failed to analyze brand. Please check the URL.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefineAnalysis = async () => {
        if (!analysisRefinement || !analysis) return;
        setLoading(true);
        try {
            const refined = await analyzeBrand(url, goal, `${context}\n\nUser Feedback: ${analysisRefinement}`);
            setAnalysis(refined);
            setAnalysisRefinement('');
        } catch (err) {
            setError('Refinement failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleProceedToTone = async () => {
        if (!analysis) return;
        setLoading(true);
        try {
            const options = await generateToneOptions(analysis);
            setToneOptions(options);
            setStep('tone-selection');
        } catch (err) {
            setError('Failed to generate tones.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAds = async (tone: string) => {
        setSelectedTone(tone);
        setLoading(true);
        try {
            const ads = await generateFinalAds(analysis!, tone, platforms, platformSettings, includeImages);
            setFinalAds(ads);
            setStep('final-ads');
        } catch (err) {
            setError('Ad generation failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefineAd = async (platform: string, index: number, field: string, prompt: string) => {
        const currentText = finalAds[platform][index][field];
        setLoading(true);
        try {
            const refined = await refineContent(currentText, prompt);
            const newAds = { ...finalAds };
            newAds[platform][index][field] = refined;
            setFinalAds(newAds);
        } catch (err) {
            setError('Refinement failed.');
        } finally {
            setLoading(false);
        }
    };

    const startOver = () => {
        setStep('input');
        setAnalysis(null);
        setToneOptions([]);
        setSelectedTone(null);
        setFinalAds(null);
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-emerald-100 flex">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-black/5 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    <div className="p-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                            <Sparkles className="text-white w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">AdGenius <span className="text-emerald-600">AI</span></span>
                    </div>

                    <nav className="flex-1 px-4 py-4 space-y-1">
                        <SidebarItem icon={<Zap className="w-4 h-4" />} label="New Campaign" active={step === 'input'} onClick={startOver} />
                        <SidebarItem icon={<History className="w-4 h-4" />} label="Campaign History" />
                        <SidebarItem icon={<Briefcase className="w-4 h-4" />} label="Brand Assets" />
                        <SidebarItem icon={<Palette className="w-4 h-4" />} label="Design Studio" />
                        <div className="pt-4 pb-2 px-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Support</p>
                        </div>
                        <SidebarItem icon={<Settings className="w-4 h-4" />} label="Settings" />
                        <SidebarItem icon={<HelpCircle className="w-4 h-4" />} label="Help Center" />
                    </nav>

                    <div className="p-4 border-t border-black/5">
                        <div className="bg-emerald-50 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Credits</p>
                                <p className="text-xs font-bold text-emerald-700">12 / 50</p>
                            </div>
                            <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-600 w-[24%]" />
                            </div>
                            <button className="w-full mt-3 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-all">
                                Upgrade Plan
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-400">
                            <span>Campaigns</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-black">{step === 'input' ? 'New Creation' : 'Results'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-gray-100 rounded-full relative text-gray-500">
                            <Bell className="w-5 h-5" />
                            <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="h-8 w-px bg-black/5 mx-2" />
                        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-gray-900">Alex Rivera</p>
                                <p className="text-[10px] text-gray-400">Pro Marketer</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-600/10 border-2 border-white">
                                AR
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <main className="max-w-5xl mx-auto px-4 lg:px-8 py-12">
                        <AnimatePresence mode="wait">
                            {step === 'input' && (
                                <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                    <section className="text-center mb-12">
                                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Your AI <span className="text-emerald-600 italic font-serif">Ad Agency</span></h1>
                                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Transform any URL into a full-scale ad campaign in 4 simple steps.</p>
                                    </section>

                                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-[32px] shadow-2xl shadow-black/5 border border-black/5 space-y-8">
                                        <form onSubmit={handleStartAnalysis} className="space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Brand Discovery</label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-center px-5 gap-3 border border-black/10 rounded-2xl py-4 bg-gray-50/50 focus-within:border-emerald-500 transition-all">
                                                        <Globe className="text-gray-400 w-5 h-5" />
                                                        <input type="url" placeholder="https://your-website.com" required value={url} onChange={(e) => setUrl(e.target.value)} className="w-full outline-none bg-transparent font-medium" />
                                                    </div>
                                                    <div className="flex items-center px-5 gap-3 border border-black/10 rounded-2xl py-4 bg-gray-50/50 focus-within:border-emerald-500 transition-all">
                                                        <Target className="text-gray-400 w-5 h-5" />
                                                        <input type="text" placeholder="Campaign goal (optional)" value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full outline-none bg-transparent font-medium" />
                                                    </div>
                                                </div>
                                                <div className="flex items-start px-5 gap-3 border border-black/10 rounded-2xl py-4 bg-gray-50/50 focus-within:border-emerald-500 transition-all">
                                                    <FileText className="text-gray-400 w-5 h-5 mt-1" />
                                                    <textarea placeholder="Add custom brand docs, context, or specific instructions here..." value={context} onChange={(e) => setContext(e.target.value)} className="w-full outline-none bg-transparent font-medium min-h-[100px] resize-none" />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Target Platforms</label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <span className="text-xs font-bold text-gray-400">Image Ads</span>
                                                        <div onClick={() => setIncludeImages(!includeImages)} className={cn("w-10 h-6 rounded-full p-1 transition-all", includeImages ? "bg-emerald-600" : "bg-gray-200")}>
                                                            <div className={cn("w-4 h-4 bg-white rounded-full transition-all", includeImages ? "translate-x-4" : "translate-x-0")} />
                                                        </div>
                                                    </label>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                    {PLATFORM_OPTIONS.map(p => (
                                                        <button key={p.id} type="button" onClick={() => setPlatforms(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all", platforms.includes(p.id) ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-black/5 text-gray-400 hover:border-black/10")}>
                                                            {p.icon}
                                                            <span className="text-xs font-bold">{p.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <button disabled={loading} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20">
                                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Analyze Brand & Start <ArrowRight className="w-5 h-5" /></>}
                                            </button>
                                        </form>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'analysis' && analysis && (
                                <motion.div key="analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-3xl font-bold tracking-tight">Step 1: <span className="text-emerald-600">Brand Analysis</span></h2>
                                        <button onClick={() => setStep('input')} className="text-sm font-bold text-gray-400 hover:text-black flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <AnalysisCard icon={<Zap className="text-amber-500" />} title="Core Identity" content={analysis.coreIdentity} />
                                        <AnalysisCard icon={<Megaphone className="text-blue-500" />} title="Voice & Tone" content={analysis.voiceTone} />
                                        <AnalysisCard icon={<Target className="text-rose-500" />} title="Target Audience" content={analysis.targetAudience} />
                                        <AnalysisCard icon={<Sparkles className="text-emerald-500" />} title="Unique Value Proposition" content={analysis.uvp} />
                                    </div>

                                    <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Palette className="text-emerald-600 w-6 h-6" />
                                            <h3 className="font-bold text-lg">Brand Color Palette</h3>
                                        </div>
                                        <div className="flex gap-4">
                                            {analysis.colorPalette.map(color => (
                                                <div key={color} className="flex-1 group cursor-pointer">
                                                    <div className="h-16 rounded-2xl shadow-inner mb-2 transition-transform group-hover:scale-105" style={{ backgroundColor: color }} />
                                                    <p className="text-center text-[10px] font-mono font-bold text-gray-400">{color}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50 p-8 rounded-[32px] border border-emerald-100 space-y-4">
                                        <div className="flex items-center gap-3 text-emerald-700">
                                            <MessageSquare className="w-5 h-5" />
                                            <h3 className="font-bold">Missing something? Refine the analysis</h3>
                                        </div>
                                        <div className="flex gap-3">
                                            <input type="text" placeholder="e.g. 'The tone should be more aggressive' or 'Focus more on Gen Z'" value={analysisRefinement} onChange={(e) => setAnalysisRefinement(e.target.value)} className="flex-1 bg-white border border-emerald-200 rounded-xl px-5 py-3 outline-none focus:border-emerald-500 transition-all font-medium" />
                                            <button onClick={handleRefineAnalysis} disabled={loading} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50">
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button onClick={handleProceedToTone} disabled={loading} className="w-full bg-black text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-800 transition-all">
                                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Looks Good, Choose Tone <ArrowRight className="w-5 h-5" /></>}
                                    </button>
                                </motion.div>
                            )}

                            {step === 'tone-selection' && (
                                <motion.div key="tone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="text-center mb-12">
                                        <h2 className="text-4xl font-bold tracking-tight mb-4">Step 2: Choose Your <span className="text-emerald-600">Campaign Tone</span></h2>
                                        <p className="text-gray-500">Select the emotional hook that best fits your current goal.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {toneOptions.map((tone, i) => (
                                            <button key={i} onClick={() => handleGenerateAds(tone)} disabled={loading} className="text-left bg-white p-8 rounded-[32px] border border-black/5 shadow-sm hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-600/5 transition-all group relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ArrowRight className="w-6 h-6 text-emerald-600" />
                                                </div>
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">0{i + 1}</div>
                                                <p className="text-lg font-medium text-gray-700 leading-relaxed">{tone}</p>
                                            </button>
                                        ))}
                                    </div>

                                    {loading && (
                                        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-4">
                                            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                                            <p className="font-bold text-xl animate-pulse">Generating your custom ad campaign...</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {step === 'final-ads' && finalAds && (
                                <motion.div key="final" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
                                        <div>
                                            <h1 className="text-3xl font-bold tracking-tight mb-2">Final Campaign</h1>
                                            <p className="text-gray-500">Tone: <span className="text-emerald-600 font-medium italic">{selectedTone}</span></p>
                                        </div>
                                        <button onClick={startOver} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-black/10 font-bold hover:bg-gray-50 transition-all">
                                            <RefreshCcw className="w-4 h-4" /> Start Over
                                        </button>
                                    </div>

                                    {/* Summary Section */}
                                    <section className="space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2"><Layout className="w-5 h-5 text-emerald-600" /> Brand Strategy Summary</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="bg-white p-5 rounded-2xl border border-black/5"><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Identity</p><p className="text-xs line-clamp-3">{analysis?.coreIdentity}</p></div>
                                            <div className="bg-white p-5 rounded-2xl border border-black/5"><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Voice</p><p className="text-xs line-clamp-3">{analysis?.voiceTone}</p></div>
                                            <div className="bg-white p-5 rounded-2xl border border-black/5"><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Audience</p><p className="text-xs line-clamp-3">{analysis?.targetAudience}</p></div>
                                            <div className="bg-white p-5 rounded-2xl border border-black/5"><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">USP</p><p className="text-xs line-clamp-3">{analysis?.uvp}</p></div>
                                        </div>
                                    </section>

                                    {/* Image Ads */}
                                    {finalAds.adImage && (
                                        <section className="space-y-6">
                                            <h3 className="text-xl font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-emerald-600" /> Visual Assets</h3>
                                            <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm space-y-6">
                                                <div className="relative aspect-video max-w-3xl mx-auto rounded-2xl overflow-hidden border border-black/5 shadow-2xl group">
                                                    <img src={finalAds.adImage} alt="Ad" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button onClick={() => { const l = document.createElement('a'); l.href = finalAds.adImage; l.download = 'ad.png'; l.click(); }} className="bg-white text-black px-6 py-2 rounded-full font-bold flex items-center gap-2"><Download className="w-4 h-4" /> Download</button>
                                                    </div>
                                                </div>
                                                <RefinementBox onRefine={(p) => handleGenerateAds(selectedTone! + " " + p)} label="Refine Visual Style" />
                                            </div>
                                        </section>
                                    )}

                                    {/* Platform Ads */}
                                    <section className="space-y-8">
                                        <h3 className="text-xl font-bold flex items-center gap-2"><Megaphone className="w-5 h-5 text-emerald-600" /> Platform Deliverables & Previews</h3>
                                        <div className="space-y-12">
                                            {platforms.map(platform => {
                                                const ads = finalAds[platform];
                                                if (!ads) return null;
                                                const config = PLATFORM_OPTIONS.find(p => p.id === platform);
                                                return (
                                                    <div key={platform} className="space-y-6">
                                                        <div className="flex items-center gap-3 px-4">
                                                            <div className="p-2.5 bg-white rounded-xl text-gray-600 shadow-sm border border-black/5">{config?.icon}</div>
                                                            <h4 className="font-bold text-xl">{config?.label}</h4>
                                                        </div>

                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                            {ads.map((ad: any, i: number) => (
                                                                <div key={i} className="flex flex-col gap-6">
                                                                    {/* Copy Card */}
                                                                    <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm relative group hover:shadow-md transition-all h-full">
                                                                        <div className="flex justify-between items-start mb-6">
                                                                            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-widest">Variant {i + 1}</div>
                                                                            <button onClick={() => copyToClipboard(JSON.stringify(ad), `${platform}-${i}`)} className="p-2 bg-gray-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-50 hover:text-emerald-600">
                                                                                {copiedId === `${platform}-${i}` ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                                                            </button>
                                                                        </div>

                                                                        <div className="space-y-4">
                                                                            {Object.entries(ad).map(([key, val]) => (
                                                                                <div key={key}>
                                                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">{key}</label>
                                                                                    <p className="text-sm font-medium text-gray-700 leading-relaxed">{Array.isArray(val) ? val.join(' | ') : String(val)}</p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <RefinementBox onRefine={(p) => handleRefineAd(platform, i, Object.keys(ad)[0], p)} label="Refine this copy" />
                                                                    </div>

                                                                    {/* Preview Card */}
                                                                    <div className="bg-gray-100/50 p-8 rounded-[32px] border border-dashed border-black/10 flex flex-col items-center justify-center">
                                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Live Preview</p>
                                                                        <AdPreview
                                                                            platform={platform}
                                                                            ad={ad}
                                                                            image={finalAds.adImage}
                                                                            brandName={analysis?.coreIdentity || 'Your Brand'}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
}

function AdPreview({ platform, ad, image, brandName }: { platform: string; ad: any; image?: string; brandName: string }) {
    const ProfilePic = () => (
        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
            {brandName.charAt(0)}
        </div>
    );

    if (platform === 'facebook') {
        return (
            <div className="w-full max-w-[400px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden font-sans">
                <div className="p-3 flex items-center gap-2">
                    <ProfilePic />
                    <div>
                        <p className="font-bold text-sm leading-tight">{brandName}</p>
                        <p className="text-[10px] text-gray-500">Sponsored · <Globe className="inline w-2 h-2" /></p>
                    </div>
                </div>
                <div className="px-3 pb-3 text-sm text-gray-800 line-clamp-3">
                    {ad.primaryText}
                </div>
                {image && <img src={image} className="w-full aspect-square object-cover" alt="Preview" />}
                <div className="p-3 bg-gray-100 flex justify-between items-center">
                    <div className="flex-1 min-w-0 pr-4">
                        <p className="text-[10px] text-gray-500 uppercase truncate">WWW.YOURWEBSITE.COM</p>
                        <p className="font-bold text-sm truncate">{ad.headline}</p>
                    </div>
                    <button className="px-4 py-1.5 bg-gray-200 text-gray-800 text-xs font-bold rounded uppercase">
                        {ad.cta || 'Learn More'}
                    </button>
                </div>
            </div>
        );
    }

    if (platform === 'instagram') {
        return (
            <div className="w-full max-w-[400px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden font-sans">
                <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
                            <div className="w-full h-full rounded-full bg-white p-[2px]">
                                <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">
                                    {brandName.charAt(0)}
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="font-bold text-xs leading-tight">{brandName.toLowerCase().replace(/\s/g, '_')}</p>
                            <p className="text-[10px] text-gray-500">Sponsored</p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                    </div>
                </div>
                {image && <img src={image} className="w-full aspect-square object-cover" alt="Preview" />}
                <div className="p-3 bg-blue-600 text-white flex justify-between items-center">
                    <p className="text-xs font-bold">{ad.cta || 'Learn More'}</p>
                    <ChevronRight className="w-4 h-4" />
                </div>
                <div className="p-3">
                    <div className="flex gap-4 mb-2">
                        <div className="w-5 h-5 border-2 border-gray-800 rounded-md" />
                        <div className="w-5 h-5 border-2 border-gray-800 rounded-full" />
                        <div className="w-5 h-5 border-2 border-gray-800 rounded-sm rotate-45" />
                    </div>
                    <p className="text-xs">
                        <span className="font-bold mr-2">{brandName.toLowerCase().replace(/\s/g, '_')}</span>
                        {ad.primaryText}
                    </p>
                </div>
            </div>
        );
    }

    if (platform === 'twitter') {
        return (
            <div className="w-full max-w-[400px] bg-white rounded-xl shadow-sm border border-gray-200 p-4 font-sans">
                <div className="flex gap-3">
                    <ProfilePic />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                            <p className="font-bold text-sm truncate">{brandName}</p>
                            <p className="text-gray-500 text-sm truncate">@{brandName.toLowerCase().replace(/\s/g, '')} · Ad</p>
                        </div>
                        <p className="text-sm text-gray-800 mb-3 leading-normal">{ad.postContent}</p>
                        {image && <img src={image} className="w-full aspect-video object-cover rounded-2xl border border-gray-100 mb-3" alt="Preview" />}
                        <div className="flex justify-between max-w-xs text-gray-500">
                            <div className="w-4 h-4 border border-gray-300 rounded" />
                            <div className="w-4 h-4 border border-gray-300 rounded-full" />
                            <div className="w-4 h-4 border border-gray-300 rounded-sm" />
                            <div className="w-4 h-4 border border-gray-300 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (platform === 'linkedin') {
        return (
            <div className="w-full max-w-[400px] bg-white rounded-lg shadow-sm border border-gray-200 font-sans">
                <div className="p-3 flex items-center gap-2">
                    <div className="w-12 h-12 bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                        {brandName.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-sm leading-tight">{brandName}</p>
                        <p className="text-[10px] text-gray-500">Promoted</p>
                    </div>
                </div>
                <div className="px-3 pb-3 text-xs text-gray-800 line-clamp-4">
                    {ad.postContent}
                </div>
                {image && <img src={image} className="w-full aspect-video object-cover" alt="Preview" />}
                <div className="p-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex-1 min-w-0 pr-4">
                        <p className="font-bold text-sm truncate">{brandName} - Official Site</p>
                        <p className="text-[10px] text-gray-500 truncate">yourwebsite.com</p>
                    </div>
                    <button className="px-4 py-1.5 border border-blue-600 text-blue-600 text-xs font-bold rounded-full hover:bg-blue-50">
                        Learn More
                    </button>
                </div>
            </div>
        );
    }

    if (platform === 'google') {
        return (
            <div className="w-full max-w-[500px] bg-white rounded-xl shadow-sm border border-gray-200 p-6 font-sans">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">Ad</div>
                    <p className="text-xs text-gray-800">https://www.yourwebsite.com</p>
                </div>
                <p className="text-xl text-blue-700 hover:underline cursor-pointer mb-1 leading-tight">
                    {ad.headlines?.join(' | ')}
                </p>
                <div className="text-sm text-gray-600 leading-relaxed">
                    {ad.descriptions?.join(' ')}
                </div>
            </div>
        );
    }

    return null;
}

function AnalysisCard({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
                {icon}
                <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400">{title}</h4>
            </div>
            <p className="text-gray-700 leading-relaxed text-sm">{content}</p>
        </div>
    );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
            )}
        >
            {icon}
            {label}
        </button>
    );
}

function RefinementBox({ onRefine, label }: { onRefine: (p: string) => void, label: string }) {
    const [val, setVal] = useState('');
    return (
        <div className="flex gap-2 mt-4">
            <input type="text" placeholder={label} value={val} onChange={(e) => setVal(e.target.value)} className="flex-1 bg-white border border-black/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500 transition-all" />
            <button onClick={() => { onRefine(val); setVal(''); }} className="bg-black text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-all">Refine</button>
        </div>
    );
}
