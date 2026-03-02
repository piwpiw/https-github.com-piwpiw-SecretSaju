"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[Global error boundary]", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white">
        <main className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="max-w-md w-full rounded-2xl border border-white/15 bg-white/5 p-6 shadow-2xl">
            <h1 className="text-3xl font-bold mb-3">페이지 오류가 발생했습니다</h1>
            <p className="text-white/80 mb-6 leading-relaxed">
              일시적인 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                새로고침
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10 transition"
              >
                <Home className="w-4 h-4" />
                홈으로
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
