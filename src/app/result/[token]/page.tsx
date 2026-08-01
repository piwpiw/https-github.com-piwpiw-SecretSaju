import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Gift, Sparkles, Clock, MailQuestion } from "lucide-react";
import { getGiftResult } from "@/app/api/gift/gift-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "선물 결과 카드 | 사주라떼",
  description: "특별한 사람이 보낸 사주 결과 카드를 확인하세요.",
};

type Props = {
  params: { token: string };
};

function NoticeCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <section className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-6 sm:p-10 text-center">
      <div className="mx-auto mb-8 w-16 h-16 rounded-2xl bg-pink-500/20 border border-pink-400/20 flex items-center justify-center">
        {icon}
      </div>
      <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">{title}</h1>
      <p className="mt-4 text-slate-300 leading-relaxed whitespace-pre-line">{description}</p>
      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-pink-500 text-black font-black uppercase tracking-[0.2em] text-sm"
        >
          내 운세 보러 가기
        </Link>
        <Link
          href="/gift"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/20 text-white/90 font-black uppercase tracking-[0.2em] text-sm"
        >
          <Gift className="w-4 h-4 mr-2" />
          나도 선물 보내기
        </Link>
      </div>
    </section>
  );
}

export default async function GiftResultPage({ params }: Props) {
  const token = decodeURIComponent(params.token);
  const result = await getGiftResult(token);

  if (result.status === "expired") {
    return (
      <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 text-slate-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>
          <NoticeCard
            icon={<Clock className="w-8 h-8 text-pink-300" />}
            title="링크가 만료되었어요"
            description={`${result.gift?.senderName ?? "익명의 친구"}님이 보낸 선물 카드의 유효 기간(3일)이 지났습니다.\n지금 바로 내 운세를 직접 확인하거나, 새 선물을 보내보세요.`}
          />
        </div>
      </main>
    );
  }

  if (result.status !== "ok") {
    const isError = result.status === "error";
    return (
      <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 text-slate-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>
          <NoticeCard
            icon={<MailQuestion className="w-8 h-8 text-pink-300" />}
            title={isError ? "잠시 후 다시 시도해 주세요" : "선물 카드를 찾을 수 없어요"}
            description={
              isError
                ? "일시적인 오류로 선물 카드를 불러오지 못했습니다.\n잠시 후 다시 시도해 주세요."
                : "링크가 잘못되었거나 이미 정리된 선물이에요.\n대신 지금 바로 내 운세를 확인해 보세요."
            }
          />
        </div>
      </main>
    );
  }

  const { gift } = result;
  const payload = gift.payload;
  const expiresLabel = gift.expiresAt
    ? new Date(gift.expiresAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden pb-28">
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          홈으로
        </Link>

        <section className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-6 sm:p-10 text-center">
          <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-pink-500/20 border border-pink-400/20 flex items-center justify-center">
            <Gift className="w-8 h-8 text-pink-300" />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.3em] text-pink-300">Secret Gift</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-black tracking-tight leading-tight">
            {gift.senderName}님이 보낸
            <br />
            운명의 선물 카드
          </h1>

          {gift.message && (
            <blockquote className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-5 text-slate-200 leading-relaxed italic">
              “{gift.message}”
            </blockquote>
          )}

          {payload ? (
            <div className="mt-8 rounded-3xl bg-gradient-to-br from-pink-500/15 to-purple-600/15 border border-pink-400/20 p-6 sm:p-8 text-left">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400 font-bold">받는 사람</p>
                  <p className="mt-1 text-2xl font-black text-white">{payload.targetName}</p>
                  <p className="mt-1 text-sm text-slate-400">{payload.targetBirthDate}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-slate-400 font-bold">일주 · 오행</p>
                  <p className="mt-1 text-2xl font-black text-pink-300 tracking-widest">
                    {payload.pillarNameKo}
                    <span className="ml-2 text-lg text-purple-300">({payload.element})</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <p className="text-lg font-black text-white">{payload.animalName}</p>
                </div>
                {payload.mask && <p className="text-slate-300 leading-relaxed">{payload.mask}</p>}
                {payload.hook && <p className="mt-3 text-slate-300 leading-relaxed">{payload.hook}</p>}
                {payload.hashtags?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {payload.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm font-bold text-pink-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-8 text-slate-300 leading-relaxed">
              선물 카드가 준비되었습니다. 아래 버튼으로 전체 운세를 확인해 보세요.
            </p>
          )}

          {expiresLabel && (
            <p className="mt-6 text-sm text-slate-500 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />이 카드는 {expiresLabel}까지 열람할 수 있어요.
            </p>
          )}

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/saju"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-pink-500 text-black font-black uppercase tracking-[0.2em] text-sm"
            >
              전체 운세 자세히 보기
            </Link>
            <Link
              href="/gift"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/20 text-white/90 font-black uppercase tracking-[0.2em] text-sm"
            >
              <Gift className="w-4 h-4 mr-2" />
              나도 선물 보내기
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
