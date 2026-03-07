"use client";

import { motion } from "framer-motion";
import { type ReactNode, useState } from "react";
import { AgeGroup } from "@/lib/archetypes";
import type { CanonicalSajuFeatures, EvidenceEntry } from "@/core/api/saju-canonical";
import KeywordChips from "@/components/result/KeywordChips";
import InteractiveInsightLab from "@/components/result/InteractiveInsightLab";
import ShareCard from "@/components/result/ShareCard";
import PillarVisualizer from "@/components/result/PillarVisualizer";
import SvgChart from "@/components/ui/SvgChart";
import AmbientSoundPortal from "@/components/ui/AmbientSoundPortal";
import ReadingProgressBar from "@/components/ui/ReadingProgressBar";
import AIIntelligenceBadge from "@/components/ui/AIIntelligenceBadge";
import AINarrativeSection from "@/components/result/AINarrativeSection";
import { CalendarDays, Lock, Target, TrendingUp, Orbit, Crown, Flame, Gem, ChevronRight } from "lucide-react";

type Archetype = {
  code: string;
  animal_name: string;
  base_traits: {
    mask: string;
    hashtags: string[];
  };
  displayHook: string;
  displaySecretPreview: string;
};

type Props = {
  archetype: Archetype;
  personName?: string;
  analysisMeta?: {
    source: "high-precision" | "fallback";
    qualityScore: number;
    reliability: "high" | "medium" | "low";
    warnings: string[];
    calendarType: "solar" | "lunar";
    timeUnknownFallbackUsed: boolean;
    usedLocation: string;
    officialCalendarYear?: number | null;
    myeongriCalendarYear?: number;
  };
  pillarNameKo: string;
  ageGroup: AgeGroup;
  elementScores: number[];
  elementCounts: number[];
  elementBasicPercentages: number[];
  fourPillars: any;
  daewun?: any;
  gyeokguk?: any;
  gangyak?: {
    deukryeong?: number;
    deukji?: number;
    deukse?: number;
    total?: number;
    level?: string;
    description?: string;
  };
  yongshin?: {
    primary?: { element?: string; reason?: string };
    secondary?: { element?: string; reason?: string };
    unfavorable?: { element?: string; reason?: string };
    source?: string;
  };
  sipsong?: Record<string, string>;
  sibiwoonseong?: Record<string, string>;
  version?: string;
  integrity?: string;
  isTimeUnknown?: boolean;
  canonicalFeatures?: CanonicalSajuFeatures;
  evidence?: EvidenceEntry[];
  secretUnlocked?: boolean;
  onUnlockClick?: () => void;
  onInsufficientJelly?: () => void;
};

type MetricCard = {
  label: string;
  value: string;
  color: string;
  icon: ReactNode;
};

type InsightFocus = "base" | "love" | "money" | "career";

function InfoTip({ title, description }: { title: string; description: string }) {
  return (
    <span className="relative inline-flex items-center group align-middle">
      <button
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/30 text-[10px] font-black leading-none text-white/80 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        aria-label={`${title} 설명`}
      >
        i
      </button>
      <span className="pointer-events-none absolute left-1/2 top-6 z-20 w-56 -translate-x-1/2 whitespace-normal rounded-lg border border-white/15 bg-slate-950/95 px-3 py-2 text-[11px] leading-relaxed text-slate-100 opacity-0 shadow-2xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <strong className="block text-indigo-200 mb-1">{title}</strong>
        {description}
      </span>
    </span>
  );
}

type PillarView = {
  key: "year" | "month" | "day" | "hour";
  labelKo: string;
  labelHanja: string;
  stemRaw: string;
  branchRaw: string;
  stemKo: string;
  stemHanja: string;
  stemElement: string;
  stemEmoji: string;
  branchKo: string;
  branchHanja: string;
  branchAnimalKo: string;
  branchEmoji: string;
  meaning: string;
};

const ELEMENTS = [
  { key: "목(木)", label: "목(木)", emoji: "🌳", meaning: "성장·기획·확장", glow: "34,197,94", bar: "bg-emerald-400" },
  { key: "화(火)", label: "화(火)", emoji: "🔥", meaning: "표현·열정·행동", glow: "244,63,94", bar: "bg-rose-400" },
  { key: "토(土)", label: "토(土)", emoji: "⛰️", meaning: "안정·중재·관리", glow: "245,158,11", bar: "bg-amber-300" },
  { key: "금(金)", label: "금(金)", emoji: "⚔️", meaning: "결단·원칙·정리", glow: "203,213,225", bar: "bg-slate-200" },
  { key: "수(水)", label: "수(水)", emoji: "🌊", meaning: "지혜·통찰·유연", glow: "99,102,241", bar: "bg-indigo-300" },
] as const;

const STEM_META: Record<string, { ko: string; hanja: string; element: string; emoji: string }> = {
  "甲": { ko: "갑", hanja: "甲", element: "목(木)", emoji: "🌳" },
  "乙": { ko: "을", hanja: "乙", element: "목(木)", emoji: "🌿" },
  "丙": { ko: "병", hanja: "丙", element: "화(火)", emoji: "🔥" },
  "丁": { ko: "정", hanja: "丁", element: "화(火)", emoji: "🕯️" },
  "戊": { ko: "무", hanja: "戊", element: "토(土)", emoji: "⛰️" },
  "己": { ko: "기", hanja: "己", element: "토(土)", emoji: "🏞️" },
  "庚": { ko: "경", hanja: "庚", element: "금(金)", emoji: "⚔️" },
  "辛": { ko: "신", hanja: "辛", element: "금(金)", emoji: "💎" },
  "壬": { ko: "임", hanja: "壬", element: "수(水)", emoji: "🌊" },
  "癸": { ko: "계", hanja: "癸", element: "수(水)", emoji: "💧" },
  "갑": { ko: "갑", hanja: "甲", element: "목(木)", emoji: "🌳" },
  "을": { ko: "을", hanja: "乙", element: "목(木)", emoji: "🌿" },
  "병": { ko: "병", hanja: "丙", element: "화(火)", emoji: "🔥" },
  "정": { ko: "정", hanja: "丁", element: "화(火)", emoji: "🕯️" },
  "무": { ko: "무", hanja: "戊", element: "토(土)", emoji: "⛰️" },
  "기": { ko: "기", hanja: "己", element: "토(土)", emoji: "🏞️" },
  "경": { ko: "경", hanja: "庚", element: "금(金)", emoji: "⚔️" },
  "신": { ko: "신", hanja: "辛", element: "금(金)", emoji: "💎" },
  "임": { ko: "임", hanja: "壬", element: "수(水)", emoji: "🌊" },
  "계": { ko: "계", hanja: "癸", element: "수(水)", emoji: "💧" },
};

