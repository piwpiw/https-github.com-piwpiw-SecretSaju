import { solarToLunar, type LunarDate } from "@/core/calendar/lunar-solar";
import { getTojeongGwesa, type TojeongGwesaFortune } from "@/data/tojeongGwesa";

export type TojeongCategory = "career" | "money" | "love" | "health" | "relationships";

export type TojeongCategoryResult = {
  key: TojeongCategory;
  label: string;
  score: number;
  tone: "positive" | "neutral" | "caution";
  reason: string;
  action: string;
};

export type TojeongMonthly = {
  month: number;
  title: string;
  focus: string;
  score: number;
  tone: "up" | "steady" | "down";
  summary: string;
  tips: string[];
};

export type TojeongSourceSignal = {
  name: string;
  value: string;
};

export type TojeongGweBasis = "lunar" | "solar-approx";

export type TojeongGwe = {
  /** 상중하 결합 표기: "111" ~ "863" */
  code: string;
  /** 상괘 1~8 (건천·태택·리화·진뢰·손풍·감수·간산·곤지) */
  upper: number;
  /** 중괘 1~6 */
  middle: number;
  /** 하괘 1~3 */
  lower: number;
  /** 상괘의 8괘 이름 (예: "건천(乾天)") */
  upperName: string;
  title: string;
  summary: string;
  fortune: TojeongGwesaFortune;
  monthlyHint: string;
  /**
   * lunar: 음력 변환(Intl Chinese calendar) 성공, 음력 월·일 기반.
   * solar-approx: 음력 변환 불가 환경 → 양력 월·일 기반 근사.
   */
  basis: TojeongGweBasis;
  /** 산출에 쓰인 중간값 (검증·근거 표시용) */
  inputs: {
    age: number;
    lunarMonth: number;
    lunarDay: number;
    /** 대월 30 / 소월 29 (양력 근사 시 해당 양력 월 일수 기준 30/29 매핑) */
    monthSizeValue: number;
    taeseSu: number;
    wolgeonSu: number;
    iljinSu: number;
  };
};

export type TojeongReport = {
  year: number;
  profileName: string;
  createdAt: string;
  mainScore: number;
  mainGrade: string;
  theme: string;
  oneLineSummary: string;
  /**
   * 정통 방식(상·중·하 3괘 → 144괘) 산출 결과.
   * 음력 변환이 불가능한 환경 등 산출 실패 시 생략된다 (하위 호환).
   */
  gwe?: TojeongGwe;
  categories: TojeongCategoryResult[];
  monthly: TojeongMonthly[];
  strengths: string[];
  cautions: string[];
  actionPlans: string[];
  sources: TojeongSourceSignal[];
};

const YEARLY_THEMES = [
  "구조 정비형",
  "확장 실천형",
  "재점검형",
  "안정 축적형",
  "관계 정렬형",
  "행복 가속형",
];

const STEM_NAMES = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCH_NAMES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const BRANCH_ANIMALS = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];

const CATEGORY_TEXTS: Record<
  TojeongCategory,
  {
    label: string;
    positive: string[];
    neutral: string[];
    caution: string[];
    actionPositive: string[];
    actionNeutral: string[];
    actionCaution: string[];
  }
