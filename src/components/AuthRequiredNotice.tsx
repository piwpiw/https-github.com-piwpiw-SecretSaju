'use client';

import Link from 'next/link';
import { Lock, LogIn } from 'lucide-react';

type Props = {
  title?: string;
  detail: string;
  nextPath?: string;
  compact?: boolean;
};

export default function AuthRequiredNotice({
  title = '로그인 후 계속할 수 있습니다.',
  detail,
  nextPath,
  compact = false,
}: Props) {
  const href = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : '/login';

  return (
    <section
      role="note"
      className={`rounded-3xl border border-amber-300/20 bg-amber-500/10 ${compact ? 'p-4' : 'p-6'}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-200">
          <Lock className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-amber-100">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-200">{detail}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-black text-slate-950"
            >
              <LogIn className="h-4 w-4" />
              로그인 하기
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-slate-100"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
