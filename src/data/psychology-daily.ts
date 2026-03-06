// US-3: Daily Psychology Curation Data
export interface PsychologyItem {
  id: string;
  title: string;
  emoji: string;
  tags: string[];
  availableDates?: string[];
  path: string;
}

export const DAILY_PSYCHOLOGY: PsychologyItem[] = [
  {
    id: "inner-child",
    title: "내면의 상처받은 아이 만나기",
    emoji: "🧸",
    tags: ["#내면", "#치유", "#감정회복"],
    path: "/psychology/module/inner-child",
  },
  {
    id: "defense-mech",
    title: "스트레스 상황 속 방어기제 점검",
    emoji: "🛡️",
    tags: ["#스트레스", "#관계", "#회복"],
    path: "/psychology/module/defense",
  },
  {
    id: "shadow-self",
    title: "그림자 자아: 억눌린 내면의 신호 읽기",
    emoji: "🎭",
    tags: ["#심리", "#그림자", "#자기성찰"],
    path: "/psychology/module/shadow-self",
  },
  {
    id: "money-block",
    title: "돈의 흐름을 막는 무의식적 머니블록",
    emoji: "💸",
    tags: ["#재물", "#심리", "#행동패턴"],
    path: "/psychology/module/money-block",
  },
  {
    id: "gaslighting",
    title: "독성 관계와 가스라이팅 취약도 진단",
    emoji: "🕸️",
    tags: ["#인간관계", "#경계", "#정신건강"],
    path: "/psychology/module/gaslighting",
  },
  {
    id: "burnout-calc",
    title: "번아웃 위험도 측정과 회복 전략",
    emoji: "🌡️",
    tags: ["#에너지", "#번아웃", "#메타인지"],
    path: "/psychology/module/burnout-calc",
  },
  {
    id: "attachment",
    title: "성인 애착 유형: 연애가 꼬이는 이유",
    emoji: "💕",
    tags: ["#연애", "#애착", "#관계"],
    path: "/psychology/module/attachment",
  },
  {
    id: "charm-find",
    title: "페르소나와 매력 지도",
    emoji: "🪞",
    tags: ["#매력", "#페르소나", "#관계지표"],
    path: "/psychology/module/charm-find",
  },
  {
    id: "biz-booster",
    title: "커리어 생존력과 조직 내 적응형 타입",
    emoji: "💼",
    tags: ["#커리어", "#생존", "#조직"],
    path: "/psychology/module/biz-booster",
  },
  {
    id: "aura-today",
    title: "오늘의 감정 파동과 오라 컬러",
    emoji: "✨",
    tags: ["#기분", "#감정", "#에너지"],
    path: "/psychology/module/aura-today",
  },
];

export function getPsychologyForToday() {
  const today = new Date().toISOString().slice(5, 10); // MM-DD
  return DAILY_PSYCHOLOGY.filter(
    (item) => !item.availableDates || item.availableDates.includes(today)
  );
}
