"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Moon, Loader2, Sparkles, BookOpen, Search, Hash } from "lucide-react";
import JellyBalance from "@/components/shop/JellyBalance";
import { useWallet } from "@/components/WalletProvider";
import LuxuryToast from "@/components/ui/LuxuryToast";

export default function DreamsPage() {
    const router = useRouter();
    const { consumeChuru, churu } = useWallet();
    const [dream, setDream] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [toastMsg, setToastMsg] = useState("");
    const [showToast, setShowToast] = useState(false);

    const handleAnalyze = (e: React.FormEvent) => {
        e.preventDefault();

        if (dream.length < 2) {
            setToastMsg("검색어를 2자 이상 입력해주세요.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        if (churu < 20) {
            setToastMsg("꿈 해몽에는 20 젤리가 필요합니다.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        consumeChuru(20);
        setLoading(true);

        // Mock Analysis
        setTimeout(() => {
            setResult({
                category: "길몽 (吉夢)",
                title: "새로운 시작과 재물운의 상승",
                description: `입력해주신 '${dream.substring(0, 15)}...' 꿈은 전반적으로 긍정적인 에너지를 내포하고 있습니다.\n무의식 깊은 곳에서 변화에 대한 열망이 표출된 것으로 보이며, 특히 조력자를 만나거나 새로운 기회가 찾아올 징조입니다.`,
                luckyItem: "동전, 파란색 우산",
                luckyTime: "오후 3시 ~ 5시",
                score: 85
            });
            setLoading(false);
        }, 3000);
    };

    return (
        <main className="min-h-[100dvh] bg-[#0f172a] text-slate-200 relative overflow-hidden pb-40 font-sans">
            <LuxuryToast message={toastMsg} isVisible={showToast} />
            <div className="absolute inset-x-0 top-0 h-[80dvh] bg-gradient-to-b from-indigo-900/40 via-purple-900/10 to-transparent pointer-events-none" />

            {/* Stars */}
            <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_#fff]" />
            <div className="absolute top-40 right-20 w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse delay-75 shadow-[0_0_8px_#93c5fd]" />
            <div className="absolute top-60 left-1/4 w-3 h-3 rounded-full bg-yellow-200 animate-[pulse_3s_ease-in-out_infinite] shadow-[0_0_15px_#fef08a]" />

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                <div className="flex items-center justify-between mb-16">
                    <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-400 hover:text-white transition-all group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold tracking-widest uppercase">뒤로</span>
                    </button>
                    <JellyBalance />
                </div>

                {!result && !loading && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center">
                        <div className="relative inline-block mb-8">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                            <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-indigo-500/30 text-indigo-400 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                                <Moon className="w-12 h-12" />
                            </div>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-white">어떤 꿈을 꾸셨나요?</h1>
                        <p className="text-sm sm:text-base text-slate-400 font-medium mb-10">간밤에 꾼 꿈의 키워드를 검색해보세요.</p>

                        <form onSubmit={handleAnalyze} className="relative group text-left max-w-xl mx-auto">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-xl flex items-center p-2 pl-6">
                                <Search className="w-6 h-6 text-slate-400 mr-3 shrink-0" />
                                <input
                                    type="text"
                                    value={dream}
                                    onChange={(e) => setDream(e.target.value)}
                                    placeholder="예: 돼지, 호랑이, 싸우는 꿈"
                                    className="w-full bg-transparent border-none text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0 text-lg sm:text-xl py-4 h-auto"
                                />
                                <button type="submit" className="shrink-0 px-6 sm:px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-md transition-colors ml-2">
                                    해몽하기
                                </button>
                            </div>
                        </form>

                        {/* 추천 해시태그 칩 (Jeomsin Style) */}
                        <div className="mt-10 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                            {[
                                { keyword: "딸기", desc: "식탁 위 딸기" },
                                { keyword: "싸움", desc: "다른 사람과의 싸움" },
                                { keyword: "말", desc: "말에게 먹이 주기" },
                                { keyword: "바위", desc: "바위 낳는 꿈" },
                                { keyword: "돼지", desc: "돼지에게 물리는 꿈" },
                                { keyword: "물", desc: "맑은 물이 솟아나는 꿈" }
                            ].map((tag, i) => (
                                <button
                                    key={i}
                                    onClick={() => setDream(tag.keyword)}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/80 border border-slate-700 rounded-full text-sm text-slate-300 hover:text-white transition-colors group"
                                >
                                    <Hash className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300" />
                                    <span className="font-bold">{tag.keyword}</span>
                                    <span className="text-[10px] text-slate-500 hidden sm:inline-block ml-1">({tag.desc})</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40">
                        <div className="relative">
                            <Loader2 className="w-24 h-24 text-indigo-500 animate-spin" strokeWidth={1} />
                            <Moon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-300 animate-pulse" />
                        </div>
                        <h3 className="mt-8 text-2xl font-bold tracking-widest text-indigo-200 animate-pulse">무의식의 조각을 맞추는 중...</h3>
                    </motion.div>
                )}

                {result && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
                        <div className="bg-slate-900 border border-indigo-500/30 rounded-[3rem] p-10 sm:p-14 relative overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.15)] text-center">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />

                            <div className="relative z-10 mb-10">
                                <span className="inline-block px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/40 rounded-full text-indigo-300 font-bold mb-6 tracking-widest text-sm uppercase">
                                    {result.category}
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-black mb-6 text-white tracking-tight">{result.title}</h2>
                                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 pb-2">
                                    {result.score}점
                                </div>
                                <div className="text-sm text-slate-500 font-bold uppercase tracking-widest">오늘의 길운 지수</div>
                            </div>

                            <div className="relative z-10 text-left bg-slate-950/50 border border-slate-800 p-8 rounded-3xl mb-8">
                                <BookOpen className="w-6 h-6 text-indigo-400 mb-4" />
                                <p className="text-lg text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                                    {result.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl text-left">
                                    <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-widest">행운의 아이템</div>
                                    <div className="text-indigo-300 font-bold text-lg">{result.luckyItem}</div>
                                </div>
                                <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl text-left">
                                    <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-widest">운이 상승하는 시간</div>
                                    <div className="text-purple-300 font-bold text-lg">{result.luckyTime}</div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-12">
                            <button
                                onClick={() => { setResult(null); setDream(""); }}
                                className="px-10 py-4 bg-transparent border-2 border-slate-700 rounded-full text-slate-300 hover:text-white hover:border-slate-500 transition-all font-bold"
                            >
                                다른 꿈의 의미 찾기
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