const BRANCH_META: Record<string, { ko: string; hanja: string; animalKo: string; emoji: string }> = {
  "子": { ko: "자", hanja: "子", animalKo: "쥐", emoji: "🐭" },
  "丑": { ko: "축", hanja: "丑", animalKo: "소", emoji: "🐮" },
  "寅": { ko: "인", hanja: "寅", animalKo: "호랑이", emoji: "🐯" },
  "卯": { ko: "묘", hanja: "卯", animalKo: "토끼", emoji: "🐰" },
  "辰": { ko: "진", hanja: "辰", animalKo: "용", emoji: "🐲" },
  "巳": { ko: "사", hanja: "巳", animalKo: "뱀", emoji: "🐍" },
  "午": { ko: "오", hanja: "午", animalKo: "말", emoji: "🐴" },
  "未": { ko: "미", hanja: "未", animalKo: "양", emoji: "🐑" },
  "申": { ko: "신", hanja: "申", animalKo: "원숭이", emoji: "🐵" },
  "酉": { ko: "유", hanja: "酉", animalKo: "닭", emoji: "🐔" },
  "戌": { ko: "술", hanja: "戌", animalKo: "개", emoji: "🐶" },
  "亥": { ko: "해", hanja: "亥", animalKo: "돼지", emoji: "🐷" },
  "자": { ko: "자", hanja: "子", animalKo: "쥐", emoji: "🐭" },
  "축": { ko: "축", hanja: "丑", animalKo: "소", emoji: "🐮" },
  "인": { ko: "인", hanja: "寅", animalKo: "호랑이", emoji: "🐯" },
  "묘": { ko: "묘", hanja: "卯", animalKo: "토끼", emoji: "🐰" },
  "진": { ko: "진", hanja: "辰", animalKo: "용", emoji: "🐲" },
  "사": { ko: "사", hanja: "巳", animalKo: "뱀", emoji: "🐍" },
  "오": { ko: "오", hanja: "午", animalKo: "말", emoji: "🐴" },
  "미": { ko: "미", hanja: "未", animalKo: "양", emoji: "🐑" },
  "신": { ko: "신", hanja: "申", animalKo: "원숭이", emoji: "🐵" },
  "유": { ko: "유", hanja: "酉", animalKo: "닭", emoji: "🐔" },
  "술": { ko: "술", hanja: "戌", animalKo: "개", emoji: "🐶" },
  "해": { ko: "해", hanja: "亥", animalKo: "돼지", emoji: "🐷" },
};

const PILLAR_META = {
  year: { labelKo: "년주", labelHanja: "年柱", meaning: "가문·조상·초년의 흐름" },
  month: { labelKo: "월주", labelHanja: "月柱", meaning: "사회성·직업·성장 환경" },
  day: { labelKo: "일주", labelHanja: "日柱", meaning: "본인 기질·관계의 중심" },
  hour: { labelKo: "시주", labelHanja: "時柱", meaning: "후반 인생·자녀·내면" },
} as const;

const ageGroupToKo = (ageGroup: AgeGroup): string => {
  if (ageGroup === "10s") return "10대";
  if (ageGroup === "20s") return "20대";
  if (ageGroup === "30s") return "30대";
  if (ageGroup === "40s") return "40대";
  if (ageGroup === "50s") return "50대";
  if (ageGroup === "60s") return "60대";
  return ageGroup;
};

const cleanText = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  if (!value.trim()) return fallback;
  return value;
};

const toArray = (items: number[] | undefined, fallback: number[]) => {
  const safe = Array.isArray(items) ? items : [];
  return [...safe, ...fallback].slice(0, fallback.length);
};

const toPercent = (value: number, total: number) => {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
};

const getGangyakTone = (level?: string) => {
  if (level === "신강") return "text-rose-200 border-rose-300/30 bg-rose-500/10";
  if (level === "신약") return "text-cyan-200 border-cyan-300/30 bg-cyan-500/10";
  return "text-emerald-200 border-emerald-300/30 bg-emerald-500/10";
};

const getElementGlow = (element?: string) => {
  if (element?.includes("목") || element === "목") return "from-emerald-500/25 to-emerald-900/10 border-emerald-300/25";
  if (element?.includes("화") || element === "화") return "from-rose-500/25 to-rose-900/10 border-rose-300/25";
  if (element?.includes("토") || element === "토") return "from-amber-500/25 to-amber-900/10 border-amber-300/25";
  if (element?.includes("금") || element === "금") return "from-slate-200/25 to-slate-800/20 border-slate-200/25";
  return "from-sky-500/25 to-indigo-900/20 border-sky-300/25";
};

const getSpecialPatternLabel = (pattern?: string) => {
  if (pattern === "jonggyeok") return "종격 신호";
  if (pattern === "jeonwanggyeok") return "전왕격 신호";
  if (pattern === "hwagyeok") return "화격 신호";
  return "일반격";
};

const buildDetailedHook = ({
  hook,
  topElement,
  lowElement,
  strongestTenGod,
}: {
  hook: string;
  topElement: string;
  lowElement: string;
  strongestTenGod: string;
}) =>
  `🧭 ${hook} 🌟 현재 흐름에서는 ${topElement} 기운이 전면에 나와 성향과 실행 방식을 끌고 가고, ${strongestTenGod} 축이 반복 패턴을 만듭니다. ` +
  `🪄 반대로 ${lowElement} 기운은 의식적으로 보완할수록 관계, 돈, 일의 균형이 더 안정적으로 잡힙니다.`;

const buildDetailedPremiumPreview = ({
  preview,
  focus,
}: {
  preview: string;
  focus: InsightFocus;
}) => {
  const focusCopy =
    focus === "love"
      ? "💞 연애에서는 감정 리듬, 표현 방식, 반복 충돌 포인트까지"
      : focus === "money"
        ? "💰 재물에서는 소비 누수, 축적 타이밍, 위험 구간까지"
        : focus === "career"
          ? "💼 커리어에서는 역할 적성, 성과 방식, 확장 시점까지"
          : "📘 전체 운에서는 용신 전략, 십성 포지션, 실행 타이밍까지";
  return `${preview} ${focusCopy} 근거 중심으로 더 자세히 이어집니다.`;
};

const buildIdentitySummary = ({
  strongestElement,
  strongestTenGod,
}: {
  strongestElement: string;
  strongestTenGod: string;
}) => `🧭 당신은 ${strongestElement} 기운을 중심으로 움직이며, ${strongestTenGod} 방식으로 강점을 드러내는 타입에 가깝습니다.`;

const buildReasonSummary = ({
  strongestElement,
  weakestElement,
  gangyakLevel,
}: {
  strongestElement: string;
  weakestElement: string;
  gangyakLevel: string;
}) => `📚 이유는 ${strongestElement} 축이 전면에 서 있고 ${weakestElement} 축은 상대적으로 약해 균형이 한쪽으로 기울기 쉽기 때문입니다. 현재 강약 상태는 ${gangyakLevel} 쪽으로 읽힙니다.`;

