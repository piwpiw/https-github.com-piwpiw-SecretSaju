"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";

type SecretBlurProps = {
  hook: string;
  secretPreview?: string;
  unlocked?: boolean;
  onPaymentClick?: () => void;
};

export function SecretBlur({
  hook,
  secretPreview = "비공개 콘텐츠는 잠금 해제 후 확인할 수 있습니다.",
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
      <h3 className="font-display text-xl text-foreground mb-4 text-center">비밀 미리보기 (Secret)</h3>

      {unlocked ? (
        <motion.div
          className="rounded-2xl glass p-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-secondary font-medium mb-2">해제된 비밀 콘텐츠</p>
          <p className="text-zinc-300 text-sm">{secretPreview}</p>
        </motion.div>
      ) : (
        <motion.div
          className={cn("rounded-2xl glass p-6 text-center relative overflow-hidden", "select-none")}
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
              300포인트 결제하기
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
            <p className="text-foreground font-display text-lg mb-2">결제 연동 안내</p>
            <p className="text-zinc-400 text-sm mb-2">
              현재 결제 모듈은 운영 점검 중이라 결제 요청은 지원 문의로 연결됩니다.
            </p>
            <p className="text-zinc-400 text-sm mb-6">
              결제 상태가 완료되면 동일 화면에서 즉시 콘텐츠가 해제됩니다.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded-xl bg-primary px-6 py-2 text-white"
            >
              닫기
            </button>
            <a
              href="/support"
              className="inline-flex items-center justify-center mt-3 px-5 py-2 rounded-xl border border-white/20 text-white/90 w-full font-medium"
            >
              문의 페이지 바로가기
            </a>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
