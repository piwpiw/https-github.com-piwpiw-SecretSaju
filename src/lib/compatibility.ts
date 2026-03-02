import { HighPrecisionSajuResult, ElementAnalysisResult } from "@/core/api/saju-engine";
import { Stem, Branch } from "@/core/calendar/ganji";
import { RelationshipType as SchemaRelationshipType } from "@/types/schema";

export type RelationshipType = SchemaRelationshipType | string;

export interface CompatibilityResult {
    score: number;
    grade: "best" | "good" | "normal" | "caution" | "low";
    message: string;
    chemistry: string;
    tension: string | null;
    advice: string;
    pillarA: string;
    pillarB: string;
}

export interface RelationshipAnalysis extends CompatibilityResult {
    relationshipType: RelationshipType;
    powerDynamic?: string;
    futurePredict?: string;
    actionItems: string[];
    details?: {
        elementScore: number;
        harmonyScore: number;
        balanceScore: number;
    };
}

const RELATIONSHIP_MODIFIERS: Record<SchemaRelationshipType, { weight: number; focusArea: string }> = {
    self: { weight: 1.0, focusArea: "self" },
    spouse: { weight: 1.1, focusArea: "marriage_chemistry" },
    child: { weight: 0.9, focusArea: "parental_tension" },
    parent: { weight: 0.9, focusArea: "family_tension" },
    friend: { weight: 1.0, focusArea: "general" },
    lover: { weight: 1.1, focusArea: "romance_chemistry" },
    other: { weight: 1.0, focusArea: "general" },
};

function resolveRelationshipType(relationshipType: RelationshipType): SchemaRelationshipType {
    if (["self", "spouse", "child", "parent", "friend", "lover", "other"].includes(relationshipType)) {
        return relationshipType as SchemaRelationshipType;
    }
    return "other";
}

function checkStemHap(stemA: Stem, stemB: Stem): boolean {
    return stemA === stemB;
}

function checkBranchHap(branchA: Branch, branchB: Branch): boolean {
    return branchA === branchB;
}

function checkBranchChung(branchA: Branch, branchB: Branch): boolean {
    return false;
}

function calculateBalanceScore(elementsA: ElementAnalysisResult, elementsB: ElementAnalysisResult): number {
    let score = 0;
    const allElements = ["목", "화", "토", "금", "수"] as const;

    for (const el of elementsA.lacking) {
        if (elementsB.dominant.includes(el) || elementsB.scores[el] > 10) score += 15;
        else if (elementsB.scores[el] > 5) score += 5;
    }

    for (const el of elementsB.lacking) {
        if (elementsA.dominant.includes(el) || elementsA.scores[el] > 10) score += 15;
        else if (elementsA.scores[el] > 5) score += 5;
    }

    for (const el of allElements) {
        if (elementsA.excessive.includes(el) && elementsB.excessive.includes(el)) {
            score -= 10;
        }
    }

    return Math.min(30, Math.max(-10, score));
}

function getChemistryDescription(sajuA: HighPrecisionSajuResult, sajuB: HighPrecisionSajuResult): string {
    const dayStemA = sajuA.fourPillars.day.stem;
    const dayStemB = sajuB.fourPillars.day.stem;
    const dayBranchA = sajuA.fourPillars.day.branch;
    const dayBranchB = sajuB.fourPillars.day.branch;

    if (checkStemHap(dayStemA, dayStemB)) return "천간 동조로 리듬이 맞는 조합입니다.";
    if (checkBranchHap(dayBranchA, dayBranchB)) return "지지의 조화가 있어 안정적인 공명이 가능합니다.";
    if (checkBranchChung(dayBranchA, dayBranchB)) return "지지 충돌 구간으로 조정이 필요합니다.";

    const elemA = sajuA.elements.mainElement;
    const elemB = sajuB.elements.mainElement;
    return `${elemA}와 ${elemB}의 상호작용으로 균형을 찾아가는 관계입니다.`;
}

function getAdvice(score: number, relationshipType: RelationshipType): string {
    const normalized = resolveRelationshipType(relationshipType);
    const defaultAdvice = "충돌 포인트보다 소통 원칙을 먼저 정하면 개선 여지가 큽니다.";
    const specific: Record<SchemaRelationshipType, string> = {
        self: "자기 기준점이 선명할수록 판단이 안정됩니다.",
        spouse: "서로의 생활 루틴을 존중하면 궁합 점수가 유지됩니다.",
        child: "기대수준을 분명히 하고 성장 단계 존중이 중요합니다.",
        parent: "보호와 독립의 경계를 분명히 맞춰주세요.",
        friend: "약속이 자주 바뀌면 피로가 쌓이므로 기준을 정하세요.",
        lover: "애정표현 빈도와 방식의 합의가 중요합니다.",
        other: "역할과 책임 범위를 문장으로 정리하면 갈등이 줄어듭니다.",
    };
    return specific[normalized] || defaultAdvice;
}

