'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLocale } from '@/lib/i18n';
import { loginWithKakao } from '@/lib/kakao-auth';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { locale } = useLocale();
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [emailError, setEmailError] = useState('');
    const isOtherLoading = (provider: string): boolean => !!isLoading && isLoading !== provider;

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
        loginWithKakao();
        setTimeout(() => setIsLoading(null), 2000);
    };

    const handleNaverLogin = async () => {
        setIsLoading('naver');
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'notion',
                options: { redirectTo: `${window.location.origin}/auth/callback` }
            });
        } catch (error) {
            console.error(error);
            setIsLoading(null);
        }
    };

    const handleEmailLogin = async () => {
        setEmailMessage('');
        setEmailError('');

        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            setEmailError(locale === 'ko' ? '이메일 주소를 정확히 입력해 주세요.' : 'Please enter a valid email address.');
            return;
        }

        if (typeof supabase?.auth?.signInWithOtp !== 'function') {
            setEmailError(
                locale === 'ko'
                    ? '현재 이메일 로그인 기능을 사용할 수 없습니다.'
                    : 'Email login is not available right now.'
            );
            return;
        }

        setIsLoading('email');
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
            });

            if (error) {
                console.error(error);
                setEmailError(
                    locale === 'ko'
                        ? '이메일 전송에 실패했습니다.'
                        : 'Failed to send email.'
                );
            } else {
                setEmailMessage(
                    locale === 'ko'
                        ? '인증 메일을 보냈습니다. 메일함을 확인해 주세요.'
                        : 'We sent a sign-in email. Please check your inbox.'
                );
            }
        } catch (error) {
            console.error(error);
            setEmailError(locale === 'ko' ? '일시적인 오류가 발생했습니다.' : 'A temporary error occurred.');
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto"
                    />

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
                                <motion.div
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="inline-flex px-4 py-2 rounded-full mb-6 bg-background border border-border-color"
                                >
                                    <span className="text-sm font-bold text-primary tracking-widest uppercase">
                                        {locale === 'ko' ? '운명 접속' : 'Destiny Access'}
                                    </span>
                                </motion.div>
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4 text-foreground">
                                    {locale === 'ko' ? '회원가입 및 로그인' : 'Join Secret Saju'}
                                </h2>
                                <p className="text-secondary font-medium">
                                    {locale === 'ko'
                                        ? '첫 로그인 시 10 젤리를 지급합니다.'
                                        : 'Get 10 Jellies upon your first login!'}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleKakaoLogin}
                                    disabled={!!isLoading}
                                    className={`w-full flex items-center justify-center gap-4 text-black font-black text-lg py-5 rounded-2xl transition-all ${isOtherLoading('kakao') ? 'bg-[#F5B800]' : 'bg-[#FEE500] hover:bg-[#FDD800]'} ${isLoading ? 'shadow-md' : 'shadow-lg hover:shadow-xl hover:-translate-y-1'} disabled:opacity-60`}
                                >
                                    {isLoading === 'kakao' ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10 0C4.477 0 0 3.64 0 8.125c0 2.886 1.948 5.413 4.861 6.85l-1.042 3.853c-.083.306.224.556.505.411l4.508-2.327c.387.03.779.046 1.168.046 5.523 0 10-3.64 10-8.125S15.523 0 10 0z" fill="#000000" />
                                            </svg>
                                            {isOtherLoading('kakao')
                                                ? locale === 'ko' ? '다른 로그인 진행 중' : 'Another login is in progress'
                                                : locale === 'ko' ? '카카오로 계속하기' : 'Continue with Kakao'}
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={!!isLoading}
                                    className={`w-full flex items-center justify-center gap-4 bg-white text-black font-black text-lg py-5 rounded-2xl border border-neutral-200 transition-all ${isOtherLoading('google') ? 'bg-neutral-200 border-neutral-300' : 'hover:bg-neutral-100'} ${isLoading ? 'shadow-sm' : 'shadow-sm hover:shadow-md hover:-translate-y-1'} disabled:opacity-60`}
                                >
                                    {isLoading === 'google' ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            {isOtherLoading('google')
                                                ? locale === 'ko' ? '다른 로그인 진행 중' : 'Another login is in progress'
                                                : locale === 'ko' ? '구글로 계속하기' : 'Continue with Google'}
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleNaverLogin}
                                    disabled={!!isLoading}
                                    className={`w-full flex items-center justify-center gap-4 text-white font-black text-lg py-5 rounded-2xl transition-all ${isOtherLoading('naver') ? 'bg-[#028E45]' : 'bg-[#03C75A] hover:bg-[#02b350]'} ${isLoading ? 'shadow-sm' : 'shadow-sm hover:shadow-md hover:-translate-y-1'} disabled:opacity-60`}
                                >
                                    {isLoading === 'naver' ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" fill="white" />
                                            </svg>
                                            {isOtherLoading('naver')
                                                ? locale === 'ko' ? '다른 로그인 진행 중' : 'Another login is in progress'
                                                : locale === 'ko' ? '네이버로 계속하기' : 'Continue with Naver'}
                                        </>
                                    )}
                                </button>

                                <div className="py-2 flex items-center justify-center gap-4">
                                    <div className="flex-1 h-px bg-border-color" />
                                    <span className="text-sm font-bold text-secondary uppercase tracking-widest">
                                        {locale === 'ko' ? '또는' : 'OR'}
                                    </span>
                                    <div className="flex-1 h-px bg-border-color" />
                                </div>

                                <div className="space-y-3">
                                    <input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                                        type="email"
                                        placeholder="name@example.com"
                                        className="w-full rounded-xl bg-background border border-border-color px-4 py-4 text-sm text-foreground placeholder:text-secondary font-medium focus:outline-none focus:border-primary"
                                        disabled={!!isLoading}
                                    />
                                    {emailError ? <p className="text-sm text-rose-400 px-1 text-left">{emailError}</p> : null}
                                    {emailMessage ? <p className="text-sm text-emerald-400 px-1 text-left">{emailMessage}</p> : null}
                                    <button
                                        onClick={handleEmailLogin}
                                        disabled={!!isLoading}
                                        className="w-full flex items-center justify-center gap-3 bg-background border border-border-color text-foreground font-bold text-sm py-4 rounded-xl transition-all hover:bg-surface disabled:opacity-60"
                                    >
                                        <Mail className="w-5 h-5 opacity-70" />
                                        {isLoading === 'email' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            isOtherLoading('email')
                                                ? locale === 'ko' ? '다른 로그인 진행 중' : 'Another login is in progress'
                                                : locale === 'ko' ? '이메일로 계속하기' : 'Continue with Email'
                                        )}
                                    </button>
                                </div>
                            </div>

                            <p className="mt-10 text-xs text-secondary opacity-60 px-4 leading-relaxed font-medium">
                                {locale === 'ko'
                                    ? '계속 진행하면 이용약관 및 개인정보 처리방침에 동의하게 됩니다.'
                                    : 'By continuing, you agree to our Terms of Service and Privacy Policy.'}
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}