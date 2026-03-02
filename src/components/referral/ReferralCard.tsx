'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Gift, Users, Sparkles } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { useLocale } from '@/lib/i18n';

interface ReferralCardProps {
    userId: string;
    className?: string;
}

export default function ReferralCard({ userId, className = '' }: ReferralCardProps) {
    const { locale } = useLocale();
    const [code, setCode] = useState<string | null>(null);
    const [referralUrl, setReferralUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateCode = async () => {
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/referral/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            if (!res.ok) throw new Error('Failed to generate referral code');
            const data = await res.json();
            setCode(data.code);
            setReferralUrl(data.referralUrl);
        } catch (e) {
            setError(locale === 'ko' ? '초대 코드 생성에 실패했습니다.' : 'Failed to generate referral code.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!referralUrl) return;
        try {
            await navigator.clipboard.writeText(referralUrl);
            setCopied(true);
            trackEvent('referral_code_copied' as any, { code: code ?? '' });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for non-secure contexts
            const el = document.createElement('textarea');
            el.value = referralUrl;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-surface rounded-4xl border border-border-color p-8 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <Gift className="w-7 h-7 text-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-foreground">
                        {locale === 'ko' ? '친구 초대' : 'Invite Friends'}
                    </h3>
                    <p className="text-sm text-secondary font-medium mt-0.5">
                        {locale === 'ko' ? '초대하면 서로 2젤리 🐟' : 'Both get 2 Jellies 🐟'}
                    </p>
                </div>
            </div>

            {/* How it works */}
            <div className="flex items-center gap-4 mb-8 text-sm text-secondary">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{locale === 'ko' ? '친구 가입' : 'Friend signs up'}</span>
                </div>
                <span className="text-border-color">→</span>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span>{locale === 'ko' ? '각 2젤리 지급' : '2 Jellies each'}</span>
                </div>
            </div>

            {/* Code display or generate button */}
            {!code ? (
                <button
                    onClick={generateCode}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-primary text-white font-black text-lg shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:hover:scale-100"
                >
                    {loading
                        ? (locale === 'ko' ? '코드 생성 중...' : 'Generating...')
                        : (locale === 'ko' ? '내 초대 코드 만들기' : 'Get My Referral Code')}
                </button>
            ) : (
                <div className="space-y-4">
                    {/* Code badge */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border-color">
                        <div>
                            <p className="text-xs text-secondary font-bold uppercase tracking-widest mb-1">
                                {locale === 'ko' ? '초대 코드' : 'Referral Code'}
                            </p>
                            <p className="text-3xl font-black text-primary tracking-[0.2em]">{code}</p>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={copyToClipboard}
                            className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center hover:bg-primary/20 transition-colors"
                        >
                            {copied
                                ? <Check className="w-5 h-5 text-green-400" />
                                : <Copy className="w-5 h-5 text-primary" />}
                        </motion.button>
                    </div>

                    {/* Copy URL button */}
                    <button
                        onClick={copyToClipboard}
                        className="w-full py-3 rounded-2xl border border-border-color text-foreground font-bold text-sm hover:bg-surface transition-all flex items-center justify-center gap-2"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 text-green-400" />
                                {locale === 'ko' ? '링크 복사됨!' : 'Copied!'}
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                {locale === 'ko' ? '초대 링크 복사' : 'Copy Invite Link'}
                            </>
                        )}
                    </button>
                </div>
            )}

            {error && (
                <p className="mt-4 text-sm text-rose-400 text-center">{error}</p>
            )}

            <p className="mt-6 text-xs text-secondary/60 text-center leading-relaxed">
                {locale === 'ko'
                    ? '가입 당 최초 1회만 적용됩니다. 자기 초대는 불가합니다.'
                    : 'Valid one time per new user. Self-referral not allowed.'}
            </p>
        </motion.div>
    );
}
