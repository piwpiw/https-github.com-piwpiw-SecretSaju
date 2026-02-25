"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Clock, ShieldCheck, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ComingSoon({ title, desc }: { title: string, desc?: string }) {
    const router = useRouter();

    return (
        <main className="min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden px-4">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_50%)]"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-md w-full relative z-10 text-center space-y-8">
                {/* VIP Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-white/10 mx-auto"
                >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold tracking-widest bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent uppercase">
                        Premium Service Only
                    </span>
                    <Sparkles className="w-4 h-4 text-pink-400" />
                </motion.div>

                {/* Animated Clock / Visual */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="relative w-40 h-40 mx-auto"
                >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 animate-[spin_4s_linear_infinite]"></div>
                    <div className="absolute inset-2 rounded-full border border-white/10 backdrop-blur-xl bg-black/40 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.3)]">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute w-full h-full rounded-full border border-t-purple-400/50 border-r-transparent border-b-cyan-400/50 border-l-transparent"
                        />
                        <Clock className="w-12 h-12 text-white/80 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                >
                    <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">
                        {title}
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed px-4">
                        {desc || "최고의 경험을 위해 AI 보안 및 정밀 분석 엔진을 고도화하고 있습니다.\n곧 커머셜 그레이드의 완벽한 서비스로 오픈됩니다."}
                    </p>
                </motion.div>

                {/* Status Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex justify-center gap-4 pt-4"
                >
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-[10px] text-slate-500 tracking-widest font-bold">SECURE</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-amber-400" />
                        </div>
                        <span className="text-[10px] text-slate-500 tracking-widest font-bold">99.9% PURE</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="pt-8"
                >
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-full transition-all font-bold text-sm group shadow-[0_5px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_5px_30px_rgba(255,255,255,0.1)]"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        메인으로 돌아가기
                    </button>
                </motion.div>
            </div>
        </main>
    );
}
