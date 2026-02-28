'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProfiles, SajuProfile } from '@/lib/storage';
import { analyzeRelationship, RelationshipAnalysis } from '@/lib/compatibility';
import { calculateHighPrecisionSaju } from '@/core/api/saju-engine';
import { Plus, Users, Sparkles, TrendingUp, AlertTriangle, Heart, Zap, ChevronRight, Loader2, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import JellyBalance from '@/components/shop/JellyBalance';
import { isUnlocked } from '@/lib/jelly-wallet';
import DestinyNetwork from '@/components/dashboard/DestinyNetwork';
import { useLocale } from '@/lib/i18n';

interface RelationshipData {
    profile: SajuProfile;
    analysis: RelationshipAnalysis | null;
    isUnlocked: boolean;
}

export default function DashboardPage() {
    const router = useRouter();
    const { t, locale } = useLocale();
    const [mainProfile, setMainProfile] = useState<SajuProfile | null>(null);
    const [relationships, setRelationships] = useState<RelationshipData[]>([]);
    const [insights, setInsights] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadDashboard = async () => {
        const profiles = getProfiles();
        setLoading(true);

        if (profiles.length === 0) {
            setLoading(false);
            return;
        }

        const main = profiles[0];
        setMainProfile(main);

        const others = profiles.slice(1);

        try {
            const relationshipData: RelationshipData[] = await Promise.all(others.map(async (profile) => {
                const mainSaju = await calculateHighPrecisionSaju({
                    birthDate: new Date(main.birthdate),
                    birthTime: main.birthTime || '12:00',
                    gender: main.gender === 'male' ? 'M' : 'F',
                    calendarType: main.calendarType
                });

                const otherSaju = await calculateHighPrecisionSaju({
                    birthDate: new Date(profile.birthdate),
                    birthTime: profile.birthTime || '12:00',
                    gender: profile.gender === 'male' ? 'M' : 'F',
                    calendarType: profile.calendarType
                });

                const analysis = analyzeRelationship(
                    mainSaju,
                    otherSaju,
                    profile.relationship as any
                );

                return {
                    profile,
                    analysis,
                    isUnlocked: isUnlocked(profile.id),
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
        const insights: string[] = [];
        const sorted = [...data].sort((a, b) =>
            (b.analysis?.score || 0) - (a.analysis?.score || 0)
        );

        if (sorted.length > 0 && sorted[0].analysis) {
            const best = sorted[0];
            insights.push(
                locale === 'ko'
                    ? `${best.profile.name}님과의 궁합이 압도적(${best.analysis?.score}%)입니다.`
                    : `Your compatibility with ${best.profile.name} is exceptional (${best.analysis?.score}%).`
            );
        }

        const conflicts = data.filter(r => r.analysis?.powerDynamic === '상극' || (r.analysis?.score || 0) < 40);
        if (conflicts.length > 0) {
            insights.push(
                locale === 'ko'
                    ? `${conflicts.length}건의 주의가 필요한 인연이 감지되었습니다.`
                    : `${conflicts.length} relationships need careful attention.`
            );
        }

        setInsights(insights);
    };

    const getCompColor = (score: number) => {
        if (score >= 80) return 'text-cyan-400';
        if (score >= 60) return 'text-yellow-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-rose-400';
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-10">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
                    <p className="text-xl font-bold text-secondary">Loading your destiny data...</p>
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
                        {locale === 'ko' ? '등록된 프로필이 없습니다' : 'No Profiles Found'}
                    </h1>
                    <p className="text-xl text-secondary leading-relaxed mb-12">
                        {locale === 'ko' ? '먼저 나만의 사주 프로필을 등록해 보세요.' : 'Start by creating your own Saju profile.'}
                    </p>
                    <Link
                        href="/my-saju/add"
                        className="inline-flex items-center gap-4 px-12 py-6 rounded-3xl bg-primary text-white font-black text-xl shadow-2xl hover:scale-105 transition-all"
                    >
                        {t('compat.addProfile')} <ChevronRight className="w-6 h-6" />
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen relative overflow-hidden">
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 pb-32">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20 text-center md:text-left">
                    <div>
                        <h1 className="text-5xl font-black text-foreground italic tracking-tighter uppercase mb-3">
                            {t('nav.dashboard')}
                        </h1>
                        <p className="text-2xl text-secondary font-medium">
                            {locale === 'ko' ? '나를 중심으로 연결된 모든 인연' : 'Your web of cosmic connections'}
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <JellyBalance onClick={() => router.push('/shop')} />
                        <Link href="/my-saju/add" className="w-16 h-16 rounded-3xl bg-surface border border-border-color flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-all shadow-lg group">
                            <Plus className="w-8 h-8 text-foreground group-hover:text-primary transition-colors" />
                        </Link>
                    </div>
                </div>

                {/* Quick Actions / Daily Fortune */}
                <div className="mb-20">
                    <Link href="/daily" className="group relative block w-full overflow-hidden rounded-4xl bg-gradient-to-br from-primary/20 via-surface to-background p-8 border border-primary/30 shadow-2xl hover:border-primary/60 transition-all">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-primary/20 transition-colors" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-primary/20 border border-primary/40 flex items-center justify-center">
                                    <Calendar className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-foreground mb-2 italic tracking-tight">{t('nav.daily')}</h3>
                                    <p className="text-lg text-secondary font-medium">
                                        {locale === 'ko' ? '매일 새로운 기운을 확인하세요' : 'Check your cosmic flow for today'}
                                    </p>
                                </div>
                            </div>
                            <div className="px-10 py-4 bg-primary text-white font-black text-xl rounded-2xl shadow-xl group-hover:scale-105 transition-all">
                                {locale === 'ko' ? '지금 열어보기' : 'Open Now'}
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Destiny Network Visualization */}
                <div className="mb-24 bg-surface rounded-5xl p-10 border border-border-color shadow-2xl overflow-hidden min-h-[500px] flex items-center justify-center relative">
                    <DestinyNetwork
                        mainProfile={mainProfile}
                        relationships={relationships}
                        onNodeClick={(id) => router.push(`/relationship/${id}`)}
                    />
                </div>

                {/* Relationship Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {relationships.map((rel, idx) => (
                        <motion.div
                            key={rel.profile.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => router.push(`/relationship/${rel.profile.id}`)}
                            className="bg-surface rounded-4xl p-10 border border-border-color hover:border-primary/40 transition-all cursor-pointer shadow-xl group hover:scale-[1.02]"
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
                                    <div className="h-2 bg-background rounded-full overflow-hidden border border-border-color">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${rel.analysis.score}%` }}
                                            transition={{ duration: 1, delay: idx * 0.1 + 0.5 }}
                                            className={`h-full bg-gradient-to-r ${rel.analysis.score >= 80 ? 'from-cyan-400 to-indigo-500' : 'from-yellow-400 to-rose-500'}`}
                                        />
                                    </div>
                                    <p className="text-lg text-secondary font-medium leading-relaxed line-clamp-2">
                                        {rel.analysis.chemistry}
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 pt-6">
                                        <button className="py-4 rounded-2xl bg-background text-foreground font-bold text-lg border border-border-color hover:bg-white/5 transition-all">
                                            {t('compat.viewDetail')}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/relationship/${rel.profile.id}/vs`);
                                            }}
                                            className="py-4 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white font-black text-lg shadow-lg hover:shadow-primary/20"
                                        >
                                            VS
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
                            <p className="text-2xl font-black text-foreground mb-2">{locale === 'ko' ? '인연 추가' : 'Add Connection'}</p>
                            <p className="text-lg text-secondary font-medium">1 Jelly 🐟</p>
                        </div>
                    </Link>
                </div>

                {/* Insights Footer */}
                {insights.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="mt-24 bg-surface rounded-5xl p-16 border border-primary/20 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                        <div className="flex items-center gap-6 mb-12">
                            <Sparkles className="w-10 h-10 text-primary" />
                            <h3 className="text-3xl font-black text-foreground italic uppercase tracking-tight">Insight Reveal</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {insights.map((insight, i) => (
                                <div key={i} className="flex gap-6 items-start p-8 rounded-4xl bg-background border border-border-color">
                                    <div className="w-3 h-3 rounded-full bg-primary mt-3 flex-shrink-0" />
                                    <p className="text-xl text-foreground font-bold leading-relaxed">{insight}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
