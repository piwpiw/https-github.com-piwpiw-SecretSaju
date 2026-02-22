'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import {
    PRICING_TIERS,
    getPerUnitPrice,
    purchaseJellies,
} from '@/lib/jelly-wallet';
import type { PricingTier } from '@/types/jelly';

interface JellyShopModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPurchaseSuccess?: (jellies: number) => void;
    highlightTier?: 'taste' | 'smart' | 'pro';
}

export default function JellyShopModal({
    isOpen,
    onClose,
    onPurchaseSuccess,
    highlightTier,
}: JellyShopModalProps) {
    const [selectedTier, setSelectedTier] = useState<string | null>(
        highlightTier || 'pro'
    );
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handlePurchase = async (tier: PricingTier) => {
        setIsPurchasing(true);

        try {
            // 1. Initialize Payment via our API
            const response = await fetch('/api/payment/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tierId: tier.id }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Initialization failed');

            // 2. Load Toss Payments SDK
            const { loadTossPayments } = await import('@tosspayments/payment-sdk');
            const { PAYMENT_CONFIG } = await import('@/config');

            if (!PAYMENT_CONFIG.CLIENT_KEY) {
                throw new Error('Payment client key not configured');
            }

            const tossPayments = await loadTossPayments(PAYMENT_CONFIG.CLIENT_KEY);

            // 3. Request Payment
            // Note: This will redirect the page to Toss
            await tossPayments.requestPayment('카드', {
                amount: data.amount,
                orderId: data.orderId,
                orderName: data.orderName,
                successUrl: data.successUrl,
                failUrl: data.failUrl,
                customerName: data.customerName,
            });

        } catch (error: any) {
            console.error('Purchase failed:', error);
            alert(error.message || '결제 준비 중 오류가 발생했습니다.');
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full pointer-events-auto overflow-hidden border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 p-6 text-center">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Sparkles className="w-6 h-6 text-white" />
                                    <h2 className="text-2xl font-bold text-white">
                                        젤리 충전소
                                    </h2>
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-white/90 text-sm">
                                    지금 충전하고 운명의 비밀을 더 알아보세요!
                                </p>
                            </div>

                            {/* Pricing Tiers */}
                            <div className="p-6 space-y-4">
                                {PRICING_TIERS.map((tier, index) => {
                                    const totalJellies = tier.jellies + tier.bonus;
                                    const perUnitPrice = getPerUnitPrice(tier);
                                    const isSelected = selectedTier === tier.id;

                                    return (
                                        <motion.div
                                            key={tier.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => setSelectedTier(tier.id)}
                                            className={`
                        relative p-5 rounded-xl border-2 cursor-pointer transition-all
                        ${isSelected
                                                    ? 'border-yellow-400 bg-yellow-400/10 shadow-lg scale-[1.02]'
                                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                                }
                        ${tier.popular ? 'ring-2 ring-yellow-400/50' : ''}
                      `}
                                        >
                                            {/* Popular Badge */}
                                            {tier.popular && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                                        <TrendingUp className="w-3 h-3" />
                                                        인기 1위
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                {/* Left: Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-bold text-foreground">
                                                            {tier.label}
                                                        </h3>
                                                        {tier.badge && (
                                                            <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/20 px-2 py-0.5 rounded">
                                                                {tier.badge}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-3xl font-bold text-foreground">
                                                            {totalJellies}
                                                        </span>
                                                        <span className="text-sm text-zinc-400">젤리</span>
                                                        {tier.bonus > 0 && (
                                                            <span className="text-sm font-semibold text-green-400">
                                                                (+{tier.bonus} 보너스!)
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-zinc-500 mt-1">
                                                        개당 약 {perUnitPrice.toLocaleString()}원
                                                    </p>
                                                </div>

                                                {/* Right: Price */}
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-foreground">
                                                        {tier.price.toLocaleString()}
                                                        <span className="text-sm text-zinc-400 ml-1">
                                                            원
                                                        </span>
                                                    </div>
                                                    {tier.popular && (
                                                        <p className="text-xs text-yellow-400 font-medium mt-1">
                                                            가장 가성비 좋아요!
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Purchase Button */}
                            <div className="p-6 pt-0">
                                <button
                                    onClick={() => {
                                        const tier = PRICING_TIERS.find((t) => t.id === selectedTier);
                                        if (tier) handlePurchase(tier);
                                    }}
                                    disabled={isPurchasing || !selectedTier}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-lg hover:from-yellow-500 hover:to-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {isPurchasing ? '처리 중...' : '충전하기'}
                                </button>

                                <p className="text-center text-xs text-zinc-500 mt-3">
                                    💳 안전한 결제 시스템으로 보호됩니다
                                </p>
                            </div>

                            {/* Success Animation */}
                            <AnimatePresence>
                                {showSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-black/80 flex items-center justify-center z-10"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="text-center"
                                        >
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-20 h-20 mx-auto mb-4"
                                            >
                                                <Sparkles className="w-20 h-20 text-yellow-400" />
                                            </motion.div>
                                            <p className="text-2xl font-bold text-white">충전 완료!</p>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
