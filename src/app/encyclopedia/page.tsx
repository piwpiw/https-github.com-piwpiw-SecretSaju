"use client";

import { useMemo, useState } from "react";
import { Search, ArrowLeft, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getAllTenGodGuides } from "@/lib/saju/terminology";
import EncyclopediaIndex from "@/components/encyclopedia/EncyclopediaIndex";
import AmbientSoundPortal from "@/components/ui/AmbientSoundPortal";
import ReadingProgressBar from "@/components/ui/ReadingProgressBar";

type TermCategory = "ALL" | "STEMS" | "BRANCHES" | "STARS" | "ENERGY";

type Term = {
  id: string;
  name: string;
  hanja: string;
  desc: string;
  category: TermCategory;
  tags: string[];
};

const BASE_TERMS: Term[] = [
  { id: "stems", name: "천간", hanja: "天干", desc: "갑을병정무기경신임계의 10개 천간 체계입니다.", category: "STEMS", tags: ["#천간", "#기초"] },
  { id: "branches", name: "지지", hanja: "地支", desc: "자축인묘진사오미신유술해의 12지지 체계입니다.", category: "BRANCHES", tags: ["#지지", "#기초"] },
  { id: "sibi", name: "12운성", hanja: "十二運星", desc: "장생부터 양까지 기운의 12단계 흐름을 의미합니다.", category: "ENERGY", tags: ["#12운성", "#흐름"] },
  { id: "sinsal", name: "신살", hanja: "神殺", desc: "도화, 역마, 화개 등 특수한 상징 패턴을 해석합니다.", category: "ENERGY", tags: ["#신살", "#귀인"] },
];

const CATEGORIES: { id: TermCategory; label: string }[] = [
  { id: "ALL", label: "전체" },
  { id: "STEMS", label: "천간" },
  { id: "BRANCHES", label: "지지" },
  { id: "STARS", label: "십성" },
  { id: "ENERGY", label: "신살/운성" },
];

const INDEX_CHARS = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

export default function EncyclopediaPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<TermCategory>("ALL");
  const [query, setQuery] = useState("");

  const tenGodTerms: Term[] = useMemo(
    () =>
      getAllTenGodGuides().map((guide) => ({
        id: `ten-god-${guide.term}`,
        name: guide.term,
        hanja: guide.hanja ?? guide.term,
        desc: guide.plain,
        category: "STARS",
        tags: ["#십성", "#용어"],
      })),
    []
  );

  const terms = useMemo(() => [...BASE_TERMS, ...tenGodTerms], [tenGodTerms]);

  const filtered = useMemo(() => {
    return terms.filter((term) => {
      const byCategory = activeCategory === "ALL" || term.category === activeCategory;
      const q = query.trim();
      const byQuery =
        q.length === 0 ||
        term.name.includes(q) ||
        term.hanja.includes(q) ||
        term.desc.includes(q) ||
        term.tags.some((tag) => tag.includes(q));
      return byCategory && byQuery;
    });
  }, [activeCategory, query, terms]);

  const getInitial = (str: string) => {
    const cho = [
      'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
    ];
    const code = str.charCodeAt(0) - 160224; // This is not standard. Standard is:
    /*
      const charCode = str.charCodeAt(0);
      if (charCode < 44032 || charCode > 55203) return str[0];
      return cho[Math.floor((charCode - 44032) / 588)];
    */
    const charCode = str.charCodeAt(0);
    if (charCode < 44032 || charCode > 55203) return str[0];
    return cho[Math.floor((charCode - 44032) / 588)];
  };

  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [filtered]);

  let lastInitial = "";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative">
      <ReadingProgressBar />
      <AmbientSoundPortal />
      <EncyclopediaIndex />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          이전
        </button>

        <header className="mt-8 mb-8">
          <h1 className="text-3xl font-black">사주 용어 백과사전</h1>
          <p className="text-sm text-slate-400 mt-2">정통 용어를 한국어로 쉽게 설명합니다.</p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="용어 검색"
              className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs border ${activeCategory === cat.id ? "bg-indigo-500/20 text-indigo-100 border-indigo-400/40" : "bg-white/5 text-slate-300 border-white/10"}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {sortedFiltered.length > 0 ? sortedFiltered.map((term) => {
              const currentInitial = getInitial(term.name);
              const showId = currentInitial !== lastInitial;
              lastInitial = currentInitial;

              return (
                <motion.article
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={term.id}
                  id={showId ? `index-${currentInitial}` : undefined}
                  className="rounded-3xl border border-white/5 bg-white/5 p-6 hover:bg-white/10 transition-all hover:border-indigo-500/30 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{term.category}</div>
                  <h2 className="text-xl font-black mt-1 text-white group-hover:text-indigo-200 transition-colors flex items-center gap-2">
                    <span className={query && term.name.includes(query) ? "text-indigo-300 underline underline-offset-4 decoration-indigo-500/50" : ""}>{term.name}</span>
                    <span className="text-slate-500 text-sm font-bold">[{term.hanja}]</span>
                  </h2>
                  <p className="text-sm text-slate-400 mt-3 leading-relaxed">{term.desc}</p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {term.tags.map((tag) => (
                      <span key={`${term.id}-${tag}`} className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.article>
              );
            }) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center"
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Search className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-widest italic">결과가 없습니다</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
