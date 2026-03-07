"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  RefreshCw,
  Save,
  Sparkles,
  Compass,
  Shield,
  Zap,
  LayoutGrid,
  History,
  Orbit,
  Star,
  Flame,
  Droplets,
  Wind,
  Mountain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { saveAnalysisToHistory } from "@/lib/analysis-history";
import { DrawnTarotCard, buildTarotDeckCards, pickCardsFromDeck, TarotSuit } from "@/data/tarotDeck";
import AmbientSoundPortal from "@/components/ui/AmbientSoundPortal";
import ReadingProgressBar from "@/components/ui/ReadingProgressBar";
import AIIntelligenceBadge from "@/components/ui/AIIntelligenceBadge";
import JellyBalance from "@/components/shop/JellyBalance";
import JellyShopModal from "@/components/shop/JellyShopModal";

const SPREAD_POSITIONS = ["과거 (Past)", "현재 (Present)", "미래 (Future)"] as const;

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

    window.setTimeout(() => {
      const deck = buildTarotDeckCards();
      const picked = pickCardsFromDeck(deck, 3);
      const persistPayload = buildPersistPayload(picked);

      setCards([...picked]);
      setIsDrawing(false);
      setStatus("운명 전개 완료");

      saveAnalysisToHistory({
        type: "TAROT",
        title: "타로 리딩",
        subtitle: "3장 전개 결과",
        resultUrl: "/tarot",
        resultPreview: persistPayload.cards.map((card) => card.name).join(", "),
        result: persistPayload,
      });
    }, 500);
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
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-40">
      <ReadingProgressBar />
      <AmbientSoundPortal />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.2),transparent_40%),radial-gradient(circle_at_80%_40%,rgba(14,165,233,0.16),transparent_45%)]" />
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />

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

        {cards.length > 0 ? (
          <>
            <div className="mt-12 flex items-center gap-4 justify-center">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
              <div className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] flex items-center gap-2 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" /> Oracle Response
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>

            <section className="mt-10 grid gap-5 md:grid-cols-3">
              <ResultSummaryCard
                title="🔮 The Essence"
                icon={Star}
                tone="border-indigo-400/20 bg-indigo-500/5 shadow-indigo-500/5"
                body={`${spreadCards[1]?.name_kr ?? "현재 카드"}를 중심으로 보면, 지금의 당신은 상황을 피하기보다 의미를 읽고 방향을 다시 잡아야 하는 국면에 있습니다. 표면의 사건보다 내면의 선택 기준이 더 중요하게 작동합니다.`}
              />
              <ResultSummaryCard
                title="📚 The Insight"
                icon={LayoutGrid}
                tone="border-cyan-400/20 bg-cyan-500/5 shadow-cyan-500/5"
                body={`이번 스프레드는 역방향 비율 ${spreadPulse.reversedRate}, 메이저 카드 ${spreadPulse.majorCount}장으로 읽힙니다. 그래서 단순한 운의 등락보다, 흐름을 늦추고 재정렬해야 하는 신호가 함께 들어와 있다고 보는 편이 정확합니다.`}
              />
              <ResultSummaryCard
                title="✨ The Action"
                icon={Zap}
                tone="border-emerald-400/20 bg-emerald-500/5 shadow-emerald-500/5"
                body={`${spreadCards[2]?.position ?? "미래"} 카드가 말하는 핵심은 조급한 단정 대신 작은 실행입니다. 오늘은 결론을 서두르기보다, 마음을 흔드는 한 가지 이슈를 적고 우선순위를 다시 정리하는 행동이 가장 효과적입니다.`}
              />
            </section>

            <section className="mt-8">
              <details className="border border-white/10 rounded-2xl bg-slate-900/45" open={showEvidence}>
                <summary
                  onClick={(event) => {
                    event.preventDefault();
                    setShowEvidence((v) => !v);
                  }}
                  className="cursor-pointer px-4 py-3 text-sm"
                >
                  근거 ({spreadEvidence.length}) {showEvidence ? "접기" : "펼치기"}
                </summary>
                <div className="p-4 space-y-2">
                  {spreadEvidence.map((entry) => (
                    <div key={entry.title} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                      <div className="text-sm font-black text-slate-100">{entry.title}</div>
                      <div className="text-xs text-slate-300 mt-1">분류: {entry.tone}</div>
                      <div className="text-xs text-cyan-300 mt-1">{entry.signal}</div>
                    </div>
                  ))}
                </div>
              </details>
            </section>

            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 grid md:grid-cols-3 gap-8"
            >
              {spreadCards.map((card, index) => {
                const effect = getSuitEffect(card.suit);
                const Icon = effect.icon;
                return (
                  <motion.article
                    key={`${card.code}-${index}`}
                    className={`relative rounded-[2.5rem] border p-6 space-y-4 shadow-2xl transition-all ${effect.glow}`}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${effect.bg} opacity-20 rounded-[2.5rem]`} />

                    <div className="flex items-center justify-between relative z-10">
                      <div className={`px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest ${effect.color}`}>
                        {card.position}
                      </div>
                      <Icon className={`w-5 h-5 ${effect.color} opacity-40`} />
                    </div>

                    <div className="relative z-10">
                      <h4 className="text-2xl font-black text-white italic tracking-tight">{card.name_kr}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${card.isReversed ? "text-rose-400" : "text-emerald-400"}`}>
                          {card.isReversed ? "Reversed (역방향)" : "Upright (정방향)"}
                        </span>
                        <div className={`w-1 h-1 rounded-full ${card.isReversed ? "bg-rose-400" : "bg-emerald-400"} animate-pulse`} />
                      </div>
                    </div>

                    <div className="relative group">
                      <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/20 group-hover:opacity-0 transition-opacity rounded-2xl z-10`} />
                      <Image
                        src={card.imageUrl}
                        alt={card.name_kr}
                        width={320}
                        height={500}
                        className={`w-full h-auto rounded-2xl border border-white/5 bg-black/40 transition-transform duration-500 group-hover:scale-105 ${card.isReversed ? "rotate-180" : ""}`}
                        unoptimized
                      />
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed font-medium relative z-10 min-h-[5rem]">
                      {card.meaning}
                    </p>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        {getArcanaLabel(card.arcana)} / {card.suit?.toUpperCase() ?? "MAJOR"}
                      </div>
                      <AIIntelligenceBadge model="TAROT_AI_V1" isEnsemble={true} />
                    </div>
                  </motion.article>
                );
              })}
            </motion.section>

            <section className="mt-16 text-center space-y-4">
              <Shield className="w-8 h-8 text-indigo-500/40 mx-auto" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] leading-relaxed max-w-lg mx-auto">
                이 결과는 당신의 현재 기운과 무의식의 정렬을 수치화한 것입니다.<br />
                모든 해석은 조언으로 참고하시되, 최종적인 선택의 힘은 당신에게 있습니다.
              </p>
            </section>
          </>
        ) : (
          <div className="mt-20 flex flex-col items-center justify-center space-y-6 opacity-30">
            <LayoutGrid className="w-16 h-16 text-slate-600" />
            <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 italic text-center leading-relaxed">
              Waiting for drawing...<br />신비로운 조언이 당신을 기다립니다.
            </p>
          </div>
        )}
      </div>

      <JellyShopModal isOpen={shopOpen} onClose={() => setShopOpen(false)} />
    </main>
  );
}
