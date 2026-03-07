import Link from "next/link";
import { ArrowLeft, BrainCircuit, CheckCircle2, Lightbulb, Play } from "lucide-react";

type ModuleDefinition = {
  title: string;
  summary: string;
  purpose: string;
  checklist: string[];
  action: string;
};

const MODULE_LIBRARY: Record<string, ModuleDefinition> = {
  "inner-child": {
    title: "내면의 아이",
    summary: "어린 시절의 미해결 감정을 현재 판단 습관으로 추적해 정리합니다.",
    purpose: "감정 기복이 큰 날에도 판단의 연쇄 반응을 멈추고 회복 루틴을 설계할 수 있게 돕습니다.",
    checklist: ["현재 반복되는 반응을 1개만 기록하기", "자기비난 문장을 사실 진술로 바꾸기", "1주일간 수면/식사 패턴 3가지를 점검하기"],
    action: "자기비난 패턴 1개를 오늘 안에 바꿔보세요.",
  },
  defense: {
    title: "방어기제 점검", 
    summary: "스트레스 상황에서 과잉 반응을 유발하는 방어 패턴을 찾아 완화합니다.",
    purpose: "관계 충돌 시 즉시 반응을 줄이고 대화로 전환할 수 있는 실무형 가이드를 제공합니다.",
    checklist: ["문제 상황에서 반응 대신 10초 멈춤", "감정 단어 2개를 써서 의도 설명", "요구사항을 한 문장으로 정리해 전달"],
    action: "오늘은 반응보다 질문 한 개를 먼저 해보세요.",
  },
  "shadow-self": {
    title: "그늘 자기(Shadow Self)",
    summary: "겉으로 드러나지 않는 반응 패턴을 확인해 행동의 선명도를 높입니다.",
    purpose: "스스로가 회피하거나 과대 반응하는 순간을 식별해 객관성을 확보합니다.",
    checklist: ["회피 포인트 메모", "트리거 상황 키워드 3개 기록", "결정 미루기 패턴 점검"],
    action: "반응보다 기록부터 시작하세요.",
  },
};

type Props = {
  params: { id: string };
};

function ResultSummaryCard({ title, body, tone }: { title: string; body: string; tone: string }) {
  return (
    <article className={`rounded-3xl border p-5 ${tone}`}>
      <h3 className="text-sm font-black tracking-[0.18em] uppercase">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-100">{body}</p>
    </article>
  );
}

export default function PsychologyModulePage({ params }: Props) {
  const { id } = params;
  const moduleLabel = decodeURIComponent(id);
  const moduleKey = moduleLabel.toLowerCase();
  const moduleData = MODULE_LIBRARY[moduleKey] ?? {
    title: "커스텀 심리 모듈",
    summary: `요청된 모듈(${moduleLabel})은 맞춤형 진단 흐름으로 처리됩니다.`,
    purpose: "현재 모듈은 템플릿 기반 안내형으로 운영되며, 단계별 실행 액션은 추후 확장됩니다.",
    checklist: [
      "현재 상태를 1문장으로 압축해 입력",
      "감정 강도 1~10점으로 평가",
      "내일 실행할 1개 액션을 정해 저장",
    ],
    action: "3개 체크리스트를 모두 완료해 첫 결과 메모를 생성하세요.",
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden pb-32">
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <Link href="/psychology" className="inline-flex items-center gap-3 text-slate-400 hover:text-white transition-all mb-12">
          <ArrowLeft className="w-5 h-5" />
          심리 분석으로 돌아가기
        </Link>

        <div className="bg-surface border border-border-color rounded-4xl p-8 md:p-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-rose-300 bg-rose-500/10 border border-rose-500/20">
            <BrainCircuit className="w-4 h-4" />
            모듈 진단 화면
          </div>

          <h1 className="text-3xl font-black leading-tight">{moduleData.title}</h1>
          <p className="text-slate-300 leading-relaxed">{moduleData.summary}</p>
          <p className="text-slate-400 leading-relaxed">{moduleData.purpose}</p>

          <div className="grid gap-4 md:grid-cols-3">
            <ResultSummaryCard
              title="🧠 Who You Are"
              tone="border-rose-400/30 bg-rose-500/10"
              body={`${moduleData.title} 모듈은 지금의 당신이 어떤 반응을 반복하는지 빠르게 포착하는 화면입니다. 핵심은 성격 판정이 아니라, 현재 삶에서 되풀이되는 패턴을 더 선명하게 보는 데 있습니다.`}
            />
            <ResultSummaryCard
              title="📚 Why It Happens"
              tone="border-cyan-400/30 bg-cyan-500/10"
              body={`${moduleData.summary} 따라서 이 모듈은 단발성 기분보다, 특정 상황에서 자동으로 올라오는 생각과 행동의 연결을 읽어내는 데 초점이 맞춰져 있습니다.`}
            />
            <ResultSummaryCard
              title="✨ What To Do"
              tone="border-emerald-400/30 bg-emerald-500/10"
              body={`${moduleData.action} 오늘은 체크리스트를 전부 하려 하기보다, 가장 자주 반복되는 반응 하나만 골라 기록하는 방식으로 시작하는 편이 실제 변화에 더 잘 연결됩니다.`}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 py-2">
            {moduleData.checklist.map((item) => (
              <div key={item} className="flex gap-3 items-start rounded-xl border border-white/10 bg-white/5 p-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5" />
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-yellow-300/20 bg-yellow-500/10 p-4">
            <div className="flex items-center gap-2 text-yellow-200 font-black text-sm">
              <Lightbulb className="w-4 h-4" />
              실천 액션
            </div>
            <p className="mt-2 text-slate-200">{moduleData.action}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-rose-600/90 text-white font-black uppercase tracking-widest text-[11px] gap-2">
              <Play className="w-4 h-4" />
              지금 실행하기
            </button>
            <Link
              href={`/support?feature=${encodeURIComponent(moduleLabel)}`}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-slate-200 font-black uppercase tracking-widest text-[11px]"
            >
              실행 문의하기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
