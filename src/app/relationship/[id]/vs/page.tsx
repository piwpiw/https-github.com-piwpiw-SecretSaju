"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Zap, Heart, Shield } from "lucide-react";
import Link from "next/link";
import RadarChart from "@/components/charts/RadarChart";
import { getProfiles, SajuProfile } from "@/lib/storage";
import { calculateHighPrecisionSaju, HighPrecisionSajuResult } from "@/core/api/saju-engine";
import { analyzeRelationship, RelationshipAnalysis } from "@/lib/compatibility";
import { TEN_GOD_GROUPS, getTenGodGuide } from "@/lib/terminology";
import { saveAnalysisToHistory } from "@/lib/analysis-history";
import KakaoShareButton from "@/components/share/KakaoShareButton";
import { parseCivilDate } from "@/lib/civil-date";

type Winner = "A" | "B" | "Draw";

interface TraitWinner {
  category: string;
  label: string;
  icon: any;
  winner: Winner;
  descA: string;
  descB: string;
}

function ResultSummaryCard({ title, body, tone }: { title: string; body: string; tone: string }) {
  return (
    <article className={`rounded-3xl border p-5 ${tone}`}>
      <h3 className="text-sm font-black tracking-[0.18em] uppercase">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-100">{body}</p>
    </article>
  );
}

type PillarKey = "hour" | "day" | "month" | "year";

type StemInfo = { ko: string; hanja: string; element: "목" | "화" | "토" | "금" | "수" };
type BranchInfo = { ko: string; hanja: string; element: "목" | "화" | "토" | "금" | "수" };

const PILLAR_ORDER: PillarKey[] = ["hour", "day", "month", "year"];
const PILLAR_LABEL: Record<PillarKey, string> = { hour: "시주", day: "일주", month: "월주", year: "년주" };

const STEMS: StemInfo[] = [
  { ko: "갑", hanja: "甲", element: "목" },
  { ko: "을", hanja: "乙", element: "목" },
  { ko: "병", hanja: "丙", element: "화" },
  { ko: "정", hanja: "丁", element: "화" },
  { ko: "무", hanja: "戊", element: "토" },
  { ko: "기", hanja: "己", element: "토" },
  { ko: "경", hanja: "庚", element: "금" },
  { ko: "신", hanja: "辛", element: "금" },
  { ko: "임", hanja: "壬", element: "수" },
  { ko: "계", hanja: "癸", element: "수" },
];

const BRANCHES: BranchInfo[] = [
  { ko: "자", hanja: "子", element: "수" },
  { ko: "축", hanja: "丑", element: "토" },
  { ko: "인", hanja: "寅", element: "목" },
  { ko: "묘", hanja: "卯", element: "목" },
  { ko: "진", hanja: "辰", element: "토" },
  { ko: "사", hanja: "巳", element: "화" },
  { ko: "오", hanja: "午", element: "화" },
  { ko: "미", hanja: "未", element: "토" },
  { ko: "신", hanja: "申", element: "금" },
  { ko: "유", hanja: "酉", element: "금" },
  { ko: "술", hanja: "戌", element: "토" },
  { ko: "해", hanja: "亥", element: "수" },
];

function elementTone(element: string) {
  if (element === "목") return "bg-emerald-500/20 border-emerald-400/40 text-emerald-100";
  if (element === "화") return "bg-rose-500/20 border-rose-400/40 text-rose-100";
  if (element === "토") return "bg-amber-500/20 border-amber-400/40 text-amber-100";
  if (element === "금") return "bg-slate-500/20 border-slate-300/40 text-slate-100";
  return "bg-blue-500/20 border-blue-400/40 text-blue-100";
}

function getStemInfo(stemIndex?: number) {
  return typeof stemIndex === "number" && stemIndex >= 0 && stemIndex < STEMS.length ? STEMS[stemIndex] : STEMS[4];
}

function getBranchInfo(branchIndex?: number) {
  return typeof branchIndex === "number" && branchIndex >= 0 && branchIndex < BRANCHES.length ? BRANCHES[branchIndex] : BRANCHES[0];
}

function getScore(res: HighPrecisionSajuResult, types: string[]) {
  return Object.values(res.sipsong).filter((v) => types.includes(v)).length;
}

