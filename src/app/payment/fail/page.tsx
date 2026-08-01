'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, ChevronLeft, AlertCircle } from 'lucide-react';
import { trackPaymentFail } from '@/lib/app/analytics';

function FailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams?.get('code');
  const message = searchParams?.get('message');
  const normalizedCode = (code || '').toUpperCase();

  const normalizedMessage = message || '결제 중 문제가 발생해 취소되었거나 실패했습니다. 잠시 후 다시 시도해 주세요.';

  useEffect(() => {
    trackPaymentFail(null, normalizedCode || 'FAILED');
  }, [normalizedCode]);

  const failureType = (() => {
    if (normalizedCode === 'USER_CANCEL' || normalizedCode === 'CANCELED') return 'cancel';
    if (
      normalizedCode === 'INVALID_PAYMENT_AMOUNT' ||
      normalizedCode === 'AMOUNT_MISMATCH' ||
      normalizedCode === 'PAYMENT_AMOUNT_MISMATCH' ||
      normalizedCode === 'PAYMENT_TOSS_AMOUNT_MISMATCH' ||
      normalizedCode === 'PAYMENT_TOSS_ORDER_MISMATCH' ||
      normalizedCode === 'PAYMENT_TOSS_PAYMENT_KEY_MISMATCH' ||
      normalizedCode === 'PAYMENT_VERIFICATION_SIGNATURE_INVALID'
    ) return 'amount';
    return 'general';
  })();

  const getPrimaryLabel = () => {
    if (failureType === 'cancel') return '결제 취소 상태로 홈 이동';
    if (failureType === 'amount') return '다시 결제 시도';
    return '다시 결제하기';
  };

  const getPrimaryRoute = () => {
    if (failureType === 'cancel') return '/';
    return '/shop';
  };

  // 모바일 여백은 레이아웃(src/app/layout.tsx)이 주는 좌우 8px 로 끝낸다. 여기서 p-2 를
  // 또 주고 카드 p-4 안에 실패 안내 상자를 한 겹 더 두면 상자가 3겹이 되어 본문이
  // 262/390(0.67)까지 좁아졌다. sm: 이상(데스크톱) 값은 그대로 둔다.
  return (
    <div className="min-h-screen flex items-center justify-center p-0 sm:p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface p-3 sm:p-8 md:p-6 sm:p-9 rounded-4xl shadow-2xl max-w-md w-full text-center border border-border-color"
      >
        <div className="flex flex-col items-center">
          <XCircle className="w-16 h-16 sm:w-20 sm:h-20 text-rose-500 mb-6" />
          <h2 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tight mb-2">결제 실패</h2>

          {/* 카드 안의 카드라 모바일 여백을 바깥(p-3)보다 더 줄인다.
              모바일에서는 아이콘을 문단 위로 올린다 — 옆에 두면 아이콘(24)+
              간격(12)만으로 본문 폭이 기준(콘텐츠 폭 0.82) 아래로 내려간다. */}
          <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 sm:p-6 rounded-2xl mt-6 w-full">
            <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 text-left">
              <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-rose-400 font-bold text-base sm:text-lg">실패 코드: {normalizedCode || '확인 불가'}</p>
                <p className="text-rose-400/80 font-medium text-sm sm:text-base mt-2 leading-relaxed">{normalizedMessage}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full mt-10">
            <button
              onClick={() => router.push(getPrimaryRoute())}
              className="py-4 sm:py-5 bg-background border border-border-color text-muted font-black text-base sm:text-lg rounded-2xl hover:text-foreground transition-all min-h-[48px] flex items-center justify-center"
            >
              {getPrimaryLabel()}
            </button>
            <button
              onClick={() => router.push('/mypage')}
              className="py-4 sm:py-5 bg-background border border-border-color text-muted font-black text-base sm:text-lg rounded-2xl hover:text-foreground transition-all min-h-[48px] flex items-center justify-center"
            >
              마이페이지
            </button>
            <button
              onClick={() => router.push('/')}
              className="py-4 sm:py-5 bg-primary text-white font-black text-base sm:text-lg rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg min-h-[48px] sm:col-span-2"
            >
              <ChevronLeft className="w-5 h-5" />
              {failureType === 'cancel' ? '홈으로' : '홈으로 이동'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function FailPage() {
  return (
    <Suspense fallback={<div>결제 실패 페이지 로드 중...</div>}>
      <FailContent />
    </Suspense>
  );
}
