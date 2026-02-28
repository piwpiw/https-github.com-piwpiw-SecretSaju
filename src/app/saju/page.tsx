"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import JellyBalance from "@/components/shop/JellyBalance";
import { getProfiles, SajuProfile } from "@/lib/storage";
import { useWallet } from "@/components/WalletProvider";
import { calculateSajuFromBirthdate } from "@/lib/saju";
import { saveAnalysisToHistory } from "@/lib/analysis-history";

import { Suspense } from "react";

function SajuPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { consumeChuru, churu } = useWallet();

  const [profiles, setProfiles] = useState<SajuProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

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
      );

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

        <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">SAJU 프리미엄</h1>
          <p className="text-slate-400 mb-8">프로필을 선택하고 사주 분석을 실행하세요.</p>

          <div className="space-y-6">
            <label className="block text-sm uppercase tracking-widest text-slate-400">프로필</label>
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-4"
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>{profile.name}</option>
              ))}
            </select>

            <button
              onClick={handleRun}
              className="px-6 py-4 bg-cyan-500 text-black font-black rounded-full"
            >
              3젤리로 분석하기
            </button>
          </div>
        </section>

        {loading && (
          <section className="mt-10 text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-2 border-cyan-400 rounded-full border-t-transparent mx-auto" />
            <p className="mt-3 text-slate-400">분석 중...</p>
          </section>
        )}

        {result && !loading && (
          <section className="mt-10 bg-slate-900/70 border border-slate-800 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-black">분석 결과</h2>
            </div>
            <div className="text-sm text-slate-300 grid gap-4">
              <p>코드: {result.code}</p>
              <p>지지: {result.pillarNameKo}</p>
              <p>원소: {result.element}</p>
              <p>연령 구간: {result.ageGroup}</p>
            </div>
          </section>
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
