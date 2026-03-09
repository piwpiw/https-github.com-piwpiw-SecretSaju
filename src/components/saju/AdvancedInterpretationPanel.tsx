"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, FlaskConical, ShieldCheck, Sparkles } from "lucide-react";
import { ELEMENT_ACTIONS, getTenGodGuide } from "@/lib/saju/terminology";

type PillarKey = "year" | "month" | "day" | "hour";

type SinsalItem = {
  type?: string;
  name?: string;
  pillar?: PillarKey;
  description?: string;
};

type GanjiLike = {
  stem?: string;
  branch?: string;
  stemIndex?: number;
  branchIndex?: number;
};

type PanelResult = {
  fourPillars?: Record<PillarKey, GanjiLike>;
  sipsong?: Record<string, string>;
  sibiwoonseong?: Record<string, string>;
  sinsal?: SinsalItem[];
  elementScores?: number[];
  version?: string;
  integrity?: string;
};

type ProfileInfo = {
  name?: string;
  birthdate?: string;
  birthTime?: string;
  calendarType?: "solar" | "lunar";
  gender?: "male" | "female";
  relationship?: string;
};

type Props = {
  result: PanelResult;
  profile?: ProfileInfo;
  dayAnimalName?: string;
};

type StemInfo = { ko: string; hanja: string; element: "목" | "화" | "토" | "금" | "수" };
type BranchInfo = { ko: string; hanja: string; element: "목" | "화" | "토" | "금" | "수"; animal: string };

const PILLAR_ORDER: PillarKey[] = ["hour", "day", "month", "year"];
const PILLAR_LABELS: Record<PillarKey, string> = { hour: "시주", day: "일주", month: "월주", year: "년주" };

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
  { ko: "자", hanja: "子", element: "수", animal: "쥐" },
  { ko: "축", hanja: "丑", element: "토", animal: "소" },
  { ko: "인", hanja: "寅", element: "목", animal: "호랑이" },
  { ko: "묘", hanja: "卯", element: "목", animal: "토끼" },
  { ko: "진", hanja: "辰", element: "토", animal: "용" },
  { ko: "사", hanja: "巳", element: "화", animal: "뱀" },
  { ko: "오", hanja: "午", element: "화", animal: "말" },
  { ko: "미", hanja: "未", element: "토", animal: "양" },
  { ko: "신", hanja: "申", element: "금", animal: "원숭이" },
  { ko: "유", hanja: "酉", element: "금", animal: "닭" },
  { ko: "술", hanja: "戌", element: "토", animal: "개" },
  { ko: "해", hanja: "亥", element: "수", animal: "돼지" },
];

const TEN_GOD_KEYS: { key: string; label: string }[] = [
  { key: "monthStem", label: "월간 십성" },
  { key: "monthBranch", label: "월지 십성" },
  { key: "dayBranch", label: "일지 십성" },
  { key: "yearStem", label: "년간 십성" },
  { key: "yearBranch", label: "년지 십성" },
  { key: "hourStem", label: "시간 십성" },
  { key: "hourBranch", label: "시지 십성" },
];

const RELATION_KO: Record<string, string> = {
  self: "본인",
  spouse: "배우자",
  child: "자녀",
  parent: "부모",
  friend: "친구",
  lover: "연인",
  other: "기타",
};

const SIBIWOONSEONG_GUIDE: Record<string, string> = {
  장생: "새로운 흐름이 시작되는 단계",
  목욕: "경험을 넓히며 방향을 탐색하는 단계",
  관대: "역할이 커지고 책임이 늘어나는 단계",
  건록: "실행력이 안정적으로 강해지는 단계",
  제왕: "기운이 가장 강한 정점 단계",
  쇠: "에너지가 서서히 내려오는 단계",
  병: "체력과 집중 관리를 우선해야 하는 단계",
  사: "정리와 마무리, 내려놓음의 단계",
  묘: "내면 정비와 전환 준비의 단계",
  절: "기존 패턴을 끊고 재구성하는 단계",
  태: "새 씨앗이 준비되는 단계",
  양: "성장을 위한 기반이 자라는 단계",
};

const SINSAL_GUIDE: Record<string, string> = {
  도화살: "매력과 대인 주목도가 높아지는 신호",
  역마살: "이동·변화·확장 이슈가 많아지는 신호",
  화개살: "예술·종교·내면 성찰 성향이 강해지는 신호",
  천을귀인: "도움 인연과 보호 운이 들어오는 신호",
  문창귀인: "학습·문서·연구 역량이 살아나는 신호",
  백호살: "강한 추진과 충돌 가능성을 함께 가지는 신호",
  괴강살: "리더십·결단이 강해지는 대신 완급 조절이 필요한 신호",
};

function getDominantElement(scores: number[] = []): "목" | "화" | "토" | "금" | "수" {
  if (!scores.length) return "토";
  const idx = scores.indexOf(Math.max(...scores));
  return (["목", "화", "토", "금", "수"][idx] as "목" | "화" | "토" | "금" | "수") ?? "토";
}

