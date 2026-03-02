"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getProfiles, SajuProfile } from "@/lib/storage";
import { ArrowLeft, Sparkles, Flame, Wind, Droplets, Loader2, Target, Eye, Shield } from "lucide-react";
import Link from "next/link";
import JellyBalance from "@/components/shop/JellyBalance";
import { useWallet } from "@/components/WalletProvider";
import LuxuryToast from "@/components/ui/LuxuryToast";

const SHINSAL_TYPES = [
    { id: "dohwa", name: "도화살 (桃花殺)", shortName: "도화", desc: "매력과 인기를 끌어당기는 기운. 연예인, 인플루언서에게서 강하게 발현됩니다. 이성에게 매력적으로 보이며 대중의 인기를 얻습니다.", advice: "인기와 매력을 활용하되 경계선을 명확히 하세요. 예술·미용·서비스업에서 빛납니다.", icon: Flame, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", probability: 85 },
    { id: "yeokma", name: "역마살 (驛馬殺)", shortName: "역마", desc: "한곳에 머물지 않고 끊임없이 이동하며 변화를 추구하는 자유로운 영혼의 에너지입니다. 해외 인연이 발달합니다.", advice: "여행·무역·IT 업무에서 최고의 성과를 냅니다. 정착보다 흐름을 타세요.", icon: Wind, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", probability: 60 },
    { id: "baekho", name: "백호대살 (白虎大殺)", shortName: "백호", desc: "강력한 추진력과 결단력을 의미하지만, 때로는 급격한 감정 변화를 동반할 수 있습니다. 외과·군인 직종에 적합.", advice: "결단이 필요한 순간에 강합니다. 위험한 상황에서 침착함을 유지하세요.", icon: Shield, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", probability: 40 },
    { id: "gwiin", name: "귀인 (貴人)", shortName: "귀인", desc: "하늘이 보내준 귀인의 조력이 있는 기운. 어려운 순간마다 도와주는 사람이 나타납니다. 금전운·명예운에 길합니다.", advice: "인맥을 소중히 하세요. 기회는 사람을 통해 옵니다.", icon: Sparkles, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", probability: 70 },
    { id: "gongmang", name: "공망 (空亡)", shortName: "공망", desc: "비워진 자리의 기운. 집착을 내려놓으면 오히려 더 큰 것을 얻게 됩니다. 영적 성장과 내면의 지혜가 발달합니다.", advice: "물질보다 정신적 가치에 집중하세요. 명상·철학·종교분야에서 빛납니다.", icon: Eye, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", probability: 55 },
    { id: "hwagae", name: "화개살 (華蓋殺)", shortName: "화개", desc: "예술적 감수성과 영적 직관이 뛰어난 기운. 독창성이 넘치며 예술·음악·철학 분야에서 탁월합니다.", advice: "창의적 작업에 몰두하세요. 외로움을 에너지로 전환하면 영감이 됩니다.", icon: Droplets, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", probability: 65 },
    { id: "yangin", name: "양인살 (羊刃殺)", shortName: "양인", desc: "강한 의지와 집중력의 기운. 극단적인 승부욕을 가지며 한번 목표를 정하면 끝까지 밀어붙입니다.", advice: "과도한 승부욕은 조절하세요. 의료·법조·검찰 분야에서 두각을 나타냅니다.", icon: Target, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", probability: 35 },
    { id: "cheonuisa", name: "천의성 (天醫星)", shortName: "천의", desc: "치유와 돌봄의 기운. 타인의 고통을 잘 이해하며 의료·상담·교육 분야에서 탁월한 능력을 발휘합니다.", advice: "감정 이입 능력이 장점입니다. 과도한 감정 소비에 주의하세요.", icon: Shield, color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/20", probability: 50 },
];

export default function ShinsalPage() {
    const router = useRouter();
    const { consumeChuru, churu } = useWallet();
    const [profile, setProfile] = useState<SajuProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState<typeof SHINSAL_TYPES | null>(null);
    const [toastMsg, setToastMsg] = useState("");
    const [showToast, setShowToast] = useState(false);

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
        if (churu < 20) {
            setToastMsg("신살 분석에는 20 젤리가 필요합니다.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        consumeChuru(20);

        // Randomize probabilities based on "profile id" length (mock logic)
        const seed = profile ? profile.name.length : 3;
        const updated = SHINSAL_TYPES.map((t, i) => ({
            ...t,
            // pseudo-random logic that feels personal
            probability: Math.min(99, Math.max(10, t.probability + (seed * (i % 2 === 0 ? 5 : -5))))
        })).sort((a, b) => b.probability - a.probability);

        setResults(updated);
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

                <LuxuryToast message={toastMsg} isVisible={showToast} />
                {!results && !loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mt-20 max-w-xl mx-auto">

                        <div className="bg-white/5 rounded-3xl p-6 lg:p-8 space-y-4 border border-rose-500/20 shadow-inner mb-8 mt-6 relative z-10 w-full text-left">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-rose-500/80 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Operational Cost
                                </span>
                                <span className="text-sm font-black flex items-center gap-2 text-rose-400 italic tracking-widest bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                                    20 Jelly
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold hidden sm:block">명리학 기반 심층 신살 데이터 분석</p>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            className="w-full py-6 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-lg uppercase tracking-widest rounded-2xl transition-all shadow-xl hover:shadow-[0_0_40px_rgba(244,63,94,0.4)] border border-rose-400/50 group flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Eye className="w-6 h-6 group-hover:animate-pulse" /> 심층 신살 분석 즉시 시작 (20 Jelly)
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
                                                <h4 className="text-2xl font-black italic text-white uppercase">{item.name}</h4>
                                                <div className="flex items-center justify-center sm:justify-end gap-2 bg-black/30 px-4 py-2 rounded-2xl border border-white/10">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">발현 확률</span>
                                                    <span className={`text-2xl font-black ${item.color}`}>{item.probability}%</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-300 font-medium leading-relaxed mb-4">{item.desc}</p>

                                            {/* Progress Bar */}
                                            <div className="mb-4 h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.probability}%` }}
                                                    transition={{ duration: 1.5, delay: 0.5 + (idx * 0.2), ease: "easeOut" }}
                                                    className={`h-full rounded-full ${item.bg.replace('/10', '/60')}`}
                                                />
                                            </div>

                                            {'advice' in item && (
                                                <div className={`text-left px-4 py-3 rounded-2xl ${item.bg} border ${item.border} mt-2`}>
                                                    <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${item.color}`}>💡 활용 조언</div>
                                                    <p className="text-xs text-slate-300 font-medium">{(item as any).advice}</p>
                                                </div>
                                            )}
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
