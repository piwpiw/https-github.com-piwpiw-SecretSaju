"use client";

import { motion } from "framer-motion";
import { AppOnlyModal } from "@/components/ui/AppOnlyModal";
import { useState } from "react";
import { Shield, Sparkles, Hash } from "lucide-react";

export default function LuckPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <main className="min-h-screen pb-20">
            {/* Header Area */}
            <div className="bg-slate-900 pt-8 pb-12 px-4 rounded-b-3xl shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
                    <span className="text-emerald-400 font-bold tracking-widest text-xs mb-2 uppercase">Luck & Protection</span>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-3">액운 방지 및 행운</h1>
                    <p className="text-slate-400 text-sm">사주 명리학 기반의 맞춤형 행운 가이드</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-20 space-y-6">

                {/* 행운의 번호 (로또 번호 추천 배너) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Hash className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-amber-100" />
                            <h2 className="text-xl font-bold">내 인생을 바꿔줄 행운의 번호</h2>
                        </div>
                        <p className="text-orange-100 text-sm mb-6">오행의 기운을 담아 6개의 숫자를 추출합니다.</p>
                        <button className="px-6 py-3 bg-white text-orange-600 rounded-xl font-black shadow-md hover:scale-105 transition-transform">
                            번호 추출하기
                        </button>
                    </div>
                </motion.div>

                {/* 일반 콘텐츠 리스트 */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">맞춤형 운세 풀이</h3>
                    <div className="space-y-3">
                        {[
                            { title: "손쉽게 행운을 얻는 방법", desc: "나의 부족한 기운을 채워주는 일상 속 실천" },
                            { title: "천생복덕운", desc: "하늘이 내린 나의 타고난 복과 재물" },
                            { title: "살풀이 개운법", desc: "나에게 낀 나쁜 기운을 물리치는 비방" }
                        ].map((item, i) => (
                            <button key={i} className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-500 transition-colors">{item.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* APP 전용 기능 (부적) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-red-50 dark:bg-red-950/20 rounded-3xl p-6 border border-red-100 dark:border-red-900/30"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-red-500" />
                        <h3 className="text-lg font-bold text-slate-800 dark:text-red-100">나만의 디지털 부적</h3>
                        <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">APP ONLY</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {["재물 번영부", "합격 기원부", "애정 화합부", "건강 무탈부"].map((charm, i) => (
                            <button
                                key={i}
                                onClick={() => setIsModalOpen(true)}
                                className="aspect-[3/4] bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center p-3 relative group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-10 h-16 bg-yellow-100 dark:bg-yellow-900/50 rounded mb-3 border border-yellow-200 dark:border-yellow-700/50 flex items-center justify-center text-yellow-600 font-serif text-xl border-dashed">
                                    符
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 relative z-10">{charm}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>

            <AppOnlyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="행운의 디지털 부적" />
        </main>
    );
}
