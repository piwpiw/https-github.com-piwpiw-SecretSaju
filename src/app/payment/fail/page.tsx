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
        className="bg-surface p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-white/10"
      >
        <div className="flex flex-col items-center">
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">결제에 실패했습니다</h2>

          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mt-4 w-full">
            <div className="flex items-start gap-2 text-left">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-semibold text-sm">에러 코드: {code || 'UNKNOWN'}</p>
                <p className="text-zinc-400 text-sm mt-1">{message || '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-8">
            <button
              onClick={() => router.push('/mypage')}
              className="py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition"
            >
              마이페이지
            </button>
            <button
              onClick={() => router.push('/')}
              className="py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-500 transition flex items-center justify-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
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
