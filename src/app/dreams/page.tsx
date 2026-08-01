"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Zap, Combine, Lightbulb, SearchX } from "lucide-react";
import { saveAnalysisToHistory } from "@/lib/app/analysis-history";
import DreamKeywordCloud from "@/components/dreams/DreamKeywordCloud";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { matchDreamSymbols, DreamMatchResult } from "@/lib/dreams/matchDreamSymbols";
import { DreamCategory } from "@/data/dreamDictionary";

const CATEGORY_BADGE: Record<DreamCategory, string> = {
  길몽: "bg-emerald-500/15 border-emerald-400/30 text-emerald-300",
  흉몽: "bg-rose-500/15 border-rose-400/30 text-rose-300",
  재물: "bg-amber-500/15 border-amber-400/30 text-amber-300",
  태몽: "bg-pink-500/15 border-pink-400/30 text-pink-300",
  관계: "bg-sky-500/15 border-sky-400/30 text-sky-300",
  변화: "bg-violet-500/15 border-violet-400/30 text-violet-300",
  심리: "bg-indigo-500/15 border-indigo-400/30 text-indigo-300",
  경고: "bg-orange-500/15 border-orange-400/30 text-orange-300",
};

export default function DreamsPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [result, setResult] = useState<DreamMatchResult | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [status, setStatus] = useState("");

  const analyze = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const analysis = matchDreamSymbols(trimmed);
    setResult(analysis);
    setHistory((prev) => [trimmed, ...prev].slice(0, 5));

    const subtitle = analysis.matched
      ? `${analysis.matches.map((m) => m.symbol).join("·")} 해몽`
      : "상징 미확인 해몽";
    const saved = saveAnalysisToHistory(
      {
        type: "DREAM",
        title: "꿈해몽 분석",
        subtitle,
        result: {
          input: trimmed,
          matched: analysis.matched,
          symbols: analysis.matches.map((m) => ({
            symbol: m.symbol,
            category: m.category,
            meaning: m.meaning,
            advice: m.advice,
          })),
          comboInsights: analysis.comboInsights,
          generalAdvice: analysis.generalAdvice,
          fallbackMessage: analysis.fallbackMessage ?? null,
        },
        resultPreview: analysis.matched
          ? analysis.generalAdvice
          : analysis.fallbackMessage ?? "",
      },
      {
        resultUrlFactory: (id) => `/analysis-history/DREAM/${id}`,
      }
    );
    setStatus(saved ? "기록에 저장되었습니다." : "기록 저장에 실패했습니다.");
    setTimeout(() => setStatus(""), 2200);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.18),transparent_45%)]" />
      <div className="max-w-4xl mx-auto px-0 sm:px-6 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button type="button" onClick={() => router.back()} aria-label="뒤로 가기" className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          <div className="text-sm px-4 py-2 rounded-full border border-white/10 bg-white/10 text-slate-300">꿈해몽 정밀 도우미</div>
        </div>

        <ScrollReveal>
          <div className="mb-8">
            <DreamKeywordCloud />
          </div>

          {/* 320px에서 좌우 여백이 과해 본문이 잘리던 문제 — 모바일만 축소 */}
          <section className="bg-slate-900/55 border border-white/10 rounded-[1.75rem] p-5 sm:rounded-[2.5rem] sm:p-8 md:p-6 sm:p-9 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-widest leading-none">AI 꿈 해몽 비서</h1>
                <p className="text-[13px] font-black text-emerald-300 uppercase tracking-[0.2em] mt-1">사전 기반 다중 상징 분석</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-lg mb-8 break-keep">어젯밤 꿈의 장면과 감정을 자세히 적을수록 상징 추출이 정확해집니다. 전통 해몽 사전에서 상징을 찾아 현대적 해석과 실천 조언을 드립니다.</p>

            <div className="space-y-6">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="어젯밤 꿈의 내용을 상세히 적어주세요... (예: 맑은 물이 흐르는 강에서 커다란 물고기를 잡았어요)"
                className="w-full h-48 bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/50 transition-all resize-none font-medium"
              />

              <button
                type="button"
                onClick={analyze}
                disabled={!text.trim()}
                className="w-full py-5 rounded-[2rem] bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-600 transition-all flex items-center justify-center gap-3 group relative overflow-hidden shadow-2xl shadow-emerald-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Zap className="w-5 h-5" />
                <span className="text-sm font-black uppercase tracking-[0.2em] break-keep">꿈 상징 분석하기</span>
              </button>

              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key={result.matched ? result.matches.map((m) => m.symbol).join("-") : "fallback"}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-5"
                  >
                    {result.matched ? (
                      <>
                        {/* 매칭 상징 칩 + 카테고리 배지 */}
                        <div className="flex flex-wrap gap-2">
                          {result.matches.map((m) => (
                            <span
                              key={m.symbol}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-black text-white"
                            >
                              {m.symbol}
                              <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${CATEGORY_BADGE[m.category]}`}>
                                {m.category}
                              </span>
                            </span>
                          ))}
                        </div>

                        {/* 상징별 해석 */}
                        <div className="grid gap-4">
                          {result.matches.map((m) => (
                            <article key={m.symbol} className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
                              <div className="flex items-center justify-between gap-3 mb-3">
                                <h3 className="text-base font-black text-white">{m.symbol}</h3>
                                <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${CATEGORY_BADGE[m.category]}`}>
                                  {m.category}
                                </span>
                              </div>
                              <p className="text-sm leading-7 text-slate-200 break-keep">{m.meaning}</p>
                              <p className="mt-3 text-[13px] leading-6 text-emerald-300/90 break-keep">👉 {m.advice}</p>
                            </article>
                          ))}
                        </div>

                        {/* 조합 해석 */}
                        {result.comboInsights.length > 0 ? (
                          <div className="rounded-3xl border border-amber-400/25 bg-amber-500/10 p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <Combine className="w-4 h-4 text-amber-300" />
                              <h3 className="text-sm font-black tracking-[0.18em] uppercase text-amber-200">상징 조합 해석</h3>
                            </div>
                            <ul className="space-y-2">
                              {result.comboInsights.map((insight) => (
                                <li key={insight} className="text-sm leading-7 text-amber-100/90 break-keep">
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        {/* 종합 조언 */}
                        <div className="rounded-3xl border border-emerald-400/25 bg-emerald-500/10 p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-emerald-300" />
                            <h3 className="text-sm font-black tracking-[0.18em] uppercase text-emerald-200">종합 조언</h3>
                          </div>
                          <p className="text-sm leading-7 text-slate-100 break-keep">{result.generalAdvice}</p>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-center">
                        <SearchX className="w-6 h-6 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-sm font-black tracking-[0.18em] uppercase text-slate-300 mb-3">사전에 없는 상징이에요</h3>
                        <p className="text-sm leading-7 text-slate-300 break-keep">{result.fallbackMessage}</p>
                        <p className="mt-3 text-[13px] leading-6 text-emerald-300/90 break-keep">{result.generalAdvice}</p>
                      </div>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {status ? <p className="mt-4 text-sm text-emerald-300 text-center font-bold tracking-widest uppercase animate-pulse">{status}</p> : null}
          </section>
        </ScrollReveal>

        {history.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-lg font-black mb-3">최근 해석 기록</h2>
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div key={`${item}-${idx}`} className="p-4 rounded-2xl border border-white/10 bg-slate-900/45 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
