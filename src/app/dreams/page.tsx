"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, SendHorizonal, Sparkles } from "lucide-react";
import { saveAnalysisToHistory } from "@/lib/analysis-history";
import AIDreamParser from "@/components/dreams/AIDreamParser";
import DreamKeywordCloud from "@/components/dreams/DreamKeywordCloud";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";

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
  const [status, setStatus] = useState("");

  const interpretation = useMemo(() => {
    const key = Object.keys(MAP).find((k) => text.includes(k));
    if (!key) return "꿈 속 요소를 더 자세히 적어주시면, 상징과 행동 제안을 정확히 맞춰드려요.";
    return MAP[key];
  }, [text]);

  const matchedKey = useMemo(() => Object.keys(MAP).find((k) => text.includes(k)), [text]);

  const addLog = () => {
    if (!text.trim()) return;
    const trimmed = text.trim();
    setHistory((prev) => [trimmed, ...prev].slice(0, 5));
    const saved = saveAnalysisToHistory(
      {
        type: "DREAM",
        title: "꿈해몽 분석",
        subtitle: `${matchedKey || "기타"} 해몽`,
        result: {
          input: trimmed,
          interpretation,
          matchedKeyword: matchedKey || null,
        },
        resultUrl: "/dreams",
        resultPreview: interpretation,
      }
    );
    setStatus(saved ? "기록에 저장되었습니다." : "기록 저장에 실패했습니다.");
    setTimeout(() => setStatus(""), 2200);
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

        <ScrollReveal>
          <div className="mb-8">
            <DreamKeywordCloud />
          </div>

          <section className="bg-slate-900/55 border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black italic text-white uppercase tracking-widest leading-none">AI 꿈 해몽 비서</h1>
                <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em] mt-1 italic">심층 상징 추출 엔진</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-lg mb-8">어젯밤 당신의 무의식이 보낸 메시지를 AI가 정밀 분석합니다. 이미지와 감정을 상세히 기록할수록 높은 정확도의 해석을 도출합니다.</p>

            <AIDreamParser />

            {status ? <p className="mt-4 text-xs text-emerald-300 text-center font-bold tracking-widest uppercase animate-pulse">{status}</p> : null}
          </section>
        </ScrollReveal>

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
