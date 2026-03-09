'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { getPaymentVerifyFailureMessage } from '@/lib/payment/payment-verify-message';
import {
  trackPaymentFail,
  trackPaymentVerifyRequest,
  trackPaymentVerifyComplete,
} from '@/lib/app/analytics';

type VerifyState = 'loading' | 'success' | 'error';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<VerifyState>('loading');
  const [message, setMessage] = useState('결제 연동 확인 중입니다...');
  const [isMissingParams, setIsMissingParams] = useState(false);
  const verifiedRef = useRef(false);

  useEffect(() => {
    const paymentKey = searchParams?.get('paymentKey') ?? null;
    const orderId = searchParams?.get('orderId') ?? null;
    const amount = searchParams?.get('amount') ?? null;
    const verifyToken = searchParams?.get('verifyToken') ?? null;
    const verifySignature = searchParams?.get('verifySignature') ?? null;

    const verifyPayment = async () => {
      if (verifiedRef.current) return;
      verifiedRef.current = true;

      if (!paymentKey || !orderId || !amount || !verifyToken || !verifySignature) {
        setStatus('error');
        setIsMissingParams(true);
        setMessage('결제 파라미터가 손상되어 결제 결과를 확인할 수 없습니다. 결제 페이지로 돌아가 재결제해주세요.');
        trackPaymentFail(orderId || 'UNKNOWN_ORDER', 'MISSING_REQUIRED_PARAMS');
        return;
      }

      try {
        const parsedAmount = Number(amount);
        trackPaymentVerifyRequest(orderId, parsedAmount, 'success_page');

        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parsedAmount,
            verifyToken,
            verifySignature,
          }),
        });

        const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

        const errorCode = typeof data.error_code === 'string'
          ? data.error_code
          : typeof data.errorCode === 'string'
            ? data.errorCode
            : typeof data.error === 'string'
              ? data.error
              : undefined;

        if (response.ok && Boolean(data.success)) {
          setStatus('success');
          const credited = Number(data.jellies_credited || data.added || 0);
          setMessage(`결제가 완료되었습니다. ${credited}개 젤리가 충전됩니다.`);
          trackPaymentVerifyComplete(orderId, credited);
          setTimeout(() => {
            router.push('/mypage');
          }, 2500);
          return;
        }

        trackPaymentFail(orderId, errorCode || 'PAYMENT_VERIFY_FAILED');
        throw new Error(getPaymentVerifyFailureMessage(errorCode));
      } catch (error) {
        const errMessage = error instanceof Error ? error.message : '결제 인증 처리 중 오류가 발생했습니다.';
        setStatus('error');
        setMessage(errMessage);
      }
    };

    void verifyPayment();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface p-8 md:p-12 rounded-4xl shadow-2xl max-w-md w-full text-center border border-border-color"
        role="status"
        aria-live="polite"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
            <h2 className="text-2xl font-black text-foreground mb-3">결제 확인 중</h2>
            <p className="text-secondary font-medium">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-20 h-20 text-emerald-500 mb-6" />
            <h2 className="text-3xl font-black text-foreground uppercase tracking-tight mb-4">결제 완료</h2>
            <p className="text-primary font-bold text-xl mb-8">{message}</p>
            <p className="text-sm text-secondary font-medium italic mb-2">마이페이지로 이동합니다.</p>
            <button
              onClick={() => router.push('/mypage')}
              className="mt-6 w-full py-5 bg-gradient-to-r from-primary to-indigo-600 text-white font-black text-lg rounded-2xl hover:scale-105 transition-all shadow-xl"
            >
              바로 이동
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-20 h-20 text-rose-500 mb-6" />
            <h2 className="text-3xl font-black text-foreground uppercase tracking-tight mb-4">결제 검증 실패</h2>
            <p className="text-rose-400 font-bold mb-8">{message}</p>

            {isMissingParams ? (
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => router.push('/shop')}
                  className="w-full py-5 bg-gradient-to-r from-primary to-indigo-600 text-white font-black text-lg rounded-2xl hover:scale-105 transition-all"
                >
                  결제 다시 시도
                </button>
                <button
                  onClick={() => router.push('/mypage')}
                  className="w-full py-5 bg-background border border-border-color text-secondary font-black text-lg rounded-2xl hover:text-foreground transition-all"
                >
                  마이페이지로 이동
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/mypage')}
                className="w-full py-5 bg-background border border-border-color text-secondary font-black text-lg rounded-2xl hover:text-foreground transition-all"
              >
                마이페이지로 이동
              </button>
            )}

            <button
              onClick={() => router.push('/')}
              className="w-full mt-3 py-4 bg-background border border-border-color/70 text-secondary font-black text-base rounded-2xl hover:text-foreground transition-all"
            >
              홈으로 이동
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
