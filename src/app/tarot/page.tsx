"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Loader2, Star, Target, Zap, Waves } from "lucide-react";
import JellyBalance from "@/components/shop/JellyBalance";
import { getBalance, hasSufficientBalance, consumeJelly } from "@/lib/jelly-wallet";
import { triggerBalanceUpdate } from "@/components/shop/JellyBalance";
import { saveAnalysisToHistory } from "@/lib/analysis-history";
import JellyShopModal from "@/components/shop/JellyShopModal";
import LuxuryToast from "@/components/ui/LuxuryToast";

const TAROT_CARDS = [
    {
        id: "fool",
        name: "0. The Fool (바보)",
        meanings: ["새로운 시작", "무한한 가능성", "자유로운 여정", "직관적 선택"],
        desc: "모든 것을 새롭게 시작할 절호의 기회입니다. 과거의 짐을 내려놓고 마음이 이끄는 대로 자유롭게 나아가세요. 예상치 못한 행운이 기다리고 있습니다.",
        bg: "bg-emerald-500/10",
        color: "text-emerald-400",
        icon: "🎭"
    },
    {
        id: "magician",
        name: "I. The Magician (마법사)",
        meanings: ["창조력", "자신감", "강력한 의지", "문제 해결"],
        desc: "당신 앞에는 모든 준비가 갖춰져 있습니다. 자신감을 가지고 능력을 마음껏 펼쳐보세요. 집중력과 창의력이 눈앞의 문제를 마법처럼 해결해줄 것입니다.",
        bg: "bg-purple-500/10",
        color: "text-purple-400",
        icon: "🪄"
    },
    {
        id: "empress",
        name: "III. The Empress (여황제)",
        meanings: ["풍요", "결실", "모성애", "아름다움"],
        desc: "그동안의 노력이 풍성한 결실을 맺는 시기입니다. 물질적, 정신적으로 안정과 풍요를 누리게 되며 주변 사람들과 따뜻한 관계를 맺게 됩니다.",
        bg: "bg-rose-500/10",
        color: "text-rose-400",
        icon: "👑"
    },
    {
        id: "chariot",
        name: "VII. The Chariot (전차)",
        meanings: ["승리", "돌진", "극복", "성공"],
        desc: "강한 의지력으로 목표를 향해 돌진할 때입니다. 방해물이 있더라도 충분히 뚫고 나갈 수 있습니다. 흔들리지 않는 굳건한 태도로 승리를 쟁취하세요.",
        bg: "bg-yellow-500/10",
        color: "text-yellow-400",
        icon: "⚔️"
    },
    {
        id: "star",
        name: "XVII. The Star (별)",
        meanings: ["희망", "영감", "치유", "밝은 미래"],
        desc: "어두운 밤을 밝히는 희망의 별이 떠올랐습니다. 어려운 시기가 지나고 마음의 평화와 안정을 되찾게 됩니다. 당신의 꿈에 한 걸음 더 가까워졌습니다.",
        bg: "bg-cyan-500/10",
        color: "text-cyan-400",
        icon: "✨"
    },
    {
        id: "sun",
        name: "XIX. The Sun (태양)",
        meanings: ["기쁨", "성공", "활력", "긍정의 에너지"],
        desc: "어둠이 걷히고 찬란하게 빛나는 태양처럼 긍정적이고 밝은 에너지가 가득합니다. 가장 크고 명확한 성공과 행복이 당신을 기다리고 있습니다.",
        bg: "bg-amber-500/10",
        color: "text-amber-400",
        icon: "☀️"
    }
];

