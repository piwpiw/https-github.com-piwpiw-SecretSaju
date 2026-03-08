"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Crown, Lock, Sparkles, Star, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import AuthRequiredNotice from "@/components/AuthRequiredNotice";
import {
  getFavoriteReaderIds,
  getFortuneReaderProfiles,
  getReaderUnlockCost,
  getUnlockedReaderIds,
  toggleFavoriteReader,
  type ReaderQueryType,
} from "@/lib/fortune-readers";
import { useAuthStatus } from "@/lib/auth-status";
import { getReaderExperimentVariant, reorderReadersForExperiment } from "@/lib/reader-experiments";
import { getReaderMembership } from "@/lib/reader-membership";

const QUERY_TYPES: ReaderQueryType[] = ["result", "compatibility", "daily", "chat"];

export default function FortuneReadersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStatus();
  const [queryType, setQueryType] = useState<ReaderQueryType>("result");
  const [favoriteIds, setFavoriteIds] = useState<ReturnType<typeof getFavoriteReaderIds>>([]);
  const [unlockedIds, setUnlockedIds] = useState<ReturnType<typeof getUnlockedReaderIds>>([]);
  const [membershipActive, setMembershipActive] = useState(false);
  const [experimentVariant, setExperimentVariant] = useState<ReturnType<typeof getReaderExperimentVariant>>("control");

  const readers = useMemo(
    () => reorderReadersForExperiment(getFortuneReaderProfiles(queryType), queryType),
    [queryType],
  );

  useEffect(() => {
    setFavoriteIds(getFavoriteReaderIds());
    setUnlockedIds(getUnlockedReaderIds());
    setMembershipActive(getReaderMembership().active);
    setExperimentVariant(getReaderExperimentVariant());
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.16),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(244,114,182,0.10),transparent_45%)]" />
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <header className="flex items-center justify-between mb-10">
          <button onClick={() => router.back()} className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.24em] font-black text-indigo-300">Fortune Reader Market</p>
            <h1 className="text-3xl font-black text-white">역술가 선택 마켓</h1>
          </div>
          <div className="text-right text-[11px] text-slate-300">
            <div>실험군 {experimentVariant}</div>
            <div>{membershipActive ? "시그니처 멤버십 활성" : "시그니처 멤버십 비활성"}</div>
          </div>
        </header>

        {!isAuthenticated ? (
          <div className="mb-8">
            <AuthRequiredNotice
              compact
              nextPath="/fortune-readers"
              title="게스트 모드에서는 탐색만 가능합니다."
              detail="리더 해금, 멤버십, 즐겨찾기와 비교 저장은 로그인 후 서버 기준으로 안전하게 동작합니다."
            />
          </div>
        ) : null}

        <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap gap-2">
            {QUERY_TYPES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setQueryType(item)}
                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${
                  queryType === item ? "bg-indigo-600 text-white" : "border border-white/10 bg-white/5 text-slate-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {readers.map((reader) => {
            const unlocked =
              reader.tier === "starter" ||
              unlockedIds.includes(reader.id) ||
              (reader.tier === "signature" && membershipActive);
            const favorite = favoriteIds.includes(reader.id);

            return (
              <article key={reader.id} className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-3xl">{reader.heroEmoji}</p>
                    <h2 className="mt-3 text-xl font-black text-white">{reader.name}</h2>
                    <p className="mt-2 text-sm text-slate-300">{reader.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFavoriteIds(toggleFavoriteReader(reader.id))}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${
                      favorite ? "border-amber-300/30 bg-amber-500/10 text-amber-100" : "border-white/10 bg-black/20 text-slate-400"
                    }`}
                  >
                    <Star className={`w-4 h-4 ${favorite ? "fill-current" : ""}`} />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-200">
                    {reader.tier}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-200">
                    {reader.category}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-200">{reader.description}</p>
                <p className="mt-3 text-[11px] text-indigo-100">{reader.curiosityPrompt}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {reader.specialties.map((item) => (
                    <span key={`${reader.id}-${item}`} className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] text-slate-200">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>온기 {reader.warmth}</div>
                    <div>직설 {reader.directness}</div>
                    <div>전문도 {reader.jargonDensity}</div>
                    <div>쉬운설명 {reader.easyBias}</div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-300">
                    {unlocked
                      ? reader.tier === "signature"
                        ? "시그니처 멤버십으로 사용 가능"
                        : "즉시 사용 가능"
                      : reader.tier === "signature"
                        ? "시그니처 멤버십 필요"
                        : `${getReaderUnlockCost(reader)} 젤리 필요`}
                  </div>
                  <Link href={`/fortune-readers/${reader.id}`} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black text-white">
                    <Wand2 className="w-3.5 h-3.5" />
                    상세 보기
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-indigo-500/10 p-5">
            <Sparkles className="w-5 h-5 text-indigo-200" />
            <p className="mt-3 text-sm font-black text-white">추천 실험</p>
            <p className="mt-2 text-sm text-slate-200">일부 사용자는 쉬운 설명형 리더가 먼저 보이도록 실험 중입니다.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-amber-500/10 p-5">
            <Lock className="w-5 h-5 text-amber-200" />
            <p className="mt-3 text-sm font-black text-white">젤리 해금</p>
            <p className="mt-2 text-sm text-slate-200">카테고리 특화 리더는 젤리로 해금하고, 시그니처 리더는 멤버십으로 구분 운영합니다.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-fuchsia-500/10 p-5">
            <Crown className="w-5 h-5 text-fuchsia-200" />
            <p className="mt-3 text-sm font-black text-white">시그니처 마스터</p>
            <p className="mt-2 text-sm text-slate-200">롱폼 리포트와 심화 브리핑은 멤버십 전용 콘텐츠로 연결됩니다.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
