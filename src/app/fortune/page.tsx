"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDayPillarIndex } from "@/lib/saju";
import { getYearlyFortune } from "@/lib/yearlyFortune";
import { validateBirthInput } from "@/lib/validation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Sparkles, Star, TrendingUp, Heart, Briefcase,
  DollarSign, Activity, Loader2, ChevronRight,
  ArrowLeft, History, Calculator, Target, Zap,
  CalendarDays, Trophy, Orbit, BarChart3,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n";
import { getProfiles } from "@/lib/storage";
import SvgChart from "@/components/ui/SvgChart";
import KakaoShareButton from "@/components/share/KakaoShareButton";

type ScoreMetric = {
  label: string; score: number;
  color: string; gradient: string;
  icon: React.ComponentType<React.ComponentProps<"svg">>;
};

const YEARS = [2025, 2026, 2027, 2028];

function ScoreBar({ label, score, gradient, icon: Icon, delay = 0 }: ScoreMetric & { delay?: number }) {
  const pct = `${score}%`;
  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }} className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-xl font-black text-white italic">{score}</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: pct }}
          transition={{ duration: 1.4, delay, ease: "easeOut" }}
          className={cn("h-full bg-gradient-to-r rounded-full", gradient)}
        />
      </div>
    </motion.div>
  );
}

function MonthBar({ score, month, peak }: { score: number; month: number; peak: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 group/m">
      <div className="relative w-full flex items-end justify-center h-32">
        {peak && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black text-amber-400">
            <Trophy className="w-3 h-3" />
          </div>
        )}
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: `${score}%` }}
          viewport={{ once: true }}
          transition={{ delay: month * 0.04, duration: 0.9, ease: "easeOut" }}
          className={cn("w-9 rounded-t-2xl", peak ? "bg-gradient-to-t from-indigo-600 to-amber-500 shadow-lg shadow-amber-500/20" : "bg-gradient-to-t from-slate-800 to-slate-600")}
        />
        <span className="absolute bottom-full mb-1 text-[9px] font-black text-slate-500 opacity-0 group-hover/m:opacity-100 transition-opacity">
          {score}
        </span>
      </div>
      <span className="text-[10px] font-black text-slate-600">{month}월</span>
    </div>
  );
}

function FortuneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLocale();
  const [profileId, setProfileId] = useState("");
  const [profileName, setProfileName] = useState("운명");
  const [year, setYear] = useState(2026);
  const [yearInput, setYearInput] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof getYearlyFortune> | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const id = searchParams?.get("profileId");
    if (!id) return;
    setProfileId(id);
    const p = getProfiles().find((x) => x.id === id);
    if (p) {
      const d = new Date(p.birthdate);
      setYearInput(String(d.getFullYear()));
      setMonth(String(d.getMonth() + 1));
      setDay(String(d.getDate()));
      setProfileName(p.name || "운명");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!result) return;
    const target = result.scores.total;
    let cur = 0;
    const step = () => { cur = Math.min(cur + 2, target); setAnimatedScore(cur); if (cur < target) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, [result]);

  const handleCalculate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const v = validateBirthInput({ year: Number(yearInput), month: Number(month), day: Number(day) });
    if (!v.ok) { setError(v.message || "입력 오류"); return; }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const idx = getDayPillarIndex(new Date(Number(yearInput), Number(month) - 1, Number(day)));
      setResult(getYearlyFortune(idx, year));
      setAnimatedScore(0);
    } catch {
      setError("데이터 산출 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [yearInput, month, day, year]);

  const scoreMetrics: ScoreMetric[] = result ? [
    { label: t("fortune.total"), score: result.scores.total, color: "text-indigo-400", gradient: "from-indigo-500 to-purple-600", icon: Star },
    { label: t("fortune.love"), score: result.scores.love, color: "text-rose-400", gradient: "from-rose-400 to-pink-600", icon: Heart },
    { label: t("fortune.wealth"), score: result.scores.money, color: "text-emerald-400", gradient: "from-emerald-400 to-teal-600", icon: DollarSign },
    { label: t("fortune.work"), score: result.scores.work, color: "text-blue-400", gradient: "from-blue-400 to-indigo-600", icon: Briefcase },
    { label: t("fortune.health"), score: result.scores.health, color: "text-amber-400", gradient: "from-amber-400 to-orange-600", icon: Activity },
  ] : [];

  const peakMonth = result ? result.monthlyTrend.indexOf(Math.max(...result.monthlyTrend)) : -1;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-40">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]" style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
      </div>

      <div className="max-w-3xl mx-auto px-5 py-10 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <button onClick={() => router.back()}
            className="w-11 h-11 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-all group">
            <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black text-white">{year}년 연간 운세</h1>
            <p className="text-[10px] font-black text-indigo-300 tracking-[0.3em] uppercase mt-0.5">Year Fortune Analysis</p>
          </div>
          <div className="w-11 h-11" />
        </header>

        {/* Input Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCalculate}
          className="rounded-[2.5rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          <div className="space-y-8">
            {/* Year Selector */}
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4" htmlFor="year-selector">
                <Target className="w-4 h-4 text-indigo-400" />
                분석 연도
              </label>
              <div id="year-selector" role="group" aria-label="연도 선택" className="grid grid-cols-4 gap-3">
                {YEARS.map((y) => (
                  <button key={y} type="button" onClick={() => setYear(y)}
                    className={cn("py-4 rounded-2xl text-sm font-black transition-all border",
                      year === y
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/25 scale-105"
                        : "bg-white/5 border-white/8 text-slate-400 hover:border-indigo-500/30 hover:text-white"
                    )}>
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Birth Input */}
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                <History className="w-4 h-4 text-indigo-400" />
                생년월일
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: yearInput, set: (v: string) => setYearInput(v), ph: "YYYY", id: "birth-year", max: 4 },
                  { val: month, set: (v: string) => setMonth(v), ph: "MM", id: "birth-month", max: 2 },
                  { val: day, set: (v: string) => setDay(v), ph: "DD", id: "birth-day", max: 2 },
                ].map((inp) => (
                  <div key={inp.id}>
                    <label htmlFor={inp.id} className="sr-only">{inp.ph}</label>
                    <input id={inp.id} type="number" placeholder={inp.ph} value={inp.val}
                      onChange={(e) => inp.set(e.target.value)} maxLength={inp.max}
                      autoComplete="off"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white text-center font-black text-xl focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-700"
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div role="alert" className="text-sm text-rose-400 border border-rose-500/20 bg-rose-500/8 rounded-xl px-4 py-3 font-bold">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !yearInput || !month || !day}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-base tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:scale-100">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
              {loading ? "분석 중..." : `${year}년 운세 분석`}
            </button>
          </div>
        </motion.form>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

              {/* Summary hero */}
              <div className="rounded-[2.5rem] border border-indigo-500/20 bg-slate-900/60 backdrop-blur-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
                <div className="absolute top-4 right-6">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {result.pillarName}
                  </span>
                </div>
                {/* Score display */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/25">
                    <span className="text-2xl font-black text-white">{animatedScore}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-1">종합 운세 점수</p>
                    <h2 className="text-2xl font-black text-white italic">{result.summary}</h2>
                  </div>
                </div>
                <div className="h-0.5 bg-gradient-to-r from-indigo-500/50 to-transparent w-24 mb-5 rounded-full" />
                <p className="text-slate-300 leading-relaxed text-sm">{result.detail}</p>
              </div>

              {/* Score bars */}
              <div className="rounded-[2.5rem] border border-white/8 bg-white/[0.02] p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">운세 수치</h3>
                  </div>
                </div>
                <div className="flex justify-center mb-8">
                  <SvgChart
                    data={scoreMetrics.map((s) => ({ label: s.label, value: s.score }))}
                    size={220} accentColor="#6366f1" animDelay={0.3}
                  />
                </div>
                <div className="space-y-6">
                  {scoreMetrics.map((s, i) => <ScoreBar key={s.label} {...s} delay={i * 0.1} />)}
                </div>
              </div>

              {/* Monthly Trend */}
              <div className="rounded-[2.5rem] border border-white/8 bg-white/[0.02] p-8">
                <div className="flex items-center gap-2.5 mb-6">
                  <CalendarDays className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">{year}년 월별 흐름</h3>
                  {peakMonth >= 0 && (
                    <span className="ml-auto text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      {peakMonth + 1}월 최고
                    </span>
                  )}
                </div>
                <div className="overflow-x-auto no-scrollbar">
                  <div className="flex gap-3 min-w-[640px] items-end pb-2">
                    {result.monthlyTrend.map((score: number, i: number) => (
                      <MonthBar key={i} score={score} month={i + 1} peak={i === peakMonth} />
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link href={`/dashboard?profileId=${profileId}`}
                className="flex items-center justify-between p-6 rounded-[2rem] border border-white/8 bg-white/[0.02] hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-white">대시보드에서 상세 운세 보기</p>
                    <p className="text-xs text-slate-500 mt-0.5">대운, 세운, 격국 분석 포함</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </Link>

              {/* Share */}
              <div className="flex justify-center">
                <KakaoShareButton
                  title={`${year}년 연간 운세 분석`}
                  description="시크릿사주에서 나의 연간 운세를 확인해 보세요!"
                  score={result?.scores?.total}
                  profileName={profileName}
                  pillar={result?.pillarName}
                  className="flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-[#FEE500] text-black font-black text-sm hover:bg-[#FDD800] transition-all shadow-lg hover:-translate-y-0.5"
                />
              </div>

              {/* Brand */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <Orbit className="w-3 h-3 text-indigo-500/30" />
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-600 font-black">Secret Saju</p>
                <Orbit className="w-3 h-3 text-indigo-500/30" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function FortunePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
          <p className="text-slate-500 font-black tracking-[0.4em] uppercase text-[10px]">로딩 중...</p>
        </div>
      </div>
    }>
      <FortuneContent />
    </Suspense>
  );
}
