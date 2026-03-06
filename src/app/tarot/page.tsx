"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, RefreshCw, Save, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { saveAnalysisToHistory } from "@/lib/analysis-history";
import { DrawnTarotCard, buildTarotDeckCards, pickCardsFromDeck } from "@/data/tarotDeck";
import AmbientSoundPortal from "@/components/ui/AmbientSoundPortal";
import ReadingProgressBar from "@/components/ui/ReadingProgressBar";

const SPREAD_POSITIONS = ["과거", "현재", "미래"] as const;

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
    setStatus("카드 뽑는 중...");
    setShowEvidence(false);

    window.setTimeout(() => {
      const deck = buildTarotDeckCards();
      const picked = pickCardsFromDeck(deck, 3);
      const persistPayload = buildPersistPayload(picked);

      setCards([...picked]);
      setIsDrawing(false);
      setStatus("뽑기 완료");

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
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-20">
      <ReadingProgressBar />
      <AmbientSoundPortal />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.2),transparent_40%),radial-gradient(circle_at_80%_40%,rgba(14,165,233,0.16),transparent_45%)]" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          <div className="text-xs text-slate-300 tracking-[0.2em] text-right">과거·현재·미래 전개</div>
        </div>

        <section className="bg-slate-900/55 border border-white/10 rounded-[2rem] p-8 md:p-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/15 border border-indigo-300/30 text-indigo-200 text-xs font-black tracking-[0.2em]">
            <Sparkles className="w-4 h-4" />
            타로 전개
          </div>
          <h1 className="text-3xl md:text-4xl font-black mt-3">과거/현재/미래 전개</h1>
          <p className="text-slate-300 mt-2">3장의 카드로 과거·현재·미래의 흐름을 읽고, 위치별 핵심 신호와 저장 가능한 리포트를 생성합니다.</p>
          <p className="text-[11px] text-slate-400 mt-1">카드덱 버전: TAROT_DB_V1</p>

          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            <article className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <div className="text-xs text-slate-300">역방향</div>
              <div className="text-xl font-black mt-1">{spreadPulse.reversedRate}</div>
            </article>
            <article className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <div className="text-xs text-slate-300">메이저 카드</div>
              <div className="text-xl font-black mt-1">{spreadPulse.majorCount}</div>
            </article>
            <article className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <div className="text-xs text-slate-300">흐름 성향</div>
              <div className={`text-xl font-black mt-1 ${toneColor(spreadPulse.flowTone)}`}>{spreadPulse.flowTone}</div>
            </article>
          </div>

          <button
            onClick={draw}
            disabled={isDrawing}
            className="mt-6 w-full py-5 rounded-full bg-indigo-500 text-white font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isDrawing ? "animate-spin" : ""}`} />
            {isDrawing ? "카드 뽑는 중..." : "3장 뽑기"}
          </button>

          {cards.length > 0 ? (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-emerald-300">{summary}</span>
              <button
                onClick={() => {
                  setCards([]);
                  setStatus("");
                }}
                className="px-4 py-2 rounded-full border border-amber-300/30 text-amber-100 text-xs"
              >
                초기화
              </button>
              <button
                onClick={saveCurrent}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-300/30 text-emerald-100 bg-emerald-500/10"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "저장 중..." : "결과 저장"}
              </button>
            </div>
          ) : null}
          {status ? <p className="mt-3 text-xs text-emerald-300">{status}</p> : null}
        </section>

        {cards.length > 0 ? (
          <>
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

            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid md:grid-cols-3 gap-4">
              {spreadCards.map((card, index) => (
                <motion.article
                  key={`${card.code}-${index}`}
                  className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 space-y-3"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <div className="text-xs text-cyan-300 font-black">{card.position}</div>
                  <div className="text-xl font-black flex items-center justify-between">
                    <span>{card.name_kr}</span>
                    <span className={card.isReversed ? "text-rose-300" : "text-emerald-300"}>{card.isReversed ? "역방향" : "정방향"}</span>
                  </div>
                  <div className="text-xs text-indigo-200">
                    아르카나: {getArcanaLabel(card.arcana)} / 수트: {card.suit ?? "없음"}
                  </div>
                  <Image
                    src={card.imageUrl}
                    alt={card.name_kr}
                    width={320}
                    height={500}
                    className="w-full h-auto rounded-2xl border border-white/10 bg-black/40"
                    unoptimized
                  />
                  <p className="text-sm text-slate-300 leading-relaxed">{card.meaning}</p>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-slate-200">상세</summary>
                    <div className="mt-2 text-slate-400 space-y-1">
                      <p>코드: {card.code}</p>
                      <p>수트: {card.suit ?? "없음"}</p>
                      <p>덱 순번: {index + 1} / 3</p>
                    </div>
                  </details>
                </motion.article>
              ))}
            </motion.section>
          </>
        ) : null}
      </div>
    </main>
  );
}

