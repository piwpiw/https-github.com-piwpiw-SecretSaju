"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, SendHorizonal } from "lucide-react";

type DreamMap = Record<string, string>;

const MAP: DreamMap = {
  "나무": "성장, 인내, 장기 프로젝트의 시그널입니다. 지금 방향성이 맞는지 점검해 보세요.",
  "물": "정리·회복·감정 정화와 관련된 장면입니다. 피로한 관계에서 거리를 두는 것이 좋습니다.",
  "비": "새로운 시작, 감정의 치유, 집안 내 대화의 타이밍과 연결됩니다.",
  "누군가 추적": "걱정, 과도한 책임감이 반영된 신호입니다. 할 일 범위를 줄이세요.",
  "시험": "준비된 만큼 결과를 받는 시기입니다. 불안을 줄이고 기록을 정리하세요.",
};

export default function DreamsPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const interpretation = useMemo(() => {
    const key = Object.keys(MAP).find((k) => text.includes(k));
    if (!key) return "꿈 속 요소를 더 자세히 적어주시면, 상징과 행동 제안을 정확히 맞춰드려요.";
    return MAP[key];
  }, [text]);

  const addLog = () => {
    if (!text.trim()) return;
    setHistory((prev) => [text.trim(), ...prev].slice(0, 5));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.18),transparent_45%)]" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          <div className="text-xs px-4 py-2 rounded-full border border-white/10 bg-white/10 text-slate-300">꿈해몽 정밀 도우미</div>
        </div>

        <section className="bg-slate-900/55 border border-white/10 rounded-[2.5rem] p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-black italic">꿈해몽</h1>
          <p className="mt-2 text-slate-300">꿈 키워드를 입력하면 상징을 해석해 현실 적용 가이드를 제공합니다.</p>

          <div className="mt-7 relative">
            <Search className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="예: 나무가 자라거나 바다에 빠지는 꿈을 꿨다"
              className="w-full rounded-3xl border border-white/10 bg-slate-950 px-12 py-4 text-white placeholder:text-slate-500"
            />
          </div>

          <button
            onClick={addLog}
            className="mt-4 w-full py-4 rounded-full bg-emerald-500 text-slate-900 font-black uppercase tracking-[0.18em]"
          >
            <SendHorizonal className="inline-block w-4 h-4 mr-2" /> 해석 실행
          </button>

          <div className="mt-6 rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-5 text-sm text-emerald-100">
            {interpretation}
          </div>
        </section>

        {history.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-lg font-black mb-3">최근 해석 기록</h2>
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div key={`${item}-${idx}`} className="p-4 rounded-2xl border border-white/10 bg-slate-900/45 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
