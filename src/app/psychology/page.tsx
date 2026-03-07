"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Brain, Sparkles, ShieldCheck, BarChart3, Clock3 } from "lucide-react";
import { motion } from "framer-motion";

type Style = {
  title: string;
  score: number;
  line: string;
  suggestion: string;
};

function ResultSummaryCard({ title, body, tone }: { title: string; body: string; tone: string }) {
  return (
    <article className={`rounded-3xl border p-5 ${tone}`}>
      <h3 className="text-sm font-black tracking-[0.18em] uppercase">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-100">{body}</p>
    </article>
  );
}

const QUESTIONS = [
  { question: "문제가 생기면 바로 해결하려고 하나요?", key: "a" },
  { question: "사람의 감정보다 사실을 더 먼저 보나요?", key: "b" },
  { question: "여러 일정을 동시에 처리하나요?", key: "c" },
];

export default function PsychologyPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState({ a: 0, b: 0, c: 0 });
  const [done, setDone] = useState(false);

  const score = useMemo(() => {
    const total = answers.a + answers.b + answers.c;
    return Math.round((total / 15) * 100);
  }, [answers]);

  const result: Style = useMemo(() => {
    if (score >= 70) {
      return {
        title: "결단형",
        score,
        line: "빠른 실행력과 우선순위 판단이 강점입니다.",
        suggestion: "중요한 결정을 할 때 감정 점검 문장을 한 줄 먼저 쓰면 실수를 줄입니다.",
      };
    }
    if (score >= 40) {
      return {
        title: "균형형",
        score,
        line: "분석력과 공감력의 균형이 좋은 성향입니다.",
        suggestion: "일정을 1개로 쪼개어 진행하면 집중도와 재충전 균형이 좋아집니다.",
      };
    }
    return {
      title: "관계형",
      score,
      line: "사람 중심의 판단이 강하고 협업 적응력이 좋습니다.",
      suggestion: "결정이 필요한 순간에는 기준 3개를 먼저 적고 시작하세요.",
    };
  }, [score]);

  const onSet = (key: keyof typeof answers, v: number) => setAnswers((prev) => ({ ...prev, [key]: v }));

  const answered = answers.a > 0 && answers.b > 0 && answers.c > 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(234,179,8,0.16),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.16),transparent_50%)]" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          <button onClick={() => setDone((v) => !v)} className="text-xs px-4 py-2 rounded-full border border-white/10 bg-white/10">
            결과 토글
          </button>
        </div>

        <section className="bg-slate-900/55 border border-white/10 rounded-[2.5rem] p-8 md:p-12">
          <div className="inline-flex items-center gap-2 text-indigo-300 font-black tracking-[0.2em] uppercase text-xs">
            <Brain className="w-4 h-4" /> 심리 성향 진단
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic mt-2">간단 심리 체크</h1>
          <p className="text-slate-300 mt-2">3문항으로 오늘의 판단 성향과 실행 전략을 추천합니다.</p>

          <div className="mt-7 grid gap-5">
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

          <div className="mt-7 bg-black/40 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400 font-black">
              <span>응답 진행률</span>
              <span>{answered ? '3/3' : `${Object.values(answers).filter(Boolean).length}/3`}</span>
            </div>
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <div style={{ width: `${(Object.values(answers).filter(Boolean).length / 3) * 100}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" />
            </div>
          </div>

          <button
            onClick={() => setDone(true)}
            className="mt-7 w-full py-5 rounded-full bg-indigo-500 text-white font-black uppercase tracking-[0.2em] disabled:opacity-50"
            disabled={!answered}
          >
            <Sparkles className="inline w-4 h-4 mr-2" /> 성향 분석 실행
          </button>
        </section>

        {done ? (
          <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-3xl border border-white/10 bg-slate-900/50 p-7 space-y-6">
            <div className="text-sm text-emerald-300 font-black tracking-[0.2em]">결과</div>
            <h2 className="text-3xl font-black mt-1">{result.title}</h2>
            <p className="text-slate-300">점수: {result.score}/100</p>
            <p className="text-slate-200">{result.line}</p>
            <div className="grid gap-4 md:grid-cols-3">
              <ResultSummaryCard
                title="🧠 Who You Are"
                tone="border-indigo-400/30 bg-indigo-500/10"
                body={`현재 응답 기준으로 당신은 ${result.title} 성향에 가깝습니다. 숫자 ${result.score}점은 단순 우열이 아니라, 판단 방식이 얼마나 빠르고 직접적인지 보여주는 지표로 읽는 편이 맞습니다.`}
              />
              <ResultSummaryCard
                title="📚 Why It Happens"
                tone="border-cyan-400/30 bg-cyan-500/10"
                body={`${result.line} 이 결과는 문제를 처리할 때 감정, 사실, 속도 중 어디에 먼저 반응하는지가 반영된 것입니다. 그래서 같은 상황에서도 당신은 남과 다른 순서로 결정을 내리게 됩니다.`}
              />
              <ResultSummaryCard
                title="✨ What To Do"
                tone="border-emerald-400/30 bg-emerald-500/10"
                body={`${result.suggestion} 오늘은 판단을 내리기 전에 기준을 짧게 문장으로 남기면, 성향의 장점은 살리고 과잉 반응은 줄일 수 있습니다.`}
              />
            </div>
            <div className="mt-2">
              <p className="text-sm text-slate-500 uppercase tracking-widest mb-2">권장 루틴</p>
              <div className="text-sm text-slate-200 bg-black/40 border border-white/10 rounded-xl p-4">조언: {result.suggestion}</div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-indigo-300" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">오늘의 집중 모드</p>
                  <p className="text-lg font-black text-white">{result.score >= 65 ? '집중 집중' : result.score >= 40 ? '균형 모드' : '관계 모드'}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 flex items-center gap-3">
                <Clock3 className="w-5 h-5 text-emerald-300" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">다음 액션</p>
                  <p className="text-lg font-black text-white">15분 복기 루틴 실행</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-green-200"><ShieldCheck className="w-4 h-4" /> 실행 체크리스트 저장해 두면 복기 효율이 올라갑니다.</div>
          </motion.section>
        ) : null}
      </div>
    </main>
  );
}
