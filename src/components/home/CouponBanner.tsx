"use client";

import { Gift, ArrowRight, Zap } from "lucide-react";

export default function CouponBanner() {
  return (
    <section className="px-4 py-6 md:px-6 md:py-10 relative">
      <div className="relative bg-slate-900/60 backdrop-blur-3xl border border-indigo-500/30 rounded-[2rem] p-6 sm:p-10 md:p-12 overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-[380px] h-[380px] bg-indigo-600/10 rounded-full blur-[90px] -mr-52 -mt-52 group-hover:bg-indigo-600/20 transition-all duration-1000" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center relative shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <Gift className="w-9 h-9 sm:w-10 sm:h-10 text-white relative z-10" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[9px] font-black tracking-widest border border-amber-500/20 shadow-inner">
                <Zap className="w-3 h-3 fill-amber-400" />
                지금 바로 시작하기
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight leading-none mb-1">
                당일 운세 <span className="text-indigo-400">프리미엄 패스</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-bold tracking-wide leading-relaxed">
                오늘의 컨디션과 질문 성향을 반영한 맞춤 메시지로 정확도를 높였습니다.
              </p>
            </div>
          </div>

          <button className="w-full sm:w-auto px-7 py-4 sm:px-8 sm:py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-[11px] font-black uppercase tracking-[0.26em] italic hover:scale-105 transition-all shadow-xl shadow-indigo-950/40 flex items-center justify-center gap-3 active:scale-95 group/btn">
            지금 확인
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