function formatBirthDate(value?: string): string {
  if (!value) return "-";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${y}년 ${m}월 ${d}일`;
}

function elementTone(element: string) {
  if (element === "목") return "bg-emerald-500/20 border-emerald-400/40 text-emerald-100";
  if (element === "화") return "bg-rose-500/20 border-rose-400/40 text-rose-100";
  if (element === "토") return "bg-amber-500/20 border-amber-400/40 text-amber-100";
  if (element === "금") return "bg-slate-500/20 border-slate-300/40 text-slate-100";
  return "bg-blue-500/20 border-blue-400/40 text-blue-100";
}

function getStemInfo(ganji?: GanjiLike): StemInfo {
  if (typeof ganji?.stemIndex === "number" && ganji.stemIndex >= 0 && ganji.stemIndex < STEMS.length) {
    return STEMS[ganji.stemIndex];
  }
  return STEMS[4];
}

function getBranchInfo(ganji?: GanjiLike): BranchInfo {
  if (typeof ganji?.branchIndex === "number" && ganji.branchIndex >= 0 && ganji.branchIndex < BRANCHES.length) {
    return BRANCHES[ganji.branchIndex];
  }
  return BRANCHES[0];
}

function getPillarSipsongKey(pillar: PillarKey, kind: "stem" | "branch"): string {
  if (pillar === "year") return kind === "stem" ? "yearStem" : "yearBranch";
  if (pillar === "month") return kind === "stem" ? "monthStem" : "monthBranch";
  if (pillar === "hour") return kind === "stem" ? "hourStem" : "hourBranch";
  return kind === "stem" ? "" : "dayBranch";
}

export default function AdvancedInterpretationPanel({ result, profile, dayAnimalName }: Props) {
  const [mode, setMode] = useState<"easy" | "expert">("easy");

  const tenGodItems = useMemo(() => {
    const source = result.sipsong ?? {};
    return TEN_GOD_KEYS.map(({ key, label }) => ({ key, label, term: source[key] })).filter((item) => Boolean(item.term));
  }, [result.sipsong]);

  const [selectedTerm, setSelectedTerm] = useState<string>(tenGodItems[0]?.term ?? "정재");

  useEffect(() => {
    if (tenGodItems.length > 0) setSelectedTerm(tenGodItems[0].term);
  }, [tenGodItems]);

  const termGuide = getTenGodGuide(selectedTerm);
  const dominantElement = getDominantElement(result.elementScores);
  const actions = ELEMENT_ACTIONS[dominantElement] ?? Object.values(ELEMENT_ACTIONS)[0] ?? [];
  const sinsalTop = (result.sinsal ?? []).slice(0, 8);

  const normalizedPillars = useMemo(() => {
    const four = result.fourPillars ?? ({} as Record<PillarKey, GanjiLike>);
    return PILLAR_ORDER.map((pillar) => {
      const raw = four[pillar];
      return {
        pillar,
        label: PILLAR_LABELS[pillar],
        stem: getStemInfo(raw),
        branch: getBranchInfo(raw),
        stemTenGod: getPillarSipsongKey(pillar, "stem") ? result.sipsong?.[getPillarSipsongKey(pillar, "stem")] ?? "-" : "일원",
        branchTenGod: result.sipsong?.[getPillarSipsongKey(pillar, "branch")] ?? "-",
        phase: result.sibiwoonseong?.[pillar] ?? "-",
      };
    });
  }, [result.fourPillars, result.sipsong, result.sibiwoonseong]);

  const dayBranchAnimal = normalizedPillars.find((item) => item.pillar === "day")?.branch.animal ?? "쥐";
  const dayAnimal = dayBranchAnimal || dayAnimalName || "쥐";

  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">사주 상세 해석</h3>
          <p className="text-sm text-slate-300 mt-1">타 시스템 대비 누락되기 쉬운 만세력 핵심(한자·색상·용어 설명)을 통합했습니다.</p>
        </div>
        <div className="flex items-center rounded-full border border-white/10 bg-black/30 p-1">
          <button onClick={() => setMode("easy")} className={`px-4 py-1.5 text-xs font-bold rounded-full transition ${mode === "easy" ? "bg-indigo-500 text-white" : "text-slate-300"}`}>
            쉬운 해석
          </button>
          <button onClick={() => setMode("expert")} className={`px-4 py-1.5 text-xs font-bold rounded-full transition ${mode === "expert" ? "bg-indigo-500 text-white" : "text-slate-300"}`}>
            전문 근거
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="flex items-center gap-2 text-amber-300 mb-3">
          <Sparkles className="w-4 h-4" />
          <p className="text-sm font-bold">프로필 요약</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-slate-200">이름: {profile?.name ?? "-"}</div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-slate-200">생일: {formatBirthDate(profile?.birthdate)}</div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-slate-200">출생시각: {profile?.birthTime ?? "-"}</div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-slate-200">달력: {profile?.calendarType === "lunar" ? "음력" : "양력"}</div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-slate-200">성별: {profile?.gender === "female" ? "여성" : profile?.gender === "male" ? "남성" : "-"}</div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-slate-200">관계: {profile?.relationship ? RELATION_KO[profile.relationship] ?? profile.relationship : "-"}</div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-slate-200">일주 동물: {dayAnimal}</div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-slate-200">주도 오행: {dominantElement}</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
        <p className="text-sm font-bold text-white mb-3">정통 만세력 표</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {normalizedPillars.map((item) => (
            <div key={item.pillar} className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
              <p className="text-xs font-bold text-slate-300">{item.label}</p>
              <p className="text-xs text-slate-400 mt-1">천간 십성: {item.stemTenGod}</p>
              <div className={`mt-2 rounded-lg border p-2 ${elementTone(item.stem.element)}`}>
                <p className="text-2xl font-black leading-none">{item.stem.hanja}</p>
                <p className="text-xs mt-1">{item.stem.ko} · {item.stem.element}</p>
              </div>
              <div className={`mt-2 rounded-lg border p-2 ${elementTone(item.branch.element)}`}>
                <p className="text-2xl font-black leading-none">{item.branch.hanja}</p>
                <p className="text-xs mt-1">{item.branch.ko} · {item.branch.element}</p>
              </div>
              <p className="text-xs text-slate-300 mt-2">지지 십성: {item.branchTenGod}</p>
              <p className="text-xs text-slate-300">12운성: {item.phase}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          {["목", "화", "토", "금", "수"].map((el) => (
            <span key={el} className={`px-2 py-1 rounded-full border ${elementTone(el)}`}>{el} 오행 색상 기준</span>
          ))}
        </div>
      </div>

      {mode === "easy" && (
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="flex items-center gap-2 mb-3 text-indigo-300">
              <BookOpen className="w-4 h-4" />
              <p className="text-sm font-bold">십성 쉬운 해설</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {tenGodItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSelectedTerm(item.term)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${selectedTerm === item.term ? "border-indigo-400 bg-indigo-500/20 text-indigo-100" : "border-white/15 bg-white/5 text-slate-300"}`}
                >
                  {item.term}
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-slate-950/60 border border-white/10 p-3">
              <p className="text-sm font-black text-white">{termGuide.term}{termGuide.hanja ? ` (${termGuide.hanja})` : ""}</p>
              <p className="text-sm text-slate-300 mt-2">{termGuide.plain}</p>
              <p className="text-xs text-emerald-300 mt-3">강점: {termGuide.strengths.join(", ")}</p>
              <p className="text-xs text-amber-300 mt-1">주의: {termGuide.cautions.join(", ")}</p>
              <p className="text-xs text-cyan-300 mt-1">행동 가이드: {termGuide.actionTip}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3 text-cyan-300">
                <FlaskConical className="w-4 h-4" />
                <p className="text-sm font-bold">오늘의 오행 제안</p>
              </div>
              <ul className="space-y-2 text-sm text-slate-200">
                {actions.map((action, idx) => (
                  <li key={idx} className="rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2">{idx + 1}. {action}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold text-pink-300 mb-2">신살·귀인 요약</p>
              {sinsalTop.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {sinsalTop.map((item, idx) => (
                    <span key={`${item.name}-${idx}`} className="px-3 py-1 text-xs rounded-full border border-pink-400/30 bg-pink-500/10 text-pink-100">{item.name ?? item.type}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">표시할 신살 데이터가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {mode === "expert" && (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
            <div className="flex items-center gap-2 text-indigo-200 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <p className="text-sm font-bold">해석 근거</p>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              기준: 일간 기준 십성 산출, 지지 기반 12운성, 사주 4기둥 구조, 신살·귀인 패턴을 함께 사용합니다.
              용어는 정통 기준(예: 정재, 편인, 관대, 화개살)을 유지하고 설명만 사용자 친화적으로 제공합니다.
            </p>
            <p className="text-[11px] text-slate-400 mt-2">엔진: {result.version ?? "-"} | 무결성: {(result.integrity ?? "-").slice(0, 20)}...</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-sm font-bold text-white mb-2">용어 설명: 12운성</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(SIBIWOONSEONG_GUIDE).map(([name, desc]) => (
                <div key={name} className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2">
                  <p className="text-xs font-bold text-slate-100">{name}</p>
                  <p className="text-xs text-slate-400 mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-sm font-bold text-white mb-2">신살·귀인 상세</p>
            {sinsalTop.length > 0 ? (
              <div className="space-y-2">
                {sinsalTop.map((item, idx) => {
                  const title = item.name ?? item.type ?? "신살";
                  const fallbackDesc = SINSAL_GUIDE[title] ?? "신살 해석은 관계 맥락과 함께 읽어야 정확합니다.";
                  return (
                    <div key={`sinsal-${idx}`} className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2">
                      <p className="text-xs font-bold text-slate-100">{title} · {item.pillar ?? "-"}주</p>
                      <p className="text-xs text-slate-300 mt-1">{item.description ?? fallbackDesc}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400">표시할 신살 데이터가 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
