"use client";

import { useState } from "react";
import { ArrowLeft, Shield, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import JellyBalance from "@/components/shop/JellyBalance";
import { useWallet } from "@/components/WalletProvider";

type ShinSalType = {
  id: string;
  name: string;
  risk: "주의" | "일반" | "유리";
  note: string;
  tip: string;
};

const TYPES: ShinSalType[] = [
  { id: "1", name: "조화신", risk: "유리", note: "협력 운이 좋아 팀 과제 성과가 좋습니다.", tip: "문서 정리를 먼저 시작하세요." },
  { id: "2", name: "백호살", risk: "주의", note: "대인 신뢰가 흔들리기 쉬운 기운입니다.", tip: "의사결정은 감정이 아닌 기록으로.", },
  { id: "3", name: "천을귀인", risk: "유리", note: "긍정적 도움을 받기 쉬운 운입니다.", tip: "좋은 제안을 바로 기록해 두세요." },
  { id: "4", name: "천을귀살", risk: "일반", note: "작은 변동이 반복되기 쉽습니다.", tip: "작은 우선순위부터 처리하세요." },
  { id: "5", name: "겁살", risk: "주의", note: "감정 기복과 과민 반응이 커질 수 있습니다.", tip: "호흡 3분과 산책으로 리셋하세요." },
];

function badgeClass(level: ShinSalType["risk"]) {
  if (level === "유리") return "bg-emerald-500/20 text-emerald-200 border-emerald-300/40";
  if (level === "주의") return "bg-rose-500/20 text-rose-200 border-rose-300/40";
  return "bg-sky-500/20 text-sky-200 border-sky-300/40";
}

export default function ShinsalPage() {
  const router = useRouter();
  const { churu, consumeChuru, isAdmin } = useWallet();
  const [run, setRun] = useState(false);
  const [selected, setSelected] = useState<ShinSalType | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRun = () => {
    setErrorMessage("");

    if (!isAdmin && churu < 5) {
      setErrorMessage("신살 분석은 5젤리가 필요합니다.");
      return;
    }

    const consumed = consumeChuru(5);
    if (!consumed) {
      setErrorMessage("젤리 차감에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setRun(true);
    setTimeout(() => setRun(false), 900);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.14),transparent_40%),radial-gradient(circle_at_80%_40%,rgba(236,72,153,0.12),transparent_45%)]" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          <JellyBalance />
        </div>

        <section className="bg-slate-900/60 border border-white/10 rounded-[2.3rem] p-8 md:p-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-400/30 text-fuchsia-200 font-black uppercase tracking-[0.2em] text-xs">
            <Shield className="w-4 h-4" /> 신살 진단
          </div>
          <h1 className="text-4xl font-black italic mt-4">신살 운세 지도</h1>
          <p className="text-slate-300 mt-2">프로필과는 별개로 신살 흐름만 빠르게 점검하고 조언을 받을 수 있습니다.</p>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {TYPES.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setSelected(item)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                className={`text-left rounded-2xl border ${selected?.id === item.id ? "border-violet-300/60 bg-violet-500/5" : "border-white/10 bg-white/5"} p-5`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white">{item.name}</div>
                  <span className={`text-[11px] px-2 py-1 rounded-full border ${badgeClass(item.risk)}`}>{item.risk}</span>
                </div>
                <p className="mt-3 text-sm text-slate-300">{item.note}</p>
                <p className="mt-4 text-xs text-slate-400">권장: {item.tip}</p>
              </motion.button>
            ))}
          </div>

          <button
            onClick={handleRun}
            disabled={run}
            className="mt-7 w-full py-5 rounded-full bg-fuchsia-500 text-white font-black uppercase tracking-[0.2em]"
          >
            <Sparkles className="inline mr-2 w-4 h-4" />
            {run ? "분석 중..." : "5젤리로 전체 신살 요약 받기"}
          </button>
          {errorMessage && (
            <p className="mt-3 text-sm text-center text-rose-300 font-medium">{errorMessage}</p>
          )}
        </section>

        {selected && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-3xl border border-white/10 bg-slate-900/50 p-7"
          >
            <div className="flex items-center gap-3 text-emerald-300 font-black">
              <ShieldCheck className="w-5 h-5" /> 선택 항목 상세
            </div>
            <h2 className="text-2xl mt-2 font-black text-white">{selected.name}</h2>
            <p className="mt-3 text-slate-300 leading-relaxed">{selected.note}</p>
            <p className="mt-2 text-sm text-slate-400">실행 팁: {selected.tip}</p>
          </motion.section>
        )}
      </div>
    </main>
  );
}
