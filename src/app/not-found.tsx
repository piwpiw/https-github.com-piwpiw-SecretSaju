import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <h1 className="font-display text-2xl text-foreground mb-4">페이지를 찾을 수 없어요</h1>
      <p className="text-zinc-400 text-sm mb-8">요청한 주소가 없거나 변경되었을 수 있어요.</p>
      <Link
        href="/"
        className="rounded-xl bg-primary px-6 py-3 text-white font-medium"
      >
        홈으로
      </Link>
    </main>
  );
}
