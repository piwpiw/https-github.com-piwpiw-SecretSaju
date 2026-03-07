/**
 * Saju Calculation Module
 * 
 * DACRE Engine: Dynamic Age-Context Rendering Engine
 * Input: Birthdate/Time ??Output: One of 60 Animal Archetypes (?쇱＜ 湲곕컲)
 *
 * 留뚯꽭??媛꾨떒 援ы쁽: 湲곗???2000-01-01 = ?듿뜄) ?鍮?寃쎄낵??mod 60 ???쇱＜ ?몃뜳??
 * 
 * ---
 * 
 * HIGH-PRECISION ENGINE (New)
 * - Astronomical calculations (True Solar Time, EOT, Solar Terms)
 * - Myeongni-hak algorithms (Five Elements, Sinsal, Sipsong)
 * - Professional-grade accuracy (sajuplus.net equivalent)
 */

import { calculateHighPrecisionSaju } from '@/core/api/saju-engine';
import { getDayPillar, getHourPillar, getMonthPillar, getYearPillar } from '@/core/calendar/ganji';
import { analyzeElements } from '@/core/myeongni/elements';
import { KOREA_LOCATIONS } from '@/core/astronomy/true-solar-time';
import { parseCivilDate, parseCivilTimeParts } from '@/lib/civil-date';

// ===== HIGH-PRECISION ENGINE EXPORTS =====
export { SajuEngine, calculateHighPrecisionSaju } from '@/core/api/saju-engine';
export type { HighPrecisionSajuResult, SajuCalculationInput } from '@/core/api/saju-engine';
export { LINEAGE_PROFILES, resolveLineageProfile } from '@/core/api/saju-lineage';
export type { LineageProfile, LineageProfileId } from '@/core/api/saju-lineage';
export type { CanonicalSajuFeatures, EvidenceEntry } from '@/core/api/saju-canonical';

export { KOREA_LOCATIONS } from '@/core/astronomy/true-solar-time';
export type { Location } from '@/core/astronomy/true-solar-time';

export { SIXTY_GANJI } from '@/core/calendar/ganji';
export type { GanJi, FourPillars } from '@/core/calendar/ganji';

export type { ElementAnalysisResult, ElementScores } from '@/core/myeongni/elements';
export type { Sinsal } from '@/core/myeongni/sinsal';
export type { Sipsong } from '@/core/myeongni/sipsong';

// NEW: ????몄슫
export { calculateDaewun, getCurrentUnInfo, calculateSaewun } from '@/core/myeongni/daewun';
export type { DaewunInfo, SaewunInfo } from '@/core/myeongni/daewun';

// NEW: 寃⑷뎅
export { determineGyeokguk } from '@/core/myeongni/gyeokguk';
export type { GyeokgukInfo, Gyeokguk, JungGyeokguk, JongGyeokguk, JeonwangGyeokguk } from '@/core/myeongni/gyeokguk';

// NEW: ??씠?댁꽦
export { analyzeSibiwoonseongAll, getSibiwoonseong } from '@/core/myeongni/sibiwoonseong';
export type { SibiwoonseongInfo, SibiwoonseongAnalysis, Sibiwoonseong } from '@/core/myeongni/sibiwoonseong';

// ===== SIMPLE DACRE ENGINE (Legacy, for backward compatibility) =====

export type Element = "목" | "화" | "토" | "금" | "수";

const CHEONGAN = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"] as const;
const JIJI = ["수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수"] as const;

/** 泥쒓컙 ?ㅽ뻾 留ㅽ븨 */
const STEM_ELEMENTS: Record<string, Element> = {
  갑: "목", 을: "목", 병: "화", 정: "화", 무: "토", 기: "토", 경: "금", 신: "금", 임: "수", 계: "수"
};

const CHEONGAN_ELEMENTS: Element[] = [
  "목", "목",
  "화", "화",
  "토", "토",
  "금", "금",
  "수",
];

/** 吏吏 ?ㅽ뻾 留ㅽ븨 */
const JIJI_ELEMENTS: Element[] = [
  "수", "토", "목", "목",
  "토", "화", "화", "토",
  "금", "금", "토", "수",
];

