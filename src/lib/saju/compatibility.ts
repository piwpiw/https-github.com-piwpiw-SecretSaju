import { HighPrecisionSajuResult, ElementAnalysisResult } from "@/core/api/saju-engine";
import { Stem, Branch } from "@/core/calendar/ganji";
import { Element } from "@/core/myeongni/elements";
import { calculateOneSipsong, Sipsong } from "@/core/myeongni/sipsong";
import { RelationshipType as SchemaRelationshipType } from "@/types/schema";
import { connectiveParticle, hasFinalConsonant } from "@/data/tarotDeck";

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

/** 비교에 쓰는 네 기둥 위치 */
export type PillarPosition = "year" | "month" | "day" | "hour";

/** 두 사주 사이에서 검출되는 합·충 관계의 종류 */
export type PillarInteractionKind =
    | "stemHap"        // 천간합 (갑기·을경·병신·정임·무계)
    | "stemChung"      // 천간충 (갑경·을신·병임·정계 — 4충설)
    | "branchYukhap"   // 지지 육합
    | "branchBanhap"   // 지지 삼합 반합 (왕지 포함 두 글자)
    | "branchChung"    // 지지 충
    | "branchHyeong"   // 지지 형 (삼형·자묘형·자형)
    | "branchHae"      // 지지 해
    | "branchPa";      // 지지 파

export interface PillarInteraction {
    /** 어느 기둥끼리의 관계인지 (같은 위치 기둥끼리 비교) */
    position: PillarPosition;
    kind: PillarInteractionKind;
    /** 예: "갑기합", "자오충", "자진 반합(수국)" */
    label: string;
    /** 한국어 설명 문구 */
    description: string;
    /** 최종 점수에 실제 기여한 가중 점수 (소수 1자리) */
    delta: number;
}

export interface SipsongRelationInfo {
    /** 상대 일간이 내 일간 기준 어떤 십성인지 */
    sipsong: Sipsong;
    headline: string;
    description: string;
}

