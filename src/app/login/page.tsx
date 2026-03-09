'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AuthModal from '@/components/auth/AuthModal';

export default function LoginPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.18),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.12),transparent_55%)]" />

            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-lg w-full rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-7"
            >
                <p className="text-[11px] font-black tracking-[0.18em] text-indigo-200 mb-2">시크릿사주</p>
                <h1 className="text-3xl font-black leading-tight">로그인</h1>
                <p className="mt-2 text-sm text-slate-300">카카오·구글·이메일로 빠르게 로그인하세요. 네이버 로그인은 준비 중입니다.</p>

                <section aria-labelledby="login-page-guide" className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
                    <h2 id="login-page-guide" className="text-xs font-black tracking-widest text-indigo-300 uppercase">
                        빠른 이용 가이드
                    </h2>
                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                        <li>1. 원하는 로그인 수단 선택</li>
                        <li>2. 인증 완료 후 이전 화면으로 자동 복귀</li>
                        <li>3. 문제 발생 시 `문의하기`에서 즉시 접수</li>
                    </ul>
                </section>

                <div className="mt-5 text-sm text-slate-300">
                    계정이 없으신가요?{" "}
                    <Link href="/signup" className="text-indigo-300 font-black hover:text-indigo-200">
                        회원가입
                    </Link>
                </div>

                <div className="mt-6 flex flex-wrap gap-2.5">
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="px-4 py-2 rounded-lg border border-white/15 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10"
                    >
                        홈으로 이동
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/inquiry')}
                        className="px-4 py-2 rounded-lg border border-indigo-300/30 text-xs font-bold text-indigo-200 hover:bg-indigo-500/20"
                    >
                        문의하기
                    </button>
                </div>
            </motion.div>

            <AuthModal isOpen={true} onClose={() => router.push('/')} defaultMode="login" />
        </main>
    );
}
