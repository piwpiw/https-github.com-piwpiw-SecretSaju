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
        { title: "사주 엔진 초기화 중", icon: Cpu, color: "text-indigo-400", bg: "bg-indigo-500/20" },
        { title: "십신(十神) 분석 중", icon: Database, color: "text-purple-400", bg: "bg-purple-500/20" },
        { title: "60갑자 매칭 중", icon: Activity, color: "text-pink-400", bg: "bg-pink-500/20" },
        { title: "성격 유형 판별 중", icon: ShieldCheck, color: "text-amber-400", bg: "bg-amber-500/20" },
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
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)]"></div>

            <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
                {/* Visualizer Ring */}
                <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-indigo-500/20"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute inset-3 rounded-full border border-purple-500/15"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                        <motion.div
                            key={step}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`p-3 rounded-full ${steps[step].bg}`}
                        >
                            <CurrentIcon className={`w-7 h-7 ${steps[step].color}`} />
                        </motion.div>
                    </div>
                </div>

                {/* Status Text */}
                <div className="text-center mb-8 h-12">
                    <motion.div
                        key={step}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`text-base font-bold ${steps[step].color} mb-2`}
                    >
                        {steps[step].title}
                    </motion.div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {Math.floor(progress)}%
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ type: "spring", stiffness: 50 }}
                    />
                </div>

                {/* Korean status lines */}
                <div className="mt-6 text-xs flex flex-col items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        음양오행 데이터 분석 중...
                    </motion.div>
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, delay: 0.5, repeat: Infinity }}>
                        동물 아키타입 매칭 중...
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
