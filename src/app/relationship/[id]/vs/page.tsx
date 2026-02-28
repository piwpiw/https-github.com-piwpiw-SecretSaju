"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Share2, Sparkles, TrendingUp, Heart, Zap, Shield, ChevronRight, Target, Loader2, Download } from 'lucide-react';
import { getProfiles, SajuProfile } from '@/lib/storage';
import { calculateHighPrecisionSaju, HighPrecisionSajuResult } from '@/core/api/saju-engine';
import { analyzeRelationship, RelationshipAnalysis } from '@/lib/compatibility';
import RadarChart from '@/components/charts/RadarChart';
import Link from 'next/link';

interface TraitWinner {
    category: string;
    label: string;
    icon: any;
    winner: 'A' | 'B' | 'Draw';
    descA: string;
    descB: string;
}

export default function VSModePage() {
    const router = useRouter();
    const params = useParams();
    const profileId = params?.id as string;

    const [mainProfile, setMainProfile] = useState<SajuProfile | null>(null);
    const [targetProfile, setTargetProfile] = useState<SajuProfile | null>(null);
    const [sajuA, setSajuA] = useState<HighPrecisionSajuResult | null>(null);
    const [sajuB, setSajuB] = useState<HighPrecisionSajuResult | null>(null);
    const [analysis, setAnalysis] = useState<RelationshipAnalysis | null>(null);
    const [winners, setWinners] = useState<TraitWinner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSajuData = async () => {
            setIsLoading(true);
            try {
                const profiles = getProfiles();
                if (profiles.length < 2) {
                    router.push('/dashboard');
                    return;
                }

                const main = profiles[0];
                const target = profiles.find(p => p.id === profileId);

                if (!target) {
                    router.push('/dashboard');
                    return;
                }

                const resA = await calculateHighPrecisionSaju({
                    birthDate: new Date(main.birthdate),
                    birthTime: main.birthTime || '12:00',
                    gender: main.gender === 'male' ? 'M' : 'F',
                    calendarType: main.calendarType
                });

                const resB = await calculateHighPrecisionSaju({
                    birthDate: new Date(target.birthdate),
                    birthTime: target.birthTime || '12:00',
                    gender: target.gender === 'male' ? 'M' : 'F',
                    calendarType: target.calendarType
                });

                setMainProfile(main);
                setTargetProfile(target);
                setSajuA(resA);
                setSajuB(resB);
                setAnalysis(analyzeRelationship(resA, resB, target.relationship as any));
                setWinners(calculateWinners(resA, resB));
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadSajuData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId]);

    const calculateWinners = (a: HighPrecisionSajuResult, b: HighPrecisionSajuResult): TraitWinner[] => {
        const getScore = (res: HighPrecisionSajuResult, types: string[]) => {
            const values = Object.values(res.sipsong);
            return values.filter(v => types.includes(v)).length;
        };

        const categories = [
            {
                category: 'leadership',
                label: '추진력 & 리더십',
                icon: Zap,
                types: ['비견', '겁재', '편관'],
                desc: '목표를 향해 돌진하는 힘'
            },
            {
                category: 'empathy',
                label: '공감 & 포용력',
                icon: Heart,
                types: ['식신', '정인', '편인'],
                desc: '상대를 이해하고 감싸는 마음'
            },
            {
                category: 'logic',
                label: '현실감 & 논리',
                icon: Shield,
                types: ['정재', '정관', '상관'],
                desc: '상황을 냉철하게 분석하는 능력'
            }
        ];

        return categories.map(cat => {
            const scoreA = getScore(a, cat.types);
            const scoreB = getScore(b, cat.types);
            return {
                category: cat.category,
                label: cat.label,
                icon: cat.icon,
                winner: scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'Draw',
                descA: scoreA > 2 ? '강력함' : '보통',
                descB: scoreB > 2 ? '강력함' : '보통'
            };
        });
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-background flex flex-col items-center justify-center space-y-6">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-xl font-bold text-secondary">VS 분석 데이터 로딩 중...</p>
            </main>
        );
    }

    if (!sajuA || !sajuB || !analysis) return null;

    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden relative pb-40">

            {/* Header */}
            <div className="relative z-50 px-6 py-8 flex items-center justify-between max-w-7xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">뒤로</span>
                </button>

                <div className="flex flex-col items-center">
                    <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="inline-flex px-3 py-1.5 rounded-full mb-2"
                        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)' }}
                    >
                        <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                            VS 비교 분석
                        </span>
                    </motion.div>
                    <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-foreground)' }}>
                        <span style={{ color: 'var(--primary)' }}>{mainProfile?.name}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>vs</span>
                        <span>{targetProfile?.name}</span>
                    </h1>
                </div>

                <button className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition">
                    <Share2 className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            {/* VS Hero Section */}
            <div className="relative pt-12 pb-24 px-6 flex justify-between items-center max-w-5xl mx-auto">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                    <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent absolute" />
                </div>

                {/* Character A */}
                <motion.div
                    initial={{ x: -100, opacity: 0, rotate: -5 }}
                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="text-center z-10 relative group"
                >
                    <div className="absolute inset-0 bg-cyan-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition duration-700" />
                    <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 p-1 flex items-center justify-center mb-8 shadow-2xl relative">
                        <div className="absolute inset-0 bg-cyan-400/20 animate-pulse rounded-[2.5rem]" />
                        <div className="w-full h-full rounded-[2.3rem] bg-[#09090b] flex items-center justify-center overflow-hidden border-2 border-white/10">
                            <span className="text-6xl sm:text-7xl group-hover:scale-110 transition-transform duration-500">👑</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-xs font-medium" style={{ color: 'var(--primary)' }}>나</div>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{mainProfile?.name}</h3>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md inline-block border border-white/5">{analysis.pillarA}</div>
                    </div>
                </motion.div>

                {/* VS Center */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                >
                    <div className="relative">
                        <div className="text-8xl font-black italic text-white/5 absolute inset-0 blur-sm flex items-center justify-center">VS</div>
                        <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center font-black italic text-2xl shadow-[0_0_30px_rgba(255,255,255,0.4)] relative z-10">VS</div>
                    </div>
                </motion.div>

                {/* Character B */}
                <motion.div
                    initial={{ x: 100, opacity: 0, rotate: 5 }}
                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="text-center z-10 relative group"
                >
                    <div className="absolute inset-0 bg-purple-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition duration-700" />
                    <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-[2.5rem] bg-gradient-to-br from-purple-500 to-pink-600 p-1 flex items-center justify-center mb-8 shadow-2xl relative">
                        <div className="absolute inset-0 bg-purple-400/20 animate-pulse rounded-[2.5rem]" />
                        <div className="w-full h-full rounded-[2.3rem] bg-[#09090b] flex items-center justify-center overflow-hidden border-2 border-white/10">
                            <span className="text-6xl sm:text-7xl group-hover:scale-110 transition-transform duration-500">👤</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-xs font-medium text-purple-400">상대</div>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{targetProfile?.name}</h3>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md inline-block border border-white/5">{analysis.pillarB}</div>
                    </div>
                </motion.div>
            </div>

            {/* Radar Comparison */}
            <div className="p-8 sm:p-16 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase mb-12 flex items-center gap-4">
                    <div className="w-8 h-[1px] bg-slate-800" />
                    오행 균형 차트
                    <div className="w-8 h-[1px] bg-slate-800" />
                </div>

                <div className="relative group p-8 rounded-full">
                    <div className="absolute inset-0 bg-white/[0.02] border border-white/5 rounded-full animate-pulse" />
                    <RadarChart
                        dataA={sajuA.elements.scores as any}
                        dataB={sajuB.elements.scores as any}
                        size={320}
                    />
                </div>

                <div className="flex gap-12 mt-12 bg-white/5 px-8 py-4 rounded-2xl border border-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{mainProfile?.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{targetProfile?.name}</span>
                    </div>
                </div>
            </div>

            {/* Battle Insights */}
            <div className="max-w-3xl mx-auto px-6 space-y-16 py-16">
                <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-foreground)' }}>속성별 분석</h2>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>상세 비교</div>
                </div>

                <div className="space-y-6">
                    {winners.map((trait, idx) => (
                        <motion.div
                            key={trait.category}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-surface rounded-4xl p-1 relative group border border-border-color shadow-xl overflow-hidden"
                        >
                            <div className="p-8 sm:p-10 relative z-10">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                                            <trait.icon className={`w-8 h-8 ${trait.winner === 'A' ? 'text-cyan-400' : trait.winner === 'B' ? 'text-purple-400' : 'text-slate-500'}`} />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-1">{trait.label}</h4>
                                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>능력 지표</p>
                                        </div>
                                    </div>

                                    <div className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] border shadow-2xl transition-all ${trait.winner === 'A' ? 'border-primary/30 text-primary bg-primary/10' :
                                        trait.winner === 'B' ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' :
                                            'border-border-color text-secondary bg-background'
                                        }`}>
                                        {trait.winner === 'A' ? mainProfile?.name : trait.winner === 'B' ? targetProfile?.name : '균형'} 우세
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                                    <div className={`p-6 rounded-2xl border transition-all duration-700 ${trait.winner === 'A' ? 'bg-cyan-500/5 border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.1)]' : 'border-white/5 opacity-20'}`}>
                                        <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{mainProfile?.name}</div>
                                        <div className="text-lg font-bold" style={{ color: 'var(--text-foreground)' }}>{trait.descA}</div>
                                    </div>
                                    <div className={`p-6 rounded-2xl border transition-all duration-700 ${trait.winner === 'B' ? 'bg-purple-500/5 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.1)]' : 'border-white/5 opacity-20'}`}>
                                        <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{targetProfile?.name}</div>
                                        <div className="text-lg font-bold" style={{ color: 'var(--text-foreground)' }}>{trait.descB}</div>
                                    </div>
                                    {/* Link line */}
                                    <div className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#09090b] border border-white/10 flex items-center justify-center p-1 z-10">
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-600 to-purple-600 flex items-center justify-center text-[8px] font-black italic text-white">VS</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="max-w-2xl mx-auto px-6 mt-12 space-y-8">
                <div className="text-center opacity-30">
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>시크릿사주 분석 엔진</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-20">
                    <button className="flex-1 py-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                        <Download className="w-5 h-5" /> 결과 내보내기
                    </button>
                    <Link
                        href={`/relationship/${profileId}`}
                        className="flex-1 py-5 rounded-2xl text-sm font-medium flex items-center justify-center gap-3" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-foreground)', border: '1px solid var(--border-color)' }}
                    >
                        상세 분석 보기 <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </main>
    );
}
