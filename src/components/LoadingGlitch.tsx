"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Sparkles, Activity, ShieldCheck, Database, Cpu } from "lucide-react";

interface LoadingGlitchProps {
    onComplete?: () => void;
}

export default function LoadingGlitch({ onComplete }: LoadingGlitchProps) {
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);

    const steps = [
        { title: "INITIALIZING SAJU ENGINE", icon: Cpu, color: "text-cyan-400", bg: "bg-cyan-500/20" },
        { title: "EXTRACTING TEN-GODS (SIPSONG)", icon: Database, color: "text-purple-400", bg: "bg-purple-500/20" },
        { title: "ANALYZING 60-PILLAR MATRIX", icon: Activity, color: "text-pink-400", bg: "bg-pink-500/20" },
        { title: "DECRYPTING HIDDEN INSTINCTS", icon: ShieldCheck, color: "text-yellow-400", bg: "bg-yellow-500/20" },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => onComplete?.(), 600);
                    return 100;
                }
                const nextProgress = prev + Math.random() * 15;

                // Update step based on progress
                if (nextProgress < 25) setStep(0);
                else if (nextProgress < 50) setStep(1);
                else if (nextProgress < 75) setStep(2);
                else setStep(3);

                return nextProgress;
            });
        }, 300);

        return () => clearInterval(interval);
    }, [onComplete]);

    const CurrentIcon = steps[step].icon;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.1)_0%,transparent_70%)]"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
                {/* Visualizer Ring */}
                <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
                    <motion.div
                        className="absolute inset-0 rounded-full border border-white/5 border-t-cyan-400/50 border-r-purple-400/50"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute inset-2 rounded-full border border-white/5 border-b-pink-400/50 border-l-yellow-400/50"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(56,189,248,0.2)]">
                        <motion.div
                            key={step}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className={`p-4 rounded-full ${steps[step].bg}`}
                        >
                            <CurrentIcon className={`w-8 h-8 ${steps[step].color}`} />
                        </motion.div>
                    </div>
                </div>

                {/* Status Text */}
                <div className="text-center mb-8 h-12">
                    <motion.div
                        key={step}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`text-sm font-black tracking-widest ${steps[step].color} mb-2`}
                    >
                        {steps[step].title}
                    </motion.div>
                    <div className="text-slate-400 text-xs font-mono">
                        {Math.floor(progress)}% / 100%
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
                        style={{
                            width: `${Math.min(progress, 100)}%`,
                            boxShadow: "0 0 20px rgba(168,85,247,0.5)",
                        }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ type: "spring", stiffness: 50 }}
                    />
                </div>

                {/* Data Stream */}
                <div className="mt-8 font-mono text-[10px] text-slate-600 tracking-widest flex flex-col items-center gap-1 opacity-50">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        {'>'} ANALYZING DEMOGRAPHIC VECTOR...
                    </motion.div>
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, delay: 0.5, repeat: Infinity }}>
                        {'>'} RESOLVING YIN-YANG CONFLICTS...
                    </motion.div>
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, delay: 1, repeat: Infinity }}>
                        {'>'} COMPILING ANIMAL ARCHETYPES...
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
