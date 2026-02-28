"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Loader2, Star, Target } from "lucide-react";
import JellyBalance from "@/components/shop/JellyBalance";
import { useWallet } from "@/components/WalletProvider";
import LuxuryToast from "@/components/ui/LuxuryToast";

const TAROT_CARDS = [
    {
        id: "fool",
        name: "0. The Fool (바보)",
        meanings: ["새로운 시작", "무한한 가능성", "자유로운 여정", "직관적 선택"],
        desc: "모든 것을 새롭게 시작할 절호의 기회입니다. 과거의 짐을 내려놓고 마음이 이끄는 대로 자유롭게 나아가세요. 예상치 못한 행운이 기다리고 있습니다.",
        bg: "bg-emerald-500/10",
        color: "text-emerald-400"
    },
    {
        id: "magician",
        name: "I. The Magician (마법사)",
        meanings: ["창조력", "자신감", "강력한 의지", "문제 해결"],
        desc: "당신 앞에는 모든 준비가 갖춰져 있습니다. 자신감을 가지고 능력을 마음껏 펼쳐보세요. 집중력과 창의력이 눈앞의 문제를 마법처럼 해결해줄 것입니다.",
        bg: "bg-purple-500/10",
        color: "text-purple-400"
    },
    {
        id: "empress",
        name: "III. The Empress (여황제)",
        meanings: ["풍요", "결실", "모성애", "아름다움"],
        desc: "그동안의 노력이 풍성한 결실을 맺는 시기입니다. 물질적, 정신적으로 안정과 풍요를 누리게 되며 주변 사람들과 따뜻한 관계를 맺게 됩니다.",
        bg: "bg-rose-500/10",
        color: "text-rose-400"
    },
    {
        id: "chariot",
        name: "VII. The Chariot (전차)",
        meanings: ["승리", "돌진", "극복", "성공"],
        desc: "강한 의지력으로 목표를 향해 돌진할 때입니다. 방해물이 있더라도 충분히 뚫고 나갈 수 있습니다. 흔들리지 않는 굳건한 태도로 승리를 쟁취하세요.",
        bg: "bg-yellow-500/10",
        color: "text-yellow-400"
    },
    {
        id: "star",
        name: "XVII. The Star (별)",
        meanings: ["희망", "영감", "치유", "밝은 미래"],
        desc: "어두운 밤을 밝히는 희망의 별이 떠올랐습니다. 어려운 시기가 지나고 마음의 평화와 안정을 되찾게 됩니다. 당신의 꿈에 한 걸음 더 가까워졌습니다.",
        bg: "bg-cyan-500/10",
        color: "text-cyan-400"
    },
    {
        id: "sun",
        name: "XIX. The Sun (태양)",
        meanings: ["기쁨", "성공", "활력", "긍정의 에너지"],
        desc: "어둠이 걷히고 찬란하게 빛나는 태양처럼 긍정적이고 밝은 에너지가 가득합니다. 가장 크고 명확한 성공과 행복이 당신을 기다리고 있습니다.",
        bg: "bg-amber-500/10",
        color: "text-amber-400"
    }
];