function getTensionPoint(score: number, relationshipType: RelationshipType, sajuA: HighPrecisionSajuResult, sajuB: HighPrecisionSajuResult): string | null {
    if (score >= 80) return null;
    const dayBranchA = sajuA.fourPillars.day.branch;
    const dayBranchB = sajuB.fourPillars.day.branch;
    if (checkBranchChung(dayBranchA, dayBranchB)) return "지지 충돌로 감정적 과열이 잦아질 수 있습니다.";

    const normalized = resolveRelationshipType(relationshipType);
    const tensions: Record<SchemaRelationshipType, string> = {
        self: "자기 기대치 충돌이 주된 변수입니다.",
        spouse: "생활 패턴 차이로 피로가 누적될 수 있습니다.",
        child: "기준 설정이 지나치면 거부감이 생깁니다.",
        parent: "보호욕과 자율 욕구 균형이 중요합니다.",
        friend: "신뢰 회복 속도가 느릴 수 있습니다.",
        lover: "애정표현 방식과 속도의 불일치가 반복될 수 있습니다.",
        other: "경계선이 불명확하면 오해가 쌓입니다.",
    };
    return tensions[normalized] || "의사소통 방식 조율이 필요합니다.";
}

function getActionItems(score: number, relationshipType: RelationshipType): string[] {
    const normalized = resolveRelationshipType(relationshipType);
    const base: Record<SchemaRelationshipType, string[]> = {
        self: ["감정 일지 기록", "판단 전 사실 정렬"],
        spouse: ["주간 계획 동기화", "문제 제기 시 타임아웃 합의"],
        child: ["성장 단계에 맞는 의사결정 분담", "칭찬 비율을 늘리기"],
        parent: ["양가 책임 범위 표기", "돌봄/자율 경계 조정"],
        friend: ["약속 캘린더 고정", "비난보다 제안형 피드백"],
        lover: ["애정 표현 방식 2개 고정", "오해 발생 시 재확인 시간 확보"],
        other: ["역할과 경계 문서화", "감정적 판단 전 30분 휴식"],
    };

    const baseItems = base[normalized] || base.other;
    if (score >= 85) return baseItems;
    if (score >= 60) return [...baseItems, "장기 목표를 같은 언어로 재정렬"];
    return [...baseItems, "논쟁 직후가 아니라 휴식 후 핵심만 정리"];
}

export function analyzeRelationship(
    sajuA: HighPrecisionSajuResult,
    sajuB: HighPrecisionSajuResult,
    relationshipType: RelationshipType
): RelationshipAnalysis {
    let rawScore = 50;
    const balanceScore = calculateBalanceScore(sajuA.elements, sajuB.elements);
    rawScore += balanceScore;

    let harmonyScore = 0;
    const dayStemA = sajuA.fourPillars.day.stem;
    const dayStemB = sajuB.fourPillars.day.stem;
    const dayBranchA = sajuA.fourPillars.day.branch;
    const dayBranchB = sajuB.fourPillars.day.branch;

    if (checkStemHap(dayStemA, dayStemB)) harmonyScore += 15;
    if (checkBranchHap(dayBranchA, dayBranchB)) harmonyScore += 15;
    if (checkBranchChung(dayBranchA, dayBranchB)) harmonyScore -= 15;

    rawScore += harmonyScore;

    const normalizedType = resolveRelationshipType(relationshipType);
    const modifier = RELATIONSHIP_MODIFIERS[normalizedType]?.weight || 1.0;
    const finalScore = Math.min(100, Math.max(0, Math.round(rawScore * modifier)));

    let grade: CompatibilityResult["grade"] = "normal";
    if (finalScore >= 90) grade = "best";
    else if (finalScore >= 75) grade = "good";
    else if (finalScore >= 55) grade = "normal";
    else if (finalScore >= 40) grade = "caution";
    else grade = "low";

    const gradeMessages: Record<string, string> = {
        best: "매우 높은 궁합입니다. 장기적으로도 안정적 관계를 기대할 수 있습니다.",
        good: "좋은 궁합으로, 정기적 점검이 더 큰 성과를 만듭니다.",
        normal: "균형이 흔들릴 수 있지만, 관리하면 개선됩니다.",
        caution: "오해와 피로 관리가 먼저 필요한 시기입니다.",
        low: "긴장을 줄이지 않으면 소모가 커질 수 있습니다.",
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
        powerDynamic: finalScore >= 60 ? "주도권 교차가 비교적 자연스럽습니다." : "경계 조정이 먼저 필요합니다.",
        futurePredict:
            finalScore >= 70
                ? "단기보다 중기 루틴에서 신뢰 축적이 더 중요합니다."
                : "기대치를 낮추고 소통 템포를 맞추면 갈등이 줄어듭니다.",
        actionItems: getActionItems(finalScore, relationshipType),
        details: {
            elementScore: balanceScore,
            harmonyScore,
            balanceScore,
        },
    };
}