/** 60媛묒옄 ?쒖꽌 (0=?꿨춴 ~ 59=?멧벤) */
const PILLAR_STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
const PILLAR_BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;
export const PILLAR_NAMES_KO = Array.from({ length: 60 }, (_, index) => `${PILLAR_STEMS[index % 10]}${PILLAR_BRANCHES[index % 12]}`);

/** DB/JSON??肄붾뱶 (?? GAP_JA, EUL_CHUK, ... GAP_SUL = 媛묒닠) - 60媛묒옄 ?쒖꽌 */
export const PILLAR_CODES: readonly string[] = [
  "GAP_JA", "EUL_CHUK", "BYEONG_IN", "JEONG_MYO", "MU_JIN", "GI_SA", "GYEONG_O", "SIN_MI", "IM_SIN", "GYE_YU",
  "GAP_SUL", "EUL_HAE", "BYEONG_JA", "JEONG_CHUK", "MU_IN", "GI_MYO", "GYEONG_JIN", "SIN_SA", "IM_O", "GYE_MI",
  "GAP_SIN", "EUL_YU", "BYEONG_SUL", "JEONG_HAE", "MU_JA", "GI_CHUK", "GYEONG_IN", "SIN_MYO", "IM_JIN", "GYE_SA",
  "GAP_O", "EUL_MI", "BYEONG_SIN", "JEONG_YU", "MU_SUL", "GI_HAE", "GYEONG_JA", "SIN_CHUK", "IM_IN", "GYE_MYO",
  "GAP_JIN", "EUL_SA", "BYEONG_O", "JEONG_MI", "MU_SIN", "GI_YU", "GYEONG_SUL", "SIN_HAE", "IM_JA", "GYE_CHUK",
  "GAP_IN", "EUL_MYO", "BYEONG_JIN", "JEONG_SA", "MU_O", "GI_MI", "GYEONG_SIN", "SIN_YU", "IM_SUL", "GYE_HAE",
];

/** 湲곗??? 2000-01-01 UTC = ?듿뜄 (?몃뜳??54) */
const REFERENCE_DATE = new Date(Date.UTC(2000, 0, 1));
const REFERENCE_PILLAR_INDEX = 54; // ?듿뜄

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysBetween(from: Date, to: Date): number {
  const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.floor((toUtc - fromUtc) / (24 * 60 * 60 * 1000));
}

/**
 * ?앸뀈?붿씪(쨌????諛쏆븘 ?쇱＜(?ζ윶) ?몃뜳??0~59 諛섑솚
 */
export function getDayPillarIndex(birthDate: Date): number {
  const days = getDaysBetween(REFERENCE_DATE, birthDate);
  return ((REFERENCE_PILLAR_INDEX + days) % 60 + 60) % 60;
}

/**
 * ?쇱＜ ?몃뜳?????쒓? ?대쫫 (媛묒옄, ?꾩텞, ...)
 */
export function getPillarNameKo(index: number): string {
  return PILLAR_NAMES_KO[index % 60] ?? "\uAC00\uC790";
}

/**
 * ?쇱＜ ?몃뜳????DB/JSON??肄붾뱶 (GAP_JA, WO_DOG ??
 */
export function getPillarCode(index: number): string {
  return PILLAR_CODES[index % 60] ?? "GAP_JA";
}

/**
 * ?쇱＜ ?몃뜳????泥쒓컙 ?ㅽ뻾
 * IMPROVED: ?뺥솗??泥쒓컙 留ㅽ븨 (?댁쟾 ?⑥닚 % 5?먯꽌 媛쒖꽑)
 */
export function getDayStemElement(pillarIndex: number): Element {
  const stemIndex = pillarIndex % 10; // 泥쒓컙? 10媛??쒗솚
  return CHEONGAN_ELEMENTS[stemIndex];
}

/**
 * ?쇱＜ ?몃뜳????吏吏 ?ㅽ뻾
 * IMPROVED: ?뺥솗??吏吏 留ㅽ븨
 */
export function getDayBranchElement(pillarIndex: number): Element {
  const branchIndex = Math.floor(pillarIndex / 5) % 12; // 吏吏??12媛??쒗솚
  return JIJI_ELEMENTS[branchIndex];
}

/**
 * ?쇱＜??二쇱슂 ?ㅽ뻾 (?쇨컙 湲곗?)
 * ?ъ＜ 遺꾩꽍? 二쇰줈 ?쇨컙(泥쒓컙)??湲곗??쇰줈 ?섎?濡?泥쒓컙 ?ㅽ뻾??諛섑솚
 */
