"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDayPillarIndex } from "@/lib/saju";
import { getYearlyFortune } from "@/lib/yearlyFortune";
import { validateBirthInput } from "@/lib/validation";
import Link from "next/link";
import {
  Sparkles, Star, TrendingUp, Heart, Briefcase,
  DollarSign, Activity, Loader2, ChevronRight,
  ArrowLeft, History, Calculator, Target
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n";

const YEARS = [2025, 2026, 2027, 2028];

const FORTUNE_ICONS = [TrendingUp, Heart, DollarSign, Briefcase, Activity];
const FORTUNE_COLORS = [
  "from-yellow-400 to-amber-500",
  "from-pink-400 to-rose-500",
  "from-green-400 to-emerald-500",
  "from-blue-400 to-indigo-500",
  "from-purple-400 to-violet-500",
];

function FortuneScoreBar({ label, score, color, icon: Icon, delay }: {
  label: string; score: number; color: string; icon: any; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-8 group bg-surface p-6 rounded-3xl border border-border-color shadow-sm"
    >
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-xl group-hover:rotate-6 transition-transform`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-4">
          <span className="text-xl font-bold text-secondary">{label}</span>
          <span className="text-2xl font-black text-foreground">{score}%</span>
        </div>
        <div className="h-3 bg-background rounded-full overflow-hidden border border-border-color">
          <motion.div
            className={`h-full bg-gradient-to-r ${color} rounded-full`}
            initial={{ width: 0 }}
            whileInView={{ width: `${score}%` }}
            transition={{ duration: 1.5, delay: delay + 0.3, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function FortunePage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [year, setYear] = useState(2026);
  const [yearInput, setYearInput] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof getYearlyFortune> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const yi = parseInt(yearInput.trim(), 10);
    const mi = parseInt(month.trim(), 10);
    const di = parseInt(day.trim(), 10);
    if (Number.isNaN(yi) || Number.isNaN(mi) || Number.isNaN(di)) {
      setError(locale === 'ko' ? "입력 데이터가 올바르지 않습니다." : "Invalid input data.");
      return;
    }
    const v = validateBirthInput({ year: yi, month: mi, day: di });
    if (!v.ok) {
      setError(v.message);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const idx = getDayPillarIndex(v.birth);
      setResult(getYearlyFortune(idx, year));
      setLoading(false);
    }, 1200);
  };

  const getScores = () => {
    if (!result) return [];
    const base = result.pillarName.charCodeAt(0) + result.pillarName.charCodeAt(1);
    const labels = [
      t('fortune.overall'),
      t('fortune.love'),
      t('fortune.money'),
      t('fortune.career'),
      t('fortune.health')
    ];
    return labels.map((label, i) => ({
      label,
      score: Math.min(95, Math.max(45, ((base * (i + 3)) % 55) + 40)),
      color: FORTUNE_COLORS[i],
      icon: FORTUNE_ICONS[i],
    }));
  };

  return (
    <main className="min-h-screen relative overflow-hidden pb-32">
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-20 text-center">
          <button onClick={() => router.back()} className="flex items-center gap-3 text-lg font-bold text-secondary hover:text-foreground transition-all">
            <ArrowLeft className="w-6 h-6" /> {t('common.back')}
          </button>
          <div className="flex-1">
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex px-4 py-2 rounded-full mb-4 bg-surface border border-border-color">
              <span className="text-sm font-bold text-primary uppercase tracking-widest">{t('nav.fortune')}</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground italic tracking-tighter uppercase">{year} {t('nav.fortune')}</h1>
            <p className="text-xl mt-2 text-secondary font-medium">{locale === 'ko' ? '사주팔자 기반 데이터 분석' : 'Precise yearly Saju analysis'}</p>
          </div>
          <div className="w-24" />
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-surface rounded-5xl p-10 border border-border-color shadow-2xl mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-12">
            <div className="space-y-6">
              <label className="text-xl font-bold flex items-center gap-3 text-foreground">
                <Target className="w-6 h-6 text-primary" /> {locale === 'ko' ? '분석할 연도 선택' : 'Select Target Year'}
              </label>
              <div className="grid grid-cols-4 gap-4">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYear(y)}
                    className={`py-5 rounded-3xl text-xl font-black transition-all border ${year === y
                      ? "bg-primary border-primary text-white shadow-xl scale-105"
                      : "bg-background text-secondary border-neutral-800 hover:border-primary/40"
                      }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-xl font-bold flex items-center gap-3 text-foreground">
                <History className="w-6 h-6 text-primary" /> {t('input.title')}
              </label>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { val: yearInput, set: setYearInput, ph: t('input.year') },
                  { val: month, set: setMonth, ph: t('input.month') },
                  { val: day, set: setDay, ph: t('input.day') }
                ].map((input, idx) => (
                  <input
                    key={idx}
                    type="number"
                    placeholder={input.ph}
                    value={input.val}
                    onChange={(e) => input.set(e.target.value)}
                    className="bg-background border border-border-color rounded-3xl px-6 py-6 text-foreground text-center font-black text-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all italic"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !yearInput || !month || !day}
              className="w-full py-8 rounded-4xl text-white font-black text-2xl tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, var(--primary), #8b5cf6)' }}
            >
              {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <><Calculator className="w-8 h-8" /> {year}{locale === 'ko' ? '년 운세 분석하기' : ' Analysis'}</>}
            </button>
          </div>
        </motion.form>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <div className="bg-surface rounded-5xl p-16 border border-primary/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <span className="px-6 py-2 rounded-full text-lg font-black bg-primary/10 text-primary border border-primary/20">
                    {result.pillarName}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-10">
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                  <span className="text-xl font-black text-secondary tracking-widest uppercase">{locale === 'ko' ? '핵심 분석' : 'CORE ANALYSIS'}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-foreground italic leading-tight mb-10 drop-shadow-xl">{result.summary}</h2>
                <div className="h-2 bg-gradient-to-r from-primary to-transparent w-32 mb-10 rounded-full" />
                <p className="text-2xl text-secondary font-medium leading-relaxed tracking-tight">{result.detail}</p>
              </div>

              <div className="bg-surface rounded-5xl p-16 border border-border-color">
                <div className="flex items-center gap-4 mb-16">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-black text-foreground">{locale === 'ko' ? '운세 지표' : 'Fortune Indicators'}</h3>
                </div>
                <div className="space-y-8">
                  {getScores().map((s, i) => (
                    <FortuneScoreBar key={s.label} {...s} delay={i * 0.1} />
                  ))}
                </div>
              </div>

              <Link href="/dashboard" className="block bg-surface rounded-5xl p-12 border border-border-color group hover:border-primary/50 transition-all shadow-xl hover:shadow-primary/5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="w-24 h-24 bg-background rounded-4xl flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-500 shadow-inner">
                    <Sparkles className="w-12 h-12" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-xl text-secondary mb-3 font-bold">{locale === 'ko' ? '더 자세한 리포트가 궁금하신가요?' : 'Want a deeper analysis?'}</p>
                    <div className="text-2xl font-black text-primary flex items-center justify-center md:justify-start gap-4">
                      {locale === 'ko' ? '나의 인연 대시보드로 이동' : 'Go to Destiny Dashboard'} <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
