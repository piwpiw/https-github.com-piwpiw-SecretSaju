"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  RefreshCw,
  Save,
  Sparkles,
  Mountain,
  Eye,
  ChevronRight,
  Maximize2,
  Volume2,
  Compass,
  Shield,
  Zap,
  LayoutGrid,
  History as HistoryIcon,
  Orbit,
  Star,
  Flame,
  Droplets,
  Wind,
  CheckCircle2,
  Clock
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { saveAnalysisToHistory } from "@/lib/app/analysis-history";
import { DrawnTarotCard, buildTarotDeckCards, pickCardsFromDeck, TarotSuit } from "@/data/tarotDeck";
import AmbientSoundPortal from "@/components/ui/AmbientSoundPortal";
import ReadingProgressBar from "@/components/ui/ReadingProgressBar";
import AIIntelligenceBadge from "@/components/ui/AIIntelligenceBadge";
import JellyBalance from "@/components/shop/JellyBalance";
import JellyShopModal from "@/components/shop/JellyShopModal";

const SPREAD_POSITIONS = ["과거 (Past)", "현재 (Present)", "미래 (Future)"] as const;

function MysticBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-blue-600/10 rounded-full blur-[80px]" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}
const TAROT_3D_STYLES = `
  .perspective-1000 { perspective: 1000px; }
  .preserve-3d { transform-style: preserve-3d; }
  .backface-hidden { backface-visibility: hidden; }
  .rotate-y-180 { transform: rotateY(180deg); }
  .animate-spin-slow { animation: spin 8s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

function TarotCardFlip({ card, index, isRevealed, onReveal }: { card: SpreadCard, index: number, isRevealed: boolean, onReveal: () => void }) {
  const effect = getSuitEffect(card.suit);
  const Icon = effect.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateY: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, type: "spring", stiffness: 100 }}
      className="perspective-1000 group cursor-pointer"
      onClick={onReveal}
    >
      <motion.div
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full aspect-[2/3.2] preserve-3d transition-transform duration-500"
      >
        {/* Front: Card Back */}
        <div className="absolute inset-0 backface-hidden z-10">
          <div className="w-full h-full rounded-[2.5rem] bg-slate-900 border-4 border-indigo-500/20 flex flex-col items-center justify-center space-y-4 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)]" />
            <div className="w-16 h-16 rounded-full border border-indigo-500/30 flex items-center justify-center animate-spin-slow">
              <Orbit className="w-8 h-8 text-indigo-400 opacity-50" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300 opacity-60">Tap to Reveal</div>
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-indigo-500/20 rounded-tl-xl" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-indigo-500/20 rounded-br-xl" />
          </div>
        </div>

        {/* Back: Card Face */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 z-0">
          <article className={`w-full h-full rounded-[2.5rem] border-2 p-6 space-y-3 shadow-2xl transition-all ${effect.glow} bg-slate-950/90 backdrop-blur-md flex flex-col`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${effect.bg} opacity-20 rounded-[2.5rem]`} />

            <div className="flex items-center justify-between relative z-10 mb-1">
              <div className={`px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest ${effect.color}`}>
                {card.position}
              </div>
              <Icon className={`w-4 h-4 ${effect.color} opacity-40`} />
            </div>

            <div className="relative z-10">
              <h4 className="text-xl font-black text-white italic tracking-tight truncate">{card.name_kr}</h4>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase tracking-widest ${card.isReversed ? "text-rose-400" : "text-emerald-400"}`}>
                  {card.isReversed ? "Reverse" : "Upright"}
                </span>
              </div>
            </div>

            <div className="relative flex-1 min-h-[200px] mt-2 mb-2 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-950">
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <p className="text-[10px] text-slate-600 font-mono text-center opacity-50">
                  Image Pending<br />{card.code}
                </p>
              </div>
              {card.imageUrl ? (
                <Image
                  src={card.imageUrl}
                  alt={card.name_kr}
                  fill
                  className={`object-cover z-10 transition-opacity duration-300 ${card.isReversed ? "rotate-180" : ""}`}
                  unoptimized
                  onError={(e) => {
                    (e.target as HTMLElement).style.opacity = '0';
                  }}
                />
              ) : null}
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed font-medium relative z-10 line-clamp-3">
              {card.meaning}
            </p>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between mt-auto">
              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                {card.suit?.toUpperCase() ?? "MAJOR"}
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            </div>
          </article>
        </div>
      </motion.div>
    </motion.div>
  );
}

type SpreadCard = DrawnTarotCard & {
  position: (typeof SPREAD_POSITIONS)[number];
  meaning: string;
};

type SpreadEvidence = { title: string; tone: string; signal: string };

type PersistPayload = {
  cards: Array<{
    position: string;
    name: string;
    code: string;
    isReversed: boolean;
    suit: string | null;
    meaning: string;
    imageUrl: string;
  }>;
  positions: string[];
  deckVersion: string;
  summary: string;
  evidence: SpreadEvidence[];
  pulse: { reversedRate: string; majorCount: number; reversedCount: number; flowTone: string };
};

function ResultSummaryCard({ title, body, icon: Icon, tone }: { title: string; body: string; icon: any; tone: string }) {
  return (
    <article className={`rounded-[2rem] border p-6 backdrop-blur-xl transition-all hover:scale-[1.02] ${tone}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-white/10">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xs font-black tracking-[0.2em] uppercase text-white/90">{title}</h3>
      </div>
      <p className="text-sm leading-7 text-slate-200 font-medium">{body}</p>
    </article>
  );
}

