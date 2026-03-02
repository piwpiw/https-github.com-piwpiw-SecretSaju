"use client";

import { ArrowLeft, Gem, HeartHandshake, MessageCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";

const KAKAO_LINK = "https://open.kakao.com/o/secret-saju";

export default function SupportPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(244,114,182,0.16),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.14),transparent_50%)]" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-8">
          <ArrowLeft className="w-5 h-5" /> 뒤로가기
        </button>

        <section className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12">
          <div className="inline-flex items-center gap-2 text-pink-300 font-black tracking-[0.2em] uppercase">
            <HeartHandshake className="w-4 h-4" /> 후원하기
          </div>
          <h1 className="mt-4 text-4xl font-black italic">프로젝트 운영을 응원해주세요</h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            Secret Saju는 더 나은 해석 품질과 안정적인 서비스를 위해 운영됩니다.
            소중한 후원은 서버 유지, 데이터 정합성 개선, 오차 보완 작업에 바로 반영됩니다.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
              <div className="flex items-center gap-2 text-emerald-300 font-black"><Gem className="w-5 h-5" /> 정중한 후원 안내</div>
              <ul className="mt-3 space-y-2 text-slate-300 text-sm">
                <li>후원금은 운영비와 장애 대응 자금으로 사용됩니다.</li>
                <li>기능 고도화(운세 해석 근거, 데이터 정리, UX 개선)에 반영됩니다.</li>
                <li>원하시면 결제 영수증을 고객지원으로 보내주세요.</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
              <div className="flex items-center gap-2 text-cyan-300 font-black"><MessageCircle className="w-5 h-5" /> 커뮤니티 톡방</div>
              <p className="mt-3 text-slate-300 text-sm">이슈 공유와 공지 확인을 위한 오픈 채널을 운영합니다.</p>
              <a
                href={KAKAO_LINK}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-white bg-sky-500 rounded-full px-5 py-3 font-black"
              >
                <Send className="w-4 h-4" /> 카카오톡 톡방 입장하기
              </a>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-black text-xl">정직한 커뮤니케이션 약속</h2>
            <p className="mt-3 text-slate-300">
              문의 처리 속도, 유지보수 계획, 다음 분기 우선순위는 투명하게 공지하겠습니다.
              모두가 안심하고 사용할 수 있는 서비스가 되도록 계속 개선하겠습니다.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