export default function TarotPage() {
    const router = useRouter();
    const { consumeChuru, churu } = useWallet();
    const [gameState, setGameState] = useState<"intro" | "picking" | "drawing" | "result">("intro");
    const [selectedCard, setSelectedCard] = useState<typeof TAROT_CARDS[0] | null>(null);
    const [toastMsg, setToastMsg] = useState("");
    const [showToast, setShowToast] = useState(false);

    const startDraw = () => {
        // 프리미엄 타로는 10 젤리가 필요
        if (churu < 10) {
            setToastMsg("운명의 타로를 열기엔 젤리가 부족합니다. (상점을 방문해보세요)");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        consumeChuru(10);
        setGameState("picking");
    };

    const pickCard = () => {
        setGameState("drawing");
        setTimeout(() => {
            const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
            setSelectedCard(randomCard);
            setGameState("result");
        }, 3000);
    };

    return (
        <main className="min-h-[100dvh] bg-background text-foreground relative overflow-hidden pb-40">
            <LuxuryToast message={toastMsg} isVisible={showToast} />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-3 text-secondary hover:text-foreground transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold tracking-widest uppercase">뒤로</span>
                    </button>
                    <JellyBalance />
                </div>

                <AnimatePresence mode="wait">
                    {/* State: Intro */}
                    {gameState === "intro" && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center space-y-12"
                        >
                            <div className="relative inline-block mt-20">
                                <div className="w-32 h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl mx-auto shadow-2xl shadow-purple-500/20 flex items-center justify-center relative z-10 animate-bounce" style={{ animationDuration: '3s' }}>
                                    <Sparkles className="w-12 h-12 text-white/50" />
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/20 blur-[50px] rounded-full" />
                            </div>

                            <div>
                                <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase mb-6 drop-shadow-lg">운명의 타로 리딩</h1>
                                <p className="text-xl text-secondary max-w-lg mx-auto leading-relaxed font-medium">
                                    고민되는 질문을 떠올리며<br />
                                    당신의 잠재의식과 연결된 카드를 뽑으세요.
                                </p>
                            </div>

                            <button
                                onClick={startDraw}
                                className="px-10 py-5 bg-surface border border-border-color rounded-3xl text-xl font-black text-foreground hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:border-purple-500/50 transition-all group relative overflow-hidden flex items-center gap-4 mx-auto"
                            >
                                <span className="relative z-10">10 젤리로 타로 뽑기</span>
                                <Star className="w-6 h-6 text-yellow-500 relative z-10 group-hover:rotate-180 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                        </motion.div>
                    )}

                    {/* State: Picking */}
                    {gameState === "picking" && (
                        <motion.div
                            key="picking"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="text-center"
                        >
                            <h2 className="text-3xl font-black text-foreground mb-12 animate-pulse">마음을 비우고 한 장을 선택하세요</h2>
                            <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
                                {Array.from({ length: 9 }).map((_, idx) => (
                                    <motion.button
                                        key={idx}
                                        whileHover={{ y: -10, scale: 1.05 }}
                                        onClick={pickCard}
                                        className="w-20 h-32 sm:w-24 sm:h-36 bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950 rounded-xl border border-white/10 shadow-xl shadow-purple-900/50 relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-x-0 h-full w-full bg-[url('/grid.svg')] opacity-20" />
                                        <div className="absolute inset-1 border border-white/5 rounded-lg" />
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
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
                            className="flex flex-col items-center justify-center py-32"
                        >
                            <div className="relative">
                                <Loader2 className="w-24 h-24 text-primary animate-spin" strokeWidth={1.5} />
                                <Sparkles className="w-8 h-8 text-yellow-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <p className="mt-8 text-2xl font-bold text-foreground animate-pulse tracking-widest">에너지를 공명하는 중...</p>
                        </motion.div>
                    )}

                    {/* State: Result */}
                    {gameState === "result" && selectedCard && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="bg-surface border border-border-color rounded-[3rem] p-10 sm:p-16 relative overflow-hidden shadow-2xl text-center">
                                <div className={`absolute top-0 inset-x-0 h-96 ${selectedCard.bg} blur-[100px] pointer-events-none`} />

                                <div className="relative z-10">
                                    <div className={`text-xl font-bold ${selectedCard.color} tracking-widest uppercase mb-4`}>당신의 카드</div>
                                    <h2 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-foreground mb-12">{selectedCard.name}</h2>

                                    <div className="bg-background border border-border-color rounded-3xl p-8 mb-10 text-left relative overflow-hidden">
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {selectedCard.meanings.map((m, i) => (
                                                <span key={i} className={`px-4 py-2 bg-surface border border-border-color rounded-full text-xs font-bold ${selectedCard.color}`}>
                                                    #{m}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-lg text-secondary leading-relaxed font-medium">
                                            {selectedCard.desc}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setGameState("intro")}
                                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-background border border-border-color rounded-2xl text-foreground font-bold hover:border-primary/50 transition-all shadow-sm group"
                                    >
                                        <Target className="w-5 h-5 group-hover:scale-110" />
                                        다시 한 장 뽑기
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
