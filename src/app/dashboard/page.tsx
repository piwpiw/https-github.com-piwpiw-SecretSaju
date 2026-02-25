'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProfiles, SajuProfile } from '@/lib/storage';
import { analyzeRelationship, RelationshipAnalysis } from '@/lib/compatibility';
import { calculateHighPrecisionSaju } from '@/core/api/saju-engine'; // Direct import or from lib/saju
import { Plus, Users, Sparkles, TrendingUp, AlertTriangle, Heart, Zap } from 'lucide-react';
import Link from 'next/link';
import JellyBalance from '@/components/shop/JellyBalance';
import { isUnlocked } from '@/lib/jelly-wallet';

interface RelationshipData {
    profile: SajuProfile;
    analysis: RelationshipAnalysis | null;
    isUnlocked: boolean;
}

export default function DashboardPage() {
    const router = useRouter();
    const [mainProfile, setMainProfile] = useState<SajuProfile | null>(null);
    const [relationships, setRelationships] = useState<RelationshipData[]>([]);
    const [insights, setInsights] = useState<string[]>([]);

    useEffect(() => {
        loadDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadDashboard = async () => {
        const profiles = getProfiles();

        if (profiles.length === 0) {
            return;
        }

        // 첫 번째 프로필을 main으로 설정 (나중에 선택 가능하게 개선)
        const main = profiles[0];
        setMainProfile(main);

        // 나머지 프로필들과의 관계 분석
        const others = profiles.slice(1);

        const fetchData = async () => {
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
        };

        fetchData();
    };

    const generateInsights = (data: RelationshipData[]) => {
        const insights: string[] = [];

        // 최고/최저 궁합 찾기
        const sorted = [...data].sort((a, b) =>
            (b.analysis?.score || 0) - (a.analysis?.score || 0)
        );

        if (sorted.length > 0 && sorted[0].analysis) {
            const best = sorted[0];
            insights.push(
                `${best.profile.name}(${best.profile.relationship})와 궁합이 가장 좋아요 (${best.analysis?.score}%)`
            );
        }

        if (sorted.length > 0 && sorted[sorted.length - 1].analysis) {
            const worst = sorted[sorted.length - 1];
            if (worst.analysis && worst.analysis.score < 50) {
                insights.push(
                    `${worst.profile.name}(${worst.profile.relationship})와는 거리 두기가 필요해요`
                );
            }
        }

        // 상극 관계 찾기
        const conflicts = data.filter(
            (r) => r.analysis?.powerDynamic === '상극'
        );
        if (conflicts.length > 0) {
            insights.push(
                `${conflicts.length}명과 상극 관계예요. 갈등 관리가 중요합니다.`
            );
        }

        setInsights(insights);
    };

    const getCompatibilityColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    const getCompatibilityIcon = (score: number) => {
        if (score >= 80) return <Heart className="w-5 h-5" />;
        if (score >= 60) return <TrendingUp className="w-5 h-5" />;
        if (score >= 40) return <Sparkles className="w-5 h-5" />;
        return <AlertTriangle className="w-5 h-5" />;
    };

    // Empty state
    if (!mainProfile) {
        return (
            <main className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-foreground">관계 대시보드</h1>
                        <JellyBalance onClick={() => { }} />
                    </div>

                    <div className="text-center py-20">
                        <Users className="w-20 h-20 text-zinc-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-foreground mb-2">
                            아직 프로필이 없어요
                        </h2>
                        <p className="text-zinc-400 mb-6">
                            첫 프로필을 추가하고 관계를 분석해보세요!
                        </p>
                        <Link
                            href="/my-saju/add"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition"
                        >
                            <Plus className="w-5 h-5" />
                            프로필 추가하기
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // Single profile state
    if (relationships.length === 0) {
        return (
            <main className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-foreground">관계 대시보드</h1>
                        <JellyBalance onClick={() => { }} />
                    </div>

                    <div className="text-center py-20">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mb-8"
                        >
                            <div className="w-32 h-32 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-yellow-400">
                                <span className="text-4xl">👤</span>
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">
                                {mainProfile.name} ({mainProfile.relationship})
                            </h2>
                        </motion.div>

                        <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                            다른 사람과의 관계를 분석하려면<br />
                            프로필을 추가해주세요!
                        </p>

                        <div className="bg-surface border border-white/10 rounded-xl p-6 max-w-md mx-auto mb-6">
                            <h3 className="font-bold text-foreground mb-3">누구를 추가할까요?</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="p-2 bg-white/5 rounded">엄마</div>
                                <div className="p-2 bg-white/5 rounded">아빠</div>
                                <div className="p-2 bg-white/5 rounded">애인</div>
                                <div className="p-2 bg-white/5 rounded">친구</div>
                            </div>
                        </div>

                        <Link
                            href="/my-saju/add"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition"
                        >
                            <Plus className="w-5 h-5" />
                            두 번째 프로필 추가하기
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // Dashboard with relationships
    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-foreground">관계 대시보드</h1>
                    <JellyBalance onClick={() => { }} />
                </div>

                {/* Insights */}
                {insights.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-yellow-400/20 to-amber-400/20 border border-yellow-400/30 rounded-xl p-4 mb-6"
                    >
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-foreground mb-2">💡 관계 인사이트</h3>
                                <ul className="space-y-1 text-sm text-foreground/80">
                                    {insights.map((insight, i) => (
                                        <li key={i}>• {insight}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Relationship Map */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Main Profile (Center) */}
                    <div className="lg:col-start-2">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <div className="relative bg-black/40 backdrop-blur-xl border border-yellow-400/30 rounded-3xl p-8 text-center shadow-2xl overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500"></div>
                                <div className="w-28 h-28 bg-gradient-to-tr from-yellow-500/20 to-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-yellow-400/40 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
                                    <span className="text-5xl">👑</span>
                                </div>
                                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 tracking-tight">{mainProfile.name}</h3>
                                <p className="text-sm font-medium text-yellow-500/70 mt-1 uppercase tracking-widest">{mainProfile.relationship}</p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Relationship Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relationships.map((rel, index) => (
                        <motion.div
                            key={rel.profile.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => router.push(`/relationship/${rel.profile.id}`)}
                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-yellow-400/30 hover:shadow-[0_0_30px_rgba(250,204,21,0.1)] transition-all duration-300 cursor-pointer group"
                        >
                            {/* Profile Info */}
                            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/5">
                                <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                                    <span className="text-3xl">👤</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
                                        {rel.profile.name}
                                    </h4>
                                    <p className="text-xs text-yellow-500/70 uppercase tracking-wider font-semibold mt-1">{rel.profile.relationship}</p>
                                </div>
                            </div>

                            {rel.analysis && (
                                <>
                                    {/* Compatibility Score */}
                                    <div className="mb-5 bg-black/20 rounded-2xl p-4 border border-black/20">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-slate-400">종합 궁합</span>
                                            <div className={`flex items-center gap-1.5 ${getCompatibilityColor(rel.analysis.score)}`}>
                                                {getCompatibilityIcon(rel.analysis.score)}
                                                <span className="font-black text-2xl">{rel.analysis.score}<span className="text-lg opacity-70">%</span></span>
                                            </div>
                                        </div>
                                        <div className="h-2.5 bg-black/40 rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${rel.analysis.score}%` }}
                                                transition={{ delay: index * 0.1 + 0.3, duration: 1, ease: "easeOut" }}
                                                className={`h-full ${rel.analysis.score >= 80
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                                    : rel.analysis.score >= 60
                                                        ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                                                        : rel.analysis.score >= 40
                                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                                                            : 'bg-gradient-to-r from-red-500 to-rose-400'
                                                    } shadow-[0_0_10px_currentColor]`}
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Info */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                            <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-slate-300 text-sm leading-relaxed">{rel.analysis.chemistry}</p>
                                        </div>
                                        {rel.analysis.tension && (
                                            <div className="flex items-start gap-3 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                                                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                                                <p className="text-rose-300/90 text-sm leading-relaxed">
                                                    {rel.analysis.tension}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3 mt-auto">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/relationship/${rel.profile.id}`);
                                            }}
                                            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold transition-all shadow-sm"
                                        >
                                            상세 분석
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/relationship/${rel.profile.id}/vs`);
                                            }}
                                            className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black text-sm font-black italic transition-all shadow-lg flex items-center justify-center gap-1.5"
                                        >
                                            VS 비교
                                            <Zap className="w-4 h-4 fill-black" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ))}

                    {/* Add New Card */}
                    <Link
                        href="/my-saju/add"
                        className="border-2 border-dashed border-white/20 rounded-xl p-5 flex flex-col items-center justify-center gap-3 hover:border-yellow-400/50 hover:bg-yellow-400/5 transition group min-h-[200px]"
                    >
                        <Plus className="w-10 h-10 text-zinc-600 group-hover:text-yellow-400 transition" />
                        <div className="text-center">
                            <p className="font-medium text-zinc-400 group-hover:text-foreground transition">
                                새 관계 추가
                            </p>
                            <p className="text-xs text-zinc-600 mt-1">1 젤리 필요</p>
                        </div>
                    </Link>
                </div>
            </div>
        </main>
    );
}
