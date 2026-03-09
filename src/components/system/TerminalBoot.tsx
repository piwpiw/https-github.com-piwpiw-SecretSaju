"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const BOOT_LINES = [
    "로딩된 세션 키를 초기화합니다...",
    "네트워크 경로를 준비합니다.",
    "60번째 단계까지 안전하게 초기화 중...",
    "운세 분석 엔진을 부팅합니다.",
    "메인 화면 진입을 완료합니다.",
];

export default function TerminalBoot({ onComplete }: { onComplete: () => void }) {
    const [lineIndex, setLineIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (lineIndex < BOOT_LINES.length) {
            const timer = setTimeout(() => {
                setLineIndex(prev => prev + 1);
            }, 400 + Math.random() * 300);
            return () => clearTimeout(timer);
        }
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 600);
        }, 800);
        return () => clearTimeout(timer);
    }, [lineIndex, onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-[#0f0f1a] flex flex-col items-center justify-center p-8 overflow-hidden"
                >
                    <div className="max-w-md w-full text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mb-10"
                        >
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-4">
                                <span className="text-white text-2xl font-bold">SC</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">시크릿사주 터미널</h1>
                            <p className="text-sm text-slate-500 mt-1">운세 분석 부트스트랩</p>
                        </motion.div>

                        <div className="space-y-2 text-left mb-8">
                            {BOOT_LINES.slice(0, lineIndex).map((line, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-3 text-sm"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                    <span className="text-slate-400">{line}</span>
                                </motion.div>
                            ))}
                            {lineIndex < BOOT_LINES.length && (
                                <motion.div
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="flex items-center gap-3 text-sm"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                    <span className="text-slate-500">진행 중...</span>
                                </motion.div>
                            )}
                        </div>

                        <div className="w-full">
                            <div className="flex justify-between text-xs text-slate-600 mb-2">
                                <span>진행률</span>
                                <span>{Math.floor((lineIndex / BOOT_LINES.length) * 100)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${(lineIndex / BOOT_LINES.length) * 100}%` }}
                                    transition={{ ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
