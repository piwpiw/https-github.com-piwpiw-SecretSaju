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
import { QRCodeSVG } from "qrcode.react";
import { useWallet } from "./WalletProvider";
import { handleShare } from "@/lib/share";

interface ResultCardProps {
  archetype: AnimalArchetype & {
    displayHook: string;
    displaySecretPreview: string;
  };
  pillarNameKo: string;
  ageGroup: AgeGroup;
  elementScores: number[]; // Required: Weighted scores [Wood, Fire, Earth, Metal, Water]
  elementCounts: number[]; // Required: Basic counts (0-8)
  elementBasicPercentages: number[]; // Required: Percentages based on counts
  fourPillars?: any; // High precision pillars
  daewun?: any;
  gyeokguk?: any;
  version?: string;
  integrity?: string;
  secretUnlocked?: boolean;
  isTimeUnknown?: boolean;
  onUnlockClick?: () => void;
  onInsufficientJelly?: () => void;
}

// 오행 색상/설명 맵 (Fact-based Standard Colors)
const FIVE_ELEMENTS = [
  { name: "木 (목)", color: "from-green-500 to-emerald-600", bg: "bg-emerald-500/20", borderColor: "border-emerald-500/50", textColor: "text-emerald-400", desc: "성장·인자·활동적", icon: "🌿" },
  { name: "火 (화)", color: "from-red-500 to-rose-600", bg: "bg-rose-500/20", borderColor: "border-rose-500/50", textColor: "text-rose-400", desc: "열정·표현·리더십", icon: "🔥" },
  { name: "土 (토)", color: "from-yellow-400 to-amber-600", bg: "bg-amber-500/20", borderColor: "border-amber-500/50", textColor: "text-amber-400", desc: "안정·신뢰·중재력", icon: "🏔️" },
  { name: "金 (금)", color: "from-slate-100 to-zinc-300", bg: "bg-white/10", borderColor: "border-white/30", textColor: "text-white", desc: "결단·정의·냉철함", icon: "⚔️" },
  { name: "水 (수)", color: "from-blue-600 to-indigo-900", bg: "bg-indigo-500/20", borderColor: "border-indigo-500/50", textColor: "text-indigo-400", desc: "지혜·유연·적응력", icon: "💧" },
];

const STEM_HANJA: Record<string, string> = {
  '갑': '甲', '을': '乙', '병': '丙', '정': '丁', '무': '戊', '기': '己', '경': '庚', '신': '辛', '임': '壬', '계': '癸'
};

const BRANCH_HANJA: Record<string, string> = {
  '자': '子', '축': '丑', '인': '寅', '묘': '卯', '진': '辰', '사': '巳', '오': '午', '미': '未', '신': '申', '유': '酉', '술': '戌', '해': '亥'
};

const ELEMENT_MAP: Record<string, number> = {
  '목': 0, '화': 1, '토': 2, '금': 3, '수': 4
};


