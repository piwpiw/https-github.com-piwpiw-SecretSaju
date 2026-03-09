"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HeroSection } from "@/components/home/HeroSection";
import ResultCard from "@/components/result/ResultCard";
import { ShareSection } from "@/components/result/ShareSection";
import { SecretBlur } from "@/components/result/SecretBlur";
import { calculateSaju } from "@/lib/saju";
import { getArchetypeByCode } from "@/lib/saju/archetypes";
import { RecommendationsSection } from "@/components/result/RecommendationsSection";
import { CelebritySection } from "@/components/home/CelebritySection";
import { type AgeGroup } from "@/lib/saju/archetypes";
import JellyShopModal from "@/components/shop/JellyShopModal";

type Campaign = {
  title: string;
  description: string;
  buttonLabel: string;
  buttonLink: string;
};

type ResultState = {
  code: string;
  animalName: string;
  pillarNameKo: string;
  mask: string;
  hashtags: string[];
  displayHook: string;
  displaySecretPreview: string;
  ageGroup: AgeGroup;
  foods: { name: string; reason: string; emoji: string }[];
  products: { name: string; category: string; reason: string; emoji: string }[];
  campaigns: Campaign[];
  elementScores: number[];
  elementCounts: number[];
  elementBasicPercentages: number[];
  fourPillars: any;
  version: string;
  integrity: string;
  gangyak?: any;
  yongshin?: any;
  sipsong?: any;
  sibiwoonseong?: any;
  gyeokguk?: any;
  canonicalFeatures?: any;
  evidence?: any[];
};

const FALLBACK_RESULT: ResultState = {
  code: "",
  animalName: "알 수 없는 사주",
  pillarNameKo: "사주",
  mask: "결과 계산 중 일시적으로 오류가 발생했습니다.",
  hashtags: [],
  displayHook: "잠시 후 다시 시도해 주세요.",
  displaySecretPreview: "비밀 프리미엄 분석은 잠금 상태입니다.",
  ageGroup: "20s",
  foods: [],
  products: [],
  campaigns: [],
  elementScores: [0, 0, 0, 0, 0],
  elementCounts: [0, 0, 0, 0, 0],
  elementBasicPercentages: [0, 0, 0, 0, 0],
  fourPillars: null,
  version: "",
  integrity: "",
};

export function SecretPawsFlow() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unlockedLv2, setUnlockedLv2] = useState(false);
  const [unlockedLv3, setUnlockedLv3] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  const handleSubmit = async (
    birth: { year: number; month: number; day: number },
    gender: "M" | "F" = "M"
  ) => {
    setError(null);
    setLoading(true);

    // Aesthetic delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const birthDate = new Date(birth.year, birth.month - 1, birth.day, 12, 0);
      if (Number.isNaN(birthDate.getTime())) {
        setError("입력한 날짜가 올바르지 않습니다. 다시 확인해 주세요.");
        setLoading(false);
        return;
      }

      const saju = await calculateSaju(birthDate, gender);
      const archetype = getArchetypeByCode(saju.code, saju.ageGroup);

      let foods = FALLBACK_RESULT.foods;
      let products = FALLBACK_RESULT.products;
      let campaigns: Campaign[] = [];
      try {
        const res = await fetch(`/api/recommendations?code=${saju.code}&ageGroup=${saju.ageGroup}`);
        if (res.ok) {
          const data = await res.json();
          if (data.foods) foods = data.foods;
          if (data.products) products = data.products;
          if (data.campaigns) campaigns = data.campaigns;
        }
      } catch (err) {
        console.warn("Failed to fetch recommendations API:", err);
      }

      setResult({
        code: saju.code,
        animalName: archetype.animal_name,
        pillarNameKo: saju.pillarNameKo,
        mask: archetype.base_traits.mask,
        hashtags: archetype.base_traits.hashtags ?? [],
        displayHook: archetype.displayHook,
        displaySecretPreview: archetype.displaySecretPreview,
        ageGroup: saju.ageGroup as AgeGroup,
        foods,
        products,
        campaigns,
        elementScores: saju.elementScores,
        elementCounts: saju.elementCounts,
        elementBasicPercentages: saju.elementBasicPercentages,
        fourPillars: saju.fourPillars,
        version: saju.version,
        integrity: saju.integrity,
        gangyak: saju.gangyak,
        yongshin: saju.yongshin,
        sipsong: saju.sipsong,
        sibiwoonseong: saju.sibiwoonseong,
        gyeokguk: saju.gyeokguk,
        canonicalFeatures: saju.canonicalFeatures,
        evidence: saju.evidence,
      } as ResultState);
    } catch (err) {
      setError("결과 계산 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      console.error("[SecretPawsFlow]", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <HeroSection showForm={!result} isLoading={loading} onBirthSubmit={handleSubmit} />

      {error && (
        <motion.div
          className="fixed top-4 left-4 right-4 z-30 mx-auto max-w-md rounded-xl bg-red-500/20 border border-red-500/50 px-4 py-3 text-sm text-red-200 flex items-center justify-between gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 text-red-300 hover:text-white"
            aria-label="닫기"
          >
            닫기
          </button>
        </motion.div>
      )}

      {loading && (
        <motion.div
          className="fixed inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="text-center" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">결과를 생성하고 있습니다.</p>
          </motion.div>
        </motion.div>
      )}

      {result && (
        <>
          <section className="py-12 px-4">
            <ResultCard
              archetype={{
                code: result.code,
                animal_name: result.animalName,
                base_traits: {
                  mask: result.mask,
                  hashtags: result.hashtags,
                },
                displayHook: result.displayHook,
                displaySecretPreview: result.displaySecretPreview,
              }}
              pillarNameKo={result.pillarNameKo}
              ageGroup={result.ageGroup}
              elementScores={result.elementScores}
              elementCounts={result.elementCounts}
              elementBasicPercentages={result.elementBasicPercentages}
              fourPillars={result.fourPillars}
              gangyak={result.gangyak}
              yongshin={result.yongshin}
              sipsong={result.sipsong}
              sibiwoonseong={result.sibiwoonseong}
              gyeokguk={result.gyeokguk}
              version={result.version}
              integrity={result.integrity}
              canonicalFeatures={result.canonicalFeatures}
              evidence={result.evidence}
              secretUnlocked={unlockedLv3}
              onUnlockClick={() => setShopOpen(true)}
              onInsufficientJelly={() => setShopOpen(true)}
            />
          </section>

          <CelebritySection pillarCode={result.code} />

          <RecommendationsSection foods={result.foods} products={result.products} campaigns={result.campaigns} animalName={result.animalName} />
          <ShareSection onShareComplete={() => setUnlockedLv2(true)} unlocked={unlockedLv2} />
          <SecretBlur hook={result.displayHook} secretPreview={result.displaySecretPreview} unlocked={unlockedLv3} onPaymentClick={() => setShopOpen(true)} />
        </>
      )}

      <JellyShopModal
        isOpen={shopOpen}
        onClose={() => setShopOpen(false)}
        highlightTier="pro"
        onPurchaseSuccess={() => {
          setUnlockedLv3(true);
          setShopOpen(false);
        }}
      />
    </main>
  );
}
