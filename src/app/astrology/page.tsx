"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, Loader2, Sparkles, Compass } from "lucide-react";
import JellyBalance from "@/components/shop/JellyBalance";
import { useWallet } from "@/components/WalletProvider";
import LuxuryToast from "@/components/ui/LuxuryToast";

const ZODIACS = [
    { id: "aries", name: "양자리", icon: "♈", dates: "3.21 - 4.19" },
    { id: "taurus", name: "황소자리", icon: "♉", dates: "4.20 - 5.20" },
    { id: "gemini", name: "쌍둥이자리", icon: "♊", dates: "5.21 - 6.20" },
    { id: "cancer", name: "게자리", icon: "♋", dates: "6.21 - 7.22" },
    { id: "leo", name: "사자자리", icon: "♌", dates: "7.23 - 8.22" },
    { id: "virgo", name: "처녀자리", icon: "♍", dates: "8.23 - 9.22" },
    { id: "libra", name: "천칭자리", icon: "♎", dates: "9.23 - 10.22" },
    { id: "scorpio", name: "전갈자리", icon: "♏", dates: "10.23 - 11.21" },
    { id: "sagittarius", name: "사수자리", icon: "♐", dates: "11.22 - 12.21" },
    { id: "capricorn", name: "염소자리", icon: "♑", dates: "12.22 - 1.19" },
    { id: "aquarius", name: "물병자리", icon: "♒", dates: "1.20 - 2.18" },
    { id: "pisces", name: "물고기자리", icon: "♓", dates: "2.19 - 3.20" },
];

export default function AstrologyPage() {
    const router = useRouter();
    const { consumeChuru, churu } = useWallet();
    const [selected, setSelected] = useState<typeof ZODIACS[0] | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [toastMsg, setToastMsg] = useState("");
    const [showToast, setShowToast] = useState(false);

    const handleAnalyze = (zodiac: typeof ZODIACS[0]) => {
        setSelected(zodiac);

        if (churu < 15) {
            setToastMsg("별자리 운세 리딩에는 15 젤리가 필요합니다.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        consumeChuru(15);
        setLoading(true);

        // Mock Analysis
        setTimeout(() => {
            setResult({
                daily: "오늘은 수성이 순행하며 의사소통이 원활해지는 시기입니다. 고민하던 일이 술술 풀리며 예상치 못한 재물운이 따릅니다.",
                love: "금성의 긍정적인 각도로 새로운 인연과의 만남이 유리한 시기. 솔로라면 모임에 꼭 참석하세요.",
                career: "업무에서 리더십을 발휘할 수 있는 기회가 찾아옵니다. 당신의 의견을 적극적으로 어필하는 것이 좋습니다.",
                luckyColor: "네이비",
                luckyNumber: 7
            });
            setLoading(false);
        }, 2500);
    };

    return (
        <main className="min-h-[100dvh] bg-slate-950 text-slate-200 relative overflow-hidden pb-40">
            <LuxuryToast message={toastMsg} isVisible={showToast} />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

            {/* Cosmic Background */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
                <div className="flex items-center justify-between mb-16">
                    <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-400 hover:text-white transition-all group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold tracking-widest uppercase">뒤로</span>
                    </button>
                    <JellyBalance />
                </div>

                <div className="text-center mb-16">
                    <Compass className="w-12 h-12 text-cyan-400 mx-auto mb-6 animate-[spin_10s_linear_infinite]" />
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase mb-4 text-white">서양 점성술</h1>
                    <p className="text-xl text-slate-400 font-medium">당신의 수호성이 전하는 오늘의 우주적 메시지를 확인하세요.</p>
                </div>

                {!result && !loading && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {ZODIACS.map((zodiac) => (
                            <button
                                key={zodiac.id}
                                onClick={() => handleAnalyze(zodiac)}
                                className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-[2rem] p-6 text-center hover:border-cyan-500/50 hover:bg-slate-800 transition-all group relative overflow-hidden flex flex-col items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                            >
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-cyan-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-4xl mb-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] group-hover:scale-125 transition-transform duration-500 relative z-10">
                                    {zodiac.icon}
                                </span>
                                <div className="relative z-10">
                                    <div className="text-slate-200 font-bold mb-1 tracking-wider text-sm">{zodiac.name}</div>
                                    <div className="text-[10px] text-slate-500 font-mono tracking-tighter">{zodiac.dates}</div>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}

                {loading && selected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32">
                        <div className="relative text-7xl text-cyan-400 animate-pulse mb-10 drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]">
                            {selected.icon}
                        </div>
                        <h3 className="text-2xl font-bold tracking-widest text-slate-300 animate-pulse">{selected.name}의 궤도를 읽는 중...</h3>
                    </motion.div>
                )}

                {result && selected && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
                        <div className="bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/30 rounded-[3rem] p-10 relative overflow-hidden shadow-[0_20px_60px_rgba(8,145,178,0.2)] text-center">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />

                            <div className="relative z-10 mb-12">
                                <div className="text-8xl mb-6 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] text-cyan-300">{selected.icon}</div>
                                <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-2">오늘의 {selected.name}</h1>
                                <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase">{selected.dates}</p>
                            </div>

                            <div className="space-y-6 relative z-10 text-left">
                                <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-cyan-400" /> 총평 (Daily)
                                    </h3>
                                    <p className="text-lg text-slate-200 leading-relaxed">{result.daily}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800">
                                        <h3 className="text-sm font-bold text-pink-400 uppercase tracking-widest mb-3">연애운 (Love)</h3>
                                        <p className="text-slate-300 leading-relaxed font-medium">{result.love}</p>
                                    </div>
                                    <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800">
                                        <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-3">재물/직업 (Career)</h3>
                                        <p className="text-slate-300 leading-relaxed font-medium">{result.career}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
                                <div className="border border-slate-800 bg-slate-900/50 p-4 rounded-2xl flex flex-col items-center">
                                    <div className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-1">행운의 컬러</div>
                                    <div className="text-xl font-black text-white">{result.luckyColor}</div>
                                </div>
                                <div className="border border-slate-800 bg-slate-900/50 p-4 rounded-2xl flex flex-col items-center">
                                    <div className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-1">행운의 숫자</div>
                                    <div className="text-xl font-black text-white">{result.luckyNumber}</div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center pt-8">
                            <button
                                onClick={() => { setResult(null); setSelected(null); }}
                                className="px-8 py-4 bg-transparent border-2 border-slate-700 rounded-full text-slate-300 hover:text-white hover:border-cyan-500 transition-all font-bold tracking-widest uppercase"
                            >
                                별자리 목록으로
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
