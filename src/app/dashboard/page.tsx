'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { analyzeRelationship, RelationshipAnalysis } from '@/lib/compatibility';
import { calculateHighPrecisionSaju } from '@/core/api/saju-engine';
import { Plus, Users, Sparkles, ChevronRight, Loader2, User, Calendar, Zap } from 'lucide-react';
import Link from 'next/link';
import JellyBalance from '@/components/shop/JellyBalance';
import { isUnlocked } from '@/lib/jelly-wallet';
import DestinyNetwork from '@/components/dashboard/DestinyNetwork';
import { useLocale } from '@/lib/i18n';
import SvgChart from '@/components/ui/SvgChart';

import { useProfiles } from '@/components/ProfileProvider';
import { useWallet } from '@/components/WalletProvider';
import { parseCivilDate } from '@/lib/civil-date';

interface RelationshipData {
    profile: any;
    analysis: RelationshipAnalysis | null;
    isUnlocked: boolean;
}

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const profileId = searchParams?.get('profileId');
    const { t, locale } = useLocale();
    const { profiles } = useProfiles();
    const { isAdmin } = useWallet();

    const [mainProfile, setMainProfile] = useState<any | null>(null);
    const [relationships, setRelationships] = useState<RelationshipData[]>([]);
    const [insights, setInsights] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profiles.length > 0) {
            loadDashboard();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId, profiles]);

    const loadDashboard = async () => {
        setLoading(true);

        const main = profileId ? (profiles.find(p => p.id === profileId) || profiles[0]) : profiles[0];
        setMainProfile(main);

        const others = profiles.filter(p => p.id !== main.id);

        try {
            const relationshipData: RelationshipData[] = await Promise.all(others.map(async (profile) => {
                const mainBirthDate = parseCivilDate(main.birthdate) ?? new Date(1990, 0, 1, 12, 0, 0, 0);
                const profileBirthDate = parseCivilDate(profile.birthdate) ?? new Date(1990, 0, 1, 12, 0, 0, 0);
                const mainSaju = await calculateHighPrecisionSaju({
                    birthDate: mainBirthDate,
                    birthTime: main.birthTime || '12:00',
                    gender: main.gender === 'male' ? 'M' : 'F',
                    calendarType: main.calendarType,
                    isTimeUnknown: main.isTimeUnknown
                });

                const otherSaju = await calculateHighPrecisionSaju({
                    birthDate: profileBirthDate,
                    birthTime: profile.birthTime || '12:00',
                    gender: profile.gender === 'male' ? 'M' : 'F',
                    calendarType: profile.calendarType,
                    isTimeUnknown: profile.isTimeUnknown
                });

                const analysis = analyzeRelationship(
                    mainSaju,
                    otherSaju,
                    profile.relationship as any
                );

                return {
                    profile,
                    analysis,
                    isUnlocked: isAdmin || isUnlocked(profile.id),
                };
            }));

            setRelationships(relationshipData);
            generateInsights(relationshipData);
        } catch (error) {
            console.error("Dashboard calculation error:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateInsights = (data: RelationshipData[]) => {
        const newInsights: string[] = [];
        const sorted = [...data].sort((a, b) => (b.analysis?.score || 0) - (a.analysis?.score || 0));

        if (sorted.length > 0 && sorted[0].analysis) {
            const best = sorted[0];
            newInsights.push(
                locale === 'ko'
                    ? `가장 잘 맞는 조합은 ${best.profile.name}님입니다 (${best.analysis?.score}%).`
                    : `Your strongest match is with ${best.profile.name} (${best.analysis?.score}%).`
            );
        }

        const conflicts = data.filter(r => r.analysis?.powerDynamic === 'conflict' || (r.analysis?.score || 0) < 40);
        if (conflicts.length > 0) {
            newInsights.push(
                locale === 'ko'
                    ? `${conflicts.length}명은 관계 톤 조절이 필요해요.`
                    : `${conflicts.length} relationships need careful adjustment.`
            );
        }

        setInsights(newInsights);
    };

    const getCompColor = (score: number) => {
        if (score >= 80) return 'text-cyan-400';
        if (score >= 60) return 'text-yellow-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-rose-400';
    };

    const avgScore = relationships.length > 0
        ? Math.round(relationships.reduce((sum, item) => sum + (item.analysis?.score || 0), 0) / relationships.length)
        : 0;
    const unlockedRate = relationships.length > 0
        ? Math.round((relationships.filter((item) => item.isUnlocked).length / relationships.length) * 100)
        : 0;

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050505] flex items-center justify-center overflow-hidden">
                <div className="relative">
                    {/* Pulsing Lottie-style Orbs */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3], rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2], rotate: -360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"
                    />

                    <div className="relative z-10 text-center space-y-12">
                        <div className="relative w-32 h-32 mx-auto">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-secondary border-l-transparent rounded-full shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-4 border-2 border-t-white/20 border-r-transparent border-b-white/20 border-l-transparent rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-white animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <motion.p
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-2xl font-black text-white italic tracking-[0.2em] uppercase"
                            >
                                Synchronizing Destiny Web…
                            </motion.p>
                            <div className="w-48 h-1 bg-white/5 mx-auto rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!mainProfile) {
        return (
            <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-6 pb-32 text-center">
                <div className="bg-surface p-16 rounded-5xl border border-border-color max-w-2xl relative">
                    <Users className="w-24 h-24 mx-auto mb-10 text-secondary opacity-50" />
                    <h1 className="text-4xl font-black mb-6 text-foreground">
                        {locale === 'ko' ? '연결된 프로필이 없습니다' : 'No Profiles Found'}
                    </h1>
                    <p className="text-xl text-secondary leading-relaxed mb-12">
                        {locale === 'ko' ? '내 프로필을 먼저 만들고 인연 분석을 시작해 주세요.' : 'Start by creating your own Saju profile.'}
                    </p>
                    <Link
                        href="/my-saju/add"
                        className="inline-flex items-center gap-4 px-12 py-6 rounded-3xl bg-primary text-white font-black text-xl shadow-2xl hover:scale-105 transition-all min-h-[56px]"
                    >
                        {t('compat.addProfile')} <ChevronRight className="w-6 h-6" />
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen relative overflow-hidden">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 pb-32">

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-10 mb-12 sm:mb-20 text-center md:text-left">
                    <div>
                        <h1 className="text-3xl sm:text-5xl font-black text-foreground italic tracking-tighter uppercase mb-2 sm:mb-3">
                            {locale === 'ko' ? '운명 대시보드 (Destiny Web)' : 'Dashboard'}
                        </h1>
                        <p className="text-lg sm:text-2xl text-secondary font-medium">
                            {locale === 'ko' ? '관계 에너지와 궁합을 한 번에 점검하세요.' : 'Your web of cosmic connections'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                        <JellyBalance onClick={() => router.push('/shop')} />
                        <Link href="/my-saju/add" className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-surface border border-border-color flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-all shadow-lg group">
                            <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-foreground group-hover:text-primary transition-colors" />
                        </Link>
                    </div>
                </div>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-20">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="rounded-4xl bg-surface p-6 border border-border-color shadow-xl">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary">연결 수</p>
                        <p className="mt-3 text-4xl font-black text-foreground">{profiles.length}명</p>
                        <p className="text-sm text-secondary mt-2">본인 포함 인연 관계 수</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="rounded-4xl bg-surface p-6 border border-border-color shadow-xl">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary">평균 궁합</p>
                        <p className="mt-3 text-4xl font-black text-foreground">{avgScore}%</p>
                        <div className="mt-4 h-2 bg-background rounded-full overflow-hidden border border-border/40">
                            <motion.div style={{ width: `${Math.max(avgScore, 5)}%` }} initial={{ width: 0 }} animate={{ width: `${Math.max(avgScore, 5)}%` }} className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="rounded-4xl bg-surface p-6 border border-border-color shadow-xl">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary">해금률</p>
                        <p className="mt-3 text-4xl font-black text-foreground">{unlockedRate}%</p>
                        <div className="mt-4 h-2 bg-background rounded-full overflow-hidden border border-border/40">
                            <div className={`h-full ${unlockedRate >= 70 ? 'bg-emerald-400' : unlockedRate >= 40 ? 'bg-yellow-400' : 'bg-rose-400'}`} style={{ width: `${unlockedRate}%` }} />
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="rounded-4xl bg-surface p-6 border border-border-color shadow-xl">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary">메인 프로필</p>
                        <p className="mt-3 text-xl font-black text-foreground">{mainProfile.name}</p>
                        <p className="text-sm text-secondary mt-2">관계 분석 기준점</p>
                    </motion.div>
                </section>

                <div className="mb-12 sm:mb-20">
                    <Link href="/daily" className="group relative block w-full overflow-hidden rounded-3xl sm:rounded-4xl bg-gradient-to-br from-primary/20 via-surface to-background p-6 sm:p-8 border border-primary/30 shadow-2xl hover:border-primary/60 transition-all">
                        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary/10 rounded-full blur-3xl -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 group-hover:bg-primary/20 transition-colors" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                            <div className="flex items-center gap-4 sm:gap-6">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-primary/20 border border-primary/40 flex items-center justify-center">
                                    <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-foreground mb-1 sm:mb-2 italic tracking-tight">{t('nav.daily')}</h3>
                                    <p className="text-base sm:text-lg text-secondary font-medium">오늘의 흐름을 한 번에 점검하세요.</p>
                                </div>
                            </div>
                            <div className="w-full sm:w-auto px-10 py-3 sm:py-4 bg-primary text-white font-black text-lg sm:text-xl rounded-xl sm:rounded-2xl shadow-xl group-hover:scale-105 transition-all min-h-[48px] sm:min-h-[52px] flex items-center justify-center">
                                지금 확인
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="mb-16 sm:mb-24 bg-surface rounded-3xl sm:rounded-5xl p-6 sm:p-10 border border-border-color shadow-2xl overflow-hidden min-h-[400px] sm:min-h-[500px] flex items-center justify-center relative">
                    <DestinyNetwork
                        mainProfile={mainProfile}
                        relationships={relationships}
                        onNodeClick={(id) => router.push(`/relationship/${id}`)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 xl:gap-9 2xl:gap-10">
                    {relationships.map((rel, idx) => (
                        <motion.div
                            key={rel.profile.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => router.push(`/relationship/${rel.profile.id}`)}
                            className="bg-surface rounded-3xl sm:rounded-4xl p-6 sm:p-10 border border-border-color hover:border-primary/40 transition-all cursor-pointer shadow-xl group hover:scale-[1.02]"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-3xl bg-background border border-border-color flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                                        <User className="w-10 h-10 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-foreground">{rel.profile.name}</h4>
                                        <p className="text-lg text-secondary font-medium">{t(`common.relation.${rel.profile.relationship}`)}</p>
                                    </div>
                                </div>
                                <div className={`text-4xl font-black italic tracking-tighter ${rel.analysis ? getCompColor(rel.analysis.score) : 'text-slate-700'}`}>
                                    {rel.analysis?.score}%
                                </div>
                            </div>

                            {rel.analysis && (
                                <div className="space-y-8">
                                    <div className="h-2 bg-background rounded-full overflow-hidden border border-border-color mt-4">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${rel.analysis.score}%` }}
                                            transition={{ duration: 1, delay: idx * 0.1 + 0.5 }}
                                            className={`h-full bg-gradient-to-r ${rel.analysis.score >= 80 ? 'from-cyan-400 to-indigo-500' : 'from-yellow-400 to-rose-500'}`}
                                        />
                                    </div>
                                    <p className="text-sm text-secondary font-medium leading-relaxed line-clamp-2 italic opacity-80 mt-4 mb-6">
                                        &ldquo;{rel.analysis.chemistry}&rdquo;
                                    </p>

                                    <div className="flex justify-center my-6 scale-90">
                                        <SvgChart
                                            size={140}
                                            accentColor={rel.analysis.score >= 80 ? "#22d3ee" : "#fbbf24"}
                                            animDelay={0.2}
                                            title="Energy Sync"
                                            data={[
                                                { label: "Emotion", value: 50 + (rel.analysis.score % 40) },
                                                { label: "Logic", value: 40 + (rel.analysis.score % 50) },
                                                { label: "Passion", value: 60 + (rel.profile.name.length * 5 % 30) },
                                                { label: "Stability", value: Math.min(95, rel.analysis.score + 10) },
                                            ]}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                        <button className="py-3 min-h-[44px] rounded-2xl bg-background text-foreground font-bold text-sm border border-border-color hover:bg-white/5 transition-all tracking-widest uppercase">
                                            상세 보기
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/relationship/${rel.profile.id}/vs`);
                                            }}
                                            className="py-3 min-h-[44px] rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white font-black text-sm shadow-lg hover:shadow-primary/20 tracking-widest italic flex items-center justify-center gap-1"
                                        >
                                            <Zap className="w-4 h-4" /> VS
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}

                    <Link
                        href="/my-saju/add"
                        className="bg-surface rounded-4xl p-10 border-2 border-dashed border-border-color flex flex-col items-center justify-center gap-10 group hover:border-primary/50 hover:bg-primary/5 transition-all text-center min-h-[350px] shadow-sm hover:shadow-xl"
                    >
                        <div className="w-24 h-24 rounded-full bg-background border border-border-color flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-12 h-12 text-secondary group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-foreground mb-2">인연 추가</p>
                            <p className="text-lg text-secondary font-medium">1 Jelly로 즉시 시작</p>
                        </div>
                    </Link>
                </div>

                {insights.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="mt-16 sm:mt-24 bg-surface rounded-3xl sm:rounded-5xl p-8 sm:p-16 border border-primary/20 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                        <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                            <h3 className="text-xl sm:text-3xl font-black text-foreground italic uppercase tracking-tight">인사이트 리빌 (Insight Reveal)</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                            {insights.map((insight, i) => (
                                <div key={i} className="flex gap-4 sm:gap-6 items-start p-6 sm:p-8 rounded-3xl sm:rounded-4xl bg-background border border-border-color">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                                    <p className="text-lg sm:text-xl text-foreground font-bold leading-relaxed">{insight}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-center space-y-6">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
                    <p className="text-slate-500 font-black tracking-widest uppercase text-xs">Synchronizing Destiny Web...</p>
                </div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
