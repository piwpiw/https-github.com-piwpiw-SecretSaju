"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TarotCardArt from "@/components/tarot/TarotCardArt";
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
import {
  DrawnTarotCard,
  TAROT_TOPICS,
  TarotSuit,
  TarotTopic,
  buildTarotDeckCards,
  buildTopicReading,
  describeSpreadPattern,
  hasFinalConsonant,
  pickCardsFromDeck,
  objectParticle,
} from "@/data/tarotDeck";
import AmbientSoundPortal from "@/components/ui/AmbientSoundPortal";
import ReadingProgressBar from "@/components/ui/ReadingProgressBar";
import AIIntelligenceBadge from "@/components/ui/AIIntelligenceBadge";
import JellyBalance from "@/components/shop/JellyBalance";
import JellyShopModal from "@/components/shop/JellyShopModal";

const SPREAD_POSITIONS = ["과거", "현재", "미래"] as const;

/** 포지션별 안내 — 카드를 뒤집기 전에도 이 자리가 무엇을 뜻하는지 보이게 한다 */
const POSITION_HINTS = ["지금을 만든 배경", "한가운데의 흐름", "이대로면 가는 방향"] as const;

function MysticBackground() {
  const rawId = useId();
  // SVG url(#id) references break on characters like ":" that React's useId emits, so sanitize.
  const noiseId = `tarot-noise-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-blue-600/10 rounded-full blur-[80px]" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <filter id={noiseId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${noiseId})`} />
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

const SUIT_LABELS_KO: Record<string, string> = {
  wands: "완즈",
  cups: "컵",
  swords: "소드",
  pentacles: "펜타클",
};

/** suit 가 없으면 메이저 아르카나다. 카드 뒷면에 원문 그대로 노출되던 값. */
function toSuitLabelKo(suit?: string | null): string {
  if (!suit) return "메이저";
  return SUIT_LABELS_KO[suit] || suit;
}

