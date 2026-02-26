"use client";

import { motion } from "framer-motion";
import { type AnimalArchetype, type AgeGroup } from "@/lib/archetypes";
import { Sparkles, Eye, Lock, Shield, Zap, Heart, Star, TrendingUp, Download, Info } from "lucide-react";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import { useState, useRef } from "react";
import LuxuryToast from "@/components/ui/LuxuryToast";
import { AnimatePresence } from "framer-motion";
import ElementPolygon from "@/components/ui/ElementPolygon";

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

// 오행 색상/설명 맵
const FIVE_ELEMENTS = [
  { name: "木 (목)", color: "from-green-400 to-emerald-500", desc: "성장·인자·활동적", icon: "🌿" },
  { name: "火 (화)", color: "from-red-400 to-orange-500", desc: "열정·표현·리더십", icon: "🔥" },
  { name: "土 (토)", color: "from-yellow-500 to-amber-600", desc: "안정·신뢰·중재력", icon: "🏔️" },
  { name: "金 (금)", color: "from-slate-300 to-zinc-400", desc: "결단·정의·냉철함", icon: "⚔️" },
  { name: "水 (수)", color: "from-blue-400 to-cyan-500", desc: "지혜·유연·적응력", icon: "💧" },
];

function getElementScores(code: string): number[] {
  // Generate deterministic element balance from archetype code
  const base = code.charCodeAt(0) + (code.charCodeAt(1) || 0);
  return FIVE_ELEMENTS.map((_, i) => Math.min(95, Math.max(15, ((base * (i + 7)) % 65) + 20)));
}

