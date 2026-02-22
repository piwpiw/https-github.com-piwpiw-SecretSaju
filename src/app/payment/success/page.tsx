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
        className="bg-surface p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-white/10"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mb-4" />
            <h2 className="text-xl font-bold mb-2">결제 확인 중</h2>
            <p className="text-zinc-400">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">결제 성공!</h2>
            <p className="text-zinc-400 mb-6">{message}</p>
            <p className="text-xs text-zinc-500">잠시 후 마이페이지로 이동합니다...</p>
            <button
              onClick={() => router.push('/mypage')}
              className="mt-6 w-full py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-500 transition"
            >
              마이페이지로 이동
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">결제 확인 실패</h2>
            <p className="text-red-400 mb-6">{message}</p>
            <button
              onClick={() => router.push('/mypage')}
              className="w-full py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition"
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
