"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Brain, Sparkles, ShieldCheck } from "lucide-react";

type Style = {
  title: string;
  score: number;
  line: string;
  suggestion: string;
};

const QUESTIONS = [
  { question: "문제가 생기면 바로 해결하려고 하나요?", key: "a" },
  { question: "사람의 감정보다 사실을 더 먼저 보나요?", key: "b" },
  { question: "여러 일정을 동시에 처리하나요?", key: "c" },
];

export default function PsychologyPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState({ a: 0, b: 0, c: 0 });
  const [done, setDone] = useState(false);

  const result: Style = useMemo(() => {
    const total = answers.a + answers.b + answers.c;
    const score = Math.round((total / 15) * 100);

    if (score >= 70) {
      return {
        title: "결단형",
        score,
        line: "빠른 실행력과 우선순위 판단이 강점입니다.",
        suggestion: "중요한 의사결정 전에 감정 점검 문장 한 줄을 먼저 쓰면 실수를 줄일 수 있습니다.",
      };
    }
    if (score >= 40) {
      return {
        title: "균형형",
        score,
        line: "분석력과 공감력의 균형이 좋은 성향입니다.",
        suggestion: "일정 1개를 정해 과부하를 막고 점진적으로 진행해 보세요.",
      };
    }
    return {
      title: "관계형",
      score,
      line: "사람 중심의 판단이 강하고 협업 적응력이 좋습니다.",
      suggestion: "결정이 필요한 순간에는 기준 3개를 미리 적고 시작하세요.",
    };
  }, [answers]);

  const onSet = (key: keyof typeof answers, v: number) => setAnswers((prev) => ({ ...prev, [key]: v }));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(234,179,8,0.16),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.16),transparent_50%)]" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          <button onClick={() => setDone((v) => !v)} className="text-xs px-4 py-2 rounded-full border border-white/10 bg-white/10">결과 토글</button>
        </div>

        <section className="bg-slate-900/55 border border-white/10 rounded-[2.5rem] p-8 md:p-12">
          <div className="inline-flex items-center gap-2 text-indigo-300 font-black tracking-[0.2em] uppercase text-xs">
            <Brain className="w-4 h-4" /> 심리 성향 진단
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic mt-2">간단 심리 체크</h1>
          <p className="text-slate-300 mt-2">3문항으로 오늘의 판단 성향과 실행 전략을 추천합니다.</p>

          <div className="mt-7 space-y-5">
            {QUESTIONS.map((item) => (
              <div key={item.key} className="rounded-2xl border border-white/10 bg-slate-950 p-5">
                <p className="font-bold text-white">{item.question}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => onSet(item.key as keyof typeof answers, 1)} className="px-3 py-2 rounded-full border border-white/10">낮음</button>
                  <button onClick={() => onSet(item.key as keyof typeof answers, 2)} className="px-3 py-2 rounded-full border border-white/10">보통</button>
                  <button onClick={() => onSet(item.key as keyof typeof answers, 3)} className="px-3 py-2 rounded-full border border-white/10">높음</button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setDone(true)}
            className="mt-7 w-full py-5 rounded-full bg-indigo-500 text-white font-black uppercase tracking-[0.2em]"
          >
            <Sparkles className="inline w-4 h-4 mr-2" /> 성향 분석 실행
          </button>
        </section>

        {done ? (
          <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/50 p-7">
            <div className="text-sm text-emerald-300 font-black tracking-[0.2em]">결과</div>
            <h2 className="text-3xl font-black mt-1">{result.title}</h2>
            <p className="mt-3 text-slate-300">점수: {result.score}/100</p>
            <p className="mt-2 text-slate-200">{result.line}</p>
            <p className="mt-5 text-sm text-slate-400">조언: {result.suggestion}</p>
            <div className="mt-6 flex items-center gap-2 text-green-200"><ShieldCheck className="w-4 h-4" /> 실행 체크리스트를 저장해두면 복기하기 쉽습니다.</div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
