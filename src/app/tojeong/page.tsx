"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Loader2, Sparkles, Star, Zap, User, Calendar } from "lucide-react";
import JellyBalance from "@/components/shop/JellyBalance";
import { useWallet } from "@/components/WalletProvider";
import { useProfiles } from "@/components/ProfileProvider";
import LuxuryToast from "@/components/ui/LuxuryToast";
import { cn } from "@/lib/utils";

export default function TojeongPage() {
    const router = useRouter();
    const { consumeChuru, churu } = useWallet();
    const { profiles, activeProfile, setActiveProfileById } = useProfiles();

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [toastMsg, setToastMsg] = useState("");
    const [showToast, setShowToast] = useState(false);

    const handleCalculate = () => {
        if (churu < 40) {
            setToastMsg("토정비결 정밀 분석에는 40 젤리가 필요합니다.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        consumeChuru(40);
        setLoading(true);

        // 프로필 기반 토정비결 결과 시뮬레이션
        setResult({
            year: 2026,
            title: `${activeProfile?.name || "사용자"}님의 2026년 병오년(丙午年) 총운`,
            general: "올해는 '붉은 말이 들판을 달리는 형상'으로, 매우 역동적이고 에너지가 넘치는 한 해가 될 것입니다. 전반기에는 그동안 준비했던 일들이 결실을 맺기 시작하며, 후반기에는 명예운이 상승하여 주변의 인정을 받게 됩니다. 다만, 너무 급하게 서두르면 실수가 생길 수 있으니 완급 조절이 필수입니다.",
            monthly: [
                { month: "1-3월", desc: "새로운 시작의 기운. 주변의 조력자가 나타나 큰 힘이 됩니다." },
                { month: "4-6월", desc: "재물운이 상승하는 시기. 뜻밖의 소득이나 기회가 찾아옵니다." },
                { month: "7-9월", desc: "건강관리에 유의해야 할 시기. 내실을 다지며 쉬어가는 것이 좋습니다." },
                { month: "10-12월", desc: "최고의 명예운. 당신의 이름이 널리 알려지고 성취를 맛봅니다." }
            ],
            luckyDirections: ["동쪽", "북서쪽"],
            luckyNumbers: [3, 7, 12]
        });
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden pb-40 font-sans">
            <LuxuryToast message={toastMsg} isVisible={showToast} />

            {/* Background Ambience */}
            <div className="absolute inset-x-0 top-0 h-[70dvh] bg-gradient-to-b from-amber-900/20 via-slate-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                <header className="flex items-center justify-between mb-16">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </button>
                    <JellyBalance />
                </header>

                <div className="text-center mb-16 space-y-4">
                    <div className="hero-kicker text-amber-300 border-amber-400/40">
                        <Calendar className="w-3 h-3" /> 연간 운세 엔진
                    </div>
                    <h1 className="text-4xl sm:text-7xl font-black italic tracking-tighter uppercase text-white leading-none">
                        2026 <span className="text-amber-500 text-6xl block sm:inline">토정비결</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic animate-pulse">
                        전통 데이터 기반 연간 운세 궤적을 정밀 해석합니다.
                    </p>
                </div>

                {!result && !loading && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                        {/* Profile Selector */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 max-w-xl mx-auto text-center">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">운세 프로필 노드</h3>
                                <div className="flex gap-2">
                                    {profiles.slice(0, 4).map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setActiveProfileById(p.id)}
                                            className={cn(
                                                "w-8 h-8 rounded-xl border flex items-center justify-center transition-all",
                                                activeProfile?.id === p.id
                                                    ? "bg-amber-600 border-amber-400 scale-110 shadow-lg"
                                                    : "bg-white/5 border-white/10 opacity-40 hover:opacity-80"
                                            )}
                                        >
                                            <User className="w-3.5 h-3.5" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-2xl font-black italic text-amber-200">{activeProfile?.name}</span>
                                <p className="text-[10px] text-slate-500 uppercase font-black opacity-70">
                                    {activeProfile?.birthdate} / {activeProfile?.calendarType === 'lunar' ? "음력" : "양력"} 기준
                                </p>
                            </div>
                        </div>

                        <div className="max-w-xl mx-auto space-y-6">
                            <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 text-center group cursor-pointer overflow-hidden shadow-2xl relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                <div className="w-24 h-24 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-8 shadow-inner">
                                    <BookOpen className="w-12 h-12" />
                                </div>
                                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-4">정통 비결 분석 시작</h3>
                                <p className="text-xs text-slate-500 mb-10 leading-relaxed font-bold italic">
                                    전통 비결 원리를 현대 분석 엔진으로 재정렬해 <br />
                                    당신의 2026년 한 해 흐름을 단계별로 제시합니다.
                                </p>
                                {/* Free vs Premium Highlight UI */}
                                <div className="bg-black/40 rounded-3xl p-6 lg:p-8 space-y-5 border border-rose-500/20 shadow-inner mb-8 mt-6 relative z-10 w-full text-left">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Zap className="w-3.5 h-3.5 text-rose-500" /> 사용 비용
                                        </span>
                                        <span className="text-sm font-black flex items-center gap-2 text-rose-400 italic tracking-widest bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                                            <Star className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> 40 Jelly
                                        </span>
                                    </div>
                                <p className="text-[10px] text-slate-500 font-bold hidden sm:block">명리학 AI 기반 정밀 연간 해석 엔진</p>
                                </div>

                                <button
                                    onClick={handleCalculate}
                                    className="w-full py-5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-2xl font-black uppercase italic tracking-[0.2em] text-xs shadow-xl shadow-rose-900/40 transition-all active:scale-95 border border-rose-400/50 flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" /> 리딩 시작하기 (40 Jelly)
                                </button>
                            </div>
                            <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                연간 운세 프레임워크 v2.6
                            </p>
                        </div>
                    </motion.div>
                )}

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40">
                        <div className="relative">
                            <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
                            <Loader2 className="w-28 h-28 text-amber-500 animate-spin" strokeWidth={1} />
                            <Star className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-amber-300 animate-pulse" />
                        </div>
                        <h3 className="mt-12 text-2xl font-black uppercase italic tracking-[0.2em] text-amber-200 animate-pulse">연간 흐름 계산 중...</h3>
                        <p className="mt-2 text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">토정비결 규칙으로 해석 레이어를 조립 중</p>
                    </motion.div>
                )}

                {result && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-12">
                        {/* Summary Header */}
                        <div className="bg-slate-900/60 backdrop-blur-2xl border border-amber-500/20 rounded-[4rem] p-10 sm:p-14 relative overflow-hidden shadow-2xl text-center">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] -mr-40 -mt-40" />

                            <div className="relative z-10 mb-10">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 font-black mb-10 tracking-[0.3em] text-[10px] uppercase">
                                        <Sparkles className="w-3.5 h-3.5" /> 종합 분석 보고서
                                    </div>
                                <h2 className="text-3xl sm:text-5xl font-black mb-8 text-white tracking-tighter uppercase italic leading-tight">
                                    {result.title}
                                </h2>
                                <div className="text-lg text-slate-300 leading-relaxed font-bold italic opacity-90 text-left bg-black/40 p-8 rounded-[2.5rem] border border-white/5">
                                    &ldquo;{result.general}&rdquo;
                                </div>
                            </div>

                            {/* Monthly Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left relative z-10">
                                {result.monthly.map((m: any, i: number) => (
                                    <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-3xl group hover:bg-white/10 transition-colors">
                                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 border-b border-white/10 pb-1">{m.month} 집중 포인트</div>
                                        <p className="text-sm text-slate-300 font-bold italic leading-relaxed">{m.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Extras */}
                            <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                                <div className="p-6 bg-slate-950/60 rounded-3xl border border-white/5 text-left">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">최적 방향</h4>
                                    <div className="text-amber-200 font-black text-sm uppercase italic">{result.luckyDirections.join(", ")}</div>
                                </div>
                                <div className="p-6 bg-slate-950/60 rounded-3xl border border-white/5 text-left">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">공명 수치</h4>
                                    <div className="text-amber-200 font-black text-sm italic">{result.luckyNumbers.join(", ")}</div>
                                </div>
                            </div>

                            {/* 운세 점수 시각화 */}
                            {(() => {
                                const seed = (activeProfile?.name || "X").charCodeAt(0) || 65;
                                const scores = [
                                    { label: "재물운", value: 50 + (seed * 3) % 45, color: "bg-amber-500" },
                                    { label: "건강운", value: 55 + (seed * 7) % 40, color: "bg-emerald-500" },
                                    { label: "애정운", value: 45 + (seed * 11) % 50, color: "bg-rose-500" },
                                    { label: "직업운", value: 60 + (seed * 5) % 35, color: "bg-blue-500" },
                                    { label: "대인운", value: 50 + (seed * 9) % 45, color: "bg-purple-500" },
                                ];
                                const overall = Math.round(scores.reduce((a, s) => a + s.value, 0) / scores.length);
                                return (
                                    <div className="mt-8 relative z-10 bg-black/40 rounded-3xl p-8 border border-white/5">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">2026 운세 매트릭스</div>
                                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">{overall}점</div>
                                        </div>
                                        <div className="space-y-4">
                                            {scores.map((s, i) => (
                                                <div key={s.label} className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="font-bold text-slate-400">{s.label}</span>
                                                        <span className="font-black text-white">{Math.min(99, s.value)}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(99, s.value)}%` }}
                                                            transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                                            className={`h-full rounded-full ${s.color}`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            <button
                                onClick={() => setResult(null)}
                                className="w-full mt-12 py-5 bg-transparent border-2 border-white/5 rounded-2xl text-slate-500 hover:text-white hover:border-amber-500/30 transition-all font-black uppercase italic tracking-widest text-xs"
                            >
                                다시 계산하기
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