export default function TarotPage() {
    const router = useRouter();
    const [gameState, setGameState] = useState<"intro" | "picking" | "drawing" | "result">("intro");
    const [selectedCard, setSelectedCard] = useState<typeof TAROT_CARDS[0] | null>(null); // Changed type to allow null
    const [isFlipped, setIsFlipped] = useState(false);
    const [showShopModal, setShowShopModal] = useState(false); // New state
    const [toastMsg, setToastMsg] = useState("");
    const [showToast, setShowToast] = useState(false);

    const COST = 10; // New constant

    const handleStartPicking = () => { // Replaces startDraw
        if (!hasSufficientBalance(COST)) {
            setToastMsg("운명의 타로를 열기엔 젤리가 부족합니다. (상점을 방문해보세요)");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setShowShopModal(true); // Assuming this modal exists and is handled elsewhere
            return;
        }
        setGameState("picking");
    };

    const handleDraw = () => { // Replaces pickCard
        consumeJelly(COST, 'tarot_reading', { cardId: 'random' }); // Assuming 'random' for now, or pass actual card ID if picking is visual
        triggerBalanceUpdate();

        setGameState("drawing");

        // Simulate drawing animation
        setTimeout(() => {
            const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
            setSelectedCard(randomCard);
            setGameState("result");
            setTimeout(() => setIsFlipped(true), 500);

            // Save to history
            saveAnalysisToHistory({
                type: 'TAROT',
                title: `${randomCard.name} 리딩`,
                subtitle: randomCard.meanings[0],
                profileName: '본인', // Or dynamically set
                result: randomCard,
            }, {
                resultUrlFactory: (id) => `/analysis-history/TAROT/${id}`,
            });
        }, 2500); // Original duration was 2500ms
    };

    const handleReset = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setSelectedCard(null);
            setGameState("intro");
        }, 300);
    };

    return (
        <main className="min-h-[100dvh] bg-[#050510] text-foreground relative overflow-hidden pb-40">
            <LuxuryToast message={toastMsg} isVisible={showToast} />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />

            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-16">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-3 text-slate-400 hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black tracking-widest uppercase italic">종료</span>
                    </button>
                    <JellyBalance />
                </div>

                <AnimatePresence mode="wait">
                    {/* State: Intro */}
                    {gameState === "intro" && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center space-y-16 py-12"
                        >
                            <div className="relative inline-block mt-10">
                                <motion.div
                                    className="w-40 h-60 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-900 rounded-[2rem] mx-auto shadow-[0_0_80px_rgba(79,70,229,0.3)] flex items-center justify-center relative z-10 border border-white/20"
                                    animate={{
                                        y: [0, -20, 0],
                                        rotateY: [0, 5, -5, 0],
                                        rotateX: [0, -5, 5, 0]
                                    }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Sparkles className="w-16 h-16 text-white/40 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                    <div className="absolute inset-4 border border-white/10 rounded-2xl border-dashed" />
                                </motion.div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/20 blur-[80px] rounded-full animate-pulse" />
                            </div>

                            <div>
                                <motion.h1
                                    className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                    initial={{ opacity: 0, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, filter: "blur(0px)" }}
                                    transition={{ duration: 1 }}
                                >
                                    운명의 <span className="text-indigo-400">타로 리서치</span>
                                </motion.h1>
                                <p className="text-xl text-slate-400 max-w-lg mx-auto leading-relaxed font-medium italic opacity-80">
                                    고민되는 질문을 생각하며 깊은 호흡을 들이마시고<br />
                                    당신의 잠재의식이 이끄는 곳으로 손을 뻗으세요.
                                </p>
                            </div>

                            <button
                                onClick={handleStartPicking}
                                className="px-12 py-6 bg-white/[0.03] border border-white/10 rounded-[2rem] text-2xl font-black text-white hover:bg-white/[0.08] hover:border-indigo-500/50 hover:shadow-[0_0_50px_rgba(99,102,241,0.4)] transition-all group relative overflow-hidden flex items-center gap-4 mx-auto"
                            >
                                <span className="relative z-10">10 젤리로 해독 시작</span>
                                <Zap className="w-6 h-6 text-yellow-400 relative z-10 group-hover:scale-125 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500" />
                            </button>
                        </motion.div>
                    )}

                    {/* State: Picking */}
                    {gameState === "picking" && (
                        <motion.div
                            key="picking"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-10"
                        >
                            <div className="mb-16">
                                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2 animate-pulse">호흡을 고르고 한 장을 선택하세요</h2>
                                <p className="text-slate-500 text-xs font-bold tracking-[0.3em] uppercase">Connect with your digital resonance</p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto perspective-2000">
                                {Array.from({ length: 12 }).map((_, idx) => (
                                    <motion.button
                                        key={idx}
                                        whileHover={{
                                            y: -20,
                                            scale: 1.1,
                                            rotateZ: idx % 2 === 0 ? 3 : -3,
                                            boxShadow: "0 20px 40px rgba(79,70,229,0.3)"
                                        }}
                                        onClick={handleDraw}
                                        className="w-24 h-36 sm:w-28 sm:h-44 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 rounded-2xl border border-white/10 relative overflow-hidden group shadow-2xl"
                                    >
                                        <div className="absolute inset-x-0 h-full w-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.2)_0%,transparent_70%)] opacity-30" />
                                        <div className="absolute inset-2 border border-white/5 rounded-xl border-dashed" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Waves className="w-8 h-8 text-indigo-900 group-hover:text-indigo-400 transition-colors duration-500 opacity-20 group-hover:opacity-100" />
                                        </div>
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* State: Drawing (Loading) */}
                    {gameState === "drawing" && (
                        <motion.div
                            key="drawing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-40"
                        >
                            <div className="relative w-48 h-48">
                                <motion.div
                                    className="absolute inset-0 rounded-full border-t-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" strokeWidth={1} />
                                </div>
                                <Sparkles className="w-8 h-8 text-indigo-200 absolute top-0 left-1/2 -translate-x-1/2 animate-ping" />
                            </div>
                            <h3 className="mt-16 text-3xl font-black text-white italic tracking-tighter uppercase animate-pulse">차원의 기운을 <span className="text-indigo-400">동기화 중...</span></h3>
                        </motion.div>
                    )}

                    {/* State: Result */}
                    {gameState === "result" && selectedCard && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-3xl mx-auto py-10"
                        >
                            <div className="perspective-2000 relative w-full max-w-[400px] aspect-[2/3] mx-auto mb-16 group">
                                <motion.div
                                    className="relative w-full h-full [transform-style:preserve-3d]"
                                    initial={false}
                                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    {/* Card Back */}
                                    <div className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-indigo-900 to-slate-950 rounded-[2.5rem] border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
                                        <div className="absolute inset-4 border-2 border-white/10 rounded-[2rem] border-dashed" />
                                        <Sparkles className="w-20 h-20 text-indigo-400 opacity-20" />
                                    </div>

                                    {/* Card Front */}
                                    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-10 text-center">
                                        <div className={`absolute top-0 inset-x-0 h-full ${selectedCard.bg} blur-3xl opacity-50`} />
                                        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                                            <div className="text-8xl mb-8 drop-shadow-2xl">{selectedCard.icon}</div>
                                            <div className={`text-xs font-black ${selectedCard.color} tracking-[0.3em] uppercase mb-4`}>Major Arcana</div>
                                            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase drop-shadow-lg">{selectedCard.name}</h2>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 20 }}
                                transition={{ delay: 1 }}
                                className="space-y-10"
                            >
                                <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-3xl text-center">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-indigo-500 text-black text-[10px] font-black rounded-full uppercase tracking-widest italic shadow-xl">초월적 해독 리포트</div>

                                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                                        {selectedCard.meanings.map((m, i) => (
                                            <span key={i} className={`px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black italic tracking-tight ${selectedCard.color}`}>
                                                #{m}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-bold italic tracking-tight whitespace-pre-line max-w-xl mx-auto">
                                        &ldquo;{selectedCard.desc}&rdquo;
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                    <button
                                        onClick={handleReset}
                                        className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 font-black text-sm uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all order-2 sm:order-1"
                                    >
                                        처음으로
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsFlipped(false);
                                            setTimeout(() => setGameState("picking"), 400);
                                        }}
                                        className="w-full sm:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-4 transition-all order-1 sm:order-2"
                                    >
                                        <Target className="w-5 h-5" /> 다시 해독하기
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <JellyShopModal
                    isOpen={showShopModal}
                    onClose={() => setShowShopModal(false)}
                />
            </div>
        </main>
    );
}
