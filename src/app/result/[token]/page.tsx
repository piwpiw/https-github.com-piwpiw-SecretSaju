import Link from "next/link";
import { ArrowLeft, Gift, MessageCircle } from "lucide-react";

type Props = {
  params: { token: string };
};

export default function GiftResultPage({ params }: Props) {
  const token = decodeURIComponent(params.token);

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.18),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.14),transparent_50%)]" />
      <div className="max-w-3xl mx-auto px-6 py-16 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 text-slate-400 hover:text-white mb-10">
          <ArrowLeft className="w-4 h-4" /> 홈으로
        </Link>

        <section className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-10 text-center">
          <div className="mx-auto mb-8 w-16 h-16 rounded-2xl bg-pink-500/20 border border-pink-400/20 flex items-center justify-center">
            <Gift className="w-8 h-8 text-pink-300" />
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">운명 선물 링크 도착</h1>
          <p className="mt-4 text-slate-300 leading-relaxed">
            전달받은 선물 링크가 접수되었습니다.
            현재 수신 전용 분석 뷰어는 운영 정책 점검으로 준비중이며,
            링크 접근권한 및 표시 흐름은 곧 안정적으로 오픈됩니다.
          </p>

          <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-4 text-left">
            <p className="text-sm text-slate-400">링크 토큰</p>
            <p className="mt-1 text-xs md:text-sm text-pink-200 break-all">{token}</p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/gift"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-pink-500 text-black font-black uppercase tracking-[0.2em] text-xs"
            >
              선물 다시 보내기
            </Link>
            <a
              href="mailto:support@secretsaju.com?subject=%EC%84%9C%EB%B2%84%EA%B2%8C%EC%8A%A4%ED%8A%B8%EC%95%88"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/20 text-white/90 font-black uppercase tracking-[0.2em] text-xs"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              지원 요청
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
