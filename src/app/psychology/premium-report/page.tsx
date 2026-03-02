import Link from "next/link";
import { ArrowLeft, Sparkles, RefreshCcw, CheckCircle2 } from "lucide-react";

type Props = {
  searchParams?: { [key: string]: string | undefined };
};

export default function PsychologyPremiumReportPage({
  searchParams,
}: Props) {
  const profileId = searchParams?.profileId || "";
  const status = searchParams?.status || "processing";

  const isReady = status === "ready";

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

          <h1 className="text-3xl font-black leading-tight">프리미엄 리포트 상태</h1>
          <p className="text-slate-300 leading-relaxed">
            {profileId ? `회원 ID(${profileId})` : '회원 ID 미기록'}의 프리미엄 리포트 발송 프로세스를 확인합니다.
          </p>

          {isReady ? (
            <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 mt-0.5" />
              <div>
                <p className="font-black text-emerald-200">리포트 준비 완료</p>
                <p className="text-sm text-slate-200 mt-1">
                  분석 파일이 생성되어 지원 채널 또는 결제 알림 채널로 전달됩니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-4">
              <p className="font-black text-amber-200">현재 생성 중</p>
              <p className="text-sm text-slate-200 mt-1">평균 1-3분 내 완료됩니다. 완료되면 알림 또는 메일로 확인 가능합니다.</p>
            </div>
          )}

          <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4 space-y-2 text-sm text-slate-300">
            <p>기능 체크</p>
            <p>• 생성 상태: {isReady ? '완료' : '진행 중'}</p>
            <p>• 재요청: 아래 [리포트 다시 요청] 클릭</p>
            <p>• 오류 발생 시 지원 센터: <a href="mailto:support@secretsaju.com" className="underline">support@secretsaju.com</a></p>
          </div>

          <div className="pt-4 border-t border-border-color">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/psychology"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-rose-600 text-white font-black uppercase tracking-widest text-xs shadow-lg"
              >
                심리 분석 페이지로
              </Link>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-slate-200 font-black uppercase tracking-widest text-xs gap-2"
              >
                <RefreshCcw className="w-3 h-3" />
                상태 새로고침
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
