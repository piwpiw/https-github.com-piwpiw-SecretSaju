'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Copy, Gift, Sparkles, Ticket, Users } from 'lucide-react';
import { trackEvent } from '@/lib/app/analytics';
import { triggerBalanceUpdate } from '@/components/shop/JellyBalance';
import { useAuthStatus } from '@/lib/auth/auth-status';
import { useReferralAutoRedeem } from '@/components/referral/useReferralAutoRedeem';

interface ReferralCardProps {
  className?: string;
}

export default function ReferralCard({ className = '' }: ReferralCardProps) {
  const { isAuthenticated } = useAuthStatus();
  // 초대 링크(/api/referral/invite?ref=CODE)로 유입된 뒤 로그인한 사용자의
  // 보관 코드를 자동 상환한다. 성공 시 1회성 안내 문구를 돌려받는다.
  const { autoRedeemNotice } = useReferralAutoRedeem(isAuthenticated);
  const [code, setCode] = useState<string | null>(null);
  const [referralUrl, setReferralUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

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

  const redeemReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = redeemCode.trim().toUpperCase();
    if (!trimmed || redeemLoading) return;

    setRedeemError(null);
    setRedeemSuccess(null);
    setRedeemLoading(true);

    try {
      const response = await fetch('/api/referral/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });

      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.success) {
        const reward = Number(payload.newUserReward ?? 0);
        setRedeemSuccess(
          reward > 0
            ? `초대 코드 적용 완료! 젤리 ${reward}개가 적립되었어요.`
            : '초대 코드가 적용되었어요.'
        );
        setRedeemCode('');
        triggerBalanceUpdate();
        trackEvent('referral_complete', { method: 'redeem' });
        return;
      }

      const serverError = typeof payload?.error === 'string' ? payload.error : '';

      if (response.status === 401 || response.status === 403) {
        setRedeemError('로그인 후 초대 코드를 입력할 수 있어요.');
      } else if (response.status === 404) {
        setRedeemError('유효하지 않은 초대 코드예요. 코드를 다시 확인해 주세요.');
      } else if (response.status === 409) {
        setRedeemError('이미 초대 코드를 사용했거나, 사용된 코드예요.');
      } else if (response.status === 400 && serverError.toLowerCase().includes('own')) {
        setRedeemError('본인의 초대 코드는 입력할 수 없어요.');
      } else {
        setRedeemError('초대 코드 적용에 실패했어요. 잠시 후 다시 시도해 주세요.');
      }
    } catch {
      setRedeemError('초대 코드 적용에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setRedeemLoading(false);
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
          <p className="text-sm text-muted font-medium mt-0.5">친구가 가입하면 나와 친구 모두 젤리 2개를 지급해요.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8 text-sm text-muted">
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
              <p className="text-sm text-muted font-bold uppercase tracking-widest mb-1">초대 코드</p>
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

      {error && <p role="alert" className="mt-4 text-sm text-rose-400 text-center">{error}</p>}

      <div className="mt-8 pt-8 border-t border-border-color">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Ticket className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-base font-black text-foreground">초대 코드 입력</h4>
            <p className="text-sm text-muted font-medium">친구에게 받은 코드를 입력하면 젤리를 적립해 드려요.</p>
          </div>
        </div>

        {!isAuthenticated ? (
          <p className="text-sm text-muted text-center py-3 rounded-2xl bg-background border border-border-color">
            초대 코드 입력은{' '}
            <Link href="/login" className="text-primary font-bold underline underline-offset-2">
              로그인
            </Link>
            {' '}후 이용할 수 있어요.
          </p>
        ) : (
          <form onSubmit={redeemReferralCode} className="flex gap-2">
            <input
              type="text"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              placeholder="예: USERABC123"
              aria-label="초대 코드 입력"
              maxLength={20}
              className="flex-1 min-w-0 px-4 py-3 rounded-2xl bg-background border border-border-color text-foreground font-bold tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-medium placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={redeemLoading || !redeemCode.trim()}
              className="px-5 py-3 rounded-2xl bg-primary text-white font-black text-sm shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
            >
              {redeemLoading ? '확인 중...' : '적용'}
            </button>
          </form>
        )}

        {autoRedeemNotice && !redeemSuccess && (
          <p role="status" className="mt-3 text-sm text-emerald-400 text-center font-bold">{autoRedeemNotice}</p>
        )}
        {redeemSuccess && (
          <p role="status" className="mt-3 text-sm text-emerald-400 text-center font-bold">{redeemSuccess}</p>
        )}
        {redeemError && (
          <p role="alert" className="mt-3 text-sm text-rose-400 text-center">{redeemError}</p>
        )}
      </div>

      <p className="mt-6 text-sm text-muted/60 text-center leading-relaxed">초대 코드는 신규 사용자 1회만 유효하며, 본인 초대는 제외됩니다.</p>
    </motion.div>
  );
}
