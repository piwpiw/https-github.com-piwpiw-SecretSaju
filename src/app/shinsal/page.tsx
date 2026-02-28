"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getProfiles, SajuProfile } from "@/lib/storage";
import { ArrowLeft, Sparkles, Flame, Wind, Droplets, Loader2, Target, Eye, Shield } from "lucide-react";
import Link from "next/link";
import JellyBalance from "@/components/shop/JellyBalance";

const SHINSAL_TYPES = [
    {
        id: "dohwa",
        name: "도화살 (桃花殺)",
        desc: "매력과 인기를 끌어당기는 기운. 연예인, 인플루언서에게서 강하게 발현됩니다.",
        icon: Flame,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        probability: 85
    },
    {
        id: "yeokma",
        name: "역마살 (驛馬殺)",
        desc: "한곳에 머물지 않고 끊임없이 이동하며 변화를 추구하는 자유로운 영혼의 에너지입니다.",
        icon: Wind,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        probability: 60
    },
    {
        id: "baekho",
        name: "백호대살 (白虎大殺)",
        desc: "강력한 추진력과 결단력을 의미하지만, 때로는 급격한 감정 변화를 동반할 수 있습니다.",
        icon: Shield,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        probability: 40
    },
];

export default function ShinsalPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<SajuProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState<typeof SHINSAL_TYPES | null>(null);

    useEffect(() => {
        const load = () => {
            const profiles = getProfiles();
            if (profiles.length > 0) {
                setProfile(profiles[0]);
            }
            setLoading(false);
        };
        load();
    }, []);

    const handleAnalyze = () => {
        setAnalyzing(true);
        // Simulate deep analysis
        setTimeout(() => {
            // Randomize probabilities based on "profile id" length (mock logic)
            const seed = profile ? profile.name.length : 3;
            const updated = SHINSAL_TYPES.map((t, i) => ({
                ...t,
                // pseudo-random logic that feels personal
                probability: Math.min(99, Math.max(10, t.probability + (seed * (i % 2 === 0 ? 5 : -5))))
            })).sort((a, b) => b.probability - a.probability);
            setResults(updated);
            setAnalyzing(false);
        }, 2000);
    };

    if (loading) {
        return (
            <main className="min-h-[100dvh] bg-background flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </main>
        );
    }

    if (!profile) {
        return (
            <main className="min-h-[100dvh] bg-background flex items-center justify-center flex-col px-6 text-center space-y-6">
                <div className="w-24 h-24 bg-surface border border-border-color rounded-3xl flex items-center justify-center">
                    <Target className="w-12 h-12 text-primary opacity-50" />
                </div>
                <h2 className="text-2xl font-black text-foreground">사주 프로필이 필요합니다</h2>
                <p className="text-secondary font-medium">신살(神殺) 분석을 위해 먼저 프로필을 등록해주세요.</p>
                <Link href="/" className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl">
                    메인으로 이동
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-[100dvh] bg-background text-foreground relative overflow-hidden pb-40">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

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

                {/* Hero */}
                <div className="text-center mb-16 space-y-6">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block relative">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                        <div className="w-24 h-24 mx-auto rounded-full bg-surface border-4 border-border-color flex items-center justify-center relative z-10 shadow-2xl">
                            <Sparkles className="w-12 h-12 text-primary" />
                        </div>
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter uppercase mb-4 text-foreground">
                            숨겨진 살(殺)의 에너지를 깨우다
                        </h1>
                        <p className="text-lg text-secondary font-medium max-w-xl mx-auto leading-relaxed">
                            <span className="text-primary font-bold">{profile.name}</span>님의 사주에 잠재된 신살(도화/역마/백호 등)의 발현 확률과 그 에너지를 활용하는 방법을 심층 분석합니다.
                        </p>
                    </motion.div>
                </div>

                {!results && !analyzing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mt-20">
                        <button
                            onClick={handleAnalyze}
                            className="px-12 py-6 bg-foreground text-background font-black text-2xl uppercase tracking-widest rounded-4xl hover:bg-primary transition-colors shadow-2xl hover:shadow-primary/20 duration-500 group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-4">
                                심층 신살 분석 시작 <Eye className="w-8 h-8 group-hover:animate-pulse" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </button>
                    </motion.div>
                )}

                {analyzing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 space-y-8">
                        <div className="relative">
                            <Loader2 className="w-20 h-20 text-primary animate-spin" />
                            <div className="absolute inset-0 rounded-full border-t-2 border-l-2 border-primary animate-spin direction-reverse" style={{ animationDuration: '3s' }} />
                        </div>
                        <p className="text-2xl font-bold text-foreground animate-pulse">{profile.name}님의 숨겨진 에너지를 스캔 중...</p>
                    </motion.div>
                )}

                {results && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        <h3 className="text-xl font-black text-secondary uppercase tracking-[0.3em] text-center mb-12 flex items-center justify-center gap-4">
                            <div className="w-12 h-px bg-border-color" />
                            분석 결과 리포트
                            <div className="w-12 h-px bg-border-color" />
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                            {results.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.2 }}
                                    className="bg-surface border border-border-color rounded-4xl p-8 sm:p-10 relative overflow-hidden group hover:border-border-color/80 transition-all shadow-xl hover:shadow-2xl"
                                >
                                    <div className={`absolute top-0 right-0 w-64 h-64 ${item.bg} blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000`} />

                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
                                        <div className={`w-24 h-24 rounded-3xl ${item.bg} ${item.border} border flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-12 transition-transform duration-500`}>
                                            <item.icon className={`w-12 h-12 ${item.color}`} />
                                        </div>

                                        <div className="flex-1 text-center sm:text-left">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                <h4 className="text-3xl font-black italic text-foreground uppercase">{item.name}</h4>
                                                <div className="flex items-center justify-center sm:justify-end gap-2 bg-background px-4 py-2 rounded-2xl border border-border-color">
                                                    <span className="text-xs font-bold text-secondary uppercase tracking-widest">발현 확률</span>
                                                    <span className={`text-2xl font-black ${item.color}`}>{item.probability}%</span>
                                                </div>
                                            </div>
                                            <p className="text-lg text-secondary font-medium leading-relaxed">{item.desc}</p>

                                            {/* Progress Bar */}
                                            <div className="mt-8 h-3 w-full bg-background rounded-full overflow-hidden border border-border-color">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.probability}%` }}
                                                    transition={{ duration: 1.5, delay: 0.5 + (idx * 0.2), ease: "easeOut" }}
                                                    className={`h-full ${item.bg.replace('/10', '')} border-r border-[#ffffff20]`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="mt-20 text-center">
                            <p className="text-secondary font-medium mb-8">신살 에너지를 내 편으로 만들고 싶으신가요?</p>
                            <Link href="/dashboard" className="inline-flex py-6 px-12 rounded-3xl bg-surface border-2 border-border-color text-foreground font-black text-xl hover:bg-background transition-all shadow-lg hover:shadow-xl items-center gap-4">
                                전체 운명 지도 보기 <ArrowLeft className="w-6 h-6 rotate-180" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
