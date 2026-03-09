'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertTriangle, Info, RefreshCw, X } from 'lucide-react';
import { useProfiles } from '@/components/profile/ProfileProvider';
import { useWallet } from '@/components/payment/WalletProvider';

export default function SystemIssueBanner() {
  const pathname = usePathname();
  const { syncIssue: walletIssue, clearSyncIssue: clearWalletIssue } = useWallet();
  const { syncIssue: profileIssue, clearSyncIssue: clearProfileIssue } = useProfiles();
  const issue = walletIssue ?? profileIssue;

  if (!issue) return null;

  const tone =
    issue.severity === 'error'
      ? 'border-rose-400/30 bg-rose-500/10 text-rose-100'
      : issue.severity === 'warning'
        ? 'border-amber-400/30 bg-amber-500/10 text-amber-100'
        : 'border-sky-400/30 bg-sky-500/10 text-sky-100';
  const Icon = issue.severity === 'info' ? Info : AlertTriangle;
  const showAuthCta = issue.code === 'WALLET_HTTP_401' || issue.code === 'PROFILE_LOCAL_MODE';
  const loginHref = `/login?next=${encodeURIComponent(pathname || '/')}`;

  const handleClose = () => {
    clearWalletIssue();
    clearProfileIssue();
  };

  return (
    <section
      role="alert"
      aria-live="polite"
      className={`mx-auto mt-4 w-full max-w-7xl rounded-2xl border px-4 py-3 ${tone}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-black">{issue.summary}</p>
            <p className="text-xs opacity-90">{issue.detail}</p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold opacity-80">
              <span>code: {issue.code}</span>
              <span>scope: {issue.scope}</span>
              {showAuthCta ? (
                <Link href={loginHref} className="underline underline-offset-2">
                  로그인해서 다시 시도
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1 underline underline-offset-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                새로고침
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/10"
          aria-label="오류 배너 닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
