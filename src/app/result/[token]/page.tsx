import Link from "next/link";
import { ArrowLeft, Gift, MessageCircle, Copy } from "lucide-react";
import { useState } from "react";

type Props = {
  params: { token: string };
};

export default function GiftResultPage({ params }: Props) {
  const token = decodeURIComponent(params.token);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const copyToken = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(token);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = token;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("idle");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden pb-28">
      <div className="max-w-3xl mx-auto px-6 py-16 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 text-slate-400 hover:text-white mb-10">
          <ArrowLeft className="w-4 h-4" />
          홈으로
        </Link>

        <section className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-10 text-center">
          <div className="mx-auto mb-8 w-16 h-16 rounded-2xl bg-pink-500/20 border border-pink-400/20 flex items-center justify-center">
            <Gift className="w-8 h-8 text-pink-300" />
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">선물 토큰 페이지</h1>
          <p className="mt-4 text-slate-300 leading-relaxed">
            선물 토큰을 받았습니다. 필요 시 지원 채널로 연락하시면
            토큰 상태 확인을 도와드리겠습니다.
          </p>

          <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-4 text-left">
            <p className="text-sm text-slate-400">선물 토큰</p>
            <p className="mt-1 text-xs md:text-sm text-pink-200 break-all">{token}</p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={copyToken}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white/15 border border-white/20 text-sm font-black"
            >
              <Copy className="w-4 h-4 mr-2" />
              토큰 복사
            </button>
            {copyState === "copied" && <span className="text-xs text-emerald-300">복사 완료</span>}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/gift"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-pink-500 text-black font-black uppercase tracking-[0.2em] text-xs"
            >
              선물 보내기
            </Link>
            <a
              href="mailto:support@secretsaju.com?subject=%EC%84%9C%EB%B2%84%EA%B2%8C%EC%8A%A4%ED%8A%B8%EC%95%88"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/20 text-white/90 font-black uppercase tracking-[0.2em] text-xs"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              문의하기
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
