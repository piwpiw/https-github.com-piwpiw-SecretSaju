/**
 * 일주(60갑자)별 추천 제품 풀 + 코드별 매핑
 * 사주아이 수준: 모든 코드에 최소 3개 추천 보장
 */

import { PILLAR_CODES } from "@/lib/saju";

export type ProductItem = {
  name: string;
  category: string;
  reason: string;
  emoji: string;
  /** 추후 연동: 쿠팡/알리 등 링크 */
  link?: string;
};

/** 추천 제품 풀 (20종) */
const PRODUCT_POOL: ProductItem[] = [
  { name: "무선 이어폰", category: "가전", reason: "집중·커뮤니케이션", emoji: "🎧" },
  { name: "스탠딩 데스크", category: "가구", reason: "자세·에너지", emoji: "🪑" },
  { name: "아로마 디퓨저", category: "라이프", reason: "기분 전환·휴식", emoji: "🫙" },
  { name: "블루라이트 차단 안경", category: "액세서리", reason: "눈 피로·수면", emoji: "👓" },
  { name: "다이어리/플래너", category: "문구", reason: "계획·정리", emoji: "📒" },
  { name: "손목 마사지기", category: "헬스", reason: "손목 피로·집중", emoji: "🖐️" },
  { name: "보조배터리", category: "가전", reason: "외출·안심", emoji: "🔋" },
  { name: "텀블러", category: "라이프", reason: "수분·습관", emoji: "🥤" },
  { name: "요가 매트", category: "헬스", reason: "스트레칭·휴식", emoji: "🧘" },
  { name: "독서등", category: "가구", reason: "눈 보호·분위기", emoji: "💡" },
  { name: "필터형 커피", category: "푸드", reason: "카페인·루틴", emoji: "☕" },
  { name: "비타민D", category: "건강", reason: "면역·기분", emoji: "💊" },
  { name: "핫팩", category: "라이프", reason: "순환·편안함", emoji: "🔥" },
  { name: "실리콘 마스크", category: "뷰티", reason: "피부·휴식", emoji: "😷" },
  { name: "목베개", category: "라이프", reason: "수면·자세", emoji: "🛏️" },
  { name: "손소독제", category: "건강", reason: "위생·습관", emoji: "🧴" },
  { name: "스티커 노트", category: "문구", reason: "메모·정리", emoji: "📌" },
  { name: "발마사지기", category: "헬스", reason: "피로 해소·순환", emoji: "🦶" },
  { name: "캔들", category: "라이프", reason: "분위기·이완", emoji: "🕯️" },
  { name: "간편 샐러드", category: "푸드", reason: "영양·편의", emoji: "🥗" },
];

function getProductIndicesForPillar(pillarIndex: number): [number, number, number] {
  const a = pillarIndex % PRODUCT_POOL.length;
  const b = (pillarIndex + 11) % PRODUCT_POOL.length;
  const c = (pillarIndex + 17) % PRODUCT_POOL.length;
  return [a, b, c];
}

/**
 * 일주 코드에 맞는 추천 제품 3개 반환
 */
export function getProductRecommendationsByCode(code: string): ProductItem[] {
  const index = PILLAR_CODES.indexOf(code);
  const idx = index >= 0 ? index : 0;
  const [i, j, k] = getProductIndicesForPillar(idx);
  return [PRODUCT_POOL[i], PRODUCT_POOL[j], PRODUCT_POOL[k]].filter(Boolean);
}
