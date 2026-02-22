"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Share2, Sparkles, TrendingUp, Heart, Zap, Shield } from 'lucide-react';
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

    useEffect(() => {
        const loadSajuData = async () => {
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

            // Calculate Winners
            setWinners(calculateWinners(resA, resB));
        };

        loadSajuData();
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

    if (!sajuA || !sajuB || !analysis) return null;

    return (
        <main className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
            {/* Header */}
            <div className="p-6 flex items-center justify-between relative z-10">
                <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-black italic tracking-tighter text-yellow-400">VS MODE</h1>
                <button className="p-2 hover:bg-white/10 rounded-full transition">
                    <Share2 className="w-6 h-6" />
                </button>
            </div>

            {/* VS Hero Section */}
            <div className="relative pt-4 pb-12 px-6 flex justify-between items-center max-w-4xl mx-auto">
                {/* Character A */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-center z-10"
                >
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-3xl rotate-3 flex items-center justify-center mb-4 shadow-2xl shadow-yellow-500/20">
                        <span className="text-6xl md:text-7xl">👤</span>
                    </div>
                    <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-black mb-1">
                        {mainProfile?.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono tracking-widest">{analysis.pillarA}</div>
                </motion.div>

                {/* VS Text */}
                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                >
                    <div className="text-8xl md:text-9xl font-black italic text-white/5 tracking-tighter">VS</div>
                    <div className="text-4xl md:text-5xl font-black italic text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">VS</div>
                </motion.div>

                {/* Character B */}
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-center z-10"
                >
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-3xl -rotate-3 flex items-center justify-center mb-4 shadow-2xl shadow-sky-500/20">
                        <span className="text-6xl md:text-7xl">👤</span>
                    </div>
                    <div className="bg-sky-400 text-white px-3 py-1 rounded-full text-sm font-black mb-1">
                        {targetProfile?.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono tracking-widest">{analysis.pillarB}</div>
                </motion.div>
            </div>

            {/* Radar Chart (Elements Balance) */}
            <div className="bg-white/5 border-y border-white/10 py-12 flex flex-col items-center">
                <div className="text-sm font-bold tracking-widest text-slate-500 mb-8 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    ENERGY BALANCE COMPARISON
                    <Sparkles className="w-4 h-4 text-sky-400" />
                </div>
                <div className="relative">
                    <RadarChart
                        dataA={sajuA.elements.scores as any}
                        dataB={sajuB.elements.scores as any}
                        size={320}
                    />
                </div>
                <div className="flex gap-8 mt-8">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                        <span className="text-xs font-bold text-slate-300">{mainProfile?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
                        <span className="text-xs font-bold text-slate-300">{targetProfile?.name}</span>
                    </div>
                </div>
            </div>

            {/* Who Wins Comparison */}
            <div className="p-6 max-w-2xl mx-auto space-y-6">
                <div className="text-center mb-4 pt-4">
                    <h2 className="text-2xl font-black italic tracking-tight">WHO IS STRONGER?</h2>
                    <p className="text-slate-500 text-sm">사주 십성(Sipsong) 데이터를 기반으로 한 능력치 비교</p>
                </div>

                <div className="space-y-4">
                    {winners.map((trait, idx) => (
                        <motion.div
                            key={trait.category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-5"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-800 rounded-lg">
                                        <trait.icon className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <span className="font-bold text-lg">{trait.label}</span>
                                </div>
                                <div className="bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full text-xs font-black">
                                    {trait.winner === 'A' ? mainProfile?.name : trait.winner === 'B' ? targetProfile?.name : 'DRAW'} WIN
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 relative">
                                <div className={`p-4 rounded-xl border-2 transition ${trait.winner === 'A' ? 'bg-yellow-400/5 border-yellow-400' : 'bg-transparent border-white/5'}`}>
                                    <div className="text-xs text-slate-500 mb-1">RANK</div>
                                    <div className={`font-black text-xl ${trait.winner === 'A' ? 'text-yellow-400' : 'text-slate-500'}`}>{trait.descA}</div>
                                </div>
                                <div className={`p-4 rounded-xl border-2 transition ${trait.winner === 'B' ? 'bg-sky-400/5 border-sky-400' : 'bg-transparent border-white/5'}`}>
                                    <div className="text-xs text-slate-500 mb-1">RANK</div>
                                    <div className={`font-black text-xl ${trait.winner === 'B' ? 'text-sky-400' : 'text-slate-500'}`}>{trait.descB}</div>
                                </div>
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 p-1 rounded-full border border-white/10">
                                    <div className="text-[10px] font-black italic text-slate-600">VS</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 pt-12 text-center">
                <p className="text-slate-600 text-xs mb-8 tracking-widest uppercase">Secret Paws Enterprise Engine Accuracy 99.8%</p>
                <div className="flex flex-col gap-4 max-w-md mx-auto">
                    <button className="w-full py-5 bg-yellow-400 text-black font-black text-lg rounded-2xl shadow-2xl shadow-yellow-500/30 hover:scale-[1.02] transition active:scale-[0.98] flex items-center justify-center gap-2">
                        <Share2 className="w-6 h-6" />
                        결과 이미지로 저장하기
                    </button>
                    <Link href={`/relationship/${profileId}`} className="w-full py-4 bg-white/5 border border-white/10 text-slate-300 font-bold rounded-2xl hover:bg-white/10 transition">
                        상세 관계 인사이트 보러가기
                    </Link>
                </div>
            </div>
        </main>
    );
}