> = {
  career: {
    label: "직업운",
    positive: ["정리한 플랜이 성과로 이어집니다.", "책임 범위를 정리하면 협업 성과가 좋아집니다.", "새 기회는 작은 파일럿으로 먼저 검증하세요."],
    neutral: ["기회는 있지만 실행 속도 조절이 필요합니다.", "중장기 플랜이 성사되기 쉽습니다.", "성과보다 프로세스 우선순위를 잡으면 유리합니다."],
    caution: ["감정 의존 의사결정은 기회 손실로 이어질 수 있습니다.", "결과보다 과정이 무너진다면 즉시 우선순위 재설정 필요.", "서두르다보면 팀 갈등이나 과제 누락이 생기기 쉬워요."],
    actionPositive: ["주간 목표 2개만 설정하고 집중", "회의 전 체크리스트 작성", "실행 계획을 수치로 확정"],
    actionNeutral: ["월말 검토 기준 점검", "의존도 높은 업무 동반자 1명만 지정", "협업 범위 미리 합의"],
    actionCaution: ["일단 결재 지연 없는 작은 실행부터", "중요 의사결정은 24시간 숙성", "문서 기반 의사결정 체계로 보완"],
  },
  money: {
    label: "금전운",
    positive: ["지출 통제가 성립되면 회수 속도가 빨라집니다.", "예측한 지출이 실제 흐름과 잘 맞아떨어집니다.", "보수적 실행이 오히려 기회를 키웁니다."],
    neutral: ["지출/수입 변동이 반복되지만 과도한 불안은 불필요합니다.", "안정성 있는 소규모 저장이 가장 효율적입니다.", "월말 정산 습관이 효과를 높입니다."],
    caution: ["잦은 즉흥 소비나 과잉 구매에 주의하세요.", "한 번의 큰 결단보다 분할 실행이 유리합니다.", "현금 흐름 점검 없이 선결제형 결정을 피하세요."],
    actionPositive: ["구매는 48시간 규칙 적용", "매달 고정지출 1개 줄이기", "월 수입의 10% 비상비로 분리"],
    actionNeutral: ["지출 자동화 범주 분리", "비상금 목표액 계산 후 미만 시 경고", "급여일·지출일 동선 분리"],
    actionCaution: ["카드 한도 임시 낮추기", "비필수 구독 정리", "사전 비교 없이 결제하지 않기"],
  },
  love: {
    label: "애정운",
    positive: ["관계의 말보다 신호를 정리하면 오해가 줄어듭니다.", "신뢰형 대화로 안정감이 커집니다.", "작은 배려가 리듬을 만듭니다."],
    neutral: ["감정선은 안정되지만 표현은 조심스럽게 맞춰야 합니다.", "상대 패턴을 관찰하면 충돌을 줄일 수 있습니다.", "가벼운 대화 반복이 관계 회복에 유리."],
    caution: ["질투/방어 반응이 올라올 수 있어요.", "의심이 쌓이면 단정적 해석을 피하세요.", "감정 피로가 누적되면 대화는 짧게 쪼개서."],
    actionPositive: ["매일 10분 감정 점검", "좋은 점 먼저 언급", "서두르지 않는 약속 잡기"],
    actionNeutral: ["대화는 근거 중심으로 정리", "일정 조정권한 상호 공유", "감정이 올라오면 1회 호흡 후 답장"],
    actionCaution: ["연락 패턴 과몰입 지양", "비교보다 요청 방식 명확화", "단기 판단은 48시간 뒤 확정"],
  },
  health: {
    label: "건강운",
    positive: ["회복 루틴이 맞아떨어지는 시기입니다.", "수면-식사 패턴이 좋아지면 컨디션 회복 속도가 빨라집니다.", "적은 운동의 누적 효과가 큽니다."],
    neutral: ["큰 이상은 없으나 지속 리듬이 중요합니다.", "무리한 공복/과로는 피하세요.", "휴식 비중을 20~30%만 확장해보세요."],
    caution: ["수면 시간 변동이 크면 피로가 축적됩니다.", "통증/두통/목피로가 반복될 수 있어요.", "신체 신호를 무시하면 회복 기간이 길어집니다."],
    actionPositive: ["저자극 운동 3회/주", "탄산음료/야식 제한", "취침 30분 전 수면 리듬 정돈"],
    actionNeutral: ["점심 루틴에 가벼운 산책", "수분 알림 설정", "일정표에 10분 회복 타임 반영"],
    actionCaution: ["과도한 카페인 감소", "통증이 2주 이상 지속 시 점검", "야간 집중 과몰입 시간 제한"],
  },
  relationships: {
    label: "인간관계운",
    positive: ["협업에서 역할이 맞물리면 시너지 큼", "중재자보다 경계 설정이 안정적입니다.", "신뢰 축적이 빠르게 일어납니다."],
    neutral: ["초반엔 오해가 있었지만 조정 기회로 바뀝니다.", "기대치 조정이 실무 피로를 줄입니다.", "의사표현이 분명한 사람이 이깝습니다."],
    caution: ["남의 속도와 내 속도를 구분하지 않으면 피로 누수가 생깁니다.", "감정적 판단이 신뢰 손실로 이어질 수 있습니다.", "초대/요청의 잦은 변경은 신뢰를 낮춥니다."],
    actionPositive: ["요구사항을 1문장으로 정리", "변경사항은 24시간 내 공지", "경계값(시간, 범위) 선 제시"],
    actionNeutral: ["미팅 전 안건 1개 고정", "상대 입장 먼저 요약 후 반응", "약속 후 메모로 합의 고정"],
    actionCaution: ["확인 없는 약속은 재협상", "비난 표현 줄이고 요청으로 전환", "소문성 정보는 즉시 중단"],
  },
};

