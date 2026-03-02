"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles, ChevronRight, Calculator, History } from "lucide-react";
import JellyBalance from "@/components/shop/JellyBalance";
import { getProfiles, SajuProfile } from "@/lib/storage";
import { useWallet } from "@/components/WalletProvider";
import { calculateSajuFromBirthdate } from "@/lib/saju";
import { saveAnalysisToHistory } from "@/lib/analysis-history";
import ResultCard from "@/components/ResultCard";
import { getArchetypeByCode } from "@/lib/archetypes";
import { Suspense } from "react";

function SajuPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { consumeChuru, churu } = useWallet();

  const [profiles, setProfiles] = useState<SajuProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [archetype, setArchetype] = useState<any>(null);

  useEffect(() => {
    const saved = getProfiles();
    const profileIdFromQuery = searchParams?.get("profileId") || "";
    setProfiles(saved);
    if (saved.length > 0) {
      const found = saved.find((p) => p.id === profileIdFromQuery);
      setSelectedProfileId(found?.id || saved[0].id);
    }
  }, [searchParams]);

  const handleRun = async () => {
    const selected = profiles.find((item) => item.id === selectedProfileId);
    if (!selected) {
      return;
    }

    if (churu < 3) {
      alert("젤리가 부족합니다. 3개가 필요합니다.");
      return;
    }

    if (!consumeChuru(3)) {
      alert("젤리가 부족합니다. 3개가 필요합니다.");
      return;
    }

    setLoading(true);
    try {
      const analysisResult = await calculateSajuFromBirthdate(
        selected.birthdate,
        selected.birthTime,
        selected.calendarType,
        selected.gender === 'male' ? 'M' : 'F',
        selected.isTimeUnknown
      );

      const arch = getArchetypeByCode(analysisResult.code, analysisResult.ageGroup);
      setArchetype(arch);
      setResult(analysisResult);
      saveAnalysisToHistory(
        {
          type: "SAJU",
          title: `${selected.name} SAJU Premium Reading`,
          subtitle: "Four Pillars deep analysis",
          profileId: selected.id,
          profileName: selected.name,
          result: analysisResult,
          resultPreview: typeof analysisResult?.code === "string" ? analysisResult.code : "SAJU result",
        },
        {
          resultUrlFactory: (id) => `/analysis-history/SAJU/${id}`,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-slate-950 text-slate-100 relative overflow-hidden pb-32">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            뒤로
          </button>
          <JellyBalance />
        </div>

        <section className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none group-hover:bg-indigo-600/20 transition-all duration-1000" />

          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Calculator className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">사주 원국 분석</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Saju Astrology Engine</p>
            </div>
          </div>

          <div className="space-y-8 relative z-10 mt-10">
            <div className="space-y-4">
              <label className="text-sm font-black flex items-center gap-2 text-slate-300 uppercase tracking-widest">
                <History className="w-4 h-4 text-indigo-400" /> 분석 대상 프로필
              </label>
              <div className="relative">
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full rounded-2xl bg-black/40 border border-white/10 px-6 py-5 text-white font-bold text-lg appearance-none focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                >
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>{profile.name} ({profile.relationship})</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                  <ChevronRight className="w-5 h-5 text-slate-500 rotate-90" />
                </div>
              </div>
            </div>

            <button
              onClick={handleRun}
              disabled={loading}
              className="w-full py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl uppercase tracking-widest shadow-xl hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-6 h-6 border-2 border-white rounded-full border-t-transparent" />
              ) : (
                <Sparkles className="w-6 h-6 fill-white" />
              )}
              {loading ? "분석 엔진 가동 중..." : "3젤리로 정밀 분석 시작"}
            </button>
          </div>
        </section>

        {result && archetype && !loading && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16"
          >
            <div className="flex items-center gap-4 mb-10 justify-center">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
              <div className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-xs font-black text-indigo-300 uppercase tracking-[0.3em] flex items-center gap-2 backdrop-blur-md">
                <Sparkles className="w-4 h-4" /> 분석 완료 보고서
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>

            <ResultCard
              archetype={archetype}
              pillarNameKo={result.pillarNameKo}
              ageGroup={result.ageGroup}
              elementScores={result.elementScores}
              elementCounts={result.elementCounts}
              elementBasicPercentages={result.elementBasicPercentages}
              fourPillars={result.fourPillars}
              daewun={result.daewun}
              gyeokguk={result.gyeokguk}
              version={result.version}
              integrity={result.integrity}
              isTimeUnknown={result.isTimeUnknown}
            />
          </motion.section>
        )}
      </div>
    </main>
  );
}

export default function SajuPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SajuPageContent />
    </Suspense>
  );
}
