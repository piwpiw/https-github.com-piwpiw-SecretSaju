"use client";

import { Gift, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function CouponBanner() {
    return (
        <section className="px-6 py-10 relative">
            <div className="relative bg-slate-900/60 backdrop-blur-3xl border border-indigo-500/30 rounded-[3rem] p-10 sm:p-14 overflow-hidden group shadow-2xl">
                {/* Dynamic Energy Background */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-64 -mt-64 group-hover:bg-indigo-600/20 transition-all duration-1000" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/5 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" />

                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center gap-10 text-center sm:text-left">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center relative shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Gift className="w-10 h-10 text-white relative z-10" />
                        </div>
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/20 shadow-inner">
                                <Zap className="w-3 h-3 fill-amber-400" /> Genesis Reward Active
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">Welcome <span className="text-indigo-400">Bonus</span></h3>
                            <p className="text-sm text-slate-400 font-bold italic uppercase tracking-widest leading-relaxed">
                                지금 가입 즉시 유료 상담 <span className="text-indigo-200">프리미엄 바우처</span> 증정
                            </p>
                        </div>
                    </div>

                    <button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] italic hover:scale-105 transition-all shadow-xl shadow-indigo-950/40 flex items-center justify-center gap-4 active:scale-95 group/btn">
                        보상 수령하기 <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Visual Continuity Lines */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-px bg-gradient-to-r from-transparent to-white/10" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-px bg-gradient-to-l from-transparent to-white/10" />
        </section>
    );
}
