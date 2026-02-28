'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Github, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLocale } from '@/lib/i18n';
import { loginWithKakao } from '@/lib/kakao-auth';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { t, locale } = useLocale();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setIsLoading('google');
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback` }
            });
        } catch (error) {
            console.error(error);
            setIsLoading(null);
        }
    };

    const handleKakaoLogin = async () => {
        setIsLoading('kakao');
        // If Supabase Kakao is configured, you'd use supabase.auth.signInWithOAuth.
        // But to maintain exact current behavior (mock mode), we use existing logic:
        loginWithKakao();
        setTimeout(() => setIsLoading(null), 2000);
    };

    const handleNaverLogin = async () => {
        setIsLoading('naver');
        try {
            // NOTE: NextJS doesn't natively support Naver in Supabase out of the box unless configured in dashboard.
            // We provide the UI trigger.
            await supabase.auth.signInWithOAuth({
                provider: 'notion', // fallback mock
                options: { redirectTo: `${window.location.origin}/auth/callback` }
            });
        } catch (error) {
            console.error(error);
            setIsLoading(null);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed z-50 inset-x-4 max-w-md mx-auto top-1/2 -translate-y-1/2 bg-surface rounded-4xl shadow-2xl overflow-hidden border border-border-color"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full opacity-50" />

                        <div className="relative p-8 md:p-10 text-center">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-background transition-colors border border-transparent hover:border-border-color"
                            >
                                <X className="w-6 h-6 text-secondary" />
                            </button>

                            <div className="mb-10 mt-4">
                                <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex px-4 py-2 rounded-full mb-6 bg-background border border-border-color">
                                    <span className="text-sm font-bold text-primary tracking-widest uppercase">{locale === 'ko' ? '운명의 접속' : 'Destiny Access'}</span>
                                </motion.div>
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4 text-foreground">
                                    {locale === 'ko' ? '시크릿사주 시작하기' : 'Join Secret Saju'}
                                </h2>
                                <p className="text-secondary font-medium">
                                    {locale === 'ko' ? '최초 로그인 시 10 젤리가 지급됩니다!' : 'Get 10 Jellies upon your first login!'}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Kakao */}
                                <button
                                    onClick={handleKakaoLogin}
                                    disabled={!!isLoading}
                                    className="w-full flex items-center justify-center gap-4 bg-[#FEE500] hover:bg-[#FDD800] text-black font-black text-lg py-5 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50"
                                >
                                    {isLoading === 'kakao' ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10 0C4.477 0 0 3.64 0 8.125c0 2.886 1.948 5.413 4.861 6.85l-1.042 3.853c-.083.306.224.556.505.411l4.508-2.327c.387.03.779.046 1.168.046 5.523 0 10-3.64 10-8.125S15.523 0 10 0z" fill="#000000" />
                                            </svg>
                                            {locale === 'ko' ? '카카오로 계속하기' : 'Continue with Kakao'}
                                        </>
                                    )}
                                </button>

                                {/* Google */}
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={!!isLoading}
                                    className="w-full flex items-center justify-center gap-4 bg-white hover:bg-neutral-100 text-black font-black text-lg py-5 rounded-2xl border border-neutral-200 transition-all shadow-sm hover:shadow-md hover:-translate-y-1 disabled:opacity-50"
                                >
                                    {isLoading === 'google' ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            {locale === 'ko' ? '구글로 계속하기' : 'Continue with Google'}
                                        </>
                                    )}
                                </button>

                                {/* Naver */}
                                <button
                                    onClick={handleNaverLogin}
                                    disabled={!!isLoading}
                                    className="w-full flex items-center justify-center gap-4 bg-[#03C75A] hover:bg-[#02b350] text-white font-black text-lg py-5 rounded-2xl transition-all shadow-sm hover:shadow-md hover:-translate-y-1 disabled:opacity-50"
                                >
                                    {isLoading === 'naver' ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" fill="white" />
                                            </svg>
                                            {locale === 'ko' ? '네이버로 계속하기' : 'Continue with Naver'}
                                        </>
                                    )}
                                </button>

                                <div className="py-2 flex items-center justify-center gap-4">
                                    <div className="flex-1 h-px bg-border-color" />
                                    <span className="text-sm font-bold text-secondary uppercase tracking-widest">{locale === 'ko' ? '또는' : 'OR'}</span>
                                    <div className="flex-1 h-px bg-border-color" />
                                </div>

                                {/* Email Fallback UI */}
                                <button
                                    onClick={() => alert(locale === 'ko' ? "이메일 로그인 준비 중입니다." : "Email login coming soon.")}
                                    className="w-full flex items-center justify-center gap-3 bg-background border border-border-color text-foreground font-bold text-sm py-4 rounded-xl hover:bg-surface transition-all disabled:opacity-50"
                                >
                                    <Mail className="w-5 h-5 opacity-70" /> {locale === 'ko' ? '이메일로 계속하기' : 'Continue with Email'}
                                </button>
                            </div>

                            <p className="mt-10 text-xs text-secondary opacity-60 px-4 leading-relaxed font-medium">
                                {locale === 'ko'
                                    ? '진행 시 당사의 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.'
                                    : 'By continuing, you agree to our Terms of Service and Privacy Policy.'}
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
