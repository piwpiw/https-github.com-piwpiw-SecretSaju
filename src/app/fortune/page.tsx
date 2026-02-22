"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getDayPillarIndex } from "@/lib/saju";
import { getYearlyFortune } from "@/lib/yearlyFortune";
import { validateBirthInput } from "@/lib/validation";
import Link from "next/link";

const YEARS = [2025, 2026, 2027, 2028];

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
    }, 800);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="font-display text-2xl text-foreground mb-2 text-center">
          신년운세
        </h1>
        <p className="text-zinc-400 text-sm mb-8 text-center">
          {year}년 운세를 볼 연도를 고르고, 생년월일을 입력하세요.
        </p>

        <motion.form
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-6 space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <p className="text-zinc-400 text-sm mb-2">운세 볼 연도</p>
            <div className="flex gap-2 flex-wrap">
              {YEARS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    year === y ? "bg-primary text-white" : "bg-surface text-zinc-400 hover:bg-white/10"
                  }`}
                >
                  {y}년
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-zinc-400 text-sm mb-2">생년월일</p>
            <div className="flex gap-2">
              <input
                type="number"
                min={1900}
                max={2030}
                placeholder="년"
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                className="w-20 rounded-lg bg-surface border border-white/10 px-2 py-2 text-center text-foreground text-sm"
              />
              <input
                type="number"
                min={1}
                max={12}
                placeholder="월"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-14 rounded-lg bg-surface border border-white/10 px-2 py-2 text-center text-foreground text-sm"
              />
              <input
                type="number"
                min={1}
                max={31}
                placeholder="일"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-14 rounded-lg bg-surface border border-white/10 px-2 py-2 text-center text-foreground text-sm"
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !yearInput || !month || !day}
            className="w-full rounded-xl bg-secondary py-3 font-medium text-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 transition-colors"
          >
            {loading ? "운세 보는 중..." : `${year} 신년운세 보기`}
          </button>
        </motion.form>

        {result && (
          <motion.div
            className="mt-8 glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-secondary font-display text-lg mb-2">
              {result.year}년 신년운세 · {result.pillarName} 일주
            </p>
            <p className="text-foreground font-medium mb-4">{result.summary}</p>
            <p className="text-zinc-400 text-sm">{result.detail}</p>
          </motion.div>
        )}

        <p className="mt-8 text-center text-zinc-500 text-sm">
          <Link href="/" className="text-primary hover:underline">
            일주 보기
          </Link>
          {" · "}
          <Link href="/compatibility" className="text-primary hover:underline">
            궁합
          </Link>
        </p>
      </div>
    </main>
  );
}
