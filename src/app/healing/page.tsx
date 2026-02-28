"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AppOnlyModal } from "@/components/ui/AppOnlyModal";
import { useState } from "react";
import { Sparkles, HeartPulse, Loader2 } from "lucide-react";

export default function HealingPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");

    const [activeFeature, setActiveFeature] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const FORTUNE_COOKIES = [
        "기회는 뜻하지 않은 장소에서 당신을 기다리고 있습니다.",
        "오늘은 당신의 미소가 최고의 행운을 부르는 열쇠가 될 거예요.",
        "작은 성취가 모여 거대한 성공의 파도를 만듭니다.",
        "주변의 조언보다는 내면의 목소리에 집중해야 할 시기입니다.",
        "잃어버린 줄 알았던 소중한 인연의 소식이 들려올 것입니다.",
        "망설였던 일을 행동으로 옮기세요. 우주가 당신을 돕고 있습니다."
    ];

    const ORB_ANSWERS = [
        "절대적으로 그렇습니다. (Strong Yes)",
        "지금은 알 수 없습니다. 다시 시도하세요. (Foggy)",
        "나중에 더 나은 소식이 들려올 것입니다. (Wait)",
        "당신의 의지가 가장 중요합니다. (Neutral)",
        "부정적인 흐름이 감지되니 주의하세요. (Caution)",
        "예상치 못한 반전이 기다리고 있습니다. (Surprise)"
    ];

    const handleFortuneCookie = () => {
        setLoading(true);
        setActiveFeature("포춘쿠키");
        setTimeout(() => {
            const random = FORTUNE_COOKIES[Math.floor(Math.random() * FORTUNE_COOKIES.length)];
            setResult(random);
            setLoading(false);
        }, 1500);
    };

    const handleMagicOrb = () => {
        setLoading(true);
        setActiveFeature("고민구슬");
        setTimeout(() => {
            const random = ORB_ANSWERS[Math.floor(Math.random() * ORB_ANSWERS.length)];
            setResult(random);
            setLoading(false);
        }, 2000);
    };

    const handleAppFeature = (title: string) => {
        setModalTitle(title);
        setIsModalOpen(true);
    };

    return (
        <main className="min-h-screen bg-[#050505] pb-40 relative">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

            <div className="pt-24 pb-20 px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent"></div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex px-5 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
                        <span className="text-[10px] font-black text-purple-400 flex items-center gap-2 uppercase tracking-[0.3em]">
                            <Sparkles className="w-4 h-4" /> Inner Healing Protocol
                        </span>
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter italic uppercase leading-[0.9]">
                        마음 <span className="text-purple-500">클리닉</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium italic opacity-70">
                        당신의 지친 영혼에 데이터를 기반으로 한<br />따뜻하고 명쾌한 위로를 전합니다.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-20">
                <AnimatePresence mode="wait">
                    {!activeFeature ? (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {/* 포춘쿠키 */}
                            <button
                                onClick={handleFortuneCookie}
                                className="group relative h-80 overflow-hidden rounded-[3rem] bg-gradient-to-br from-emerald-900/40 to-teal-950/40 border border-emerald-500/20 p-10 text-left transition-all hover:border-emerald-500/50 shadow-2xl"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-40 group-hover:scale-125 transition-all duration-700">
                                    <span className="text-[120px]">🥠</span>
                                </div>
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                        <HeartPulse className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-emerald-100 mb-3 group-hover:text-emerald-300 transition-colors uppercase tracking-tighter italic">Fortune Cookie</h3>
                                        <p className="text-emerald-400/60 font-bold italic">바삭! 쿠키 속의 한 줄 메시지</p>
                                    </div>
                                </div>
                            </button>

                            {/* 고민구슬 */}
                            <button
                                onClick={handleMagicOrb}
                                className="group relative h-80 overflow-hidden rounded-[3rem] bg-gradient-to-br from-fuchsia-900/40 to-purple-950/40 border border-fuchsia-500/20 p-10 text-left transition-all hover:border-fuchsia-500/50 shadow-2xl"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-40 group-hover:scale-125 transition-all duration-700">
                                    <span className="text-[120px]">🔮</span>
                                </div>
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className="w-16 h-16 bg-fuchsia-500/20 rounded-2xl flex items-center justify-center border border-fuchsia-500/30 group-hover:bg-fuchsia-500 group-hover:text-black transition-all">
                                        <Sparkles className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-fuchsia-100 mb-3 group-hover:text-fuchsia-300 transition-colors uppercase tracking-tighter italic">Magic Orb</h3>
                                        <p className="text-fuchsia-400/60 font-bold italic">3초 만에 얻는 명쾌한 해답</p>
                                    </div>
                                </div>
                            </button>

                            {/* 소원담벼락 & 관상 (App Only) */}
                            <button onClick={() => handleAppFeature("소원담벼락")} className="group p-8 rounded-[2.5rem] bg-surface border border-white/5 text-left opacity-60 hover:opacity-100 transition-all text-slate-400">
                                <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-4">Community Feature</h4>
                                <h3 className="text-xl font-bold text-white mb-2">소원담벼락</h3>
                                <p className="text-[10px] text-slate-600 italic">APP 전용 커뮤니티 기능</p>
                            </button>
                            <button onClick={() => handleAppFeature("점신 관상")} className="group p-8 rounded-[2.5rem] bg-surface border border-white/5 text-left opacity-60 hover:opacity-100 transition-all text-slate-400">
                                <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-4">AI Vision Module</h4>
                                <h3 className="text-xl font-bold text-white mb-2">점신 AI 관상</h3>
                                <p className="text-[10px] text-slate-600 italic">이미지 처리를 위한 앱 전용 기능</p>
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-surface rounded-5xl p-12 md:p-20 border border-white/10 text-center shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
                            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full" />

                            <div className="relative z-10 max-w-xl mx-auto">
                                <div className="text-7xl mb-12 animate-bounce">
                                    {activeFeature === "포춘쿠키" ? "🥠" : "🔮"}
                                </div>
                                {loading ? (
                                    <div className="space-y-6">
                                        <Loader2 className="w-16 h-16 animate-spin mx-auto text-purple-500" />
                                        <p className="text-lg font-black text-slate-500 uppercase tracking-widest animate-pulse">우주의 메시지를 수신 중...</p>
                                    </div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                        <h2 className="text-xs font-black text-purple-500 uppercase tracking-[0.5em] mb-10">{activeFeature} Analysis</h2>
                                        <p className="text-2xl md:text-3xl font-black text-white leading-tight italic tracking-tight mb-16">
                                            &quot;{result}&quot;
                                        </p>
                                        <button
                                            onClick={() => { setActiveFeature(null); setResult(null); }}
                                            className="px-10 py-5 bg-background border border-white/10 rounded-2xl text-slate-400 font-bold hover:text-white transition-all uppercase tracking-widest text-sm"
                                        >
                                            뒤로가기
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AppOnlyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle} />
        </main>
    );
}
