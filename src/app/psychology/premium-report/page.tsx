import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function PsychologyPremiumReportPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const profileId = searchParams?.profileId || "";
  const hasProfileId = Boolean(profileId);
  const statusText = hasProfileId
    ? `현재 회원 ID(${profileId})의 프리미엄 리포트가 곧 분석되어 발송됩니다.`
    : "프리미엄 리포트가 준비 중입니다.";

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden pb-36">
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-rose-600/20 to-transparent pointer-events-none" />
      <div className="max-w-3xl mx-auto px-6 py-12 relative z-10">
        <Link href="/psychology" className="inline-flex items-center gap-3 text-slate-400 hover:text-white mb-12">
          <ArrowLeft className="w-5 h-5" />
          심리 분석으로 이동
        </Link>

        <div className="bg-surface border border-border-color rounded-4xl p-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-rose-300 bg-rose-500/10 border border-rose-500/20">
            <Sparkles className="w-3 h-3" />
            프리미엄 분석 리포트
          </div>
          <h1 className="text-3xl font-black leading-tight">프리미엄 리포트 준비 화면</h1>
          <p className="text-slate-300 leading-relaxed">
            {statusText}
            <br />
            분석 결과는 운영 정책 점검 완료 후 바로 열람 가능하도록 전송됩니다.
          </p>
          <div className="pt-4 border-t border-border-color">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/psychology"
                className="inline-flex px-6 py-3 rounded-2xl bg-rose-600 text-white font-black uppercase tracking-widest text-xs shadow-lg"
              >
                심리 분석 대시보드
              </Link>
              <Link
                href="/support"
                className="inline-flex px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-black uppercase tracking-widest text-xs"
              >
                지원 문의
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
