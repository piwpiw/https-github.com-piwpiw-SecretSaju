"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDayPillarIndex } from "@/lib/saju";
import { getYearlyFortune } from "@/lib/yearlyFortune";
import { validateBirthInput } from "@/lib/validation";
import Link from "next/link";
import { Sparkles, Star, TrendingUp, Heart, Briefcase, DollarSign, Activity } from "lucide-react";

const YEARS = [2025, 2026, 2027, 2028];

const FORTUNE_ICONS = [TrendingUp, Heart, DollarSign, Briefcase, Activity];
const FORTUNE_COLORS = [
  "from-yellow-400 to-amber-500",
  "from-pink-400 to-rose-500",
  "from-green-400 to-emerald-500",
  "from-blue-400 to-indigo-500",
  "from-purple-400 to-violet-500",
];
const FORTUNE_LABELS = ["총운", "애정운", "금전운", "직장운", "건강운"];

function FortuneScoreBar({ label, score, color, icon: Icon, delay }: {
  label: string; score: number; color: string; icon: any; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3"
    >
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-slate-400">{label}</span>
          <span className="text-xs font-bold text-white">{score}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function FortunePage() {
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
      setError("생년월일을 올바르게 입력하세요.");
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
    }, 900);
  };

  // Generate deterministic scores from pillar index
  const getScores = () => {
    if (!result) return [];
    const base = result.pillarName.charCodeAt(0) + result.pillarName.charCodeAt(1);
    return FORTUNE_LABELS.map((label, i) => ({
      label,
      score: Math.min(95, Math.max(45, ((base * (i + 3)) % 55) + 40)),
      color: FORTUNE_COLORS[i],
      icon: FORTUNE_ICONS[i],
    }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
      <div className="max-w-md mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="text-5xl mb-3"
          >
            ✨
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent mb-2">
            신년운세
          </h1>
          <p className="text-slate-400 text-sm">
            {year}년 나의 운세를 확인해보세요
          </p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Year selector */}
          <div className="mb-5">
            <p className="text-sm font-medium text-slate-300 mb-3">운세 볼 연도</p>
            <div className="grid grid-cols-4 gap-2">
              {YEARS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className={`rounded-xl py-2.5 text-sm font-bold transition-all ${year === y
                      ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-black shadow-lg scale-105"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Birth date */}
          <div className="mb-5">
            <p className="text-sm font-medium text-slate-300 mb-3">생년월일</p>
            <div className="flex gap-2">
              <input
                type="number"
                min={1900}
                max={2030}
                placeholder="년도"
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors text-center text-sm"
              />
              <input
                type="number"
                min={1}
                max={12}
                placeholder="월"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-16 bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors text-center text-sm"
              />
              <input
                type="number"
                min={1}
                max={31}
                placeholder="일"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-16 bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors text-center text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !yearInput || !month || !day}
            className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black py-4 font-bold text-base hover:from-yellow-500 hover:to-amber-600 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                운세 계산 중...
              </>
            ) : (
              <>
                <Star className="w-5 h-5" />
                {year}년 신년운세 보기
              </>
            )}
          </button>
        </motion.form>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Main card */}
              <div className="bg-gradient-to-br from-yellow-900/40 to-amber-900/30 border border-yellow-400/20 rounded-2xl p-6 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-bold">{result.year}년 총운</span>
                  <span className="text-slate-400 text-sm">· {result.pillarName} 일주</span>
                </div>
                <p className="text-white font-bold text-lg mb-3">{result.summary}</p>
                <p className="text-slate-300 text-sm leading-relaxed">{result.detail}</p>
              </div>

              {/* Fortune scores */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-300 mb-4">세부 운세</h3>
                {getScores().map((s, i) => (
                  <FortuneScoreBar key={s.label} {...s} delay={i * 0.1} />
                ))}
              </div>

              {/* CTA */}
              <div className="mt-4 bg-gradient-to-r from-purple-900/40 to-pink-900/30 border border-purple-400/20 rounded-2xl p-5 text-center">
                <p className="text-slate-300 text-sm mb-3">
                  🔮 더 자세한 사주 풀이
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm hover:from-purple-600 hover:to-pink-600 transition-all hover:scale-[1.02]"
                >
                  비밀 사주 확인하기 →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav links */}
        <p className="mt-8 text-center text-slate-500 text-sm">
          <Link href="/" className="text-purple-400 hover:text-purple-300 transition-colors">
            나의 일주 보기
          </Link>
          {" · "}
          <Link href="/compatibility" className="text-purple-400 hover:text-purple-300 transition-colors">
            궁합 보기
          </Link>
          {" · "}
          <Link href="/gift" className="text-purple-400 hover:text-purple-300 transition-colors">
            친구에게 선물
          </Link>
        </p>
      </div>
    </main>
  );
}
