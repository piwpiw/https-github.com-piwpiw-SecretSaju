import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function PsychologyPremiumReportPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const profileId = searchParams?.profileId || "미지정";

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden pb-36">
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-rose-600/20 to-transparent pointer-events-none" />
      <div className="max-w-3xl mx-auto px-6 py-12 relative z-10">
        <Link href="/psychology" className="inline-flex items-center gap-3 text-slate-400 hover:text-white mb-12">
          <ArrowLeft className="w-5 h-5" /> 심리 인사이트로 돌아가기
        </Link>

        <div className="bg-surface border border-border-color rounded-4xl p-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-rose-300 bg-rose-500/10 border border-rose-500/20">
            <Sparkles className="w-3 h-3" /> 프리미엄 리포트 준비중
          </div>
          <h1 className="text-3xl font-black leading-tight">심리 프리미엄 리포트</h1>
          <p className="text-slate-300 leading-relaxed">
            현재 프로필({profileId}) 기반 분석은 데이터 연동 직후 제공 예정입니다.
            프리미엄 버튼으로 진입은 성공했으며, 연결되지 않은 경로를 방지하기 위해 결과 페이지를 임시 노출합니다.
          </p>
          <div className="pt-4 border-t border-border-color">
            <Link
              href="/psychology"
              className="inline-flex px-6 py-3 rounded-2xl bg-rose-600 text-white font-black uppercase tracking-widest text-xs shadow-lg"
            >
              심리메뉴로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
