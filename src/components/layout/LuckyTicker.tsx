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
                {/* indigo-500 위 흰 글자는 4.47:1 로 AA(4.5) 에 아슬하게 못 미친다.
                    한 단계 진한 indigo-600 이면 6.29:1 이다. */}
                <span className="text-[9px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded tracking-widest uppercase shrink-0">실시간</span>
                <div className="relative h-4 flex-1">
                    <motion.div
                        key={index}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="absolute inset-0 flex items-center gap-2"
                    >
                        <span className={TICKER_ITEMS[index].color}>{TICKER_ITEMS[index].icon}</span>
                        {/* 이 바는 두 테마 모두 어둡게 유지된다. slate-400 은 라이트에서
                            3.79:1 로 모자라고 slate-300 이면 6.55:1 이다. */}
                        <span className="text-[10px] font-bold text-slate-300 truncate">{TICKER_ITEMS[index].text}</span>
                    </motion.div>
                </div>
                {/* opacity-40 을 통째로 씌운 데다 글자까지 slate-500 이라
                    실효 대비가 1.61:1(다크) / 1.34:1(라이트) 이었다. 54개 라우트
                    전부에 뜨는 바인데 사실상 안 보였다. 점만 흐리게 두고 글자는
                    제 색을 갖게 한다. */}
                <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse opacity-70" />
                    <span className="text-[8px] font-black text-slate-300 uppercase">실시간 동기화</span>
                </div>
            </div>
        </div>
    );
}
