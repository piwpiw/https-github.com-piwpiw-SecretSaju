/**
 * 일주(60갑자)별 추천 음식 풀 + 코드별 매핑
 * 사주아이 수준: 모든 코드에 최소 3개 추천 보장
 */

import { PILLAR_CODES } from "@/lib/saju";

export type FoodItem = {
  name: string;
  reason: string;
  emoji: string;
  /** 연령대별 대체 문구 (선택) */
  ageNote?: Record<"10s" | "20s" | "30s", string>;
};

/** 추천 음식 풀 (20종) - 코드별로 3개씩 조합 */
const FOOD_POOL: FoodItem[] = [
  { name: "연어", reason: "스트레스 해소·두뇌 활성화", emoji: "🐟" },
  { name: "다크 초콜릿", reason: "기분 전환·집중력", emoji: "🍫" },
  { name: "바나나", reason: "에너지·신경 안정", emoji: "🍌" },
  { name: "아보카도", reason: "포만감·건강한 지방", emoji: "🥑" },
  { name: "그릭 요거트", reason: "장 건강·프로바이오틱스", emoji: "🥛" },
  { name: "견과류", reason: "오메가3·집중력", emoji: "🥜" },
  { name: "귀리", reason: "지속 에너지·혈당 안정", emoji: "🌾" },
  { name: "녹차", reason: "카페인·L-테아닌 균형", emoji: "🍵" },
  { name: "달걀", reason: "단백질·비타민D", emoji: "🥚" },
  { name: "고구마", reason: "베타카로틴·포만감", emoji: "🍠" },
  { name: "블루베리", reason: "항산화·기억력", emoji: "🫐" },
  { name: "두부", reason: "식물성 단백질·칼슘", emoji: "🧈" },
  { name: "김치", reason: "발효·면역·장 건강", emoji: "🥬" },
  { name: "미역국", reason: "미네랄·회복", emoji: "🍲" },
  { name: "삼겹살", reason: "비타민B·기력", emoji: "🥓" },
  { name: "콩나물", reason: "비타민C·저칼로리", emoji: "🌱" },
  { name: "호박", reason: "베타카로틴·면역", emoji: "🎃" },
  { name: "브로콜리", reason: "식이섬유·비타민K", emoji: "🥦" },
  { name: "참깨", reason: "칼슘·불포화지방산", emoji: "⚪" },
  { name: "대추", reason: "철분·혈액 순환", emoji: "🍇" },
];

/** 60갑자 인덱스 → 풀에서 가져올 인덱스 3개 (고르게 분산) */
function getFoodIndicesForPillar(pillarIndex: number): [number, number, number] {
  const a = pillarIndex % FOOD_POOL.length;
  const b = (pillarIndex + 7) % FOOD_POOL.length;
  const c = (pillarIndex + 13) % FOOD_POOL.length;
  return [a, b, c];
}

/**
 * 일주 코드에 맞는 추천 음식 3개 반환 (나이대 옵션)
 */
export function getFoodRecommendationsByCode(
  code: string,
  _ageGroup?: "10s" | "20s" | "30s"
): FoodItem[] {
  const index = PILLAR_CODES.indexOf(code);
  const idx = index >= 0 ? index : 0;
  const [i, j, k] = getFoodIndicesForPillar(idx);
  return [FOOD_POOL[i], FOOD_POOL[j], FOOD_POOL[k]].filter(Boolean);
}
