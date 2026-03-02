"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, RefreshCw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const TAROT_CARDS = ["연인", "여황제", "별", "달", "태양", "절제", "바보", "교황", "악마", "힘", "전차", "정의"]; 
const POSITIONS = ["현재", "도전", "조언"];

export default function TarotPage() {
  const router = useRouter();
  const [isDrawing, setIsDrawing] = useState(false);
  const [cards, setCards] = useState<string[]>([]);

  const draw = () => {
    setIsDrawing(true);
    const deck = [...TAROT_CARDS];
    const picked: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      const idx = Math.floor(Math.random() * deck.length);
      picked.push(deck[idx]);
      deck.splice(idx, 1);
    }
    setTimeout(() => {
      setCards(picked);
      setIsDrawing(false);
    }, 700);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.2),transparent_40%),radial-gradient(circle_at_80%_40%,rgba(14,165,233,0.16),transparent_45%)]" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          <button onClick={() => setCards([])} className="text-sm px-4 py-2 rounded-full border border-white/10 bg-white/10">
            초기화
          </button>
        </div>

        <section className="bg-slate-900/55 border border-white/10 rounded-[2.5rem] p-8 md:p-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-300/30 text-indigo-200 text-xs font-black tracking-[0.2em]">
            <Sparkles className="w-4 h-4" /> 타로 리딩
          </div>
          <h1 className="text-4xl mt-4 font-black italic">상황별 카드 해석</h1>
          <p className="text-slate-300 mt-2">현재, 도전, 조언의 3장으로 핵심 흐름을 정리합니다.</p>

          <button
            onClick={draw}
            disabled={isDrawing}
            className="mt-6 w-full py-5 rounded-full bg-indigo-500 text-white font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isDrawing ? "animate-spin" : ""}`} />
            {isDrawing ? "카드를 뽑는 중..." : "카드 3장 뽑기"}
          </button>
        </section>

        {cards.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 grid md:grid-cols-3 gap-4"
          >
            {cards.map((card, index) => (
              <div key={`${card}-${index}`} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
                <div className="text-sm text-indigo-300 font-black">{POSITIONS[index]} 위치</div>
                <div className="mt-3 text-2xl font-black">{card}</div>
                <p className="mt-3 text-slate-300 text-sm">
                  지금의 방향성, 걸림돌, 그리고 한 단계 상향 조언을 함께 보는 카드입니다.
                </p>
                <div className="mt-5 text-xs text-slate-400 flex items-center justify-between">
                  <span>실행 포인트</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </motion.section>
        )}
      </div>
    </main>
  );
}
