"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Loader2, Sparkles, BookOpen } from "lucide-react";
import JellyBalance from "@/components/shop/JellyBalance";
import { useWallet } from "@/components/WalletProvider";
import LuxuryToast from "@/components/ui/LuxuryToast";

const ELEMENTS = ["木", "火", "土", "金", "水"];

export default function NamingPage() {
    const router = useRouter();
    const { consumeChuru, churu } = useWallet();
    const [name, setName] = useState("");
    const [hanja, setHanja] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [toastMsg, setToastMsg] = useState("");
    const [showToast, setShowToast] = useState(false);

    const handleAnalyze = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setToastMsg("이름을 입력해주세요.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        if (churu < 30) {
            setToastMsg("정통 작명/이름 분석에는 30 젤리가 필요합니다.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        consumeChuru(30);
        setLoading(true);

        // Mock Analysis
        setTimeout(() => {
            const sumScore = Math.floor(Math.random() * 20) + 80; // 80 ~ 99
            setResult({
                score: sumScore,
                pronunciation: "소리 오행이 상생(相生) 구조를 이루어 대인관계가 원만하고 인덕이 있습니다.",
                meaning: "빛나고 크게 성장한다는 의미로, 재물운과 명예운을 동시에 끌어당기는 기운이 깃들어 있습니다.",
                fiveElements: {
                    wood: Math.floor(Math.random() * 50) + 50,
                    fire: Math.floor(Math.random() * 50) + 50,
                    earth: Math.floor(Math.random() * 50) + 20,
                    metal: Math.floor(Math.random() * 50) + 30,
                    water: Math.floor(Math.random() * 50) + 40,
                }
            });
            setLoading(false);
        }, 2500);
    };

    return (
        <main className="min-h-[100dvh] bg-background text-foreground relative overflow-hidden pb-40">
            <LuxuryToast message={toastMsg} isVisible={showToast} />
            <div className="absolute inset-x-0 top-0 h-[50dvh] bg-gradient-to-b from-rose-900/10 to-transparent pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                <div className="flex items-center justify-between mb-16">
                    <button onClick={() => router.back()} className="flex items-center gap-3 text-secondary hover:text-foreground transition-all group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold tracking-widest uppercase">뒤로</span>
                    </button>
                    <JellyBalance />
                </div>

                {!result && !loading && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
                        <div className="text-center mb-12">
                            <div className="w-20 h-20 rounded-3xl bg-surface border border-rose-500/20 text-rose-500 mx-auto flex items-center justify-center mb-6 shadow-xl">
                                <BookOpen className="w-10 h-10" />
                            </div>
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-4">정통 이름 분석</h1>
                            <p className="text-secondary font-medium">소리 오행, 음양오행, 그리고 한자의 뜻을 종합하여 당신의 이름에 깃든 잠재된 운명을 풀어냅니다.</p>
                        </div>

                        <form onSubmit={handleAnalyze} className="bg-surface border border-border-color p-8 rounded-4xl shadow-2xl relative overflow-hidden">
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <label className="block text-sm font-bold text-secondary mb-2">분석할 이름 (한글)</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="홍길동"
                                        className="w-full bg-background border border-border-color rounded-2xl px-6 py-4 text-foreground font-black text-xl focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all text-center"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-secondary mb-2">한자 (선택사항)</label>
                                    <input
                                        type="text"
                                        value={hanja}
                                        onChange={(e) => setHanja(e.target.value)}
                                        placeholder="洪吉童"
                                        className="w-full bg-background border border-border-color rounded-2xl px-6 py-4 text-foreground font-medium text-lg focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all text-center"
                                    />
                                </div>
                                <button type="submit" className="w-full py-5 mt-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(225,29,72,0.3)] transition-all hover:-translate-y-1">
                                    30 젤리로 작명/이름 분석하기
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40">
                        <div className="relative">
                            <Loader2 className="w-20 h-20 text-rose-500 animate-spin" />
                            <div className="absolute inset-0 border-t-2 border-r-2 border-rose-400 rounded-full animate-spin direction-reverse" style={{ animationDuration: '2s' }} />
                        </div>
                        <h3 className="mt-8 text-2xl font-black animate-pulse text-foreground">이름의 기운을 풀이하는 중...</h3>
                    </motion.div>
                )}

                {result && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-2xl mx-auto">
                        <div className="bg-surface rounded-5xl p-10 md:p-14 border border-rose-500/30 shadow-[0_0_50px_rgba(225,29,72,0.1)] relative overflow-hidden text-center">
                            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-rose-500/20 to-transparent" />

                            <div className="relative z-10 mb-12">
                                <h2 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter text-foreground">{name} {hanja && <span className="text-3xl text-secondary ml-2">({hanja})</span>}</h2>
                                <div className="inline-flex items-center gap-3 px-6 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 font-bold">
                                    <Sparkles className="w-5 h-5" />
                                    종합 길흉 지수: {result.score} / 100
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 text-left">
                                <div className="bg-background border border-border-color p-6 rounded-3xl">
                                    <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-3">발음 오행의 흐름</h3>
                                    <p className="text-foreground leading-relaxed font-medium">{result.pronunciation}</p>
                                </div>
                                <div className="bg-background border border-border-color p-6 rounded-3xl">
                                    <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-3">수리/자원 오행의 뜻</h3>
                                    <p className="text-foreground leading-relaxed font-medium">{result.meaning}</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center pt-8">
                            <button
                                onClick={() => { setResult(null); setName(""); setHanja(""); }}
                                className="px-8 py-4 bg-surface border border-border-color rounded-2xl font-bold hover:bg-white/5 transition-all"
                            >
                                다른 이름 분석하기
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
