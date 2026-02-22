/**
 * 동물 아키타입 조회: code + ageGroup → 표시용 텍스트
 * data/animals.json (목업) + 60개 기본 동물명 폴백
 */

import animalsData from "@/data/animals.json";
import { PILLAR_CODES } from "./saju";

export type AgeGroup = "10s" | "20s" | "30s";

export type AnimalArchetype = {
  code: string;
  animal_name: string;
  base_traits: { mask: string; hashtags: string[] };
  age_context: Record<
    AgeGroup,
    { hook: string; secret_preview: string }
  >;
};

/** 60갑자별 기본 동물 캐릭터명 (폴백) */
const DEFAULT_ANIMAL_NAMES: readonly string[] = [
  "골든 리트리버", "웰시 코기", "시베리안 허스키", "페르시안", "메인 쿤",
  "비글", "푸들", "치와와", "닥스훈트", "러시안 블루",
  "진돗개", "스피츠", "포메라니안", "샤르페이", "보더 콜리",
  "아메리칸 숏헤어", "스코티시 폴드", "뱅갈", "아비시니안", "먼치킨",
  "코리안 숏헤어", "래브라도", "저먼 셰퍼드", "불독", "시츄",
  "페르시안 롱헤어", "노르웨이 숲", "사모야드", "알래스칸 말라뮤트", "허스키 믹스",
  "차우차우", "아키타", "쉬바", "그레이하운드", "달마시안",
  "스핑크스", "데본렉스", "라가머핀", "버만", "터키시 앙고라",
  "재패니즈 밥테일", "이집션 마우", "오시캣", "토이거", "사바나",
  "브리티시 숏헤어", "맨스", "라펌", "발리니즈", "히말라얀",
  "네벨룽", "버밀라", "통키니즈", "세렌게티", "차우시",
  "파스타 카나리오", "레온베르거", "그레이트 데인", "세인트 버나드",   "티베탄 마스티프", "아프간 하운드", "바센지", "잭 러셀", "요크셔 테리어",
];

const ARCHETYPES = (animalsData as { archetypes: AnimalArchetype[] }).archetypes;
const BY_CODE = new Map<string, AnimalArchetype>(ARCHETYPES.map((a) => [a.code, a]));

function getDefaultArchetype(code: string, index: number): AnimalArchetype {
  const name = DEFAULT_ANIMAL_NAMES[index % DEFAULT_ANIMAL_NAMES.length];
  const fallback = {
    hook: "너 짝사랑 망하는 이유, 딱 300원에 알려줌.",
    secret_preview: "겉으로는 쿨한데 속으로는 불타오름.",
  };
  return {
    code,
    animal_name: name,
    base_traits: { mask: "일잘러 코스프레", hashtags: ["#일잘러_코스프레", "#자본주의_미소"] },
    age_context: { "10s": fallback, "20s": fallback, "30s": fallback },
  };
}

/**
 * 일주 코드와 나이대로 아키타입 반환 (Age-Context 적용)
 */
export function getArchetypeByCode(
  code: string,
  ageGroup: AgeGroup
): AnimalArchetype & { displayHook: string; displaySecretPreview: string } {
  const index = PILLAR_CODES.indexOf(code);
  const archetype = BY_CODE.get(code) ?? getDefaultArchetype(code, index >= 0 ? index : 0);
  const ctx = archetype.age_context[ageGroup];
  return {
    ...archetype,
    displayHook: ctx?.hook ?? "비밀 해금 시 공개됩니다.",
    displaySecretPreview: ctx?.secret_preview ?? "후방주의.",
  };
}
