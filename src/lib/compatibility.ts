import { getPillarNameKo } from "./saju";
import { HighPrecisionSajuResult, ElementAnalysisResult } from "@/core/api/saju-engine";
import { Stem, Branch } from "@/core/calendar/ganji";

export type RelationshipType = '본인' | '엄마' | '아빠' | '배우자' | '연인' | '자녀' | '친구' | '상사' | '전애인' | '기타';

export interface CompatibilityResult {
  score: number;
  grade: 'best' | 'good' | 'normal' | 'caution' | 'low';
  message: string;
  chemistry: string;        // "불-물 궁합" 등
  tension: string | null;   // 갈등 포인트
  advice: string;           // 관계 개선 조언
  pillarA: string;
  pillarB: string;
}

export interface RelationshipAnalysis extends CompatibilityResult {
  relationshipType: RelationshipType;
  powerDynamic?: string;    // "상생", "상극", "합(조화)", "충(충돌)"
  futurePredict?: string;   // "3년 후 전망"
  actionItems: string[];    // 구체적 행동 지침
  details?: {
    elementScore: number;
    harmonyScore: number; // 합/충 점수
    balanceScore: number; // 오행 보완 점수
  };
}

// --- CONSTANTS ---

/** 천간합 (Heavenly Stem Combinations) - Harmony */
const STEM_HAP: Record<string, string> = {
  '갑-기': '토', '기-갑': '토',
  '을-경': '금', '경-을': '금',
  '병-신': '수', '신-병': '수',
  '정-임': '목', '임-정': '목',
  '무-계': '화', '계-무': '화'
};

/** 지지육합 (Earthly Branch Six Harmonies) - Stability */
const BRANCH_HAP: Record<string, string> = {
  '자-축': '토', '축-자': '토',
  '인-해': '목', '해-인': '목',
  '묘-술': '화', '술-묘': '화',
  '진-유': '금', '유-진': '금',
  '사-신': '수', '신-사': '수',
  '오-미': '화', '미-오': '화'
};

/** 지지충 (Earthly Branch Clashes) - Conflict/Change */
const BRANCH_CHUNG: Record<string, boolean> = {
  '자-오': true, '오-자': true,
  '축-미': true, '미-축': true,
  '인-신': true, '신-인': true,
  '묘-유': true, '유-묘': true,
  '진-술': true, '술-진': true,
  '사-해': true, '해-사': true
};

/**
 * 관계 타입별 scoring modifiers (Same as before)
 */
const RELATIONSHIP_MODIFIERS: Record<RelationshipType, { weight: number; focusArea: string }> = {
  '본인': { weight: 1.0, focusArea: 'self' },
  '엄마': { weight: 0.9, focusArea: 'family_tension' },
  '아빠': { weight: 0.9, focusArea: 'family_tension' },
  '배우자': { weight: 1.1, focusArea: 'marriage_chemistry' },
  '연인': { weight: 1.1, focusArea: 'romance_chemistry' },
  '자녀': { weight: 0.95, focusArea: 'parentalLove' },
  '친구': { weight: 1.0, focusArea: 'pure_compatibility' },
  '상사': { weight: 0.85, focusArea: 'power_dynamic' },
  '전애인': { weight: 1.05, focusArea: 'past_relationship' },
  '기타': { weight: 1.0, focusArea: 'general' },
};

// --- HELPER FUNCTIONS ---

function checkStemHap(stemA: Stem, stemB: Stem): boolean {
  return !!STEM_HAP[`${stemA}-${stemB}`];
}

function checkBranchHap(branchA: Branch, branchB: Branch): boolean {
  return !!BRANCH_HAP[`${branchA}-${branchB}`];
}

function checkBranchChung(branchA: Branch, branchB: Branch): boolean {
  return !!BRANCH_CHUNG[`${branchA}-${branchB}`];
}

/**
 * Analyze Element Balance Complementarity
 * If User A lacks an element that User B has in excess (or dominant), it's a + score.
 */
function calculateBalanceScore(elementsA: ElementAnalysisResult, elementsB: ElementAnalysisResult): number {
  let score = 0;
  const allElements = ['목', '화', '토', '금', '수'] as const;

  // Check lacking vs dominant
  for (const el of elementsA.lacking) {
    if (elementsB.dominant.includes(el) || elementsB.scores[el] > 10) score += 15; // Huge plus
    else if (elementsB.scores[el] > 5) score += 5; // Moderate plus
  }

  for (const el of elementsB.lacking) {
    if (elementsA.dominant.includes(el) || elementsA.scores[el] > 10) score += 15;
    else if (elementsA.scores[el] > 5) score += 5;
  }

  // Check distinct excessive clash (Too much of same element can be competitive)
  // Simple logic: Too much competition
  for (const el of allElements) {
    if (elementsA.excessive.includes(el) && elementsB.excessive.includes(el)) {
      score -= 10; // Rivalry
    }
  }

  return Math.min(30, Math.max(-10, score)); // Cap between -10 and 30
}

function getChemistryDescription(sajuA: HighPrecisionSajuResult, sajuB: HighPrecisionSajuResult): string {
  const dayStemA = sajuA.fourPillars.day.stem;
  const dayStemB = sajuB.fourPillars.day.stem;
  const dayBranchA = sajuA.fourPillars.day.branch;
  const dayBranchB = sajuB.fourPillars.day.branch;

  if (checkStemHap(dayStemA, dayStemB)) return '천생연분 (천간합)';
  if (checkBranchHap(dayBranchA, dayBranchB)) return '찰떡궁합 (지지합)';
  if (checkBranchChung(dayBranchA, dayBranchB)) return '티격태격 (지지충)';

  // Default to main element comparison
  const elemA = sajuA.elements.mainElement;
  const elemB = sajuB.elements.mainElement;
  return `${elemA}와 ${elemB}의 만남`;
}

