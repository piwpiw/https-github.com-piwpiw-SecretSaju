'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { STORAGE_KEYS } from '@/config';
import { Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';

const MCP_ERRORS: Record<string, string> = {
    missing_required_params: '인증 정보를 찾을 수 없습니다.',
    missing_oauth_artifacts: '인증 세션이 만료되었습니다.',
    invalid_oauth_state: '보안 검증(state)에 실패했습니다.',
    expired_oauth_state: '인증 요청 시간이 만료되었습니다.',
    token_exchange_failed: '토큰 발급에 실패했습니다.',
    missing_provider_user_id: '사용자 계정 번호를 가져오지 못했습니다.',
    user_sync_failed: '사용자 정보 동기화 중 오류가 발생했습니다.',
    missing_oauth_profile: '프로필 정보 획득이 거부되었습니다.',
    oauth_callback_error: '비정상적인 응답을 감지했습니다.',
};

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
    const [message, setMessage] = useState('인증 창을 닫기 위해 연결 중...');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const handleAuth = async () => {
            const searchParams = new URLSearchParams(window.location.search);
            const errorParam = searchParams.get('error');
            const provider = searchParams.get('provider');

            if (errorParam) {
                const reqId = searchParams.get('request_id');
                const detail = searchParams.get('provider_error_description');
                let userMsg = '인증 중 오류가 발생했습니다.';
                if (provider === 'mcp') {
                    userMsg = MCP_ERRORS[errorParam] || 'MCP 인증 처리 중 문제가 발생했습니다.';
                    if (detail) userMsg += ` (${detail})`;
                }
                if (reqId) userMsg += ` [Req: ${reqId}]`;
                setMessage(userMsg);
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
                setMessage('인증 중 오류가 발생했습니다.');
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
                    setMessage('인증이 완료되었습니다. 관리자 계정으로 로그인했습니다.');
                } else {
                    setMessage('인증이 완료되었습니다.');
                }
            } catch (syncError) {
                console.error('Sync error:', syncError);
                setMessage('인증이 완료되었습니다. 사용자 동기화를 재시도해 주세요.');
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
                    {isError ? 'Authentication Failed' : 'Authenticating'}
                </h1>

                <p className={`text-lg ${isError ? 'text-secondary opacity-80' : 'text-secondary'} font-bold`}>{message}</p>
            </motion.div>
        </main>
    );
}
