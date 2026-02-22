/**
 * 입력 유효성 검사 (ERROR_CATALOG E1~E8, E6~E7 대응)
 * 런칭용 예외처리·테스트 기준
 */

export type BirthInput = {
  year: number;
  month: number;
  day: number;
};

export type ValidationResult =
  | { ok: true; birth: Date }
  | { ok: false; message: string };

const YEAR_MIN = 1900;
const YEAR_MAX = 2030;
const MONTH_MIN = 1;
const MONTH_MAX = 12;
const DAY_MIN = 1;
const DAY_MAX = 31;

function isValidDate(y: number, m: number, d: number): boolean {
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

/**
 * 생년월일 유효성 검사 (한 줄 체크: E6, E7)
 * - 존재하지 않는 날짜(2월 30일 등) → false
 * - 미래 날짜 → false
 */
export function validateBirthInput(input: BirthInput): ValidationResult {
  const { year, month, day } = input;

  if (year < YEAR_MIN || year > YEAR_MAX) {
    return { ok: false, message: `${YEAR_MIN}~${YEAR_MAX}년 사이로 입력하세요.` };
  }
  if (month < MONTH_MIN || month > MONTH_MAX) {
    return { ok: false, message: "1~12월 사이로 입력하세요." };
  }
  if (day < DAY_MIN || day > DAY_MAX) {
    return { ok: false, message: "1~31일 사이로 입력하세요." };
  }
  if (!isValidDate(year, month, day)) {
    return { ok: false, message: "존재하지 않는 날짜예요." };
  }

  const birth = new Date(year, month - 1, day);
  const now = new Date();
  if (birth > now) {
    return { ok: false, message: "생년월일은 오늘 이전이어야 해요." };
  }

  return { ok: true, birth };
}

/** API용 ageGroup 화이트리스트 (E12) */
export const AGE_GROUPS = ["10s", "20s", "30s"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

export function normalizeAgeGroup(value: string | null): AgeGroup {
  if (value === "10s" || value === "20s" || value === "30s") return value;
  return "20s";
}
