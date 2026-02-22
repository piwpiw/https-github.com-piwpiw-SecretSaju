/**
 * Phase 3 예측: 익명으로 선물하기
 * 친구에게 "너 이거 좀 고쳐라"라며 사주 풀이를 선물(결제)해서 보냄
 */

export default function GiftPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <h1 className="font-display text-2xl text-foreground mb-4">
        익명으로 선물하기
      </h1>
      <p className="text-zinc-400 text-sm mb-8 text-center max-w-sm">
        Phase 3에서 구현: 친구 생년월일 입력 → 결제 → 친구에게 익명 링크 전달
      </p>
      <a
        href="/"
        className="rounded-xl bg-primary px-6 py-3 text-white font-medium"
      >
        홈으로
      </a>
    </main>
  );
}
