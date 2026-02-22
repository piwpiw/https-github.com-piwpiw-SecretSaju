"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BirthInputForm } from "./BirthInputForm";
import { DailyFortuneBanner } from "./DailyFortuneBanner";

type HeroSectionProps = {
  showForm?: boolean;
  isLoading?: boolean;
  onBirthSubmit?: (birth: { year: number; month: number; day: number }, gender?: "M" | "F") => void;
};

export function HeroSection({
  showForm = true,
  isLoading = false,
  onBirthSubmit,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Antigravity background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="relative z-10 text-center max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
          멍냥의 이중생활
        </h1>
        <p className="text-lg text-zinc-400 mb-2">
          너 요즘 왜 그렇게 살아?
        </p>
        <p className="text-sm text-zinc-500 mb-8">
          일주 보기 · 궁합 · 신년운세
        </p>
        <p className="text-sm text-zinc-500 mb-6">
          생년월일을 입력하면 사회적 가면 뒤의 본능이 드러납니다.
        </p>

        <DailyFortuneBanner />

        {showForm && onBirthSubmit && (
          <BirthInputForm onSubmit={onBirthSubmit} isSubmitting={isLoading} />
        )}
      </motion.div>
    </section>
  );
}
