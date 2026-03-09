"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Calendar, CalendarDays, Loader2, Sparkles, WalletCards, Briefcase, CheckCircle2, ChevronRight, Lightbulb } from "lucide-react";
import JellyBalance from "@/components/shop/JellyBalance";
import { useWallet } from "@/components/payment/WalletProvider";
import { useProfiles } from "@/components/profile/ProfileProvider";
import LuxuryToast from "@/components/ui/LuxuryToast";
import { saveAnalysisToHistory } from "@/lib/app/analysis-history";
import { calculateSajuFromBirthdate, getDayPillarIndex, getPillarNameKo } from "@/lib/saju";
import { buildTojeongReport, TojeongReport } from "@/lib/saju/tojeongEngine";
import { parseCivilDate } from "@/lib/saju/civil-date";

type TojeongScore = "high" | "mid" | "low";

type ViewReport = TojeongReport & {
  trustScore: number;
  scoreBands: {
    label: string;
    score: number;
    tone: TojeongScore;
    reason: string;
    action: string;
  }[];
};

function dayOfYear(date: Date) {
  const start = Date.UTC(date.getFullYear(), 0, 1);
  const now = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((now - start) / (24 * 60 * 60 * 1000)) + 1;
}

function trustScore(report: TojeongReport) {
  const base = Math.round((report.mainScore * 0.68 + 28));
  const toneBonus = report.categories.reduce((acc, item) => {
    if (item.tone === "positive") return acc + 8;
    if (item.tone === "neutral") return acc + 4;
    return acc - 4;
  }, 0);
  const sourceBonus = report.sources.length * 3;
  return Math.max(40, Math.min(100, base + toneBonus + sourceBonus));
}

function toneToColor(tone: TojeongScore) {
  if (tone === "high") return "from-emerald-400 to-emerald-600";
  if (tone === "mid") return "from-amber-400 to-cyan-500";
  return "from-rose-400 to-rose-600";
}

function ResultSummaryCard({ title, body, tone }: { title: string; body: string; tone: string }) {
  return (
    <div className={`rounded-3xl border p-5 ${tone}`}>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-100">{body}</p>
    </div>
  );
}

