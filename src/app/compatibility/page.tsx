"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown, Heart, Copy, Sparkles, Users, ArrowLeft,
  ChevronRight, Zap, Loader2, UserPlus, AlertTriangle,
  Star, MessageCircle, TrendingUp, RefreshCw, User as UserIcon
} from "lucide-react";
import Link from "next/link";

import { calculateHighPrecisionSaju, type HighPrecisionSajuResult } from "@/core/api/saju-engine";
import { analyzeRelationship, RelationshipAnalysis } from "@/lib/compatibility";
import { RelationshipType as ProfileRelationshipType } from "@/types/schema";
import { useProfiles } from "@/components/ProfileProvider";
import { useWallet } from "@/components/WalletProvider";
import JellyBalance from "@/components/shop/JellyBalance";
import { useLocale } from "@/lib/i18n";
import ElementPolygon from "@/components/ui/ElementPolygon";
import LuxuryToast from "@/components/ui/LuxuryToast";
import LoveScoreCounter from "@/components/compatibility/LoveScoreCounter";
import RelationshipRadar from "@/components/compatibility/RelationshipRadar";
import { cn } from "@/lib/utils";
import { parseCivilDate } from "@/lib/civil-date";

const RELATIONSHIP_PRESETS: { labelKey: string; value: ProfileRelationshipType; icon: string }[] = [
  { labelKey: "common.relation.lover", value: "lover", icon: "💕" },
  { labelKey: "common.relation.spouse", value: "spouse", icon: "💍" },
  { labelKey: "common.relation.friend", value: "friend", icon: "🤝" },
  { labelKey: "common.relation.parent", value: "parent", icon: "👩‍👧‍👦" },
  { labelKey: "common.relation.other", value: "other", icon: "💼" },
  { labelKey: "common.relation.other", value: "other", icon: "✨" },
];

