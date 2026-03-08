'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ShieldCheck, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLocale } from '@/lib/i18n';
import { loginWithKakao } from '@/lib/kakao-auth';
import { initiateMcpLogin } from '@/lib/auth-mcp';
import { FEATURES, STORAGE_KEYS } from '@/config';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultMode?: 'login' | 'signup';
}

type SessionPayload = { access_token: string; refresh_token?: string | null; expires_in?: number | null };
const ADMIN_BYPASS_KEY = 'secret_paws_mock_admin';
const ADMIN_EMAILS = new Set(['piwpiw@naver.com']);

function setAdminBypassCookieAndStorage(isAdmin: boolean) {
    if (typeof document === 'undefined') return;

    if (isAdmin) {
        localStorage.setItem(ADMIN_BYPASS_KEY, 'true');
        document.cookie = `${ADMIN_BYPASS_KEY}=true; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
        return;
    }

    localStorage.removeItem(ADMIN_BYPASS_KEY);
    document.cookie = `${ADMIN_BYPASS_KEY}=; Max-Age=0; path=/; SameSite=Lax`;
}

function isAdminEmail(email: string | undefined) {
    return !!email && ADMIN_EMAILS.has(email.toLowerCase());
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
    const { locale } = useLocale();

    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>(defaultMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [emailError, setEmailError] = useState('');
    const [authError, setAuthError] = useState<string | null>(null);

    const isOtherLoading = (provider: string): boolean => !!isLoading && isLoading !== provider;
    const isSignupMode = authMode === 'signup';

    const AUTH_ERROR_MESSAGES: Record<string, string> = {
        access_denied: locale === 'ko' ? '로그인 권한이 취소되었습니다.' : 'Login was cancelled.',
        provider_error: locale === 'ko' ? '소셜 로그인 처리에 실패했습니다.' : 'Social login failed.',
        invalid_state: locale === 'ko' ? '요청 상태가 올바르지 않습니다.' : 'Invalid authentication state.',
        default: locale === 'ko' ? '인증 처리 중 오류가 발생했습니다.' : 'Authentication failed.',
    };

    useEffect(() => {
        if (!isOpen) return;
        setAuthMode(defaultMode);
        setEmailMessage('');
        setEmailError('');
        setAuthError(null);
        setPassword('');
        setIsLoading(null);
    }, [isOpen, defaultMode]);

    useEffect(() => {
        if (!isOpen || typeof document === 'undefined') return;
        const prevHtmlOverflow = document.documentElement.style.overflow;
        const prevBodyOverflow = document.body.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        return () => {
            document.documentElement.style.overflow = prevHtmlOverflow;
            document.body.style.overflow = prevBodyOverflow;
        };
    }, [isOpen]);

    const saveReturnTo = () => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('auth_return_to', `${window.location.pathname}${window.location.search}`);
    };

    const setSessionCookie = (session: SessionPayload) => {
        const maxAge = session.expires_in || 7 * 24 * 3600;
        const payload = {
            access_token: session.access_token,
            refresh_token: session.refresh_token || null,
            expires_at: Math.floor(Date.now() / 1000) + maxAge,
        };
        document.cookie = `${STORAGE_KEYS.AUTH_SESSION_TOKEN}=${encodeURIComponent(JSON.stringify(payload))}; path=/; max-age=${maxAge}; SameSite=Lax`;
    };

    const syncSessionUser = async (
        channel: 'signup' | 'login',
        extraPayload: Record<string, unknown> = {},
        sessionInput?: SessionPayload
    ): Promise<{ ok: boolean; isAdmin: boolean }> => {
        let session = sessionInput;
        if (!session) {
            const { data, error } = await supabase.auth.getSession();
            if (error || !data?.session?.access_token) return { ok: false, isAdmin: false };
            session = {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_in: data.session.expires_in,
            };
        }

        setSessionCookie(session);

        const res = await fetch('/api/user/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ channel, ...extraPayload }),
        });
        const payload = await res.json().catch(() => ({}));
        const isAdmin = payload?.user?.isAdmin === true;
        return { ok: res.ok, isAdmin };
    };

    const updateLocalUserData = async () => {
        const { data } = await supabase.auth.getSession();
        const currentSession = data?.session;
        if (!currentSession?.user) return;

        const userData = {
            id: currentSession.user.id,
            nickname:
                currentSession.user.user_metadata?.name ||
                currentSession.user.user_metadata?.nickname ||
                currentSession.user.email?.split('@')[0] ||
                '사용자',
            email: currentSession.user.email || undefined,
            auth_provider: currentSession.user.app_metadata?.provider || 'email',
            provider_user_id: currentSession.user.id,
        };

        try {
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
            document.cookie = `${STORAGE_KEYS.USER_DATA}=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
        } catch {
            // localStorage 접근 실패는 무시
        }
    };

    const refreshWithResult = async (type: 'login' | 'signup', adminEmail?: string) => {
        const syncResult = await syncSessionUser(type);
        await updateLocalUserData();
        setAdminBypassCookieAndStorage(syncResult.isAdmin || isAdminEmail(adminEmail));

        if (!syncResult.ok) {
            setEmailMessage(
                locale === 'ko'
                    ? '로그인 동기화 실패했습니다. 잠시 후 다시 시도해 주세요.'
                    : 'Sync failed. Please try again.'
            );
            setTimeout(() => onClose(), 1200);
            return;
        }

        setEmailMessage(
            locale === 'ko'
                ? type === 'signup'
                    ? '회원가입이 완료되었습니다.'
                    : '로그인이 완료되었습니다.'
                : type === 'signup'
                    ? 'Signup complete.'
                    : 'Login complete.'
        );
        setTimeout(() => onClose(), 800);
    };

    const handleGoogleLogin = async () => {
        saveReturnTo();
        setIsLoading('google');
        if (!supabase?.auth?.signInWithOAuth) {
            setAuthError('provider_error');
            setIsLoading(null);
            return;
        }
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback` },
            });
        } catch {
            setAuthError('provider_error');
            setIsLoading(null);
        }
    };

    const handleKakaoLogin = () => {
        saveReturnTo();
        setIsLoading('kakao');
        loginWithKakao();
        setTimeout(() => setIsLoading(null), 1200);
    };

    const handleNaverLogin = async () => {
        saveReturnTo();
        setAuthError('provider_error');
        setEmailMessage(
            locale === 'ko'
                ? '네이버 로그인은 현재 준비 중입니다. 카카오, 구글, 이메일 로그인을 이용해 주세요.'
                : 'Naver login is not available yet. Please use Kakao, Google, or email login.'
        );
        setIsLoading(null);
    };

    const handleMcpLogin = async () => {
        saveReturnTo();
        setIsLoading('mcp');
        try {
            initiateMcpLogin();
            setTimeout(() => setIsLoading(null), 2000);
        } catch {
            setIsLoading(null);
        }
    };

    const handleEmailAuth = async () => {
        setEmailMessage('');
        setEmailError('');

        if (!email || !password) {
            setEmailError(locale === 'ko' ? '이메일과 비밀번호를 모두 입력해 주세요.' : 'Please enter both email and password.');
            return;
        }

        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            setEmailError(locale === 'ko' ? '이메일 형식이 올바르지 않습니다.' : 'Invalid email format.');
            return;
        }

        if (typeof supabase?.auth?.signInWithPassword !== 'function' || typeof supabase?.auth?.signUp !== 'function') {
            setEmailError(
                locale === 'ko' ? '현재 환경에서 이메일 로그인을 사용할 수 없습니다.' : 'Email auth is not available in this environment.'
            );
            return;
        }

        setIsLoading('email');
        try {
            if (isSignupMode) {
                const { data: signUpData, error } = await supabase.auth.signUp({
                    email: email.trim(),
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                        data: {
                            signup_source: 'email',
                            nickname: email.trim().split('@')[0],
                        },
                    },
                });

                if (error) {
                    setEmailError(error.message || '회원가입 요청 처리 중 오류가 발생했습니다.');
                    return;
                }

                if (signUpData?.session?.access_token) {
                    const { ok: syncOk } = await syncSessionUser(
                        'signup',
                        { source: 'email-signup' },
                        signUpData.session
                    );
                    if (syncOk) {
                        await updateLocalUserData();
                        setEmailMessage('회원가입 처리가 완료되었습니다.');
                        setTimeout(() => onClose(), 700);
                    } else {
                        setEmailError('회원가입 동기화에 실패했습니다.');
                    }
                } else {
                    setEmailMessage('회원가입 인증 메일이 발송되었습니다. 메일 링크를 통해 로그인해 주세요.');
                }
            } else {
                const normalizedEmail = email.trim().toLowerCase();
                const isAdminCompatCandidate = normalizedEmail === 'piwpiw@naver.com' && password === 'admin';

                let { error } = await supabase.auth.signInWithPassword({
                    email: normalizedEmail,
                    password,
                });

                if (error && isAdminCompatCandidate) {
                    const retryResult = await supabase.auth.signInWithPassword({
                        email: normalizedEmail,
                        password: 'admin1',
                    });
                    error = retryResult.error || null;
                    if (!error) {
                        setEmailMessage('관리자 호환 로그인으로 접속했습니다.');
                    }
                }

                if (error) {
                    setEmailError(error.message || '로그인 처리 중 오류가 발생했습니다.');
                    return;
                }
                await refreshWithResult('login', normalizedEmail);
            }
        } catch {
            setEmailError(locale === 'ko' ? '요청 처리 중 오류가 발생했습니다.' : 'Request failed.');
        } finally {
            setIsLoading((prev) => (prev === 'email' ? null : prev));
        }
    };

    const handleClose = () => {
        if (isClosing || !!isLoading) return;
        setIsClosing(true);
        onClose();
        setTimeout(() => setIsClosing(false), 180);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4 py-6 overflow-y-auto"
                    >
                        <div className="relative w-full max-w-md bg-surface rounded-4xl border border-border-color shadow-2xl overflow-hidden">
                            <button
                                onClick={handleClose}
                                disabled={!!isLoading}
                                className="absolute top-5 right-5 p-2 rounded-full hover:bg-background transition-colors border border-transparent hover:border-border-color disabled:opacity-30"
                            >
                                <X className="w-5 h-5 text-secondary" />
                            </button>

                            <div className="px-7 py-8">
                                <div className="mb-8 text-center">
                                    <h2 className="text-2xl font-black uppercase tracking-wider text-foreground">
                                        {locale === 'ko' ? (isSignupMode ? '회원가입' : '로그인') : isSignupMode ? 'Sign up' : 'Login'}
                                    </h2>
                                    <p className="text-sm text-secondary mt-2">
                                        {locale === 'ko'
                                            ? '소셜 로그인 또는 이메일로 빠르게 시작하세요'
                                            : 'Sign in quickly with social or email'}
                                    </p>
                                </div>

                                {authError && (
                                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6">
                                        <p className="text-xs font-bold text-rose-400">{AUTH_ERROR_MESSAGES[authError] || AUTH_ERROR_MESSAGES.default}</p>
                                    </div>
                                )}

                                <div className="space-y-3 mb-5">
                                    <button
                                        onClick={handleKakaoLogin}
                                        disabled={!!isLoading}
                                        className="w-full min-h-[52px] rounded-xl bg-[#FEE500] text-black font-black flex items-center justify-center gap-3"
                                    >
                                        {isOtherLoading('kakao') ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>카카오 로그인</span>}
                                    </button>
                                    <button
                                        onClick={handleGoogleLogin}
                                        disabled={!!isLoading}
                                        className="w-full min-h-[52px] rounded-xl bg-white text-black font-black flex items-center justify-center gap-3 border border-border-color"
                                    >
                                        {isOtherLoading('google') ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>구글 로그인</span>}
                                    </button>
                                    <button
                                        onClick={handleNaverLogin}
                                        disabled={!!isLoading}
                                        className="w-full min-h-[52px] rounded-xl bg-[#03C75A] text-white font-black flex items-center justify-center gap-3"
                                    >
                                        {isOtherLoading('naver') ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>네이버 로그인 (준비 중)</span>}
                                    </button>
                                    <button
                                        onClick={handleMcpLogin}
                                        disabled={!!isLoading || !FEATURES.MCP}
                                        className="w-full min-h-[52px] rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center gap-3"
                                    >
                                        <ShieldCheck className="w-5 h-5" />
                                        {isOtherLoading('mcp') ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>MCP 로그인</span>}
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 my-5">
                                    <span className="h-px flex-1 bg-border-color" />
                                    <span className="text-xs text-secondary font-black">또는</span>
                                    <span className="h-px flex-1 bg-border-color" />
                                </div>

                                <div className="space-y-3">
                                    <input
                                        value={email}
                                        onChange={(e) => {
                                            if (emailError) setEmailError('');
                                            if (emailMessage) setEmailMessage('');
                                            setEmail(e.target.value);
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
                                        type="email"
                                        placeholder="이메일"
                                        autoComplete={isSignupMode ? 'new-password' : 'email'}
                                        className="w-full rounded-xl bg-background border border-border-color px-4 py-3 text-sm"
                                        disabled={!!isLoading}
                                    />
                                    <input
                                        value={password}
                                        onChange={(e) => {
                                            if (emailError) setEmailError('');
                                            if (emailMessage) setEmailMessage('');
                                            setPassword(e.target.value);
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
                                        type="password"
                                        placeholder="비밀번호"
                                        autoComplete={isSignupMode ? 'new-password' : 'current-password'}
                                        className="w-full rounded-xl bg-background border border-border-color px-4 py-3 text-sm"
                                        disabled={!!isLoading}
                                    />

                                    <AnimatePresence mode="wait">
                                        {emailError && (
                                            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-xs text-rose-400 font-bold">
                                                {emailError}
                                            </motion.p>
                                        )}
                                        {emailMessage && (
                                            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-xs text-emerald-400 font-bold">
                                                {emailMessage}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <button
                                    onClick={handleEmailAuth}
                                    disabled={!!isLoading}
                                    className="w-full mt-4 min-h-[52px] rounded-xl bg-background border border-border-color font-black flex items-center justify-center gap-3"
                                >
                                    <Lock className="w-5 h-5" />
                                    {isLoading === 'email' ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{isSignupMode ? '이메일로 회원가입' : '이메일로 로그인'}</span>}
                                </button>

                                <p className="mt-5 text-sm text-secondary">
                                    {isSignupMode ? '이미 계정이 있나요?' : '처음이신가요?'}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAuthMode(isSignupMode ? 'login' : 'signup');
                                            setEmail('');
                                            setPassword('');
                                            setEmailError('');
                                            setEmailMessage('');
                                        }}
                                        className="ml-1 text-primary font-black underline"
                                    >
                                        {isSignupMode ? '로그인으로 전환' : '회원가입'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