function ElementBar({ name, score, color, icon, desc, delay, count }: {
  name: string; score: number; color: string; icon: string; desc: string; delay: number; count: number;
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
            <span className="text-sm font-bold text-slate-200 tracking-wide">{name}</span>
            <Info className="w-4 h-4 text-slate-500 hover:text-cyan-400 transition-colors" />
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden shadow-inner relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-[200%] animate-[shimmer_2s_infinite]" />
            <motion.div
              className={`h-full bg-gradient-to-r ${color} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1.2, delay: delay + 0.2, ease: "easeOut" }}
            />
          </div>
        </div>
        <span className="text-xs font-black text-white w-8 text-right drop-shadow-md">{score.toFixed(1)}%</span>
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
              <span>{icon}</span> {name}의 기운 ({count}개)
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              사주 8글자 중 {count}개가 {name}에 해당하며, 전체 기운 중 {score}%의 비중을 차지합니다. {desc} 성향을 의미합니다.
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

const ELEMENT_REMEDIES: Record<string, { color: string; items: string; direction: string; numbers: string }> = {
  "목": { color: "청색, 초록색", items: "나무 화분, 책, 섬유 소품", direction: "동쪽", numbers: "3, 8" },
  "화": { color: "적색, 분홍색", items: "밝은 조명, 화려한 액세서리", direction: "남쪽", numbers: "2, 7" },
  "토": { color: "황색, 브라운", items: "도자기, 원석 팔찌, 흙 화분", direction: "중앙", numbers: "5, 10" },
  "금": { color: "백색, 금색, 은색", items: "금속 장신구, 금반지, 시계", direction: "서쪽", numbers: "4, 9" },
  "수": { color: "흑색, 청색", items: "어항, 분수 소품, 매끄러운 소재", direction: "북쪽", numbers: "1, 6" }
};

export default function ResultCard({
  archetype,
  pillarNameKo,
  ageGroup,
  secretUnlocked = false,
  onUnlockClick,
  onInsufficientJelly,
  elementScores: propElementScores,
  elementCounts: propElementCounts,
  elementBasicPercentages: propElementBasicPercentages,
  fourPillars,
  daewun,
  gyeokguk,
  version,
  integrity,
  isTimeUnknown
}: ResultCardProps) {
  const [aiText, setAiText] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'basic' | 'advanced'>('advanced');
  const { consumeChuru, churu } = useWallet();

  const ageLabel = ageGroup === "10s" ? "10대" : ageGroup === "20s" ? "20대" : "30대+";

  // Choose which scores to show based on mode
  const elementScores = analysisMode === 'advanced' ? propElementScores : propElementBasicPercentages;
  const elementCounts = propElementCounts;

  const maxIdx = elementScores.indexOf(Math.max(...elementScores));
  const dominantElement = FIVE_ELEMENTS[maxIdx];
  const secretData = getSecretAnalysis(archetype.code);

  const cardRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handlePersonalize = async () => {
    if (churu < 300) {
      onInsufficientJelly?.();
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/personalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: archetype.code, ageGroup, gender: 'M' })
      });

      const data = await res.json();

      if (res.status === 402 || data.code === 'INSUFFICIENT_JELLIES') {
        onInsufficientJelly?.();
        return;
      }

      if (data.success) {
        setAiText(data.text);
        consumeChuru(300); // UI sync
        triggerConfetti();
      } else {
        setToastMessage(data.error || "분석 중 오류가 발생했습니다.");
        setShowToast(true);
      }
    } catch (err) {
      console.error(err);
      setToastMessage("서버 연결에 실패했습니다.");
      setShowToast(true);
    } finally {
      setIsAiLoading(false);
    }
  };

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

  const [isExporting, setIsExporting] = useState(false);

  const handleExportImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true); // 워터마크 표시용 렌더링 트리거

      // 상태 반영을 위한 미세 딜레이
      await new Promise(resolve => setTimeout(resolve, 100));

      setToastMessage("인스타그램 9:16 맞춤 렌더링 중...");
      setShowToast(true);

      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // 초고화질
        backgroundColor: "#020617", // slate-950
        logging: false,
        useCORS: true,
        windowWidth: 1080,
        windowHeight: 1920,
      });

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `Saju_Secret_${archetype.code}_${Date.now()}.png`;
      link.href = image;
      link.click();

      triggerConfetti();
      setToastMessage("인스타그램 맞춤 저장 완료! 스토리에 공유해보세요 ✨");

      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
      setToastMessage("이미지 저장에 실패했습니다.");
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsExporting(false); // 렌더링 원복
    }
  };

  return (
    <>
      <LuxuryToast message={toastMessage} isVisible={showToast} />

      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className={`w-full max-w-4xl mx-auto space-y-6 bg-slate-950/80 backdrop-blur-2xl rounded-[2.5rem] relative ${isExporting ? "w-[1080px] h-[1920px] p-16 flex flex-col justify-center items-center scale-[0.3]" : "p-6 sm:p-8 lg:p-12 border border-white/5 shadow-2xl"
          }`}
        style={isExporting ? { transformOrigin: "top left" } : {}}
      >
        {/* Export Watermark Header */}
        {isExporting && (
          <div className="absolute top-20 left-0 w-full text-center space-y-4">
            <h1 className="text-4xl font-black text-white tracking-widest uppercase">Secret Paws: 나의 본능 성적표</h1>
            <p className="text-2xl text-slate-400">당신의 본능적 아키텍처를 마주하세요</p>
          </div>
        )}

        {/* Main Card — Identity */}
        <div className={`relative bg-black/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group ${isExporting ? "w-[900px] mt-32" : ""}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
          {/* Traditional Lattice Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm2 2h36v36H2V2zm18 1V2h2v36h-2V3zm1-1h18v2H21V2zM2 21v-2h36v2H2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className={`${isExporting ? "text-9xl mb-12" : "text-7xl mb-6"} relative drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]`}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                🐾
              </motion.div>
              <div className={`inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-400/20 rounded-full font-mono text-cyan-400 mb-3 tracking-widest shadow-inner ${isExporting ? "text-xl px-6 py-2" : "text-xs"}`}>
                天機 (천기) · {archetype.code}
              </div>
              <h2 className={`${isExporting ? "text-7xl" : "text-5xl md:text-6xl"} font-black mb-3 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-sm tracking-tight`}>
                {archetype.animal_name}
              </h2>
              <div className={`${isExporting ? "text-3xl" : "text-lg md:text-xl"} font-medium text-slate-200 uppercase tracking-widest`}>{pillarNameKo} 일주</div>

              {/* Professional Manse-ryeok Grid (8 Characters) */}
              {fourPillars && (
                <div className="mt-8 flex flex-col items-center">
                  <div className="grid grid-cols-4 gap-2 max-w-sm w-full mx-auto relative">
                    {['hour', 'day', 'month', 'year'].map((pKey) => {
                      const p = (fourPillars as any)[pKey];
                      const stemElIdx = ELEMENT_MAP[p.stemElement || '토'];
                      const branchElIdx = ELEMENT_MAP[p.branchElement || '토'];

                      const isUnknownHour = pKey === 'hour' && isTimeUnknown;

                      return (
                        <div key={pKey} className={`flex flex-col gap-2 relative transition-opacity ${isUnknownHour ? 'opacity-40 grayscale-[50%]' : ''}`}>
                          {isUnknownHour && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500/20 text-red-200 text-[9px] px-2 py-0.5 rounded-full border border-red-500/30 whitespace-nowrap backdrop-blur-sm z-10 font-bold tracking-widest shadow-lg">
                              시간미상
                            </div>
                          )}
                          <span className="text-[10px] text-slate-500 font-bold uppercase">{pKey === 'year' ? '년' : pKey === 'month' ? '월' : pKey === 'day' ? '일' : '시'}</span>
                          {/* Stem */}
                          <div className={`aspect-square flex flex-col items-center justify-center rounded-xl border ${FIVE_ELEMENTS[stemElIdx].borderColor} ${FIVE_ELEMENTS[stemElIdx].bg} shadow-sm`}>
                            <span className="text-2xl font-black text-white">{STEM_HANJA[p.stem] || p.stem}</span>
                            <span className="text-[9px] font-bold opacity-80 text-white">{p.stem}</span>
                          </div>
                          {/* Branch */}
                          <div className={`aspect-square flex flex-col items-center justify-center rounded-xl border ${FIVE_ELEMENTS[branchElIdx].borderColor} ${FIVE_ELEMENTS[branchElIdx].bg} shadow-sm`}>
                            <span className="text-2xl font-black text-white">{BRANCH_HANJA[p.branch] || p.branch}</span>
                            <span className="text-[9px] font-bold opacity-80 text-white">{p.branch}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {isTimeUnknown && (
                    <p className="text-[10px] text-slate-500 mt-4 max-w-xs leading-relaxed opacity-70">
                      * 생시 미입력(추정시 정오 기준). 삼주(三柱) 분석만으로도 본질 파악은 충분합니다.
                    </p>
                  )}
                </div>
              )}
              {!isExporting && (
                <div className="flex justify-center mt-4">
                  <div className="px-5 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-full text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <span className="mr-2">✨</span> {ageLabel} 프리미엄 운명 분석
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Social Mask */}
              <motion.div whileHover={{ scale: 1.02 }} className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-colors shadow-inner">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <span className="text-sm font-bold text-cyan-400 tracking-widest uppercase">사회적 가면 (Social Mask)</span>
                </div>
                <p className="text-xl font-bold text-white mb-5 leading-relaxed">&quot;{archetype.base_traits.mask}&quot;</p>
                <div className="flex flex-wrap gap-2">
                  {archetype.base_traits.hashtags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-black/40 border border-cyan-400/20 rounded-full text-[10px] font-bold text-cyan-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Age-specific Hook */}
              <motion.div whileHover={{ scale: 1.02 }} className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/5 backdrop-blur-md rounded-2xl border border-amber-500/20 hover:border-amber-500/50 transition-colors shadow-inner">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                  <span className="text-sm font-bold text-amber-400 tracking-widest uppercase">{ageLabel} 전용 인사이트</span>
                </div>
                <p className="text-[1.1rem] font-medium text-amber-100 leading-relaxed tracking-wide">{archetype.displayHook}</p>
              </motion.div>
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
                    onClick={handlePersonalize}
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white">오행 (五行) 밸런스</h3>
            </div>
            {/* Calculation Mode Toggle */}
            <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
              <button
                onClick={() => setAnalysisMode('basic')}
                className={`text-[10px] px-3 py-1 rounded-full transition-all ${analysisMode === 'basic' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                기본
              </button>
              <button
                onClick={() => setAnalysisMode('advanced')}
                className={`text-[10px] px-3 py-1 rounded-full transition-all ${analysisMode === 'advanced' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                지장간
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            <div className="shrink-0">
              <ElementPolygon scores={elementScores} size={180} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-bold text-slate-300 mb-2">지배적 오행 (Dominant Energy)</p>
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
                count={elementCounts[i]}
                color={el.color}
                icon={el.icon}
                desc={el.desc}
                delay={i * 0.08}
              />
            ))}
          </div>
        </motion.div>

        {/* Card: 부족한 기운 보완 (개운법) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-indigo-900/30 to-slate-900/30 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white italic">부족한 기운 채우기 (개운법)</h3>
          </div>

          <div className="space-y-4">
            {FIVE_ELEMENTS.filter((_, i) => elementCounts[i] === 0).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FIVE_ELEMENTS.filter((_, i) => elementCounts[i] === 0).map((el, i) => {
                  const remedy = ELEMENT_REMEDIES[el.name.split(" ")[0]];
                  return (
                    <div key={i} className="bg-black/40 rounded-xl p-4 border border-white/5 shadow-inner">
                      <p className="text-xs font-bold text-indigo-400 mb-2 flex items-center gap-2">
                        <span>{el.icon}</span> {el.name} 보충 솔루션 (Remedy)
                      </p>
                      <ul className="space-y-2">
                        <li className="text-[11px] text-slate-300 flex justify-between">
                          <span className="text-slate-500">추천 아이템</span>
                          <span className="font-bold text-white">{remedy.items}</span>
                        </li>
                        <li className="text-[11px] text-slate-300 flex justify-between">
                          <span className="text-slate-500">행운의 색상</span>
                          <span className="font-bold text-white">{remedy.color}</span>
                        </li>
                        <li className="text-[11px] text-slate-300 flex justify-between">
                          <span className="text-slate-500">길한 방향</span>
                          <span className="font-bold text-white">{remedy.direction}</span>
                        </li>
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4 bg-white/5 rounded-xl border border-dashed border-white/10">
                당신은 모든 오행을 골고루 갖춘 완벽한 균형의 소유자입니다! ✨
              </p>
            )}
            <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <p className="text-[10px] text-slate-400 leading-relaxed text-center">
                &quot;비어있는 기운을 채우면 운의 흐름이 바뀝니다&quot;<br />
                전문 상담가들이 1순위로 권장하는 정통 명리학적 보완법입니다.
              </p>
            </div>
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
              { label: "스트레스 관리", value: elementScores[4] > 50 ? "유연하게 넘김" : "참다가 폭발", icon: "🧘", color: "border-cyan-500/30 bg-cyan-900/10" },
              { label: "리더십 유형", value: elementScores[1] > 60 ? "카리스마형" : "서포터형", icon: "👑", color: "border-amber-500/30 bg-amber-900/10" },
            ].map((item) => (
              <div key={item.label} className={`p-3 rounded-xl border ${item.color}`}>
                <span className="text-lg">{item.icon}</span>
                <p className="text-xs text-slate-400 mt-1">{item.label}</p>
                <p className="text-sm font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card: 격국 및 대운 (Fate Structure & Major Luck) */}
        {gyeokguk && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white uppercase tracking-widest italic text-sm">운명 설계 및 대운 (Destiny Architecture)</h3>
              </div>
              <div className="px-3 py-1 bg-purple-500/20 rounded-full text-[10px] font-black text-purple-300 border border-purple-500/30">
                격국: {gyeokguk.name}
              </div>
            </div>

            {/* Gyeokguk short desc */}
            <div className="mb-10 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
              <p className="text-xs text-slate-300 leading-relaxed italic">
                &ldquo;당신의 타고난 그릇인 <span className="text-purple-400 font-bold">{gyeokguk.name}</span>은 인생의 주요 테마가 되며, {gyeokguk.yongshin}의 기운을 보강할 때 삶의 성취도가 극대화됩니다.&rdquo;
              </p>
            </div>

            {/* Daewun Cycle */}
            {daewun && (
              <div className="relative">
                <div className="flex items-center gap-2 mb-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  <div className="w-1 h-3 bg-purple-500 rounded-full" />
                  10년 대운 주기 (Major 10-Year Luck Cycle)
                </div>
                <div className="overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
                  <div className="flex gap-3 min-w-[700px]">
                    {daewun.pillars.map((d: any, i: number) => (
                      <div key={i} className="flex-1 flex flex-col items-center bg-black/40 border border-white/5 rounded-2xl p-4 group/un hover:border-purple-500/50 transition-all">
                        <span className="text-[10px] font-black text-slate-500 mb-3">{d.startAge}세</span>
                        <div className="flex flex-col gap-1 mb-3">
                          <span className="text-xl font-black text-white">{STEM_HANJA[d.pillar.stem] || d.pillar.stem}</span>
                          <span className="text-xl font-black text-white">{BRANCH_HANJA[d.pillar.branch] || d.pillar.branch}</span>
                        </div>
                        <span className="text-[8px] font-bold text-slate-600 uppercase group-hover/un:text-purple-400 transition-colors">
                          {d.pillar.stem}{d.pillar.branch}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 text-[9px] text-center text-slate-500 font-medium lowercase italic opacity-50">
                  Slide to view your lifetime cosmic shift
                </div>
              </div>
            )}
          </motion.div>
        )}

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
                  시크릿 인사이트 (Secret Insight)
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
              <span className="text-xs font-bold text-red-400 tracking-wider uppercase">💋 연애 & 인스팅트 (Instinct)</span>
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
        <div className="text-center pt-2 space-y-2">
          <span className="inline-block px-5 py-2 bg-cyan-500/10 border border-cyan-400/20 rounded-full text-xs text-cyan-300 font-mono">
            ✨ DIGITAL ACRYLIC KEYRING · {pillarNameKo} · 60 ARCHETYPES ✨
          </span>
          {version && integrity && (
            <div className="flex flex-col items-center gap-1">
              <p className="text-[9px] text-slate-600 font-mono tracking-tighter uppercase">
                Engine: {version} · Model: HIDDEN_WEIGHTED_V1
              </p>
              <p className="text-[7px] text-slate-700 font-mono break-all max-w-[200px] leading-tight">
                INTEGRITY: {integrity}
              </p>
            </div>
          )}
        </div>

        {/* Export Viral Watermark Footer */}
        {isExporting && (
          <div className="absolute bottom-12 left-0 w-full flex flex-col items-center justify-center space-y-6">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <QRCodeSVG
                value={`https://${process.env.NEXT_PUBLIC_BASE_URL || "secret-saju.vercel.app"}/?ref=viral_${archetype.code}`}
                size={120}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"}
                className="rounded-lg"
              />
            </div>
            <p className="text-xl font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 px-6 py-2 rounded-full">
              카메라로 스캔해서 내 동물 확인하기 🐾
            </p>
          </div>
        )}
      </motion.div >
      <div className="max-w-2xl mx-auto mt-6 px-4 pb-10 flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleExportImage}
          className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-black text-white text-lg shadow-[0_10px_30px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <Download className="w-6 h-6" />
          인스타 맞춤 티켓 소장
        </button>
        <button
          onClick={async () => {
            const shareUrl = `https://${process.env.NEXT_PUBLIC_BASE_URL || "secret-saju.vercel.app"}/?ref=viral_${archetype.code}`;
            const result = await handleShare('Secret Paws: 나의 본능 성적표', `나는 [${archetype.animal_name}] 팩폭을 맞았어... 네 본질은 뭔지 확인해봐 🐾`, shareUrl);

            if (result === 'copied') {
              setToastMessage("공유 링크가 복사되었습니다!");
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            } else if (result === 'shared') {
              setToastMessage("친구에게 운명을 공유했습니다 🔮");
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            }
          }}
          className="flex-1 py-4 bg-white/10 backdrop-blur-md rounded-2xl font-black text-white text-lg border border-white/20 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <Sparkles className="w-6 h-6 text-yellow-400" />
          친구 본능 찌르기 (공유)
        </button>
      </div>
    </>
  );
}