function getSuitEffect(suit: TarotSuit | null) {
  switch (suit) {
    case "wands": return { color: "text-amber-400", icon: Flame, glow: "shadow-amber-500/20 border-amber-500/30 bg-amber-500/5", bg: "from-amber-600/10 to-transparent" };
    case "cups": return { color: "text-sky-400", icon: Droplets, glow: "shadow-sky-500/20 border-sky-500/30 bg-sky-500/5", bg: "from-sky-600/10 to-transparent" };
    case "swords": return { color: "text-slate-300", icon: Wind, glow: "shadow-slate-400/20 border-slate-400/30 bg-slate-400/5", bg: "from-slate-600/10 to-transparent" };
    case "pentacles": return { color: "text-emerald-400", icon: Mountain, glow: "shadow-emerald-500/20 border-emerald-500/30 bg-emerald-500/5", bg: "from-emerald-600/10 to-transparent" };
    default: return { color: "text-indigo-400", icon: Orbit, glow: "shadow-indigo-500/20 border-indigo-500/30 bg-indigo-500/5", bg: "from-indigo-600/10 to-transparent" };
  }
}

function getArcanaLabel(arcana: string) {
  return arcana === "major" ? "메이저" : "마이너";
}

function buildEvidence(cards: SpreadCard[]): SpreadEvidence[] {
  return cards.map((card) => ({
    title: `${card.position} - ${card.name_kr}`,
    tone: card.arcana === "major" ? "메이저 아르카나" : "마이너 아르카나",
    signal: card.isReversed ? "행동 전 조정 단계가 필요합니다." : "현재 판단이 안정적으로 흐르는 단계입니다.",
  }));
}

function calcSpreadPulse(cards: SpreadCard[]) {
  const reversedCount = cards.filter((card) => card.isReversed).length;
  const majorCount = cards.filter((card) => card.arcana === "major").length;
  const reversedRate = cards.length ? `${Math.round((reversedCount / cards.length) * 100)}%` : "0%";
  const flowTone = reversedCount >= 2 ? "주의" : majorCount >= 2 ? "강한 집중" : "균형";
  return { reversedRate, majorCount, reversedCount, flowTone };
}

function toneColor(tone: string) {
  if (tone === "주의") return "text-rose-300";
  if (tone === "강한 집중") return "text-amber-300";
  return "text-emerald-300";
}

function buildPersistPayload(cards: DrawnTarotCard[]): PersistPayload {
  const spreadCards = cards.map((card, index) => ({
    ...card,
    position: SPREAD_POSITIONS[index],
    meaning: card.isReversed ? card.meaning_reversed : card.meaning_upright,
  }));
  const evidence = buildEvidence(spreadCards);
  const pulse = calcSpreadPulse(spreadCards);
  const summary = cards.length
    ? `3장 전개: 역방향 ${pulse.reversedRate}, 메이저 ${pulse.majorCount} 장, 흐름 ${pulse.flowTone}`
    : "";

  return {
    cards: spreadCards.map((card) => ({
      position: card.position,
      name: card.name_kr,
      code: card.code,
      isReversed: card.isReversed,
      suit: card.suit,
      meaning: card.meaning,
      imageUrl: card.imageUrl,
    })),
    positions: [...SPREAD_POSITIONS],
    deckVersion: "v1",
    summary,
    evidence,
    pulse,
  };
}

