'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, ChevronLeft, AlertCircle } from 'lucide-react';

function FailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface p-8 md:p-12 rounded-4xl shadow-2xl max-w-md w-full text-center border border-border-color"
      >
        <div className="flex flex-col items-center">
          <XCircle className="w-20 h-20 text-rose-500 mb-6" />
          <h2 className="text-3xl font-black text-foreground uppercase tracking-tight mb-2">결제 실패</h2>

          <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl mt-6 w-full">
            <div className="flex items-start gap-3 text-left">
              <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-rose-400 font-bold">에러 코드: {code || 'UNKNOWN'}</p>
                <p className="text-rose-400/80 font-medium text-sm mt-2">{message || '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mt-10">
            <button
              onClick={() => router.push('/mypage')}
              className="py-5 bg-background border border-border-color text-secondary font-black text-lg rounded-2xl hover:text-foreground transition-all"
            >
              마이페이지
            </button>
            <button
              onClick={() => router.push('/')}
              className="py-5 bg-primary text-white font-black text-lg rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              <ChevronLeft className="w-5 h-5" />
              메인으로
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function FailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FailContent />
    </Suspense>
  );
}