function getTraitWinners(a: HighPrecisionSajuResult, b: HighPrecisionSajuResult): TraitWinner[] {
  const categories = [
    {
      category: "leadership",
      label: "리더십·권위형",
      icon: Zap,
      types: [...TEN_GOD_GROUPS.leadership],
    },
    {
      category: "empathy",
      label: "공감·표현형",
      icon: Heart,
      types: [...TEN_GOD_GROUPS.empathy],
    },
    {
      category: "logic",
      label: "규범·실무형",
      icon: Shield,
      types: [...TEN_GOD_GROUPS.logic],
    },
  ];

  return categories.map((cat) => {
    const aScore = getScore(a, cat.types);
    const bScore = getScore(b, cat.types);
    const winner: Winner = aScore > bScore ? "A" : bScore > aScore ? "B" : "Draw";

    return {
      category: cat.category,
      label: cat.label,
      icon: cat.icon,
      winner,
      descA: winner === "A" ? `${cat.label} 우위` : winner === "Draw" ? "균형" : "상대 우위",
      descB: winner === "B" ? `${cat.label} 우위` : winner === "Draw" ? "균형" : "상대 우위",
    };
  });
}

export default function VSModePage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params?.id as string;

  const [mainProfile, setMainProfile] = useState<SajuProfile | null>(null);
  const [targetProfile, setTargetProfile] = useState<SajuProfile | null>(null);
  const [sajuA, setSajuA] = useState<HighPrecisionSajuResult | null>(null);
  const [sajuB, setSajuB] = useState<HighPrecisionSajuResult | null>(null);
  const [analysis, setAnalysis] = useState<RelationshipAnalysis | null>(null);
  const [winners, setWinners] = useState<TraitWinner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shareMessage, setShareMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const profiles = getProfiles();
        if (profiles.length < 2) {
          router.push("/dashboard");
          return;
        }

        const main = profiles[0];
        const target = profiles.find((p) => p.id === profileId);
        if (!target) {
          router.push("/dashboard");
          return;
        }

        const mainBirthDate = parseCivilDate(main.birthdate) ?? new Date(1990, 0, 1, 12, 0, 0, 0);
        const targetBirthDate = parseCivilDate(target.birthdate) ?? new Date(1990, 0, 1, 12, 0, 0, 0);
        const resA = await calculateHighPrecisionSaju({
          birthDate: mainBirthDate,
          birthTime: main.birthTime || "12:00",
          gender: main.gender === "male" ? "M" : "F",
          calendarType: main.calendarType,
        });

        const resB = await calculateHighPrecisionSaju({
          birthDate: targetBirthDate,
          birthTime: target.birthTime || "12:00",
          gender: target.gender === "male" ? "M" : "F",
          calendarType: target.calendarType,
        });

        setMainProfile(main);
        setTargetProfile(target);
        setSajuA(resA);
        setSajuB(resB);
        setAnalysis(analyzeRelationship(resA, resB, target.relationship as any));
        setWinners(getTraitWinners(resA, resB));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [profileId, router]);

  const combinedTerms = useMemo(() => {
    if (!sajuA || !sajuB) return [];
    const set = new Set<string>([...Object.values(sajuA.sipsong), ...Object.values(sajuB.sipsong)]);
    return Array.from(set).slice(0, 8);
  }, [sajuA, sajuB]);

  const handleSaveResult = () => {
    if (!analysis || !sajuA || !sajuB || !mainProfile || !targetProfile || isSaving) return;

    setIsSaving(true);
    try {
      const saved = saveAnalysisToHistory({
        type: "SAJU",
        title: "궁합 VS 분석",
        subtitle: `${mainProfile.name} vs ${targetProfile.name} / 점수 ${analysis.score}점`,
        profileId: targetProfile.id,
        profileName: `${mainProfile.name} / ${targetProfile.name}`,
        resultUrl: `/relationship/${profileId}/vs`,
        result: {
          mode: "relationship-vs",
          score: analysis.score,
          chemistry: analysis.chemistry,
          tension: analysis.tension,
          advice: analysis.advice,
          futurePredict: analysis.futurePredict,
          winners,
          combinedTerms,
          sajuA,
          sajuB,
          profileA: {
            id: mainProfile.id,
            name: mainProfile.name,
            birthdate: mainProfile.birthdate,
          },
          profileB: {
            id: targetProfile.id,
            name: targetProfile.name,
            birthdate: targetProfile.birthdate,
          },
          createdAt: new Date().toISOString(),
        },
      });

      if (saved) {
        setShareMessage("분석 결과를 기록에 저장했습니다.");
      } else {
        setShareMessage("기록 저장에 실패했습니다.");
      }
    } finally {
      setIsSaving(false);
      window.setTimeout(() => setShareMessage(""), 2500);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-secondary">궁합 비교를 불러오는 중...</p>
      </main>
    );
  }

  if (!sajuA || !sajuB || !analysis) return null;

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      <div className="max-w-6xl mx-auto px-5 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </button>
          <div className="text-center">
            <p className="text-xs text-indigo-300 font-bold tracking-widest">궁합 VS 분석</p>
            <h1 className="text-xl font-black">
              <span className="text-indigo-300">{mainProfile?.name}</span> vs <span>{targetProfile?.name}</span>
            </h1>
            {shareMessage && <p className="text-xs text-slate-400 mt-1">{shareMessage}</p>}
          </div>
          <KakaoShareButton
            title={`${mainProfile?.name ?? "A"} vs ${targetProfile?.name ?? "B"} 궁합 분석`}
            description={`궁합 점수 ${analysis?.score ?? 0}점`}
            score={analysis?.score}
            profileName={`${mainProfile?.name ?? "A"} vs ${targetProfile?.name ?? "B"}`}
            className="w-10 h-10 rounded-xl bg-[#FEE500] border border-white/10 flex items-center justify-center"
          >
            <span className="w-4 h-4 text-slate-900">공유</span>
          </KakaoShareButton>
        </header>

        <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-5">
          <p className="text-sm font-bold text-slate-200 mb-3">오행 레이더 비교</p>
          <div className="flex justify-center">
            <RadarChart dataA={sajuA.elements.scores as any} dataB={sajuB.elements.scores as any} size={320} />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <ResultSummaryCard
            title="💞 Who You Are"
            tone="border-indigo-400/30 bg-indigo-500/10"
            body={`${mainProfile?.name}님과 ${targetProfile?.name}님의 비교 결과는 ${analysis.score}점입니다. 이 관계는 감정 호감 하나만으로 읽기보다, 실제 생활 리듬과 의사결정 스타일이 얼마나 맞물리는지로 보는 편이 더 정확합니다.`}
          />
          <ResultSummaryCard
            title="📚 Why It Happens"
            tone="border-cyan-400/30 bg-cyan-500/10"
            body={`${analysis.chemistry}${analysis.tension ? ` 반면 ${analysis.tension}` : ""} 즉, 잘 맞는 축과 부딪히는 축이 동시에 보여서 어느 한쪽만 강조하면 관계 해석이 과장될 수 있습니다.`}
          />
          <ResultSummaryCard
            title="✨ What To Do"
            tone="border-emerald-400/30 bg-emerald-500/10"
            body={`${analysis.advice} 지금 단계에서는 승패를 가르기보다, 누가 리드할 때 편한지와 어떤 주제에서 방어가 올라오는지를 먼저 확인하는 것이 가장 실전적입니다.`}
          />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {winners.map((w) => (
            <div key={w.category} className="rounded-2xl border border-white/10 bg-slate-900/30 p-4">
              <div className="flex items-center gap-2 text-slate-200">
                <w.icon className="w-4 h-4 text-indigo-300" />
                <p className="text-sm font-bold">{w.label}</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="text-slate-400">{mainProfile?.name}</p>
                  <p className="text-white font-bold mt-1">{w.descA}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="text-slate-400">{targetProfile?.name}</p>
                  <p className="text-white font-bold mt-1">{w.descB}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-5">
          <p className="text-sm font-bold text-white mb-3">만세력 4주 비교 (한자/오행)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[{ label: mainProfile?.name ?? "A", saju: sajuA }, { label: targetProfile?.name ?? "B", saju: sajuB }].map((person) => (
              <div key={person.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-sm font-black text-indigo-200 mb-3">{person.label}</p>
                <div className="grid grid-cols-4 gap-2">
                  {PILLAR_ORDER.map((k) => {
                    const p = person.saju.fourPillars[k];
                    const stem = getStemInfo(p?.stemIndex);
                    const branch = getBranchInfo(p?.branchIndex);
                    return (
                      <div key={`${person.label}-${k}`} className="rounded-xl border border-white/10 bg-slate-950/40 p-2">
                        <p className="text-[10px] text-slate-400 font-bold">{PILLAR_LABEL[k]}</p>
                        <div className={`mt-1 rounded border px-2 py-1 ${elementTone(stem.element)}`}>
                          <p className="text-lg font-black leading-none">{stem.hanja}</p>
                          <p className="text-[10px]">{stem.ko}·{stem.element}</p>
                        </div>
                        <div className={`mt-1 rounded border px-2 py-1 ${elementTone(branch.element)}`}>
                          <p className="text-lg font-black leading-none">{branch.hanja}</p>
                          <p className="text-[10px]">{branch.ko}·{branch.element}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-5">
          <p className="text-sm font-bold text-white mb-3">십성 용어 설명</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {combinedTerms.map((term) => {
              const guide = getTenGodGuide(term);
              return (
                <div key={term} className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="text-sm font-black text-white">{guide.term}{guide.hanja ? ` (${guide.hanja})` : ""}</p>
                  <p className="text-xs text-slate-300 mt-1">{guide.plain}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSaveResult}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold"
          >
            {isSaving ? "저장 중..." : "결과 저장"}
          </button>
          <Link href={`/relationship/${profileId}`} className="flex-1 py-3 rounded-xl border border-white/15 bg-white/5 text-center font-semibold text-slate-100">
            상세 분석 보기
          </Link>
        </div>
      </div>
    </main>
  );
}