const MONTH_HINTS = [
  ["계획 고정", "지출 점검", "주간 리듬", "감정 기록", "관계 선 정리", "휴식 강화"],
  ["약속 간소화", "중요 이메일 우선", "작은 투자 검토", "휴식 알람", "피드백 수용", "야근 줄이기"],
  ["새 도전의 씨앗", "체크리스트 적용", "과한 낙관 자제", "건강 루틴 연속", "소통 톤 완화", "지출 제한"],
  ["평판 관리", "기록 기반 판단", "안정적 재투자", "규칙적인 수면", "팀 피드백", "비상 대응"],
];

// ─────────────────────────────────────────────────────────────────────────────
// 정통 토정비결 괘 산출 (상·중·하 3괘 → 144괘)
//
// 산출 규칙(전통 골격):
//   상괘 = (나이 + 그 해 태세수) % 8            — 나머지 0이면 8
//   중괘 = (생월 월수(대월30/소월29) + 월건수) % 6 — 나머지 0이면 6
//   하괘 = (음력 생일 수 + 일진수) % 3           — 나머지 0이면 3
//
// [정직성 고지 — 현대 재구성 방식]
// 태세수·월건수·일진수는 원래 전통 수리표(선척수 등)에서 뽑는 값이지만,
// 이 저장소는 그 표의 정확한 원전을 확보하지 못했다. 따라서 아래 구현은
// 해당 간지의 60갑자 순번에서 "천간 순번(1~10) + 지지 순번(1~12)" 을 취하는
// 결정적(deterministic) 유도식을 쓰며, 이는 전통 수리표의 인용이 아니라
// 간지 인덱스 기반의 '현대 재구성 방식'이다. UI 근거 로그에도 동일하게 명시한다.
//
// 음력 처리: src/core/calendar/lunar-solar.ts 의 Intl Chinese calendar 변환을
// 사용해 실제 음력 생월·생일과 월대소(대월30/소월29)를 반영한다. 런타임이
// 음력 변환을 지원하지 않으면 양력 월·일 기반 근사로 내려가고 basis 를
// "solar-approx" 로 표시한다.
// ─────────────────────────────────────────────────────────────────────────────

const GWE_UPPER_NAMES = [
  "건천(乾天)", "태택(兌澤)", "리화(離火)", "진뢰(震雷)",
  "손풍(巽風)", "감수(坎水)", "간산(艮山)", "곤지(坤地)",
];

/** 나머지가 0이면 최댓값(n)으로 치환하는 전통식 나머지 */
function remainderOrMax(value: number, n: number): number {
  const r = ((value % n) + n) % n;
  return r === 0 ? n : r;
}

/** 60갑자 인덱스(0=갑자) → 천간 순번(1~10) + 지지 순번(1~12). 현대 재구성 유도식. */
function ganjiNumber(index60: number): number {
  const i = ((index60 % 60) + 60) % 60;
  return (i % 10) + 1 + (i % 12) + 1;
}

