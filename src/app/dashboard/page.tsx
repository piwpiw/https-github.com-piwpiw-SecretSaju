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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Main Profile (Center) */}
                    <div className="lg:col-start-2">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-gradient-to-br from-yellow-400/20 to-amber-500/20 border-2 border-yellow-400 rounded-2xl p-6 text-center"
                        >
                            <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">👤</span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground">{mainProfile.name}</h3>
                            <p className="text-sm text-zinc-400">({mainProfile.relationship})</p>
                        </motion.div>
                    </div>
                </div>

                {/* Relationship Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relationships.map((rel, index) => (
                        <motion.div
                            key={rel.profile.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => router.push(`/relationship/${rel.profile.id}`)}
                            className="bg-surface border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition cursor-pointer group"
                        >
                            {/* Profile Info */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">👤</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-foreground group-hover:text-yellow-400 transition">
                                        {rel.profile.name}
                                    </h4>
                                    <p className="text-xs text-zinc-500">{rel.profile.relationship}</p>
                                </div>
                            </div>

                            {rel.analysis && (
                                <>
                                    {/* Compatibility Score */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-zinc-400">궁합</span>
                                            <div className={`flex items-center gap-1 ${getCompatibilityColor(rel.analysis.score)}`}>
                                                {getCompatibilityIcon(rel.analysis.score)}
                                                <span className="font-bold text-lg">{rel.analysis.score}%</span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${rel.analysis.score}%` }}
                                                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                                                className={`h-full ${rel.analysis.score >= 80
                                                    ? 'bg-green-400'
                                                    : rel.analysis.score >= 60
                                                        ? 'bg-yellow-400'
                                                        : rel.analysis.score >= 40
                                                            ? 'bg-orange-400'
                                                            : 'bg-red-400'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Info */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <span className="text-zinc-500 text-xs">•</span>
                                            <p className="text-zinc-400 line-clamp-2">{rel.analysis.chemistry}</p>
                                        </div>
                                        {rel.analysis.tension && (
                                            <div className="flex items-start gap-2">
                                                <AlertTriangle className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" />
                                                <p className="text-orange-400/80 text-xs line-clamp-2">
                                                    {rel.analysis.tension}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/relationship/${rel.profile.id}`);
                                            }}
                                            className="flex-1 py-2 px-4 rounded-lg bg-white/5 text-zinc-300 text-sm font-medium hover:bg-white/10 transition"
                                        >
                                            상세 분석
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/relationship/${rel.profile.id}/vs`);
                                            }}
                                            className="flex-1 py-2 px-4 rounded-lg bg-yellow-400/20 text-yellow-400 text-sm font-black italic hover:bg-yellow-400/30 transition flex items-center justify-center gap-1"
                                        >
                                            VS 비교
                                            <Zap className="w-3 h-3" />
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
