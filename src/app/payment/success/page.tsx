'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('결제 정보를 확인 중입니다...');

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        setStatus('error');
        setMessage('필수 결제 정보가 누락되었습니다.');
        return;
      }

      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(`충전이 완료되었습니다! (젤리 +${data.jellies_credited || data.added || 0})`);
          // Redirect after a short delay
          setTimeout(() => {
            router.push('/mypage');
          }, 3000);
        } else {
          throw new Error(data.error || '검증 실패');
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.message || '결제 검증 중 오류가 발생했습니다.');
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
            <h2 className="text-3xl font-black text-foreground uppercase tracking-tight mb-4">결제 성공!</h2>
            <p className="text-primary font-bold text-xl mb-8">{message}</p>
            <p className="text-sm text-secondary font-medium italic mb-2">잠시 후 마이페이지로 이동합니다...</p>
            <button
              onClick={() => router.push('/mypage')}
              className="mt-6 w-full py-5 bg-gradient-to-r from-primary to-indigo-600 text-white font-black text-lg rounded-2xl hover:scale-105 transition-all shadow-xl"
            >
              마이페이지로 이동
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-20 h-20 text-rose-500 mb-6" />
            <h2 className="text-3xl font-black text-foreground uppercase tracking-tight mb-4">결제 확인 실패</h2>
            <p className="text-rose-400 font-bold mb-8">{message}</p>
            <button
              onClick={() => router.push('/mypage')}
              className="w-full py-5 bg-background border border-border-color text-secondary font-black text-lg rounded-2xl hover:text-foreground transition-all"
            >
              돌아가기
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
