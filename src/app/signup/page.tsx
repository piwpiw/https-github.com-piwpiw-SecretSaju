'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AuthModal from '@/components/auth/AuthModal';

export default function SignupPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(79,70,229,0.22),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(16,185,129,0.14),transparent_55%)]" />

            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-md w-full rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-7"
            >
                <p className="text-[11px] font-black tracking-[0.18em] text-emerald-200 mb-2">가입 안내</p>
                <h1 className="text-3xl font-black leading-tight">회원가입</h1>
                <p className="mt-2 text-sm text-slate-300">소셜 계정으로 바로 가입하고 사주 분석을 시작하세요.</p>
                <div className="mt-5 text-sm text-slate-300">
                    이미 계정이 있으신가요?{' '}
                    <Link href="/login" className="text-indigo-300 font-black hover:text-indigo-200">로그인</Link>
                </div>
                <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="mt-6 px-4 py-2 rounded-lg border border-white/15 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10"
                >
                    홈으로 이동
                </button>
            </motion.div>

                <AuthModal isOpen={true} onClose={() => router.push('/')} defaultMode="signup" />
        </main>
    );
}
