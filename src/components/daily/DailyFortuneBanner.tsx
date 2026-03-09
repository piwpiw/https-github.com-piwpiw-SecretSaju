"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";

type DailyFortune = {
  date: string;
  pillarName: string;
  message: string;
};

// Fallback messages when API is unavailable
const FALLBACK_MESSAGES = [
  "오늘은 새로운 인연이 시작될 예감! 낯선 사람에게 먼저 말을 걸어보세요 🐾",
  "조급하게 굴지 말 것. 오늘의 에너지는 느리지만 확실하게 움직인다 🌙",
  "재물운이 살짝 기지개를 켜는 날. 충동구매는 금물, 저축은 길성 ✨",
  "애정운 주의보! 오해가 생기기 쉬운 날. 말 한마디를 신중히 골라라 🔮",
  "당신의 직관이 오늘만큼은 100% 맞는다. 첫 번째 느낌을 믿어라 ⚡",
  "주변 사람에게 작은 친절을 베풀면 3배로 돌아오는 날 🎁",
  "오늘의 키워드: 정리정돈. 묵은 감정과 공간을 비워내면 새것이 들어온다 🌿",
];

export function DailyFortuneBanner() {
  const [fortune, setFortune] = useState<DailyFortune | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/daily-fortune")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => (data?.message != null ? data : null))
      .then((data) => {
        if (data) {
          setFortune(data);
        } else {
          // Use a deterministic fallback based on today's date
          const dayIndex = new Date().getDate() % FALLBACK_MESSAGES.length;
          setFortune({
            date: new Date().toISOString().slice(0, 10),
            pillarName: "오늘",
            message: FALLBACK_MESSAGES[(dayIndex + refreshKey) % FALLBACK_MESSAGES.length],
          });
        }
      })
      .catch(() => {
        const dayIndex = new Date().getDate() % FALLBACK_MESSAGES.length;
        setFortune({
          date: new Date().toISOString().slice(0, 10),
          pillarName: "오늘",
          message: FALLBACK_MESSAGES[(dayIndex + refreshKey) % FALLBACK_MESSAGES.length],
        });
      })
      .finally(() => setIsLoading(false));
  }, [refreshKey]);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto mb-8">
        <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4 animate-pulse">
          <div className="h-3 bg-white/10 rounded w-24 mb-2" />
          <div className="h-4 bg-white/10 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!fortune) return null;

  return (
    <div className="max-w-md mx-auto mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={refreshKey}
          className="rounded-2xl bg-gradient-to-r from-purple-900/40 to-pink-900/30 border border-purple-400/20 backdrop-blur-sm px-5 py-4"
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-purple-400 font-bold text-xs tracking-wider uppercase">
                  오늘의 운세
                </span>
                <span className="text-slate-500 text-xs">· {fortune.pillarName}</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">{fortune.message}</p>
            </div>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 mt-0.5"
              title="다른 운세 보기"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