export default function TarotPage() {
  const router = useRouter();
  const [isDrawing, setIsDrawing] = useState(false);
  const [cards, setCards] = useState<DrawnTarotCard[]>([]);
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const spreadCards: SpreadCard[] = useMemo(
    () =>
      cards.map((card, index) => ({
        ...card,
        position: SPREAD_POSITIONS[index],
        meaning: card.isReversed ? card.meaning_reversed : card.meaning_upright,
      })),
    [cards],
  );
  const spreadEvidence = useMemo(() => buildEvidence(spreadCards), [spreadCards]);
  const spreadPulse = useMemo(() => calcSpreadPulse(spreadCards), [spreadCards]);
  const summary = useMemo(() => {
    if (!cards.length) return "";
    return `3장 전개: 역방향 ${spreadPulse.reversedRate}, 메이저 ${spreadPulse.majorCount} 장, 흐름 ${spreadPulse.flowTone}`;
  }, [cards.length, spreadPulse]);

  const draw = () => {
    if (isDrawing) return;
    setIsDrawing(true);
    setStatus("운명의 파동을 조율하는 중...");
    setShowEvidence(false);
    setRevealedIndices([]);
    setShowResults(false);

    window.setTimeout(() => {
      const deck = buildTarotDeckCards();
      const picked = pickCardsFromDeck(deck, 3);
      const persistPayload = buildPersistPayload(picked);

      setCards([...picked]);
      setIsDrawing(false);
      setStatus("운명의 신호가 감지되었습니다. 카드를 터치하여 확인하세요.");
      setShowResults(true);

      saveAnalysisToHistory({
        type: "TAROT",
        title: "타로 리딩",
        subtitle: "3장 전개 결과",
        resultUrl: "/tarot",
        resultPreview: persistPayload.cards.map((card) => card.name).join(", "),
        result: persistPayload,
      });
    }, 1200);
  };

  const handleReveal = (index: number) => {
    if (revealedIndices.includes(index)) return;
    setRevealedIndices((prev) => [...prev, index]);
    if (revealedIndices.length === 2) {
      setStatus("모든 운명이 드러났습니다. 심층 해석을 확인하세요.");
    }
  };

  const saveCurrent = () => {
    if (!cards.length || isSaving) return;
    setIsSaving(true);
    try {
      const payload = buildPersistPayload(cards);
      saveAnalysisToHistory({
        type: "TAROT",
        title: "타로 리딩",
        subtitle: "3장 전개 결과",
        resultUrl: "/tarot",
        resultPreview: payload.cards.map((card) => card.name).join(", "),
        result: payload,
      });
      setStatus("저장됨");
    } finally {
      setTimeout(() => setStatus(""), 1200);
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-40 selection:bg-indigo-500/30">
      <style>{TAROT_3D_STYLES}</style>
      <ReadingProgressBar />
      <AmbientSoundPortal />
      <MysticBackground />

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <header className="flex items-center justify-between mb-12">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.24em] border border-indigo-500/20">
              <Compass className="w-3 h-3" /> Tarot Oracle v1.0
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">타로 인사이트</h1>
          </div>

          <JellyBalance onClick={() => setShopOpen(true)} />
        </header>

        <section className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 md:p-14 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none group-hover:bg-indigo-600/20 transition-all duration-1000" />

          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Orbit className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tight uppercase text-white">과거/현재/미래 스프레드</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">심층 심리 및 운 흐름 분석</p>
            </div>
          </div>

          <p className="text-slate-300 mb-10 leading-relaxed max-w-2xl px-2">
            3장의 카드로 당신의 무의식과 현실의 교차점을 읽어냅니다.<br />
            위치별 핵심 신호를 분석하고, 당신의 다음 액션을 위한 직관적 가이드를 생성합니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <article className="p-6 rounded-[2rem] border border-white/10 bg-black/40 text-center">
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">변칙성</div>
              <div className="text-xl font-black text-rose-300">역방향 {spreadPulse.reversedRate}</div>
            </article>
            <article className="p-6 rounded-[2rem] border border-white/10 bg-black/40 text-center">
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">에너지 밀도</div>
              <div className="text-xl font-black text-indigo-300">메이저 {spreadPulse.majorCount}장</div>
            </article>
            <article className="p-6 rounded-[2rem] border border-white/10 bg-black/40 text-center">
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">흐름 성향</div>
              <div className={`text-xl font-black ${toneColor(spreadPulse.flowTone)}`}>{spreadPulse.flowTone}</div>
            </article>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 relative z-10">
            <button
              onClick={draw}
              disabled={isDrawing}
              className="flex-1 py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest shadow-xl hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group/btn"
            >
              <RefreshCw className={`w-5 h-5 ${isDrawing ? "animate-spin" : "group-hover/btn:rotate-180 transition-transform duration-500"}`} />
              {isDrawing ? "조율 중..." : "새로운 운명 전개"}
            </button>

            <AnimatePresence>
              {cards.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={saveCurrent}
                  disabled={isSaving}
                  className="px-8 py-6 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-100 font-black uppercase tracking-widest hover:bg-emerald-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  리포트 저장
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {status && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center text-xs text-indigo-300 font-bold uppercase tracking-widest"
            >
              {status}
            </motion.p>
          )}
        </section>

        {showResults && cards.length > 0 ? (
          <>
            <div className="mt-16 flex items-center gap-4 justify-center">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-500/30" />
              <div className="px-6 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-[10px] font-black text-indigo-300 uppercase tracking-[0.4em] flex items-center gap-2 backdrop-blur-xl shadow-lg shadow-indigo-500/10">
                <Eye className="w-3.5 h-3.5" /> Ritual Revelation
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-500/30" />
            </div>

            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {spreadCards.map((card, index) => (
                <TarotCardFlip
                  key={`${card.code}-${index}`}
                  card={card}
                  index={index}
                  isRevealed={revealedIndices.includes(index)}
                  onReveal={() => handleReveal(index)}
                />
              ))}
            </motion.section>

            <AnimatePresence>
              {revealedIndices.length === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-20 space-y-12"
                >
                  <div className="flex items-center gap-4 justify-center">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-500/30" />
                    <div className="px-6 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-black text-emerald-300 uppercase tracking-[0.4em] flex items-center gap-2 backdrop-blur-xl">
                      <Sparkles className="w-3.5 h-3.5" /> Insight & Analysis
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-500/30" />
                  </div>

                  <section className="grid gap-6 md:grid-cols-3">
                    <ResultSummaryCard
                      title="🔮 The Essence"
                      icon={Star}
                      tone="border-indigo-400/20 bg-indigo-500/5"
                      body={`${spreadCards[1]?.name_kr}를 중심으로 보면, 지금의 당신은 상황을 피하기보다 의미를 읽고 방향을 다시 잡아야 하는 국면에 있습니다.`}
                    />
                    <ResultSummaryCard
                      title="📚 The Insight"
                      icon={LayoutGrid}
                      tone="border-cyan-400/20 bg-cyan-500/5"
                      body={`역방향 비율 ${spreadPulse.reversedRate}, 메이저 ${spreadPulse.majorCount}장의 배열은 흐름을 늦추고 재정렬하라는 신호입니다.`}
                    />
                    <ResultSummaryCard
                      title="✨ The Action"
                      icon={Zap}
                      tone="border-emerald-400/20 bg-emerald-500/5"
                      body={`${spreadCards[2]?.position} 카드는 조급한 단정 대신 오늘 한 가지 작은 실행에 집중할 것을 권합니다.`}
                    />
                  </section>

                  <section className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                          <HistoryIcon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-black italic tracking-tight text-white uppercase">Divine Grounds</h3>
                      </div>

                      <div className="space-y-4">
                        {spreadEvidence.map((entry) => (
                          <motion.div
                            key={entry.title}
                            whileHover={{ x: 5 }}
                            className="group relative pl-6 py-2"
                          >
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                            <div className="text-xs font-black text-slate-100 group-hover:text-indigo-300 transition-colors uppercase tracking-wider">{entry.title}</div>
                            <div className="text-[10px] text-slate-400 mt-1 font-medium">{entry.signal}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
                      <Shield className="absolute -bottom-8 -right-8 w-32 h-32 text-indigo-500/5" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-black italic tracking-tight text-white uppercase">Decision Support</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        분석된 {spreadPulse.majorCount}개의 고차원 아르카나 신호는 당신의 운명이 중대한 전환점에 있음을 시사합니다. 조급함을 버리고 내면의 목소리에 귀를 기울일 때 가장 선명한 길을 찾을 수 있습니다.
                      </p>
                      <div className="pt-4 flex flex-col gap-3">
                        <AIIntelligenceBadge model="TAROT_ENGINE_V2" isEnsemble={true} />
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Validated by High-Precision Oracle Logic</div>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="mt-40 flex flex-col items-center justify-center space-y-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
              <LayoutGrid className="w-20 h-20 text-slate-400 relative z-10" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-black uppercase tracking-[0.5em] text-slate-300 italic">
                Awaiting Ritual
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                신비로운 조언이 당신의 터치를 기다립니다
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <JellyShopModal isOpen={shopOpen} onClose={() => setShopOpen(false)} />
    </main>
  );
}