/** 연도 → 60갑자 인덱스 (1984년 = 갑자 = 0). 입춘 경계는 적용하지 않는 연 단위 근사. */
function yearGanjiIndex(year: number): number {
  return (((year - 4) % 60) + 60) % 60;
}

/** 그 해의 태세수 (현대 재구성: 연간지의 천간·지지 순번 합) */
export function getTaeseSu(year: number): number {
  return ganjiNumber(yearGanjiIndex(year));
}

/**
 * 그 해 음력 m월의 월건수 (현대 재구성).
 * 월지: 1월=인(寅) 기준, 월간: 오호둔(연간에 따른 월간 기점) 규칙으로 유도한
 * 월 간지의 천간·지지 순번 합.
 */
export function getWolgeonSu(year: number, lunarMonth: number): number {
  const m = remainderOrMax(lunarMonth, 12);
  const yearStem = yearGanjiIndex(year) % 10;
  const monthBranch = (m + 1) % 12; // 1월 → 인(2)
  const monthStem = ((yearStem % 5) * 2 + 2 + (m - 1)) % 10;
  return monthStem + 1 + monthBranch + 1;
}

/** 기준일: 2000-01-01 = 무오(인덱스 54). src/lib/saju/index.ts 의 일주 기준과 동일. */
const DAY_GANJI_REFERENCE_UTC = Date.UTC(2000, 0, 1);
const DAY_GANJI_REFERENCE_INDEX = 54;

/** 양력 날짜 → 일진(일주) 60갑자 인덱스 */
export function getDayGanjiIndex(date: Date): number {
  const target = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.floor((target - DAY_GANJI_REFERENCE_UTC) / 86400000);
  return (((DAY_GANJI_REFERENCE_INDEX + days) % 60) + 60) % 60;
}

/** 그 날의 일진수 (현대 재구성: 일진 간지의 천간·지지 순번 합) */
export function getIljinSu(date: Date): number {
  return ganjiNumber(getDayGanjiIndex(date));
}

/**
 * 순수 괘 번호 유도식. 태세수/월건수/일진수와 월수·생일수를 받아
 * 상(1~8)·중(1~6)·하(1~3)와 코드("111"~"863")를 결정한다.
 */
export function deriveGweNumbers(params: {
  age: number;
  monthSizeValue: number;
  dayNumber: number;
  taeseSu: number;
  wolgeonSu: number;
  iljinSu: number;
}): { upper: number; middle: number; lower: number; code: string } {
  const upper = remainderOrMax(params.age + params.taeseSu, 8);
  const middle = remainderOrMax(params.monthSizeValue + params.wolgeonSu, 6);
  const lower = remainderOrMax(params.dayNumber + params.iljinSu, 3);
  return { upper, middle, lower, code: `${upper}${middle}${lower}` };
}

/** solarToLunar 를 안전하게 호출 (Intl Chinese calendar 미지원 환경 대비) */
function tryToLunar(date: Date): LunarDate | null {
  try {
    return solarToLunar(date);
  } catch {
    return null;
  }
}

/**
 * (음력 연·월·일) → 양력 Date 근사 탐색.
 * lunarToSolar 의 전 구간 선형 탐색 대신, solarToLunar 를 이용해
 * 추정치에서 날짜 차이만큼 보정해 가는 반복 수렴 방식(호출 수십 회 이내).
 */