const buildActionSummary = ({
  focus,
  primaryElement,
}: {
  focus: InsightFocus;
  primaryElement?: string;
}) => {
  if (focus === "love") {
    return `💞 지금은 감정 표현을 서두르기보다, ${primaryElement ?? "핵심"} 기운이 편안하게 드러나는 관계 리듬을 먼저 만드는 편이 좋습니다.`;
  }
  if (focus === "money") {
    return `💰 지금은 크게 벌리는 선택보다, ${primaryElement ?? "핵심"} 기운을 살려 새는 흐름을 막고 남기는 구조를 만드는 편이 유리합니다.`;
  }
  if (focus === "career") {
    return `💼 지금은 무작정 확장하기보다, ${primaryElement ?? "핵심"} 기운이 가장 잘 발휘되는 역할과 포지션을 선명하게 잡는 편이 성과로 이어집니다.`;
  }
  return `✨ 지금은 ${primaryElement ?? "핵심"} 기운을 기준으로 잘하는 일에 힘을 모으고, 부족한 축은 천천히 보완하는 방식이 가장 안정적입니다.`;
};

const SIPSONG_LABELS = [
  "비견",
  "겁재",
  "식신",
  "상관",
  "편재",
  "정재",
  "편관",
  "정관",
  "편인",
  "정인",
];

const parsePillar = (key: "year" | "month" | "day" | "hour", rawPillar: any): PillarView => {
  const stemRaw = cleanText(rawPillar?.stem, "-");
  const branchRaw = cleanText(rawPillar?.branch, "-");
  const stem = STEM_META[stemRaw] ?? { ko: stemRaw, hanja: stemRaw, element: "미상", emoji: "✨" };
  const branch = BRANCH_META[branchRaw] ?? { ko: branchRaw, hanja: branchRaw, animalKo: "미상", emoji: "🐾" };
  const base = PILLAR_META[key];
  return {
    key,
    labelKo: base.labelKo,
    labelHanja: base.labelHanja,
    stemRaw,
    branchRaw,
    stemKo: stem.ko,
    stemHanja: stem.hanja,
    stemElement: stem.element,
    stemEmoji: stem.emoji,
    branchKo: branch.ko,
    branchHanja: branch.hanja,
    branchAnimalKo: branch.animalKo,
    branchEmoji: branch.emoji,
    meaning: base.meaning,
  };
};