export function getPrimaryElement(pillarIndex: number): Element {
  return getDayStemElement(pillarIndex);
}

export type SajuResult = {
  pillarIndex: number;
  pillarNameKo: string;
  code: string;
  element: Element;          // ?쇨컙 ?ㅽ뻾
  stemElement: Element;      // 泥쒓컙 ?ㅽ뻾 (紐낆떆??
  branchElement: Element;    // 吏吏 ?ㅽ뻾
  elementScores: number[];   // ?ㅼ떆媛??ㅽ뻾 ?먯닔 (%, 吏?κ컙 媛以묒튂)
  elementCounts: number[];   // ?ㅼ떆媛??ㅽ뻾 媛쒖닔 (0~8)
  elementBasicPercentages: number[]; // 湲곕낯 ?ㅽ뻾 ?먯닔 (%, 媛쒖닔 湲곕컲)
  /** ?섏씠?: "10s" | "20s" | "30s" (Age-Context?? */
  ageGroup: "10s" | "20s" | "30s";
  fourPillars: any;
  daewun?: any;
  gyeokguk?: any;
  gangyak?: any;
  yongshin?: any;
  sinsal?: any;
  sipsong?: any;
  sibiwoonseong?: any;
  version: string;
  integrity: string;
  analysisMeta?: {
    source: "high-precision" | "fallback";
    qualityScore: number;
    reliability: "high" | "medium" | "low";
    warnings: string[];
    calendarType: "solar" | "lunar";
    timeUnknownFallbackUsed: boolean;
    usedLocation: string;
    lineageProfileId?: string;
    birthInstantUtc?: string;
    historicalUtcOffsetMinutes?: number;
    historicalDstOffsetMinutes?: number;
    officialCalendarYear?: number | null;
    myeongriCalendarYear?: number;
  };
  isTimeUnknown?: boolean;
  evidence?: any[];
  canonicalFeatures?: any;
};

type NormalizedBirthTime = {
  hour: number;
  minute: number;
  valid: boolean;
  raw: string;
};

const DEFAULT_FALLBACK_ELEMENTS = {
  elementScores: [20, 20, 20, 20, 20],
  elementCounts: [1, 1, 1, 1, 1],
  elementBasicPercentages: [20, 20, 20, 20, 20],
};

const HIGH_PRECISION_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_SAJU_ENGINE_TIMEOUT_MS ?? 8000);

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, reason: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(reason)), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function normalizeTime(value: string): NormalizedBirthTime {
  const raw = typeof value === "string" ? value.trim() : "";
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(raw);
  if (!match) {
    return { hour: 12, minute: 0, valid: false, raw };
  }
  return {
    hour: Number.parseInt(match[1], 10),
    minute: Number.parseInt(match[2], 10),
    valid: true,
    raw
  };
}

function buildFallbackPillars(birthDate: Date, hour: number, minute: number, isTimeUnknown: boolean) {
  const base = new Date(
    birthDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate(),
    hour,
    minute,
    0,
    0
  );
  const hourAnchor = isTimeUnknown ? new Date(base.getFullYear(), base.getMonth(), base.getDate(), 12, 0) : base;

  const yearPillar = getYearPillar(base);
  const monthPillar = getMonthPillar(base, yearPillar.stemIndex);
  const dayPillar = getDayPillar(base);
  const hourPillar = getHourPillar(hourAnchor, dayPillar.stemIndex);
  return { year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar };
}

function buildEmergencyPillars(): any {
  return {
    year: { stem: "\uAC00", branch: "\uC790", ganjiIndex: 0, stemIndex: 0, branchIndex: 0 },
    month: { stem: "\uC744", branch: "\uCD95", ganjiIndex: 1, stemIndex: 1, branchIndex: 1 },
    day: { stem: "\uBC15", branch: "\uC778", ganjiIndex: 2, stemIndex: 2, branchIndex: 2 },
    hour: { stem: "\uC815", branch: "\uBB18", ganjiIndex: 3, stemIndex: 3, branchIndex: 3 },
  };
}

function normalizeBirthDateOrFallback(value: Date): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  return new Date(1990, 0, 1, 12, 0, 0, 0);
}