export default function TojeongPage() {
  const { consumeChuru, churu, isAdmin } = useWallet();
  const { profiles, activeProfile } = useProfiles();

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ViewReport | null>(null);
  const [openAll, setOpenAll] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const toast = (message: string) => {
    setToastMsg(message);
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 2200);
  };

  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    return [now - 1, now, now + 1];
  }, []);

  const profile = activeProfile ?? profiles[0] ?? null;
  const profileName = profile?.name || "홍길동";

  const run = async () => {
    if (!profile) {
      toast("프로필을 먼저 등록해 주세요.");
      return;
    }

    if (!isAdmin && churu < 40) {
      toast("토큰이 부족합니다. 충전 후 사용하세요.");
      return;
    }

    const ok = consumeChuru(40);
    if (!ok) {
      toast("토큰 결제 실패. 다시 시도하세요.");
      return;
    }

    setIsLoading(true);
    try {
      const birthTime = profile.birthTime || "12:00";
      const birthDate = parseCivilDate(profile.birthdate, {
        time: birthTime,
        fallbackTime: { hour: 12, minute: 0, second: 0 },
      }) ?? new Date(1990, 0, 1, 12, 0, 0, 0);
      const birthPillar = await calculateSajuFromBirthdate(
        profile.birthdate,
        birthTime,
        profile.calendarType,
        profile.gender === "female" ? "F" : "M",
        profile.isTimeUnknown,
      );

      const output = buildTojeongReport({
        profileName: profile.name,
        birthYear: birthDate.getFullYear(),
        birthMonth: birthDate.getMonth() + 1,
        birthDay: birthDate.getDate(),
        birthBranchIndex: birthPillar.fourPillars?.day?.branchIndex ?? getDayPillarIndex(birthDate),
        birthPillarIndex: birthPillar.fourPillars?.day?.ganjiIndex ?? getDayPillarIndex(birthDate),
        yearPillarIndex: getDayPillarIndex(new Date(selectedYear, 0, 1)),
        year: selectedYear,
        birthDayOfYear: dayOfYear(birthDate),
        isFemale: profile.gender === "female",
      });

      const scoreBands: ViewReport["scoreBands"] = [
        {
          label: "직업",
          score: output.categories[0]?.score ?? 0,
          tone: output.categories[0]?.tone === "positive" ? "high" : output.categories[0]?.tone === "neutral" ? "mid" : "low",
          reason: output.categories[0]?.reason ?? "-",
          action: output.categories[0]?.action ?? "-",
        },
        {
          label: "재물",
          score: output.categories[1]?.score ?? 0,
          tone: output.categories[1]?.tone === "positive" ? "high" : output.categories[1]?.tone === "neutral" ? "mid" : "low",
          reason: output.categories[1]?.reason ?? "-",
          action: output.categories[1]?.action ?? "-",
        },
        {
          label: "연애",
          score: output.categories[2]?.score ?? 0,
          tone: output.categories[2]?.tone === "positive" ? "high" : output.categories[2]?.tone === "neutral" ? "mid" : "low",
          reason: output.categories[2]?.reason ?? "-",
          action: output.categories[2]?.action ?? "-",
        },
      ];

      setReport({
        ...output,
        trustScore: trustScore(output),
        scoreBands,
      });
      saveAnalysisToHistory({
        type: "TOJEONG",
        title: `${profile.name} 토정비결`,
        subtitle: `${selectedYear}년 연간 운세`,
        profileId: profile.id,
        profileName: profile.name,
        resultUrl: "/tojeong",
        resultPreview: `${output.mainGrade} ${output.mainScore}점`,
        result: {
          ...output,
          trustScore: trustScore(output),
        },
      });
      toast(`${selectedYear}년 토정비결이 계산되었습니다.`);
    } catch (error) {
      console.error(error);
      toast("계산 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const monthSummary = useMemo(() => {
    if (!report) return null;
    const avgMonthly = Math.round(report.monthly.reduce((acc, item) => acc + item.score, 0) / report.monthly.length);
    return { avgMonthly, source: `${report.sources.length}개 근거` };
  }, [report]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden pb-32 font-sans">
      <LuxuryToast message={toastMsg} isVisible={showToast} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.12),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.12),transparent_40%)] pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 inline-flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <JellyBalance />
        </div>

        <section className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-8 md:p-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-slate-800/70 text-xs font-black uppercase tracking-[0.3em] text-amber-300">
            <CalendarDays className="w-4 h-4" />
            토정비결
          </div>
          <h1 className="text-3xl md:text-4xl font-black mt-3">연도별 운세 핵심 진단</h1>
          <p className="text-slate-300 mt-2">
            대상: <span className="text-white">{profileName}</span> / 사주 데이터를 기반으로 연도 흐름과 월별 포인트를 계산합니다.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {yearOptions.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-3 rounded-2xl border text-sm font-black transition ${
                  selectedYear === year
                    ? "bg-amber-500 text-slate-900 border-amber-300"
                    : "bg-white/5 text-slate-100 border-white/15"
                }`}
              >
                {year}년
              </button>
            ))}
            <button
              onClick={() => setOpenAll((v) => !v)}
              className="ml-auto px-4 py-3 rounded-2xl border border-cyan-300/50 text-cyan-200 text-xs"
            >
              카드 {openAll ? "전체 접기" : "전체 펼치기"}
            </button>
          </div>

          <button
            onClick={run}
            disabled={isLoading}
            className="mt-5 w-full py-4 rounded-2xl bg-amber-500 text-slate-900 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isLoading ? "분석 중..." : "토정비결 계산"}
          </button>
        </section>

        {!profile && (
          <section className="mt-8 rounded-3xl border border-amber-300/20 bg-amber-500/10 p-6 text-amber-100 text-sm">
            현재 사용 가능한 프로필이 없습니다. 먼저 프로필을 등록해 주세요.
            <div className="mt-3">
              <Link href="/my-saju/add" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-slate-900 font-black">
                <Calendar className="w-4 h-4" /> 프로필 등록
              </Link>
            </div>
          </section>
        )}

        {report && (
          <>
            <section className="mt-8 bg-slate-900/55 border border-white/10 rounded-[2rem] p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-amber-300 font-black tracking-[0.2em]">신뢰도 점수</div>
                  <h2 className="text-3xl mt-2 font-black">{report.trustScore} / 100</h2>
                  <p className="text-sm text-slate-300 mt-1">{report.oneLineSummary}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black">{report.mainScore}</div>
                  <div className="text-xs text-slate-400">기준등급 {report.mainGrade}</div>
                  <div className="text-xs text-slate-400 mt-2">{monthSummary?.source}</div>
                </div>
              </div>

              <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-300 to-rose-400"
                  style={{ width: `${report.mainScore}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">월평균 점수: {monthSummary?.avgMonthly}점</p>
            </section>

            <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <ResultSummaryCard
                title="🧭 Who You Are"
                body={`${selectedYear}년의 ${profileName}님 흐름은 ${report.mainGrade} 등급, ${report.mainScore}점으로 요약되며 "${report.theme}"가 올해의 중심 주제입니다.`}
                tone="bg-cyan-500/10 border-cyan-300/20"
              />
              <ResultSummaryCard
                title="📚 Why It Happens"
                body={`${report.oneLineSummary} ${report.sources.length}개의 근거가 현재 해석을 지지하고, 월평균 ${monthSummary?.avgMonthly ?? 0}점 리듬이 연간 흐름을 만듭니다.`}
                tone="bg-amber-500/10 border-amber-300/20"
              />
              <ResultSummaryCard
                title="✨ What To Do"
                body={`${report.actionPlans[0] ?? "올해는 강한 달에 집중하고 약한 달은 보수적으로 운영하는 편이 좋습니다."}`}
                tone="bg-emerald-500/10 border-emerald-300/20"
              />
            </section>

            <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.scoreBands.map((item) => (
                <details key={item.label} className="rounded-3xl border border-white/10 bg-slate-900/50" open={openAll}>
                  <summary className="px-5 py-4 cursor-pointer font-black">{item.label}</summary>
                  <div className="px-5 pb-5">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-black">{item.score}</div>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-800">{item.tone}</span>
                    </div>
                    <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${toneToColor(item.tone)}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <p className="mt-3 text-sm text-slate-100 leading-relaxed">{item.reason}</p>
                    <p className="mt-2 text-xs text-slate-300">실행: {item.action}</p>
                  </div>
                </details>
              ))}
            </section>

            <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <article className="rounded-3xl border border-white/10 bg-slate-900/45 p-6">
                <div className="inline-flex items-center gap-2 text-emerald-300 text-sm font-black">
                  <WalletCards className="w-4 h-4" /> 연간 주제
                </div>
                <p className="mt-2 text-sm text-slate-200">{report.theme}</p>
                <p className="mt-2 text-slate-400">{getPillarNameKo(getDayPillarIndex(new Date(report.year, 0, 1)))} 중심 해석</p>
              </article>
              <article className="rounded-3xl border border-white/10 bg-slate-900/45 p-6">
                <div className="inline-flex items-center gap-2 text-sky-300 text-sm font-black">
                  <Briefcase className="w-4 h-4" /> 강점
                </div>
                <ul className="mt-2 text-sm text-slate-200 space-y-1">
                  {report.strengths.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </article>
              <article className="rounded-3xl border border-white/10 bg-slate-900/45 p-6">
                <div className="inline-flex items-center gap-2 text-rose-300 text-sm font-black">
                  <CheckCircle2 className="w-4 h-4" /> 주의점
                </div>
                <ul className="mt-2 text-sm text-slate-200 space-y-1">
                  {report.cautions.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </article>
            </section>

            <section className="mt-8 rounded-[2rem] border border-white/10 bg-slate-900/55 p-8">
              <h3 className="text-xl font-black">월별 핵심 액션 포인트</h3>
              <div className="mt-4 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {report.monthly.slice(0, 9).map((month) => (
                  <article key={month.month} className="rounded-3xl border border-white/10 bg-slate-900/60 p-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-black text-amber-300">{month.month}월 · {month.title}</div>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10">{month.score}점</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{month.summary}</p>
                    <ul className="mt-3 text-xs text-slate-400 space-y-1">
                      {month.tips.map((tip) => (
                        <li key={tip} className="flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 mt-0.5 text-amber-300" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/55 p-6">
              <details open={openAll}>
                <summary className="font-black text-lg mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-cyan-300" /> 실행 액션
                </summary>
                <ul className="mt-2 space-y-2 text-sm text-slate-200">
                  {report.actionPlans.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </details>
            </section>

            <section className="mt-6 rounded-3xl border border-white/10 bg-slate-900/55 p-6">
              <details open={openAll}>
                <summary className="font-black text-lg mb-3">근거 로그</summary>
                <ul className="space-y-2 text-sm text-slate-200">
                  {report.sources.map((source) => (
                    <li key={source.name} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 text-emerald-300" />
                      <span>
                        <span className="font-black">{source.name}</span> : {source.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