const GRADE_CONFIG = {
  best: { icon: "🏆", label: "최상", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20 shadow-amber-950/20" },
  good: { icon: "💎", label: "우수", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20 shadow-emerald-950/20" },
  normal: { icon: "⭐", label: "보통", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20 shadow-blue-950/20" },
  caution: { icon: "⚠️", label: "주의", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20 shadow-orange-950/20" },
  low: { icon: "❗", label: "부족", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20 shadow-rose-950/20" },
};

function CompatibilityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLocale();
  const { profiles, activeProfile } = useProfiles();
  const { consumeChuru, churu, isAdmin } = useWallet();

  const [personAId, setPersonAId] = useState("");
  const [personBId, setPersonBId] = useState("");
  const [selectedRelationType, setSelectedRelationType] = useState<ProfileRelationshipType>("lover");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RelationshipAnalysis | null>(null);
  const [sajuA, setSajuA] = useState<HighPrecisionSajuResult | null>(null);
  const [sajuB, setSajuB] = useState<HighPrecisionSajuResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Initial targeting from active profile or params
  useEffect(() => {
    const queryProfileId = searchParams?.get("profileId");
    if (queryProfileId) {
      setPersonAId(queryProfileId);
    } else if (activeProfile) {
      setPersonAId(activeProfile.id);
    }
  }, [activeProfile, searchParams]);

  useEffect(() => {
    if (!result) { setAnimatedScore(0); return; }
    let frame: number;
    let start: number | null = null;
    const duration = 1500;
    const target = result.score;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [result]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const personA = profiles.find(p => p.id === personAId);
    const personB = profiles.find(p => p.id === personBId);

    if (!personA || !personB) {
      setError(t("compat.selectBothError"));
      return;
    }
    if (personA.id === personB.id) {
      setError(t("compat.samePersonError"));
      return;
    }

    if (!isAdmin && churu < 30) {
      setToastMsg("궁합 정밀 분석에는 30 젤리가 필요합니다.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setLoading(true);
    consumeChuru(30);

    const parseBirth = (dateStr: string) => parseCivilDate(dateStr) ?? new Date(1990, 0, 1, 12, 0, 0, 0);

    setTimeout(async () => {
      try {
        const hpA = await calculateHighPrecisionSaju({
          birthDate: parseBirth(personA.birthdate),
          birthTime: personA.birthTime || "12:00",
          gender: personA.gender === "male" ? "M" : "F",
          calendarType: personA.calendarType,
        });
        const hpB = await calculateHighPrecisionSaju({
          birthDate: parseBirth(personB.birthdate),
          birthTime: personB.birthTime || "12:00",
          gender: personB.gender === "male" ? "M" : "F",
          calendarType: personB.calendarType,
        });
        setSajuA(hpA);
        setSajuB(hpB);
        setResult(analyzeRelationship(hpA, hpB, selectedRelationType));
      } catch (err) {
        console.error(err);
        setError("분석 처리 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  const selectedPersonA = profiles.find(p => p.id === personAId);
  const selectedPersonB = profiles.find(p => p.id === personBId);
  const gradeInfo = result ? GRADE_CONFIG[result.grade] : null;

  if (profiles.length < 2) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 pb-40">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center space-y-10">
          <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-2xl">
            <Users className="w-12 h-12 text-indigo-400" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">{t("compat.noProfiles")}</h2>
            <p className="text-sm text-slate-500 font-bold leading-relaxed">{t("compat.noProfilesDesc")}</p>
          </div>
          <div className="space-y-4 pt-8">
            <Link href="/my-saju/add" className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black uppercase italic tracking-widest text-xs shadow-xl shadow-indigo-950/20 hover:scale-105 transition-all flex items-center justify-center gap-3">
              <UserPlus className="w-5 h-5" /> {t("compat.addProfile")}
            </Link>
            <button onClick={() => router.back()} className="w-full py-5 rounded-2xl bg-white/5 text-slate-400 border border-white/10 font-black uppercase italic tracking-widest text-[10px] hover:bg-white/10 transition-all">
              {t("common.back")}
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden pb-40 font-sans">
      <LuxuryToast message={toastMsg} isVisible={showToast} />

      {/* Ambient Atmosphere */}
      <div className="absolute inset-x-0 top-0 h-[60dvh] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
              <Heart className="w-3 h-3" /> 관계 궁합 분석
            </div>
            <h1 className="ui-title">{t("compat.title")}</h1>
          </div>
          <JellyBalance />
        </header>

        <form onSubmit={handleSubmit} className="space-y-16">
          {/* Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Person A */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic flex items-center gap-3">
                <span className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[8px] font-black italic shadow-inner">01</span>
                {t("compat.person1")}
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar snap-x">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersonAId(p.id)}
                    className={cn(
                      "flex-shrink-0 w-32 p-6 rounded-[2.5rem] border transition-all text-center snap-center relative",
                      personAId === p.id
                        ? "bg-indigo-600/20 border-indigo-500 scale-105 shadow-[0_0_30px_rgba(79,70,229,0.2)]"
                        : "bg-white/5 border-white/5 opacity-50 hover:bg-white/10 hover:opacity-80"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center", personAId === p.id ? "bg-indigo-500 text-white" : "bg-white/10 text-slate-500")}>
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-black italic text-white truncate">{p.name}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t(`common.relation.${p.relationship}`)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Person B */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic flex items-center gap-3">
                <span className="w-5 h-5 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-[8px] font-black italic shadow-inner">02</span>
                {t("compat.person2")}
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar snap-x">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersonBId(p.id)}
                    className={cn(
                      "flex-shrink-0 w-32 p-6 rounded-[2.5rem] border transition-all text-center snap-center relative",
                      personBId === p.id
                        ? "bg-purple-600/20 border-purple-500 scale-105 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                        : "bg-white/5 border-white/5 opacity-50 hover:bg-white/10 hover:opacity-80"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center", personBId === p.id ? "bg-purple-500 text-white" : "bg-white/10 text-slate-500")}>
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-black italic text-white truncate">{p.name}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t(`common.relation.${p.relationship}`)}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Relation Presets */}
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-[4rem] p-10 shadow-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 text-center italic">관계 타입 선택</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {RELATIONSHIP_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setSelectedRelationType(preset.value)}
                  className={cn(
                    "py-6 rounded-3xl text-center transition-all border flex flex-col items-center gap-2",
                    selectedRelationType === preset.value
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-xl scale-105"
                      : "bg-black/20 border-white/5 text-slate-500 hover:border-white/10"
                  )}
                >
                  <span className="text-2xl">{preset.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-tighter italic">{t(preset.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-4 text-xs font-black uppercase tracking-widest italic animate-bounce">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !personAId || !personBId}
            className="w-full py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase italic tracking-[0.3em] text-sm shadow-xl shadow-indigo-950/20 transition-all flex items-center justify-center gap-4 disabled:opacity-40 active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" /> 30젤리로 궁합 계산</>}
          </button>
        </form>

        <AnimatePresence>
          {result && gradeInfo && (
            <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} className="mt-24 space-y-12">
              {/* Score Card */}
              <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[5rem] p-16 text-center border border-indigo-500/20 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                <div className="space-y-4 mb-16">
                  <div className={cn("inline-flex items-center gap-3 px-6 py-2 rounded-full text-xs font-black italic tracking-widest border border-white/5 shadow-lg shadow-black/20 uppercase", gradeInfo.color, gradeInfo.bg)}>
                    <Sparkles className="w-4 h-4" /> {gradeInfo.label}
                  </div>
                  <h2 className="text-2xl font-black text-slate-500 uppercase tracking-[0.4em] italic">시너지 지수</h2>
                </div>

                <div className="mb-16">
                  <LoveScoreCounter targetScore={result.score} />
                </div>

                <div className="space-y-6 max-w-2xl mx-auto">
                  <p className="text-3xl font-black text-white tracking-tighter italic leading-tight">&ldquo;{result.message}&rdquo;</p>
                  <p className="text-lg font-bold text-slate-400 italic leading-relaxed">{result.chemistry}</p>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 space-y-4">
                  <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest border-b border-white/10 pb-2 italic">힘의 흐름</h4>
                  <p className="text-xl font-black text-white italic">{result.powerDynamic}</p>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 space-y-4">
                  <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest border-b border-white/10 pb-2 italic">화합 포인트</h4>
                  <p className="text-lg font-bold text-slate-300 italic">{result.advice}</p>
                </div>
              </div>

              {sajuA && sajuB && (
                <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[4rem] p-12 border border-white/5 space-y-12">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] text-center italic">오행 공명 분석</h4>

                  {/* Pinpoint HD resonance Bridge & Radar overlay */}
                  <div className="flex flex-col md:flex-row items-center justify-around gap-16 relative z-10">
                    <motion.div
                      className="space-y-6 text-center"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="relative group">
                        <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                        <ElementPolygon
                          scores={[sajuA.elements.scores.목, sajuA.elements.scores.화, sajuA.elements.scores.토, sajuA.elements.scores.금, sajuA.elements.scores.수]}
                          size={220}
                        />
                      </div>
                      <p className="text-xs font-black text-indigo-400 uppercase tracking-widest italic">{selectedPersonA?.name}</p>
                    </motion.div>

                    <div className="relative w-full md:w-32 h-20 md:h-auto flex items-center justify-center">
                      <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible hidden md:block">
                        <motion.path
                          d="M -10 20 Q 50 20 110 20"
                          fill="none"
                          stroke="url(#resonance-gradient)"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          animate={{ strokeDashoffset: [0, -20] }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <defs>
                          <linearGradient id="resonance-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="p-4 bg-indigo-500/20 rounded-full border border-indigo-500/40 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.4)]"
                      >
                        <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
                      </motion.div>
                    </div>

                    <motion.div
                      className="space-y-6 text-center"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    >
                      <div className="relative group">
                        <div className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                        <ElementPolygon
                          scores={[sajuB.elements.scores.목, sajuB.elements.scores.화, sajuB.elements.scores.토, sajuB.elements.scores.금, sajuB.elements.scores.수]}
                          size={220}
                        />
                      </div>
                      <p className="text-xs font-black text-purple-400 uppercase tracking-widest italic">{selectedPersonB?.name}</p>
                    </motion.div>
                  </div>

                  {/* 6.1 Compatibility Radar Chart (Combined) */}
                  <div className="pt-12 border-t border-white/5 text-center">
                    <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-12 italic">Ultimate Synergy Radar</h5>
                    <RelationshipRadar />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`[SecretSaju] ${selectedPersonA?.name} ♥ ${selectedPersonB?.name} : ${result.score}% 궁합점수`);
                    setToastMsg("결과가 복사되었습니다!");
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 2000);
                  }}
                  className="py-6 rounded-2xl bg-white/5 border border-white/5 text-slate-400 font-black uppercase italic tracking-widest text-[10px] hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <Copy className="w-4 h-4" /> 결과 복사
                </button>
                <button
                  onClick={() => { setResult(null); setPersonAId(""); setPersonBId(""); }}
                  className="py-6 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-black uppercase italic tracking-widest text-[10px] hover:bg-indigo-600/20 transition-all flex items-center justify-center gap-3"
                >
                  <RefreshCw className="w-4 h-4" /> 다시 분석
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function CompatibilityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-6">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-indigo-500" strokeWidth={1} />
          <p className="text-slate-500 font-black tracking-[0.4em] uppercase text-[10px]">관계 분석 채널 연결 중...</p>
        </div>
      </div>
    }>
      <CompatibilityContent />
    </Suspense>
  );
}
