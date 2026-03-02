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

// ?¤í–‰ ?‰ìƒ/?¤ëª… ë§?(Fact-based Standard Colors)
const FIVE_ELEMENTS = [
  { name: "??(ëª?", color: "from-green-500 to-emerald-600", bg: "bg-emerald-500/20", borderColor: "border-emerald-500/50", textColor: "text-emerald-400", desc: "?±ì¥Â·?¸ìÂ·?œë™??, icon: "?Œ¿" },
  { name: "??(??", color: "from-red-500 to-rose-600", bg: "bg-rose-500/20", borderColor: "border-rose-500/50", textColor: "text-rose-400", desc: "?´ì •Â·?œí˜„Â·ë¦¬ë”??, icon: "?”¥" },
  { name: "??(??", color: "from-yellow-400 to-amber-600", bg: "bg-amber-500/20", borderColor: "border-amber-500/50", textColor: "text-amber-400", desc: "?ˆì •Â·? ë¢°Â·ì¤‘ì¬??, icon: "?”ï¸? },
  { name: "??(ê¸?", color: "from-slate-100 to-zinc-300", bg: "bg-white/10", borderColor: "border-white/30", textColor: "text-white", desc: "ê²°ë‹¨Â·?•ì˜Â·?‰ì² ??, icon: "?”ï¸" },
  { name: "æ°?(??", color: "from-blue-600 to-indigo-900", bg: "bg-indigo-500/20", borderColor: "border-indigo-500/50", textColor: "text-indigo-400", desc: "ì§€?œÂ·ìœ ?°Â·ì ?‘ë ¥", icon: "?’§" },
];

const STEM_HANJA: Record<string, string> = {
  'ê°?: '??, '??: 'ä¹?, 'ë³?: 'ä¸?, '??: 'ä¸?, 'ë¬?: '??, 'ê¸?: 'å·?, 'ê²?: 'åº?, '??: 'è¾?, '??: 'å£?, 'ê³?: '??
};

const BRANCH_HANJA: Record<string, string> = {
  '??: 'å­?, 'ì¶?: 'ä¸?, '??: 'å¯?, 'ë¬?: '??, 'ì§?: 'è¾?, '??: 'å·?, '??: '??, 'ë¯?: '??, '??: '??, '??: '??, '??: '??, '??: 'äº?
};

const ELEMENT_MAP: Record<string, number> = {
  'ëª?: 0, '??: 1, '??: 2, 'ê¸?: 3, '??: 4
};

const STEM_ELEMENTS: Record<string, string> = {
  'ê°?: 'ëª?, '??: 'ëª?, 'ë³?: '??, '??: '??, 'ë¬?: '??, 'ê¸?: '??, 'ê²?: 'ê¸?, '??: 'ê¸?, '??: '??, 'ê³?: '??
};

const BRANCH_ELEMENTS: Record<string, string> = {
  '??: '??, 'ì¶?: '??, '??: 'ëª?, 'ë¬?: 'ëª?, 'ì§?: '??, '??: '??, '??: '??, 'ë¯?: '??, '??: 'ê¸?, '??: 'ê¸?, '??: '??, '??: '??
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
              <span>{icon}</span> {name}??ê¸°ìš´ ({count}ê°?
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              ?¬ì£¼ 8ê¸€??ì¤?{count}ê°œê? {name}???´ë‹¹?˜ë©°, ?„ì²´ ê¸°ìš´ ì¤?{score}%??ë¹„ì¤‘??ì°¨ì??©ë‹ˆ?? {desc} ?±í–¥???˜ë??©ë‹ˆ??
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
    "ë°€?¹ì˜ ê³ ìˆ˜, ?˜ì?ë§????¬ëŒ?ê² ì§ì§„",
    "?ì²˜ë°›ê¸° ?«ì–´??ë¨¼ì? ì² ë²½ì¹˜ëŠ” ?€??,
    "?œë²ˆ ë¹ ì?ë©??¤ëŒ?„ë³´ì§€ ?ŠëŠ” ë§¹ëª©?ì¸ ?¬ë‘",
    "ì¹œêµ¬?ì„œ ?°ì¸?¼ë¡œ ?¤ë©°?œëŠ” ?¬ê·¼???°ì• ",
    "?¸ë¡œ?€??ë§ì´ ?€?????°ë½??ê¸°ë‹¤ë¦?
  ];

  const hiddenDesires = [
    "?ˆì •?ì¸ ?¼ìƒ?ˆì¶œ, ?ê·¹?ì¸ ?¼íƒˆ??ê¿ˆê¿ˆ",
    "?„êµ°ê°€??ê°ì • ?°ë ˆê¸°í†µ???„ë‹Œ, ê¸°ëŒˆ ê³³ì´ ?„ìš”??,
    "ëª¨ë‘?ê²Œ ?¸ì •ë°›ê³  êµ¬ì†ë°›ì? ?ŠëŠ” ?ìœ ",
    "????ëª…ì˜ ?ˆë??ì¸ ?? ë§¹ëª©?ì¸ ?¬ë‘",
    "??ë²„ë¦¬ê³??¼ìë§Œì˜ ?™êµ´ë¡?? ë‚˜ê³??¶ìŒ"
  ];

  const idealTypes = [
    "ë§í•˜ì§€ ?Šì•„????ê¸°ë¶„???Œì•„ì±„ëŠ” ?¼ìŠ¤?ì´",
    "ê±°ì§“ë§ì„ ?ˆë? ?˜ì? ?ŠëŠ” ?¬ëª…???¬ëŒ",
    "?˜ë? ë¦¬ë“œ?´ì£¼ê³?ê²°ì •???€???´ì£¼???¨í˜¸??,
    "?¬ì†Œ??ê²ƒê¹Œì§€ ??ì±™ê²¨ì£¼ëŠ” ?´ë¥¸?¤ëŸ¬???¬ëŒ",
    "?˜ì? ? ë¨¸ ì½”ë“œê°€ ?„ë²½?˜ê²Œ ?¼ì¹˜?˜ëŠ” ?¬ëŒ"
  ];

  return {
    romanceStyle: romanceStyles[base % romanceStyles.length],
    dowhaScore: 40 + ((base * 13) % 60), // 40~99
    hiddenDesire: hiddenDesires[(base * 7) % hiddenDesires.length],
    idealType: idealTypes[(base * 11) % idealTypes.length]
  };
}

const ELEMENT_REMEDIES: Record<string, { color: string; items: string; direction: string; numbers: string }> = {
  "ëª?: { color: "ì²?ƒ‰, ì´ˆë¡??, items: "?˜ë¬´ ?”ë¶„, ì±? ?¬ìœ  ?Œí’ˆ", direction: "?™ìª½", numbers: "3, 8" },
  "??: { color: "?ìƒ‰, ë¶„í™??, items: "ë°ì? ì¡°ëª…, ?”ë ¤???¡ì„¸?œë¦¬", direction: "?¨ìª½", numbers: "2, 7" },
  "??: { color: "?©ìƒ‰, ë¸Œë¼??, items: "?„ìê¸? ?ì„ ?”ì°Œ, ???”ë¶„", direction: "ì¤‘ì•™", numbers: "5, 10" },
  "ê¸?: { color: "ë°±ìƒ‰, ê¸ˆìƒ‰, ?€??, items: "ê¸ˆì† ?¥ì‹ êµ? ê¸ˆë°˜ì§€, ?œê³„", direction: "?œìª½", numbers: "4, 9" },
  "??: { color: "?‘ìƒ‰, ì²?ƒ‰", items: "?´í•­, ë¶„ìˆ˜ ?Œí’ˆ, ë§¤ë„?¬ìš´ ?Œì¬", direction: "ë¶ìª½", numbers: "1, 6" }
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

  const ageLabel = ageGroup === "10s" ? "10?€" : ageGroup === "20s" ? "20?€" : "30?€+";

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
        setToastMessage(data.error || "ë¶„ì„ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.");
        setShowToast(true);
      }
    } catch (err) {
      console.error(err);
      setToastMessage("?œë²„ ?°ê²°???¤íŒ¨?ˆìŠµ?ˆë‹¤.");
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
      setIsExporting(true); // ?Œí„°ë§ˆí¬ ?œì‹œ???Œë”ë§??¸ë¦¬ê±?

      // ?íƒœ ë°˜ì˜???„í•œ ë¯¸ì„¸ ?œë ˆ??
      await new Promise(resolve => setTimeout(resolve, 100));

      setToastMessage("?¸ìŠ¤?€ê·¸ë¨ 9:16 ë§ì¶¤ ?Œë”ë§?ì¤?..");
      setShowToast(true);

      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // ì´ˆê³ ?”ì§ˆ
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
      setToastMessage("?¸ìŠ¤?€ê·¸ë¨ ë§ì¶¤ ?€???„ë£Œ! ?¤í† ë¦¬ì— ê³µìœ ?´ë³´?¸ìš” ??);

      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
      setToastMessage("?´ë?ì§€ ?€?¥ì— ?¤íŒ¨?ˆìŠµ?ˆë‹¤.");
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsExporting(false); // ?Œë”ë§??ë³µ
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
            <h1 className="text-4xl font-black text-white tracking-widest uppercase">Secret Paws: ?˜ì˜ ë³¸ëŠ¥ ?±ì ??/h1>
            <p className="text-2xl text-slate-400">?¹ì‹ ??ë³¸ëŠ¥???„í‚¤?ì²˜ë¥?ë§ˆì£¼?˜ì„¸??/p>
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
                ?¾
              </motion.div>
              <div className={`inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-400/20 rounded-full font-mono text-cyan-400 mb-3 tracking-widest shadow-inner ${isExporting ? "text-xl px-6 py-2" : "text-xs"}`}>
                å¤©æ©Ÿ (ì²œê¸°) Â· {archetype.code}
              </div>
              <h2 className={`${isExporting ? "text-7xl" : "text-5xl md:text-6xl"} font-black mb-3 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-sm tracking-tight`}>
                {archetype.animal_name}
              </h2>
              <div className={`${isExporting ? "text-3xl" : "text-lg md:text-xl"} font-medium text-slate-200 uppercase tracking-widest`}>{pillarNameKo} ?¼ì£¼</div>

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
                              ?œê°„ë¯¸ìƒ
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
                      * ?ì‹œ ë¯¸ì…??ì¶”ì •???•ì˜¤ ê¸°ì?). ?¼ì£¼(ä¸‰æŸ±) ë¶„ì„ë§Œìœ¼ë¡œë„ ë³¸ì§ˆ ?Œì•…?€ ì¶©ë¶„?©ë‹ˆ??
                    </p>
                  )}
                </div>
              )}
              {!isExporting && (
                <div className="flex justify-center mt-4">
                  <div className="px-5 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-full text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <span className="mr-2">??/span> {ageLabel} ?„ë¦¬ë¯¸ì—„ ?´ëª… ë¶„ì„
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Social Mask */}
              <motion.div whileHover={{ scale: 1.02 }} className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-colors shadow-inner">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <span className="text-sm font-bold text-cyan-400 tracking-widest uppercase">?¬íšŒ??ê°€ë©?(Social Mask)</span>
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
                  <span className="text-sm font-bold text-amber-400 tracking-widest uppercase">{ageLabel} ?„ìš© ?¸ì‚¬?´íŠ¸</span>
                </div>
                <p className="text-[1.1rem] font-medium text-amber-100 leading-relaxed tracking-wide">{archetype.displayHook}</p>
              </motion.div>
            </div>

            {/* Secret Preview */}
            <div className="mt-4 p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-colors shadow-inner">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-400 tracking-widest uppercase">19+ ?œí¬ë¦?ë¯¸ë¦¬ë³´ê¸°</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed font-medium">{archetype.displaySecretPreview}</p>
            </div>

            {/* AI Personalization Section */}
            <div className="mt-4 p-6 bg-purple-900/20 rounded-2xl border border-purple-500/30 relative overflow-hidden group/ai">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover/ai:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" /> AI ë§ì¶¤ ?©í­ ?´ì„¤
                  </h3>
                  <p className="text-xs text-slate-400">?¹ì‹ ???˜ì´?€ ?±ë³„??ê¸°ë°˜?¼ë¡œ ê°€??ì§ì„¤?ì¸ ?´ì„???œê³µ?©ë‹ˆ??</p>
                </div>
                {!aiText && (
                  <button
                    onClick={handlePersonalize}
                    disabled={isAiLoading}
                    className="shrink-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(219,39,119,0.3)] disabled:opacity-50"
                  >
                    {isAiLoading ? 'ë¶„ì„ ì¤?..' : 'ë§ì¶¤ ?´ì„¤ ë³´ê¸° (300 ?¤ë¦¬)'}
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

        {/* Card 2 ???¤í–‰ ë°¸ëŸ°??*/}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white">?¤í–‰ (äº”è¡Œ) ë°¸ëŸ°??/h3>
            </div>
            {/* Calculation Mode Toggle */}
            <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
              <button
                onClick={() => setAnalysisMode('basic')}
                className={`text-[10px] px-3 py-1 rounded-full transition-all ${analysisMode === 'basic' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                ê¸°ë³¸
              </button>
              <button
                onClick={() => setAnalysisMode('advanced')}
                className={`text-[10px] px-3 py-1 rounded-full transition-all ${analysisMode === 'advanced' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                ì§€?¥ê°„
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            <div className="shrink-0">
              <ElementPolygon scores={elementScores} size={180} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-bold text-slate-300 mb-2">ì§€ë°°ì  ?¤í–‰ (Dominant Energy)</p>
              <div className="text-2xl font-black mb-1">
                <span className="text-amber-300 drop-shadow-md">{dominantElement.icon} {dominantElement.name}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[200px] mx-auto md:mx-0">
                {dominantElement.desc} ?±í–¥??ê°€??ê°•í•˜ê²??˜í??©ë‹ˆ?? ?¤ë¥¸ ê¸°ìš´?¤ê³¼??ì¡°í™”ê°€ ?¹ì‹ ???µì‹¬ ë¬´ê¸°ê°€ ?©ë‹ˆ??
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

        {/* Card: ë¶€ì¡±í•œ ê¸°ìš´ ë³´ì™„ (ê°œìš´ë²? */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-indigo-900/30 to-slate-900/30 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white italic">ë¶€ì¡±í•œ ê¸°ìš´ ì±„ìš°ê¸?(ê°œìš´ë²?</h3>
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
                        <span>{el.icon}</span> {el.name} ë³´ì¶© ?”ë£¨??(Remedy)
                      </p>
                      <ul className="space-y-2">
                        <li className="text-[11px] text-slate-300 flex justify-between">
                          <span className="text-slate-500">ì¶”ì²œ ?„ì´??/span>
                          <span className="font-bold text-white">{remedy.items}</span>
                        </li>
                        <li className="text-[11px] text-slate-300 flex justify-between">
                          <span className="text-slate-500">?‰ìš´???‰ìƒ</span>
                          <span className="font-bold text-white">{remedy.color}</span>
                        </li>
                        <li className="text-[11px] text-slate-300 flex justify-between">
                          <span className="text-slate-500">ê¸¸í•œ ë°©í–¥</span>
                          <span className="font-bold text-white">{remedy.direction}</span>
                        </li>
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4 bg-white/5 rounded-xl border border-dashed border-white/10">
                ?¹ì‹ ?€ ëª¨ë“  ?¤í–‰??ê³¨ê³ ë£?ê°–ì¶˜ ?„ë²½??ê· í˜•???Œìœ ?ì…?ˆë‹¤! ??
              </p>
            )}
            <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <p className="text-[10px] text-slate-400 leading-relaxed text-center">
                &quot;ë¹„ì–´?ˆëŠ” ê¸°ìš´??ì±„ìš°ë©??´ì˜ ?ë¦„??ë°”ë€ë‹ˆ??quot;<br />
                ?„ë¬¸ ?ë‹´ê°€?¤ì´ 1?œìœ„ë¡?ê¶Œì¥?˜ëŠ” ?•í†µ ëª…ë¦¬?™ì  ë³´ì™„ë²•ì…?ˆë‹¤.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Card 3 ???¬ì£¼ ?µì‹¬ ?¤ì›Œ??*/}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white">?¬ì£¼ ?µì‹¬ ë¶„ì„</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "?€?¸ê?ê³?, value: elementScores[0] > 50 ? "?¬êµ?? : "?´í–¥??, icon: "?‘¥", color: "border-green-500/30 bg-green-900/10" },
              { label: "?¬ë¬¼??, value: elementScores[2] > 50 ? "?ˆì • ì¶”êµ¬" : "ëª¨í—˜ ?¬ì", icon: "?’°", color: "border-yellow-500/30 bg-yellow-900/10" },
              { label: "?°ì•  ?¤í???, value: elementScores[1] > 50 ? "?¤ì •?¤ê°" : "ì¸¤ë°??, icon: "?’•", color: "border-pink-500/30 bg-pink-900/10" },
              { label: "ì§ì—… ?ì„±", value: elementScores[3] > 50 ? "?„ë¬¸ì§?ê¸°ìˆ " : "ì°½ì˜/?ìœ ??, icon: "?’¼", color: "border-blue-500/30 bg-blue-900/10" },
              { label: "?¤íŠ¸?ˆìŠ¤ ê´€ë¦?, value: elementScores[4] > 50 ? "? ì—°?˜ê²Œ ?˜ê?" : "ì°¸ë‹¤ê°€ ??°œ", icon: "?§˜", color: "border-cyan-500/30 bg-cyan-900/10" },
              { label: "ë¦¬ë”??? í˜•", value: elementScores[1] > 60 ? "ì¹´ë¦¬?¤ë§ˆ?? : "?œí¬?°í˜•", icon: "?‘‘", color: "border-amber-500/30 bg-amber-900/10" },
            ].map((item) => (
              <div key={item.label} className={`p-3 rounded-xl border ${item.color}`}>
                <span className="text-lg">{item.icon}</span>
                <p className="text-xs text-slate-400 mt-1">{item.label}</p>
                <p className="text-sm font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card: ê²©êµ­ ë°??€??(Fate Structure & Major Luck) */}
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
                <h3 className="font-bold text-white uppercase tracking-widest italic text-sm">?´ëª… ?¤ê³„ ë°??€??(Destiny Architecture)</h3>
              </div>
              <div className="px-3 py-1 bg-purple-500/20 rounded-full text-[10px] font-black text-purple-300 border border-purple-500/30">
                ê²©êµ­: {gyeokguk.name}
              </div>
            </div>

            {/* Gyeokguk short desc */}
            <div className="mb-10 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
              <p className="text-xs text-slate-300 leading-relaxed italic">
                &ldquo;?¹ì‹ ???€ê³ ë‚œ ê·¸ë¦‡??<span className="text-purple-400 font-bold">{gyeokguk.name}</span>?€ ?¸ìƒ??ì£¼ìš” ?Œë§ˆê°€ ?˜ë©°, {gyeokguk.yongshin}??ê¸°ìš´??ë³´ê°•?????¶ì˜ ?±ì·¨?„ê? ê·¹ë??”ë©?ˆë‹¤.&rdquo;
              </p>
            </div>

            {/* Daewun Cycle */}
            {daewun && (
              <div className="relative">
                <div className="flex items-center gap-2 mb-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  <div className="w-1 h-3 bg-purple-500 rounded-full" />
                  10???€??ì£¼ê¸° (Major 10-Year Luck Cycle)
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

        {/* Card 4 ??ë¹„ë? ?´ê¸ˆ */}
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
                  ?”’
                </motion.div>
                <h3 className="text-2xl font-bold mb-1 bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                  ?œí¬ë¦??¸ì‚¬?´íŠ¸ (Secret Insight)
                </h3>
                <p className="text-sm text-slate-400 mb-1">?„í™”??ë¶„ì„ Â· ?°ì•  ?¨í„´ Â· ?¨ê²¨ì§?ë³¸ëŠ¥</p>
                <p className="text-xs text-slate-500 mb-5">ì°??©í­?€ ê²°ì œ ??ê³µê°œ?©ë‹ˆ??/p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onUnlockClick}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-xl font-bold text-white shadow-lg"
                >
                  <Lock className="w-4 h-4 inline mr-2" />
                  ?¤ë¦¬ë¡??´ê¸ˆ?˜ê¸°
                </motion.button>
              </div>
            </div>
          )}

          <div className={`p-6 bg-gradient-to-br from-red-900/20 to-orange-900/15 border border-red-500/25 rounded-2xl ${!secretUnlocked ? "blur-lg" : ""}`}>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-red-400 tracking-wider uppercase">?’‹ ?°ì•  & ?¸ìŠ¤?…íŠ¸ (Instinct)</span>
            </div>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex gap-3 items-start">
                <span className="text-pink-400 flex-shrink-0">?’‹</span>
                <div><span className="text-slate-400">?°ì•  ?¤í???</span> {secretUnlocked ? secretData.romanceStyle : "?´ê¸ˆ ?„ìš”"}</div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-red-400 flex-shrink-0">?”¥</span>
                <div><span className="text-slate-400">?„í™”???˜ì¹˜:</span> {secretUnlocked ? `${secretData.dowhaScore}%` : "?´ê¸ˆ ?„ìš”"}</div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-purple-400 flex-shrink-0">?Œ™</span>
                <div><span className="text-slate-400">?¨ê²¨ì§??•ë§:</span> {secretUnlocked ? secretData.hiddenDesire : "?´ê¸ˆ ?„ìš”"}</div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-orange-400 flex-shrink-0">??/span>
                <div><span className="text-slate-400">?´ìƒ???¨í„´:</span> {secretUnlocked ? secretData.idealType : "?´ê¸ˆ ?„ìš”"}</div>
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
                Engine: {version} Â· Model: HIDDEN_WEIGHTED_V1
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
              ì¹´ë©”?¼ë¡œ ?¤ìº”?´ì„œ ???™ë¬¼ ?•ì¸?˜ê¸° ?¾
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
          ?¸ìŠ¤?€ ë§ì¶¤ ?°ì¼“ ?Œì¥
        </button>
        <button
          onClick={async () => {
            const shareUrl = `https://${shareBaseUrl}/?ref=viral_${archetype.code}`;
            const result = await handleShare('Secret Paws: ?˜ì˜ ë³¸ëŠ¥ ?±ì ??, `?˜ëŠ” [${archetype.animal_name}] ?©í­??ë§ì•˜??.. ??ë³¸ì§ˆ?€ ë­”ì? ?•ì¸?´ë´ ?¾`, shareUrl);

            if (result === 'copied') {
              setToastMessage("ê³µìœ  ë§í¬ê°€ ë³µì‚¬?˜ì—ˆ?µë‹ˆ??");
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            } else if (result === 'shared') {
              setToastMessage("ì¹œêµ¬?ê²Œ ?´ëª…??ê³µìœ ?ˆìŠµ?ˆë‹¤ ?”®");
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            }
          }}
          className="flex-1 py-4 bg-white/10 backdrop-blur-md rounded-2xl font-black text-white text-lg border border-white/20 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <Sparkles className="w-6 h-6 text-yellow-400" />
          ì¹œêµ¬ ë³¸ëŠ¥ ì°Œë¥´ê¸?(ê³µìœ )
        </button>
      </div>
    </>
  );
}



