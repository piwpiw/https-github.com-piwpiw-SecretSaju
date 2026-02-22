"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type DailyFortune = {
  date: string;
  pillarName: string;
  message: string;
};

export function DailyFortuneBanner() {
  const [fortune, setFortune] = useState<DailyFortune | null>(null);

  useEffect(() => {
    fetch("/api/daily-fortune")
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => data && data.message != null ? data : null)
      .then(setFortune)
      .catch(() => setFortune(null));
  }, []);

  if (!fortune) return null;

  return (
    <motion.div
      className="rounded-xl glass px-4 py-3 text-center text-sm text-zinc-300 max-w-md mx-auto mb-8"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="text-primary font-medium">오늘의 개소리</span>
      <p className="mt-1">{fortune.message}</p>
      <p className="text-xs text-zinc-500 mt-1">{fortune.pillarName} 기준</p>
    </motion.div>
  );
}
