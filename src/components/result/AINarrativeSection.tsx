"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Loader2,
  Lock,
  Quote,
  RefreshCw,
  Save,
  Sparkles,
  SplitSquareHorizontal,
  Star,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import JellyShopModal from "@/components/shop/JellyShopModal";
import { useWallet } from "@/components/WalletProvider";
import { saveAnalysisToHistory } from "@/lib/analysis-history";
import {
  getFavoriteReaderIds,
  getFortuneReaderProfiles,
  getLastReaderId,
  getReaderUnlockCost,
  getRecommendedReader,
  getUnlockedReaderIds,
  saveLastReaderId,
  toggleFavoriteReader,
  unlockReader,
  type FortuneReaderProfile,
  type ReaderId,
  type ReaderQueryType,
} from "@/lib/fortune-readers";
import { activateReaderMembership, getReaderMembership } from "@/lib/reader-membership";
import { getReaderExperimentVariant, reorderReadersForExperiment } from "@/lib/reader-experiments";

type DualNarrative = {
  easy: string;
  expert: string;
  action: string;
  hook: string;
  disclaimer: string;
};

interface Props {
  persona: string;
  model: string;
  userName?: string;
  ageGroup?: string;
  tendency?: string;
  rawSajuData?: unknown;
  lineageProfileId?: string;
  evidence?: Array<{ id?: string; title?: string; confidence?: number }>;
  queryType?: ReaderQueryType;
  categoryFocus?: string;
}

function NarrativeCard({
  title,
  body,
  tone,
}: {
  title: string;
  body: string;
  tone: string;
}) {
  return (
    <article className={`rounded-3xl border p-4 ${tone}`}>
      <h4 className="text-xs font-black uppercase tracking-[0.22em] text-white">{title}</h4>
      <p className="mt-3 text-sm leading-7 text-slate-100">{body}</p>
    </article>
  );
}

async function fetchReaderNarrative(params: {
  userName?: string;
  ageGroup?: string;
  tendency?: string;
  rawSajuData?: unknown;
  queryType: ReaderQueryType;
  readerId: string;
  categoryFocus?: string;
  lineageProfileId?: string;
  evidence?: Array<{ id?: string; title?: string; confidence?: number }>;
}) {
  const res = await fetch("/api/persona", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName: params.userName ?? "익명",
      ageGroup: params.ageGroup ?? "20s",
      tendency: params.tendency ?? "Balanced",
      rawSajuData: params.rawSajuData,
      queryType: params.queryType,
      readerId: params.readerId,
      categoryFocus: params.categoryFocus,
      lineageProfileId: params.lineageProfileId,
      evidence: params.evidence,
    }),
  });

  if (!res.ok) {
    throw new Error("API error");
  }

  return res.json();
}

function buildFallbackNarrative(userName: string | undefined, reader: FortuneReaderProfile): DualNarrative {
  return {
    hook: `${reader.heroEmoji} ${reader.name}가 현재 결과를 다시 정리하고 있습니다.`,
    easy: `${userName ?? "사용자"}님은 강점이 분명하지만, 무리하게 속도를 올리기보다 흐름을 읽으면서 움직일 때 더 안정적으로 성과를 냅니다.`,
    expert:
      "현재 결과는 강한 기운과 보완 기운이 함께 작동하는 구조입니다. 하나의 결론보다 우선순위를 어떻게 세우는지가 중요하며, 리더마다 강조점은 달라질 수 있습니다.",
    action: "오늘은 반복되는 패턴 하나만 줄이는 행동부터 시작해 보세요.",
    disclaimer:
      "같은 사주라도 리더의 해석 관점과 특화 분야에 따라 표현이 달라질 수 있습니다. 계산 결과 자체는 동일합니다.",
  };
}

