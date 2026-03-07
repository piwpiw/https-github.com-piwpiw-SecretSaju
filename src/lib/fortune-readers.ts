import type { Tendency } from "@/lib/persona-matrix";

export type ReaderQueryType = "daily" | "result" | "compatibility" | "chat";
export type ReaderTier = "starter" | "plus" | "pro" | "signature";
export type ReaderCategory = "general" | "love" | "career" | "wealth" | "timing";
export type ReaderId =
  | "classic_balance"
  | "easy_translator"
  | "love_counselor"
  | "career_strategist"
  | "timing_signal"
  | "signature_master";

const FAVORITE_READERS_KEY = "secret_saju_favorite_readers";
const LAST_READER_BY_QUERY_KEY = "secret_saju_last_reader_by_query";
const UNLOCKED_READERS_KEY = "secret_saju_unlocked_readers";

export interface FortuneReaderProfile {
  id: ReaderId;
  name: string;
  subtitle: string;
  description: string;
  heroEmoji: string;
  tier: ReaderTier;
  category: ReaderCategory;
  recommendedModel: "GPT-4O" | "CLAUDE-3.5" | "GEMINI-1.5";
  warmth: number;
  directness: number;
  jargonDensity: number;
  easyBias: number;
  actionBias: number;
  specialties: string[];
  curiosityPrompt: string;
}

const READER_PROFILES: FortuneReaderProfile[] = [
  {
    id: "classic_balance",
    name: "정통 명리 해석가",
    subtitle: "원국 구조와 십신의 균형을 먼저 읽는 기본 리더",
    description: "격국, 강약, 십신, 구조의 균형을 중심으로 차분하고 정석적으로 풀이합니다.",
    heroEmoji: "🧭",
    tier: "starter",
    category: "general",
    recommendedModel: "GPT-4O",
    warmth: 58,
    directness: 72,
    jargonDensity: 78,
    easyBias: 40,
    actionBias: 62,
    specialties: ["원국", "십신", "강약", "격국"],
    curiosityPrompt: "왜 이런 사주 구조가 반복되는지 전통 명리 기준으로 설명합니다.",
  },
  {
    id: "easy_translator",
    name: "쉬운 번역 해설가",
    subtitle: "초보자에게 가장 읽기 쉬운 설명에 강한 리더",
    description: "전문 용어를 줄이고, 생활 언어와 비유로 바꿔 사용자가 바로 이해하게 돕습니다.",
    heroEmoji: "📘",
    tier: "starter",
    category: "general",
    recommendedModel: "CLAUDE-3.5",
    warmth: 84,
    directness: 46,
    jargonDensity: 24,
    easyBias: 92,
    actionBias: 60,
    specialties: ["쉬운 설명", "입문자", "관계 번역", "생활형 조언"],
    curiosityPrompt: "전문 표현이 어려울 때 같은 결론을 더 쉽게 풀어 설명합니다.",
  },
  {
    id: "love_counselor",
    name: "연애 흐름 상담가",
    subtitle: "감정선과 관계 패턴을 집중해서 읽는 리더",
    description: "궁합, 감정 리듬, 표현 방식, 반복 충돌 포인트를 관계 언어로 해석합니다.",
    heroEmoji: "💞",
    tier: "plus",
    category: "love",
    recommendedModel: "CLAUDE-3.5",
    warmth: 88,
    directness: 52,
    jargonDensity: 48,
    easyBias: 70,
    actionBias: 74,
    specialties: ["연애", "궁합", "감정선", "갈등 패턴"],
    curiosityPrompt: "왜 끌리고 왜 부딪히는지를 관계 중심 언어로 보여줍니다.",
  },
  {
    id: "career_strategist",
    name: "커리어 전략가",
    subtitle: "일, 성과, 실행 타이밍을 우선 보는 리더",
    description: "직업 적성, 성과 방식, 이직과 확장 타이밍을 실전형 관점으로 정리합니다.",
    heroEmoji: "💼",
    tier: "plus",
    category: "career",
    recommendedModel: "GPT-4O",
    warmth: 52,
    directness: 86,
    jargonDensity: 52,
    easyBias: 46,
    actionBias: 88,
    specialties: ["직업", "성과", "이직", "확장 타이밍"],
    curiosityPrompt: "일에서 어디에 힘을 써야 성과가 나는지 우선순위를 줍니다.",
  },
  {
    id: "timing_signal",
    name: "타이밍 분석가",
    subtitle: "세운·월운·일운의 흐름을 먼저 보는 리더",
    description: "지금 밀어붙일지, 쉬어갈지, 어느 구간에서 기회가 오는지 타이밍 중심으로 읽습니다.",
    heroEmoji: "⏳",
    tier: "pro",
    category: "timing",
    recommendedModel: "GEMINI-1.5",
    warmth: 50,
    directness: 78,
    jargonDensity: 66,
    easyBias: 38,
    actionBias: 90,
    specialties: ["타이밍", "세운", "월운", "실행 시점"],
    curiosityPrompt: "같은 사주라도 지금이 어떤 타이밍인지 먼저 구분합니다.",
  },
  {
    id: "signature_master",
    name: "시그니처 마스터",
    subtitle: "구독 전용 롱폼 해설과 통합 조언에 특화된 리더",
    description: "원국, 대운, 관계, 실행 전략을 하나의 긴 서사로 엮어 더 깊은 리포트를 제공합니다.",
    heroEmoji: "👑",
    tier: "signature",
    category: "general",
    recommendedModel: "GEMINI-1.5",
    warmth: 72,
    directness: 70,
    jargonDensity: 76,
    easyBias: 54,
    actionBias: 82,
    specialties: ["롱폼 서사", "심화 브리핑", "통합 조언", "정기 리포트"],
    curiosityPrompt: "이번 해석 하나가 아니라, 내 흐름 전체를 하나의 리포트처럼 읽어줍니다.",
  },
];

