"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ShareSectionProps = {
  userName?: string;
  onShareComplete?: () => void;
  unlocked?: boolean;
};

const SHARE_MESSAGE = (name: string) =>
  `${name || "OOO"}님의 실체가 폭로되었습니다. 🤫\n야 이거 완전 너 아니냐? ㅋㅋ 소름 돋음.`;

export function ShareSection({
  userName = "OOO",
  onShareComplete,
  unlocked = false,
}: ShareSectionProps) {
  const [shared, setShared] = useState(unlocked);

  const handleShare = async () => {
    const text = SHARE_MESSAGE(userName);
    if (navigator.share) {
      try {
        await navigator.share({
          title: "멍냥의 이중생활 - 내 실체",
          text,
          url: typeof window !== "undefined" ? window.location.href : "",
        });
        setShared(true);
        onShareComplete?.();
      } catch (err) {
        copyAndComplete(text);
      }
    } else {
      copyAndComplete(text);
    }
  };

  const copyAndComplete = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setShared(true);
    onShareComplete?.();
  };

  return (
    <section className="w-full max-w-md mx-auto py-12 px-4">
      <h3 className="font-display text-xl text-foreground mb-4 text-center">
        친구들이 보는 내 뒷모습
      </h3>
      <motion.div
        className={cn(
          "rounded-2xl glass p-6 text-center",
          shared && "ring-2 ring-primary/50"
        )}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {shared ? (
          <p className="text-primary font-medium">🔓 해금됨 - 카드 뒷면을 확인하세요</p>
        ) : (
          <>
            <p className="text-zinc-400 text-sm mb-4">
              단톡방에 공유하고 평판 확인하기
            </p>
            <button
              type="button"
              onClick={handleShare}
              className="rounded-xl bg-primary px-6 py-3 font-medium text-white hover:bg-primary/90 transition-colors"
            >
              공유하고 뒷모습 보기
            </button>
          </>
        )}
      </motion.div>
    </section>
  );
}
