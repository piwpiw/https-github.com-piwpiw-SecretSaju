"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDayPillarIndex } from "@/lib/saju";
import { getYearlyFortune } from "@/lib/yearlyFortune";
import { validateBirthInput } from "@/lib/validation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Star,
  TrendingUp,
  Heart,
  Briefcase,
  DollarSign,
  Activity,
  Loader2,
  ChevronRight,
  ArrowLeft,
  History,
  Calculator,
  Target,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n";
import { getProfiles } from "@/lib/storage";
import SvgChart from "@/components/ui/SvgChart";
import KakaoShareButton from "@/components/share/KakaoShareButton";

type ScoreMetric = {
  label: string;
  score: number;
  color: string;
  icon: React.ComponentType<React.ComponentProps<"svg">>;
};

const YEARS = [2025, 2026, 2027, 2028];

const FORTUNE_ICONS = [TrendingUp, Heart, DollarSign, Briefcase, Activity];
const FORTUNE_COLORS = [
  "from-yellow-400 to-amber-500",
  "from-pink-400 to-rose-500",
  "from-green-400 to-emerald-500",
  "from-blue-400 to-indigo-500",
  "from-purple-400 to-violet-500",
];

function FortuneScoreBar({
  label,
  score,
  color,
  icon: Icon,
  delay = 0,
}: ScoreMetric & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-3"
    >
      <div className="flex justify-between items-end px-1">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/10")}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-black text-slate-300 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-2xl font-black text-white italic tracking-tighter">{score}</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, delay, ease: "easeOut" }}
          className={cn("h-full bg-gradient-to-r", color)}
        />
      </div>
    </motion.div>
  );
}

function FortuneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLocale();
  const [profileId, setProfileId] = useState("");
  const [year, setYear] = useState(2025);
  const [yearInput, setYearInput] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const id = searchParams?.get("profileId");
    if (id) {
      setProfileId(id);
      const profiles = getProfiles();
      const p = profiles.find((x) => x.id === id);
      if (p) {
        const date = new Date(p.birthdate);
        setYearInput(String(date.getFullYear()));
        setMonth(String(date.getMonth() + 1));
        setDay(String(date.getDate()));
      }
    }
  }, [searchParams]);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validation = validateBirthInput({
      year: Number(yearInput),
      month: Number(month),
      day: Number(day)
    });
    if (!validation.ok) {
      setError(validation.message || '입력 오류');
      return;
    }

    setLoading(true);
    try {
      // Small artificial delay for premium feel
      await new Promise((r) => setTimeout(r, 1200));

      const dayIndex = getDayPillarIndex(
        new Date(Number(yearInput), Number(month) - 1, Number(day))
      );
      const fortune = getYearlyFortune(dayIndex, year);
      setResult(fortune);
    } catch (err) {
      setError("데이터 산출 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const scoreMetrics: ScoreMetric[] = result
    ? [
      { label: t("fortune.total"), score: result.scores.total, color: "from-indigo-500 to-purple-600", icon: Star },
      { label: t("fortune.love"), score: result.scores.love, color: FORTUNE_COLORS[1], icon: Heart },
      { label: t("fortune.wealth"), score: result.scores.money, color: FORTUNE_COLORS[2], icon: DollarSign },
      { label: t("fortune.work"), score: result.scores.work, color: FORTUNE_COLORS[3], icon: Briefcase },
      { label: t("fortune.health"), score: result.scores.health, color: FORTUNE_COLORS[4], icon: Activity },
    ]
    : [];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.15),transparent_70%)]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <header className="flex items-center justify-between mb-8 sm:mb-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">{t("common.back")}</span>
          </button>
          <div className="text-center">
            <h1 className="ui-title">
              {year} {t("fortune.yearly.title")}
            </h1>
            <p className="text-[10px] font-black text-indigo-300 tracking-[0.3em] uppercase">연간 운세 분석 리포트</p>
          </div>
          <div className="w-10 h-10" /> {/* Spacer */}
        </header>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCalculate}
          className="panel-shell rounded-3xl sm:rounded-[3.5rem] p-6 sm:p-10 md:p-14 border border-white/10 shadow-2xl mb-12 sm:mb-16 relative group overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-40 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="grid grid-cols-1 gap-10">
            <div className="space-y-4 sm:space-y-6">
              <label className="text-lg sm:text-xl font-black flex items-center gap-3 text-foreground">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                {t("input.target_year")}
              </label>
              <div className="grid grid-cols-4 gap-4">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYear(y)}
                    className={`py-3 sm:py-5 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-black transition-all border ${year === y
                      ? "bg-primary border-primary text-white shadow-xl scale-105"
                      : "bg-background text-secondary border-white/20 hover:border-primary/40"
                      }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <label className="text-lg sm:text-xl font-black flex items-center gap-3 text-foreground">
                <History className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                {t("input.title")}
              </label>
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                {[
                  { val: yearInput, set: setYearInput, ph: t("input.year") },
                  { val: month, set: setMonth, ph: t("input.month") },
                  { val: day, set: setDay, ph: t("input.day") },
                ].map((input, idx) => (
                  <input
                    key={idx}
                    type="number"
                    placeholder={input.ph}
                    value={input.val}
                    onChange={(e) => input.set(e.target.value)}
                    className="bg-background border border-border-color rounded-2xl sm:rounded-3xl px-4 py-4 sm:px-6 sm:py-6 text-foreground text-center font-black text-lg sm:text-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all italic"
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="text-sm text-rose-400 border border-rose-500/20 bg-rose-500/10 rounded-2xl px-5 py-4 font-black uppercase tracking-[0.24em]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !yearInput || !month || !day}
              className="w-full py-5 sm:py-8 rounded-3xl sm:rounded-4xl bg-primary hover:bg-primary/90 text-white font-black text-lg sm:text-2xl tracking-[0.1em] sm:tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 sm:gap-4 disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" /> : <Calculator className="w-6 h-6 sm:w-8 sm:h-8" />}
              {loading
                ? (locale === "ko" ? "분석 중..." : "Analyzing...")
                : (locale === "ko"
                  ? `${year}년 운세 분석`
                  : `${year} Yearly Readout`)}
            </button>
          </div>
        </motion.form>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <div className="bg-surface rounded-3xl sm:rounded-5xl p-8 sm:p-16 border border-primary/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 sm:p-8">
                  <span className="px-4 py-1.5 sm:px-6 sm:py-2 rounded-full text-sm sm:text-lg font-black bg-primary/10 text-primary border border-primary/20">
                    {result.pillarName}
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 fill-yellow-400" />
                  <span className="text-base sm:text-xl font-black text-secondary tracking-[0.1em] sm:tracking-[0.2em] uppercase">메시지 해석</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground italic leading-tight mb-8 sm:mb-10 drop-shadow-xl">{result.summary}</h2>
                <div className="h-1.5 sm:h-2 bg-gradient-to-r from-primary to-transparent w-24 sm:w-32 mb-8 sm:mb-10 rounded-full" />
                <p className="text-lg sm:text-2xl text-secondary font-medium leading-relaxed tracking-tight">{result.detail}</p>
              </div>

              <div className="bg-surface rounded-3xl sm:rounded-5xl p-8 sm:p-16 border border-border-color">
                <div className="flex items-center gap-4 mb-8 sm:mb-10">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">운세 수치</h3>
                </div>

                <div className="flex justify-center mb-10">
                  <SvgChart
                    data={scoreMetrics.map((s) => ({ label: s.label, value: s.score }))}
                    size={240}
                    accentColor="#6366f1"
                    animDelay={0.3}
                  />
                </div>

                <div className="space-y-8">
                  {scoreMetrics.map((s, i) => (
                    <FortuneScoreBar key={s.label} {...s} delay={i * 0.1} />
                  ))}
                </div>
              </div>

              <div className="bg-surface rounded-5xl p-16 border border-border-color">
                <div className="flex items-center gap-4 mb-12">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                  <h3 className="text-2xl font-black text-foreground">{year}년 월별 흐름</h3>
                </div>
                <div className="overflow-x-auto no-scrollbar pb-6">
                  <div className="flex gap-4 min-w-[1000px] h-48 items-end px-4">
                    {result.monthlyTrend.map((score: number, i: number) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-4 group/month">
                        <div className="relative w-full flex items-end justify-center h-full">
                          <motion.div
                            initial={{ height: 0 }}
                            whileInView={{ height: `${score}%` }}
                            transition={{ delay: i * 0.05, duration: 1 }}
                            className={cn("w-12 rounded-2xl bg-gradient-to-t transition-all", score >= 80 ? "from-primary to-amber-500 shadow-lg shadow-primary/20" : "from-slate-800 to-slate-600")}
                          />
                          <div className="absolute -top-8 text-sm font-black text-primary opacity-0 group-hover/month:opacity-100 transition-opacity">
                            {score}
                          </div>
                        </div>
                        <span className="text-sm font-black text-secondary tracking-[0.16em]">{i + 1}월</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href={`/dashboard?profileId=${profileId}`}
                className="block bg-surface rounded-5xl p-12 border border-border-color group hover:border-primary/50 transition-all shadow-xl hover:shadow-primary/5"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="w-24 h-24 bg-background rounded-4xl flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-500 shadow-inner">
                    <Sparkles className="w-12 h-12" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-xl text-secondary mb-3 font-black">나의 상세한 운세를 확인해 보세요</p>
                    <div className="text-2xl font-black text-primary flex items-center justify-center md:justify-start gap-4">
                      {locale === "ko" ? "대시보드 이동" : "Go to Destiny Dashboard"}
                      <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
              {/* Share Section */}
              <div className="flex gap-4 justify-center mt-4">
                <KakaoShareButton
                  title={`${year}년 연간 운세 분석`}
                  description="시크릿사주에서 나의 연간 운세를 확인해 보세요!"
                  score={result?.scores?.total}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#FEE500] text-black font-black text-base hover:bg-[#FDD800] transition-all shadow-lg hover:-translate-y-0.5"
                />
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center space-y-6">
            <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
            <p className="text-slate-500 font-black tracking-[0.4em] uppercase text-xs">운세 데이터 로딩 중...</p>
          </div>
        </div>
      }
    >
      <FortuneContent />
    </Suspense>
  );
}