function ElementBar({ name, score, color, icon, desc, delay }: {
  name: string; score: number; color: string; icon: string; desc: string; delay: number;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors"
      >
        <span className="text-lg w-7 text-center drop-shadow-md">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-300">{name}</span>
            <Info className="w-3 h-3 text-slate-500" />
          </div>
          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className={`h-full bg-gradient-to-r ${color} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1.2, delay: delay + 0.2, ease: "easeOut" }}
            />
          </div>
        </div>
        <span className="text-xs font-black text-white w-8 text-right drop-shadow-md">{score}%</span>
      </motion.div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-50 bottom-full left-10 mb-2 w-48 p-3 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            <div className="text-xs font-bold text-white mb-1 flex items-center gap-2">
              <span>{icon}</span> {name}의 기운
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              사주에 이 기운이 {score > 60 ? '강하게' : score > 30 ? '적절히' : '약하게'} 작용합니다. {desc} 성향을 의미합니다.
            </p>
            {/* Arrow */}
            <div className="absolute top-full left-4 -mt-px border-4 border-transparent border-t-slate-900/90" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getSecretAnalysis(code: string) {
  const base = code.charCodeAt(0) + (code.charCodeAt(1) || 0);

  const romanceStyles = [
    "밀당의 고수, 하지만 내 사람에겐 직진",
    "상처받기 싫어서 먼저 철벽치는 타입",
    "한번 빠지면 뒤돌아보지 않는 맹목적인 사랑",
    "친구에서 연인으로 스며드는 포근한 연애",
    "외로움을 많이 타서 늘 연락을 기다림"
  ];

  const hiddenDesires = [
    "안정적인 일상탈출, 자극적인 일탈을 꿈꿈",
    "누군가의 감정 쓰레기통이 아닌, 기댈 곳이 필요함",
    "모두에게 인정받고 구속받지 않는 자유",
    "단 한 명의 절대적인 편, 맹목적인 사랑",
    "다 버리고 혼자만의 동굴로 떠나고 싶음"
  ];

  const idealTypes = [
    "말하지 않아도 내 기분을 알아채는 센스쟁이",
    "거짓말을 절대 하지 않는 투명한 사람",
    "나를 리드해주고 결정을 대신 해주는 단호함",
    "사소한 것까지 다 챙겨주는 어른스러운 사람",
    "나와 유머 코드가 완벽하게 일치하는 사람"
  ];

  return {
    romanceStyle: romanceStyles[base % romanceStyles.length],
    dowhaScore: 40 + ((base * 13) % 60), // 40~99
    hiddenDesire: hiddenDesires[(base * 7) % hiddenDesires.length],
    idealType: idealTypes[(base * 11) % idealTypes.length]
  };
}

export default function ResultCard({
  archetype,
  pillarNameKo,
  ageGroup,
  secretUnlocked = false,
  onUnlockClick,
}: ResultCardProps) {
  const [aiText, setAiText] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const ageLabel = ageGroup === "10s" ? "10대" : ageGroup === "20s" ? "20대" : "30대+";
  const elementScores = getElementScores(archetype.code);

  const maxIdx = elementScores.indexOf(Math.max(...elementScores));
  const dominantElement = FIVE_ELEMENTS[maxIdx];
  const secretData = getSecretAnalysis(archetype.code);

  const cardRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a855f7', '#ec4899', '#06b6d4']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a855f7', '#ec4899', '#06b6d4']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleExportImage = async () => {
    if (!cardRef.current) return;
    try {
      setToastMessage("이미지를 생성 중입니다...");
      setShowToast(true);

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#020617", // slate-950
        logging: false,
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `Saju_Secret_${archetype.code}_${Date.now()}.png`;
      link.href = image;
      link.click();

      triggerConfetti();
      setToastMessage("갤러리에 성공적으로 저장되었습니다!");

      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
      setToastMessage("이미지 저장에 실패했습니다.");
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <>
      <LuxuryToast message={toastMessage} isVisible={showToast} />

      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl mx-auto space-y-4 bg-slate-950 p-4 sm:p-6 rounded-[2.5rem]"
      >
        {/* Main Card — Identity */}
        <div className="relative bg-black/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="text-7xl mb-6 relative drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                🐾
              </motion.div>
              <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-400/20 rounded-full text-xs font-mono text-cyan-400 mb-3 tracking-widest shadow-inner">
                CLASS {archetype.code}
              </div>
              <h2 className="text-5xl font-black mb-3 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
                {archetype.animal_name}
              </h2>
              <div className="text-lg font-medium text-slate-300 uppercase tracking-widest">{pillarNameKo} 일주</div>
              <div className="flex justify-center mt-4">
                <div className="px-5 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-full text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <span className="mr-2">👤</span> {ageLabel} 프리미엄 분석
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Social Mask */}
              <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-colors shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">사회적 가면</span>
                </div>
                <p className="text-lg font-bold text-white mb-4 leading-snug">&quot;{archetype.base_traits.mask}&quot;</p>
                <div className="flex flex-wrap gap-2">
                  {archetype.base_traits.hashtags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-black/40 border border-cyan-400/20 rounded-full text-[10px] font-bold text-cyan-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Age-specific Hook */}
              <div className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/5 backdrop-blur-md rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-colors shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">{ageLabel} 전용 인사이트</span>
                </div>
                <p className="text-base font-bold text-amber-100 leading-relaxed">{archetype.displayHook}</p>
              </div>
            </div>

            {/* Secret Preview */}
            <div className="mt-4 p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-colors shadow-inner">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-400 tracking-widest uppercase">19+ 시크릿 미리보기</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed font-medium">{archetype.displaySecretPreview}</p>
            </div>

            {/* AI Personalization Section */}
            <div className="mt-4 p-6 bg-purple-900/20 rounded-2xl border border-purple-500/30 relative overflow-hidden group/ai">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover/ai:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" /> AI 맞춤 팩폭 해설
                  </h3>
                  <p className="text-xs text-slate-400">당신의 나이와 성별을 기반으로 가장 직설적인 해석을 제공합니다.</p>
                </div>
                {!aiText && (
                  <button
                    onClick={async () => {
                      setIsAiLoading(true);
                      try {
                        const res = await fetch('/api/ai/personalize', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ code: archetype.code, ageGroup, gender: 'M' }) // Defaulted fallback
                        });
                        const data = await res.json();
                        if (data.success) {
                          setAiText(data.text);
                        }
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsAiLoading(false);
                      }
                    }}
                    disabled={isAiLoading}
                    className="shrink-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(219,39,119,0.3)] disabled:opacity-50"
                  >
                    {isAiLoading ? '분석 중...' : '맞춤 해설 보기 (300 젤리)'}
                  </button>
                )}
              </div>

              <AnimatePresence>
                {aiText && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-black/40 rounded-xl border border-white/10 text-sm text-slate-200 leading-relaxed font-medium">
                      {aiText}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Card 2 — 오행 밸런스 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white">오행 (五行) 밸런스</h3>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            <div className="shrink-0">
              <ElementPolygon scores={elementScores} size={180} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-bold text-slate-300 mb-2">당신을 지배하는 기운</p>
              <div className="text-2xl font-black mb-1">
                <span className="text-amber-300 drop-shadow-md">{dominantElement.icon} {dominantElement.name}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[200px] mx-auto md:mx-0">
                {dominantElement.desc} 성향이 가장 강하게 나타납니다. 다른 기운들과의 조화가 당신의 핵심 무기가 됩니다.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {FIVE_ELEMENTS.map((el, i) => (
              <ElementBar
                key={el.name}
                name={el.name}
                score={elementScores[i]}
                color={el.color}
                icon={el.icon}
                desc={el.desc}
                delay={i * 0.08}
              />
            ))}
          </div>
        </motion.div>

        {/* Card 3 — 사주 핵심 키워드 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white">사주 핵심 분석</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "대인관계", value: elementScores[0] > 50 ? "사교적" : "내향적", icon: "👥", color: "border-green-500/30 bg-green-900/10" },
              { label: "재물운", value: elementScores[2] > 50 ? "안정 추구" : "모험 투자", icon: "💰", color: "border-yellow-500/30 bg-yellow-900/10" },
              { label: "연애 스타일", value: elementScores[1] > 50 ? "다정다감" : "츤데레", icon: "💕", color: "border-pink-500/30 bg-pink-900/10" },
              { label: "직업 적성", value: elementScores[3] > 50 ? "전문직/기술" : "창의/자유업", icon: "💼", color: "border-blue-500/30 bg-blue-900/10" },
              { label: "스트레스 대처", value: elementScores[4] > 50 ? "유연하게 넘김" : "참다가 폭발", icon: "🧘", color: "border-cyan-500/30 bg-cyan-900/10" },
              { label: "리더십", value: elementScores[1] > 60 ? "카리스마형" : "서포터형", icon: "👑", color: "border-amber-500/30 bg-amber-900/10" },
            ].map((item) => (
              <div key={item.label} className={`p-3 rounded-xl border ${item.color}`}>
                <span className="text-lg">{item.icon}</span>
                <p className="text-xs text-slate-400 mt-1">{item.label}</p>
                <p className="text-sm font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card 4 — 비밀 해금 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="relative overflow-hidden rounded-2xl"
        >
          {!secretUnlocked && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl z-10 flex items-center justify-center border-2 border-dashed border-pink-500/40 rounded-2xl">
              <div className="text-center px-6">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl mb-3"
                >
                  🔒
                </motion.div>
                <h3 className="text-2xl font-bold mb-1 bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                  19+ 비밀 해금
                </h3>
                <p className="text-sm text-slate-400 mb-1">도화살 분석 · 연애 패턴 · 숨겨진 본능</p>
                <p className="text-xs text-slate-500 mb-5">찐 팩폭은 결제 후 공개됩니다</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onUnlockClick}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-xl font-bold text-white shadow-lg"
                >
                  <Lock className="w-4 h-4 inline mr-2" />
                  젤리로 해금하기
                </motion.button>
              </div>
            </div>
          )}

          <div className={`p-6 bg-gradient-to-br from-red-900/20 to-orange-900/15 border border-red-500/25 rounded-2xl ${!secretUnlocked ? "blur-lg" : ""}`}>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-red-400 tracking-wider uppercase">🔞 연애 & 본능 분석</span>
            </div>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex gap-3 items-start">
                <span className="text-pink-400 flex-shrink-0">💋</span>
                <div><span className="text-slate-400">연애 스타일:</span> {secretUnlocked ? secretData.romanceStyle : "해금 필요"}</div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-red-400 flex-shrink-0">🔥</span>
                <div><span className="text-slate-400">도화살 수치:</span> {secretUnlocked ? `${secretData.dowhaScore}%` : "해금 필요"}</div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-purple-400 flex-shrink-0">🌙</span>
                <div><span className="text-slate-400">숨겨진 욕망:</span> {secretUnlocked ? secretData.hiddenDesire : "해금 필요"}</div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-orange-400 flex-shrink-0">⚡</span>
                <div><span className="text-slate-400">이상형 패턴:</span> {secretUnlocked ? secretData.idealType : "해금 필요"}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Badge */}
        <div className="text-center pt-2">
          <span className="inline-block px-5 py-2 bg-cyan-500/10 border border-cyan-400/20 rounded-full text-xs text-cyan-300 font-mono mb-4">
            ✨ DIGITAL ACRYLIC KEYRING · {pillarNameKo} · 60 ARCHETYPES ✨
          </span>

          {/* Export Button inside the ref area so it looks good, but we can hide it during html2canvas if we wanted. Actually outside is better */}
        </div>
      </motion.div>
      <div className="max-w-2xl mx-auto mt-6 px-4 pb-10">
        <button
          onClick={handleExportImage}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-black text-white text-lg shadow-[0_10px_30px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <Download className="w-6 h-6" />
          분석 카드 고화질로 저장하기
        </button>
      </div>
    </>
  );
}
