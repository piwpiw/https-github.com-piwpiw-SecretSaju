"use client";

import { motion } from "framer-motion";
import { Zap, TrendingUp, Heart, Coins } from "lucide-react";
import { useEffect, useState } from "react";

const TICKER_ITEMS = [
    { icon: <TrendingUp className="w-3 h-3" />, text: "현재 강남구 재물운 상승 중 ↑", color: "text-amber-500" },
    { icon: <Heart className="w-3 h-3" />, text: "오후 2시, 쥐띠 연애 기운 최고조", color: "text-rose-500" },
    { icon: <Zap className="w-3 h-3" />, text: "오늘의 행운 색상: 로얄 블루", color: "text-indigo-500" },
    { icon: <Coins className="w-3 h-3" />, text: "토끼띠, 뜻밖의 횡재수 조심", color: "text-emerald-500" },
];

export default function LuckyTicker() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % TICKER_ITEMS.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
    <div className="bg-slate-900/80 backdrop-blur-md border-t border-slate-800 py-1.5 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-4">
                <span className="text-[9px] font-black bg-indigo-500 text-white px-1.5 py-0.5 rounded tracking-widest uppercase shrink-0">실시간</span>
                <div className="relative h-4 flex-1">
                    <motion.div
                        key={index}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="absolute inset-0 flex items-center gap-2"
                    >
                        <span className={TICKER_ITEMS[index].color}>{TICKER_ITEMS[index].icon}</span>
                        <span className="text-[10px] font-bold text-slate-400 truncate">{TICKER_ITEMS[index].text}</span>
                    </motion.div>
                </div>
                <div className="flex items-center gap-1 opacity-40">
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-slate-500 uppercase">실시간 동기화</span>
                </div>
            </div>
        </div>
    );
}
