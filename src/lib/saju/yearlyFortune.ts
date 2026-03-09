/**
 * 신년운세: 일주 인덱스 + 연도 → 해당 연도 운세 문구
 * 사주아이 레퍼런스: "2026 신년운세"
 */

import { getPillarNameKo } from "@/lib/saju";

const FORTUNE_TEMPLATES: string[] = [
  "올해는 새로운 시작에 좋은 해예요. 작은 도전이 큰 결실로 이어질 수 있어요.",
  "올해는 인맥과 협력이 빛을 발해요. 혼자보다 함께할 때 운이 열려요.",
  "올해는 재물운이 올라가는 해예요. 꼼꼼히 관리하면 보람이 있어요.",
  "올해는 감정 기복이 있을 수 있어요. 중요한 결정은 여유 있게 하세요.",
  "올해는 인연의 해예요. 오래 끊긴 사람과의 재회가 있을 수 있어요.",
  "올해는 건강 챙기기가 중요해요. 무리하지 말고 휴식을 취하세요.",
  "올해는 학습·성장의 해예요. 한 가지라도 깊이 파보면 좋아요.",
  "올해는 내면을 다스리는 해예요. 고요한 시간이 도움이 돼요.",
  "올해는 말 한마디가 인연을 바꿔요. 부드럽게 소통하세요.",
  "올해는 지출을 줄이면 이득이 있어요. 불필요한 소비를 줄여보세요.",
];

/**
 * 일주 인덱스(0~59) + 연도 → 신년운세 한 줄 요약 + 짧은 상세
 */
export function getYearlyFortune(pillarIndex: number, year: number): {
  summary: string;
  detail: string;
  year: number;
  pillarName: string;
  monthlyTrend: number[];
  scores: {
    total: number;
    love: number;
    money: number;
    work: number;
    health: number;
  };
} {
  const idx = pillarIndex % 60;
  const templateIndex = (idx + (year % 10)) % FORTUNE_TEMPLATES.length;
  const summary = FORTUNE_TEMPLATES[templateIndex] ?? FORTUNE_TEMPLATES[0];
  const detail = `${year}년에는 일주에 따른 흐름이 좋아요. 상반기에는 신중히, 하반기에는 적극적으로 움직이면 좋은 결과가 있을 거예요.`;
  const pillarName = getPillarNameKo(idx);

  // Generate a mock but semi-consistent trend based on pillar index
  const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
    const base = ((idx + i) * 7) % 40 + 50; // 50-90 range
    return base;
  });

  // Generate mock scores
  // deterministically based on year, pillarIndex
  const baseScore = ((idx * 3) + year) % 30 + 60; // 60-90

  const scores = {
    total: baseScore + 5,
    love: (baseScore + idx) % 40 + 50,
    money: (baseScore + idx * 2) % 40 + 50,
    work: (baseScore + idx * 3) % 40 + 50,
    health: (baseScore + idx * 4) % 40 + 50,
  };

  return { summary, detail, year, pillarName, monthlyTrend, scores };
}