function ResultCard({
  archetype,
  personName,
  pillarNameKo,
  ageGroup,
  elementScores,
  elementCounts,
  elementBasicPercentages,
  fourPillars,
  analysisMeta,
  daewun,
  gyeokguk,
  gangyak,
  yongshin,
  sipsong,
  sibiwoonseong,
  version,
  integrity,
  isTimeUnknown,
  canonicalFeatures,
  evidence,
  secretUnlocked,
  onUnlockClick,
  onInsufficientJelly,
}: Props) {
  const [insightFocus, setInsightFocus] = useState<InsightFocus>("base");
  const normalizedElementScores = toArray(elementScores, [20, 20, 20, 20, 20]);
  const normalizedElementCounts = toArray(elementCounts, [1, 1, 1, 1, 1]);
  const normalizedPercentages = toArray(elementBasicPercentages, [20, 20, 20, 20, 20]);

  const qualityScore = analysisMeta ? Math.max(0, Math.min(100, Math.round(analysisMeta.qualityScore))) : 0;
  const reliabilityLabel =
    analysisMeta?.reliability === "high" ? "높음" : analysisMeta?.reliability === "medium" ? "보통" : "낮음";

  const safePersonName = cleanText(personName, "사용자");
  const safeArchetypeName = cleanText(archetype.animal_name, "기본 사주");
  const safeArchetypeHook = cleanText(archetype.displayHook, "핵심 성향 해석을 준비 중입니다.");
  const safeSecretPreview = cleanText(archetype.displaySecretPreview, "프리미엄 해제 시 상세 리포트를 확인할 수 있습니다.");
  const warningList = (analysisMeta?.warnings || []).filter((item) => typeof item === "string" && item.length > 0).slice(0, 4);

  const topElementIndex = normalizedElementScores.reduce(
    (maxIdx, curr, idx) => (curr > normalizedElementScores[maxIdx] ? idx : maxIdx),
    0,
  );
  const lowestElementIndex = normalizedElementScores.reduce(
    (minIdx, curr, idx) => (curr < normalizedElementScores[minIdx] ? idx : minIdx),
    0,
  );

  const pillarCards: PillarView[] = fourPillars
    ? [
      parsePillar("year", fourPillars.year),
      parsePillar("month", fourPillars.month),
      parsePillar("day", fourPillars.day),
      parsePillar("hour", fourPillars.hour),
    ]
    : [];

  const metricRows = ELEMENTS.map((metric, index) => ({
    ...metric,
    score: Math.max(0, Math.round(normalizedElementScores[index] || 0)),
    count: Math.max(0, Math.round(normalizedElementCounts[index] || 0)),
    percent: Math.max(0, Math.min(100, Math.round(normalizedPercentages[index] || 0))),
  }));

  const totalTenGodCount = Object.values(sipsong || {}).length;
  const tenGodSummary = SIPSONG_LABELS.map((label) => ({
    label,
    value: toPercent(Object.values(sipsong || {}).filter((item) => item === label).length, totalTenGodCount),
  })).filter((item) => item.value > 0);

  const strongestTenGod = tenGodSummary.reduce(
    (best, item) => (item.value > best.value ? item : best),
    tenGodSummary[0] ?? { label: "데이터 준비 중", value: 0 },
  );

  const phaseEntries = [
    { key: "year", label: "년주", value: sibiwoonseong?.year || "-" },
    { key: "month", label: "월주", value: sibiwoonseong?.month || "-" },
    { key: "day", label: "일주", value: sibiwoonseong?.day || "-" },
    { key: "hour", label: "시주", value: sibiwoonseong?.hour || "-" },
  ];

  const gangyakBreakdown = canonicalFeatures?.strengthProfile?.components?.map((item) => ({
    label: item.label,
    value: item.value,
    hint: item.hint,
  })) || [
      { label: "득령", value: Number(gangyak?.deukryeong || 0), hint: "월지에서 받는 계절 기운" },
      { label: "득지", value: Number(gangyak?.deukji || 0), hint: "지지에서 받는 뿌리 힘" },
      { label: "득세", value: Number(gangyak?.deukse || 0), hint: "주변 천간의 보조 에너지" },
    ];
  const strengthProfile = canonicalFeatures?.strengthProfile;
  const boundaryInfo = canonicalFeatures?.chartCore.calendarBoundaries;
  const lineagePolicy = canonicalFeatures?.chartCore.lineageProfile;
  const structureCandidates = canonicalFeatures?.structureCandidates?.slice(0, 3) || [];
  const yongshinCandidates = canonicalFeatures?.yongshinCandidates?.slice(0, 4) || [];
  const transitInteractions = canonicalFeatures?.transitInteractions?.slice(0, 6) || [];
  const currentUn = canonicalFeatures?.luckCycles?.currentUn;

  const premiumBulletsByFocus: Record<InsightFocus, string[]> = {
    base: [
      `${safePersonName}님의 용신/희신 조합에 맞춘 보완 전략`,
      `${safePersonName}님의 십성 강약이 커리어와 관계에 미치는 영향`,
      `올해 집중해야 할 시기와 피해야 할 소모 패턴`,
    ],
    love: [
      `${safePersonName}님의 연애 템포와 감정 표현 리듬`,
      `가까워질수록 반복되는 관계 패턴과 충돌 포인트`,
      `잘 맞는 상대 기운과 피해야 할 감정 소모 구조`,
    ],
    money: [
      `${safePersonName}님의 소비 습관과 재물 보존 포인트`,
      `돈이 들어올 때와 새는 때를 가르는 십성 패턴`,
      `올해 재정적으로 무리하지 말아야 할 구간`,
    ],
    career: [
      `${safePersonName}님의 직업 적성 축과 역할 포지션`,
      `성과를 내는 방식과 압박 상황에서의 반응 패턴`,
      `이직·확장·집중에 유리한 실행 타이밍`,
    ],
  };

  const premiumBullets = premiumBulletsByFocus[insightFocus];
  const detailedHook = buildDetailedHook({
    hook: safeArchetypeHook,
    topElement: metricRows[topElementIndex].label,
    lowElement: metricRows[lowestElementIndex].label,
    strongestTenGod: strongestTenGod.label,
  });
  const detailedPremiumPreview = buildDetailedPremiumPreview({
    preview: safeSecretPreview,
    focus: insightFocus,
  });
  const identitySummary = buildIdentitySummary({
    strongestElement: metricRows[topElementIndex].label,
    strongestTenGod: strongestTenGod.label,
  });
  const reasonSummary = buildReasonSummary({
    strongestElement: metricRows[topElementIndex].label,
    weakestElement: metricRows[lowestElementIndex].label,
    gangyakLevel: cleanText(gangyak?.level, "중화"),
  });
  const actionSummary = buildActionSummary({
    focus: insightFocus,
    primaryElement: cleanText(yongshin?.primary?.element, "용신"),
  });

  const premiumReportCopyByFocus: Record<InsightFocus, string> = {
    base:
      analysisMeta?.source === "high-precision"
        ? "📘 고정밀 만세력 기반 해석에 실전 조언, 근거 로그, 확장 PDF 리포트가 함께 제공됩니다."
        : "📘 현재는 핵심 요약만 열려 있습니다. 프리미엄 해제로 세부 근거와 전문 해석이 확장됩니다.",
    love: "💞 연애·썸·재회 관점에서 감정선, 관계 속도, 반복되는 충돌 패턴을 더 깊게 풉니다.",
    money: "💰 재물 관점에서 수입 흐름, 소비 누수, 축적 포인트와 리스크 구간을 더 구체화합니다.",
    career: "💼 커리어 관점에서 역할 적성, 성과 방식, 압박 대응, 확장 타이밍을 더 세밀하게 풉니다.",
  };

  const reportCards: MetricCard[] = [
    {
      label: "분석 방식",
      value: analysisMeta?.source === "high-precision" ? "고정밀 만세력 연산" : "기본 규칙 연산",
      color: "from-indigo-500/30 to-violet-700/20",
      icon: <Target className="w-4 h-4" />,
    },
    {
      label: "시간 입력 상태",
      value: isTimeUnknown ? "시간 미입력(12:00 대체)" : "시간 완전 입력",
      color: "from-cyan-500/30 to-blue-700/20",
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      label: "연령 해석 컨텍스트",
      value: `${ageGroupToKo(ageGroup)} 기준 해석`,
      color: "from-fuchsia-500/30 to-pink-700/20",
      icon: <Orbit className="w-4 h-4" />,
    },
  ];

  const premiumReportCopy = premiumReportCopyByFocus[insightFocus];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 relative">
      <ReadingProgressBar />
      <AmbientSoundPortal />

      <motion.div
        className="bg-surface border border-border-color rounded-4xl p-6 md:p-10 space-y-6 md:space-y-8 shadow-[0_30px_120px_rgba(76,29,149,0.35)]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <header className="text-center relative py-12 md:py-16 overflow-hidden rounded-3xl border border-indigo-400/25 bg-gradient-to-b from-indigo-900/40 via-slate-900/80 to-slate-950">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 px-4 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 rounded-full border border-white/20 flex items-center justify-center shadow-[0_0_60px_rgba(99,102,241,0.4)] mb-6 relative"
            >
              <span className="text-6xl md:text-7xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {pillarCards.find(p => p.key === 'day')?.branchEmoji || "✨"}
              </span>
              <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-slate-800 rounded-full border-2 border-indigo-400 flex items-center justify-center text-xl">
                {pillarCards.find(p => p.key === 'day')?.stemEmoji || "🌟"}
              </div>
            </motion.div>

            <p className="inline-flex px-4 py-2 rounded-full text-xs font-black text-indigo-100 bg-indigo-500/30 border border-indigo-300/40 tracking-[0.2em] shadow-lg">
              🔮 시크릿 사주 프리미엄 리포트
            </p>

            <p className="text-lg md:text-xl text-slate-300 mt-6 font-semibold">
              {safePersonName}님의 타고난 본캐는
            </p>

            <h1 className="text-4xl md:text-6xl font-black mt-2 bg-gradient-to-r from-emerald-200 via-indigo-200 to-fuchsia-200 bg-clip-text text-transparent drop-shadow-lg">
              {metricRows[topElementIndex].label.replace(/\(.*\)/, '')} 품은 {pillarCards.find(p => p.key === 'day')?.branchAnimalKo || "동물"}
            </h1>

            <p className="text-xl md:text-2xl text-indigo-200 font-bold mt-4">
              &ldquo;{safeArchetypeName}&rdquo;
            </p>

            <div className="flex items-center justify-center gap-2 mt-8 text-sm md:text-base font-bold text-indigo-100 flex-wrap">
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                {pillarNameKo}
              </span>
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                {ageGroupToKo(ageGroup)} 맞춤
              </span>
              {isTimeUnknown ? (
                <span className="px-4 py-2 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 backdrop-blur-md">
                  ⏰ 태어난 시간 미입력
                </span>
              ) : null}
            </div>

            <div className="mt-8 flex justify-center">
              <AIIntelligenceBadge
                model={analysisMeta?.source === "high-precision" ? "고정밀 사주 AI" : "앙상블 분석 AI"}
                isEnsemble={true}
              />
            </div>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-white/10 bg-black/40 p-5 md:p-8 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full mix-blend-screen pointer-events-none" />

          <div className="flex items-center gap-3 mb-6 relative z-10">
            <span className="text-3xl">🧩</span>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white">타고난 인생의 네 기둥</h3>
              <p className="text-sm text-slate-400 mt-1">내가 가진 4장의 카드를 확인하세요</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative z-10">
            {pillarCards.map((pillar) => (
              <div
                key={pillar.key}
                className={`rounded-2xl border p-4 transition-all duration-300 ${pillar.key === 'day'
                  ? 'bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/10 border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <p className={`text-xs font-black tracking-widest ${pillar.key === 'day' ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {pillar.labelKo}
                  </p>
                  {pillar.key === 'day' && (
                    <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold">본캐</span>
                  )}
                </div>

                <div className="flex items-center gap-3 my-3">
                  <div className="text-4xl">{pillar.branchEmoji}</div>
                  <div>
                    <p className="text-xl font-black text-white">{pillar.stemKo}{pillar.branchKo}</p>
                    <p className="text-[10px] text-slate-400">{pillar.stemHanja}{pillar.branchHanja}</p>
                  </div>
                </div>

                <div className="space-y-1 mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-slate-300 flex items-center justify-between">
                    <span>기운</span>
                    <span className="font-bold text-white">{pillar.stemEmoji} {pillar.stemElement.replace(/\(.*\)/, '')}</span>
                  </p>
                  <p className="text-xs text-slate-300 flex items-center justify-between">
                    <span>동물</span>
                    <span className="font-bold text-white">{pillar.branchAnimalKo}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-4">
          {reportCards.map((card) => (
            <div key={card.label} className={`rounded-2xl p-4 border border-white/15 bg-gradient-to-r ${card.color}`}>
              <div className="text-sm font-black text-slate-100 tracking-wide inline-flex items-center gap-2">
                {card.icon}
                {card.label}
              </div>
              <p className="mt-3 text-lg md:text-xl font-black text-white">{card.value}</p>
            </div>
          ))}

          <div className="rounded-2xl p-4 border border-emerald-300/30 bg-gradient-to-r from-emerald-500/25 to-cyan-700/20">
            <div className="text-sm font-black text-emerald-50 tracking-wide inline-flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> 신뢰도 점수
            </div>
            <p className="mt-2 text-3xl font-black text-white">{qualityScore}<span className="text-base text-emerald-100"> / 100</span></p>
            <div className="mt-3 h-3 rounded-full bg-black/30 border border-white/20 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-indigo-300"
                initial={{ width: 0 }}
                animate={{ width: `${qualityScore}%` }}
                transition={{ duration: 0.9 }}
              />
            </div>
            <p className="mt-2 text-xs text-emerald-100">판정: {reliabilityLabel}</p>
          </div>
        </div>

        {(boundaryInfo || evidence?.length) ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {boundaryInfo ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Calendar Boundary Snapshot</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-slate-100">
                    공식 연도 {boundaryInfo.officialCalendarYear ?? "-"}년
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-slate-100">
                    명리 연도 {boundaryInfo.myeongriCalendarYear}년
                  </span>
                  <span className="rounded-full border border-indigo-300/25 bg-indigo-400/10 px-3 py-1 text-indigo-100">
                    기준 {boundaryInfo.myeongriYearBoundary}
                  </span>
                  {lineagePolicy?.hourBranchPolicy ? (
                    <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-cyan-100">
                      시지 {lineagePolicy.hourBranchPolicy}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
            {evidence?.length ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-200">Evidence Trace</p>
                <p className="mt-3 text-sm text-slate-300">
                  근거 로그 {evidence.length}건이 연결되어 있으며, 프리미엄 해설은 이 근거 구조를 기준으로 확장됩니다.
                </p>
              </div>
            ) : null}
          </section>
        ) : null}

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-[2rem] bg-gradient-to-br from-indigo-600/15 to-fuchsia-700/10 border border-indigo-400/25 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">✨</span>
            <h3 className="text-xl md:text-2xl font-black text-indigo-200">시크릿 핵심 해석</h3>
          </div>
          <p className="text-lg md:text-2xl font-black text-white leading-snug">“{detailedHook}”</p>
          <div className="mt-4">
            <KeywordChips tags={archetype.base_traits.hashtags || []} />
          </div>
          <p className="mt-4 text-sm md:text-base text-slate-200 leading-relaxed">
            🌈 가장 강한 오행은 <strong className="text-white">{metricRows[topElementIndex].label}</strong>, 가장 약한 오행은 <strong className="text-white">{metricRows[lowestElementIndex].label}</strong>입니다.
            그래서 기본 성향은 강한 축으로 빠르게 드러나고, 장기 안정감은 부족한 축을 어떻게 보완하느냐에 따라 달라집니다.
          </p>

          {secretUnlocked && (
            <div className="mt-6 border-t border-indigo-500/20 pt-6">
              <AINarrativeSection
                persona={`${ageGroup}_balanced`}
                model="GPT-4O"
                userName={safePersonName}
                ageGroup={ageGroupToKo(ageGroup)}
                tendency="Balanced"
                rawSajuData={fourPillars}
                lineageProfileId={canonicalFeatures?.chartCore?.lineageProfile?.id}
                evidence={evidence}
                queryType="result"
                categoryFocus={insightFocus}
              />
            </div>
          )}
        </motion.div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-7 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🪄</span>
            <h3 className="text-xl md:text-2xl font-black text-white">한눈에 보는 결과 요약</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Who You Are</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-100">{identitySummary}</p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-200">Why It Happens</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-100">{reasonSummary}</p>
            </div>
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">What To Do</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-100">{actionSummary}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">
              📊
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white">나를 채우는 5가지 원소</h3>
              <p className="text-sm text-slate-400 mt-1">어떤 기운이 가장 강할까요? 직관적으로 확인하세요.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-5 gap-4">
            {metricRows.map((item) => {
              const isDominant = item.label === metricRows[topElementIndex].label;
              const isWeakest = item.label === metricRows[lowestElementIndex].label;

              return (
                <motion.div
                  key={item.key}
                  whileHover={{ y: -5 }}
                  className={`rounded-2xl border p-5 relative overflow-hidden transition-all duration-300 ${isDominant
                    ? 'bg-gradient-to-br border-white/30 from-white/10 to-transparent'
                    : 'bg-black/40 border-white/10'
                    }`}
                  style={isDominant ? { boxShadow: `0 10px 30px rgba(${item.glow}, 0.15)` } : {}}
                >
                  {isDominant && (
                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl tracking-wider uppercase">
                      강점 기운
                    </div>
                  )}
                  {isWeakest && (
                    <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl tracking-wider uppercase">
                      보완 필요
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-3 mt-2">
                    <span className="text-4xl drop-shadow-md">{item.emoji}</span>
                    <div>
                      <h4 className="font-black text-lg text-white tracking-wide">{item.label.replace(/\(.*\)/, '')}</h4>
                      <p className="text-xs text-slate-400">{item.meaning.split('·')[0]}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-bold text-slate-300 uppercase">에너지 레벨</span>
                      <span className="text-sm font-black text-white">{Math.min(10, Math.ceil(item.score / 10))}/10</span>
                    </div>
                    <div className="h-2 rounded-full bg-black/50 border border-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full ${item.bar} shadow-[0_0_10px_rgba(255,255,255,0.5)]`}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 text-center">
            {metricRows[topElementIndex].label.replace(/\(.*\)/, '')} 기운이 강해 <strong>{metricRows[topElementIndex].meaning}</strong> 성향이 두드러지며,
            {metricRows[lowestElementIndex].label.replace(/\(.*\)/, '')} 기운을 보완하면 더욱 완벽한 밸런스를 갖출 수 있습니다.
          </div>
        </section>

        <section className="grid xl:grid-cols-[1.1fr_0.9fr] gap-5">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-8 flex flex-col items-center">
            <div className="flex items-center self-start gap-3 mb-6">
              <span className="text-2xl">🕸️</span>
              <h3 className="text-xl md:text-2xl font-black text-white">나의 밸런스 모양</h3>
            </div>
            <div className="flex-1 w-full max-w-sm flex justify-center items-center opacity-90 drop-shadow-xl">
              <SvgChart
                title="Five Elements Radar"
                accentColor="#818cf8"
                data={metricRows.map((item) => ({ label: item.label.replace(/\(.*\)/, ''), value: item.score }))}
              />
            </div>
            <p className="mt-6 text-sm text-slate-300 text-center bg-white/5 p-4 rounded-2xl border border-white/10 w-full">
              모양이 둥글수록 밸런스가 좋고, 뾰족할수록 특정 분야에 재능이 강합니다.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-xl shadow-lg">
                🎭
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white">행동 패턴 분석</h3>
            </div>

            {tenGodSummary.length > 0 ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-fuchsia-300/30 bg-gradient-to-br from-fuchsia-500/10 to-transparent p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-2xl rounded-full" />
                  <p className="text-xs font-black tracking-widest text-fuchsia-300 uppercase relative z-10">가장 두드러진 특징</p>
                  <p className="mt-1 text-2xl font-black text-white drop-shadow-md relative z-10">{strongestTenGod.label}</p>
                  <p className="mt-2 text-sm text-slate-300 relative z-10">
                    지금 가장 자주 사용하는 무기입니다. 이 특성을 살릴 때 일이 가장 잘 풀립니다.
                  </p>
                </div>

                <div className="space-y-4 px-2">
                  <p className="text-xs font-black text-slate-400">전체 능력치 분포</p>
                  {tenGodSummary.map((item) => (
                    <div key={item.label} className="group">
                      <div className="flex items-center justify-between text-sm font-bold text-slate-200 mb-2">
                        <span>{item.label}</span>
                        <span className="text-fuchsia-200">{item.value}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-fuchsia-400 to-indigo-400 group-hover:opacity-80 transition-opacity"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-sm text-slate-400 text-center">
                  데이터를 불러오는 중입니다.<br />잠시만 기다려주세요.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="grid xl:grid-cols-[1fr_1fr] gap-5">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shadow-lg">
                  <Flame className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white">나의 멘탈 게이지</h3>
              </div>

              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-2xl font-black text-white drop-shadow-md">
                    {Math.round(Number(gangyak?.total || 0))}
                    <span className="text-sm text-slate-400 font-normal ml-1">/ 100</span>
                  </p>
                </div>
                <div className={`rounded-full border px-4 py-2 text-sm font-black ${getGangyakTone(gangyak?.level)}`}>
                  {gangyak?.level || "중화"}
                </div>
              </div>

              <div className="h-3 rounded-full overflow-hidden border border-white/10 bg-black/50 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, Math.min(100, Math.round(Number(gangyak?.total || 0))))}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-200 via-amber-400 to-rose-400"
                />
              </div>

              <p className="mt-5 text-sm text-slate-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                에너지가 높은 분파는 주도적이고 뚝심이 있으며,
                에너지가 부드러운 분파는 주변 환경에 유연하게 적응하고 흡수력이 좋습니다.
              </p>
            </div>

            <div className="mt-6 flex justify-between px-2 text-center text-xs text-slate-400 gap-2">
              <div className="flex-1 rounded-xl bg-black/40 p-3 shadow-inner">
                <p>멘탈력</p>
                <p className="font-bold text-white mt-1 text-sm">{Math.round(Number(gangyak?.deukryeong || 0))}</p>
              </div>
              <div className="flex-1 rounded-xl bg-black/40 p-3 shadow-inner">
                <p>실행력</p>
                <p className="font-bold text-white mt-1 text-sm">{Math.round(Number(gangyak?.deukji || 0))}</p>
              </div>
              <div className="flex-1 rounded-xl bg-black/40 p-3 shadow-inner">
                <p>주변운</p>
                <p className="font-bold text-white mt-1 text-sm">{Math.round(Number(gangyak?.deukse || 0))}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5 text-emerald-300" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white">행운을 부르는 기운</h3>
            </div>

            <div className="grid gap-3">
              <div className={`rounded-2xl border p-4 transition-all duration-300 ${getElementGlow(yongshin?.primary?.element)} hover:scale-[1.02] cursor-default`}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-200">나침반 기운</p>
                  <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">1순위</span>
                </div>
                <div className="flex items-end gap-3">
                  <p className="text-3xl font-black text-white drop-shadow-md">{cleanText(yongshin?.primary?.element?.replace(/\(.*\)/, ''), "분석 중")}</p>
                </div>
                <p className="mt-3 text-sm text-slate-200">나의 중심을 잡아주고 운을 트이게 하는 핵심 열쇠입니다.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-2xl border p-4 flex flex-col justify-between ${getElementGlow(yongshin?.secondary?.element)}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-sky-200 mb-1">보조 기운</p>
                  <p className="text-lg font-black text-white mb-2">{cleanText(yongshin?.secondary?.element?.replace(/\(.*\)/, ''), "-")}</p>
                  <p className="text-[11px] text-slate-300 leading-tight">옆에서 나침반을 돕고 안정감을 시너지로 냅니다.</p>
                </div>

                <div className={`rounded-2xl border p-4 flex flex-col justify-between ${getElementGlow(yongshin?.unfavorable?.element)} relative overflow-hidden`}>
                  <div className="absolute -right-4 -bottom-4 text-6xl opacity-10">⚠️</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-300 mb-1 relative z-10">주의 에너지</p>
                  <p className="text-lg font-black text-white mb-2 relative z-10">{cleanText(yongshin?.unfavorable?.element?.replace(/\(.*\)/, ''), "-")}</p>
                  <p className="text-[11px] text-slate-300 leading-tight relative z-10">지나치게 집착하면 오히려 독이 되기 쉬운 속성입니다.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <InteractiveInsightLab
          elements={metricRows.map((item) => ({
            label: item.label,
            score: item.score,
            count: item.count,
            percent: item.percent,
            meaning: item.meaning,
            bar: item.bar,
          }))}
          tenGods={tenGodSummary}
          gangyak={gangyakBreakdown}
          focus={insightFocus}
          onFocusChange={setInsightFocus}
        />

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📈</span>
            <h3 className="text-xl md:text-2xl font-black text-white">십이운성 흐름 카드</h3>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {phaseEntries.map((phase, index) => (
              <div key={phase.key} className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-slate-900/30 p-4">
                <p className="text-xs font-black tracking-[0.2em] uppercase text-indigo-200">{phase.label}</p>
                <p className="mt-2 text-2xl font-black text-white">{phase.value}</p>
                <p className="mt-2 text-sm text-slate-300">
                  {index === 0 && "조상·환경에서 흘러오는 초반 에너지"}
                  {index === 1 && "사회성과 직업 전개에 작동하는 힘"}
                  {index === 2 && "내 본체와 관계 감수성의 중심"}
                  {index === 3 && "후반 인생, 자녀, 내면의 숙성도"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-7 space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧱</span>
            <h3 className="text-xl md:text-2xl font-black text-white">사주 기둥 해설 카드</h3>
          </div>
          <PillarVisualizer
            pillars={pillarCards.map((p) => ({ kan: `${p.stemHanja}(${p.stemKo})`, ji: `${p.branchHanja}(${p.branchKo})`, name: p.labelKo, color: "text-indigo-200" }))}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            {pillarCards.map((pillar) => (
              <div key={`${pillar.key}-detail`} className="rounded-2xl border border-indigo-300/20 bg-gradient-to-br from-indigo-600/12 to-slate-900/35 p-4">
                <p className="text-sm font-black text-indigo-200">{pillar.labelKo} {pillar.labelHanja}</p>
                <p className="text-xl font-black text-white mt-1">{pillar.stemKo}({pillar.stemHanja}) · {pillar.branchKo}({pillar.branchHanja})</p>
                <p className="text-sm text-indigo-100 mt-2">{pillar.stemEmoji} 천간 오행: {pillar.stemElement}</p>
                <p className="text-sm text-indigo-100">{pillar.branchEmoji} 상징 동물: {pillar.branchAnimalKo}</p>
                <p className="text-xs text-slate-300 mt-3">의미: {pillar.meaning}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-7 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <h3 className="text-xl md:text-2xl font-black text-white inline-flex items-center gap-2">
              격국 · 대운 요약
              <InfoTip title="격국/대운" description="격국은 사주의 기본 구조, 대운은 10년 단위 인생 흐름 변화 구간을 뜻합니다." />
            </h3>
          </div>

          {gyeokguk ? (
            <div className="rounded-xl border border-fuchsia-300/20 bg-gradient-to-r from-fuchsia-500/10 to-indigo-500/10 p-4">
              <p className="text-xs text-fuchsia-200 inline-flex items-center gap-2">🧩 격국</p>
              <p className="text-sm md:text-base text-slate-100 mt-1 font-semibold">{cleanText(gyeokguk.name, "격국")}</p>
              <p className="text-sm text-slate-300 mt-2">{cleanText(gyeokguk.description, "격국 정보를 준비 중입니다.")}</p>
            </div>
          ) : null}

          {structureCandidates.length ? (
            <div className="grid gap-2 md:grid-cols-3">
              {structureCandidates.map((candidate) => (
                <div key={candidate.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-200">{candidate.phase} candidate</p>
                  <p className="mt-2 text-sm font-semibold text-white">{cleanText(candidate.name, "격국 후보")}</p>
                  <p className="mt-1 text-xs text-slate-300">
                    {candidate.supportingBranch} 지장간 {candidate.supportingStem} · {candidate.protrusion ? "투출" : "미투출"} · {Math.round(candidate.confidence * 100)}%
                  </p>
                  <p className="mt-1 text-[11px] text-fuchsia-100">
                    {candidate.candidateClass === "special" ? `특수격 ${getSpecialPatternLabel(candidate.specialPattern)}` : "일반격"} · 파격 위험 {candidate.breakRisk}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">{cleanText(candidate.summary, "격국 후보 근거를 정리 중입니다.")}</p>
                </div>
              ))}
            </div>
          ) : null}

          {daewun?.pillars?.length ? (
            <div className="rounded-xl border border-indigo-300/20 bg-black/20 p-4 space-y-3">
              <p className="text-sm font-bold text-indigo-100 inline-flex items-center gap-2">📈 대운 기술 타임라인</p>
              {currentUn ? (
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-100">
                    세운 {cleanText(currentUn.saewun?.pillar?.fullName, "-")}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-100">
                    월운 {cleanText(currentUn.wolun?.pillar?.fullName, "-")}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-100">
                    일운 {cleanText(currentUn.ilun?.pillar?.fullName, "-")}
                  </span>
                </div>
              ) : null}
              <div className="grid gap-2">
                {daewun.pillars.slice(0, 6).map((phase: any, index: number) => (
                  <div key={`${phase?.order}-${phase?.startAge}`} className="rounded-lg bg-gradient-to-r from-indigo-500/10 to-slate-900/20 border border-white/10 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-black text-indigo-200 text-sm inline-flex items-center gap-2">
                        <span>{index % 2 === 0 ? "🟣" : "🔵"}</span>
                        {phase?.startAge}~{phase?.endAge}세
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-slate-200">
                        {phase?.order || index + 1}단계
                      </span>
                    </div>
                    <div className="text-slate-100 text-sm mt-1 font-semibold">{cleanText(phase?.pillar?.fullName, "대운")}</div>
                    <div className="text-slate-400 text-xs mt-1">코드: {cleanText(phase?.pillar?.code, "N/A")}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {transitInteractions.length ? (
            <div className="rounded-xl border border-cyan-300/20 bg-cyan-500/5 p-4 space-y-3">
              <p className="text-sm font-bold text-cyan-100 inline-flex items-center gap-2">🛰️ 현재 운세 상호작용</p>
              <div className="grid gap-2">
                {transitInteractions.map((event) => (
                  <div key={event.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">{event.scope}</span>
                      <span className="text-[11px] text-slate-400">{Math.round(event.strength * 100)}%</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white">{cleanText(event.description, "운세 상호작용을 계산했습니다.")}</p>
                    <p className="mt-1 text-xs text-slate-400">{event.actors.join(" · ")}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {(version || integrity) ? (
            <p className="text-xs text-slate-500">버전: {version || "unknown"} / 무결성: {integrity || "N/A"}</p>
          ) : null}

          {warningList.length > 0 ? (
            <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-3">
              <p className="text-sm font-bold text-amber-200 mb-2">주의 사항</p>
              <ul className="text-sm text-amber-100 space-y-1 list-disc ml-4">
                {warningList.map((warning, index) => (
                  <li key={`${warning}-${index}`}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="rounded-3xl border border-rose-400/20 bg-gradient-to-br from-rose-500/10 to-indigo-900/20 p-5 md:p-7">
          <div className="flex items-center gap-3 mb-3">
            <Lock className="w-5 h-5 text-rose-300" />
            <h3 className="text-xl md:text-2xl font-black text-white">프리미엄 잠금 해제</h3>
          </div>
          <p className="text-base text-slate-200 leading-relaxed">{detailedPremiumPreview}</p>
          <p className="text-sm text-slate-400 mt-2">{premiumReportCopy}</p>
          <div className="mt-5 rounded-[2rem] border border-white/10 bg-black/20 overflow-hidden relative">
            {!secretUnlocked ? (
              <>
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 bg-slate-950/55 backdrop-blur-md">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-rose-200">Premium Deep Dive Locked</p>
                  <p className="mt-3 text-lg font-black text-white">🔓 십성 직업 코드, 연애 패턴, 돈 흐름, 올해 실행 타이밍이 근거와 함께 이어집니다.</p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={onUnlockClick}
                      className="inline-flex px-5 py-2.5 rounded-xl bg-rose-600 text-white font-black text-sm hover:bg-rose-500 transition-colors"
                    >
                      🔓 프리미엄 해제
                    </button>
                    {onInsufficientJelly ? (
                      <button
                        type="button"
                        onClick={onInsufficientJelly}
                        className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-500 transition-colors"
                      >
                        💎 젤리 충전
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="blur-lg opacity-40 pointer-events-none p-6 md:p-7 space-y-4" aria-hidden="true">
                  {premiumBullets.map((bullet) => (
                    <div key={bullet} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-sm font-bold text-white">{bullet}</p>
                      <p className="mt-2 text-sm text-slate-300">
                        📚 실제 리포트에서는 오행, 십성, 운세 흐름을 연결해 왜 이런 해석이 나오는지까지 문장형으로 자세히 제공합니다.
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-6 md:p-7 space-y-5">
                <p className="text-emerald-300 text-sm">✅ 프리미엄 분석이 활성화되었습니다.</p>
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-indigo-300/20 bg-indigo-500/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200">Career Signal</p>
                    <p className="mt-2 text-lg font-black text-white">{strongestTenGod.label}</p>
                    <p className="mt-2 text-sm text-slate-300">
                      반복적으로 드러나는 십성 축이 커리어 포지션과 일 처리 스타일을 만듭니다. 이 강점을 기준으로 역할을 잡는 편이 성과 전환이 빠릅니다.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">Relationship Pattern</p>
                    <p className="mt-2 text-lg font-black text-white">{cleanText(yongshin?.primary?.element, "용신")} 중심 관계 해석</p>
                    <p className="mt-2 text-sm text-slate-300">
                      좋은 인연은 나를 보완하는 기운과 함께 들어옵니다. 편한 사람보다 균형을 맞춰주는 사람이 오래 갑니다.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-200">Execution Timing</p>
                    <p className="mt-2 text-lg font-black text-white">{phaseEntries[1]?.value || "운성 분석"} 주도 구간</p>
                    <p className="mt-2 text-sm text-slate-300">
                      일과 돈은 무작정 밀어붙이기보다, 지금 강한 운성의 리듬에 맞춰 추진할 때 효율이 높습니다.
                    </p>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-yellow-300/25 bg-gradient-to-br from-yellow-400/15 via-amber-500/10 to-rose-500/10 p-5">
                  <div className="flex items-center gap-3">
                    <Gem className="w-5 h-5 text-yellow-200" />
                    <h4 className="text-lg font-black text-white">월간 시크릿 멤버십 티저</h4>
                  </div>
                  <p className="mt-3 text-sm text-slate-200">
                    {insightFocus === "love" && "정기 구독에서는 연애 타이밍 알림, 관계 흐름 브리핑, 썸/재회 해석 아카이브를 묶어 제공하는 구조가 설득력 있습니다."}
                    {insightFocus === "money" && "정기 구독에서는 월간 재물 흐름 브리핑, 소비 경보, 돈이 새는 패턴 분석, 축적 루틴 제안을 묶는 구성이 설득력 있습니다."}
                    {insightFocus === "career" && "정기 구독에서는 커리어 타이밍 브리핑, 성과 압박 해석, 이직/확장 시그널, 업무 루틴 제안을 묶는 구성이 설득력 있습니다."}
                    {insightFocus === "base" && "정기 구독에서는 월운 브리핑, 연애/재물 알림, 용신 기반 실전 루틴, 신규 해석 리포트 누적 저장을 묶어 제공하는 구조가 설득력 있습니다."}
                  </p>
                  <div className="mt-4 grid md:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
                      {insightFocus === "love" ? "연애 흐름과 관계 타이밍 리포트" : insightFocus === "money" ? "월간 재물 흐름 리포트" : insightFocus === "career" ? "월간 커리어 브리핑" : "매달 업데이트되는 월운 리포트"}
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
                      {insightFocus === "love" ? "썸·재회·관계 신호 알림" : insightFocus === "money" ? "소비 경보와 축적 가이드" : insightFocus === "career" ? "성과 압박·이직 시그널 알림" : "연애·재물 신호 알림과 실행 가이드"}
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
                      {insightFocus === "love" ? "관계 해석 아카이브 무제한 보관" : insightFocus === "money" ? "재무 해석 아카이브 무제한 보관" : insightFocus === "career" ? "커리어 리포트 아카이브 무제한 보관" : "해제한 리포트 아카이브 무제한 보관"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onInsufficientJelly || onUnlockClick}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-yellow-300/30 bg-yellow-400/15 px-4 py-2 text-sm font-black text-yellow-100 hover:bg-yellow-400/20 transition-colors"
                  >
                    {insightFocus === "love" ? "연애 멤버십 대기 등록" : insightFocus === "money" ? "재물 멤버십 대기 등록" : insightFocus === "career" ? "커리어 멤버십 대기 등록" : "멤버십 대기 등록"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </motion.div>

      <div className="mt-8 max-w-sm mx-auto">
        <ShareCard name={`${safeArchetypeName} 결과`} />
      </div>

      <p className="mt-5 text-xs text-slate-400 text-center">
        전통 기준(간지·만세력) 설명을 먼저 제시하고, 이후 AI 확장 해석을 제공하는 2단 구조입니다.
      </p>
    </section>
  );
}

export { ResultCard };
export default ResultCard;
