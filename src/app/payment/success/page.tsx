'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying payment status...');
  const [isMissingParams, setIsMissingParams] = useState(false);
  const verifiedRef = useRef(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (verifiedRef.current) return;
      verifiedRef.current = true;

      if (!paymentKey || !orderId || !amount) {
        setStatus('error');
        setIsMissingParams(true);
        setMessage('결제 처리 파라미터가 누락되어 결제 결과 확인을 진행할 수 없습니다. 결제를 다시 시작해 주세요.');
        return;
      }

      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });

        const data = await response.json().catch(() => ({} as Record<string, unknown>));

        if (response.ok && data.success) {
          setStatus('success');
          const credited = data.jellies_credited || data.added || 0;
          setMessage(`Payment verified. ${credited} jellies have been added.`);
          setTimeout(() => {
            router.push('/mypage');
          }, 3000);
        } else {
          throw new Error(data.error || 'Payment verification failed.');
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.message || 'An unexpected error occurred while verifying payment.');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

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
            <h2 className="text-2xl font-black text-foreground mb-3">Checking payment</h2>
            <p className="text-secondary font-medium">{message}</p>
            <div role="alert" aria-live="assertive" className="sr-only">
              {message}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-20 h-20 text-emerald-500 mb-6" />
            <h2 className="text-3xl font-black text-foreground uppercase tracking-tight mb-4">Payment Completed</h2>
            <p className="text-primary font-bold text-xl mb-8">{message}</p>
            <p className="text-sm text-secondary font-medium italic mb-2">Redirecting to MyPage.</p>
            <button
              onClick={() => router.push('/mypage')}
              className="mt-6 w-full py-5 bg-gradient-to-r from-primary to-indigo-600 text-white font-black text-lg rounded-2xl hover:scale-105 transition-all shadow-xl"
            >
              Go to MyPage
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-20 h-20 text-rose-500 mb-6" />
            <h2 className="text-3xl font-black text-foreground uppercase tracking-tight mb-4">Verification Failed</h2>
          <p className="text-rose-400 font-bold mb-8">{message}</p>
          <p className="text-xs text-secondary mb-4">결제 파라미터 확인 후 다시 시도해 주세요.</p>

            {isMissingParams ? (
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => router.push('/shop')}
                  className="w-full py-5 bg-gradient-to-r from-primary to-indigo-600 text-white font-black text-lg rounded-2xl hover:scale-105 transition-all"
                >
                  Retry Payment
                </button>
                <button
                  onClick={() => router.push('/mypage')}
                  className="w-full py-5 bg-background border border-border-color text-secondary font-black text-lg rounded-2xl hover:text-foreground transition-all"
                >
                  Back
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/mypage')}
                className="w-full py-5 bg-background border border-border-color text-secondary font-black text-lg rounded-2xl hover:text-foreground transition-all"
              >
                Back
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="w-full mt-3 py-4 bg-background border border-border-color/70 text-secondary font-black text-base rounded-2xl hover:text-foreground transition-all"
            >
              홈으로
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
