"use client";

import { motion } from "framer-motion";
import { AppOnlyModal } from "@/components/ui/AppOnlyModal";
import { useState } from "react";
import { Sparkles, MessageCircle, HeartPulse, UserCircle } from "lucide-react";

export default function HealingPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");

    const handleAppFeature = (title: string) => {
        setModalTitle(title);
        setIsModalOpen(true);
    };

    return (
        <main className="min-h-screen bg-slate-950 pb-20">
            {/* APP Only Zone Header */}
            <div className="pt-16 pb-20 px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 to-slate-950/20"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                    <div className="inline-flex px-4 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full mb-6">
                        <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> APP EXCLUSIVE ZONE
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                        당신의 지친 마음을<br /><span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">따뜻하게 안아줄게요</span>
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                        점신 앱에서만 만날 수 있는 특별한 힐링 콘텐츠로<br />오늘 하루의 스트레스를 날려보세요.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* 소원담벼락 */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleAppFeature("소원담벼락")}
                        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900/40 to-yellow-900/20 border border-amber-500/20 p-8 text-left transition-all hover:border-amber-500/50"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform duration-500">
                            <span className="text-7xl">🏮</span>
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/30">
                                <MessageCircle className="w-6 h-6 text-amber-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-amber-100 mb-2 group-hover:text-amber-300 transition-colors">소원담벼락</h3>
                            <p className="text-amber-400/60 text-sm">마음속 간절한 소원을 적고 응원받으세요.</p>
                        </div>
                    </motion.button>

                    {/* 얼굴 관상 */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => handleAppFeature("점신 관상")}
                        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-900/40 to-blue-900/20 border border-sky-500/20 p-8 text-left transition-all hover:border-sky-500/50"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform duration-500">
                            <span className="text-7xl">🎭</span>
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-sky-500/20 rounded-2xl flex items-center justify-center mb-6 border border-sky-500/30">
                                <UserCircle className="w-6 h-6 text-sky-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-sky-100 mb-2 group-hover:text-sky-300 transition-colors">점신 AI 관상</h3>
                            <p className="text-sky-400/60 text-sm">얼굴에 적힌 내 운명, 사진 한 장으로 풀이</p>
                        </div>
                    </motion.button>

                    {/* 고민구슬 */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => handleAppFeature("마법의 고민구슬")}
                        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-900/40 to-purple-900/20 border border-fuchsia-500/20 p-8 text-left transition-all hover:border-fuchsia-500/50"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform duration-500">
                            <span className="text-7xl">🔮</span>
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-fuchsia-500/20 rounded-2xl flex items-center justify-center mb-6 border border-fuchsia-500/30">
                                <Sparkles className="w-6 h-6 text-fuchsia-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-fuchsia-100 mb-2 group-hover:text-fuchsia-300 transition-colors">마법의 고민구슬</h3>
                            <p className="text-fuchsia-400/60 text-sm">망설여지는 순간, 3초 만에 명쾌한 답변</p>
                        </div>
                    </motion.button>

                    {/* 포춘쿠키 */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={() => handleAppFeature("오늘의 포춘쿠키")}
                        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 to-teal-900/20 border border-emerald-500/20 p-8 text-left transition-all hover:border-emerald-500/50"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform duration-500">
                            <span className="text-7xl">🥠</span>
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30">
                                <HeartPulse className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-emerald-100 mb-2 group-hover:text-emerald-300 transition-colors">오늘의 포춘쿠키</h3>
                            <p className="text-emerald-400/60 text-sm">바삭! 쿠키를 깨면 나오는 나를 위한 한 줄</p>
                        </div>
                    </motion.button>

                </div>
            </div>

            <AppOnlyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle} />
        </main>
    );
}