/**
 * ?앸뀈?붿씪怨??깅퀎??諛쏆븘 怨좎젙諛 ?ъ＜ 遺꾩꽍 ?섑뻾
 */
export async function calculateSaju(
  birthDate: Date,
  gender: "M" | "F" = "M",
  birthTime: string = "12:00",
  calendarType: 'solar' | 'lunar' = 'solar',
  isTimeUnknown: boolean = false,
  lineageProfileId?: string
): Promise<SajuResult> {
  const warnings: string[] = [];
  const safeGender: "M" | "F" = gender === "F" ? "F" : "M";
  const safeCalendarType: "solar" | "lunar" = calendarType === "lunar" ? "lunar" : "solar";
  const safeTimeUnknown = Boolean(isTimeUnknown);
  const normalizedTime = normalizeTime(birthTime);
  const safeBirthDate = normalizeBirthDateOrFallback(birthDate);

  if (!(birthDate instanceof Date) || Number.isNaN(birthDate.getTime())) {
    warnings.push("birthDate가 유효하지 않아 기본값(1990-01-01)으로 대체했습니다.");
  }

  if (!normalizedTime.valid) {
    warnings.push(`birthTime 형식이 유효하지 않아 ${normalizedTime.raw || "입력 없음"} 값을 대체값(12:00)으로 처리했습니다.`);
  }

  const baseDate = new Date(
    safeBirthDate.getFullYear(),
    safeBirthDate.getMonth(),
    safeBirthDate.getDate(),
    normalizedTime.hour,
    normalizedTime.minute,
    0,
    0
  );

  let source: "high-precision" | "fallback" = "high-precision";
  let hpResult = null as Awaited<ReturnType<typeof calculateHighPrecisionSaju>> | null;

  try {
    hpResult = await withTimeout(
      calculateHighPrecisionSaju({
        birthDate: baseDate,
        birthTime: `${normalizedTime.hour.toString().padStart(2, "0")}:${normalizedTime.minute.toString().padStart(2, "0")}`,
        gender: safeGender,
        calendarType: safeCalendarType,
        isTimeUnknown: safeTimeUnknown,
        lineageProfileId,
      }),
      HIGH_PRECISION_TIMEOUT_MS,
      `고도화 사주 엔진 타임아웃(${HIGH_PRECISION_TIMEOUT_MS}ms)`
    );
  } catch (error) {
    source = "fallback";
    warnings.push(`고도화 사주 엔진 실패: ${(error as Error).message}`);
    warnings.push("안전 모드 계산으로 대체했습니다. 정밀도는 다소 낮을 수 있습니다.");
  }

  let fourPillars: any;
  try {
    fourPillars = hpResult?.fourPillars ?? buildFallbackPillars(baseDate, normalizedTime.hour, safeTimeUnknown ? 0 : normalizedTime.minute, safeTimeUnknown);
  } catch (error) {
    source = "fallback";
    warnings.push(`일반 사주 기반 기준으로 복구했습니다: ${(error as Error).message}`);
    fourPillars = buildEmergencyPillars();
  }

  if (!fourPillars?.year || !fourPillars?.month || !fourPillars?.day || !fourPillars?.hour) {
    warnings.push("사주 기둥 데이터가 불완전해 기본 보정값으로 대체했습니다.");
    fourPillars = buildEmergencyPillars();
  }

  const elementSource = hpResult?.elements;
  const elementAnalysis = elementSource
    ? elementSource
    : (() => {
      try {
        return analyzeElements(fourPillars, baseDate);
      } catch (error) {
        warnings.push(`오행 분석 fallback: ${(error as Error).message}`);
        return {
          scores: {
            "목": DEFAULT_FALLBACK_ELEMENTS.elementScores[0],
            "화": DEFAULT_FALLBACK_ELEMENTS.elementScores[1],
            "토": DEFAULT_FALLBACK_ELEMENTS.elementScores[2],
            "금": DEFAULT_FALLBACK_ELEMENTS.elementScores[3],
            "수": DEFAULT_FALLBACK_ELEMENTS.elementScores[4],
          },
          counts: {
            "목": DEFAULT_FALLBACK_ELEMENTS.elementCounts[0],
            "화": DEFAULT_FALLBACK_ELEMENTS.elementCounts[1],
            "토": DEFAULT_FALLBACK_ELEMENTS.elementCounts[2],
            "금": DEFAULT_FALLBACK_ELEMENTS.elementCounts[3],
            "수": DEFAULT_FALLBACK_ELEMENTS.elementCounts[4],
          },
          basicPercentages: {
            "목": DEFAULT_FALLBACK_ELEMENTS.elementBasicPercentages[0],
            "화": DEFAULT_FALLBACK_ELEMENTS.elementBasicPercentages[1],
            "토": DEFAULT_FALLBACK_ELEMENTS.elementBasicPercentages[2],
            "금": DEFAULT_FALLBACK_ELEMENTS.elementBasicPercentages[3],
            "수": DEFAULT_FALLBACK_ELEMENTS.elementBasicPercentages[4],
          },
          dominant: ["목", "화", "토", "금", "수"],
          lacking: [],
          excessive: [],
          mainElement: "목",
          balance: {
            temperature: "Balanced",
            humidity: "Balanced",
            score: 60,
          },
        } as any;
      }
    })();

  const qualityScore = source === "high-precision" ? (hpResult?.meta?.qualityScore ?? 100) : 72;
  const reliability: "high" | "medium" | "low" = source === "fallback"
    ? "low"
    : qualityScore >= 90
      ? "high"
      : qualityScore >= 75
        ? "medium"
        : "low";
  const usedLocation = hpResult?.meta?.inputs?.usedLocation
    ? `${hpResult.meta.inputs.usedLocation.latitude}, ${hpResult.meta.inputs.usedLocation.longitude}`
    : `${KOREA_LOCATIONS.SEOUL.latitude}, ${KOREA_LOCATIONS.SEOUL.longitude}`;

  const now = new Date();
  const age = now.getFullYear() - safeBirthDate.getFullYear();
  let ageGroup: "10s" | "20s" | "30s" = "20s";
  if (age < 20) ageGroup = "10s";
  else if (age >= 30) ageGroup = "30s";

  // Convert ElementScores object to number[]
  const es = elementAnalysis.scores;
  const elementScores = [
    (es as Record<"목" | "화" | "토" | "금" | "수", number>)["목"] ?? 0,
    (es as Record<"목" | "화" | "토" | "금" | "수", number>)["화"] ?? 0,
    (es as Record<"목" | "화" | "토" | "금" | "수", number>)["토"] ?? 0,
    (es as Record<"목" | "화" | "토" | "금" | "수", number>)["금"] ?? 0,
    (es as Record<"목" | "화" | "토" | "금" | "수", number>)["수"] ?? 0,
  ];
  const ec = elementAnalysis.counts;
  const elementCounts = [
    (ec as Record<"목" | "화" | "토" | "금" | "수", number>)["목"] ?? 0,
    (ec as Record<"목" | "화" | "토" | "금" | "수", number>)["화"] ?? 0,
    (ec as Record<"목" | "화" | "토" | "금" | "수", number>)["토"] ?? 0,
    (ec as Record<"목" | "화" | "토" | "금" | "수", number>)["금"] ?? 0,
    (ec as Record<"목" | "화" | "토" | "금" | "수", number>)["수"] ?? 0,
  ];
  const epb = elementAnalysis.basicPercentages;
  const elementBasicPercentages = [
    (epb as Record<"목" | "화" | "토" | "금" | "수", number>)["목"] ?? 0,
    (epb as Record<"목" | "화" | "토" | "금" | "수", number>)["화"] ?? 0,
    (epb as Record<"목" | "화" | "토" | "금" | "수", number>)["토"] ?? 0,
    (epb as Record<"목" | "화" | "토" | "금" | "수", number>)["금"] ?? 0,
    (epb as Record<"목" | "화" | "토" | "금" | "수", number>)["수"] ?? 0,
  ];

  try {
    const safePillarIndex = Number.isFinite(fourPillars?.day?.ganjiIndex) ? fourPillars.day.ganjiIndex : 0;
    const safeDayStem = typeof fourPillars?.day?.stem === "string" ? fourPillars.day.stem : "\uAC00";
    const safeDayBranch = typeof fourPillars?.day?.branch === "string" ? fourPillars.day.branch : "\uC790";
    const safeStemElement = STEM_ELEMENTS[safeDayStem] ?? "목";
    const safeBranchElement = JIJI_ELEMENTS[fourPillars?.day?.branchIndex] ?? "수";

    return {
      pillarIndex: safePillarIndex,
      pillarNameKo: `${safeDayStem}${safeDayBranch}`,
      code: getPillarCode(safePillarIndex),
      element: safeStemElement,
      stemElement: safeStemElement,
      branchElement: safeBranchElement,
      elementScores,
      elementCounts,
      elementBasicPercentages,
      ageGroup,
      analysisMeta: {
        source,
        qualityScore,
        reliability,
        warnings,
        calendarType: safeCalendarType,
        timeUnknownFallbackUsed: safeTimeUnknown,
        usedLocation,
        lineageProfileId: hpResult?.meta?.inputs?.lineageProfileId,
        birthInstantUtc: hpResult?.meta?.diagnostics?.birthInstantUtc,
        historicalUtcOffsetMinutes: hpResult?.meta?.diagnostics?.historicalUtcOffsetMinutes,
        historicalDstOffsetMinutes: hpResult?.meta?.diagnostics?.historicalDstOffsetMinutes,
        officialCalendarYear: hpResult?.meta?.diagnostics?.officialCalendarYear,
        myeongriCalendarYear: hpResult?.meta?.diagnostics?.myeongriCalendarYear,
      },
      fourPillars,
      daewun: hpResult?.daewun,
      gyeokguk: hpResult?.gyeokguk,
      gangyak: hpResult?.gangyak,
      yongshin: hpResult?.yongshin,
      sinsal: hpResult?.sinsal,
      sipsong: hpResult?.sipsong,
      sibiwoonseong: hpResult?.sibiwoonseong,
      evidence: hpResult?.evidence,
      canonicalFeatures: hpResult?.canonicalFeatures,
      version: hpResult?.version ?? "saju-engine@fallback",
      integrity: hpResult?.integrity ?? `hash-${Date.now()}`,
      isTimeUnknown: isTimeUnknown,
    };
  } catch (error) {
    const emergencyPillars = buildEmergencyPillars();
    warnings.push(`최종 결과 조립 단계에서 복구했습니다: ${(error as Error).message}`);
    return {
      pillarIndex: 0,
      pillarNameKo: `${emergencyPillars.day.stem}${emergencyPillars.day.branch}`,
      code: "GAP_JA",
      element: "목",
      stemElement: "목",
      branchElement: "수",
      elementScores: DEFAULT_FALLBACK_ELEMENTS.elementScores,
      elementCounts: DEFAULT_FALLBACK_ELEMENTS.elementCounts,
      elementBasicPercentages: DEFAULT_FALLBACK_ELEMENTS.elementBasicPercentages,
      ageGroup: "20s",
      analysisMeta: {
        source: "fallback",
        qualityScore: 60,
        reliability: "low",
        warnings,
        calendarType: safeCalendarType,
        timeUnknownFallbackUsed: safeTimeUnknown,
        usedLocation: `${KOREA_LOCATIONS.SEOUL.latitude}, ${KOREA_LOCATIONS.SEOUL.longitude}`,
        lineageProfileId,
        officialCalendarYear: undefined,
        myeongriCalendarYear: undefined,
      },
      fourPillars: emergencyPillars,
      version: "saju-engine@emergency-fallback",
      integrity: `emergency-${Date.now()}`,
      isTimeUnknown: isTimeUnknown,
    };
  }
}
export async function calculateSajuFromBirthdate(
  birthdateStr: string,
  birthTime: string = "12:00",
  calendarType: 'solar' | 'lunar' = 'solar',
  gender: "M" | "F" = "M",
  isTimeUnknown: boolean = false,
  lineageProfileId?: string
): Promise<SajuResult> {
  const parsedTime = parseCivilTimeParts(birthTime);
  const fallbackTime = parsedTime ?? { hour: 12, minute: 0, second: 0 };
  const birthDate = parseCivilDate(birthdateStr, { fallbackTime })
    ?? new Date(1990, 0, 1, fallbackTime.hour, fallbackTime.minute, 0, 0);

  return await calculateSaju(birthDate, gender, birthTime, calendarType, isTimeUnknown, lineageProfileId);
}
