"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HeroSection } from "./HeroSection";
import { BirthInputForm } from "./BirthInputForm";
import ResultCard from "./ResultCard";
import { ShareSection } from "./ShareSection";
import { SecretBlur } from "./SecretBlur";
import { calculateSaju } from "@/lib/saju";
import { getArchetypeByCode } from "@/lib/archetypes";
import { getFoodRecommendationsByCode } from "@/data/foodRecommendations";
import { getProductRecommendationsByCode } from "@/data/productRecommendations";
import { RecommendationsSection } from "./RecommendationsSection";
import { CelebritySection } from "./CelebritySection";
import { type AgeGroup } from "@/lib/archetypes";

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
  elementScores: number[];
  elementCounts: number[];
  elementBasicPercentages: number[];
  fourPillars: any;
  version: string;
  integrity: string;
};

const FALLBACK_RESULT: ResultState = {
  code: "",
  animalName: "알 수 없음",
  pillarNameKo: "—",
  mask: "결과를 불러오지 못했어요.",
  hashtags: [],
  displayHook: "다시 시도해 주세요.",
  displaySecretPreview: "—",
  ageGroup: "20s",
  foods: [],
  products: [],
  elementScores: [0, 0, 0, 0, 0],
  elementCounts: [0, 0, 0, 0, 0],
  elementBasicPercentages: [0, 0, 0, 0, 0],
  fourPillars: null,
  version: "",
  integrity: ""
};

export function SecretPawsFlow() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unlockedLv2, setUnlockedLv2] = useState(false);
  const [unlockedLv3, setUnlockedLv3] = useState(false);

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
        setError("올바른 날짜를 입력해 주세요.");
        setLoading(false);
        return;
      }

      const saju = await calculateSaju(birthDate, gender);
      const archetype = getArchetypeByCode(saju.code, saju.ageGroup);
      const foods = getFoodRecommendationsByCode(saju.code, saju.ageGroup);
      const products = getProductRecommendationsByCode(saju.code);

      setResult({
        code: saju.code,
        animalName: archetype.animal_name,
        pillarNameKo: saju.pillarNameKo,
        mask: archetype.base_traits.mask,
        hashtags: archetype.base_traits.hashtags ?? [],
        displayHook: archetype.displayHook,
        displaySecretPreview: archetype.displaySecretPreview,
        ageGroup: saju.ageGroup as AgeGroup,
        foods: foods?.length ? foods : FALLBACK_RESULT.foods,
        products: products?.length ? products : FALLBACK_RESULT.products,
        elementScores: saju.elementScores,
        elementCounts: saju.elementCounts,
        elementBasicPercentages: saju.elementBasicPercentages,
        fourPillars: saju.fourPillars,
        version: saju.version,
        integrity: saju.integrity
      });
    } catch (err) {
      setError("결과를 불러오지 못했어요. 다시 시도해 주세요.");
      console.error("[SecretPawsFlow]", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <HeroSection
        showForm={!result}
        isLoading={loading}
        onBirthSubmit={handleSubmit}
      />

      {error && (
        <motion.div
          // ... (fixed middle part)
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
            ✕
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
          <motion.div
            className="text-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">결과를 만드는 중...</p>
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
              } as any}
              pillarNameKo={result.pillarNameKo}
              ageGroup={result.ageGroup}
              elementScores={result.elementScores}
              elementCounts={result.elementCounts}
              elementBasicPercentages={result.elementBasicPercentages}
              fourPillars={result.fourPillars}
              version={result.version}
              integrity={result.integrity}
              secretUnlocked={unlockedLv3}
              onUnlockClick={() => setUnlockedLv3(true)}
            />
          </section>

          {/* NEW: Celebrity Matching Section */}
          <CelebritySection pillarCode={result.code} />

          <RecommendationsSection
            foods={result.foods}
            products={result.products}
            animalName={result.animalName}
          />
          <ShareSection
            onShareComplete={() => setUnlockedLv2(true)}
            unlocked={unlockedLv2}
          />
          <SecretBlur
            hook={result.displayHook}
            secretPreview={result.displaySecretPreview}
            unlocked={unlockedLv3}
            onPaymentClick={() => setUnlockedLv3(true)}
          />
        </>
      )}
    </main>
  );
}
