'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-6 relative font-sans">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-rose-500/5 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md text-center relative z-10"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-500/10 rounded-full mb-8 border border-rose-500/20">
                    <AlertCircle className="w-10 h-10 text-rose-500" strokeWidth={1.5} />
                </div>

                <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Authentication Error</h1>
                <p className="text-white/40 mb-10 leading-relaxed text-sm tracking-wide">
                    Something went wrong during the sign-in process. This could be due to an expired link,
                    cancelled authorization, or a configuration issue.
                </p>

                <div className="space-y-4">
                    <Link href="/login" className="block w-full">
                        <Button className="w-full h-14 bg-white text-black font-bold uppercase tracking-[0.2em] rounded-2xl transition-all hover:bg-white/90">
                            Back to Login
                        </Button>
                    </Link>

                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
                        Need help? Contact support@syncflo.xyz
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
