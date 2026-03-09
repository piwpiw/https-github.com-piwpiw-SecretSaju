"use client";

import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Zap, HelpCircle } from "lucide-react";
import { cn } from "@/lib/app/utils";

interface OracleBallProps {
    title?: string;
    description?: string;
    advices?: string[];
    onConsult?: (advice: string) => void;
    className?: string;
}

const DEFAULT_ADVICES = [
    "지금의 선택이 흐름을 바꿉니다. 오늘은 핵심 한 가지를 끝까지 밀고 가세요.",
    "감정이 흔들려도 규칙을 세우면 결정을 빠르게 정리할 수 있습니다.",
    "대운의 기운은 작은 루틴으로 먼저 바닥부터 차곡차곡 쌓을 때 강해집니다.",
    "오늘은 충동보다 증거 기반 판단이 더 큰 이익을 만듭니다.",
    "휴식을 먼저 잡으면 에너지가 더 길게 남습니다.",
    "새로운 시도는 단번에 성과가 아니라 3번의 반복으로 완성됩니다.",
    "불안을 줄이려면 현재의 하나만 정리하고 실행으로 옮겨보세요.",
    "감정이 확장되려면 표현을 한 문장으로 줄이는 훈련이 먼저입니다.",
    "오늘의 데이터가 흐려도 방향은 충분히 선명합니다.",
    "지금의 균형은 작은 결심에서 시작됩니다."
];

export default function OracleBall({
    title = "운세 오라클",
    description = "한 번의 클릭으로 오늘의 인사이트를 받아보세요.",
    advices = DEFAULT_ADVICES,
    onConsult,
    className
}: OracleBallProps) {
    const [advice, setAdvice] = useState<string | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const controls = useAnimation();

    const handleConsult = async () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setAdvice(null);

        await controls.start({
            rotate: [0, -20, 20, -15, 15, -10, 10, 0],
            scale: [1, 1.2, 0.85, 1.1, 1],
            transition: { duration: 0.8, ease: "easeInOut" }
        });

        const randomAdvice = advices[Math.floor(Math.random() * advices.length)];

        setTimeout(() => {
            setAdvice(randomAdvice);
            setIsSpinning(false);
            if (onConsult) onConsult(randomAdvice);
        }, 800);
    };

    return (
        <div className={cn("max-w-md mx-auto panel-shell p-12 text-center relative overflow-hidden group", className)}>
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
            <div className="absolute bottom-0 right-0 w-52 h-52 bg-indigo-500/12 rounded-full blur-[80px] -mr-28 -mb-24 opacity-80 pointer-events-none" />

            <div className="mb-12 relative z-10">
                <div className="ui-chip mb-6">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" /> 채널링 공명
                </div>
                <h3 className="ui-title ui-title-gradient mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{title}</h3>
                <p className="text-micro-copy opacity-80">{description}</p>
            </div>

            <motion.div
                animate={controls}
                onClick={handleConsult}
                className="relative w-64 h-64 mx-auto cursor-pointer mb-12 select-none group/ball"
                role="button"
                aria-label="운세 조언 뽑기"
            >
                {/* Orbital Rings */}
                <div className="absolute -inset-4 border border-indigo-500/10 rounded-full animate-rotate-slow opacity-60" />
                <div className="absolute -inset-10 border border-white/6 rounded-full animate-[spin_12s_linear_infinite] opacity-30" />
                <div className="absolute -inset-16 border border-white/4 rounded-full animate-[spin_18s_linear_infinite_reverse] opacity-10" />

                {/* The Sphere */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-purple-700 to-slate-950 shadow-[0_0_80px_rgba(79,70,229,0.35)] overflow-hidden border border-white/20 group-hover/ball:shadow-indigo-500/60 transition-all duration-700 group-hover/ball:scale-105 active:scale-95">
                    <div className="absolute top-4 left-12 w-28 h-14 bg-white/20 rounded-full blur-2xl -rotate-45" />
                    <div className="absolute bottom-2 right-10 w-20 h-10 bg-indigo-400/10 rounded-full blur-xl" />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {isSpinning ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 360 }}
                                    exit={{ opacity: 0, scale: 1.5 }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    className="flex flex-col items-center gap-3"
                                >
                                    <Zap className="w-14 h-14 text-white fill-current animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 italic">동기화 중...</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="relative flex flex-col items-center gap-3"
                                >
                                    <Sparkles className="w-20 h-20 text-white/80 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-transform duration-700 group-hover/ball:scale-110" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            <div className="h-24 flex flex-col items-center justify-center relative z-10 px-8">
                <AnimatePresence mode="wait">
                    {advice ? (
                        <motion.div
                            key="advice"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="space-y-4"
                        >
                            <p className="text-lg font-black text-indigo-200 leading-tight italic drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">&ldquo;{advice}&rdquo;</p>
                            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto rounded-full" />
                        </motion.div>
                    ) : !isSpinning && (
                        <motion.button
                            key="prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="group flex flex-col items-center gap-3"
                            onClick={handleConsult}
                        >
                            <span className="text-micro-copy text-indigo-400 group-hover:text-indigo-300 transition-colors">조언을 뽑아보세요</span>
                            <div className="flex gap-1.5">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-indigo-500/60 transition-all duration-500" />
                                ))}
                            </div>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
