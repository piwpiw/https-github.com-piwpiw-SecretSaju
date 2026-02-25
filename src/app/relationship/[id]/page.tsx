'use client';

import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProfiles, SajuProfile } from '@/lib/storage';
import { analyzeRelationship, RelationshipAnalysis } from '@/lib/compatibility';
import { calculateHighPrecisionSaju } from '@/core/api/saju-engine';
import { ArrowLeft, Lock, Sparkles, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import JellyBalance from '@/components/shop/JellyBalance';
import JellyShopModal from '@/components/shop/JellyShopModal';
import { isUnlocked, unlockContent, hasSufficientBalance } from '@/lib/jelly-wallet';

export default function RelationshipDetailPage() {
    const router = useRouter();
    const params = useParams();
    const profileId = params?.id as string;

    const [mainProfile, setMainProfile] = useState<SajuProfile | null>(null);
    const [targetProfile, setTargetProfile] = useState<SajuProfile | null>(null);
    const [analysis, setAnalysis] = useState<RelationshipAnalysis | null>(null);
    const [unlocked, setUnlocked] = useState(false);
    const [showShop, setShowShop] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const fetchRelationship = async () => {
            await loadRelationship();
        };
        fetchRelationship();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId]);

    const loadRelationship = async () => {
        const profiles = getProfiles();
        if (profiles.length < 2) {
            router.push('/dashboard');
            return;
        }

        const main = profiles[0];
        const target = profiles.find((p) => p.id === profileId);

        if (!target) {
            router.push('/dashboard');
            return;
        }

        setMainProfile(main);
        setTargetProfile(target);

        const fetchData = async () => {
            const mainSaju = await calculateHighPrecisionSaju({
                birthDate: new Date(main.birthdate),
                birthTime: main.birthTime || '12:00',
                gender: main.gender === 'male' ? 'M' : 'F',
                calendarType: main.calendarType
            });
            const targetSaju = await calculateHighPrecisionSaju({
                birthDate: new Date(target.birthdate),
                birthTime: target.birthTime || '12:00',
                gender: target.gender === 'male' ? 'M' : 'F',
                calendarType: target.calendarType
            });

            const rel = analyzeRelationship(
                mainSaju,
                targetSaju,
                target.relationship as any
            );

            setAnalysis(rel);
            setUnlocked(isUnlocked(profileId));
        };

        fetchData();
    };

    const handleUnlock = () => {
        if (!hasSufficientBalance(1)) {
            setShowShop(true);
            return;
        }
        setShowConfirm(true);
    };

    const confirmUnlock = () => {
        if (!profileId) return;

        const result = unlockContent(profileId);
        if (result.success) {
            setUnlocked(true);
            setShowConfirm(false);
            // Trigger balance update
            window.dispatchEvent(new CustomEvent('jelly-balance-update'));
        }
    };

    if (!mainProfile || !targetProfile || !analysis) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-zinc-400">로딩 중...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-20">
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-zinc-400 hover:text-foreground transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>돌아가기</span>
                    </button>
                    <JellyBalance onClick={() => { }} />
                </div>

                {/* Profiles Header */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {/* Main Profile */}
                    <div className="text-center">
                        <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-3xl">👤</span>
                        </div>
                        <h3 className="font-bold text-foreground">{mainProfile.name}</h3>
                        <p className="text-xs text-zinc-500">{mainProfile.relationship}</p>
                    </div>

                    {/* VS Arrow */}
                    <div className="flex items-center justify-center">
                        <div className="text-2xl font-bold text-yellow-400">VS</div>
                    </div>

                    {/* Target Profile */}
                    <div className="text-center">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-3xl">👤</span>
                        </div>
                        <h3 className="font-bold text-foreground">{targetProfile.name}</h3>
                        <p className="text-xs text-zinc-500">{targetProfile.relationship}</p>
                    </div>
                </div>

                {/* Compatibility Score */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-br from-yellow-400/20 to-amber-500/20 border border-yellow-400/30 rounded-2xl p-8 text-center mb-6"
                >
                    <div className="mb-4">
                        <div className={`text-6xl font-bold mb-2 ${analysis.score >= 80
                            ? 'text-green-400'
                            : analysis.score >= 60
                                ? 'text-yellow-400'
                                : analysis.score >= 40
                                    ? 'text-orange-400'
                                    : 'text-red-400'
                            }`}>
                            {analysis.score}%
                        </div>
                        <p className="text-xl font-bold text-foreground mb-1">{analysis.message}</p>
                        <p className="text-sm text-zinc-400">{analysis.chemistry}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${analysis.score}%` }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className={`h-full ${analysis.score >= 80
                                ? 'bg-green-400'
                                : analysis.score >= 60
                                    ? 'bg-yellow-400'
                                    : analysis.score >= 40
                                        ? 'bg-orange-400'
                                        : 'bg-red-400'
                                }`}
                        />
                    </div>
                </motion.div>

                {/* VS Mode Link */}
                <Link href={`/relationship/${profileId}/vs`}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="bg-slate-900 border border-yellow-400/30 rounded-xl p-4 flex items-center justify-between mb-6 hover:bg-slate-800 transition group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center font-black italic text-black skew-x-[-10deg]">VS</div>
                            <div>
                                <h4 className="font-bold text-yellow-400">능력치 비교 (VS 모드)</h4>
                                <p className="text-xs text-zinc-500">누가 더 추진력이 좋을까요? 직접 비교해보세요.</p>
                            </div>
                        </div>
                        <Sparkles className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition" />
                    </motion.div>
                </Link>

                {/* Basic Info (Always Visible) */}
                <div className="space-y-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-surface border border-white/10 rounded-xl p-5"
                    >
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-foreground mb-2">궁합 분석</h4>
                                <p className="text-zinc-300">{analysis.chemistry}</p>
                            </div>
                        </div>
                    </motion.div>

                    {analysis.tension && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-orange-400/10 border border-orange-400/30 rounded-xl p-5"
                        >
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-orange-400 mb-2">갈등 포인트</h4>
                                    <p className="text-orange-300/80">{analysis.tension}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Locked/Unlocked Content */}
                {unlocked ? (
                    <div className="space-y-4">
                        {/* Detailed Advice */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface border border-white/10 rounded-xl p-5"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-foreground mb-2">관계 개선 조언</h4>
                                    <p className="text-zinc-300">{analysis.advice}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Action Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-surface border border-white/10 rounded-xl p-5"
                        >
                            <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-yellow-400" />
                                실행 가능한 액션 아이템
                            </h4>
                            <ul className="space-y-3">
                                {analysis.actionItems.map((item, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                        className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-yellow-400 text-sm font-bold">{i + 1}</span>
                                        </div>
                                        <p className="text-zinc-300">{item}</p>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Future Prediction */}
                        {analysis.futurePredict && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl p-5"
                            >
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-purple-300 mb-2">장기 전망</h4>
                                        <p className="text-purple-200/80">{analysis.futurePredict}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    /* Locked State */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        {/* Blurred Content */}
                        <div className="filter blur-md pointer-events-none select-none">
                            <div className="bg-surface border border-white/10 rounded-xl p-5 mb-4">
                                <h4 className="font-bold text-foreground mb-2">관계 개선 조언</h4>
                                <p className="text-zinc-300">
                                    이 내용을 보려면 젤리가 필요합니다. 상세한 분석과 액션 아이템을 확인하세요.
                                </p>
                            </div>
                            <div className="bg-surface border border-white/10 rounded-xl p-5">
                                <h4 className="font-bold text-foreground mb-4">실행 가능한 액션 아이템</h4>
                                <div className="space-y-2">
                                    <div className="h-12 bg-white/5 rounded-lg"></div>
                                    <div className="h-12 bg-white/5 rounded-lg"></div>
                                    <div className="h-12 bg-white/5 rounded-lg"></div>
                                </div>
                            </div>
                        </div>

                        {/* Unlock Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-background/95 backdrop-blur-sm border-2 border-yellow-400 rounded-2xl p-8 text-center max-w-md">
                                <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    상세 분석이 잠겨있어요
                                </h3>
                                <p className="text-zinc-400 mb-6">
                                    1 젤리로 관계 개선 조언과 액션 아이템을 확인하세요
                                </p>
                                <button
                                    onClick={handleUnlock}
                                    className="w-full py-3 px-6 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition"
                                >
                                    1 젤리로 언락하기
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Shop Modal */}
            <JellyShopModal
                isOpen={showShop}
                onClose={() => setShowShop(false)}
                onPurchaseSuccess={() => {
                    setShowShop(false);
                    setShowConfirm(true);
                }}
            />

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-surface border border-white/20 rounded-2xl p-6 max-w-sm w-full"
                    >
                        <h3 className="text-xl font-bold text-foreground mb-3">확인</h3>
                        <p className="text-zinc-300 mb-6">
                            <span className="text-yellow-400 font-bold">1 젤리</span>를 사용하여
                            <br />
                            <span className="font-bold">{targetProfile?.name}</span>와의 상세 분석을 열까요?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-3 rounded-xl border border-white/20 text-zinc-400 hover:bg-white/5 transition"
                            >
                                취소
                            </button>
                            <button
                                onClick={confirmUnlock}
                                className="flex-1 py-3 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition"
                            >
                                확인
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </main>
    );
}
