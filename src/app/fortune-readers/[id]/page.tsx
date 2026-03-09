"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Crown, Sparkles, Star } from "lucide-react";
import { getFortuneReaderById, getReaderUnlockCost, isReaderUnlocked } from "@/lib/reader/fortune-readers";
import { getReaderMembership } from "@/lib/reader/reader-membership";

export default function FortuneReaderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const readerId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const reader = useMemo(() => getFortuneReaderById(readerId), [readerId]);
  const [membershipActive, setMembershipActive] = useState(false);
  const [unlocked, setUnlocked] = useState(reader.tier === "starter");

  useEffect(() => {
    const active = getReaderMembership().active;
    setMembershipActive(active);
    setUnlocked(reader.tier === "signature" ? active : isReaderUnlocked(reader));
  }, [reader]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.16),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(244,114,182,0.10),transparent_45%)]" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <header className="flex items-center justify-between mb-10">
          <button onClick={() => router.back()} className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.24em] font-black text-indigo-300">Reader Profile</p>
            <h1 className="text-3xl font-black text-white">{reader.name}</h1>
          </div>
          <div className="w-11 h-11" />
        </header>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-6xl">{reader.heroEmoji}</p>
              <p className="mt-4 text-lg font-black text-white">{reader.subtitle}</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">{reader.description}</p>
            </div>
            <div className="min-w-[220px] rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-200">
                {reader.tier === "signature" ? <Crown className="w-4 h-4 text-yellow-200" /> : <Sparkles className="w-4 h-4 text-indigo-200" />}
                {reader.tier}
              </div>
              <p className="mt-3 text-sm text-slate-200">카테고리: {reader.category}</p>
              <p className="mt-2 text-sm text-slate-200">모델: {reader.recommendedModel}</p>
              <p className="mt-4 text-sm font-black text-white">
                {unlocked
                  ? "즉시 사용 가능"
                  : reader.tier === "signature" && !membershipActive
                    ? "시그니처 멤버십 필요"
                    : `${getReaderUnlockCost(reader)} 젤리 필요`}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-indigo-500/10 p-5">
            <p className="text-sm font-black text-white">해설 스타일</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-200">
              <div>온기 {reader.warmth}</div>
              <div>직설 {reader.directness}</div>
              <div>전문 용어 {reader.jargonDensity}</div>
              <div>쉬운 번역 {reader.easyBias}</div>
              <div>실행 조언 {reader.actionBias}</div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-fuchsia-500/10 p-5">
            <p className="text-sm font-black text-white">이 리더가 특화된 영역</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {reader.specialties.map((item) => (
                <span key={`${reader.id}-${item}`} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] text-slate-100">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-200">{reader.curiosityPrompt}</p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm font-black text-white">이 리더를 추천하는 경우</p>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            <p>1. 해설이 너무 어렵게 느껴지면 쉬운 번역형 리더가 적합합니다.</p>
            <p>2. 관계와 감정선을 중점으로 보면 연애 흐름 상담가가 적합합니다.</p>
            <p>3. 일과 성과를 중심으로 보고 싶으면 커리어 전략가가 적합합니다.</p>
            <p>4. 지금 움직여야 하는지 타이밍이 궁금하면 타이밍 분석가가 적합합니다.</p>
            <p>5. 한 번에 긴 리포트와 심화 브리핑을 원하면 시그니처 마스터가 적합합니다.</p>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/saju" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white">
            <Star className="w-4 h-4" />
            결과 화면에서 사용해보기
          </Link>
          <Link href="/fortune-readers" className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-slate-100">
            리더 마켓으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
