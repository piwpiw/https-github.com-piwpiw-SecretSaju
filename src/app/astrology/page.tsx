"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, Sparkles, Star, Zap, User, Loader2 } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";
import { useProfiles } from "@/components/ProfileProvider";
import JellyBalance from "@/components/shop/JellyBalance";
import LuxuryToast from "@/components/ui/LuxuryToast";
import { cn } from "@/lib/utils";

import { ZodiacItem, ZODIACS } from "@/data/astrology-data";
import { Heart, Briefcase, TrendingUp, Sparkles as MagicWand } from "lucide-react";

export default function AstrologyPage() {
  const router = useRouter();
  const { consumeChuru, churu } = useWallet();
  const { profiles, activeProfile, setActiveProfileById } = useProfiles();

  const [selected, setSelected] = useState<ZodiacItem>(ZODIACS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ZodiacItem | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Auto-select zodiac based on active profile
  useEffect(() => {
    if (activeProfile?.birthdate) {
      const date = new Date(activeProfile.birthdate);
      const m = date.getMonth() + 1;
      const d = date.getDate();

      const matched = ZODIACS.find(z => {
        const [sm, sd, em, ed] = z.monthRange;
        if (sm === em) return m === sm && d >= sd && d <= ed;
        if (m === sm) return d >= sd;
        if (m === em) return d <= ed;
        return false;
      }) || (m === 12 && d >= 22 || m === 1 && d <= 19 ? ZODIACS.find(z => z.id === "capricorn") : null);

      if (matched) setSelected(matched);
    }
  }, [activeProfile]);

  const handleCalculate = () => {
    if (churu < 15) {
      setToastMsg("별자리 운세 리딩에는 15 젤리가 필요합니다.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    consumeChuru(15);
    setResult(selected);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden pb-40 font-sans">
      <LuxuryToast message={toastMsg} isVisible={showToast} />

      {/* Background Ambience */}
      <div className="absolute inset-x-0 top-0 h-[60dvh] bg-gradient-to-b from-blue-900/30 via-indigo-900/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <header className="flex items-center justify-between mb-16">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex items-center gap-4">
            <button className="text-slate-500 hover:text-white transition-colors"><Share2 className="w-5 h-5" /></button>
            <JellyBalance />
          </div>
        </header>

        <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
            <Star className="w-3 h-3" /> 천상 정렬
          </div>
          <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
            커스텀 <span className="text-blue-500">별자리</span> 운세
          </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic animate-pulse">
            당신의 운명은 별자리 안에 기록됩니다.
          </p>
        </div>

        {!result && !loading && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* Profile Selection */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Universal Node</h3>
                <div className="flex gap-2">
                  {profiles.slice(0, 4).map(p => (
                    <button
                      key={p.id}
                      onClick={() => setActiveProfileById(p.id)}
                      className={cn(
                        "w-8 h-8 rounded-xl border flex items-center justify-center transition-all",
                        activeProfile?.id === p.id
                          ? "bg-blue-600 border-blue-400 scale-110 shadow-lg"
                          : "bg-white/5 border-white/10 opacity-40 hover:opacity-80"
                      )}
                    >
                      <User className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter mb-1">{activeProfile?.name}님 추천 천체</p>
                <span className="text-2xl font-black italic text-blue-200">{selected.name}</span>
                <span className="text-[10px] text-slate-500 ml-2">({selected.dates})</span>
              </div>
            </div>

            {/* Zodiac Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-w-3xl mx-auto">
              {ZODIACS.map((z) => (
                <button
                  key={z.id}
                  onClick={() => setSelected(z)}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-3xl border transition-all group",
                    selected.id === z.id
                      ? "bg-blue-600/20 border-blue-500/50 scale-105 shadow-xl"
                      : "bg-white/5 border-white/5 hover:bg-white/10"
                  )}
                >
                  <span className={cn("text-3xl mb-2 transition-transform group-hover:scale-110", selected.id === z.id ? "grayscale-0" : "grayscale opacity-40 group-hover:opacity-100")}>
                    {z.emoji}
                  </span>
                  <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white">{z.name}</span>
                </button>
              ))}
            </div>

            {/* Free vs Premium Highlight UI */}
            <div className="bg-white/5 rounded-3xl p-6 lg:p-8 space-y-5 border border-rose-500/20 shadow-inner mb-8 relative z-10 max-w-xl mx-auto">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-rose-500" /> 이용 비용
                </span>
                <span className="text-sm font-black flex items-center gap-2 text-rose-400 italic tracking-widest bg-rose-500/10 px-3 py-1.5 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> 15 Jelly
                </span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleCalculate}
                className="w-fit mx-auto px-10 py-5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 rounded-2xl border border-rose-400/50 shadow-[0_0_40px_rgba(244,63,94,0.3)] hover:shadow-[0_0_60px_rgba(244,63,94,0.5)] transition-all flex items-center gap-3 font-black text-lg uppercase tracking-widest italic text-white active:scale-95 group"
              >
                <Sparkles className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" /> 리딩 시작하기 (15 Jelly)
              </button>
            </div>
          </motion.div>
        )}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
              <Loader2 className="w-28 h-28 text-blue-500 animate-spin" strokeWidth={1} />
              <Star className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-blue-300 animate-pulse" />
            </div>
            <h3 className="mt-12 text-2xl font-black uppercase italic tracking-[0.2em] text-blue-200 animate-pulse">별자리 경로 계산 중...</h3>
            <p className="mt-2 text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">천체 영향력을 정렬하고 있습니다</p>
          </motion.div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
            <div className="bg-slate-900/60 backdrop-blur-2xl border border-blue-500/20 rounded-[4rem] p-10 sm:p-14 relative overflow-hidden shadow-2xl text-center">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -mr-40 -mt-40" />

              <div className="relative z-10 mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-300 font-black mb-10 tracking-[0.3em] text-[10px] uppercase">
                  <Sparkles className="w-3.5 h-3.5" /> 별자리 해석
                </div>
                <div className="text-7xl mb-6">{result.emoji}</div>
                <h1 className="text-4xl font-black mb-4 text-white tracking-tighter uppercase italic">
                  {result.name}
                </h1>
                <p className="text-lg font-bold text-blue-400 italic mb-8">({result.dates})</p>

                <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] text-left space-y-8">
                  <div>
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">
                      <Star className="w-3.5 h-3.5" /> 천체 요약
                    </h4>
                    <p className="text-2xl font-black text-white leading-tight italic tracking-tight mb-4 shadow-sm">
                      &ldquo;{result.summary}&rdquo;
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed font-bold opacity-90">
                      {result.detail}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                    <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-rose-400" />
                        <span className="text-[10px] font-black uppercase text-rose-400 tracking-widest">사랑과 관계</span>
                      </div>
                      <p className="text-xs text-slate-300 font-bold leading-relaxed">{result.love}</p>
                    </div>
                    <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">재물 흐름</span>
                      </div>
                      <p className="text-xs text-slate-300 font-bold leading-relaxed">{result.wealth}</p>
                    </div>
                    <div className="bg-black/20 rounded-2xl p-5 border border-white/5 col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">직업과 사명</span>
                      </div>
                      <p className="text-xs text-slate-300 font-bold leading-relaxed">{result.career}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <div className="flex-1 bg-gradient-to-br from-blue-900/30 to-indigo-900/10 rounded-2xl p-4 border border-blue-500/20 text-center">
                      <span className="block text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1">행운의 색</span>
                      <div className="text-sm font-black text-white italic">{result.luckyColor}</div>
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-blue-900/30 to-indigo-900/10 rounded-2xl p-4 border border-blue-500/20 text-center">
                      <span className="block text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1">행운의 숫자</span>
                      <div className="text-xl font-black text-white italic drop-shadow-md">{result.luckyNumber}</div>
                    </div>
                    {result.planet && (
                      <div className="flex-1 bg-gradient-to-br from-purple-900/30 to-indigo-900/10 rounded-2xl p-4 border border-purple-500/20 text-center">
                        <span className="block text-[9px] text-purple-400 font-black uppercase tracking-widest mb-1">통치 행성</span>
                        <div className="text-sm font-black text-white italic">{result.planet}</div>
                      </div>
                    )}
                  </div>

                  {result.element && (
                    <div className="grid grid-cols-3 gap-3 pt-4">
                      {[
                        { label: "Element", value: result.element, color: "text-amber-400" },
                        { label: "Mode", value: result.mode || "-", color: "text-emerald-400" },
                        { label: "Polarity", value: result.polarity || "-", color: "text-rose-400" },
                      ].map((meta) => (
                        <div key={meta.label} className="bg-black/20 rounded-2xl p-3 border border-white/5 text-center">
                          <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${meta.color}`}>{meta.label}</div>
                          <div className="text-xs font-black text-white">{meta.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 운세 점수 바 */}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Cosmic Influence Scores</div>
                    {[
                      { label: "사랑 (Love)", value: 50 + (result.luckyNumber * 7) % 45, color: "bg-rose-500" },
                      { label: "재물 (Wealth)", value: 55 + (result.luckyNumber * 11) % 40, color: "bg-amber-500" },
                      { label: "건강 (Health)", value: 60 + (result.luckyNumber * 3) % 35, color: "bg-emerald-500" },
                      { label: "커리어 (Career)", value: 50 + (result.luckyNumber * 13) % 45, color: "bg-blue-500" },
                    ].map((s, i) => (
                      <div key={s.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-slate-400">{s.label}</span>
                          <span className="font-black text-white">{Math.min(99, s.value)}%</span>
                        </div>
                        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(99, s.value)}%` }}
                            transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className={`h-full rounded-full ${s.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setResult(null)}
                className="w-full py-5 bg-transparent border-2 border-white/5 rounded-2xl text-slate-500 hover:text-white hover:border-blue-500/30 transition-all font-black uppercase italic tracking-widest text-xs"
              >
                Scan Other Zodiacs
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