export default function AINarrativeSection({
  persona,
  model,
  userName,
  ageGroup,
  tendency,
  rawSajuData,
  lineageProfileId,
  evidence,
  queryType = "result",
  categoryFocus,
}: Props) {
  const { consumeChuru, churu, isAdmin } = useWallet();
  const availableReaders = useMemo(
    () => reorderReadersForExperiment(getFortuneReaderProfiles(queryType), queryType),
    [queryType],
  );
  const recommendedReader = useMemo(
    () => getRecommendedReader(queryType, categoryFocus, tendency as never),
    [queryType, categoryFocus, tendency],
  );

  const [selectedReaderId, setSelectedReaderId] = useState<ReaderId>(recommendedReader.id);
  const [compareReaderId, setCompareReaderId] = useState<ReaderId | null>(null);
  const [favoriteReaderIds, setFavoriteReaderIds] = useState<ReaderId[]>([]);
  const [unlockedReaderIds, setUnlockedReaderIds] = useState<ReaderId[]>([]);
  const [dualNarrative, setDualNarrative] = useState<DualNarrative | null>(null);
  const [compareNarrative, setCompareNarrative] = useState<DualNarrative | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeModel, setActiveModel] = useState(model);
  const [activeReader, setActiveReader] = useState<FortuneReaderProfile>(recommendedReader);
  const [compareReader, setCompareReader] = useState<FortuneReaderProfile | null>(null);
  const [error, setError] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [membershipActive, setMembershipActive] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [experimentVariant, setExperimentVariant] = useState<"control" | "easy_first">("control");

  useEffect(() => {
    const lastReaderId = getLastReaderId(queryType);
    const nextReader =
      availableReaders.find((reader) => reader.id === lastReaderId) ??
      availableReaders.find((reader) => reader.id === recommendedReader.id) ??
      recommendedReader;
    setSelectedReaderId(nextReader.id);
    setActiveReader(nextReader);
    setFavoriteReaderIds(getFavoriteReaderIds());
    setUnlockedReaderIds(getUnlockedReaderIds());
    setMembershipActive(getReaderMembership().active);
    setExperimentVariant(getReaderExperimentVariant());
  }, [availableReaders, queryType, recommendedReader]);

  const fetchNarratives = async (primaryReaderId = selectedReaderId, secondaryReaderId = compareReaderId) => {
    setLoading(true);
    setError(false);

    try {
      const primary = await fetchReaderNarrative({
        userName,
        ageGroup,
        tendency,
        rawSajuData,
        queryType,
        readerId: primaryReaderId,
        categoryFocus,
        lineageProfileId,
        evidence,
      });

      setDualNarrative(primary.dualNarrative);
      setActiveReader(primary.reader);
      if (primary.routing?.selectedModel) {
        setActiveModel(primary.routing.selectedModel);
      }
      saveLastReaderId(queryType, primaryReaderId);

      if (secondaryReaderId) {
        const secondary = await fetchReaderNarrative({
          userName,
          ageGroup,
          tendency,
          rawSajuData,
          queryType,
          readerId: secondaryReaderId,
          categoryFocus,
          lineageProfileId,
          evidence,
        });
        setCompareNarrative(secondary.dualNarrative);
        setCompareReader(secondary.reader);
      } else {
        setCompareNarrative(null);
        setCompareReader(null);
      }
    } catch {
      const selected = availableReaders.find((reader) => reader.id === primaryReaderId) ?? recommendedReader;
      setActiveReader(selected);
      setDualNarrative(buildFallbackNarrative(userName, selected));
      setCompareNarrative(null);
      setCompareReader(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rawSajuData) {
      void fetchNarratives(selectedReaderId, compareReaderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawSajuData, selectedReaderId, compareReaderId, queryType, categoryFocus]);

  const modelLabel = activeModel.includes("GPT")
    ? "GPT-4o"
    : activeModel.includes("CLAUDE")
      ? "Claude 3.5"
      : activeModel.includes("GEMINI")
        ? "Gemini 1.5"
        : activeModel;

  const handleUnlockReader = (reader: FortuneReaderProfile) => {
    const cost = getReaderUnlockCost(reader);

    if (reader.tier === "signature") {
      if (membershipActive || isAdmin) return;
      if (churu < 5 || !consumeChuru(5)) {
        setShowShop(true);
        return;
      }
      setMembershipActive(activateReaderMembership().active);
      return;
    }

    if (cost === 0 || isAdmin) {
      setUnlockedReaderIds(unlockReader(reader.id));
      return;
    }
    if (churu < cost || !consumeChuru(cost)) {
      setShowShop(true);
      return;
    }
    setUnlockedReaderIds(unlockReader(reader.id));
  };

  const handleSaveCompare = () => {
    if (!dualNarrative) return;
    const saved = saveAnalysisToHistory({
      type: "SAJU",
      title: "리더 비교 해석",
      subtitle: compareReader ? `${activeReader.name} vs ${compareReader.name}` : activeReader.name,
      resultUrl: typeof window !== "undefined" ? window.location.pathname : undefined,
      resultPreview: dualNarrative.easy,
      result: {
        queryType,
        categoryFocus,
        primaryReader: activeReader,
        compareReader,
        primaryNarrative: dualNarrative,
        compareNarrative,
      },
    });
    setSaveMessage(saved ? "비교 해석을 기록에 저장했습니다." : "기록 저장에 실패했습니다.");
    window.setTimeout(() => setSaveMessage(""), 2200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mt-8 overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-8"
    >
      <div className="absolute right-0 top-0 p-8 opacity-5">
        <BookOpen className="h-32 w-32 -rotate-12 text-indigo-400" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/20">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-indigo-300" /> : <Quote className="h-5 w-5 text-indigo-300" />}
            </div>
            <div>
              <h3 className="mb-1 text-sm font-black uppercase tracking-widest leading-none text-indigo-200">AI 확장 해석</h3>
              <p className="text-[10px] font-bold uppercase text-slate-500">
                persona: {persona} / 모델: {modelLabel}
              </p>
              <p className="mt-1 text-[11px] text-slate-300">
                {activeReader.heroEmoji} {activeReader.name} / {activeReader.subtitle}
              </p>
              {favoriteReaderIds.includes(activeReader.id) ? (
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200">Favorite Reader</p>
              ) : null}
            </div>
          </div>

          {!loading ? (
            <button
              onClick={() => void fetchNarratives(selectedReaderId, compareReaderId)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/20"
              title="AI 해석 다시 생성"
            >
              <RefreshCw className="h-4 w-4 text-slate-400" />
            </button>
          ) : null}
        </div>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 flex items-center gap-2 text-amber-200">
            <Wand2 className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">리더 선택</p>
          </div>

          {favoriteReaderIds.length ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {favoriteReaderIds
                .map((id) => availableReaders.find((reader) => reader.id === id))
                .filter((reader): reader is FortuneReaderProfile => Boolean(reader))
                .map((reader) => (
                  <button
                    key={`favorite-${reader.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedReaderId(reader.id);
                      setActiveReader(reader);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-black text-amber-100"
                  >
                    <Star className="h-3 w-3 fill-current" />
                    {reader.heroEmoji} {reader.name}
                  </button>
                ))}
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {availableReaders.map((reader) => {
              const selected = reader.id === selectedReaderId;
              const recommended = reader.id === recommendedReader.id;
              const favorite = favoriteReaderIds.includes(reader.id);
              const unlocked =
                reader.tier === "starter"
                  ? true
                  : reader.tier === "signature"
                    ? membershipActive || isAdmin
                    : unlockedReaderIds.includes(reader.id) || isAdmin;
              const unlockCost = getReaderUnlockCost(reader);

              return (
                <div
                  key={reader.id}
                  className={`rounded-3xl border p-4 text-left transition-all ${
                    selected
                      ? "border-indigo-300/40 bg-indigo-500/15 shadow-[0_0_0_1px_rgba(165,180,252,0.2)]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      disabled={!unlocked}
                      onClick={() => {
                        if (!unlocked) return;
                        setSelectedReaderId(reader.id);
                        setActiveReader(reader);
                        saveLastReaderId(queryType, reader.id);
                      }}
                      className="flex-1 text-left disabled:opacity-60"
                    >
                      <p className="text-xl">{reader.heroEmoji}</p>
                      <p className="mt-2 text-sm font-black text-white">{reader.name}</p>
                      <p className="mt-2 text-xs text-slate-300">{reader.subtitle}</p>
                    </button>

                    <div className="flex flex-col items-end gap-2">
                      {recommended ? (
                        <span className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">
                          추천
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setFavoriteReaderIds(toggleFavoriteReader(reader.id))}
                        aria-pressed={favorite}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                          favorite
                            ? "border-amber-300/30 bg-amber-500/10 text-amber-100"
                            : "border-white/10 bg-black/20 text-slate-400"
                        }`}
                        title={favorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                      >
                        <Star className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {!unlocked ? (
                    <div className="mt-3 rounded-2xl border border-rose-300/20 bg-rose-500/10 p-3">
                      <p className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.16em] text-rose-100">
                        <Lock className="h-3 w-3" />
                        {reader.tier === "signature" ? "Signature Membership" : "Premium Reader"}
                      </p>
                      <p className="mt-2 text-[11px] leading-6 text-slate-200">{reader.curiosityPrompt}</p>
                      <button
                        type="button"
                        onClick={() => handleUnlockReader(reader)}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-[11px] font-black text-white"
                      >
                        {reader.tier === "signature" ? "👑 5 젤리로 멤버십 시작" : `🔓 ${unlockCost} 젤리로 해금`}
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReaderId(reader.id);
                          setActiveReader(reader);
                          saveLastReaderId(queryType, reader.id);
                        }}
                        className="mt-3 block w-full text-left"
                      >
                        <p className="text-[11px] text-indigo-100">{reader.curiosityPrompt}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {reader.specialties.slice(0, 3).map((item) => (
                            <span
                              key={`${reader.id}-${item}`}
                              className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] text-slate-200"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </button>
                      {reader.id !== selectedReaderId ? (
                        <button
                          type="button"
                          onClick={() => setCompareReaderId(compareReaderId === reader.id ? null : reader.id)}
                          className={`mt-3 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-black ${
                            compareReaderId === reader.id
                              ? "border-cyan-300/30 bg-cyan-500/10 text-cyan-100"
                              : "border-white/10 bg-black/20 text-slate-200"
                          }`}
                        >
                          <SplitSquareHorizontal className="h-3.5 w-3.5" />
                          {compareReaderId === reader.id ? "비교 해제" : "비교 추가"}
                        </button>
                      ) : null}
                      <p className="mt-2 text-[10px] text-slate-500">
                        {reader.tier === "signature"
                          ? "구독 전용 리더"
                          : reader.tier === "pro"
                            ? "심화 리더"
                            : reader.tier === "plus"
                              ? "카테고리 특화 리더"
                              : "기본 리더"}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {dualNarrative ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSaveCompare}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-slate-100"
              >
                <Save className="h-3.5 w-3.5" />
                해석 저장
              </button>
              {membershipActive ? (
                <span className="rounded-full border border-yellow-300/30 bg-yellow-500/10 px-3 py-1 text-[11px] font-black text-yellow-100">
                  👑 시그니처 멤버십 활성
                </span>
              ) : null}
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black text-slate-200">
                실험군 {experimentVariant}
              </span>
              {saveMessage ? <span className="text-xs text-emerald-300">{saveMessage}</span> : null}
            </div>

            <div className="rounded-3xl border border-indigo-300/20 bg-indigo-500/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-100">Reader Hook</p>
              <p className="mt-2 text-sm leading-7 text-slate-100">{dualNarrative.hook}</p>
            </div>

            <div className={`grid gap-4 ${compareNarrative ? "xl:grid-cols-2" : ""}`}>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-indigo-100">
                  <span>{activeReader.heroEmoji}</span>
                  <span>{activeReader.name}</span>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <NarrativeCard title="쉬운 설명" body={dualNarrative.easy} tone="border-cyan-300/20 bg-cyan-500/10" />
                  <NarrativeCard title="전문 해설" body={dualNarrative.expert} tone="border-indigo-300/20 bg-indigo-500/10" />
                  <NarrativeCard title="바로 할 일" body={dualNarrative.action} tone="border-emerald-300/20 bg-emerald-500/10" />
                </div>
              </div>

              {compareNarrative && compareReader ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-fuchsia-100">
                    <span>{compareReader.heroEmoji}</span>
                    <span>{compareReader.name}</span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <NarrativeCard title="쉬운 설명" body={compareNarrative.easy} tone="border-fuchsia-300/20 bg-fuchsia-500/10" />
                    <NarrativeCard title="전문 해설" body={compareNarrative.expert} tone="border-purple-300/20 bg-purple-500/10" />
                    <NarrativeCard title="바로 할 일" body={compareNarrative.action} tone="border-amber-300/20 bg-amber-500/10" />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-200" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-100">왜 리더마다 다르게 말하나요?</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-200">{dualNarrative.disclaimer}</p>
              {compareNarrative ? (
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  비교 모드에서는 같은 결과를 각 리더가 어떤 순서와 강조점으로 설명하는지 보여줍니다. 차이는 계산값이 아니라 해석의 초점과 행동 조언의 우선순위에서 생깁니다.
                </p>
              ) : null}
              {lineageProfileId ? (
                <p className="mt-2 text-[11px] text-slate-400">
                  학파 기준: {lineageProfileId} / evidence {evidence?.length ?? 0}건
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded-full bg-white/5" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/5" />
            <div className="h-4 w-4/6 animate-pulse rounded-full bg-white/5" />
          </div>
        )}

        {error ? <p className="text-xs text-rose-300">AI 응답이 불안정해 기본 해설로 표시했습니다.</p> : null}
      </div>

      <JellyShopModal isOpen={showShop} onClose={() => setShowShop(false)} highlightTier="pro" />
    </motion.div>
  );
}
