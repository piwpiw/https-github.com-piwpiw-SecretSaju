"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import BirthInputRetro from "@/components/BirthInputRetro";
import LoadingGlitch from "@/components/LoadingGlitch";
import ResultCard from "@/components/ResultCard";
import { calculateSaju, getPillarNameKo } from "@/lib/saju";
import { getArchetypeByCode } from "@/lib/archetypes";
import JellyShopModal from "@/components/shop/JellyShopModal";

type FlowState = "input" | "loading" | "result";

export default function HomePage() {
  const [flowState, setFlowState] = useState<FlowState>("input");
  const [sajuData, setSajuData] = useState<ReturnType<typeof calculateSaju> | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleBirthSubmit = (data: { year: number; month: number; day: number }) => {
    setFlowState("loading");

    // Simulate loading for UX
    setTimeout(() => {
      const birthDate = new Date(data.year, data.month - 1, data.day);
      const result = calculateSaju(birthDate);
      setSajuData(result);
      setFlowState("result");
    }, 3000); // 3 second glitch loading animation
  };

  const handleUnlockClick = () => {
    setShowShop(true);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRestart = () => {
    setFlowState("input");
    setSajuData(null);
  };

  const archetype = sajuData ? getArchetypeByCode(sajuData.code, sajuData.ageGroup) : null;
  const pillarNameKo = sajuData ? getPillarNameKo(sajuData.pillarIndex) : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Loading State */}
      {flowState === "loading" && (
        <LoadingGlitch onComplete={() => setFlowState("result")} />
      )}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1
            className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
            style={{
              textShadow: "0 0 40px rgba(255, 105, 180, 0.3)",
            }}
          >
            멍냥의 이중생활
          </h1>
          <p className="text-xl text-slate-300 mb-2">Secret Paws</p>
          <p className="text-sm text-slate-400 font-mono">
            Digital Acrylic Keyring Fortune Telling
          </p>
        </motion.div>

        {/* Input Flow */}
        {flowState === "input" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <BirthInputRetro onSubmit={handleBirthSubmit} />

            {/* About Section */}
            <motion.div
              className="mt-12 max-w-2xl mx-auto text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4 text-cyan-400">
                  🎭 사회적 가면 vs 본능
                </h3>
                <p className="text-slate-300 mb-4">
                  60가지 동물 아키타입으로 당신의 이중생활을 폭로합니다.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-4 py-2 bg-pink-500/20 border border-pink-400/30 rounded-full text-sm text-pink-300">
                    #Y2K_디지털_굿즈
                  </span>
                  <span className="px-4 py-2 bg-purple-500/20 border border-purple-400/30 rounded-full text-sm text-purple-300">
                    #팩폭_주의
                  </span>
                  <span className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-sm text-cyan-300">
                    #바이럴_밈
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Result Flow */}
        {flowState === "result" && archetype && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <ResultCard
              archetype={archetype}
              pillarNameKo={pillarNameKo}
              ageGroup={sajuData!.ageGroup}
              onUnlockClick={handleUnlockClick}
            />

            {/* Share Section */}
            <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                📸 친구들한테 공유하기
              </h3>
              <p className="text-slate-300 mb-6">
                나는 {archetype.animal_name}래... {archetype.displaySecretPreview} ㅋㅋㅋ
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => {
                    const w = window as any;
                    if (w.Kakao && w.Kakao.Share) {
                      w.Kakao.Share.sendDefault({
                        objectType: 'feed',
                        content: {
                          title: `나의 이중생활: ${archetype.animal_name}`,
                          description: `${archetype.displaySecretPreview} — 너도 해볼래?`,
                          imageUrl: `${window.location.origin}/og-image.png`,
                          link: {
                            mobileWebUrl: window.location.origin,
                            webUrl: window.location.origin,
                          },
                        },
                        buttons: [
                          {
                            title: '나도 해보기',
                            link: {
                              mobileWebUrl: window.location.origin,
                              webUrl: window.location.origin,
                            },
                          },
                        ],
                      });
                    } else {
                      showToast('카카오 SDK를 불러오는 중입니다...');
                    }
                  }}
                  className="px-6 py-3 bg-yellow-500/20 border border-yellow-400/30 rounded-xl hover:bg-yellow-500/30 hover:scale-105 transition-all"
                >
                  💬 카카오톡 공유
                </button>
                <button
                  onClick={() => {
                    const shareText = `나의 이중생활 결과: ${archetype.animal_name} — ${archetype.displaySecretPreview} 😹`;
                    const shareUrl = window.location.origin;
                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
                      '_blank',
                      'width=550,height=420'
                    );
                  }}
                  className="px-6 py-3 bg-cyan-500/20 border border-cyan-400/30 rounded-xl hover:bg-cyan-500/30 hover:scale-105 transition-all"
                >
                  � 트위터 공유
                </button>
                <button
                  onClick={async () => {
                    const shareText = `🐾 멍냥의 이중생활 결과: ${archetype.animal_name}\n${archetype.displaySecretPreview}\n\n👉 ${window.location.origin}`;
                    try {
                      await navigator.clipboard.writeText(shareText);
                      showToast('📋 텍스트가 복사되었어요! 인스타 스토리에 붙여넣기 하세요');
                    } catch {
                      showToast('복사 실패 — 브라우저 설정을 확인해주세요');
                    }
                  }}
                  className="px-6 py-3 bg-pink-500/20 border border-pink-400/30 rounded-xl hover:bg-pink-500/30 hover:scale-105 transition-all"
                >
                  � 인스타 스토리
                </button>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleRestart}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold hover:scale-105 transition-transform"
                >
                  🔄 다시 해보기
                </button>
              </div>
            </div>

            {/* Admin Link */}
            <div className="text-center">
              <a
                href="/admin/test-control"
                className="text-sm text-slate-500 hover:text-cyan-400 transition-colors font-mono"
              >
                🔬 Admin Test Control →
              </a>
            </div>
          </motion.div>
        )}
      </div>

      {/* Jelly Shop Modal */}
      <JellyShopModal
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        onPurchaseSuccess={(jellies) => {
          setShowShop(false);
          showToast(`🎉 젤리 ${jellies}개가 충전되었습니다!`);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-slate-800/95 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl text-white text-sm font-medium"
        >
          {toastMessage}
        </motion.div>
      )}

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
