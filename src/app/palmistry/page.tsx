"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Hand, Play, HeartPulse, Sparkles, History, RefreshCw, CheckCircle2 } from "lucide-react";

type PalmistryType = "typeA" | "typeB" | "typeC";

const TYPES: Record<
  PalmistryType,
  {
    title: string;
    description: string;
    plan: string[];
  }
> = {
  typeA: {
    title: "활동형(집중력 높음, 단기 성취형)",
    description: "단기 과제 처리 속도와 실행 추진력이 높은 유형입니다.",
    plan: ["명확한 목표 1개 설정", "매일 25분 집중", "성과 기록 7일 유지"],
  },
  typeB: {
    title: "균형형(공감력 높음, 조율형)",
    description: "의사결정에서 사람 간 조율과 균형감이 큰 장점입니다.",
    plan: ["중요 일정 체크리스트", "의사결정은 근거 2개 이상 확인", "주간 점검 루틴 고정"],
  },
  typeC: {
    title: "직관형(통찰력 높음, 장기 성장형)",
    description: "큰 흐름을 보는 감각이 뛰어나며 장기 플래닝에 유리합니다.",
    plan: ["주요 판단 기준 3개 기록", "실행 전 2단계 검증", "월별 회고 주기 반영"],
  },
};

type DiagnosisLog = {
  type: PalmistryType;
  createdAt: string;
  content: string;
};

export default function PalmistryPage() {
  const router = useRouter();
  const [choice, setChoice] = useState<PalmistryType | "">("");
  const [result, setResult] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<DiagnosisLog[]>([]);

  const summary = useMemo(() => {
    if (!choice) return "손금 유형을 선택하고 실행하면 결과를 확인할 수 있습니다.";
    const item = TYPES[choice];
    return `${item.title}. ${item.description}`;
  }, [choice]);

  const run = async (event: FormEvent) => {
    event.preventDefault();
    if (!choice) {
      setResult("손금 유형을 먼저 골라주세요.");
      return;
    }

    setSubmitting(true);
    setResult("");
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    const analysis = `선택한 유형 해석: ${TYPES[choice].description} 실무 적용은 목표 1개 정하고 7일간 추적하면 정밀도가 올라갑니다.`;
    const log: DiagnosisLog = {
      type: choice,
      createdAt: new Date().toLocaleString(),
      content: analysis,
    };
    setHistory((prev) => [log, ...prev].slice(0, 6));
    setResult(analysis);
    setSubmitting(false);
  };

  const resetForm = () => {
    setChoice("");
    setResult("");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(20,184,166,0.18),transparent_45%)]" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            aria-label="이전 화면으로 돌아가기"
            className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          <button
            onClick={resetForm}
            aria-label="선택 항목 초기화"
            className="text-xs px-4 py-2 rounded-full border border-white/10 bg-white/10 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            초기화
          </button>
        </div>

        <section className="bg-slate-900/60 border border-white/10 rounded-[2.3rem] p-8 md:p-12">
          <div className="inline-flex items-center gap-2 text-emerald-300 font-black text-sm tracking-[0.2em]">
            <Hand className="w-4 h-4" /> 손금 분석
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic mt-3">손금 유형 플로우</h1>
          <p className="text-slate-300 mt-2">손금 기반 성향을 빠르게 매핑하고 즉시 실행할 체크리스트를 생성합니다.</p>

          <form onSubmit={run} className="mt-6 space-y-4" aria-label="손금 분석 폼">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.entries(TYPES) as [PalmistryType, (typeof TYPES)[PalmistryType]][]).map(([key, value]) => (
                <label key={key} className="block">
                  <input
                    type="radio"
                    name="palmType"
                    className="sr-only"
                    checked={choice === key}
                    onChange={() => setChoice(key)}
                    aria-label={value.title}
                  />
                  <button
                    type="button"
                    onClick={() => setChoice(key)}
                    aria-pressed={choice === key}
                    className={`w-full p-4 rounded-2xl text-left border ${choice === key ? "border-emerald-300 bg-emerald-500/10" : "border-white/10"} transition`}
                  >
                    <div className="font-black">{value.title}</div>
                    <p className="mt-2 text-xs text-slate-300">{value.description}</p>
                  </button>
                </label>
              ))}
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/45 p-5 text-sm text-slate-200">
              {summary}
            </div>

            <button
              type="submit"
              disabled={submitting}
              aria-label={submitting ? "분석 실행 중" : "손금 분석 실행"}
              className="w-full py-5 rounded-full bg-emerald-500 text-slate-900 font-black uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} 분석 실행
            </button>
          </form>
        </section>

        {result ? (
          <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900/50 p-6">
            <div className="flex items-center gap-2 text-pink-300 font-black">
              <Sparkles className="w-4 h-4" /> 진단 결과
            </div>
            <p className="mt-3 text-slate-200">{result}</p>
            <div className="mt-5 text-sm text-slate-400 flex items-center gap-2">
              <HeartPulse className="w-4 h-4" /> 7일간 매일 10분씩 기록하면 정밀도가 올라갑니다.
            </div>
            {choice ? (
              <div className="mt-5 rounded-2xl border border-emerald-700/30 bg-emerald-950/40 p-4">
                <p className="text-xs text-emerald-300 font-black uppercase tracking-[0.2em] mb-3">실행 루틴</p>
                <ul className="space-y-2 text-sm">
                  {TYPES[choice].plan.map((step) => (
                    <li key={step} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-300" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900/50 p-6">
          <div className="flex items-center gap-2 text-cyan-300 font-black mb-4">
            <History className="w-4 h-4" /> 최근 진단 이력
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">아직 기록이 없습니다. 실행으로 첫 진단을 남겨보세요.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {history.map((item, idx) => (
                <li key={`${item.type}-${item.createdAt}-${idx}`} className="rounded-xl border border-white/10 bg-slate-800/50 p-3">
                  <p className="text-xs text-slate-400 mb-1">{item.createdAt}</p>
                  <p>
                    <span className="text-cyan-300 font-black">[{TYPES[item.type].title}] </span>
                    {item.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
