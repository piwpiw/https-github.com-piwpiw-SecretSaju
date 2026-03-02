'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Coffee, ShieldCheck, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useLocale } from '@/lib/i18n';

interface DonationTier {
    id: string;
    amount: number;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    isPopular?: boolean;
}

const DONATION_TIERS: DonationTier[] = [
    {
        id: 'coffee',
        amount: 3000,
        label: '따뜻한 커피 한 잔',
        description: '개발자의 밤샘 작업에 큰 힘이 됩니다.',
        icon: <Coffee className="w-6 h-6" />,
        color: '#d97706',
    },
    {
        id: 'premium',
        amount: 10000,
        label: '프리미엄 후원',
        description: '보다 정교한 사주 엔진 고도화에 사용됩니다.',
        icon: <Sparkles className="w-6 h-6" />,
        color: '#8b5cf6',
        isPopular: true,
    },
    {
        id: 'angel',
        amount: 50000,
        label: '시크릿 엔젤',
        description: '서비스의 안정적인 운영과 확장을 지원합니다.',
        icon: <Heart className="w-6 h-6" />,
        color: '#ef4444',
    }
];

export default function SupportPage() {
    const { t } = useLocale();
    const [selectedTier, setSelectedTier] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDonate = async (tier: DonationTier) => {
        setIsProcessing(true);
        // Simulate payment logic (Toss 연동 추후 고도화)
        setTimeout(() => {
            alert(`${tier.label} 후원 감사드립니다! (데모 버전)`);
            setIsProcessing(false);
        }, 1500);
    };

    return (
        <div className="py-12 md:py-24 max-w-4xl mx-auto space-y-16">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium">
                    <Zap className="w-4 h-4" />
                    <span>Project Monetization & Support</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-display text-mystic">
                    Secret Saju를 응원해주세요
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                    여러분의 따뜻한 후원은 더 정교한 명리학 엔진 개발과<br />
                    안정적인 서비스 운영에 소중하게 사용됩니다.
                </p>
            </motion.div>

            {/* Donation Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {DONATION_TIERS.map((tier, idx) => (
                    <motion.div
                        key={tier.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => setSelectedTier(tier.id)}
                        className={`premium-card p-8 cursor-pointer group hover:scale-[1.02] transition-all relative ${selectedTier === tier.id ? 'ring-2 ring-primary border-primary/50' : ''
                            }`}
                    >
                        {tier.isPopular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-[10px] font-bold text-white uppercase tracking-tighter shadow-lg shadow-primary/20">
                                Best Value
                            </div>
                        )}
                        <div className="space-y-6">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center p-2"
                                style={{ backgroundColor: `${tier.color}15`, color: tier.color }}
                            >
                                {tier.icon}
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">{tier.label}</h3>
                                <p className="text-sm text-slate-400 line-clamp-2">{tier.description}</p>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <div className="text-2xl font-bold text-white">
                                    ₩{tier.amount.toLocaleString()}
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDonate(tier);
                                }}
                                disabled={isProcessing}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm bg-white/5 group-hover:bg-primary transition-all text-white disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>지금 후원하기</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Trust Section */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="premium-card p-8 md:p-12 text-center space-y-8 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/10"
            >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">안전한 결제 시스템</h2>
                    <p className="max-w-xl mx-auto text-slate-400 leading-relaxed">
                        Toss Payments 및 KakaoPay를 통해 보안이 강화된 안전한 후원이 가능합니다.<br />
                        후원 내역은 관리자 페이지를 통해 투명하게 관리됩니다.
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-6 grayscale opacity-50">
                    <span className="text-lg font-bold">Toss</span>
                    <span className="text-lg font-bold">KakaoPay</span>
                    <span className="text-lg font-bold">VISA</span>
                    <span className="text-lg font-bold">MasterCard</span>
                </div>
            </motion.div>
        </div>
    );
}
