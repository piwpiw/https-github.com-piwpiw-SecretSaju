'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const LOADING_STEPS = [
    '결제 요청 확인 중',
    '보안 서명 검증 중',
    '거래 상태 조회 중',
    '최종 검증 결과 처리 중',
];

function PaymentLoadingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [isTimeout, setIsTimeout] = useState(false);
    const orderId = searchParams.get('orderId') ?? 'UNKNOWN_ORDER';

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % LOADING_STEPS.length);
        }, 1200);

        const timeout = setTimeout(() => {
            setIsTimeout(true);
        }, 90000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    if (isTimeout) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface border border-border-color rounded-4xl p-8 max-w-md w-full text-center"
                >
                    <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-6" />
                    <h1 className="text-2xl font-black text-foreground mb-4">결제 검증 시간이 초과되었습니다.</h1>
                    <p className="text-sm text-secondary mb-8">결제가 완료된 경우 마이페이지에서 잔액을 확인해 주세요.</p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => router.push('/mypage')}
                            className="w-full py-4 bg-primary text-white font-black text-base rounded-2xl hover:opacity-90 transition-all"
                        >
                            마이페이지로 이동
                        </button>
                        <button
                            onClick={() => router.push('/shop')}
                            className="w-full py-4 bg-background border border-border-color text-secondary font-bold text-base rounded-2xl hover:text-foreground transition-all"
                        >
                            결제 다시 시도
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-8">Order ID: <span className="text-primary">{orderId}</span></p>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border-color rounded-4xl p-10 max-w-md w-full text-center"
            >
                <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-8" />
                <h1 className="text-2xl font-black text-foreground mb-6">결제 처리 중...</h1>
                <div className="space-y-4 mb-8">
                    {LOADING_STEPS.map((step, index) => (
                        <motion.p
                            key={step}
                            initial={{ opacity: 0.4 }}
                            animate={{
                                opacity: index === activeStep ? 1 : 0.35,
                            }}
                            className={`text-sm leading-relaxed ${index === activeStep ? 'text-primary font-bold' : 'text-secondary'}`}
                        >
                            {index + 1}. {step}
                        </motion.p>
                    ))}
                </div>
                <p className="text-xs text-slate-500">Order ID: <span className="text-primary">{orderId}</span></p>
            </motion.div>
        </main>
    );
}

export default function PaymentLoadingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
            </div>
        }>
            <PaymentLoadingContent />
        </Suspense>
    );
}
