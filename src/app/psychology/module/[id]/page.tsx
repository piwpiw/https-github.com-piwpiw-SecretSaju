import Link from "next/link";
import { ArrowLeft, BrainCircuit } from "lucide-react";

type Props = {
  params: { id: string };
};

export default function PsychologyModulePage({ params }: Props) {
  const { id } = params;
  const moduleLabel = decodeURIComponent(id);

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden pb-32">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-rose-900/20 to-transparent pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <Link href="/psychology" className="inline-flex items-center gap-3 text-slate-400 hover:text-white transition-all mb-12">
          <ArrowLeft className="w-5 h-5" />
          심리 분석으로 돌아가기
        </Link>

        <div className="bg-surface border border-border-color rounded-4xl p-8 md:p-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-rose-300 bg-rose-500/10 border border-rose-500/20">
            <BrainCircuit className="w-4 h-4" />
            모듈 상태 안내
          </div>
          <h1 className="text-3xl font-black leading-tight">심리 모듈 뷰어</h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            모듈 ID: <span className="text-rose-300 font-black">{moduleLabel}</span>
          </p>
          <p className="text-slate-400 leading-relaxed">
            현재 이 모듈은 분석 데이터 연동이 준비 중이며 화면은 운영/검증용으로만 노출됩니다.
            핵심 분석 데이터는 추후 릴리즈에서 차트·통계 영역과 함께 순차적으로 제공됩니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link
              href="/psychology"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-rose-600/90 text-white font-black uppercase tracking-widest text-[11px]"
            >
              심리 분석 페이지로 돌아가기
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-slate-200 font-black uppercase tracking-widest text-[11px]"
            >
              릴리스 상태 확인
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
