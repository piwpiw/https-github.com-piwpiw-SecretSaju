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

  // 배경이 10% 틴트라 페이지 색을 그대로 따라간다. 글자만 밝은 -100 으로
  // 고정해 두니 라이트 테마에서 옅은 배경 위 옅은 글자가 되어 1.00:1 —
  // 글자가 배경과 완전히 같은 색이었다. 테마별로 갈라 준다.
  // 라이트 6.3~6.7:1 / 다크 15:1 로 둘 다 여유 있게 통과한다.
  const tone =
    issue.severity === 'error'
      ? 'border-rose-400/30 bg-rose-500/10 text-rose-800 dark:text-rose-100'
      : issue.severity === 'warning'
        ? 'border-amber-400/30 bg-amber-500/10 text-amber-800 dark:text-amber-100'
        : 'border-sky-400/30 bg-sky-500/10 text-sky-800 dark:text-sky-100';
  const Icon = issue.severity === 'info' ? Info : AlertTriangle;
  const showAuthCta = issue.code === 'WALLET_HTTP_401' || issue.code === 'PROFILE_LOCAL_MODE';
  const loginHref = `/login?next=${encodeURIComponent(pathname || '/')}`;

  const handleClose = () => {
    clearWalletIssue();
    clearProfileIssue();
  };

  return (
    <section
      // 게스트 모드 안내(PROFILE_LOCAL_MODE)까지 `alert`로 알리면 스크린리더가
      // 정상 상태를 경고처럼 읽는다. 정보성은 `status`로 낮춘다.
      role={issue.severity === 'info' ? 'status' : 'alert'}
      aria-live="polite"
      className={`mx-auto mt-4 w-full max-w-7xl rounded-2xl border px-4 py-3 ${tone}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-black leading-relaxed break-keep">{issue.summary}</p>
            <p className="text-xs leading-relaxed break-keep">{issue.detail}</p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold">
              {/* 진단 코드는 문의 대응에는 필요하지만 평소에는 보여줄 이유가 없다.
                  전에는 모든 화면에서 `code: PROFILE_LOCAL_MODE` / `scope: profile`이
                  그대로 노출돼, 정상 상태인데도 오류처럼 읽혔다. 접을 수 있게 두되
                  기본은 숨긴다. */}
              <details className="inline-block">
                <summary className="cursor-pointer underline underline-offset-2 marker:content-['']">
                  자세히
                </summary>
                <span className="mt-1 block font-mono text-[10px]">
                  {issue.code} · {issue.scope}
                </span>
              </details>
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
          // 흰 테두리는 라이트 테마의 옅은 배너 위에서 보이지 않는다.
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/15 bg-black/5 dark:border-white/15 dark:bg-black/10"
          aria-label={issue.severity === 'info' ? '안내 배너 닫기' : '오류 배너 닫기'}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
