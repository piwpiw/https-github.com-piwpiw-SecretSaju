"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/app/utils";
import { validateBirthInput } from "@/lib/app/validation";

type BirthInputFormProps = {
  onSubmit: (birth: { year: number; month: number; day: number }, gender?: "M" | "F") => void;
  isSubmitting?: boolean;
};

export function BirthInputForm({ onSubmit, isSubmitting }: BirthInputFormProps) {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [gender, setGender] = useState<"M" | "F" | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const yStr = year.trim();
    const mStr = month.trim();
    const dStr = day.trim();
    if (!yStr || !mStr || !dStr) {
      setError("연, 월, 일을 모두 입력하세요.");
      return;
    }

    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const d = parseInt(dStr, 10);
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) {
      setError("숫자로 입력하세요.");
      return;
    }

    const result = validateBirthInput({ year: y, month: m, day: d });
    if (!result.ok) {
      setError(result.message);
      return;
    }

    onSubmit({ year: y, month: m, day: d }, gender);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={cn("glass rounded-2xl p-6 mx-auto max-w-sm space-y-4 antigravity")}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <p className="text-zinc-400 text-sm mb-4">생년월일을 입력하세요</p>
      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2 justify-center">
        <input
          type="number"
          min={1900}
          max={2030}
          placeholder="년"
          value={year}
          onChange={(e) => { setYear(e.target.value); setError(null); }}
          className="w-20 rounded-lg bg-surface border border-white/10 px-3 py-2 text-center text-foreground placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="연도"
        />
        <input
          type="number"
          min={1}
          max={12}
          placeholder="월"
          value={month}
          onChange={(e) => { setMonth(e.target.value); setError(null); }}
          className="w-14 rounded-lg bg-surface border border-white/10 px-2 py-2 text-center text-foreground placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="월"
        />
        <input
          type="number"
          min={1}
          max={31}
          placeholder="일"
          value={day}
          onChange={(e) => { setDay(e.target.value); setError(null); }}
          className="w-14 rounded-lg bg-surface border border-white/10 px-2 py-2 text-center text-foreground placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="일"
        />
      </div>
      <div className="flex gap-2 justify-center">
        <button
          type="button"
          onClick={() => setGender("M")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm transition-colors",
            gender === "M" ? "bg-primary text-white" : "bg-surface text-zinc-400 hover:bg-white/10"
          )}
        >
          남
        </button>
        <button
          type="button"
          onClick={() => setGender("F")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm transition-colors",
            gender === "F" ? "bg-primary text-white" : "bg-surface text-zinc-400 hover:bg-white/10"
          )}
        >
          여
        </button>
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !year.trim() || !month.trim() || !day.trim()}
        className="w-full rounded-xl bg-primary py-3 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
      >
        {isSubmitting ? "결과를 만드는 중..." : "내 실체 보기"}
      </button>
    </motion.form>
  );
}
