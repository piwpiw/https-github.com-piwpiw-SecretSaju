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
import { APP_CONFIG } from "@/config/env";

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

// ?ㅽ뻾 ?됱긽/?ㅻ챸 留?(Fact-based Standard Colors)
const FIVE_ELEMENTS = [
  { name: "??(紐?", color: "from-green-500 to-emerald-600", bg: "bg-emerald-500/20", borderColor: "border-emerald-500/50", textColor: "text-emerald-400", desc: "?깆옣쨌?몄옄쨌?쒕룞??, icon: "?뙼" },
  { name: "??(??", color: "from-red-500 to-rose-600", bg: "bg-rose-500/20", borderColor: "border-rose-500/50", textColor: "text-rose-400", desc: "?댁젙쨌?쒗쁽쨌由щ뜑??, icon: "?뵦" },
  { name: "??(??", color: "from-yellow-400 to-amber-600", bg: "bg-amber-500/20", borderColor: "border-amber-500/50", textColor: "text-amber-400", desc: "?덉젙쨌?좊ː쨌以묒옱??, icon: "?룘截? },
  { name: "??(湲?", color: "from-slate-100 to-zinc-300", bg: "bg-white/10", borderColor: "border-white/30", textColor: "text-white", desc: "寃곕떒쨌?뺤쓽쨌?됱쿋??, icon: "?뷂툘" },
  { name: "麗?(??", color: "from-blue-600 to-indigo-900", bg: "bg-indigo-500/20", borderColor: "border-indigo-500/50", textColor: "text-indigo-400", desc: "吏?쑣룹쑀?걔룹쟻?묐젰", icon: "?뮛" },
];

const STEM_HANJA: Record<string, string> = {
  '媛?: '??, '??: '阿?, '蹂?: '訝?, '??: '訝?, '臾?: '??, '湲?: '藥?, '寃?: '佯?, '??: '渦?, '??: '鶯?, '怨?: '??
};

const BRANCH_HANJA: Record<string, string> = {
  '??: '耶?, '異?: '訝?, '??: '野?, '臾?: '??, '吏?: '渦?, '??: '藥?, '??: '??, '誘?: '??, '??: '??, '??: '??, '??: '??, '??: '雅?
};

const ELEMENT_MAP: Record<string, number> = {
  '紐?: 0, '??: 1, '??: 2, '湲?: 3, '??: 4
};

const STEM_ELEMENTS: Record<string, string> = {
  '媛?: '紐?, '??: '紐?, '蹂?: '??, '??: '??, '臾?: '??, '湲?: '??, '寃?: '湲?, '??: '湲?, '??: '??, '怨?: '??
};

const BRANCH_ELEMENTS: Record<string, string> = {
  '??: '??, '異?: '??, '??: '紐?, '臾?: '紐?, '吏?: '??, '??: '??, '??: '??, '誘?: '??, '??: '湲?, '??: '湲?, '??: '??, '??: '??
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
              <span>{icon}</span> {name}??湲곗슫 ({count}媛?
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              ?ъ＜ 8湲??以?{count}媛쒓? {name}???대떦?섎ŉ, ?꾩껜 湲곗슫 以?{score}%??鍮꾩쨷??李⑥??⑸땲?? {desc} ?깊뼢???섎??⑸땲??
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
    "諛?뱀쓽 怨좎닔, ?섏?留????щ엺?먭쾺 吏곸쭊",
    "?곸쿂諛쏄린 ?レ뼱??癒쇱? 泥좊꼍移섎뒗 ???,
    "?쒕쾲 鍮좎?硫??ㅻ룎?꾨낫吏 ?딅뒗 留밸ぉ?곸씤 ?щ옉",
    "移쒓뎄?먯꽌 ?곗씤?쇰줈 ?ㅻŉ?쒕뒗 ?ш렐???곗븷",
    "?몃줈???留롮씠 ??????곕씫??湲곕떎由?
  ];

  const hiddenDesires = [
    "?덉젙?곸씤 ?쇱긽?덉텧, ?먭레?곸씤 ?쇳깉??轅덇퓞",
    "?꾧뎔媛??媛먯젙 ?곕젅湲고넻???꾨땶, 湲곕뙂 怨녹씠 ?꾩슂??,
    "紐⑤몢?먭쾶 ?몄젙諛쏄퀬 援ъ냽諛쏆? ?딅뒗 ?먯쑀",
    "????紐낆쓽 ?덈??곸씤 ?? 留밸ぉ?곸씤 ?щ옉",
    "??踰꾨━怨??쇱옄留뚯쓽 ?숆뎬濡??좊굹怨??띠쓬"
  ];

  const idealTypes = [
    "留먰븯吏 ?딆븘????湲곕텇???뚯븘梨꾨뒗 ?쇱뒪?곸씠",
    "嫄곗쭞留먯쓣 ?덈? ?섏? ?딅뒗 ?щ챸???щ엺",
    "?섎? 由щ뱶?댁＜怨?寃곗젙??????댁＜???⑦샇??,
    "?ъ냼??寃껉퉴吏 ??梨숆꺼二쇰뒗 ?대Ⅸ?ㅻ윭???щ엺",
    "?섏? ?좊㉧ 肄붾뱶媛 ?꾨꼍?섍쾶 ?쇱튂?섎뒗 ?щ엺"
  ];

  return {
    romanceStyle: romanceStyles[base % romanceStyles.length],
    dowhaScore: 40 + ((base * 13) % 60), // 40~99
    hiddenDesire: hiddenDesires[(base * 7) % hiddenDesires.length],
    idealType: idealTypes[(base * 11) % idealTypes.length]
  };
}

const ELEMENT_REMEDIES: Record<string, { color: string; items: string; direction: string; numbers: string }> = {
  "紐?: { color: "泥?깋, 珥덈줉??, items: "?섎Т ?붾텇, 梨? ?ъ쑀 ?뚰뭹", direction: "?숈そ", numbers: "3, 8" },
  "??: { color: "?곸깋, 遺꾪솉??, items: "諛앹? 議곕챸, ?붾젮???≪꽭?쒕━", direction: "?⑥そ", numbers: "2, 7" },
  "??: { color: "?⑹깋, 釉뚮씪??, items: "?꾩옄湲? ?먯꽍 ?붿컡, ???붾텇", direction: "以묒븰", numbers: "5, 10" },
  "湲?: { color: "諛깆깋, 湲덉깋, ???, items: "湲덉냽 ?μ떊援? 湲덈컲吏, ?쒓퀎", direction: "?쒖そ", numbers: "4, 9" },
  "??: { color: "?묒깋, 泥?깋", items: "?댄빆, 遺꾩닔 ?뚰뭹, 留ㅻ걚?ъ슫 ?뚯옱", direction: "遺곸そ", numbers: "1, 6" }
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

  const ageLabel = ageGroup === "10s" ? "10?" : ageGroup === "20s" ? "20?" : "30?+";

  // Choose which scores to show based on mode
  const elementScores = analysisMode === 'advanced' ? propElementScores : propElementBasicPercentages;
  const elementCounts = propElementCounts;

  const maxIdx = elementScores.indexOf(Math.max(...elementScores));
  const dominantElement = FIVE_ELEMENTS[maxIdx];
  const secretData = getSecretAnalysis(archetype.code);

  const cardRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const shareBaseUrl = (APP_CONFIG.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000").replace(/^https?:\/\//, "");

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
        setToastMessage(data.error || "遺꾩꽍 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
        setShowToast(true);
      }
    } catch (err) {
      console.error(err);
      setToastMessage("?쒕쾭 ?곌껐???ㅽ뙣?덉뒿?덈떎.");
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
      setIsExporting(true); // ?뚰꽣留덊겕 ?쒖떆???뚮뜑留??몃━嫄?

      // ?곹깭 諛섏쁺???꾪븳 誘몄꽭 ?쒕젅??
      await new Promise(resolve => setTimeout(resolve, 100));

      setToastMessage("?몄뒪?洹몃옩 9:16 留욎땄 ?뚮뜑留?以?..");
      setShowToast(true);

      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // 珥덇퀬?붿쭏
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
      setToastMessage("?몄뒪?洹몃옩 留욎땄 ????꾨즺! ?ㅽ넗由ъ뿉 怨듭쑀?대낫?몄슂 ??);

      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
      setToastMessage("?대?吏 ??μ뿉 ?ㅽ뙣?덉뒿?덈떎.");
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsExporting(false); // ?뚮뜑留??먮났
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
            <h1 className="text-4xl font-black text-white tracking-widest uppercase">Secret Paws: ?섏쓽 蹂몃뒫 ?깆쟻??/h1>
            <p className="text-2xl text-slate-400">?뱀떊??蹂몃뒫???꾪궎?띿쿂瑜?留덉＜?섏꽭??/p>
          </div>
        )}

        {/* Main Card ??Identity */}
        <div className={`relative bg-black/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group ${isExporting ? "w-[900px] mt-32" : ""}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700" />

          {/* Luxury Shine Effect */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
            <motion.div
              animate={{
                x: ['-100%', '200%'],
                transition: { duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }
              }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]"
            />
          </div>

          {/* Traditional Lattice Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm2 2h36v36H2V2zm18 1V2h2v36h-2V3zm1-1h18v2H21V2zM2 21v-2h36v2H2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-10">
              <motion.div
                className={`${isExporting ? "text-9xl mb-12" : "text-7xl mb-6"} relative drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]`}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                ?맽
              </motion.div>
              <div className={`inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-400/20 rounded-full font-mono text-cyan-400 mb-3 tracking-widest shadow-inner ${isExporting ? "text-xl px-6 py-2" : "text-xs"}`}>
                鸚⒵찣 (泥쒓린) 쨌 {archetype.code}
              </div>
              <h2 className={`${isExporting ? "text-7xl" : "text-5xl md:text-6xl"} font-black mb-3 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-sm tracking-tight`}>
                {archetype.animal_name}
              </h2>
              <div className={`${isExporting ? "text-3xl" : "text-lg md:text-xl"} font-medium text-slate-200 uppercase tracking-widest`}>{pillarNameKo} ?쇱＜</div>

              {/* Professional Manse-ryeok Grid (8 Characters) */}
              {fourPillars && (
                <div className="mt-8 flex flex-col items-center">
                  <div className="grid grid-cols-4 gap-2 max-w-sm w-full mx-auto relative">
                    {['hour', 'day', 'month', 'year'].map((pKey) => {
                      const p = (fourPillars as any)[pKey];
                      const stemElIdx = STEM_ELEMENTS[p.stem] ? ELEMENT_MAP[STEM_ELEMENTS[p.stem]] : 2;
                      const branchElIdx = BRANCH_ELEMENTS[p.branch] ? ELEMENT_MAP[BRANCH_ELEMENTS[p.branch]] : 2;

                      const isUnknownHour = pKey === 'hour' && isTimeUnknown;

                      return (
                        <div key={pKey} className={`flex flex-col gap-2 relative transition-opacity ${isUnknownHour ? 'opacity-40 grayscale-[50%]' : ''}`}>
                          {isUnknownHour && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500/20 text-red-200 text-[9px] px-2 py-0.5 rounded-full border border-red-500/30 whitespace-nowrap backdrop-blur-sm z-10 font-bold tracking-widest shadow-lg">
                              ?쒓컙誘몄긽
                            </div>
                          )}
                          <span className="text-[10px] text-slate-500 font-bold uppercase">{pKey === 'year' ? '?? : pKey === 'month' ? '?? : pKey === 'day' ? '?? : '??}</span>
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
                      * ?앹떆 誘몄엯??異붿젙???뺤삤 湲곗?). ?쇱＜(訝됪윶) 遺꾩꽍留뚯쑝濡쒕룄 蹂몄쭏 ?뚯븙? 異⑸텇?⑸땲??
                    </p>
                  )}
                </div>
              )}
              {!isExporting && (
                <div className="flex justify-center mt-4">
                  <div className="px-5 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-full text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <span className="mr-2">??/span> {ageLabel} ?꾨━誘몄뾼 ?대챸 遺꾩꽍
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Social Mask */}
              <motion.div whileHover={{ scale: 1.02 }} className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-colors shadow-inner">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <span className="text-sm font-bold text-cyan-400 tracking-widest uppercase">?ы쉶??媛硫?(Social Mask)</span>
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
                  <span className="text-sm font-bold text-amber-400 tracking-widest uppercase">{ageLabel} ?꾩슜 ?몄궗?댄듃</span>
                </div>
                <p className="text-[1.1rem] font-medium text-amber-100 leading-relaxed tracking-wide">{archetype.displayHook}</p>
              </motion.div>
            </div>

            {/* Secret Preview */}
            <div className="mt-4 p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-colors shadow-inner">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-400 tracking-widest uppercase">19+ ?쒗겕由?誘몃━蹂닿린</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed font-medium">{archetype.displaySecretPreview}</p>
            </div>

            {/* AI Personalization Section */}
            <div className="mt-4 p-6 bg-purple-900/20 rounded-2xl border border-purple-500/30 relative overflow-hidden group/ai">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover/ai:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" /> AI 留욎땄 ?⑺룺 ?댁꽕
                  </h3>
                  <p className="text-xs text-slate-400">?뱀떊???섏씠? ?깅퀎??湲곕컲?쇰줈 媛??吏곸꽕?곸씤 ?댁꽍???쒓났?⑸땲??</p>
                </div>
                {!aiText && (
                  <button
                    onClick={handlePersonalize}
                    disabled={isAiLoading}
                    className="shrink-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(219,39,119,0.3)] disabled:opacity-50"
                  >
                    {isAiLoading ? '遺꾩꽍 以?..' : '留욎땄 ?댁꽕 蹂닿린 (300 ?ㅻ━)'}
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

        {/* Card 2 ???ㅽ뻾 諛몃윴??*/}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white">?ㅽ뻾 (雅붻죱) 諛몃윴??/h3>
            </div>
            {/* Calculation Mode Toggle */}
            <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
              <button
                onClick={() => setAnalysisMode('basic')}
                className={`text-[10px] px-3 py-1 rounded-full transition-all ${analysisMode === 'basic' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                湲곕낯
              </button>
              <button
                onClick={() => setAnalysisMode('advanced')}
                className={`text-[10px] px-3 py-1 rounded-full transition-all ${analysisMode === 'advanced' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                吏?κ컙
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            <div className="shrink-0">
              <ElementPolygon scores={elementScores} size={180} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-bold text-slate-300 mb-2">吏諛곗쟻 ?ㅽ뻾 (Dominant Energy)</p>
              <div className="text-2xl font-black mb-1">
                <span className="text-amber-300 drop-shadow-md">{dominantElement.icon} {dominantElement.name}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[200px] mx-auto md:mx-0">
                {dominantElement.desc} ?깊뼢??媛??媛뺥븯寃??섑??⑸땲?? ?ㅻⅨ 湲곗슫?ㅺ낵??議고솕媛 ?뱀떊???듭떖 臾닿린媛 ?⑸땲??
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

        {/* Card: 遺議깊븳 湲곗슫 蹂댁셿 (媛쒖슫踰? */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-indigo-900/30 to-slate-900/30 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white italic">遺議깊븳 湲곗슫 梨꾩슦湲?(媛쒖슫踰?</h3>
          </div>

          <div className="space-y-4">
            {FIVE_ELEMENTS.filter((_, i) => elementCounts[i] === 0).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FIVE_ELEMENTS.filter((_, i) => elementCounts[i] === 0).map((el, i) => {
                  const hangeulName = el.name.includes(" (") ? el.name.split(" (")[1].replace(")", "") : el.name;
                  const remedy = ELEMENT_REMEDIES[hangeulName];
                  if (!remedy) return null;
                  return (
                    <div key={i} className="bg-black/40 rounded-xl p-4 border border-white/5 shadow-inner">
                      <p className="text-xs font-bold text-indigo-400 mb-2 flex items-center gap-2">
                        <span>{el.icon}</span> {el.name} 蹂댁땐 ?붾（??(Remedy)
                      </p>
                      <ul className="space-y-2">
                        <li className="text-[11px] text-slate-300 flex justify-between">
                          <span className="text-slate-500">異붿쿇 ?꾩씠??/span>
                          <span className="font-bold text-white">{remedy.items}</span>
                        </li>
                        <li className="text-[11px] text-slate-300 flex justify-between">
                          <span className="text-slate-500">?됱슫???됱긽</span>
                          <span className="font-bold text-white">{remedy.color}</span>
                        </li>
                        <li className="text-[11px] text-slate-300 flex justify-between">
                          <span className="text-slate-500">湲명븳 諛⑺뼢</span>
                          <span className="font-bold text-white">{remedy.direction}</span>
                        </li>
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4 bg-white/5 rounded-xl border border-dashed border-white/10">
                ?뱀떊? 紐⑤뱺 ?ㅽ뻾??怨④퀬猷?媛뽰텣 ?꾨꼍??洹좏삎???뚯쑀?먯엯?덈떎! ??
              </p>
            )}
            <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <p className="text-[10px] text-slate-400 leading-relaxed text-center">
                &quot;鍮꾩뼱?덈뒗 湲곗슫??梨꾩슦硫??댁쓽 ?먮쫫??諛붾앸땲??quot;<br />
                ?꾨Ц ?곷떞媛?ㅼ씠 1?쒖쐞濡?沅뚯옣?섎뒗 ?뺥넻 紐낅━?숈쟻 蹂댁셿踰뺤엯?덈떎.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Card 3 ???ъ＜ ?듭떖 ?ㅼ썙??*/}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white">?ъ＜ ?듭떖 遺꾩꽍</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "??멸?怨?, value: elementScores[0] > 50 ? "?ш탳?? : "?댄뼢??, icon: "?뫁", color: "border-green-500/30 bg-green-900/10" },
              { label: "?щЪ??, value: elementScores[2] > 50 ? "?덉젙 異붽뎄" : "紐⑦뿕 ?ъ옄", icon: "?뮥", color: "border-yellow-500/30 bg-yellow-900/10" },
              { label: "?곗븷 ?ㅽ???, value: elementScores[1] > 50 ? "?ㅼ젙?ㅺ컧" : "痢ㅻ뜲??, icon: "?뮆", color: "border-pink-500/30 bg-pink-900/10" },
              { label: "吏곸뾽 ?곸꽦", value: elementScores[3] > 50 ? "?꾨Ц吏?湲곗닠" : "李쎌쓽/?먯쑀??, icon: "?뮳", color: "border-blue-500/30 bg-blue-900/10" },
              { label: "?ㅽ듃?덉뒪 愿由?, value: elementScores[4] > 50 ? "?좎뿰?섍쾶 ?섍?" : "李몃떎媛 ??컻", icon: "?쭣", color: "border-cyan-500/30 bg-cyan-900/10" },
              { label: "由щ뜑???좏삎", value: elementScores[1] > 60 ? "移대━?ㅻ쭏?? : "?쒗룷?고삎", icon: "?몣", color: "border-amber-500/30 bg-amber-900/10" },
            ].map((item) => (
              <div key={item.label} className={`p-3 rounded-xl border ${item.color}`}>
                <span className="text-lg">{item.icon}</span>
                <p className="text-xs text-slate-400 mt-1">{item.label}</p>
                <p className="text-sm font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card: 寃⑷뎅 諛????(Fate Structure & Major Luck) */}
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
                <h3 className="font-bold text-white uppercase tracking-widest italic text-sm">?대챸 ?ㅺ퀎 諛????(Destiny Architecture)</h3>
              </div>
              <div className="px-3 py-1 bg-purple-500/20 rounded-full text-[10px] font-black text-purple-300 border border-purple-500/30">
                寃⑷뎅: {gyeokguk.name}
              </div>
            </div>

            {/* Gyeokguk short desc */}
            <div className="mb-10 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
              <p className="text-xs text-slate-300 leading-relaxed italic">
                &ldquo;?뱀떊???怨좊궃 洹몃쫯??<span className="text-purple-400 font-bold">{gyeokguk.name}</span>? ?몄깮??二쇱슂 ?뚮쭏媛 ?섎ŉ, {gyeokguk.yongshin}??湲곗슫??蹂닿컯?????띠쓽 ?깆랬?꾧? 洹밸??붾맗?덈떎.&rdquo;
              </p>
            </div>

            {/* Daewun Cycle */}
            {daewun && (
              <div className="relative">
                <div className="flex items-center gap-2 mb-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  <div className="w-1 h-3 bg-purple-500 rounded-full" />
                  10?????二쇨린 (Major 10-Year Luck Cycle)
                </div>
                <div className="overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
                  <div className="flex gap-3 min-w-[700px]">
                    {daewun.pillars.map((d: any, i: number) => (
                      <div key={i} className="flex-1 flex flex-col items-center bg-black/40 border border-white/5 rounded-2xl p-4 group/un hover:border-purple-500/50 transition-all">
                        <span className="text-[10px] font-black text-slate-500 mb-3">{d.startAge}??/span>
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

        {/* Card 4 ??鍮꾨? ?닿툑 */}
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
                  ?뵏
                </motion.div>
                <h3 className="text-2xl font-bold mb-1 bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                  ?쒗겕由??몄궗?댄듃 (Secret Insight)
                </h3>
                <p className="text-sm text-slate-400 mb-1">?꾪솕??遺꾩꽍 쨌 ?곗븷 ?⑦꽩 쨌 ?④꺼吏?蹂몃뒫</p>
                <p className="text-xs text-slate-500 mb-5">李??⑺룺? 寃곗젣 ??怨듦컻?⑸땲??/p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onUnlockClick}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-xl font-bold text-white shadow-lg"
                >
                  <Lock className="w-4 h-4 inline mr-2" />
                  ?ㅻ━濡??닿툑?섍린
                </motion.button>
              </div>
            </div>
          )}

          <div className={`p-6 bg-gradient-to-br from-red-900/20 to-orange-900/15 border border-red-500/25 rounded-2xl ${!secretUnlocked ? "blur-lg" : ""}`}>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-red-400 tracking-wider uppercase">?뭼 ?곗븷 & ?몄뒪?낇듃 (Instinct)</span>
            </div>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex gap-3 items-start">
                <span className="text-pink-400 flex-shrink-0">?뭼</span>
                <div><span className="text-slate-400">?곗븷 ?ㅽ???</span> {secretUnlocked ? secretData.romanceStyle : "?닿툑 ?꾩슂"}</div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-red-400 flex-shrink-0">?뵦</span>
                <div><span className="text-slate-400">?꾪솕???섏튂:</span> {secretUnlocked ? `${secretData.dowhaScore}%` : "?닿툑 ?꾩슂"}</div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-purple-400 flex-shrink-0">?뙔</span>
                <div><span className="text-slate-400">?④꺼吏??뺣쭩:</span> {secretUnlocked ? secretData.hiddenDesire : "?닿툑 ?꾩슂"}</div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-orange-400 flex-shrink-0">??/span>
                <div><span className="text-slate-400">?댁긽???⑦꽩:</span> {secretUnlocked ? secretData.idealType : "?닿툑 ?꾩슂"}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Badge */}
        <div className="text-center pt-2 pb-4 space-y-3">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500/10 via-white/5 to-purple-500/10 border border-white/10 rounded-full text-[10px] sm:text-xs text-cyan-100 font-bold uppercase tracking-[0.2em] shadow-lg backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Digital Persona Certificate</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-cyan-400/80">{pillarNameKo}</span>
            <Sparkles className="w-3 h-3 text-purple-400" />
          </div>
          {version && integrity && (
            <div className="flex flex-col items-center gap-1">
              <p className="text-[9px] text-slate-600 font-mono tracking-tighter uppercase">
                Engine: {version} 쨌 Model: HIDDEN_WEIGHTED_V1
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
                value={`https://${shareBaseUrl}/?ref=viral_${archetype.code}`}
                size={120}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"}
                className="rounded-lg"
              />
            </div>
            <p className="text-xl font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 px-6 py-2 rounded-full">
              移대찓?쇰줈 ?ㅼ틪?댁꽌 ???숇Ъ ?뺤씤?섍린 ?맽
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
          ?몄뒪? 留욎땄 ?곗폆 ?뚯옣
        </button>
        <button
          onClick={async () => {
            const shareUrl = `https://${shareBaseUrl}/?ref=viral_${archetype.code}`;
            const result = await handleShare('Secret Paws: ?섏쓽 蹂몃뒫 ?깆쟻??, `?섎뒗 [${archetype.animal_name}] ?⑺룺??留욎븯??.. ??蹂몄쭏? 萸붿? ?뺤씤?대킄 ?맽`, shareUrl);

            if (result === 'copied') {
              setToastMessage("怨듭쑀 留곹겕媛 蹂듭궗?섏뿀?듬땲??");
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            } else if (result === 'shared') {
              setToastMessage("移쒓뎄?먭쾶 ?대챸??怨듭쑀?덉뒿?덈떎 ?뵰");
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            }
          }}
          className="flex-1 py-4 bg-white/10 backdrop-blur-md rounded-2xl font-black text-white text-lg border border-white/20 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <Sparkles className="w-6 h-6 text-yellow-400" />
          移쒓뎄 蹂몃뒫 李뚮Ⅴ湲?(怨듭쑀)
        </button>
      </div>
    </>
  );
}



