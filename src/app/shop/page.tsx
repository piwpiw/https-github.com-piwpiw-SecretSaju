'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Zap, ArrowLeft, Gem, Check, Crown,
    CreditCard, ShieldCheck, Sparkles, Star
} from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import JellyBalance from '@/components/shop/JellyBalance';

const JELLY_PACKS = [
    { id: '10', count: 10, price: '₩3,300', bonus: '0', badge: '', color: 'from-slate-400 to-indigo-500' },
    { id: '35', count: 35, price: '₩9,900', bonus: '5', badge: 'BEST VALUE', color: 'from-amber-400 to-orange-500' },
    { id: '120', count: 120, price: '₩29,900', bonus: '20', badge: 'VIP CHOICE', color: 'from-purple-500 to-pink-600' },
];

const BENEFITS = [
    '프리미엄 사주 노드 평생 소장',
    '12운성 & 십신 딥 분석 해제',
    '신년운세 & 궁합 리서치 무제한 접근',
    '디지털 부적 고화질 다운로드 권한',
];

export default function ShopPage() {
    const router = useRouter();
    const { locale } = useLocale();
    const [selectedPack, setSelectedPack] = useState<string>('35');

    const handlePurchase = (packId: string) => {
        // In a real app, this would trigger Toss Payments
        alert(locale === 'ko' ? '토스페이먼츠 결제 모듈로 연결됩니다.' : 'Connecting to payment gateway...');
    };

    return (
        <main className="min-h-screen bg-[#050505] text-foreground relative overflow-hidden pb-40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1)_0%,transparent_50%)]" />
            <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
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
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block p-4 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] mb-8"
                    >
                        <Gem className="w-12 h-12 text-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)]" />
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9] mb-6">
                        젤리 <span className="text-amber-400">쇼룸</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium italic opacity-70 max-w-xl mx-auto">
                        당신의 운명 데이터를 해독하기 위한<br />
                        가장 강력한 통화(Currency)를 충전하세요.
                    </p>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {JELLY_PACKS.map((pack) => (
                        <motion.div
                            key={pack.id}
                            whileHover={{ y: -10 }}
                            onClick={() => setSelectedPack(pack.id)}
                            className={`relative bg-surface p-10 rounded-[3.5rem] border-2 transition-all cursor-pointer overflow-hidden group ${selectedPack === pack.id ? 'border-amber-400 shadow-2xl shadow-amber-400/10' : 'border-white/5 hover:border-white/20'
                                }`}
                        >
                            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform ${pack.color}`}>
                                <Crown className="w-40 h-40" />
                            </div>

                            {pack.badge && (
                                <div className="absolute top-6 right-6 px-4 py-1.5 bg-amber-400 text-black text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">
                                    {pack.badge}
                                </div>
                            )}

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${pack.color} flex items-center justify-center mb-10 shadow-xl shadow-indigo-500/20`}>
                                    <Gem className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">
                                    {pack.count} <span className="text-lg not-italic opacity-50 text-slate-400">JELLY</span>
                                </h3>
                                {pack.bonus !== '0' && (
                                    <p className="text-amber-400 text-sm font-black tracking-widest uppercase mb-6">+ {pack.bonus} BONUS JELLY</p>
                                )}

                                <div className="w-full h-[1px] bg-white/5 my-8" />

                                <p className="text-3xl font-black text-white italic mb-10">{pack.price}</p>

                                <button
                                    onClick={() => handlePurchase(pack.id)}
                                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${selectedPack === pack.id
                                            ? 'bg-amber-400 text-black shadow-xl shadow-amber-400/20 active:scale-95'
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    GET JELLY_
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Benefits Section */}
                <div className="bg-surface rounded-5xl border border-white/5 p-12 md:p-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(251,191,36,0.05)_0%,transparent_50%)]" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-16 items-center">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">프리미엄 회원 혜택</h2>
                            <div className="space-y-4">
                                {BENEFITS.map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-4 text-slate-400 font-bold italic">
                                        <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center border border-amber-400/30">
                                            <Check className="w-3 h-3 text-amber-400" />
                                        </div>
                                        {benefit}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 w-full p-10 bg-black/40 border border-white/10 rounded-4xl flex flex-col items-center text-center gap-6">
                            <Star className="w-12 h-12 text-amber-400 animate-spin-slow" />
                            <h4 className="text-xl font-black text-white italic uppercase">올데이 패스 (7일)</h4>
                            <p className="text-slate-500 font-medium">일주간 모든 사주 콘텐츠를 젤리 소모 없이 열람할 수 있는 자유이용권</p>
                            <p className="text-3xl font-black text-amber-400 italic">₩14,900</p>
                            <button className="px-10 py-5 bg-white text-black font-black text-sm rounded-2xl uppercase tracking-widest hover:scale-105 transition-all">
                                ALL_ACCESS_PASS
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Security */}
                <div className="mt-24 flex flex-col items-center gap-8 opacity-40">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">Secure Payments</span>
                        </div>
                        <div className="w-[1px] h-4 bg-white/20" />
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">Data Protection</span>
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Transaction Protocol v2.1 Verified</p>
                </div>
            </div>
        </main>
    );
}
