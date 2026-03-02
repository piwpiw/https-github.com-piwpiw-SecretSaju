"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Star, Sparkles, Users, ChevronRight, Search } from "lucide-react";
import { motion } from "framer-motion";

type Zodiac = {
  id: string;
  name: string;
  element: string;
  summary: string;
  match: string;
};

const SIGNS: Zodiac[] = [
  { id: "aries", name: "양자리", element: "불", summary: "결단력과 추진력이 강해 계획을 밀어붙일 수 있습니다.", match: "사자자리, 사수자리" },
  { id: "taurus", name: "황소자리", element: "지", summary: "안정과 신뢰를 우선시하며, 한 번 정한 목표는 끝까지 갑니다.", match: "처녀자리, 염소자리" },
  { id: "gemini", name: "쌍둥이자리", element: "공기", summary: "커뮤니케이션 속도가 빠르고 변화 대응력이 좋습니다.", match: "천칭자리, 물병자리" },
  { id: "cancer", name: "게자리", element: "물", summary: "감정 표현이 섬세해 대인 신뢰를 쉽게 쌓을 수 있습니다.", match: "물고기자리, 전갈자리" },
  { id: "leo", name: "사자자리", element: "불", summary: "주도력이 높아 무대와 사람 앞에서 능력을 발휘합니다.", match: "양자리, 궁수자리" },
  { id: "virgo", name: "처녀자리", element: "지", summary: "정리·분석력이 강해 실제 실행력이 좋습니다.", match: "황소자리, 염소자리" },
];

export default function AstrologyPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Zodiac>(SIGNS[0]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => SIGNS.filter((item) => item.name.includes(query)),
    [query]
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.16),transparent_45%)] pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          <button
            onClick={() => setSelected(SIGNS[0])}
            className="px-4 py-2 rounded-full border border-white/20 bg-white/10 text-xs font-black uppercase"
          >
            기본값 복원
          </button>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-7 md:p-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-sm font-black tracking-[0.2em]">
            <Star className="w-4 h-4" /> 별자리 운세
          </div>
          <h1 className="text-3xl md:text-5xl font-black italic mt-4">오늘의 별자리 리포트</h1>
          <p className="mt-3 text-slate-300">별자리별 기운과 궁합을 실전적인 조언으로 정리했습니다.</p>

          <div className="mt-6 relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full bg-slate-950 border border-white/10 py-3 pl-12 pr-4 text-white placeholder:text-slate-500"
              placeholder="별자리 검색 (예: 양자리)"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {(query ? filtered : SIGNS).map((sign) => (
              <button
                key={sign.id}
                onClick={() => setSelected(sign)}
                className={`px-4 py-2 rounded-full border ${selected.id === sign.id ? "border-cyan-300 bg-cyan-300/10 text-cyan-200" : "border-white/10 bg-white/5 text-slate-300"}`}
              >
                {sign.name}
              </button>
            ))}
            {query && filtered.length === 0 ? <div className="text-sm text-slate-400">검색 결과가 없습니다.</div> : null}
          </div>

          <motion.div
            key={selected.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 rounded-3xl border border-white/10 bg-slate-950 p-6"
          >
            <h2 className="text-2xl font-black text-white">{selected.name}</h2>
            <p className="mt-3 text-slate-300">오행: {selected.element}</p>
            <p className="mt-3 leading-relaxed text-slate-200">{selected.summary}</p>
            <div className="mt-5 text-sm text-slate-400 flex items-center gap-2">
              <Heart className="w-4 h-4" /> 오늘의 궁합: {selected.match}
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-black text-amber-300">금전운</div>
                <div className="mt-2 text-slate-300">지출 관리에 집중하면 손해를 줄일 수 있습니다.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-black text-emerald-300">건강운</div>
                <div className="mt-2 text-slate-300">수면 리듬 정렬이 이번 달 핵심입니다.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-black text-cyan-300">인연운</div>
                <div className="mt-2 text-slate-300">너무 성급한 약속보다 가볍고 선명한 대화가 좋아요.</div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <div className="mt-8 flex justify-center">
          <button className="inline-flex items-center gap-3 px-6 py-4 rounded-full bg-cyan-500 text-white font-black uppercase tracking-[0.25em]">
            <Sparkles className="w-5 h-5" /> 오늘의 별자리 요약 저장
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
