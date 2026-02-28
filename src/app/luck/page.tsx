'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getProfiles, SajuProfile } from '@/lib/storage';
import {
    Shield, Sparkles, Hash, ArrowLeft, Loader2,
    Zap, AlertCircle, Calendar, RefreshCw, Eye
} from 'lucide-react';
import Link from 'next/link';
import JellyBalance from '@/components/shop/JellyBalance';
import { useLocale } from '@/lib/i18n';

const LUCK_RECORDS = [
    { id: 'direction', titleKo: '개운(開運) 방위', titleEn: 'Lucky Direction', descKo: '오늘 당신의 기운을 보강해줄 행운의 방위는 "남동쪽"입니다.', descEn: 'Your lucky direction today is Southeast.', icon: Zap, color: 'text-amber-400' },
    { id: 'color', titleKo: '퍼스널 행운 컬러', titleEn: 'Lucky Color', descKo: '금(金)의 기운을 보충하는 "실버/화이트" 계열이 길합니다.', descEn: 'Silver/White colors will boost your metal energy.', icon: Sparkles, color: 'text-cyan-400' },
    { id: 'time', titleKo: '황금 시간대', titleEn: 'Golden Hour', descKo: '오후 3시~5시(申時) 사이에 중요한 결정을 내리세요.', descEn: 'Make important decisions between 3 PM and 5 PM.', icon: Calendar, color: 'text-indigo-400' },
];

export default function LuckPage() {
    const router = useRouter();
    const { t, locale } = useLocale();
    const [profile, setProfile] = useState<SajuProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [luckyNumbers, setLuckyNumbers] = useState<number[] | null>(null);

    useEffect(() => {
        const profiles = getProfiles();
        if (profiles.length > 0) {
            setProfile(profiles[0]);
        }
        setLoading(false);
    }, []);

    const handleGenerateNumbers = () => {
        setAnalyzing(true);
        setTimeout(() => {
            const numbers = Array.from({ length: 6 }, () => Math.floor(Math.random() * 45) + 1).sort((a, b) => a - b);
            setLuckyNumbers(numbers);
            setAnalyzing(false);
        }, 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] text-foreground relative overflow-hidden pb-40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05)_0%,transparent_50%)]" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-16">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black tracking-widest uppercase italic">BACK_TRACK</span>
                    </button>
                    <JellyBalance />
                </div>

                {/* Hero Section */}
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8"
                    >
                        <span className="text-[10px] font-black text-emerald-400 flex items-center gap-2 uppercase tracking-[0.3em]">
                            <Shield className="w-3 h-3" /> Luck & Protection Protocol
                        </span>
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9] mb-6">
                        액운 <span className="text-emerald-500">디펜스</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium italic opacity-70 max-w-xl mx-auto">
                        {profile?.name}님의 사주 알고리즘을 분석하여<br />
                        부정적인 기운을 차단하고 행운의 주파수를 동기화합니다.
                    </p>
                </div>

                {/* Lucky Numbers Section */}
                <div className="mb-20">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-surface rounded-5xl p-10 md:p-16 border border-emerald-500/20 relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Hash className="w-40 h-40 text-emerald-500" />
                        </div>

                        <div className="relative z-10 text-center">
                            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">행운의 주파수 번호</h2>
                            <p className="text-slate-400 font-bold mb-12">오행의 순환을 기반으로 추출된 6개의 행운 숫자</p>

                            <AnimatePresence mode="wait">
                                {analyzing ? (
                                    <motion.div
                                        key="analyzing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center gap-6 py-4"
                                    >
                                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                                        <p className="text-sm font-black text-emerald-500 uppercase tracking-widest animate-pulse">Scanning Elemental Resonance...</p>
                                    </motion.div>
                                ) : luckyNumbers ? (
                                    <motion.div
                                        key="numbers"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-wrap justify-center gap-4 py-4"
                                    >
                                        {luckyNumbers.map((num, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="w-16 h-16 rounded-2xl bg-emerald-500 text-black font-black text-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                            >
                                                {num}
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <button
                                        onClick={handleGenerateNumbers}
                                        className="px-12 py-6 bg-emerald-500 text-black font-black text-xl rounded-2xl hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-widest"
                                    >
                                        번호 추출 프로토콜 실행
                                    </button>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                {/* Lucky Records Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    {LUCK_RECORDS.map((record, i) => (
                        <motion.div
                            key={record.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-surface rounded-4xl p-8 border border-white/5 hover:border-emerald-500/30 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <record.icon className={`w-6 h-6 ${record.color}`} />
                            </div>
                            <h3 className="text-lg font-black text-white mb-2 uppercase italic tracking-tighter">
                                {locale === 'ko' ? record.titleKo : record.titleEn}
                            </h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed italic opacity-80">
                                {locale === 'ko' ? record.descKo : record.descEn}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Protection Items */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <AlertCircle className="w-6 h-6 text-emerald-500" />
                        <h2 className="text-xl font-black text-white uppercase italic tracking-widest">실시간 액운 방지 가이드</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { t: '음식 개운법', d: '오늘은 "쓴맛"을 내는 음식이 당신의 화(火) 기운을 조절해줍니다.' },
                            { t: '행동 지침', d: '낯선 사람과의 금전 거래는 가급적 피하는 것이 상책입니다.' },
                            { t: '공간 정화', d: '현관에 작은 식물을 두어 외부의 나쁜 기운을 필터링하세요.' }
                        ].map((item, i) => (
                            <div key={i} className="bg-surface p-8 rounded-4xl border border-white/5 flex items-center justify-between group hover:bg-emerald-500/5 transition-all">
                                <div>
                                    <h4 className="text-emerald-500 font-black text-sm uppercase tracking-widest mb-1">{item.t}</h4>
                                    <p className="text-slate-200 font-bold italic">{item.d}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-background border border-border-color flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all">
                                    <Zap className="w-4 h-4 text-slate-500 group-hover:text-black" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* App Utility CTA */}
                <div className="mt-20 p-12 bg-gradient-to-br from-emerald-950/40 to-black rounded-5xl border border-emerald-500/20 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-white uppercase italic mb-4">디지털 부적 서비스</h3>
                        <p className="text-slate-400 mb-8 font-medium">강력한 수호의 에너지를 스마트폰 배경화면으로 소장하세요.</p>
                        <button className="px-10 py-5 bg-background border border-emerald-500/30 rounded-2xl text-emerald-400 font-black text-sm uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-500 hover:text-black transition-all">
                            APP ONLY_ ACCESS_
                        </button>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)] opacity-50" />
                </div>
            </div>
        </main>
    );
}

