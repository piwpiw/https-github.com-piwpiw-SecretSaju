"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar, ArrowLeft, Sun, Cloud, CloudRain, Star, Shield, BatteryMedium, TrendingUp, Sparkles, AlertCircle, Clock, ChevronRight, Zap, Target, Heart } from "lucide-react";
import JellyBalance from "@/components/shop/JellyBalance";
import { useWallet } from "@/components/WalletProvider";
import LuxuryToast from "@/components/ui/LuxuryToast";
import { getProfiles, SajuProfile } from "@/lib/storage";
import { useLocale } from "@/lib/i18n";
import { generateDailyFortune, DailyFortuneResult } from "@/lib/daily-fortune";
import Link from "next/link";
import { Suspense } from "react";

function DailyFortuneContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const profileId = searchParams.get("profileId");
    const { t, locale } = useLocale();
    const { consumeChuru, churu } = useWallet();
    const [profile, setProfile] = useState<SajuProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DailyFortuneResult | null>(null);
    const [activeTab, setActiveTab] = useState<"today" | "tomorrow" | "month">("today");
    const [toastMsg, setToastMsg] = useState("");
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const p = getProfiles();
        if (p.length > 0) {
            const found = profileId ? p.find(prof => prof.id === profileId) : null;
            setProfile(found || p[0]);
        }
    }, [profileId]);

    useEffect(() => {
        if (profile) {
            handleAnalyze();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, profile]);

    const handleAnalyze = async () => {
        if (!profile) return router.push("/my-saju/add");

        setLoading(true);
        consumeChuru(0); // 일별 무료

        try {
            const targetDate = new Date();
            if (activeTab === "tomorrow") {
                targetDate.setDate(targetDate.getDate() + 1);
            } else if (activeTab === "month") {
                targetDate.setMonth(targetDate.getMonth() + 1);
                targetDate.setDate(1); // Next month start
            }

            const fortune = await generateDailyFortune(profile, locale, targetDate);
            setResult(fortune);
        } catch (error) {
            console.error("Daily fortune generation error:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderWeather = (weather: string) => {
        switch (weather) {
            case "sunny": return <Sun className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />;
            case "cloudy": return <Cloud className="w-12 h-12 text-slate-400 drop-shadow-[0_0_15px_rgba(148,163,184,0.5)]" />;
            case "rain": return <CloudRain className="w-12 h-12 text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />;
            default: return <Sun className="w-12 h-12 text-yellow-400" />;
        }
    };

    return (
        <main className="min-h-screen bg-[#0f0f1a] text-foreground relative overflow-hidden pb-40">
            <LuxuryToast message={toastMsg} isVisible={showToast} />
            <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 relative z-10">
                {/* Global Top Nav */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black tracking-widest uppercase">{t('common.back')}</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <JellyBalance />
                    </div>
                </div>

                {/* Jeomsin Style Header */}
                <div className="mb-12 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4"
                            >
                                <Zap className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                                <span className="text-[10px] font-black text-indigo-300 tracking-wider uppercase">실시간 사주 동기화</span>
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-2 uppercase leading-none">
                                {t('daily.title')}
                            </h1>
                            <p className="text-slate-400 text-sm font-medium tracking-wide">
                                {locale === 'ko' ? '오늘 하루 당신을 향한 별들의 속삭임' : 'Celestial whispers for your day'}
                            </p>
                        </div>

                        {/* Tab Switchers */}
                        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5 backdrop-blur-md self-center md:self-end">
                            {[
                                { id: "today", label: "오늘" },
                                { id: "tomorrow", label: "내일" },
                                { id: "month", label: "이달" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl text-xs font-black transition-all",
                                        activeTab === tab.id
                                            ? "bg-white text-black shadow-lg"
                                            : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {!result && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-xl mx-auto"
                    >
                        <div className="premium-card p-12 text-center border-white/10 bg-white/[0.02] shadow-2xl">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(99,102,241,0.3)] relative group cursor-pointer" onClick={handleAnalyze}>
                                <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Calendar className="w-12 h-12 text-white relative z-10" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-4 italic tracking-tight uppercase">오늘의 운세 분석</h2>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-12 whitespace-pre-line">
                                당신의 생년월일과 현재 조석의 기운을 대조하여<br />하루의 흐름을 예측합니다.
                            </p>

                            <button
                                onClick={handleAnalyze}
                                className="w-full py-6 bg-white text-black font-black text-xl rounded-2xl shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-4 group"
                            >
                                <Sparkles className="w-6 h-6 text-indigo-500" />
                                {t('daily.cta')}
                                <ChevronRight className="w-6 h-6 text-slate-300 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Recommendations */}
                        <div className="mt-12 grid grid-cols-2 gap-4">
                            <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl flex flex-col items-center text-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">성장 (Growth)</span>
                                <p className="text-white text-xs font-bold">성공 확률 92%</p>
                            </div>
                            <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl flex flex-col items-center text-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
                                    <Heart className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">연애 (Love)</span>
                                <p className="text-white text-xs font-bold">인기 급상승</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40">
                        <div className="relative w-40 h-40 rounded-full border border-white/5 flex items-center justify-center mb-12">
                            <motion.div
                                className="absolute inset-0 rounded-full border-t-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="text-center">
                                <Sun className="w-12 h-12 text-indigo-400 animate-pulse mx-auto mb-2" />
                            </div>
                        </div>
                        <div className="space-y-3 text-center">
                            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{t('daily.loading')}</h3>
                            <p className="text-slate-500 text-xs font-bold tracking-[0.3em] uppercase animate-pulse">운명의 노드를 동기화 중...</p>
                        </div>
                    </motion.div>
                )}

                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-3xl mx-auto space-y-10"
                    >
                        {/* Main Score & Weather Card */}
                        <div className="premium-card p-10 md:p-16 border-white/10 bg-white/[0.02] shadow-2xl relative overflow-hidden text-center group">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none group-hover:bg-indigo-600/20 transition-colors duration-1000" />
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 border border-white/10 rounded-full mb-10 backdrop-blur-md">
                                    <Clock className="w-4 h-4 text-indigo-400" />
                                    <span className="text-xs font-black text-white tracking-widest">{result.date}</span>
                                </div>

                                <div className="flex items-center justify-center gap-10 mb-12">
                                    <div className="flex flex-col items-center group/weather">
                                        <div className="mb-4 transform group-hover/weather:scale-110 group-hover/weather:rotate-6 transition-transform duration-500">
                                            {renderWeather(result.weather)}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">기상도</span>
                                    </div>
                                    <div className="w-[1px] h-20 bg-white/5" />
                                    <div className="flex flex-col items-center group/score">
                                        <div className="text-8xl font-black italic tracking-tighter text-white mb-2 leading-none drop-shadow-2xl flex items-end gap-1">
                                            {result.score}
                                            <span className="text-2xl text-indigo-500 not-italic ml-1">/100</span>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">오늘의 에너지 지수</span>
                                    </div>
                                </div>

                                <div className="max-w-md mx-auto relative px-8 py-6 rounded-3xl bg-white/[0.03] border border-white/5">
                                    <div className="absolute -top-3 left-6 px-3 bg-[#0f0f1a] border border-white/10 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest">요약 (Summary)</div>
                                    <p className="text-xl text-slate-200 font-bold leading-relaxed italic tracking-tight">
                                        &ldquo;{result.summary}&rdquo;
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Three Pillars Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: t('fortune.love'), content: result.love, icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
                                { title: t('fortune.money'), content: result.wealth, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                                { title: t('fortune.health'), content: result.health, icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
                            ].map((item, idx) => (
                                <div key={idx} className={cn("p-8 rounded-4xl bg-white/[0.02] border transition-all hover:bg-white/[0.05]", item.border)}>
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", item.bg)}>
                                        <item.icon className={cn("w-6 h-6", item.color)} />
                                    </div>
                                    <h3 className={cn("text-xs font-black uppercase tracking-[0.2em] mb-4", item.color)}>{item.title}</h3>
                                    <p className="text-sm font-medium text-slate-400 leading-relaxed italic">{item.content}</p>
                                </div>
                            ))}
                        </div>

                        {/* Lucky Items Horizontal List */}
                        <div className="bg-slate-900/40 rounded-4xl p-8 border border-white/5 flex flex-col md:flex-row items-center gap-8 md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest">행운 가이드</h4>
                                    <p className="text-xs text-slate-500 font-medium tracking-tight">오늘 당신과 공명하는 아이템</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-3">
                                {result.luckyItems.map((item, i) => (
                                    <span key={i} className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-indigo-300 italic tracking-tight">
                                        #{item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Hourly Flow Chart & Golden Hour */}
                        <div className="bg-surface rounded-4xl p-10 border border-white/5 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <TrendingUp className="w-6 h-6 text-indigo-400" />
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">시간대별 운기 흐름</h3>
                                </div>
                                <div className="text-[10px] font-black text-indigo-400 border border-indigo-400/30 px-3 py-1 rounded-lg uppercase tracking-widest bg-indigo-400/5">실시간 변동</div>
                            </div>

                            <div className="flex items-end justify-between h-32 gap-3 mb-10 px-4">
                                {result.hourlyScores.map((score, i) => {
                                    const labels = ["06-09", "09-12", "12-15", "15-18", "18-21", "21-00"];
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                                            <div className="relative w-full flex items-end justify-center h-full">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${score}%` }}
                                                    transition={{ delay: 1 + i * 0.1, duration: 1 }}
                                                    className={cn("w-full max-w-[20px] rounded-t-lg bg-gradient-to-t transition-all",
                                                        score >= 80 ? "from-indigo-600 to-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]" : "from-slate-700 to-slate-500"
                                                    )}
                                                />
                                                <div className="absolute -top-6 text-[10px] font-black text-white opacity-0 group-hover/bar:opacity-100 transition-opacity">{score}</div>
                                            </div>
                                            <span className="text-[8px] font-black text-slate-500 uppercase">{labels[i]}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-6">
                                <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 animate-bounce">
                                    <Star className="w-6 h-6 fill-current" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xs font-black text-indigo-300 mb-1 uppercase tracking-widest">오늘 최고의 골든아워</h4>
                                    <p className="text-sm font-bold text-white italic leading-tight">
                                        &ldquo;{result.hourlyTips[0]}&rdquo;
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Premium Detailed Insight */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-5xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                            <div className="relative bg-black/60 backdrop-blur-2xl border border-indigo-500/30 rounded-5xl p-10 md:p-14 overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 group-hover:scale-150 transition-all duration-700">
                                    <Zap className="w-64 h-64 text-white fill-white" />
                                </div>

                                <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start">
                                    <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shadow-2xl shrink-0 antigravity">
                                        <Shield className="w-10 h-10 text-indigo-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-6">
                                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{t('daily.premium.title')}</h3>
                                            <span className="px-3 py-1 text-[10px] font-black bg-indigo-500 text-white rounded-lg uppercase tracking-widest shadow-lg">초정밀 분석</span>
                                        </div>
                                        <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium mb-10 opacity-70">
                                            {t('daily.premium.desc')}
                                        </p>

                                        <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/20 relative">
                                            <div className="absolute -top-4 left-8 px-4 py-1.5 bg-indigo-500 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-widest">
                                                운명 설계도 (Blueprint)
                                            </div>
                                            <p className="text-white text-base md:text-lg font-bold leading-relaxed italic tracking-tight">
                                                &ldquo;{result.premiumInsight}&rdquo;
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Back Home with Premium CTA */}
                        <div className="flex flex-col md:flex-row items-center gap-4 pt-10">
                            <button
                                onClick={() => router.push("/")}
                                className="flex-1 w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-slate-300 font-black text-sm uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all order-2 md:order-1"
                            >
                                {t('daily.backHome')}
                            </button>
                            <Link
                                href="/shop"
                                className="flex-[2] w-full py-5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 order-1 md:order-2"
                            >
                                <Zap className="w-4 h-4 fill-white" /> 전문가 프리미엄 상담 해금
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}

export default function DailyFortunePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
                <div className="text-center space-y-6">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto text-indigo-500" />
                    <p className="text-slate-500 font-black tracking-widest uppercase text-xs">Loading Fortune Engine...</p>
                </div>
            </div>
        }>
            <DailyFortuneContent />
        </Suspense>
    );
}

function Loader2(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-loader-2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>;
}