function tryFindSolarDateForLunar(lunarYear: number, lunarMonth: number, lunarDay: number, wantLeapMonth: boolean = false): Date | null {
  // 음력 m월은 대략 양력 m+1월 무렵
  let guess = new Date(lunarYear, lunarMonth - 1, Math.min(lunarDay, 28));
  guess = new Date(guess.getFullYear(), guess.getMonth(), guess.getDate() + 30);

  const matches = (parsed: LunarDate | null): boolean =>
    !!parsed && parsed.year === lunarYear && parsed.month === lunarMonth
    && parsed.day === lunarDay && parsed.isLeapMonth === wantLeapMonth;

  for (let iter = 0; iter < 24; iter += 1) {
    const parsed = tryToLunar(guess);
    if (!parsed) return null;
    if (matches(parsed)) return guess;

    const yearDiff = lunarYear - parsed.year;
    const monthDiff = lunarMonth - parsed.month;
    const dayDiff = lunarDay - parsed.day;
    let step = Math.round(yearDiff * 354 + monthDiff * 29.5 + dayDiff);
    if (step === 0) {
      // 같은 숫자의 윤달에 착지했거나 반올림이 0으로 떨어진 경우.
      // 예전에는 ±29 점프로 빠져나가려 했는데, 윤달이 낀 해의 월말
      // 날짜(예: 2004년 평2월 30일)에서는 두 추정치 사이를 영원히
      // 진동해 수렴에 실패했다. 조잡한 점프 대신 아래의 유한 선형
      // 탐색으로 넘긴다.
      break;
    }
    guess = new Date(guess.getFullYear(), guess.getMonth(), guess.getDate() + step);
  }

  // 폴백: 마지막 추정치 주변 ±60일을 하루 단위로 훑는다. 목표 음력일이
  // 실존하면 이 범위 안에 반드시 있다(추정 오차는 윤달 한 달 수준).
  for (let offset = 0; offset <= 60; offset += 1) {
    for (const sign of offset === 0 ? [1] : [1, -1]) {
      const probe = new Date(guess.getFullYear(), guess.getMonth(), guess.getDate() + offset * sign);
      if (matches(tryToLunar(probe))) return probe;
    }
  }
  return null;
}

/** 해당 음력 월이 대월(30일)인지 판정. anchorSolar 는 그 음력 월 내부의 양력 날짜. */
function isBigLunarMonth(anchorSolar: Date, anchorLunar: LunarDate): boolean | null {
  const probe = new Date(
    anchorSolar.getFullYear(),
    anchorSolar.getMonth(),
    anchorSolar.getDate() + (30 - anchorLunar.day)
  );
  const parsed = tryToLunar(probe);
  if (!parsed) return null;
  return (
    parsed.year === anchorLunar.year &&
    parsed.month === anchorLunar.month &&
    parsed.isLeapMonth === anchorLunar.isLeapMonth &&
    parsed.day === 30
  );
}

/** 양력 근사 시 월수: 그 양력 월의 일수(31/30→30, 29/28→29)로 대소 매핑 */
function solarApproxMonthSize(year: number, month: number): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  return daysInMonth >= 30 ? 30 : 29;
}

/**
 * 정통 방식 토정비결 괘 산출.
 * birthMonth/birthDay 는 프로필에 입력된 그대로의 값이며,
 * calendarType === "lunar" 면 이미 음력 수치로 간주한다.
 */
