"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, BrainCircuit, Activity, ChevronRight, Fingerprint, Lock, Zap, User, Star } from "lucide-react";
import JellyBalance from "@/components/shop/JellyBalance";
import { useWallet } from "@/components/WalletProvider";
import { useProfiles } from "@/components/ProfileProvider";
import LuxuryToast from "@/components/ui/LuxuryToast";
import { DAILY_PSYCHOLOGY } from "@/data/psychology-daily";
import { cn } from "@/lib/utils";
import SvgChart from "@/components/ui/SvgChart";

export default function PsychologyPage() {
    const router = useRouter();
    const { consumeChuru, churu } = useWallet();
    const { activeProfile, setActiveProfileById, profiles } = useProfiles();

    const [loading, setLoading] = useState(false);
    const [analyzingTest, setAnalyzingTest] = useState<string | null>(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
    };

    const handleUnlockPremiumReport = () => {
        if (!activeProfile) {
            showToast("정밀 분석을 위한 대상을 선택해주세요.");
            return;
        }

        if (churu < 30) {
            showToast("프리미엄 보고서 해독에는 30 젤리가 필요합니다.");
            return;
        }

        setLoading(true);
        try {
            if (!consumeChuru(30)) throw new Error("Jelly error");
            // Navigate to the actual Premium Report page
            router.push(`/psychology/premium-report?profileId=${activeProfile.id}`);
        } catch (e) {
            showToast("결제 진행 중 오류가 발생했습니다.");
            setLoading(false);
        }
    };

    const handleRunPsychTest = (id: string, title: string) => {
        if (!activeProfile) {
            showToast("테스트를 진행할 대상을 선택해주세요.");
            return;
        }

        if (churu < 5) {
            showToast("심리 모듈을 실행하려면 5 젤리가 필요합니다.");
            return;
        }

        setAnalyzingTest(id);
        try {
            if (!consumeChuru(5)) throw new Error("Jelly error");
            // Direct immediate navigation, no mock loading
            router.push(`/psychology/module/${id}?profileId=${activeProfile.id}`);
        } catch (e) {
            showToast("결제 진행 중 오류가 발생했습니다.");
            setAnalyzingTest(null);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white pb-40 relative overflow-hidden font-sans">
            {/* Dark Mystic BG */}
            <div className="absolute inset-x-0 top-0 h-[60dvh] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-900/10 via-slate-900/5 to-transparent pointer-events-none" />
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-rose-600/5 rounded-full blur-[150px] pointer-events-none" />

            <LuxuryToast isVisible={toastVisible} message={toastMsg} />

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                <header className="flex items-center justify-between mb-16">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group">
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div className="text-center space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-500/20 italic">
                            <BrainCircuit className="w-3 h-3" /> Neural Hub
                        </div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">심층 무의식 스캐너</h1>
                    </div>
                    <JellyBalance />
                </header>

                <div className="space-y-12">
                    {/* Active Profile Context */}
                    <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_40px_rgba(244,63,94,0.05)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px] -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 relative z-10 text-center sm:text-left">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                                <User className="w-6 h-6 text-rose-400" />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Target Identity Node</h3>
                                <div className="text-xl font-black italic text-white">{activeProfile?.name || "IDENTITY_UNKNOWN"}</div>
                            </div>
                        </div>
                        <div className="mt-6 sm:mt-0 flex gap-2 relative z-10 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                            {profiles.slice(0, 3).map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setActiveProfileById(p.id)}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all truncate min-w-20",
                                        activeProfile?.id === p.id
                                            ? "bg-rose-600/20 border-rose-500/40 text-rose-300"
                                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                                    )}
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Premium Deep Scan CTA */}
                    <div className="bg-gradient-to-br from-rose-950/40 via-slate-900/60 to-indigo-950/40 backdrop-blur-3xl rounded-[3rem] p-10 lg:p-14 border border-rose-500/20 shadow-[0_0_80px_rgba(244,63,94,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[80px] -mr-40 -mt-20 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

                        <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                            <div className="w-full lg:w-1/3 flex justify-center">
                                {/* Neural Radar Chart using SvgChart */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-transparent rounded-full flex items-center justify-center">
                                        <Fingerprint className="w-12 h-12 text-rose-500/40 opacity-50 blur-[2px]" />
                                    </div>
                                    <SvgChart
                                        size={200}
                                        accentColor="#f43f5e"
                                        animDelay={0.5}
                                        data={[
                                            { label: "ID", value: 85, color: "#f43f5e" },
                                            { label: "EGO", value: 70, color: "#cbd5e1" },
                                            { label: "SUPEREGO", value: 90, color: "#e2e8f0" },
                                            { label: "SHADOW", value: 65, color: "#818cf8" },
                                            { label: "PERSONA", value: 95, color: "#fca5a5" },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 text-center lg:text-left space-y-4">
                                <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                                    <Lock className="w-3 h-3" /> Top Secret
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white">무의식 심층 해독 보고서</h2>
                                <p className="text-sm font-bold text-slate-400 capitalize italic opacity-80 leading-relaxed mb-6">
                                    사주 명식의 숨겨진 이면과 심층적인 무의식 방어기제 패러다임을 <br className="hidden lg:block" />
                                    정량적 데이터로 도출하는 프리미엄 통합 분석.
                                </p>

                                <button
                                    onClick={handleUnlockPremiumReport}
                                    disabled={loading}
                                    className="w-full sm:w-auto px-8 py-5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 rounded-2xl border border-rose-400/50 shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:shadow-[0_0_50px_rgba(244,63,94,0.5)] transition-all flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest italic group shrink-0"
                                >
                                    {loading ? (
                                        <>
                                            <Activity className="w-5 h-5 animate-pulse" />
                                            <span>스캔 중...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                                            해석 시작 (30 Jelly)
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Daily Curated Psych Tests */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <Activity className="w-4 h-4 text-slate-500" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 italic">Curated Neural Modules</h3>
                            </div>
                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">실시간 스캔 모듈</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {DAILY_PSYCHOLOGY.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleRunPsychTest(item.id, item.title)}
                                    disabled={analyzingTest === item.id || loading}
                                    className="group relative flex items-center gap-6 p-6 sm:p-8 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] hover:border-rose-500/30 transition-all hover:bg-slate-900 overflow-hidden text-left"
                                >
                                    {analyzingTest === item.id ? (
                                        <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center shrink-0">
                                            <BrainCircuit className="w-6 h-6 text-rose-500 animate-pulse" />
                                        </div>
                                    ) : (
                                        <div className="text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110 shrink-0">
                                            {item.emoji}
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <h4 className="text-sm font-black text-white italic tracking-tight group-hover:text-rose-200 transition-colors leading-tight">
                                            {item.title}
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.tags.map((tag) => (
                                                <span key={tag} className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <div className="flex items-center gap-1 text-[10px] font-black italic text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                                            <Star className="w-2.5 h-2.5 fill-rose-500" /> 5
                                        </div>
                                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5 transition-colors">
                                            <ChevronRight className={cn("w-4 h-4 text-slate-600 group-hover:text-white transition-colors", analyzingTest === item.id && "animate-spin text-rose-500")} />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
