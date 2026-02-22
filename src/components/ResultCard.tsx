"use client";

import { motion } from "framer-motion";
import { type AnimalArchetype, type AgeGroup } from "@/lib/archetypes";

interface ResultCardProps {
  archetype: AnimalArchetype & {
    displayHook: string;
    displaySecretPreview: string;
  };
  pillarNameKo: string;
  ageGroup: AgeGroup;
  secretUnlocked?: boolean;
  onUnlockClick?: () => void;
}

export default function ResultCard({
  archetype,
  pillarNameKo,
  ageGroup,
  secretUnlocked = false,
  onUnlockClick,
}: ResultCardProps) {
  const ageLabel =
    ageGroup === "10s" ? "10대" : ageGroup === "20s" ? "20대" : "30대+";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Glassmorphism Card */}
      <div
        className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
        }}
      >
        {/* Neon Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-3xl opacity-20 blur-xl"></div>

        <div className="relative z-10">
          {/* Header - Animal Info */}
          <div className="text-center mb-6">
            <motion.div
              className="text-7xl mb-4"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              🐾
            </motion.div>

            <div className="text-sm font-mono text-cyan-400 mb-2">
              {archetype.code}
            </div>

            <h2
              className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
              style={{
                textShadow: "0 0 30px rgba(255, 105, 180, 0.3)",
              }}
            >
              {archetype.animal_name}
            </h2>

            <div className="text-lg text-slate-300">{pillarNameKo}일주</div>
          </div>

          {/* Age Badge */}
          <div className="flex justify-center mb-6">
            <div className="px-4 py-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/50 rounded-full text-sm font-semibold backdrop-blur-sm">
              👤 {ageLabel} 버전
            </div>
          </div>

          {/* Social Mask Section */}
          <div className="mb-6 p-5 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-xs font-semibold text-cyan-400 mb-2 tracking-wide">
              사회적 가면 (Social Mask)
            </div>
            <div
              className="text-2xl font-bold mb-4 text-white"
              style={{
                textShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
              }}
            >
              &quot;{archetype.base_traits.mask}&quot;
            </div>

            <div className="flex flex-wrap gap-2">
              {archetype.base_traits.hashtags.map((tag, idx) => (
                <motion.span
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/40 rounded-full text-sm font-medium text-pink-300 backdrop-blur-sm"
                  style={{
                    boxShadow: "0 0 15px rgba(255, 105, 180, 0.2)",
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Hook Section */}
          <div className="mb-6 p-5 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-2xl border border-yellow-500/30">
            <div className="text-xs font-semibold text-yellow-400 mb-2 tracking-wide">
              ⚡ {ageLabel} 전용 훅
            </div>
            <div className="text-xl font-bold text-yellow-300">
              {archetype.displayHook}
            </div>
          </div>

          {/* Secret Preview */}
          <div className="mb-6 p-5 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30">
            <div className="text-xs font-semibold text-purple-400 mb-2 tracking-wide">
              👀 미리보기
            </div>
            <div className="text-base text-slate-200">
              {archetype.displaySecretPreview}
            </div>
          </div>

          {/* Secret Unlock Section */}
          <div className="relative overflow-hidden rounded-2xl">
            {!secretUnlocked && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-xl z-10 flex items-center justify-center border-2 border-dashed border-pink-500/50 rounded-2xl">
                <div className="text-center px-6">
                  <motion.div
                    className="text-5xl mb-3"
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    🔒
                  </motion.div>
                  <div className="text-2xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                    19+ 비밀 해금
                  </div>
                  <div className="text-sm text-slate-400 mb-4">
                    찐 팩폭은 300원에 공개됩니다
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onUnlockClick}
                    className="px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-xl font-bold text-white shadow-lg hover:shadow-pink-500/50 transition-all"
                    style={{
                      boxShadow: "0 0 30px rgba(255, 105, 180, 0.5)",
                    }}
                  >
                    💳 300원 결제하고 해금하기
                  </motion.button>
                </div>
              </div>
            )}

            <div
              className={`p-6 bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-2xl ${!secretUnlocked ? "blur-lg" : ""
                }`}
            >
              <div className="text-xs font-semibold text-red-400 mb-2 tracking-wide">
                🔞 19+ 찐 팩폭 (Full Secrets)
              </div>
              <div className="text-base text-slate-200 space-y-2">
                <p>
                  • 침대 성향: {secretUnlocked ? "실제 내용 표시" : "해금 필요"}
                </p>
                <p>
                  • 도화살 수치: {secretUnlocked ? "실제 점수 표시" : "해금 필요"}
                </p>
                <p>
                  • 숨겨진 욕망: {secretUnlocked ? "실제 분석 표시" : "해금 필요"}
                </p>
              </div>
            </div>
          </div>

          {/* Y2K Badge */}
          <div className="mt-6 text-center">
            <div
              className="inline-block px-6 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-full text-xs font-mono text-cyan-300 backdrop-blur-sm"
              style={{
                boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
              }}
            >
              ✨ DIGITAL ACRYLIC KEYRING STYLE ✨
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