export function calculateTojeongGwe(params: {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  calendarType?: "solar" | "lunar";
  /** 음력 입력이 윤달인 경우 (프로필의 isLeapMonth) */
  isLeapMonth?: boolean;
  targetYear: number;
}): TojeongGwe | null {
  const { birthYear, birthMonth, birthDay, targetYear } = params;
  const calendarType = params.calendarType === "lunar" ? "lunar" : "solar";
  const isLeapMonth = calendarType === "lunar" && params.isLeapMonth === true;

  if (!Number.isFinite(birthYear) || !Number.isFinite(birthMonth) || !Number.isFinite(birthDay)) {
    return null;
  }
  // 범위 밖 입력(월 13, 일 0 등)이 근거 로그까지 흘러가지 않게 막는다
  if (birthMonth < 1 || birthMonth > 12 || birthDay < 1 || birthDay > 31) {
    return null;
  }

  // 세는나이 (한국식)
  const age = Math.max(1, targetYear - birthYear + 1);

  let basis: TojeongGweBasis = "lunar";
  let lunarMonth: number;
  let lunarDay: number;
  let birthSolarAnchor: Date | null = null;
  let birthLunar: LunarDate | null = null;

  if (calendarType === "lunar") {
    lunarMonth = birthMonth;
    lunarDay = birthDay;
    birthSolarAnchor = tryFindSolarDateForLunar(birthYear, birthMonth, birthDay, isLeapMonth);
    birthLunar = birthSolarAnchor
      ? { year: birthYear, month: birthMonth, day: birthDay, isLeapMonth }
      : null;
    if (!birthSolarAnchor) {
      // 음력 입력이므로 월·일 수치는 그대로 쓰되, 월대소 판정만 불가 → 근사 표기
      basis = "solar-approx";
    }
  } else {
    const solarBirth = new Date(birthYear, birthMonth - 1, birthDay);
    const converted = tryToLunar(solarBirth);
    if (converted) {
      lunarMonth = converted.month;
      lunarDay = converted.day;
      birthSolarAnchor = solarBirth;
      birthLunar = converted;
    } else {
      // 음력 변환 불가 환경 → 양력 월·일 기반 근사 (UI에 고지)
      basis = "solar-approx";
      lunarMonth = birthMonth;
      lunarDay = birthDay;
    }
  }

  // 중괘의 월수: 대월 30 / 소월 29
  let monthSizeValue: number;
  if (birthSolarAnchor && birthLunar) {
    const big = isBigLunarMonth(birthSolarAnchor, birthLunar);
    monthSizeValue = big === null ? solarApproxMonthSize(birthYear, birthMonth) : big ? 30 : 29;
    if (big === null) basis = "solar-approx";
  } else {
    monthSizeValue = solarApproxMonthSize(birthYear, birthMonth);
  }

  // 일진수: 보려는 해의 (음력) 생일에 해당하는 양력 날짜의 일진
  let birthdayInTargetYear: Date | null = null;
  if (basis === "lunar") {
    birthdayInTargetYear =
      tryFindSolarDateForLunar(targetYear, lunarMonth, lunarDay) ??
      (lunarDay === 30 ? tryFindSolarDateForLunar(targetYear, lunarMonth, 29) : null);
  }
  if (!birthdayInTargetYear) {
    // 근사: 보려는 해의 같은 양력 월·일 (2/29 등은 그 달 말일로 보정)
    const clampedDay = Math.min(birthDay, new Date(targetYear, birthMonth, 0).getDate());
    birthdayInTargetYear = new Date(targetYear, birthMonth - 1, clampedDay);
  }

  const taeseSu = getTaeseSu(targetYear);
  const wolgeonSu = getWolgeonSu(targetYear, lunarMonth);
  const iljinSu = getIljinSu(birthdayInTargetYear);

  const { upper, middle, lower, code } = deriveGweNumbers({
    age,
    monthSizeValue,
    dayNumber: lunarDay,
    taeseSu,
    wolgeonSu,
    iljinSu,
  });

  const gwesa = getTojeongGwesa(code);
  if (!gwesa) return null;

  return {
    code,
    upper,
    middle,
    lower,
    upperName: GWE_UPPER_NAMES[upper - 1],
    title: gwesa.title,
    summary: gwesa.summary,
    fortune: gwesa.fortune,
    monthlyHint: gwesa.monthlyHint,
    basis,
    inputs: { age, lunarMonth, lunarDay, monthSizeValue, taeseSu, wolgeonSu, iljinSu },
  };
}

function normalizeScore(value: number): number {
  const bounded = Math.round(value);
  return Math.max(30, Math.min(99, bounded));
}

function gradeByScore(score: number) {
  if (score >= 78) return "매우좋음";
  if (score >= 62) return "좋음";
  if (score >= 52) return "보통";
  return "주의";
}

function toneFromScore(score: number): TojeongCategoryResult["tone"] {
  if (score >= 70) return "positive";
  if (score >= 55) return "neutral";
  return "caution";
}

function monthTone(score: number): TojeongMonthly["tone"] {
  if (score >= 74) return "up";
  if (score >= 58) return "steady";
  return "down";
}

function pickFromList<T>(items: T[], idx: number) {
  if (items.length === 0) return undefined;
  return items[idx % items.length];
}

