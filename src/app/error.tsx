"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[Error boundary]", error);
    }
  }, [error]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 flex flex-col items-center justify-center px-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6"
        >
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-3">
          에러가 발생했습니다
        </h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          잠시 후 다시 시도해 주세요.<br />
          계속 같은 오류가 나면, 오류 내용으로 문의해 주세요.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold hover:from-red-600 hover:to-pink-600 transition-all hover:scale-[1.03] shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all"
          >
            <Home className="w-4 h-4" />
            홈으로
          </Link>
          <a
            href="mailto:support@secretsaju.com?subject=%EC%9B%B9%20%EC%97%90%EB%9F%AC"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/20 text-white/85 font-medium hover:bg-white/10 transition-all"
          >
            문의하기
          </a>
        </div>

        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-left">
            <p className="text-red-400 text-xs font-mono break-all">{error.message}</p>
          </div>
        )}
      </motion.div>
    </main>
  );
}