export function getFortuneReaderProfiles(queryType: ReaderQueryType = "result"): FortuneReaderProfile[] {
  if (queryType === "compatibility") {
    return [
      getFortuneReaderById("love_counselor"),
      getFortuneReaderById("easy_translator"),
      getFortuneReaderById("classic_balance"),
      getFortuneReaderById("timing_signal"),
      getFortuneReaderById("signature_master"),
    ];
  }

  if (queryType === "daily") {
    return [
      getFortuneReaderById("timing_signal"),
      getFortuneReaderById("easy_translator"),
      getFortuneReaderById("classic_balance"),
      getFortuneReaderById("career_strategist"),
      getFortuneReaderById("signature_master"),
    ];
  }

  return READER_PROFILES;
}

export function getFortuneReaderById(id?: string): FortuneReaderProfile {
  return READER_PROFILES.find((reader) => reader.id === id) ?? READER_PROFILES[0];
}

export function getReaderUnlockCost(reader: FortuneReaderProfile): number {
  if (reader.tier === "starter") return 0;
  if (reader.tier === "plus") return 1;
  if (reader.tier === "pro") return 2;
  return 3;
}

export function getRecommendedReader(
  queryType: ReaderQueryType,
  categoryFocus?: string,
  tendency?: Tendency,
): FortuneReaderProfile {
  if (queryType === "compatibility" || categoryFocus === "love") {
    return getFortuneReaderById("love_counselor");
  }
  if (queryType === "daily") {
    return getFortuneReaderById("timing_signal");
  }
  if (categoryFocus === "career" || tendency === "Metal") {
    return getFortuneReaderById("career_strategist");
  }
  if (categoryFocus === "money" || categoryFocus === "wealth") {
    return getFortuneReaderById("career_strategist");
  }
  return getFortuneReaderById("classic_balance");
}

export function getFavoriteReaderIds(): ReaderId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITE_READERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is ReaderId => typeof id === "string" && READER_PROFILES.some((reader) => reader.id === id))
      : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteReader(id: ReaderId): ReaderId[] {
  if (typeof window === "undefined") return [];
  const current = getFavoriteReaderIds();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current].slice(0, 8);
  localStorage.setItem(FAVORITE_READERS_KEY, JSON.stringify(next));
  return next;
}

export function getLastReaderId(queryType: ReaderQueryType): ReaderId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_READER_BY_QUERY_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const id = parsed?.[queryType];
    return READER_PROFILES.some((reader) => reader.id === id) ? id : null;
  } catch {
    return null;
  }
}

export function saveLastReaderId(queryType: ReaderQueryType, id: ReaderId): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LAST_READER_BY_QUERY_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[queryType] = id;
    localStorage.setItem(LAST_READER_BY_QUERY_KEY, JSON.stringify(parsed));
  } catch {
    localStorage.setItem(LAST_READER_BY_QUERY_KEY, JSON.stringify({ [queryType]: id }));
  }
}

export function getUnlockedReaderIds(): ReaderId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(UNLOCKED_READERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is ReaderId => typeof id === "string" && READER_PROFILES.some((reader) => reader.id === id))
      : [];
  } catch {
    return [];
  }
}

export function unlockReader(id: ReaderId): ReaderId[] {
  if (typeof window === "undefined") return [];
  const current = getUnlockedReaderIds();
  const next = current.includes(id) ? current : [...current, id];
  localStorage.setItem(UNLOCKED_READERS_KEY, JSON.stringify(next));
  return next;
}

export function isReaderUnlocked(reader: FortuneReaderProfile): boolean {
  if (reader.tier === "starter") return true;
  return getUnlockedReaderIds().includes(reader.id);
}
