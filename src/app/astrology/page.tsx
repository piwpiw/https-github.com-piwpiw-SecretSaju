"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Compass,
  Loader2,
  Sparkles,
  Star,
} from "lucide-react";
import { buildAstrologyReport } from "@/lib/saju/astrologyEngine";
import { saveAnalysisToHistory } from "@/lib/app/analysis-history";
import type { AstrologyReport } from "@/lib/saju/astrologyEngine";

function formatDate(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate(),
  ).padStart(2, "0")}`;
}

function scoreBarClass(score: number) {
  if (score >= 80) return "from-emerald-400 to-cyan-400";
  if (score >= 65) return "from-amber-300 to-fuchsia-300";
  return "from-rose-400 to-indigo-400";
}

function ratingLabel(score: number) {
  if (score >= 85) return "탁월";
  if (score >= 70) return "좋음";
  if (score >= 55) return "안정";
  return "주의";
}

const defaultProfileName = "고객";

export default function AstrologyPage() {
  const now = useMemo(() => new Date(), []);
  const [profileName, setProfileName] = useState(defaultProfileName);
  const [selectedDate, setSelectedDate] = useState(formatDate(now));
  const [isGenerating, setIsGenerating] = useState(false);
  const [openAll, setOpenAll] = useState(true);
  const [report, setReport] = useState<AstrologyReport | null>(null);

  const handleGenerate = async () => {
    if (!selectedDate.trim()) {
      return;
    }

    setIsGenerating(true);
    try {
      const finalName = profileName.trim() || defaultProfileName;
      const built = buildAstrologyReport(new Date(`${selectedDate}T00:00:00`), undefined);

      setReport(built);
      saveAnalysisToHistory(
        {
          type: "ASTROLOGY",
          title: `${finalName} 별자리 리포트`,
          subtitle: `${built.selectedDate} / ${built.profile.name}`,
          profileName: finalName,
          resultPreview: `${built.profile.name} / 신뢰도 ${built.profile.quality}`,
          result: built,
        },
        {
          resultUrlFactory: (id) => `/analysis-history/ASTROLOGY/${id}`,
        },
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const randomDate = () => {
    const offset = Math.floor(Math.random() * 60_000);
    const target = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
    setSelectedDate(formatDate(target));
  };

  const scoreAverage = report
    ? Math.round(report.categories.reduce((acc, item) => acc + item.score, 0) / report.categories.length)
    : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(99,102,241,0.2),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.2),transparent_48%)] pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 inline-flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <p className="text-xs text-slate-400 tracking-[0.3em]">별자리 연구소</p>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/65 p-7 md:p-9">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-300/25 bg-indigo-500/10 text-[11px] text-indigo-200 font-black tracking-[0.3em]">
            <CalendarDays className="w-3.5 h-3.5" />
            별자리
          </div>
          <h1 className="text-3xl md:text-4xl font-black mt-4 tracking-tight">일일 별자리 스냅샷</h1>
          <p className="text-slate-300 mt-2 max-w-2xl">
            날짜와 이름을 입력하면 별자리 점수표, 흐름 데이터, 근거 노트를 제공합니다.
          </p>

          <div className="mt-6 grid md:grid-cols-2 gap-3">
            <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs tracking-[0.25em] text-slate-300">프로필 이름</span>
              <input
                className="mt-2 w-full bg-transparent border border-white/15 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-300"
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                placeholder="이름 또는 별칭"
              />
            </label>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs tracking-[0.25em] text-slate-300">날짜</span>
              <input
                type="date"
                className="mt-2 w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-300"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-500 text-slate-900 font-black tracking-[0.2em] text-sm disabled:opacity-60"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? "생성 중..." : "리포트 생성"}
            </button>
            <button
              type="button"
              onClick={randomDate}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/20 text-sm text-slate-100"
            >
              랜덤 날짜
            </button>
              <button
                type="button"
                onClick={() => setOpenAll((value) => !value)}
                className="ml-auto px-4 py-2 rounded-xl border border-white/20 text-xs text-slate-200"
              >
                {openAll ? "카드 접기" : "카드 펼치기"}
              </button>
            </div>
        </section>

        {!report ? (
          <section className="rounded-3xl border border-indigo-300/20 bg-indigo-500/10 p-6 text-sm text-indigo-100">
            리포트를 생성하면 월간 흐름과 근거 로그가 표시됩니다.
          </section>
        ) : null}

        {report ? (
          <>
            <section className="rounded-[1.8rem] border border-white/10 bg-black/35 p-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400">날짜: {report.selectedDate}</p>
                  <h2 className="text-3xl font-black mt-1">
                    {report.profile.emoji} {report.profile.name}
                  </h2>
                  <p className="text-sm text-slate-300 mt-1">
                    {report.profile.dateRange} / {report.profile.lord} / {report.profile.element} / {report.profile.modality}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">프로필 신뢰도: {report.profile.quality}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs tracking-[0.3em] text-indigo-200">평균</div>
                  <div className="text-2xl font-black mt-1">{scoreAverage} / 100</div>
                  <p className="text-xs text-slate-300">{ratingLabel(scoreAverage)}</p>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400">달 위상</div>
                <div className="mt-2 text-lg font-black">
                  {report.moonPhase.symbol} {report.moonPhase.label}
                </div>
                <p className="text-sm text-slate-300 mt-1">{report.moonPhase.description}</p>
              </div>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5" /> 행운 지표
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-slate-900 text-xs border border-emerald-300/20">
                    방향: {report.profile.luckyDirection}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-slate-900 text-xs border border-cyan-300/20">
                    행성: {report.profile.luckyPlanets.join(", ")}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {report.profile.luckyColors.map((color) => (
                    <span key={color} className="px-2 py-1 rounded-md bg-indigo-300/10 border border-indigo-200/25 text-xs">
                      {color}
                    </span>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-4 mt-4">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-fuchsia-300" /> 궁합 힌트
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {report.compatibility.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-300/25 text-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-300">
                  근거 포인트: {report.evidence.length} / 근거 로그: {report.evidence.length}
                </p>
              </article>
            </section>

            <section className="grid lg:grid-cols-3 gap-4">
              {report.categories.map((cat) => (
                <details key={cat.key} className="rounded-3xl border border-white/10 bg-slate-900/55 p-5" open={openAll}>
                  <summary className="cursor-pointer text-sm font-black text-slate-100 uppercase tracking-[0.2em] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-300" /> {cat.label}
                  </summary>
                  <div className="mt-4">
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden border border-white/10">
                      <div
                        className={`h-full bg-gradient-to-r ${scoreBarClass(cat.score)}`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                    <p className="mt-3 text-sm text-slate-100">{cat.note}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{cat.score} / 100</p>
                    <p className="text-xs text-slate-300 mt-2">{cat.emoji}</p>
                  </div>
                </details>
              ))}
            </section>

            <section className="grid lg:grid-cols-2 gap-4">
              <details className="rounded-[1.8rem] border border-white/10 bg-slate-900/55 p-7" open={openAll}>
                <summary className="font-black text-lg mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-emerald-300" /> 강점 / 위험 신호
                </summary>
                <div className="space-y-2">
                  {report.profile.strengths.map((item) => (
                    <p key={`strength-${item}`} className="text-sm text-slate-200">- {item}</p>
                  ))}
                  {report.profile.cautions.map((item) => (
                    <p key={`caution-${item}`} className="text-sm text-rose-200">- {item}</p>
                  ))}
                </div>
              </details>

              <details className="rounded-[1.8rem] border border-white/10 bg-slate-900/55 p-7" open={openAll}>
                <summary className="font-black text-lg mb-4">월간 흐름</summary>
                <div className="space-y-2 max-h-72 overflow-auto pr-1">
                  {report.monthTrend.map((item) => (
                    <article key={item.month} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>{item.month}</span>
                        <span>{item.value}점</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-300 to-indigo-300" style={{ width: `${item.value}%` }} />
                      </div>
                      <p className="text-xs text-slate-200 mt-2">{item.reason}</p>
                    </article>
                  ))}
                </div>
              </details>
            </section>

            <section className="rounded-[1.8rem] border border-white/10 bg-black/35 p-7">
              <h3 className="text-xl font-black mb-3">근거</h3>
              <div className="mt-4 space-y-3">
                {report.evidence.map((item) => (
                  <div key={`${item.title}-${item.source}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm text-indigo-200">{item.title}</p>
                    <p className="text-[11px] text-slate-300 mt-1">{item.source}</p>
                    <p className="text-xs text-slate-400 mt-2 whitespace-pre-wrap">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
