/**
 * Saju Calculation Module
 * 
 * DACRE Engine: Dynamic Age-Context Rendering Engine
 * Input: Birthdate/Time → Output: One of 60 Animal Archetypes (일주 기반)
 *
 * 만세력 간단 구현: 기준일(2000-01-01 = 戊午) 대비 경과일 mod 60 → 일주 인덱스
 * 
 * ---
 * 
 * HIGH-PRECISION ENGINE (New)
 * - Astronomical calculations (True Solar Time, EOT, Solar Terms)
 * - Myeongni-hak algorithms (Five Elements, Sinsal, Sipsong)
 * - Professional-grade accuracy (sajuplus.net equivalent)
 */

import { calculateHighPrecisionSaju } from '@/core/api/saju-engine';

// ===== HIGH-PRECISION ENGINE EXPORTS =====
export { SajuEngine, calculateHighPrecisionSaju } from '@/core/api/saju-engine';
export type { HighPrecisionSajuResult, SajuCalculationInput } from '@/core/api/saju-engine';

export { KOREA_LOCATIONS } from '@/core/astronomy/true-solar-time';
export type { Location } from '@/core/astronomy/true-solar-time';

export { SIXTY_GANJI } from '@/core/calendar/ganji';
export type { GanJi, FourPillars } from '@/core/calendar/ganji';

export type { ElementAnalysisResult, ElementScores } from '@/core/myeongni/elements';
export type { Sinsal } from '@/core/myeongni/sinsal';
export type { Sipsong } from '@/core/myeongni/sipsong';

// NEW: 대운/세운
export { calculateDaewun, getCurrentUnInfo, calculateSaewun } from '@/core/myeongni/daewun';
export type { DaewunInfo, SaewunInfo } from '@/core/myeongni/daewun';

// NEW: 격국
export { determineGyeokguk } from '@/core/myeongni/gyeokguk';
export type { GyeokgukInfo, Gyeokguk, JungGyeokguk, JongGyeokguk, JeonwangGyeokguk } from '@/core/myeongni/gyeokguk';

// NEW: 십이운성
export { analyzeSibiwoonseongAll, getSibiwoonseong } from '@/core/myeongni/sibiwoonseong';
export type { SibiwoonseongInfo, SibiwoonseongAnalysis, Sibiwoonseong } from '@/core/myeongni/sibiwoonseong';

// ===== SIMPLE DACRE ENGINE (Legacy, for backward compatibility) =====

export type Element = '목' | '화' | '토' | '금' | '수';

const CHEONGAN = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
const JIJI = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;

/** 천간 오행 매핑 */
const CHEONGAN_ELEMENTS: Element[] = [
  '목', '목', // 갑을
  '화', '화', // 병정
  '토', '토', // 무기
  '금', '금', // 경신
  '수', '수', // 임계
];

/** 지지 오행 매핑 */
const JIJI_ELEMENTS: Element[] = [
  '수', '토', '목', '목', // 자축인묘
  '토', '화', '화', '토', // 진사오미
  '금', '금', '토', '수', // 신유술해
];

/** 60갑자 순서 (0=甲子 ~ 59=癸亥) */
const PILLAR_NAMES_KO = [
  "갑자", "을축", "병인", "정묘", "무진", "기사", "경오", "신미", "임신", "계유",
  "갑술", "을해", "병자", "정축", "무인", "기묘", "경진", "신사", "임오", "계미",
  "갑신", "을유", "병술", "정해", "무자", "기축", "경인", "신묘", "임진", "계사",
  "갑오", "을미", "병신", "정유", "무술", "기해", "경자", "신축", "임인", "계묘",
  "갑진", "을사", "병오", "정미", "무신", "기유", "경술", "신해", "임자", "계축",
  "갑인", "을묘", "병진", "정사", "무오", "기미", "경신", "신유", "임술", "계해",
] as const;

/** DB/JSON용 코드 (예: GAP_JA, EUL_CHUK, ... GAP_SUL = 갑술) - 60갑자 순서 */
export const PILLAR_CODES: readonly string[] = [
  "GAP_JA", "EUL_CHUK", "BYEONG_IN", "JEONG_MYO", "MU_JIN", "GI_SA", "GYEONG_O", "SIN_MI", "IM_SIN", "GYE_YU",
  "GAP_SUL", "EUL_HAE", "BYEONG_JA", "JEONG_CHUK", "MU_IN", "GI_MYO", "GYEONG_JIN", "SIN_SA", "IM_O", "GYE_MI",
  "GAP_SIN", "EUL_YU", "BYEONG_SUL", "JEONG_HAE", "MU_JA", "GI_CHUK", "GYEONG_IN", "SIN_MYO", "IM_JIN", "GYE_SA",
  "GAP_O", "EUL_MI", "BYEONG_SIN", "JEONG_YU", "MU_SUL", "GI_HAE", "GYEONG_JA", "SIN_CHUK", "IM_IN", "GYE_MYO",
  "GAP_JIN", "EUL_SA", "BYEONG_O", "JEONG_MI", "MU_SIN", "GI_YU", "GYEONG_SUL", "SIN_HAE", "IM_JA", "GYE_CHUK",
  "GAP_IN", "EUL_MYO", "BYEONG_JIN", "JEONG_SA", "MU_O", "GI_MI", "GYEONG_SIN", "SIN_YU", "IM_SUL", "GYE_HAE",
];

