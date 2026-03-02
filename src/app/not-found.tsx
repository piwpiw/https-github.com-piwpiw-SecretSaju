'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="relative text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="text-8xl mb-6 select-none"
          animate={{
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.05, 1, 1.05, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        >
          ⚠
        </motion.div>

        <motion.h1
          className="text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          404
        </motion.h1>

        <h2 className="text-2xl font-bold text-white mb-3">페이지를 찾을 수 없습니다.</h2>
        <p className="text-slate-400 text-sm mb-10 leading-relaxed">
          요청하신 경로가 존재하지 않거나 이동이 완료되지 않았습니다.<br />
          아래 버튼으로 다른 주요 화면으로 빠르게 이동해 주세요.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            aria-label="홈으로 이동"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transition-all hover:scale-[1.03] shadow-lg"
          >
            <Home className="w-4 h-4" />
            홈으로 이동
          </Link>
          <button
            onClick={() => window.history.back()}
            aria-label="이전 페이지로 이동"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all hover:scale-[1.03]"
          >
            <ArrowLeft className="w-4 h-4" />
            이전 페이지로
          </button>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
          {[
            { href: '/fortune', label: '운세 바로가기' },
            { href: '/compatibility', label: '궁합 분석' },
            { href: '/gift', label: '선물함' },
            { href: '/inquiry', label: '문의하기' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-label={`${label} 바로가기`}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-purple-400/50 transition-all"
            >
              {label}
            </Link>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
