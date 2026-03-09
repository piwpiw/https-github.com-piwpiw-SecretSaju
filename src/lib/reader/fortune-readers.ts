import type { Tendency } from "@/lib/reader/persona-matrix";

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
    subtitle: "고전의 지혜로 원국의 뼈대를 읽는 마스터",
    description: "수천 년 이어온 정통 자평명리학의 원칙을 고수합니다. 당신의 타고난 원국(Original Chart)의 강약과 격국, 십신의 조화를 현미경처럼 분석하여 가장 객관적인 운명의 설계를 보여줍니다. 화려한 수식보다 본질적인 기운의 균형을 중시하는 정석형 리더입니다.",
    heroEmoji: "🧭",
    tier: "starter",
    category: "general",
    recommendedModel: "GPT-4O",
    warmth: 45,
    directness: 85,
    jargonDensity: 90,
    easyBias: 20,
    actionBias: 55,
    specialties: ["자평명리 원전", "격국론/용신론", "오행의 조후", "원국 정밀 진단"],
    curiosityPrompt: "학문적 근거가 탄탄한 '진짜 사주' 분석이 필요할 때, 고전의 정석대로 읽어드립니다.",
  },
  {
    id: "easy_translator",
    name: "비유의 마법사",
    subtitle: "복잡한 사주 언어를 일상의 언어로 바꾸는 통역사",
    description: "어려운 한자와 전문 용어 뒤에 숨은 운명의 메시지를 현대적인 비유와 쉬운 언어로 번역합니다. '상관(傷官)'을 '천재적인 표현력'으로, '편관(偏官)'을 '강력한 카리스마'로 읽어주며 당신의 삶에 바로 적용 가능한 다정한 가이드를 제공합니다.",
    heroEmoji: "📘",
    tier: "starter",
    category: "general",
    recommendedModel: "CLAUDE-3.5",
    warmth: 92,
    directness: 40,
    jargonDensity: 15,
    easyBias: 95,
    actionBias: 65,
    specialties: ["현대적 키워드", "초보자 맞춤형", "이미지 리딩", "따뜻한 공감"],
    curiosityPrompt: "사주가 너무 어렵게 느껴지나요? 당신의 운명을 한 편의 이야기처럼 쉽게 들려드릴게요.",
  },
  {
    id: "love_counselor",
    name: "관계 리듬 컨설턴트",
    subtitle: "서로 다른 기운의 합(合)과 충(冲)을 읽는 관계 전문가",
    description: "당신과 상대방의 기운이 만났을 때 생기는 화학 반응을 추적합니다. 단순한 '좋다/나쁘다'를 넘어, 왜 특정 패턴에서 갈등이 생기는지, 어떻게 하면 서로의 주파수를 맞출 수 있는지 관계의 알고리즘을 분석합니다. 연애와 대인관계의 결정적 시그널을 찾아냅니다.",
    heroEmoji: "💞",
    tier: "plus",
    category: "love",
    recommendedModel: "CLAUDE-3.5",
    warmth: 85,
    directness: 60,
    jargonDensity: 40,
    easyBias: 75,
    actionBias: 80,
    specialties: ["궁합의 화화반응", "감정 템포 동기화", "인연의 유효기간", "관계 복원 솔루션"],
    curiosityPrompt: "그 사람과의 마음의 거리가 왜 좁혀지지 않는지, 기운의 결합도를 통해 분석해 드립니다.",
  },
  {
    id: "career_strategist",
    name: "프로페셔널 전략가",
    subtitle: "사회적 성공과 성장의 임계점을 짚어주는 비즈니스 코치",
    description: "사주를 '포트폴리오'로 읽습니다. 당신이 가진 재능이라는 자산을 어디에 투자해야 가장 높은 수익(성공)을 낼 수 있는지 실전적인 관점에서 분석합니다. 이직의 적기, 창업의 리스크, 직장에서의 생존 전략 등 커리어의 변곡점에서 가장 날카로운 선택지를 제안합니다.",
    heroEmoji: "💼",
    tier: "plus",
    category: "career",
    recommendedModel: "GPT-4O",
    warmth: 35,
    directness: 95,
    jargonDensity: 60,
    easyBias: 30,
    actionBias: 92,
    specialties: ["직무 적성 최적화", "승진/이직 타이밍", "비즈니스 운로", "권력 구조 분석"],
    curiosityPrompt: "감성적인 위로보다, 지금 당신에게 필요한 것은 확실한 성과를 위한 전략적 로드맵입니다.",
  },
  {
    id: "timing_signal",
    name: "운 흐름의 지휘자",
    subtitle: "거대한 대운과 매일의 일진을 조율하는 타이밍 마스터",
    description: "운이라는 파도를 언제 타고, 언제 기다려야 할지 정확한 좌표를 찍어줍니다. 큰 흐름인 대운(Great Luck)부터 작게는 오늘의 일진까지 분석하여, 지금이 인생의 '풀 액셀'을 밟을 시기인지 '브레이크'를 잡고 내실을 다질 시기인지 데이터 기반으로 판단합니다.",
    heroEmoji: "⏳",
    tier: "pro",
    category: "timing",
    recommendedModel: "GEMINI-1.5",
    warmth: 55,
    directness: 80,
    jargonDensity: 70,
    easyBias: 40,
    actionBias: 95,
    specialties: ["대운의 변곡점", "연운/월운 흐름", "결정적 찬스 포착", "리스크 회피 타이밍"],
    curiosityPrompt: "운은 오는 것이 아니라 잡는 것입니다. 당신의 가장 화려한 전성기가 시작될 완벽한 시점을 알려드릴게요.",
  },
  {
    id: "signature_master",
    name: "운명의 아키텍트",
    subtitle: "삶의 모든 층위를 통합하여 미래를 설계하는 시그니처 리더",
    description: "파편화된 운세 정보들을 하나의 거대한 서사로 통합합니다. 성격, 건강, 사회적 성취, 내면의 욕망을 아우르는 롱폼(Long-form) 리포트를 통해 당신이라는 우주를 총체적으로 조망합니다. 단순한 해석을 넘어, 당신의 삶을 직접 코치하고 설계하는 운명의 동반자 역할을 자처합니다.",
    heroEmoji: "👑",
    tier: "signature",
    category: "general",
    recommendedModel: "GEMINI-1.5",
    warmth: 75,
    directness: 75,
    jargonDensity: 80,
    easyBias: 50,
    actionBias: 85,
    specialties: ["인생 전방위 분석", "심화 서사 브리핑", "잠재력 극대화 설계", "통계적 운명 모델링"],
    curiosityPrompt: "단편적인 답변만으로는 부족한 당신을 위해, 인생 전체를 관통하는 압도적인 리포트를 준비했습니다.",
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