/** 기준일: 2000-01-01 UTC = 戊午 (인덱스 54) */
const REFERENCE_DATE = new Date(Date.UTC(2000, 0, 1));
const REFERENCE_PILLAR_INDEX = 54; // 戊午

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysBetween(from: Date, to: Date): number {
  const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.floor((toUtc - fromUtc) / (24 * 60 * 60 * 1000));
}

/**
 * 생년월일(·시)을 받아 일주(日柱) 인덱스 0~59 반환
 */
export function getDayPillarIndex(birthDate: Date): number {
  const days = getDaysBetween(REFERENCE_DATE, birthDate);
  return ((REFERENCE_PILLAR_INDEX + days) % 60 + 60) % 60;
}

/**
 * 일주 인덱스 → 한글 이름 (갑자, 을축, ...)
 */
export function getPillarNameKo(index: number): string {
  return PILLAR_NAMES_KO[index % 60] ?? "갑자";
}

/**
 * 일주 인덱스 → DB/JSON용 코드 (GAP_JA, WO_DOG 등)
 */
export function getPillarCode(index: number): string {
  return PILLAR_CODES[index % 60] ?? "GAP_JA";
}

/**
 * 일주 인덱스 → 천간 오행
 * IMPROVED: 정확한 천간 매핑 (이전 단순 % 5에서 개선)
 */
export function getDayStemElement(pillarIndex: number): Element {
  const stemIndex = pillarIndex % 10; // 천간은 10개 순환
  return CHEONGAN_ELEMENTS[stemIndex];
}

/**
 * 일주 인덱스 → 지지 오행
 * IMPROVED: 정확한 지지 매핑
 */
export function getDayBranchElement(pillarIndex: number): Element {
  const branchIndex = Math.floor(pillarIndex / 5) % 12; // 지지는 12개 순환
  return JIJI_ELEMENTS[branchIndex];
}

/**
 * 일주의 주요 오행 (일간 기준)
 * 사주 분석은 주로 일간(천간)을 기준으로 하므로 천간 오행을 반환
 */
export function getPrimaryElement(pillarIndex: number): Element {
  return getDayStemElement(pillarIndex);
}

export type SajuResult = {
  pillarIndex: number;
  pillarNameKo: string;
  code: string;
  element: Element;          // 일간 오행
  stemElement: Element;      // 천간 오행 (명시적)
  branchElement: Element;    // 지지 오행
  elementScores: number[];   // 실시간 오행 점수 (%, 지장간 가중치)
  elementCounts: number[];   // 실시간 오행 개수 (0~8)
  elementBasicPercentages: number[]; // 기본 오행 점수 (%, 개수 기반)
  /** 나이대: "10s" | "20s" | "30s" (Age-Context용) */
  ageGroup: "10s" | "20s" | "30s";
  fourPillars: any;
  daewun?: any;
  gyeokguk?: any;
  version: string;
  integrity: string;
};

/**
 * 생년월일과 성별을 받아 고정밀 사주 분석 수행
 */
export async function calculateSaju(
  birthDate: Date,
  gender: "M" | "F" = "M"
): Promise<SajuResult> {
  // Use high-precision engine
  const hpResult = await calculateHighPrecisionSaju({
    birthDate,
    birthTime: `${birthDate.getHours()}:${birthDate.getMinutes()}`,
    gender,
    calendarType: 'solar'
  });

  const pillarIndex = getDayPillarIndex(birthDate);
  const now = new Date();
  const age = now.getFullYear() - birthDate.getFullYear();
  let ageGroup: "10s" | "20s" | "30s" = "20s";
  if (age < 20) ageGroup = "10s";
  else if (age >= 30) ageGroup = "30s";

  // Convert ElementScores object to number[] (목, 화, 토, 금, 수 순서)
  const es = hpResult.elements.scores;
  const elementScores = [es.목, es.화, es.토, es.금, es.수];

  const ec = hpResult.elements.counts;
  const elementCounts = [ec.목, ec.화, ec.토, ec.금, ec.수];

  const epb = hpResult.elements.basicPercentages;
  const elementBasicPercentages = [epb.목, epb.화, epb.토, ec.금, ec.수];

  return {
    pillarIndex,
    pillarNameKo: getPillarNameKo(pillarIndex),
    code: getPillarCode(pillarIndex),
    element: getPrimaryElement(pillarIndex),
    stemElement: getDayStemElement(pillarIndex),
    branchElement: getDayBranchElement(pillarIndex),
    elementScores,
    elementCounts,
    elementBasicPercentages,
    ageGroup,
    fourPillars: hpResult.fourPillars,
    daewun: hpResult.daewun,
    gyeokguk: hpResult.gyeokguk,
    version: hpResult.version,
    integrity: hpResult.integrity,
  };
}


/**
 * NEW: 생년월일 문자열과 시간으로 사주 계산 (dashboard에서 필요)
 */
export async function calculateSajuFromBirthdate(
  birthdateStr: string,
  birthTime: string = "12:00",
  calendarType: 'solar' | 'lunar' = 'solar'
): Promise<SajuResult> {
  const [year, month, day] = birthdateStr.split('-').map(Number);
  const [hour, minute] = birthTime.split(':').map(Number);

  const birthDate = new Date(year, month - 1, day, hour, minute);

  if (calendarType === 'lunar') {
    birthDate.setDate(birthDate.getDate() + 30);
  }

  return await calculateSaju(birthDate);
}
