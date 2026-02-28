'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { giftJellies } from '@/lib/jelly-wallet';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthCallback() {
    const router = useRouter();
    const [message, setMessage] = useState('운명의 파동을 동기화하는 중...');

    useEffect(() => {
        const handleAuth = async () => {
            // Supabase client automatically handles the OAuth callback hash/search parameters
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Auth error:', error);
                setMessage('인증 중 오류가 발생했습니다.');
                setTimeout(() => router.push('/'), 2000);
                return;
            }

            if (session?.user) {
                // Check if this is the user's first login by checking local storage flag
                // In a full production app, this would be checked against the database.
                const HAS_CLAIMED_SIGNUP_JELLY_KEY = 'secret_saju_signup_jelly_claimed_' + session.user.id;
                const hasClaimed = localStorage.getItem(HAS_CLAIMED_SIGNUP_JELLY_KEY);

                if (!hasClaimed) {
                    const referredBy = localStorage.getItem('secret_saju_ref');
                    if (referredBy) {
                        setMessage('운명의 문이 열렸습니다. 친구 초대 보너스 포함 15 젤리가 지급됩니다!');
                        giftJellies(15, 'signup_bonus_with_referral');
                    } else {
                        setMessage('운명의 문이 열렸습니다. 가입 축하 10 젤리가 지급됩니다!');
                        giftJellies(10, 'signup_bonus');
                    }
                    localStorage.setItem(HAS_CLAIMED_SIGNUP_JELLY_KEY, 'true');
                    localStorage.removeItem('secret_saju_ref'); // clear the ref so it doesn't trigger again
                } else {
                    setMessage('인증이 완료되었습니다. 대시보드로 이동합니다.');
                }

                setTimeout(() => router.push('/dashboard'), 2500);
            } else {
                router.push('/');
            }
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
                <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/20">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>

                <h1 className="text-2xl font-black text-foreground uppercase tracking-widest mb-4">
                    Authenticating
                </h1>

                <p className="text-lg text-secondary font-bold">
                    {message}
                </p>

                <div className="mt-8 flex justify-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping" style={{ animationDelay: '200ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping" style={{ animationDelay: '400ms' }} />
                </div>
            </motion.div>
        </main>
    );
}
