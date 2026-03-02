"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Heart, Coffee, Star, Zap, User, RefreshCw, Compass } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";
import { useProfiles } from "@/components/ProfileProvider";
import AppOnlyModal from "@/components/ui/AppOnlyModal";
import OracleBall from "@/components/home/OracleBall";
import LuxuryToast from "@/components/ui/LuxuryToast";
import JellyBalance from "@/components/shop/JellyBalance";
import { cn } from "@/lib/utils";

export default function HealingPage() {
    const router = useRouter();
    const { consumeChuru } = useWallet();
    const { profiles, activeProfile, setActiveProfileById } = useProfiles();

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [activeFeature, setActiveFeature] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    const FORTUNE_COOKIES = [
        "오늘 하루, 생각지 못한 곳에서 작은 행운이 찾아올 것입니다.",
        "주변의 조언보다는 내면의 목소리에 집중해야 할 시기입니다.",
        "잃어버린 줄 알았던 소중한 인연의 소식이 들려올 것입니다.",
        "망설였던 일을 행동으로 옮기세요. 우주가 당신을 돕고 있습니다.",
        "오늘 마주치는 낯선 사람이 중요한 열쇠를 가져다줄 수 있습니다.",
        "그동안 품어온 상처를 놓아주세요. 새로운 공간에 행운이 들어옵니다.",
        "당신이 두려워했던 그 문을 열 때가 왔습니다. 뒤에 선물이 있습니다.",
        "서두르지 마세요. 지금은 씨앗을 심는 계절입니다. 곧 꽃이 핍니다.",
        "돈보다 경험에 투자하는 결정이 미래를 바꿀 것입니다.",
        "지금 느끼는 피로는 당신이 그만큼 성장하고 있다는 증거입니다.",
        "오늘 거울을 보며 자신에게 미소 지어주세요. 운이 바뀝니다.",
        "동쪽에서 좋은 소식이 오고 있습니다. 마음을 열고 기다리세요.",
        "당신의 직관은 지금 옳습니다. 숫자와 데이터보다 신뢰하세요.",
        "인내는 쓰지만 열매는 달콤합니다. 지금 당신이 딱 그 경계에 있습니다.",
        "가장 어두운 밤이 지나면 가장 화려한 새벽이 옵니다.",
        "당신 안에 이미 필요한 모든 것이 있습니다. 외부에서 찾지 마세요.",
        "작은 친절이 거대한 물결을 만듭니다. 오늘 누군가에게 친절하세요.",
        "잠시 멈추고 자연의 소리에 귀를 기울이면 답이 보입니다.",
        "당신이 포기하려는 그 순간이 바로 성공 직전입니다.",
        "오늘 하루 세 가지 감사를 찾으세요. 우주가 더 많은 것을 보내줍니다.",
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
        setResult(null);
        setTimeout(() => {
            const random = FORTUNE_COOKIES[Math.floor(Math.random() * FORTUNE_COOKIES.length)];
            setResult(random);
            setLoading(false);
        }, 1500);
    };

    const handleAppFeature = (title: string) => {
        setModalTitle(title);
        setIsModalOpen(true);
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-sans pb-40">
            {/* Dark Mystic Atmosphere */}
            <div className="absolute inset-x-0 top-0 h-[60dvh] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-900/5 to-transparent pointer-events-none" />
            <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />

            <LuxuryToast isVisible={toastVisible} message={toastMsg} />

            <div className="max-w-3xl mx-auto px-6 py-12 relative z-10">
                <header className="flex items-center justify-between mb-16">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group">
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div className="text-center space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 italic">
                            <Sparkles className="w-3 h-3" /> Sanctuary Open
                        </div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">Healing & Oracle</h1>
                    </div>
                    <JellyBalance />
                </header>

                <div className="space-y-16">
                    {/* Node Selector (Target Subject) */}
                    <section className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity" />

                        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <Compass className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Target Node</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">치유 대상 선택</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/10">
                                Active Slots: <span className="text-white ml-1">{profiles.length}/4</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
                            {profiles.slice(0, 4).map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setActiveProfileById(p.id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all hover:scale-[1.02]",
                                        activeProfile?.id === p.id
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-lg shadow-emerald-500/5"
                                            : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300"
                                    )}
                                >
                                    <User className="w-5 h-5 mb-2 opacity-70 shrink-0" />
                                    <span className="text-xs font-black truncate w-full text-center tracking-tight italic">{p.name}</span>
                                </button>
                            ))}
                            {profiles.length < 4 && (
                                <button
                                    onClick={() => router.push("/my-saju/add")}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed border-white/10 text-slate-600 font-bold hover:text-white hover:border-white/30 transition-all group/add"
                                >
                                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover/add:bg-white/10 transition-colors">
                                        <span className="text-xs">+</span>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-widest">Add Node</span>
                                </button>
                            )}
                        </div>
                    </section>

                    {/* Oracle Ball Integration */}
                    <div className="relative">
                        <div className="absolute -top-10 -left-10 text-[200px] opacity-5 filter blur-sm pointer-events-none font-black italic">O</div>
                        <OracleBall
                            title="우주의 목소리"
                            description={`${activeProfile?.name || '당신'}의 내면을 향한 질문을 떠올려보세요.`}
                            advices={ORB_ANSWERS}
                        />
                    </div>

                    {/* Fortune Cookie Section */}
                    <section className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[4rem] p-12 text-center relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                        <div className="mb-10 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-amber-500/20 shadow-inner">
                                <Star className="w-3.5 h-3.5 fill-current animate-pulse" /> Random Seed Event
                            </div>
                            <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-3 text-white">시크릿 <span className="text-amber-500">포춘쿠키</span></h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] italic">데이터로 예측하는 소소한 힌트</p>
                        </div>

                        <AnimatePresence mode="wait">
                            {result && activeFeature === "포춘쿠키" ? (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="p-10 bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-500/20 rounded-[3rem] shadow-xl relative"
                                >
                                    <div className="absolute top-4 left-4 text-3xl opacity-20">🥠</div>
                                    <p className="text-lg font-black text-amber-200 leading-relaxed italic drop-shadow-md">
                                        &ldquo;{result}&rdquo;
                                    </p>
                                    <button
                                        onClick={() => { setResult(null); setActiveFeature(null); }}
                                        className="mt-8 text-[10px] font-black uppercase text-slate-400 hover:text-amber-400 transition-colors tracking-[0.3em] flex items-center justify-center gap-2 mx-auto"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Reload Cookie
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.button
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={handleFortuneCookie}
                                    disabled={loading}
                                    className="group/cookie relative w-40 h-40 mx-auto flex items-center justify-center bg-slate-900/50 border border-white/5 rounded-full hover:border-amber-500/40 hover:bg-amber-500/5 transition-all duration-700 shadow-2xl"
                                >
                                    {loading ? (
                                        <RefreshCw className="w-12 h-12 text-amber-500 animate-spin" />
                                    ) : (
                                        <>
                                            <div className="text-6xl group-hover/cookie:scale-125 group-hover/cookie:rotate-12 transition-transform duration-700 select-none">🥠</div>
                                            <div className="absolute inset-2 rounded-full border border-amber-500/0 group-hover/cookie:border-amber-500/30 transition-colors duration-500" />
                                        </>
                                    )}
                                    <div className="absolute -inset-4 border border-dashed border-slate-700 rounded-full animate-rotate-slow opacity-30 group-hover/cookie:border-amber-500/30 transition-colors duration-1000" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {!result && !loading && (
                            <p className="mt-10 text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] animate-pulse">Touch to Extract</p>
                        )}
                    </section>

                    {/* App Only Features Grid */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 px-4">
                            <Zap className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] italic">App Exclusive Protocols</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { title: "조상님 적금", icon: Coffee, desc: "복이 쌓이는 가상 명상", color: "text-amber-400", bg: "group-hover:bg-amber-500/10", border: "group-hover:border-amber-500/30" },
                                { title: "불면증 치유", icon: Star, desc: "숙면 유도 주파수 동기화", color: "text-indigo-400", bg: "group-hover:bg-indigo-500/10", border: "group-hover:border-indigo-500/30" },
                                { title: "마음 세탁소", icon: Heart, desc: "감정 쓰레기통 비우기", color: "text-rose-400", bg: "group-hover:bg-rose-500/10", border: "group-hover:border-rose-500/30" },
                                { title: "오늘의 차", icon: Zap, desc: "사주 체질 맞춤별 티", color: "text-emerald-400", bg: "group-hover:bg-emerald-500/10", border: "group-hover:border-emerald-500/30" }
                            ].map((feature, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleAppFeature(feature.title)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-8 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] transition-all group hover:-translate-y-1",
                                        feature.border, feature.bg
                                    )}
                                >
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner border border-white/5">
                                        <feature.icon className={cn("w-6 h-6", feature.color)} />
                                    </div>
                                    <span className="text-sm font-black text-white italic mb-1.5">{feature.title}</span>
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center mx-2 leading-tight">{feature.desc}</span>

                                    <div className="mt-4 px-2 py-0.5 bg-black/40 rounded border border-white/5 text-[8px] font-black text-slate-400 uppercase tracking-widest">APP</div>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <AppOnlyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalTitle}
            />
        </main>
    );
}