/** 받침에 따라 이/가 를 고른다 ("소드 기사가", "달이"). undefined 는 중립 처리 */
function topicParticleSafe(word?: string): string {
  if (!word) return "가";
  return hasFinalConsonant(word) === false ? "가" : "이";
}

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
        {/* Front: Card Back — 뒤집기 전에도 이 자리가 무슨 자리인지 보여 준다.
            예전에는 "눌러서 펼치기"만 있어 어느 카드가 과거/현재/미래인지
            뒤집고 나서야 알 수 있었다. */}
        <div className="absolute inset-0 backface-hidden z-10">
          <div className="w-full h-full rounded-[2.5rem] bg-slate-900 border-4 border-indigo-500/20 flex flex-col items-center justify-center space-y-4 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)]" />
            <div className="text-lg font-black tracking-[0.3em] text-indigo-200 break-keep">{card.position}</div>
            <div className="text-[13px] text-slate-400 font-bold break-keep">{POSITION_HINTS[index] ?? ""}</div>
            <div className="w-16 h-16 rounded-full border border-indigo-500/30 flex items-center justify-center animate-spin-slow">
              <Orbit className="w-8 h-8 text-indigo-400 opacity-50" />
            </div>
            <div className="text-[13px] font-black tracking-[0.4em] text-indigo-300 opacity-60 break-keep">눌러서 펼치기</div>
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-indigo-500/20 rounded-tl-xl" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-indigo-500/20 rounded-br-xl" />
          </div>
        </div>

        {/* Back: Card Face */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 z-0">
          <article className={`w-full h-full rounded-[2.5rem] border-2 p-6 space-y-3 shadow-2xl transition-all ${effect.glow} bg-slate-950/90 backdrop-blur-md flex flex-col`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${effect.bg} opacity-20 rounded-[2.5rem]`} />

            <div className="flex items-center justify-between relative z-10 mb-1">
              <div className={`px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[13px] font-black uppercase tracking-widest ${effect.color}`}>
                {card.position}
              </div>
              <Icon className={`w-4 h-4 ${effect.color} opacity-40`} />
            </div>

            <div className="relative z-10">
              <h4 className="text-xl font-black text-white tracking-tight truncate">{card.name_kr}</h4>
              <div className="flex items-center gap-2">
                <span className={`text-[13px] font-black uppercase tracking-widest ${card.isReversed ? "text-rose-400" : "text-emerald-400"}`}>
                  {card.isReversed ? "역방향" : "정방향"}
                </span>
              </div>
            </div>

            <div className="relative flex-1 min-h-[200px] mt-2 mb-2 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-950">
              {/* 그림 파일 없이 SVG 로 직접 그린다. 예전에는 "이미지 준비 중"
                  글자만 떠서 카드를 뽑아도 뽑은 느낌이 안 났다. */}
              <div className="absolute inset-0">
                <TarotCardArt
                  suit={card.suit}
                  number={card.number}
                  rank={card.rank}
                  arcana={card.arcana}
                  isReversed={card.isReversed}
                />
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

            <p className="text-[13px] text-slate-300 leading-relaxed font-medium relative z-10 line-clamp-3">
              {card.meaning}
            </p>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between mt-auto">
              <div className="text-[13px] text-slate-500 font-bold uppercase tracking-widest">
                {toSuitLabelKo(card.suit)}
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
  topic: TarotTopic;
  topicLabel: string;
  summary: string;
  evidence: SpreadEvidence[];
  patternNotes: string[];
  pulse: { reversedRate: string; majorCount: number; reversedCount: number; flowTone: string };
};

function ResultSummaryCard({ title, body, icon: Icon, tone }: { title: string; body: string; icon: any; tone: string }) {
  return (
    <article className={`rounded-[2rem] border p-6 backdrop-blur-xl transition-all hover:scale-[1.02] ${tone}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-white/10">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-sm font-black tracking-[0.2em] uppercase text-white/90">{title}</h3>
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

function buildPersistPayload(cards: DrawnTarotCard[], topic: TarotTopic): PersistPayload {
  const topicLabel = TAROT_TOPICS.find((entry) => entry.key === topic)?.label ?? TAROT_TOPICS[0].label;
  const spreadCards = cards.map((card, index) => ({
    ...card,
    position: SPREAD_POSITIONS[index],
    meaning: buildTopicReading(card, (index % 3) as 0 | 1 | 2, topic),
  }));
  const evidence = buildEvidence(spreadCards);
  const pulse = calcSpreadPulse(spreadCards);
  const summary = cards.length
    ? `${topicLabel} 3장 전개: 역방향 ${pulse.reversedCount}장, 메이저 ${pulse.majorCount}장, 흐름 ${pulse.flowTone}`
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
    deckVersion: "v2-topic",
    topic,
    topicLabel,
    summary,
    evidence,
    patternNotes: describeSpreadPattern(cards),
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
  const [topic, setTopic] = useState<TarotTopic>("today");

  const topicLabel = useMemo(
    () => TAROT_TOPICS.find((entry) => entry.key === topic)?.label ?? TAROT_TOPICS[0].label,
    [topic],
  );
  const spreadCards: SpreadCard[] = useMemo(
    () =>
      cards.map((card, index) => ({
        ...card,
        position: SPREAD_POSITIONS[index],
        meaning: buildTopicReading(card, (index % 3) as 0 | 1 | 2, topic),
      })),
    [cards, topic],
  );
  const spreadEvidence = useMemo(() => buildEvidence(spreadCards), [spreadCards]);
  const spreadPulse = useMemo(() => calcSpreadPulse(spreadCards), [spreadCards]);
  const patternNotes = useMemo(() => describeSpreadPattern(cards), [cards]);

  const draw = () => {
    if (isDrawing) return;
    setIsDrawing(true);
    setStatus("카드를 섞고 있습니다...");
    setShowEvidence(false);
    setRevealedIndices([]);
    setShowResults(false);

    window.setTimeout(() => {
      const deck = buildTarotDeckCards();
      const picked = pickCardsFromDeck(deck, 3);

      setCards([...picked]);
      setIsDrawing(false);
      setStatus("세 장이 놓였습니다. 카드를 눌러 한 장씩 공개하세요.");
      setShowResults(true);
      // 저장은 "리포트 저장" 버튼(saveCurrent)에서만 한다.
      // 예전에는 뽑을 때도 자동 저장해 같은 스프레드가 이력에 두 번 쌓였다.
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
      const payload = buildPersistPayload(cards, topic);
      saveAnalysisToHistory(
        {
          type: "TAROT",
          title: "타로 리딩",
          subtitle: `${topicLabel} 3장 전개`,
          resultPreview: payload.cards.map((card) => card.name).join(", "),
          result: payload,
        },
        {
          // /history 상세보기가 저장된 payload 를 렌더링하도록 개별 기록
          // 상세 경로를 저장한다. 정적 "/tarot" 링크는 빈 새 페이지로 갔다.
          resultUrlFactory: (id) => `/analysis-history/TAROT/${id}`,
        }
      );
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

      <div className="max-w-4xl mx-auto px-0 sm:px-6 py-8 relative z-10">
        <header className="flex items-center justify-between mb-8">
          <button type="button" onClick={() => router.back()} aria-label="뒤로 가기" className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[13px] font-black uppercase tracking-[0.24em] border border-indigo-500/20">
              <Compass className="w-3 h-3" /> RWS 3카드 리딩
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-white leading-none break-keep">타로 인사이트</h1>
          </div>

          <JellyBalance onClick={() => setShopOpen(true)} />
        </header>

        {/* 좁은 화면에서 p-5 sm:p-8(좌우 80px)은 320px 뷰포트의 콘텐츠 폭을 238px까지 깎아
            카드 내용이 잘렸습니다. 모바일에서는 여백을 줄이고 sm 이상에서 원래 값으로 복귀. */}
        <section className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 sm:p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none group-hover:bg-indigo-600/20 transition-all duration-1000" />

          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Orbit className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase text-white break-keep">과거/현재/미래 스프레드</h2>
              <p className="text-[13px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 break-keep">심층 심리 및 운 흐름 분석</p>
            </div>
          </div>

          <p className="text-slate-300 mb-6 leading-relaxed max-w-2xl px-2 break-keep">
            과거·현재·미래 세 장으로 흐름을 읽습니다. 먼저 <strong className="text-indigo-200">무엇이 궁금한지</strong> 골라 주세요 —
            같은 카드라도 질문에 따라 읽는 영역이 달라집니다.
          </p>

          {/* 질문 주제 — 뽑기 전에 고른다. 예전에는 주제 없이 뽑아 해석이
              누구에게나 같은 일반론이었고, 여기에 의미 없는 수치 카드
              (변칙성 0% 등)가 뽑기 전부터 떠 있었다. */}
          <div className="flex flex-wrap gap-2.5 mb-6" role="radiogroup" aria-label="질문 주제 선택">
            {TAROT_TOPICS.map((entry) => (
              <button
                key={entry.key}
                type="button"
                role="radio"
                aria-checked={topic === entry.key}
                onClick={() => setTopic(entry.key)}
                className={`px-4 py-2.5 rounded-2xl border text-sm font-black transition-all break-keep ${
                  topic === entry.key
                    ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-100 shadow-lg shadow-indigo-500/10"
                    : "border-white/10 bg-black/30 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 relative z-10">
            <button
              onClick={draw}
              disabled={isDrawing}
              className="flex-1 py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest shadow-xl hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group/btn break-keep"
            >
              <RefreshCw className={`w-5 h-5 ${isDrawing ? "animate-spin" : "group-hover/btn:rotate-180 transition-transform duration-500"}`} />
              {isDrawing ? "카드 섞는 중..." : "카드 뽑기"}
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
              className="mt-6 text-center text-sm text-indigo-300 font-bold uppercase tracking-widest"
            >
              {status}
            </motion.p>
          )}
        </section>

        {showResults && cards.length > 0 ? (
          <>
            <div className="mt-16 flex items-center gap-4 justify-center">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-500/30" />
              <div className="px-6 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-[13px] font-black text-indigo-300 uppercase tracking-[0.4em] flex items-center gap-2 backdrop-blur-xl shadow-lg shadow-indigo-500/10">
                <Eye className="w-3.5 h-3.5" /> 카드 공개
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-500/30" />
            </div>

            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
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
                    <div className="px-6 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[13px] font-black text-emerald-300 uppercase tracking-[0.4em] flex items-center gap-2 backdrop-blur-xl">
                      <Sparkles className="w-3.5 h-3.5" /> 종합 해석
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-500/30" />
                  </div>

                  {/* 숫자를 보여줄 때는 반드시 그 숫자가 무슨 뜻인지 함께 쓴다.
                      "변칙성 33%" 같은 설명 없는 수치가 이해 불가라는 피드백의 답이다. */}
                  <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <article className="p-4 sm:p-5 rounded-[2rem] border border-white/10 bg-black/40">
                      <div className="text-[13px] text-slate-500 font-black tracking-widest mb-1">역방향 {spreadPulse.reversedCount}장 / 3장</div>
                      <p className="text-sm text-slate-300 leading-relaxed break-keep">
                        {spreadPulse.reversedCount >= 2
                          ? "역방향이 절반을 넘습니다 — 밀어붙이기보다 멈춰서 정비하라는 신호로 읽습니다."
                          : spreadPulse.reversedCount === 1
                            ? "한 장만 역방향입니다 — 해당 자리에서만 속도 조절이 필요합니다."
                            : "전부 정방향입니다 — 카드 의미가 그대로 순하게 흐르는 구성입니다."}
                      </p>
                    </article>
                    <article className="p-4 sm:p-5 rounded-[2rem] border border-white/10 bg-black/40">
                      <div className="text-[13px] text-slate-500 font-black tracking-widest mb-1">메이저 {spreadPulse.majorCount}장 / 3장</div>
                      <p className="text-sm text-slate-300 leading-relaxed break-keep">
                        메이저 아르카나는 일상보다 큰 흐름을 뜻합니다. {spreadPulse.majorCount >= 2
                          ? "두 장 이상이면 인생 단위의 전환이 걸린 스프레드로 읽습니다."
                          : spreadPulse.majorCount === 1
                            ? "한 장이면 그 자리가 이번 리딩의 무게중심입니다."
                            : "없으면 지금 문제는 일상 범위 안에서 움직입니다."}
                      </p>
                    </article>
                    <article className="p-4 sm:p-5 rounded-[2rem] border border-white/10 bg-black/40">
                      <div className={`text-[13px] font-black tracking-widest mb-1 ${toneColor(spreadPulse.flowTone)}`}>흐름 성향 · {spreadPulse.flowTone}</div>
                      <p className="text-sm text-slate-300 leading-relaxed break-keep">
                        {spreadPulse.flowTone === "주의"
                          ? "역방향이 겹쳐 재정비가 우선인 흐름입니다."
                          : spreadPulse.flowTone === "강한 집중"
                            ? "메이저가 겹쳐 큰 결정에 집중되는 흐름입니다."
                            : "쏠림 없이 세 카드를 같은 무게로 읽는 흐름입니다."}
                      </p>
                    </article>
                  </section>

                  <section className="grid gap-6 md:grid-cols-3">
                    <ResultSummaryCard
                      title="🔮 핵심"
                      icon={Star}
                      tone="border-indigo-400/20 bg-indigo-500/5"
                      body={`${topicLabel} 질문의 중심은 현재 자리의 ${spreadCards[1]?.name_kr}입니다. ${spreadCards[1]?.name_kr}${objectParticle(spreadCards[1]?.name_kr ?? "")} 축으로 과거·미래 카드를 이어서 읽으세요.`}
                    />
                    <ResultSummaryCard
                      title="📚 구성 읽기"
                      icon={LayoutGrid}
                      tone="border-cyan-400/20 bg-cyan-500/5"
                      body={patternNotes.join(" ")}
                    />
                    <ResultSummaryCard
                      title="✨ 오늘의 행동"
                      icon={Zap}
                      tone="border-emerald-400/20 bg-emerald-500/5"
                      body={`미래 자리의 ${spreadCards[2]?.name_kr}${topicParticleSafe(spreadCards[2]?.name_kr)} 방향입니다. 아직 정해진 결과가 아니니, 오늘 할 수 있는 한 가지부터 실행해 흐름을 만드세요.`}
                    />
                  </section>

                  <section className="grid md:grid-cols-2 gap-6 items-start">
                    <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-5 sm:p-8 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                          <HistoryIcon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-black tracking-tight text-white uppercase">카드별 근거</h3>
                      </div>

                      <div className="space-y-4">
                        {spreadEvidence.map((entry) => (
                          <motion.div
                            key={entry.title}
                            whileHover={{ x: 5 }}
                            className="group relative pl-6 py-2"
                          >
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                            <div className="text-sm font-black text-slate-100 group-hover:text-indigo-300 transition-colors uppercase tracking-wider">{entry.title}</div>
                            <div className="text-[13px] text-slate-400 mt-1 font-medium">{entry.signal}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-[2.5rem] p-5 sm:p-8 space-y-6 relative overflow-hidden">
                      <Shield className="absolute -bottom-8 -right-8 w-32 h-32 text-indigo-500/5" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-black tracking-tight text-white uppercase">행동 제안</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium break-keep">
                        {spreadPulse.reversedCount >= 2
                          ? `${topicLabel} 문제는 지금 속도를 올릴 때가 아니라 어긋난 부분을 바로잡을 때입니다. 역방향 자리의 문장을 먼저 다시 읽어 보세요.`
                          : `${topicLabel} 문제에서 현재 카드의 문장이 지금 선택의 기준입니다. 미래 카드는 예언이 아니라 지금 흐름의 연장선이니, 마음에 들지 않으면 바꿀 수 있는 시점도 지금입니다.`}
                      </p>
                      <div className="pt-4">
                        {/* 가짜 정밀성 문구("High-Precision Oracle") 대신 실제 방식 명시 */}
                        <div className="text-[13px] text-slate-500 font-bold tracking-[0.08em] break-keep">
                          라이더-웨이트(RWS) 전통 의미 기반의 규칙 해석입니다 — 같은 카드·같은 질문이면 항상 같은 해석이 나옵니다.
                        </div>
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
            className="mt-40 flex flex-col items-center justify-center space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
              <LayoutGrid className="w-20 h-20 text-slate-400 relative z-10" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-black uppercase tracking-[0.5em] text-slate-300">
                의식을 기다리는 중
              </p>
              <p className="text-[13px] text-slate-500 font-bold uppercase tracking-[0.2em]">
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
