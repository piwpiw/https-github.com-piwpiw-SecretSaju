'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, TrendingUp, CreditCard, Wallet, Building2, Smartphone } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { PRICING_TIERS, getPerUnitPrice } from '@/lib/payment/jelly-wallet';
import type { PricingTier } from '@/types/jelly';
import {
  trackPaymentClick,
  trackPaymentFail,
  trackPaymentInit,
} from '@/lib/app/analytics';

interface JellyShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess?: (jellies: number) => void;
  highlightTier?: 'taste' | 'smart' | 'pro' | 'donation';
}

type TossPaymentMethod = '카드' | '계좌이체' | '휴대폰' | '토스페이';

export default function JellyShopModal({
  isOpen,
  onClose,
  onPurchaseSuccess,
  highlightTier,
}: JellyShopModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(
    highlightTier || 'pro',
  );
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<TossPaymentMethod>('카드');

  const PAYMENT_METHODS: {
    id: TossPaymentMethod;
    label: string;
    icon: any;
    color: string;
    desc: string;
  }[] = [
    {
      id: '카드',
      label: '카드 결제',
      icon: CreditCard,
      color: 'from-blue-500 to-indigo-500',
      desc: '즉시 확인, 빠른 결제',
    },
    {
      id: '계좌이체',
      label: '계좌이체',
      icon: Building2,
      color: 'from-green-500 to-emerald-500',
      desc: '실시간 계좌 이체',
    },
    {
      id: '휴대폰',
      label: '휴대폰',
      icon: Smartphone,
      color: 'from-blue-400 to-cyan-400',
      desc: '통신사 휴대폰 결제',
    },
    {
      id: '토스페이',
      label: '간편결제',
      icon: Wallet,
      color: 'from-purple-500 to-pink-500',
      desc: '디지털 자산 결제',
    },
  ];

  const handleEscapeClose = useCallback((event: { key: string }) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      setIsPurchasing(false);
      setShowSuccess(false);
      setPurchaseError('');
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    window.addEventListener('keydown', handleEscapeClose);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscapeClose);
    };
  }, [handleEscapeClose, isOpen]);

  const handlePurchase = async (tier: PricingTier) => {
    trackPaymentClick(tier.id, tier.price);
    setIsPurchasing(true);
    setPurchaseError('');

    try {
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId: tier.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Initialization failed');
      }

      trackPaymentInit(tier.id, data.orderId, data.amount);

      const { loadTossPayments } = await import('@tosspayments/payment-sdk');
      const { PAYMENT_CONFIG } = await import('@/config');

      if (!PAYMENT_CONFIG.CLIENT_KEY) {
        throw new Error('Payment client key not configured');
      }

      const tossPayments = await loadTossPayments(PAYMENT_CONFIG.CLIENT_KEY);
      await tossPayments.requestPayment(paymentMethod, {
        amount: data.amount,
        orderId: data.orderId,
        orderName: data.orderName,
        successUrl: data.successUrl,
        failUrl: data.failUrl,
        customerName: data.customerName,
      });

      if (onPurchaseSuccess) {
        onPurchaseSuccess(tier.jellies + tier.bonus);
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      const errMessage =
        error?.message || '결제 요청을 시작할 수 없습니다. 잠시 후 다시 시도해 주세요.';
      setPurchaseError(errMessage);
      trackPaymentFail(null, errMessage);
      setShowSuccess(false);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full pointer-events-auto overflow-hidden border border-white/10"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleEscapeClose}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
            >
              <div
                className="relative p-6 text-center border-b"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-color)' }}
              >
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  className="absolute top-4 right-4 rounded-full p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)' }}
                  aria-label="젤리 구매 모달 닫기"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                  <h2 id={titleId} className="text-xl font-bold" style={{ color: 'var(--text-foreground)' }}>
                    젤리 구매
                  </h2>
                </div>
                <p id={descriptionId} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  내 지갑 잔액을 간편하게 충전하세요.
                </p>
              </div>

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
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      aria-label={`${tier.label}, 총 ${totalJellies}젤리, ${tier.price.toLocaleString()}원`}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setSelectedTier(tier.id);
                        }
                      }}
                      className={`
                        relative p-5 rounded-xl border-2 cursor-pointer transition-all
                        ${
                          isSelected
                            ? 'border-yellow-400 bg-yellow-400/10 shadow-lg scale-[1.02]'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }
                        ${tier.popular ? 'ring-2 ring-yellow-400/50' : ''}
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
                      `}
                    >
                      {tier.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <TrendingUp className="w-3 h-3" />
                            추천
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-foreground">{tier.label}</h3>
                            {tier.badge && (
                              <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/20 px-2 py-0.5 rounded">
                                {tier.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">{totalJellies}</span>
                            <span className="text-sm text-zinc-400">개</span>
                            {tier.bonus > 0 && (
                              <span className="text-sm font-semibold text-green-400">(+{tier.bonus} 보너스)</span>
                            )}
                          </div>

                          <p className="text-xs text-zinc-500 mt-1">{`평균 ${perUnitPrice.toLocaleString()}원 / 1젤리`}</p>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">
                            {tier.price.toLocaleString()}
                            <span className="text-sm text-zinc-400 ml-1">원</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="px-6 pb-4">
                <h3 className="text-sm font-semibold text-zinc-400 mb-3">결제 수단 선택</h3>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((method) => {
                    const isActive = paymentMethod === method.id;
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        aria-pressed={isActive}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                          ${
                            isActive
                              ? 'border-yellow-400 bg-yellow-400/10 shadow-md'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
                        `}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-bold ${isActive ? 'text-yellow-400' : 'text-foreground'}`}>
                            {method.label}
                          </p>
                          <p className="text-xs text-zinc-500 truncate">{method.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const tier = PRICING_TIERS.find((t) => t.id === selectedTier);
                    if (tier) {
                      handlePurchase(tier);
                    }
                  }}
                  disabled={isPurchasing || !selectedTier}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-lg hover:from-yellow-500 hover:to-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  {isPurchasing ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                      결제 시작 중...
                    </span>
                  ) : (
                    `${PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label || '카드'}로 결제하기`
                  )}
                </button>

                <p className="text-center text-xs text-zinc-500 mt-3">
                  결제 완료 후 사용 가능한 젤리 수량이 즉시 반영됩니다.
                </p>

                {purchaseError && (
                  <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300 text-center">
                    {purchaseError}
                  </p>
                )}
              </div>

              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 flex items-center justify-center z-10"
                  >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-20 h-20 mx-auto mb-4"
                      >
                        <Sparkles className="w-20 h-20 text-yellow-400" />
                      </motion.div>
                      <p className="text-2xl font-bold text-white">구매 완료!</p>
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
