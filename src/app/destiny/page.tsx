"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Star, Calendar, Heart } from "lucide-react";

export default function DestinyPage() {
    return (
        <main className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950">
            <div className="bg-indigo-900 pt-8 pb-12 px-4 rounded-b-3xl shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
                    <span className="text-indigo-300 font-bold tracking-widest text-xs mb-2 uppercase">Destiny & Compatibility</span>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-3">운명 및 궁합</h1>
                    <p className="text-indigo-200 text-sm">태어난 기운과 인연의 연결고리</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-20 space-y-6">

                {/* 타고난 운명 (그리드 뷰) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">타고난 운명 파헤치기</h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {[
                            { icon: "🐯", label: "띠 운세" },
                            { icon: "✨", label: "별자리" },
                            { icon: "🌸", label: "계절운" },
                            { icon: "📅", label: "생년월일" },
                            { icon: "⏳", label: "전생운" },
                            { icon: "💎", label: "탄생석" },
                        ].map((item, i) => (
                            <button key={i} className="flex flex-col items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors border border-slate-100 dark:border-slate-800 group">
                                <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* 궁합 파헤치기 (리스트 뷰) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Heart className="w-5 h-5 text-rose-500" />
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">우리는 어떤 인연일까?</h3>
                    </div>

                    <div className="space-y-3">
                        <Link href="/compatibility" className="flex items-center p-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-900/20 rounded-2xl hover:scale-[1.01] transition-transform border border-rose-100 dark:border-rose-900/30">
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-xl shadow-sm mr-4">💑</div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-rose-600 dark:text-rose-400">정통 짝궁합</h4>
                                    <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full">BEST</span>
                                </div>
                                <p className="text-xs text-rose-900/60 dark:text-rose-200/60 mt-1">연애부터 결혼까지 가장 정확한 사주 궁합</p>
                            </div>
                        </Link>

                        {[
                            { icon: "⭐", title: "별자리 궁합", desc: "태어난 날짜로 보는 서양식 궁합" },
                            { icon: "🩸", title: "혈액형 궁합", desc: "재미로 보는 성격 궁합" },
                            { icon: "🎭", title: "나의 인연 운세", desc: "올해 새로운 인연이 나타날까?" },
                        ].map((item, i) => (
                            <button key={i} className="w-full flex items-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg mr-4">{item.icon}</div>
                                <div className="text-left">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{item.title}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>

            </div>
        </main>
    );
}
