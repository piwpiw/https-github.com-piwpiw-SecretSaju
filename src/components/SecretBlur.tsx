"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SecretBlurProps = {
  hook: string;
  /** 결제 후 해금 시 표시할 미리보기 문구 */
  secretPreview?: string;
  unlocked?: boolean;
  onPaymentClick?: () => void;
};

export function SecretBlur({
  hook,
  secretPreview = "후방주의.",
  unlocked = false,
  onPaymentClick,
}: SecretBlurProps) {
  const [showModal, setShowModal] = useState(false);

  const handlePay = () => {
    onPaymentClick?.();
    setShowModal(true);
  };

  return (
    <section className="w-full max-w-md mx-auto py-12 px-4">
      <h3 className="font-display text-xl text-foreground mb-4 text-center">
        새벽 2시의 본능 (Secret)
      </h3>

      {unlocked ? (
        <motion.div
          className="rounded-2xl glass p-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-secondary font-medium mb-2">🔓 해금됨</p>
          <p className="text-zinc-300 text-sm">{secretPreview}</p>
        </motion.div>
      ) : (
        <motion.div
          className={cn(
            "rounded-2xl glass p-6 text-center relative overflow-hidden",
            "select-none"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 backdrop-blur-md bg-background/60 z-10 flex flex-col items-center justify-center">
            <p className="text-zinc-400 text-sm mb-4 px-4">{hook}</p>
            <button
              type="button"
              onClick={handlePay}
              className="rounded-xl bg-secondary px-6 py-3 font-medium text-background hover:bg-secondary/90 transition-colors"
            >
              300원에 보기
            </button>
          </div>
          <div className="blur-xl pointer-events-none">
            <p className="text-zinc-500 text-sm">{secretPreview}</p>
          </div>
        </motion.div>
      )}

      {showModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowModal(false)}
        >
          <motion.div
            className="rounded-2xl glass p-6 max-w-sm w-full text-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-foreground font-display text-lg mb-4">결제 (준비 중)</p>
            <p className="text-zinc-400 text-sm mb-6">
              토스 페이먼츠 연동은 Phase 4에서 적용됩니다.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded-xl bg-primary px-6 py-2 text-white"
            >
              닫기
            </button>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