function getAdvice(score: number, type: RelationshipType): string {
  if (score >= 90) return "서로가 서로에게 귀인이 되는 관계입니다.";
  if (score >= 70) return "서로의 다름을 인정하면 훌륭한 파트너가 됩니다.";
  if (score >= 50) return "작은 오해가 쌓이지 않도록 대화가 필요해요.";
  return "서로의 가치관 차이가 큽니다. 존중이 최우선입니다.";
}

function getTensionPoint(score: number, relationshipType: RelationshipType, sajuA: HighPrecisionSajuResult, sajuB: HighPrecisionSajuResult): string | null {
  if (score >= 80) return null;
  const dayBranchA = sajuA.fourPillars.day.branch;
  const dayBranchB = sajuB.fourPillars.day.branch;

  if (checkBranchChung(dayBranchA, dayBranchB)) return "성격 차이로 인한 잦은 충돌 (지지충)";

  // Check missing elements
  const lackingA = sajuA.elements.lacking.join(', ');
  if (lackingA && score < 50) return `서로에게 필요한 기운(${lackingA}) 부족`;

  // Default tensions by type
  const tensions: Record<RelationshipType, string> = {
    '엄마': '모친의 과도한 간섭과 통제 욕구',
    '아빠': '부성애 표현 방식의 차이',
    '배우자': '생활 패턴과 가치관 충돌',
    '연인': '연애 스타일과 기대치 불일치',
    '자녀': '세대 차이와 양육 관점 차이',
    '친구': '성향 차이로 인한 오해',
    '상사': '권력 관계와 업무 스타일 충돌',
    '전애인': '해결되지 않은 과거 감정',
    '본인': '자기 모순',
    '기타': '성향 차이',
  };

  return tensions[relationshipType] || "가치관 차이";
}

function getActionItems(score: number, type: RelationshipType): string[] {
  if (score >= 85) return ["함께 새로운 취미 시작하기", "서로에게 감사 편지 쓰기"];
  if (score >= 60) return ["일주일에 한 번 깊은 대화하기", "공통된 목표 설정하기"];
  return ["상대방의 입장에서 생각하기", "비난보다는 요청하는 화법 쓰기", "잠시 거리두기도 방법"];
}

// --- MAIN EXPORT ---

export function analyzeRelationship(
  sajuA: HighPrecisionSajuResult,
  sajuB: HighPrecisionSajuResult,
  relationshipType: RelationshipType
): RelationshipAnalysis {
  let rawScore = 50; // Base score

  // 1. Element Balance (Complementarity) - Max 30 pts
  const balanceScore = calculateBalanceScore(sajuA.elements, sajuB.elements);
  rawScore += balanceScore;

  // 2. Day Pillar Harmony (Hap/Chung) - Max +/- 30 pts
  let harmonyScore = 0;
  const dayStemA = sajuA.fourPillars.day.stem;
  const dayStemB = sajuB.fourPillars.day.stem;
  const dayBranchA = sajuA.fourPillars.day.branch;
  const dayBranchB = sajuB.fourPillars.day.branch;

  if (checkStemHap(dayStemA, dayStemB)) harmonyScore += 15;
  if (checkBranchHap(dayBranchA, dayBranchB)) harmonyScore += 15;
  if (checkBranchChung(dayBranchA, dayBranchB)) harmonyScore -= 15;

  rawScore += harmonyScore;

  // 3. Modifier by Relationship Type
  const modifier = RELATIONSHIP_MODIFIERS[relationshipType]?.weight || 1.0;
  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore * modifier)));

  // 4. Determine Grade
  let grade: CompatibilityResult['grade'] = 'normal';
  if (finalScore >= 90) grade = 'best';
  else if (finalScore >= 75) grade = 'good';
  else if (finalScore >= 55) grade = 'normal';
  else if (finalScore >= 40) grade = 'caution';
  else grade = 'low';

  const gradeMessages: Record<string, string> = {
    best: '천생연분! 서로에게 없는 것을 채워주는 최고의 파트너예요.',
    good: '아주 좋은 궁합입니다. 함께하면 시너지가 나요.',
    normal: '무난한 관계예요. 서로 노력하면 좋아집니다.',
    caution: '서로 다른 점이 많아요. 이해와 배려가 필요해요.',
    low: '갈등이 예상됩니다. 신중한 접근이 필요해요.',
  };

  return {
    score: finalScore,
    grade,
    message: gradeMessages[grade],
    chemistry: getChemistryDescription(sajuA, sajuB),
    tension: getTensionPoint(finalScore, relationshipType, sajuA, sajuB),
    advice: getAdvice(finalScore, relationshipType),
    relationshipType,
    pillarA: `${sajuA.fourPillars.day.stem}${sajuA.fourPillars.day.branch}`,
    pillarB: `${sajuB.fourPillars.day.stem}${sajuB.fourPillars.day.branch}`,
    powerDynamic: finalScore >= 60 ? '상생' : '노력 필요',
    futurePredict: finalScore >= 70 ? '갈수록 깊어지는 관계' : '초반에 조율이 중요한 관계',
    actionItems: getActionItems(finalScore, relationshipType),
    details: {
      elementScore: balanceScore,
      harmonyScore,
      balanceScore
    }
  };
}
