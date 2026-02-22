"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[Error boundary]", error);
    }
  }, [error]);

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <h1 className="font-display text-2xl text-foreground mb-4">문제가 생겼어요</h1>
      <p className="text-zinc-400 text-sm mb-8 text-center max-w-md">
        잠시 후 다시 시도해 주세요.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-primary px-6 py-3 text-white font-medium"
      >
        다시 시도
      </button>
    </main>
  );
}
