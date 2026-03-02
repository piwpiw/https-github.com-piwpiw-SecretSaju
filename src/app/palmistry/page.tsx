"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Hand, Play, HeartPulse, Sparkles } from "lucide-react";

const TYPES = {
  typeA: "활동형(집중력 높음, 단기 성취형)",
  typeB: "균형형(공감력 높음, 조율형)",
  typeC: "직관형(통찰력 높음, 장기 성장형)",
};

export default function PalmistryPage() {
  const router = useRouter();
  const [choice, setChoice] = useState<"typeA" | "typeB" | "typeC" | "">("");
  const [result, setResult] = useState("");

  const summary = useMemo(() => {
    if (!choice) return "손금 유형을 선택하고 실행하면 결과를 확인할 수 있습니다.";
    return TYPES[choice];
  }, [choice]);

  const run = () => {
    if (!choice) {
      setResult("손금 유형을 먼저 골라주세요.");
      return;
    }
    setResult(`선택한 유형 해석: ${TYPES[choice]}. 실무에 적용하려면 목표 1개를 정하고 7일간 추적하세요.`);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(20,184,166,0.18),transparent_45%)]" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          <button onClick={() => { setChoice(""); setResult(""); }} className="text-xs px-4 py-2 rounded-full border border-white/10 bg-white/10">초기화</button>
        </div>

        <section className="bg-slate-900/60 border border-white/10 rounded-[2.3rem] p-8 md:p-12">
          <div className="inline-flex items-center gap-2 text-emerald-300 font-black text-sm tracking-[0.2em]">
            <Hand className="w-4 h-4" /> 손금 분석
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic mt-3">손금 운세 가이드</h1>
          <p className="text-slate-300 mt-2">손금 입력 전제의 핵심 유형 가이드를 제공해 빠르게 방향을 잡아줍니다.</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <button onClick={() => setChoice("typeA")} className={`p-4 rounded-2xl text-left border ${choice === "typeA" ? "border-emerald-300 bg-emerald-500/10" : "border-white/10"}`}>활동형</button>
            <button onClick={() => setChoice("typeB")} className={`p-4 rounded-2xl text-left border ${choice === "typeB" ? "border-emerald-300 bg-emerald-500/10" : "border-white/10"}`}>균형형</button>
            <button onClick={() => setChoice("typeC")} className={`p-4 rounded-2xl text-left border ${choice === "typeC" ? "border-emerald-300 bg-emerald-500/10" : "border-white/10"}`}>직관형</button>
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-slate-900/45 p-5 text-sm text-slate-200">
            {summary}
          </div>

          <button
            onClick={run}
            className="mt-6 w-full py-5 rounded-full bg-emerald-500 text-slate-900 font-black uppercase tracking-[0.2em]"
          >
            <Play className="inline w-4 h-4 mr-2" /> 분석 실행
          </button>
        </section>

        {result ? (
          <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900/50 p-6">
            <div className="flex items-center gap-2 text-pink-300 font-black"><Sparkles className="w-4 h-4" /> 진단 결과</div>
            <p className="mt-3 text-slate-200">{result}</p>
            <div className="mt-5 text-sm text-slate-400 flex items-center gap-2">
              <HeartPulse className="w-4 h-4" /> 7일간 매일 10분씩 기록하면 정밀도가 올라갑니다.
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