export interface ElementComplementInfo {
    /** 서로의 부족 오행을 상대가 채워주는 비율 (0~100) */
    percent: number;
    /** A가 B로부터 받는(보완되는) 오행 */
    aReceives: Element[];
    /** B가 A로부터 받는(보완되는) 오행 */
    bReceives: Element[];
    summary: string;
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
        /** 일주 외 기둥 + 확장 관계(형·해·파·반합·천간충)의 가중 합산 점수 */
        pillarScore?: number;
        /** 양방향 십성 상호관계 점수 */
        sipsongScore?: number;
        /** 시주가 계산에 포함되었는지 (시간 미상이면 false) */
        hourPillarIncluded?: boolean;
        /** 기둥별 합·충 검출 목록 */
        pillarInteractions?: PillarInteraction[];
        /** 십성 상호관계 (A 기준 상대 / B 기준 상대) */
        sipsongRelation?: { aToB: SipsongRelationInfo; bToA: SipsongRelationInfo };
        /** 오행 상호 보완 정보 */
        complement?: ElementComplementInfo;
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

/**
 * 합·충·형·해·파 판정 표.
 *
 * 채택 유파:
 * - 천간합 5합, 지지 육합·충·형·해·파는 자평명리 표준 표를 따르며,
 *   `src/core/myeongni/interactions.ts` 의 검증된 인덱스 표(0=자 … 11=해)와
 *   동일한 내용이다. (그쪽은 export 되지 않아 한글 글자 기반으로 재기술)
 * - 천간충은 갑경·을신·병임·정계 4충설을 채택한다 (무·기 토는 충 없음).
 * - 형은 삼형(인사신·축술미)의 두 글자 조합 + 자묘형 + 자형(진진·오오·유유·해해)을
 *   포함한다.
 * - 삼합은 두 사람 비교 특성상 세 글자가 한 기둥 쌍에 모일 수 없으므로,
 *   왕지(자·오·묘·유)를 포함한 두 글자 **반합**만 인정한다 (생지반합·묘지반합).
 *   왕지가 없는 조합(예: 신-진)은 세지 않는다.
 */

/** 천간합 — 갑기·을경·병신·정임·무계 */
const STEM_HAP_PAIRS: ReadonlyArray<readonly [Stem, Stem]> = [
    ['갑', '기'], ['을', '경'], ['병', '신'], ['정', '임'], ['무', '계'],
];

/** 천간충 — 갑경·을신·병임·정계 (4충설) */
const STEM_CHUNG_PAIRS: ReadonlyArray<readonly [Stem, Stem]> = [
    ['갑', '경'], ['을', '신'], ['병', '임'], ['정', '계'],
];

/** 지지 육합 — 자축·인해·묘술·진유·사신·오미 */
const BRANCH_HAP_PAIRS: ReadonlyArray<readonly [Branch, Branch]> = [
    ['자', '축'], ['인', '해'], ['묘', '술'], ['진', '유'], ['사', '신'], ['오', '미'],
];

/** 지지 충 — 마주 보는 여섯 쌍 */
const BRANCH_CHUNG_PAIRS: ReadonlyArray<readonly [Branch, Branch]> = [
    ['자', '오'], ['축', '미'], ['인', '신'], ['묘', '유'], ['진', '술'], ['사', '해'],
];

/** 지지 형 — 삼형 두 글자 조합 + 자묘형 (자형은 별도) */
const BRANCH_HYEONG_PAIRS: ReadonlyArray<readonly [Branch, Branch]> = [
    ['자', '묘'],
    ['인', '사'], ['사', '신'], ['인', '신'],
    ['축', '미'], ['미', '술'], ['축', '술'],
];

/** 자형 — 같은 글자가 겹칠 때 (진·오·유·해) */
const BRANCH_SELF_HYEONG: ReadonlySet<Branch> = new Set<Branch>(['진', '오', '유', '해']);

/** 지지 해 — 자미·축오·인사·묘진·신해·유술 */
const BRANCH_HAE_PAIRS: ReadonlyArray<readonly [Branch, Branch]> = [
    ['자', '미'], ['축', '오'], ['인', '사'], ['묘', '진'], ['신', '해'], ['유', '술'],
];

/** 지지 파 — 자유·축진·인해·묘오·사신·미술 */
const BRANCH_PA_PAIRS: ReadonlyArray<readonly [Branch, Branch]> = [
    ['자', '유'], ['축', '진'], ['인', '해'], ['묘', '오'], ['사', '신'], ['미', '술'],
];

/** 삼합 반합 — 왕지(자·오·묘·유)를 포함한 두 글자만 인정 */
const BRANCH_BANHAP_PAIRS: ReadonlyArray<readonly [Branch, Branch, Element]> = [
    ['신', '자', '수'], ['자', '진', '수'],   // 신자진 수국
    ['해', '묘', '목'], ['묘', '미', '목'],   // 해묘미 목국
    ['인', '오', '화'], ['오', '술', '화'],   // 인오술 화국
    ['사', '유', '금'], ['유', '축', '금'],   // 사유축 금국
];

function matchesPair<T extends string>(
    pairs: ReadonlyArray<readonly [T, T]>,
    a: T,
    b: T,
): boolean {
    return pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

function checkStemHap(stemA: Stem, stemB: Stem): boolean {
    return matchesPair(STEM_HAP_PAIRS, stemA, stemB);
}

function checkStemChung(stemA: Stem, stemB: Stem): boolean {
    return matchesPair(STEM_CHUNG_PAIRS, stemA, stemB);
}

function checkBranchHap(branchA: Branch, branchB: Branch): boolean {
    return matchesPair(BRANCH_HAP_PAIRS, branchA, branchB);
}

function checkBranchChung(branchA: Branch, branchB: Branch): boolean {
    return matchesPair(BRANCH_CHUNG_PAIRS, branchA, branchB);
}

function checkBranchHyeong(branchA: Branch, branchB: Branch): boolean {
    if (branchA === branchB) return BRANCH_SELF_HYEONG.has(branchA);
    return matchesPair(BRANCH_HYEONG_PAIRS, branchA, branchB);
}

function checkBranchHae(branchA: Branch, branchB: Branch): boolean {
    return matchesPair(BRANCH_HAE_PAIRS, branchA, branchB);
}

function checkBranchPa(branchA: Branch, branchB: Branch): boolean {
    return matchesPair(BRANCH_PA_PAIRS, branchA, branchB);
}

function findBanhap(branchA: Branch, branchB: Branch): Element | null {
    for (const [x, y, el] of BRANCH_BANHAP_PAIRS) {
        if ((x === branchA && y === branchB) || (x === branchB && y === branchA)) return el;
    }
    return null;
}

/* ------------------------------------------------------------------ */
/* 기둥별 합충 수집                                                     */
/* ------------------------------------------------------------------ */

const STEM_HANJA: Record<Stem, string> = {
    갑: '甲', 을: '乙', 병: '丙', 정: '丁', 무: '戊',
    기: '己', 경: '庚', 신: '辛', 임: '壬', 계: '癸',
};

const BRANCH_HANJA: Record<Branch, string> = {
    자: '子', 축: '丑', 인: '寅', 묘: '卯', 진: '辰', 사: '巳',
    오: '午', 미: '未', 신: '申', 유: '酉', 술: '戌', 해: '亥',
};

/**
 * 기둥 가중치 — 일주(배우자궁·자기 자신)가 가장 크고 월주(사회성) > 연주(뿌리) >
 * 시주(말년·자녀궁) 순. 시주가 미상이면 제외하고 남은 가중치 합으로 정규화한다.
 */
const PILLAR_WEIGHTS: Record<PillarPosition, number> = {
    day: 1.0,
    month: 0.7,
    year: 0.5,
    hour: 0.4,
};

const FULL_WEIGHT_SUM = PILLAR_WEIGHTS.day + PILLAR_WEIGHTS.month + PILLAR_WEIGHTS.year + PILLAR_WEIGHTS.hour;

/** 관계 종류별 기본 가/감점 (기둥 가중치 곱하기 전) */
const PAIR_BASE_SCORES: Record<PillarInteractionKind, number> = {
    stemHap: 12,
    stemChung: -8,
    branchYukhap: 12,
    branchBanhap: 8,
    branchChung: -12,
    branchHyeong: -8,
    branchHae: -6,
    branchPa: -5,
};

/** 자형은 일반 형보다 완만하게 감점 */
const SELF_HYEONG_BASE = -5;

type PillarLite = { stem: Stem; branch: Branch };

function getPillarLite(saju: HighPrecisionSajuResult, position: PillarPosition): PillarLite | null {
    const pillars = saju.fourPillars as unknown as Partial<Record<PillarPosition, { stem?: Stem; branch?: Branch }>> | undefined;
    const pillar = pillars?.[position];
    if (!pillar || !pillar.stem || !pillar.branch) return null;
    return { stem: pillar.stem, branch: pillar.branch };
}

function isTimeUnknown(saju: HighPrecisionSajuResult): boolean {
    return !!saju.meta?.inputs?.timeUnknownFallbackUsed;
}

/** 받침 유무에 따라 이/가 를 고른다 — "축가" 같은 조사 오류 방지 */
function subjectParticle(word: string): string {
    return hasFinalConsonant(word) === true ? "이" : "가";
}

function stemPairLabel(a: Stem, b: Stem, suffix: string): string {
    return `${a}${b}${suffix}`;
}

function describeStemHap(a: Stem, b: Stem): string {
    return `천간 ${a}(${STEM_HANJA[a]})·${b}(${STEM_HANJA[b]})${subjectParticle(b)} 서로 끌어당기는 ${a}${b}합(合)입니다. 생각의 결이 맞아 자연스러운 협력이 이뤄집니다.`;
}

function describeStemChung(a: Stem, b: Stem): string {
    return `천간 ${a}(${STEM_HANJA[a]})·${b}(${STEM_HANJA[b]})${subjectParticle(b)} 정면으로 부딪치는 ${a}${b}충(沖)입니다. 가치관과 표현 방식의 차이로 의견 충돌이 생기기 쉽습니다.`;
}

function describeYukhap(a: Branch, b: Branch): string {
    return `지지 ${a}(${BRANCH_HANJA[a]})·${b}(${BRANCH_HANJA[b]})${subjectParticle(b)} 짝을 이루는 ${a}${b}육합(六合)입니다. 함께 있을 때 안정감과 친밀감이 커집니다.`;
}

function describeBanhap(a: Branch, b: Branch, el: Element): string {
    return `지지 ${a}(${BRANCH_HANJA[a]})·${b}(${BRANCH_HANJA[b]})${subjectParticle(b)} ${el} 기운으로 뭉치는 삼합 반합(半合)입니다. 같은 목표를 향해 자연스럽게 힘을 모읍니다.`;
}

function describeBranchChung(a: Branch, b: Branch): string {
    return `지지 ${a}(${BRANCH_HANJA[a]})·${b}(${BRANCH_HANJA[b]})${subjectParticle(b)} 정면으로 부딪치는 ${a}${b}충(沖)입니다. 생활 패턴 충돌과 감정 기복에 유의해야 합니다.`;
}

function describeHyeong(a: Branch, b: Branch): string {
    if (a === b) {
        return `같은 ${a}(${BRANCH_HANJA[a]})${subjectParticle(a)} 겹치는 자형(自刑)입니다. 함께 있을 때 스스로를 소모하지 않도록 완급 조절이 필요합니다.`;
    }
    return `지지 ${a}(${BRANCH_HANJA[a]})·${b}(${BRANCH_HANJA[b]})${subjectParticle(b)} 마찰을 일으키는 ${a}${b}형(刑)입니다. 서로를 길들이려 하면 긴장이 쌓이니 규칙보다 존중이 먼저입니다.`;
}

function describeHae(a: Branch, b: Branch): string {
    return `지지 ${a}(${BRANCH_HANJA[a]})·${b}(${BRANCH_HANJA[b]})${subjectParticle(b)} 은근히 어긋나는 ${a}${b}해(害)입니다. 사소한 서운함이 쌓이지 않게 마음을 자주 표현해 주세요.`;
}

function describePa(a: Branch, b: Branch): string {
    return `지지 ${a}(${BRANCH_HANJA[a]})·${b}(${BRANCH_HANJA[b]})${subjectParticle(b)} 흐름을 깨뜨리는 ${a}${b}파(破)입니다. 약속과 계획이 흔들리지 않게 재확인 습관이 도움이 됩니다.`;
}

interface CollectedInteractions {
    interactions: PillarInteraction[];
    /** 일주 천간합·육합·충(레거시 harmonyScore) 외 확장 관계의 가중·정규화 합산 */
    pillarScore: number;
    hourIncluded: boolean;
}

/**
 * 두 사주를 같은 위치 기둥끼리(연↔연, 월↔월, 일↔일, 시↔시) 비교한다.
 *
 * 하위 호환: 일주의 천간합·육합·충은 기존 harmonyScore(+15/+15/-15) 의미를
 * 보존하기 위해 pillarScore 에는 넣지 않고 목록(delta=±15)에만 표시한다.
 */
function collectPillarInteractions(
    sajuA: HighPrecisionSajuResult,
    sajuB: HighPrecisionSajuResult,
): CollectedInteractions {
    const positions: PillarPosition[] = ['day', 'month', 'year', 'hour'];
    const hourUnknown = isTimeUnknown(sajuA) || isTimeUnknown(sajuB);

    const availablePairs: Array<{ position: PillarPosition; a: PillarLite; b: PillarLite }> = [];
    for (const position of positions) {
        if (position === 'hour' && hourUnknown) continue;
        const a = getPillarLite(sajuA, position);
        const b = getPillarLite(sajuB, position);
        if (a && b) availablePairs.push({ position, a, b });
    }

    const availableWeight = availablePairs.reduce((sum, pair) => sum + PILLAR_WEIGHTS[pair.position], 0);
    // 시주 미상 등으로 빠진 기둥이 있으면 남은 가중치 합으로 정규화한다.
    const normalizeFactor = availableWeight > 0 ? FULL_WEIGHT_SUM / availableWeight : 0;

    const interactions: PillarInteraction[] = [];
    let extendedScore = 0;

    const pushExtended = (
        position: PillarPosition,
        kind: PillarInteractionKind,
        label: string,
        description: string,
        base: number,
    ) => {
        const delta = base * PILLAR_WEIGHTS[position] * normalizeFactor;
        extendedScore += delta;
        interactions.push({ position, kind, label, description, delta: Math.round(delta * 10) / 10 });
    };

    for (const { position, a, b } of availablePairs) {
        const isDay = position === 'day';

        // --- 천간 관계 ---
        if (checkStemHap(a.stem, b.stem)) {
            if (isDay) {
                // 레거시 harmonyScore(+15)에 이미 반영되므로 목록에만 표시
                interactions.push({
                    position, kind: 'stemHap',
                    label: stemPairLabel(a.stem, b.stem, '합'),
                    description: describeStemHap(a.stem, b.stem),
                    delta: 15,
                });
            } else {
                pushExtended(position, 'stemHap', stemPairLabel(a.stem, b.stem, '합'), describeStemHap(a.stem, b.stem), PAIR_BASE_SCORES.stemHap);
            }
        }
        if (checkStemChung(a.stem, b.stem)) {
            pushExtended(position, 'stemChung', stemPairLabel(a.stem, b.stem, '충'), describeStemChung(a.stem, b.stem), PAIR_BASE_SCORES.stemChung);
        }

        // --- 지지 관계 ---
        if (checkBranchHap(a.branch, b.branch)) {
            if (isDay) {
                interactions.push({
                    position, kind: 'branchYukhap',
                    label: `${a.branch}${b.branch}육합`,
                    description: describeYukhap(a.branch, b.branch),
                    delta: 15,
                });
            } else {
                pushExtended(position, 'branchYukhap', `${a.branch}${b.branch}육합`, describeYukhap(a.branch, b.branch), PAIR_BASE_SCORES.branchYukhap);
            }
        }

        const banhapElement = findBanhap(a.branch, b.branch);
        if (banhapElement) {
            pushExtended(
                position, 'branchBanhap',
                `${a.branch}${b.branch} 반합(${banhapElement}국)`,
                describeBanhap(a.branch, b.branch, banhapElement),
                PAIR_BASE_SCORES.branchBanhap,
            );
        }

        if (checkBranchChung(a.branch, b.branch)) {
            if (isDay) {
                interactions.push({
                    position, kind: 'branchChung',
                    label: `${a.branch}${b.branch}충`,
                    description: describeBranchChung(a.branch, b.branch),
                    delta: -15,
                });
            } else {
                pushExtended(position, 'branchChung', `${a.branch}${b.branch}충`, describeBranchChung(a.branch, b.branch), PAIR_BASE_SCORES.branchChung);
            }
        }

        if (checkBranchHyeong(a.branch, b.branch)) {
            const selfHyeong = a.branch === b.branch;
            pushExtended(
                position, 'branchHyeong',
                selfHyeong ? `${a.branch}${b.branch} 자형` : `${a.branch}${b.branch}형`,
                describeHyeong(a.branch, b.branch),
                selfHyeong ? SELF_HYEONG_BASE : PAIR_BASE_SCORES.branchHyeong,
            );
        }

        if (checkBranchHae(a.branch, b.branch)) {
            pushExtended(position, 'branchHae', `${a.branch}${b.branch}해`, describeHae(a.branch, b.branch), PAIR_BASE_SCORES.branchHae);
        }

        if (checkBranchPa(a.branch, b.branch)) {
            pushExtended(position, 'branchPa', `${a.branch}${b.branch}파`, describePa(a.branch, b.branch), PAIR_BASE_SCORES.branchPa);
        }
    }

    return {
        interactions,
        pillarScore: Math.min(30, Math.max(-30, extendedScore)),
        hourIncluded: availablePairs.some((pair) => pair.position === 'hour'),
    };
}

/* ------------------------------------------------------------------ */
/* 십성 상호관계                                                        */
/* ------------------------------------------------------------------ */

/**
 * "상대가 나의 X" 일 때의 관계 역학 서술과 친화 점수.
 * 점수는 정통 궁합에서 길하게 보는 정관·정재·정인·식신을 높게,
 * 상관·겁재를 낮게 두는 보편적 해석을 따른다.
 */
const SIPSONG_RELATION_TABLE: Record<Sipsong, { headline: string; description: string; affinity: number }> = {
    비견: {
        headline: "대등한 동료",
        description: "서로를 거울처럼 이해하는 대등한 관계입니다. 편안하지만 주도권 경쟁이 생기지 않게 역할을 나누면 좋습니다.",
        affinity: 2,
    },
    겁재: {
        headline: "승부욕 자극",
        description: "활력을 주고받지만 경쟁심과 소유 문제로 마찰이 생기기 쉬운 관계입니다. 돈과 자원 문제는 미리 선을 정해 두세요.",
        affinity: -2,
    },
    식신: {
        headline: "편안한 돌봄",
        description: "함께 있으면 여유와 즐거움이 늘어나는 관계입니다. 상대를 자연스럽게 돌보고 표현하게 됩니다.",
        affinity: 4,
    },
    상관: {
        headline: "재기발랄한 자극",
        description: "신선한 자극과 아이디어를 주는 관계지만, 말로 상처를 주고받지 않는 절제가 필요합니다.",
        affinity: 0,
    },
    편재: {
        headline: "활력과 소유욕",
        description: "함께 움직이며 즐기는 에너지가 큰 관계입니다. 다만 소비와 즐거움이 과열되지 않게 페이스 조절이 필요합니다.",
        affinity: 3,
    },
    정재: {
        headline: "안정적 실리",
        description: "현실적인 계획을 함께 세우기 좋은 든든한 관계입니다. 성실하게 쌓아가는 신뢰가 강점입니다.",
        affinity: 5,
    },
    편관: {
        headline: "긴장감 있는 카리스마",
        description: "강하게 끌리지만 때로 압박으로 느껴질 수 있는 관계입니다. 지시보다 부탁의 언어가 효과적입니다.",
        affinity: 1,
    },
    정관: {
        headline: "존중과 질서",
        description: "서로 예의를 지키며 신뢰를 쌓는 모범적인 관계입니다. 책임감 있는 태도가 관계를 오래 지켜줍니다.",
        affinity: 5,
    },
    편인: {
        headline: "독특한 통찰 교류",
        description: "정신적 교감이 깊고 독특한 시각을 나누는 관계입니다. 다만 변덕과 거리두기가 반복되지 않게 유의하세요.",
        affinity: 2,
    },
    정인: {
        headline: "아낌없는 지지",
        description: "조건 없이 지지받는 안정적인 관계입니다. 받는 쪽이 당연하게 여기지 않는 감사 표현이 중요합니다.",
        affinity: 4,
    },
};

interface SipsongMutual {
    aToB: SipsongRelationInfo;
    bToA: SipsongRelationInfo;
    score: number;
}

function analyzeSipsongMutual(dayStemA: Stem, dayStemB: Stem): SipsongMutual {
    // 상대 일간이 내 일간 기준 어떤 십성인지 — 양방향 (kind='stem')
    const aToBSipsong = calculateOneSipsong(dayStemA, dayStemB, 'stem');
    const bToASipsong = calculateOneSipsong(dayStemB, dayStemA, 'stem');
    const aEntry = SIPSONG_RELATION_TABLE[aToBSipsong];
    const bEntry = SIPSONG_RELATION_TABLE[bToASipsong];

    return {
        aToB: { sipsong: aToBSipsong, headline: aEntry.headline, description: aEntry.description },
        bToA: { sipsong: bToASipsong, headline: bEntry.headline, description: bEntry.description },
        score: Math.min(10, Math.max(-6, aEntry.affinity + bEntry.affinity)),
    };
}

/* ------------------------------------------------------------------ */
/* 오행 보완                                                            */
/* ------------------------------------------------------------------ */

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

/**
 * 두 사주의 오행 분포 상호 보완을 백분율로 설명한다.
 * 부족 오행 하나당 상대 점수가 10 이상(또는 상대의 왕성 오행)이면 온전히,
 * 5 초과면 절반만 채워진 것으로 본다.
 */
function analyzeElementComplement(elementsA: ElementAnalysisResult, elementsB: ElementAnalysisResult): ElementComplementInfo {
    const coverage = (lacking: Element[], partner: ElementAnalysisResult) => {
        let covered = 0;
        const received: Element[] = [];
        for (const el of lacking) {
            if (partner.dominant.includes(el) || partner.scores[el] >= 10) {
                covered += 1;
                received.push(el);
            } else if (partner.scores[el] > 5) {
                covered += 0.5;
                received.push(el);
            }
        }
        return { covered, received };
    };

    const aSide = coverage(elementsA.lacking ?? [], elementsB);
    const bSide = coverage(elementsB.lacking ?? [], elementsA);
    const totalLacking = (elementsA.lacking?.length ?? 0) + (elementsB.lacking?.length ?? 0);

    if (totalLacking === 0) {
        return {
            percent: 100,
            aReceives: [],
            bReceives: [],
            summary: "두 사람 모두 오행이 고르게 갖춰져 있어 서로의 기운을 빼앗지 않는 편안한 조합입니다.",
        };
    }

    const percent = Math.round(((aSide.covered + bSide.covered) / totalLacking) * 100);
    const parts: string[] = [];
    if (aSide.received.length > 0) parts.push(`상대가 나의 부족한 ${aSide.received.join("·")} 기운을 채워주고`);
    if (bSide.received.length > 0) parts.push(`내가 상대의 부족한 ${bSide.received.join("·")} 기운을 채워줍니다`);
    const summary = parts.length > 0
        ? `서로의 부족한 오행 중 약 ${percent}%가 상대에게서 보완됩니다. ${parts.join(", ")}.`
        : `서로의 부족한 오행(${percent}% 보완)이 상대에게서도 채워지지 않아, 함께 보완 오행을 생활에서 채우는 노력이 필요합니다.`;

    return { percent, aReceives: aSide.received, bReceives: bSide.received, summary };
}

/* ------------------------------------------------------------------ */
/* 서술 텍스트                                                          */
/* ------------------------------------------------------------------ */

function getChemistryDescription(
    sajuA: HighPrecisionSajuResult,
    sajuB: HighPrecisionSajuResult,
    interactions: PillarInteraction[],
): string {
    // 가장 강한 긍정 관계(일주 우선)를 대표 문장으로 사용
    const positives = interactions
        .filter((it) => it.delta > 0)
        .sort((x, y) => (y.delta - x.delta) || (PILLAR_WEIGHTS[y.position] - PILLAR_WEIGHTS[x.position]));
    if (positives.length > 0) return positives[0].description;

    const elemA = sajuA.elements.mainElement;
    const elemB = sajuB.elements.mainElement;
    // 받침 유무에 따라 와/과 선택 — "목와" 같은 조사 오류 방지
    return `${elemA}${connectiveParticle(elemA)} ${elemB}의 상호작용으로 균형을 찾아가는 관계입니다.`;
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

function getTensionPoint(
    score: number,
    relationshipType: RelationshipType,
    interactions: PillarInteraction[],
): string | null {
    if (score >= 80) return null;

    // 가장 강한 부정 관계를 긴장 포인트로 사용
    const negatives = interactions
        .filter((it) => it.delta < 0)
        .sort((x, y) => (x.delta - y.delta) || (PILLAR_WEIGHTS[y.position] - PILLAR_WEIGHTS[x.position]));
    if (negatives.length > 0) return negatives[0].description;

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

/* ------------------------------------------------------------------ */
/* 메인 분석                                                            */
/* ------------------------------------------------------------------ */

/**
 * 두 사주의 관계 궁합 분석.
 *
 * 점수 구성 (raw = 50 + 각 항목, 최종 = raw × 관계 가중치, 0~100 클램프):
 * - balanceScore  (-10 ~ +30): 오행 보완 — 상대가 내 부족 오행을 채우는가
 * - harmonyScore  (-15 ~ +30): 일주 천간합(+15)·지지육합(+15)·지지충(-15) — 기존 의미 보존
 * - pillarScore   (-30 ~ +30): 연·월·시주 전체 합충 + 일주의 형·해·파·반합·천간충.
 *                              가중치 일 1.0 > 월 0.7 > 연 0.5 > 시 0.4,
 *                              시주 미상이면 제외 후 나머지 가중치로 정규화
 * - sipsongScore  ( -6 ~ +10): 양방향 십성 상호관계 친화도
 *
 * 결정적(deterministic): 같은 입력이면 항상 같은 출력. Math.random 없음.
 */
export function analyzeRelationship(
    sajuA: HighPrecisionSajuResult,
    sajuB: HighPrecisionSajuResult,
    relationshipType: RelationshipType
): RelationshipAnalysis {
    let rawScore = 50;
    const balanceScore = calculateBalanceScore(sajuA.elements, sajuB.elements);
    rawScore += balanceScore;

    // --- 일주 합충 (레거시 harmonyScore — 의미 보존) ---
    let harmonyScore = 0;
    const dayStemA = sajuA.fourPillars.day.stem;
    const dayStemB = sajuB.fourPillars.day.stem;
    const dayBranchA = sajuA.fourPillars.day.branch;
    const dayBranchB = sajuB.fourPillars.day.branch;

    if (checkStemHap(dayStemA, dayStemB)) harmonyScore += 15;
    if (checkBranchHap(dayBranchA, dayBranchB)) harmonyScore += 15;
    if (checkBranchChung(dayBranchA, dayBranchB)) harmonyScore -= 15;

    rawScore += harmonyScore;

    // --- 사주 전체 기둥별 합충 (확장) ---
    const collected = collectPillarInteractions(sajuA, sajuB);
    rawScore += collected.pillarScore;

    // --- 십성 상호관계 (양방향) ---
    const sipsongMutual = analyzeSipsongMutual(dayStemA, dayStemB);
    rawScore += sipsongMutual.score;

    // --- 오행 상호 보완 (백분율 설명) ---
    const complement = analyzeElementComplement(sajuA.elements, sajuB.elements);

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
        chemistry: getChemistryDescription(sajuA, sajuB, collected.interactions),
        tension: getTensionPoint(finalScore, relationshipType, collected.interactions),
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
            pillarScore: Math.round(collected.pillarScore),
            sipsongScore: sipsongMutual.score,
            hourPillarIncluded: collected.hourIncluded,
            pillarInteractions: collected.interactions,
            sipsongRelation: { aToB: sipsongMutual.aToB, bToA: sipsongMutual.bToA },
            complement,
        },
    };
}
