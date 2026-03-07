'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { analyzeRelationship, RelationshipAnalysis } from '@/lib/compatibility';
import { calculateHighPrecisionSaju } from '@/core/api/saju-engine';
import { ArrowLeft, Lock, Sparkles, AlertTriangle, CheckCircle2, TrendingUp, ChevronRight, Loader2, Zap } from 'lucide-react';
import Link from 'next/link';
import JellyBalance from '@/components/shop/JellyBalance';
import JellyShopModal from '@/components/shop/JellyShopModal';
import { isUnlocked, unlockContent, hasSufficientBalance } from '@/lib/jelly-wallet';
import { parseCivilDate } from '@/lib/civil-date';

import { useProfiles } from '@/components/ProfileProvider';
import { useWallet } from '@/components/WalletProvider';

export default function RelationshipDetailPage() {
    const router = useRouter();
    const params = useParams();
    const profileId = params?.id as string;
    const { profiles } = useProfiles();
    const { isAdmin } = useWallet();

    const [mainProfile, setMainProfile] = useState<any | null>(null);
    const [targetProfile, setTargetProfile] = useState<any | null>(null);
    const [analysis, setAnalysis] = useState<RelationshipAnalysis | null>(null);
    const [unlocked, setUnlocked] = useState(false);
    const [showShop, setShowShop] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profiles.length > 0) {
            loadRelationship();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId, profiles]);

    const loadRelationship = async () => {
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
        setLoading(true);

        try {
            const mainBirthDate = parseCivilDate(main.birthdate) ?? new Date(1990, 0, 1, 12, 0, 0, 0);
            const targetBirthDate = parseCivilDate(target.birthdate) ?? new Date(1990, 0, 1, 12, 0, 0, 0);
            const mainSaju = await calculateHighPrecisionSaju({
                birthDate: mainBirthDate,
                birthTime: main.birthTime || '12:00',
                gender: main.gender === 'male' ? 'M' : 'F',
                calendarType: main.calendarType
            });
            const targetSaju = await calculateHighPrecisionSaju({
                birthDate: targetBirthDate,
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
            setUnlocked(isAdmin || isUnlocked(profileId));
        } catch (error) {
            console.error("Relationship analysis error:", error);
        } finally {
            setLoading(false);
        }
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
            window.dispatchEvent(new CustomEvent('jelly-balance-update'));
        }
    };

    if (loading || !mainProfile || !targetProfile || !analysis) {
        return (
            <main className="min-h-screen bg-background flex flex-col items-center justify-center space-y-6">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-xl font-bold text-secondary">궁합 분석 중...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen relative overflow-hidden pb-40">
            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">뒤로</span>
                    </button>
                    <JellyBalance onClick={() => setShowShop(true)} />
                </div>

                {/* Profiles Comparison Header */}
                <div className="relative mb-20">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 12 }}
                            className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-3xl flex items-center justify-center font-black italic text-white text-2xl shadow-[0_0_50px_rgba(34,211,238,0.5)] border border-white/30 backdrop-blur-xl"
                        >
                            VS
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 sm:gap-16 relative z-10">
                        {/* Main Profile */}
                        <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="premium-card p-6 sm:p-10 flex flex-col items-center group bg-cyan-950/5 border-cyan-500/20"
                        >
                            <div className="mystic-glow from-cyan-500/10" />
                            <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform duration-700">
                                <span className="text-4xl sm:text-6xl relative z-10">👑</span>
                                <div className="absolute inset-0 bg-cyan-400/10 animate-pulse" />
                            </div>
                            <h3 className="text-lg sm:text-3xl font-black text-white italic tracking-tighter uppercase mb-2">{mainProfile.name}</h3>
                            <div className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                                나
                            </div>
                        </motion.div>

                        {/* Target Profile */}
                        <motion.div
                            initial={{ x: 30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="premium-card p-6 sm:p-10 flex flex-col items-center group bg-purple-950/5 border-purple-500/20"
                        >
                            <div className="mystic-glow from-purple-500/10" />
                            <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform duration-700">
                                <span className="text-4xl sm:text-6xl relative z-10">👤</span>
                                <div className="absolute inset-0 bg-purple-400/10 animate-pulse" />
                            </div>
                            <h3 className="text-lg sm:text-3xl font-black text-white italic tracking-tighter uppercase mb-2">{targetProfile.name}</h3>
                            <div className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-black text-purple-400 uppercase tracking-widest">
                                상대
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Compatibility Score Card */}
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-surface rounded-5xl p-12 text-center mb-12 group border-2 border-yellow-500/30 overflow-hidden shadow-2xl relative"
                >
                    <div className="premium-card-border" />
                    <div className="mystic-glow from-yellow-500/10" />

                    <div className="relative z-10">
                        <div className="inline-block relative mb-6">
                            <div className={`text-9xl font-black drop-shadow-[0_0_40px_rgba(250,204,21,0.2)] tracking-tighter italic ${analysis.score >= 80 ? 'text-cyan-400' :
                                analysis.score >= 60 ? 'text-yellow-400' :
                                    analysis.score >= 40 ? 'text-orange-400' : 'text-rose-500'
                                }`}>
                                {analysis.score}<span className="text-4xl opacity-50 ml-1">%</span>
                            </div>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase mb-4 leading-tight">{analysis.message}</h2>
                        <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed tracking-wide">{analysis.chemistry}</p>

                        <div className="mt-12 max-w-md mx-auto h-2 bg-white/5 rounded-full border border-white/5 shadow-inner overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${analysis.score}%` }}
                                transition={{ delay: 0.8, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                className={`h-full relative ${analysis.score >= 80 ? 'bg-cyan-400' :
                                    analysis.score >= 60 ? 'bg-yellow-400' :
                                        analysis.score >= 40 ? 'bg-orange-400' : 'bg-rose-500'
                                    } shadow-[0_0_20px_currentColor]`}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* VS Mode CTA */}
                <Link href={`/relationship/${profileId}/vs`}>
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="premium-card p-8 mb-12 border-cyan-400/30 bg-cyan-900/10 flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl flex items-center justify-center font-black italic text-white text-2xl shadow-lg ring-4 ring-white/5">
                                VS
                            </div>
                            <div>
                                <h4 className="text-xl font-bold" style={{ color: 'var(--text-foreground)' }}>VS 비교 분석</h4>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>속성별 상세 비교</p>
                            </div>
                        </div>
                        <ChevronRight className="w-8 h-8 text-cyan-500 group-hover:translate-x-2 transition-transform" />
                    </motion.div>
                </Link>

                {/* 8.2 Life Timeline (Daewun) */}
                {analysis && mainProfile && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/40 backdrop-blur-2xl rounded-4xl p-10 border border-white/5 mb-12"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">대운 타임라인 (Life Cycle)</h3>
                            <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[8px] font-black tracking-widest uppercase border border-indigo-500/20">
                                10년 주기 변화
                            </div>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="flex-shrink-0 w-32 p-6 rounded-[2.5rem] bg-white/5 border border-white/5 text-center snap-center hover:bg-white/10 transition-all group">
                                    <p className="text-[10px] font-black text-slate-500 mb-3">{i * 10}세 ~</p>
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-black text-white">기운 {i + 1}</p>
                                    <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">분석 중</p>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-[10px] text-slate-600 italic text-center">※ 대운의 변화는 인생의 큰 방향성을 결정짓는 10개 마디입니다.</p>
                    </motion.div>
                )}

                {/* Analysis Sections */}
                <div className="space-y-8">
                    {analysis.tension && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-surface rounded-4xl p-8 border border-rose-500/20 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-rose-500/5 pointer-events-none" />
                            <div className="flex items-start gap-6 relative z-10">
                                <AlertTriangle className="w-8 h-8 text-rose-500 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-rose-500 mb-2">주의 사항</h4>
                                    <p className="text-foreground text-lg font-medium tracking-wide leading-relaxed">{analysis.tension}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {unlocked ? (
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-surface border border-border-color rounded-4xl p-10 flex flex-col gap-10 shadow-xl"
                            >
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                                        <h4 className="text-sm font-bold" style={{ color: 'var(--primary)' }}>관계 조언</h4>
                                    </div>
                                    <p className="text-slate-300 text-lg font-medium leading-relaxed tracking-wide">{analysis.advice}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <TrendingUp className="w-5 h-5 text-yellow-500" />
                                        <h4 className="text-sm font-bold text-amber-500">실행 계획</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {analysis.actionItems.map((item, i) => (
                                            <div
                                                key={i}
                                                className="p-6 rounded-2xl bg-background border border-border-color flex gap-4 shadow-sm"
                                            >
                                                <span className="text-primary font-black italic">0{i + 1}</span>
                                                <p className="text-foreground text-sm font-medium tracking-wide leading-relaxed">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {analysis.futurePredict && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="premium-card p-10 border-purple-500/20 bg-purple-950/5"
                                >
                                    <div className="flex items-start gap-6">
                                        <Sparkles className="w-8 h-8 text-purple-400 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-bold text-purple-400">미래 예측</h4>
                                            <p className="text-slate-300 text-lg font-medium leading-relaxed tracking-wide">{analysis.futurePredict}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        /* Locked State */
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative group"
                        >
                            <div className="premium-card p-12 blur-lg opacity-20 pointer-events-none border-white/5 shadow-none space-y-8">
                                <div className="h-6 w-1/3 bg-white/10 rounded-full" />
                                <div className="h-20 bg-white/10 rounded-3xl" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-24 bg-white/10 rounded-2xl" />
                                    <div className="h-24 bg-white/10 rounded-2xl" />
                                </div>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="premium-card p-10 sm:p-12 max-w-md text-center bg-black/40 backdrop-blur-xl border-yellow-500/30">
                                    <div className="w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-yellow-400/20">
                                        <Lock className="w-10 h-10 text-yellow-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-foreground)' }}>잠금된 콘텐츠</h3>
                                    <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                                        상세 조언과 실행 계획은 잠금되어 있습니다.<br />
                                        젤리 1개를 사용하여 잠금을 해제하세요.
                                    </p>
                                    <button
                                        onClick={handleUnlock}
                                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-lg tracking-widest uppercase shadow-xl shadow-yellow-500/20 hover:scale-[1.05] transition-all"
                                    >
                                        잠금 해제하기 (1 🐟)
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <JellyShopModal
                isOpen={showShop}
                onClose={() => setShowShop(false)}
                onPurchaseSuccess={() => {
                    setShowShop(false);
                    setShowConfirm(true);
                }}
            />

            <AnimatePresence>
                {showConfirm && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="premium-card p-10 max-w-sm w-full text-center border-yellow-500/30"
                        >
                            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-foreground)' }}>잠금 해제 확인</h3>
                            <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                                <span className="font-bold" style={{ color: 'var(--primary)' }}>1 🐟</span>를 소모하여 {targetProfile?.name}님과의<br />
                                상세 분석을 확인하시겠습니까?
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-4 rounded-xl border border-white/10 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={confirmUnlock}
                                    className="flex-1 py-4 rounded-xl bg-yellow-400 text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-yellow-500/20 hover:scale-105 transition-all"
                                >
                                    확인
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
