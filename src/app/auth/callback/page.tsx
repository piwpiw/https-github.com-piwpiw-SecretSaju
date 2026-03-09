'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/integrations/supabase';
import { STORAGE_KEYS } from '@/config';
import { buildAuthCallbackMessage } from '@/lib/auth/auth-callback-message';
import { Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';

function setServerLikeAuthCookie(accessToken: string, refreshToken: string | undefined, maxAge = 7 * 24 * 3600) {
    const payload = {
        access_token: accessToken,
        refresh_token: refreshToken || null,
        expires_at: Math.floor(Date.now() / 1000) + maxAge,
    };
    document.cookie = `${STORAGE_KEYS.AUTH_SESSION_TOKEN}=${encodeURIComponent(
        JSON.stringify(payload)
    )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export default function AuthCallback() {
    const router = useRouter();
    const [message, setMessage] = useState('로그인 결과를 확인하고 있습니다...');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const handleAuth = async () => {
            const searchParams = new URLSearchParams(window.location.search);
            const errorParam = searchParams.get('error');
            const provider = searchParams.get('provider');

            if (errorParam) {
                setMessage(
                    buildAuthCallbackMessage({
                        error: errorParam,
                        provider,
                        providerError: searchParams.get('provider_error'),
                        providerErrorDescription: searchParams.get('provider_error_description'),
                        requestId: searchParams.get('request_id'),
                    })
                );
                setIsError(true);
                setTimeout(() => router.push('/'), 4000);
                return;
            }

            if (typeof supabase?.auth?.getSession !== 'function') {
                setMessage('인증 모듈을 찾을 수 없습니다.');
                setIsError(true);
                setTimeout(() => router.push('/'), 2000);
                return;
            }

            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();

            if (error || !session?.user) {
                console.error('Auth error:', error);
                setMessage('로그인 처리 중 문제가 발생했습니다.');
                setTimeout(() => router.push('/'), 2000);
                return;
            }

            const maxAge = session.expires_in || 7 * 24 * 3600;
            setServerLikeAuthCookie(session.access_token, session.refresh_token, maxAge);

            const userPayload = {
                id: session.user.id,
                nickname: session.user.user_metadata?.name || session.user.user_metadata?.nickname || session.user.email?.split('@')[0] || '회원',
                email: session.user.email ?? undefined,
            };

            try {
                localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userPayload));
                document.cookie = `${STORAGE_KEYS.USER_DATA}=${encodeURIComponent(
                    JSON.stringify(userPayload)
                )}; path=/; max-age=${maxAge}`;
            } catch { }

            try {
                const syncRes = await fetch('/api/user/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });
                const syncData = await syncRes.json().catch(() => ({}));
                if (!syncRes.ok) {
                    console.error('User sync failed:', syncData);
                } else if (syncData?.user?.isAdmin) {
                    setMessage('로그인이 완료되었습니다. 관리자 계정으로 이동합니다.');
                } else {
                    setMessage('로그인이 완료되었습니다.');
                }
            } catch (syncError) {
                console.error('Sync error:', syncError);
                setMessage('로그인은 완료되었지만 사용자 정보 동기화가 지연되고 있습니다.');
            }

            const returnTo = localStorage.getItem('auth_return_to') || '/dashboard';
            localStorage.removeItem('auth_return_to');
            setTimeout(() => router.push(returnTo), 1500);
        };

        handleAuth();
    }, [router]);

    return (
        <main className="min-h-screen flex items-center justify-center bg-background px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface p-12 rounded-4xl border border-border-color shadow-2xl text-center max-w-md w-full"
            >
                <div
                    className={`w-24 h-24 rounded-3xl ${isError ? 'bg-rose-500/10 border-rose-500/30' : 'bg-primary/10 border-primary/30'} border flex items-center justify-center mx-auto mb-8 shadow-xl ${isError ? 'shadow-rose-500/20' : 'shadow-primary/20'}`}
                >
                    {isError ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-rose-500 rounded-full p-2">
                            <X className="w-8 h-8 text-white" strokeWidth={3} />
                        </motion.div>
                    ) : (
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    )}
                </div>

                <h1 className={`text-2xl font-black ${isError ? 'text-rose-400' : 'text-foreground'} uppercase tracking-widest mb-4`}>
                    {isError ? '로그인 실패' : '로그인 확인 중'}
                </h1>

                <p className={`text-lg ${isError ? 'text-secondary opacity-80' : 'text-secondary'} font-bold`}>{message}</p>
            </motion.div>
        </main>
    );
}
