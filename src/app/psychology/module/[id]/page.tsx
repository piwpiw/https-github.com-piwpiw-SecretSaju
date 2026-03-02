import Link from "next/link";
import { ArrowLeft, BrainCircuit, Clock } from "lucide-react";

type Props = {
  params: { id: string };
};

export default function PsychologyModulePage({ params }: Props) {
  const { id } = params;

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden pb-32">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-rose-900/20 to-transparent pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <Link href="/psychology" className="inline-flex items-center gap-3 text-slate-400 hover:text-white transition-all mb-12">
          <ArrowLeft className="w-5 h-5" />
          심리 메뉴로 돌아가기
        </Link>

        <div className="bg-surface border border-border-color rounded-4xl p-8 md:p-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-rose-300 bg-rose-500/10 border border-rose-500/20">
            <BrainCircuit className="w-4 h-4" />
            심리 모듈 실행
          </div>
          <h1 className="text-3xl font-black leading-tight">모듈 실행 화면</h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            요청한 모듈 ID: <span className="text-rose-300 font-black">{id}</span>
          </p>
          <p className="text-slate-400 leading-relaxed">
            현재 모듈 상세 분석 페이지는 연동 준비 중입니다. 모듈 진입은 정상적으로 연결되며, 추후 테스트 결과와 분석 그래프를 이 화면에서 렌더링하도록 확장할 수 있습니다.
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-slate-400 mt-4">
            <Clock className="w-4 h-4" />
            결과는 계정 분석 히스토리에 반영됩니다.
          </div>
        </div>
      </div>
    </main>
  );
}

