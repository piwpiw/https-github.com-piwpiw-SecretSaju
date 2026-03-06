'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Gift, Sparkles, Users } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface ReferralCardProps {
  className?: string;
}

export default function ReferralCard({ className = '' }: ReferralCardProps) {
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
      const response = await fetch('/api/referral/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.code) {
        throw new Error(payload?.error ?? '초대 코드 생성 실패');
      }

      setCode(payload.code);
      setReferralUrl(payload.referralUrl);
      trackEvent('referral_complete', { method: 'generate' });
    } catch {
      setError('초대 코드 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!referralUrl) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(referralUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = referralUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }

      setCopied(true);
      trackEvent('referral_code_copied', { code: code ?? '' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-surface rounded-4xl border border-border-color p-8 ${className}`}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Gift className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-black text-foreground">친구 초대</h3>
          <p className="text-sm text-secondary font-medium mt-0.5">친구가 가입하면 나와 친구 모두 젤리 2개를 지급해요.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8 text-sm text-secondary">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span>초대 성공 횟수</span>
        </div>
        <span className="text-border-color">/</span>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>보상: 각 2개 젤리</span>
        </div>
      </div>

      {!code ? (
        <button
          onClick={generateCode}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-primary text-white font-black text-lg shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? '생성 중...' : '초대 코드 받기'}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border-color">
            <div>
              <p className="text-xs text-secondary font-bold uppercase tracking-widest mb-1">초대 코드</p>
              <p className="text-3xl font-black text-primary tracking-[0.2em]">{code}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={copyToClipboard}
              className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-primary" />}
            </motion.button>
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full py-3 rounded-2xl border border-border-color text-foreground font-bold text-sm hover:bg-surface transition-all flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                초대 링크 복사
              </>
            )}
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-rose-400 text-center">{error}</p>}

      <p className="mt-6 text-xs text-secondary/60 text-center leading-relaxed">초대 코드는 신규 사용자 1회만 유효하며, 본인 초대는 제외됩니다.</p>
    </motion.div>
  );
}
