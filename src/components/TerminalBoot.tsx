"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const BOOT_LINES = [
    "사주팔자 엔진을 초기화하고 있습니다...",
    "음양오행 데이터베이스 연결 완료",
    "60갑자 아키타입 동기화 중...",
    "운세 분석 모듈 준비 완료",
    "당신의 운명을 읽을 준비가 되었습니다",
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
        } else {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onComplete, 600);
            }, 800);
            return () => clearTimeout(timer);
        }
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
                        {/* Logo */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mb-10"
                        >
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-4">
                                <span className="text-white text-2xl font-bold">사</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">시크릿사주</h1>
                            <p className="text-sm text-slate-500 mt-1">사주팔자 정밀 분석</p>
                        </motion.div>

                        {/* Progress Lines */}
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
                                    <span className="text-slate-500">분석 중...</span>
                                </motion.div>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full">
                            <div className="flex justify-between text-xs text-slate-600 mb-2">
                                <span>로딩 중</span>
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