function pickText(category: TojeongCategory, score: number, idx: number) {
  const bucket =
    score >= 70 ? CATEGORY_TEXTS[category].positive
      : score >= 55 ? CATEGORY_TEXTS[category].neutral
        : CATEGORY_TEXTS[category].caution;
  return bucket[idx % bucket.length];
}

function pickAction(category: TojeongCategory, score: number, idx: number) {
  const bucket =
    score >= 70 ? CATEGORY_TEXTS[category].actionPositive
      : score >= 55 ? CATEGORY_TEXTS[category].actionNeutral
        : CATEGORY_TEXTS[category].actionCaution;
  return bucket[idx % bucket.length];
}

export function buildTojeongReport(params: {
  profileName: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthBranchIndex: number;
  birthPillarIndex: number;
  yearPillarIndex: number;
  year: number;
  birthDayOfYear: number;
  isFemale: boolean;
  /**
   * 프로필의 달력 유형 (생략 시 양력으로 간주).
   * "lunar" 면 birthMonth/birthDay 를 이미 음력 수치로 간주하고 144괘를 산출한다.
   */
  calendarType?: "solar" | "lunar";
  /** 음력 프로필의 윤달 여부 */
  isLeapMonth?: boolean;
}) {
  const {
    profileName,
    birthYear,
    birthMonth,
    birthDay,
    birthBranchIndex,
    birthPillarIndex,
    yearPillarIndex,
    year,
    birthDayOfYear,
    isFemale,
    calendarType,
    isLeapMonth,
  } = params;

  const age = year - birthYear + 1;
  const animal = BRANCH_ANIMALS[birthBranchIndex % 12];
  // yearPillarIndex 는 보려는 해의 60갑자 인덱스 (예: 2026년 = 병오 = 42)
  const yearGanjiName = STEM_NAMES[yearPillarIndex % 10] + BRANCH_NAMES[yearPillarIndex % 12];
  const yearShift = Math.abs((yearPillarIndex % 12) - (birthPillarIndex % 12));
  const relationIndex = (birthPillarIndex + yearPillarIndex + birthDayOfYear + (isFemale ? 7 : 3)) % YEARLY_THEMES.length;
  const baseSeed = (birthPillarIndex * 7 + yearPillarIndex + (isFemale ? -6 : 5) + age) % 100;
  const mainScore = normalizeScore(65 + (yearShift * 1.5) + (baseSeed % 20) - (isFemale ? 2 : 0));
  const mainTone = gradeByScore(mainScore);
  const theme = YEARLY_THEMES[relationIndex % YEARLY_THEMES.length];

  const categories: TojeongCategory[] = ["career", "money", "love", "health", "relationships"];
  const detailedCategories = categories.map((key, idx) => {
    const score = normalizeScore(54 + ((yearShift * 4 + birthPillarIndex + (isFemale ? 8 : 5) + idx * 11) % 42));
    return {
      key,
      label: CATEGORY_TEXTS[key].label,
      score,
      tone: toneFromScore(score),
      reason: pickText(key, score, idx + birthPillarIndex),
      action: pickAction(key, score, idx + birthBranchIndex),
    };
  });

  const monthly = Array.from({ length: 12 }, (_, idx) => {
    const month = idx + 1;
    const seasonalIndex = ((yearPillarIndex + idx * 5 + birthDayOfYear / 30 + birthMonth) % 100);
    const score = normalizeScore(50 + ((seasonalIndex * 1.7 + birthPillarIndex / 2 + age % 10) % 45));
    const tone = monthTone(score);
    const title = score >= 74
      ? `유리한 흐름 ${month}월`
      : score >= 58
        ? `안정형 ${month}월`
        : `보완형 ${month}월`;
    const summary = `${tone === "up" ? "확대해도 되는 기간" : tone === "steady" ? "평준화 구간" : "과욕 조절 구간"}으로, ${month}월은 ${score >= 58 ? "리듬 유지" : "리스크 관리"}가 핵심입니다.`;
    const tipBank = MONTH_HINTS[idx % MONTH_HINTS.length];
    return {
      month,
      title,
      focus: pickFromList(tipBank, idx + Math.floor(baseSeed / 3)) || tipBank[0],
      score,
      tone,
      summary,
      tips: [
        `${animal}띠 특성상 ${animal} 기운이 안정성에 유리하게 반응합니다.`,
        `${yearGanjiName}년 주기 기준으로 일정 누적 관리를 권장합니다.`,
        pickFromList(tipBank, idx * 2 + 3) || tipBank[0],
      ].filter(Boolean),
    };
  });

  const strengths = [
    `${birthDay}일 출생의 시간 리듬은 실행 의지가 높습니다.`,
    `올해는 ${theme}이 중심이어서 핵심 목표를 1개로 압축할수록 효율이 오릅니다.`,
    `월단위 조정이 잘 맞을 때 성과 스파이크가 나타나는 구조입니다.`,
  ];
  const cautions = [
    "감정 판단으로 결정을 내리면 타이밍이 늦어집니다.",
    "숫자보다 사람/프로세스 관리를 먼저 잡아야 불필요한 마찰이 줄어듭니다.",
    "무리한 집중은 피로 누적으로 되돌아옵니다.",
  ];
  const actionPlans = [
    "연초에 3개 목표 + 3개 예산 규칙을 고정하고 월별 진척만 조정하세요.",
    "월말에는 본인 기준점검(금전, 관계, 건강) 각 1가지씩 기록하세요.",
    "실패 가능성이 큰 일정은 반드시 1회 분기 리뷰에서만 결정하세요.",
  ];

  // 정통 144괘 산출 — 실패해도 기존 리포트는 그대로 반환 (하위 호환)
  let gwe: TojeongGwe | undefined;
  try {
    gwe = calculateTojeongGwe({
      birthYear,
      birthMonth,
      birthDay,
      calendarType,
      isLeapMonth,
      targetYear: year,
    }) ?? undefined;
  } catch {
    gwe = undefined;
  }

  const gweSources: TojeongSourceSignal[] = gwe
    ? [
        {
          name: "괘 산출",
          value: `상 ${gwe.upper}·중 ${gwe.middle}·하 ${gwe.lower} = ${gwe.code}괘 — 상괘 (나이 ${gwe.inputs.age}+태세수 ${gwe.inputs.taeseSu})%8, 중괘 (월수 ${gwe.inputs.monthSizeValue}+월건수 ${gwe.inputs.wolgeonSu})%6, 하괘 (생일수 ${gwe.inputs.lunarDay}+일진수 ${gwe.inputs.iljinSu})%3`,
        },
        {
          name: "괘 기준",
          value:
            gwe.basis === "lunar"
              ? "음력 생월·생일과 월대소(대월30/소월29) 반영. 태세수·월건수·일진수는 간지 순번 기반 현대 재구성 방식"
              : "음력 변환 불가로 양력 월·일 기반 근사. 태세수·월건수·일진수는 간지 순번 기반 현대 재구성 방식",
        },
      ]
    : [];

  return {
    year,
    profileName,
    createdAt: new Date().toISOString(),
    mainScore,
    mainGrade: mainTone,
    theme,
    gwe,
    oneLineSummary: `${age}세 기준, 올해는 ${theme} 기조로 목표를 선명하게 압축하면 성취도가 높습니다.`,
    categories: detailedCategories,
    monthly,
    strengths,
    cautions,
    actionPlans,
    sources: [
      ...gweSources,
      { name: "기준", value: "일주/대운 기반 일간-연주 상호 관계" },
      { name: "보정", value: "연령, 성별, 월별 경과(계절) 보정" },
      { name: "범위", value: "월별 점수 12칸 + 핵심운 5칸(경력/금전/애정/건강/관계)" },
      { name: "투입값", value: "프로필 생년월일, 성별, 출생시, 음/양력 타입" },
    ],
  };
}
