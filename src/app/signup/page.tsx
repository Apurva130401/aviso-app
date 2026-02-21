'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2, Shield, Globe, Zap, Sparkles } from 'lucide-react'
import { signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function SignupPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await signup(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
        }
    }

    if (!mounted) return null

    if (success) {
        return (
            <div className="min-h-screen bg-[#030303] text-white flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-primary/30 relative">
                {/* Left Side: Brand Presence (Same as Login) */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-[#050505]">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-accent/10 blur-[120px] rounded-full animate-pulse" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[120px] rounded-full animate-pulse decoration-5000" />
                        <div className="absolute inset-0 bg-grid-subtle opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
                    </div>

                    <div className="relative z-10 p-20 max-w-2xl text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="flex items-center gap-4 mb-8 justify-center lg:justify-start">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-white/10">
                                    <span className="text-xl font-black text-black">A</span>
                                </div>
                                <span className="text-2xl font-bold tracking-tighter">Aviso</span>
                            </div>
                            <h1 className="text-6xl font-black leading-[1.1] mb-8 tracking-tighter">
                                Start your creative <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">journey</span> today.
                            </h1>
                        </motion.div>
                    </div>
                </div>

                {/* Right Side: Success Content */}
                <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-20 relative bg-black">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full max-w-md text-center relative z-10"
                    >
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-full mb-8 border border-accent/20">
                            <CheckCircle2 className="w-10 h-10 text-accent" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Account Created</h1>
                        <p className="text-white/40 mb-10 leading-relaxed text-sm tracking-wide">
                            Welcome to Aviso! Your account has been successfully initialized. You can now access your dashboard.
                        </p>
                        <Link href="/login" className="block w-full">
                            <Button className="w-full h-14 bg-white text-black font-bold uppercase tracking-[0.2em] rounded-2xl transition-all hover:bg-white/90">Return to Login</Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#030303] text-white flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-primary/30 relative">
            {/* Left Side: Brand Presence */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-[#050505]">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-accent/10 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[120px] rounded-full animate-pulse decoration-5000" />
                    <div className="absolute inset-0 bg-grid-subtle opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
                </div>

                <div className="relative z-10 p-20 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-white/10">
                                <span className="text-xl font-black text-black">A</span>
                            </div>
                            <span className="text-2xl font-bold tracking-tighter">Aviso</span>
                        </div>
                        <h1 className="text-6xl font-black leading-[1.1] mb-8 tracking-tighter">
                            Unleash your brand&apos;s <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">potential</span>.
                        </h1>
                        <p className="text-xl text-white/40 mb-12 leading-relaxed">
                            Create a free account and start generating high-performance ad creatives with artificial intelligence.
                        </p>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5">
                                <div className="p-2 rounded-xl bg-accent/10 text-accent">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm mb-1">AI Driven</p>
                                    <p className="text-xs text-white/30">Next-gen creatives</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm mb-1">Secure</p>
                                    <p className="text-xs text-white/30">Privacy first</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Signup Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-20 relative bg-black">
                <div className="absolute inset-0 bg-grid-subtle opacity-10 lg:hidden" />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="mb-12 text-center lg:text-left">
                        <div className="lg:hidden flex justify-center mb-8">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-white/10">
                                <span className="text-xl font-black text-black">A</span>
                            </div>
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight mb-3">Create account</h2>
                        <p className="text-white/40">Enter your details to create your researcher account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm font-medium"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-1">Email Address</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-white/10 group-focus-within/input:text-primary transition-colors duration-300" strokeWidth={1.5} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="block w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300"
                                        placeholder="email@company.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-1">Password</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-white/10 group-focus-within/input:text-primary transition-colors duration-300" strokeWidth={1.5} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        className="block w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/20 hover:text-white/60 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 space-y-6">
                            <Button
                                type="submit"
                                className="w-full h-14 bg-white text-black hover:bg-white/90 font-bold uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl shadow-white/5"
                                loading={loading}
                            >
                                {!loading && <span className="flex items-center gap-2">Sign Up <ArrowRight className="w-4 h-4" /></span>}
                            </Button>

                            <div className="relative flex items-center gap-4">
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest whitespace-nowrap">Alternative</span>
                                <div className="flex-1 h-px bg-white/10" />
                            </div>

                            <Button
                                type="button"
                                onClick={async () => {
                                    const { signInWithGoogle } = await import('@/app/auth/actions');
                                    await signInWithGoogle();
                                }}
                                variant="outline"
                                className="w-full h-14 bg-white/5 border-white/10 text-white font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all duration-300"
                            >
                                <span className="flex items-center gap-3">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </span>
                            </Button>
                        </div>
                    </form>

                    <div className="mt-12 text-center text-sm">
                        <p className="text-white/40">
                            Already have an account?{' '}
                            <Link href="/login" className="text-white font-bold hover:text-primary transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
