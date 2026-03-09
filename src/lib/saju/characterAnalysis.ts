/**
 * Character Analysis System (Refined)
 * 
 * 게임식 "점수"가 아닌, 사주 명리학의 전통적 분석 방식:
 * - 오행 균형 분석 (과다/부족)
 * - 십성 강약 분석
 * - 인생 영역별 경향성
 */

import { getWuxingFromPillarCode, WUXING_INFO, WuxingElement } from "@/lib/saju/wuxing";
import { calculateSinsal, type Sinsal } from "@/lib/saju/sinsal";
import { PILLAR_CODES } from "@/lib/saju";

export type StrengthLevel = "매우 약함" | "약함" | "보통" | "강함" | "매우 강함";

export interface LifeAspect {
    name: string;
    strength: StrengthLevel;
    strengthValue: number; // 0-100, for visualization only
    description: string;
    keywords: string[];
}

export interface WuxingBalance {
    element: WuxingElement;
    presence: "없음" | "약함" | "보통" | "강함";
    presenceValue: number; // 0-100
    description: string;
}

export interface CharacterAnalysis {
    code: string;
    pillar: {
        cheongan: string;
        jiji: string;
    };

    // 오행 균형도
    wuxing_balance: {
        elements: WuxingBalance[];
        dominant: WuxingElement;
        lacking: WuxingElement | null;
        overall_balance: "불균형" | "약간 불균형" | "균형" | "매우 균형";
        interpretation: string;
    };

    // 인생 5대 영역 (십성/신살 기반)
    life_aspects: {
        관계성: LifeAspect; // 비겁(나), 도화살
        리더십: LifeAspect; // 관성(권력)
        재물: LifeAspect; // 재성
        표현: LifeAspect; // 식상, 화개살
        학습: LifeAspect; // 인성, 문창귀인
    };

    // 핵심 특징
    core_traits: {
        strength: string[]; // 3가지 강점
        weakness: string[]; // 3가지 약점
        life_motto: string; // 인생 모토
    };

    // 신살 (특수 능력)
    sinsal: Sinsal[];

    // 종합 평가
    summary: {
        personality_type: string; // "외향형 리더", "내향형 예술가" 등
        best_situation: string; // 어떤 상황에서 빛나는가
        challenge: string; // 어떤 상황이 어려운가
    };
}

/**
 * 60갑자 → 한자 매핑 헬퍼
 */
function getPillarHanja(pillarCode: string): { cheongan: string; jiji: string } {
    const mapping: Record<string, [string, string]> = {
        GAP_JA: ["甲", "子"],
        EUL_CHUK: ["乙", "丑"],
        BYEONG_IN: ["丙", "寅"],
        JEONG_MYO: ["丁", "卯"],
        MU_JIN: ["戊", "辰"],
        GI_SA: ["己", "巳"],
        GYEONG_O: ["庚", "午"],
        SIN_MI: ["辛", "未"],
        IM_SIN: ["壬", "申"],
        GYE_YU: ["癸", "酉"],
        GAP_SUL: ["甲", "戌"],
        EUL_HAE: ["乙", "亥"],
        BYEONG_JA: ["丙", "子"],
        JEONG_CHUK: ["丁", "丑"],
        MU_IN: ["戊", "寅"],
        GI_MYO: ["己", "卯"],
        GYEONG_JIN: ["庚", "辰"],
        SIN_SA: ["辛", "巳"],
        IM_O: ["壬", "午"],
        GYE_MI: ["癸", "未"],
        GAP_SIN: ["甲", "申"],
        EUL_YU: ["乙", "酉"],
        BYEONG_SUL: ["丙", "戌"],
        JEONG_HAE: ["丁", "亥"],
        MU_JA: ["戊", "子"],
        GI_CHUK: ["己", "丑"],
        GYEONG_IN: ["庚", "寅"],
        SIN_MYO: ["辛", "卯"],
        IM_JIN: ["壬", "辰"],
        GYE_SA: ["癸", "巳"],
        GAP_O: ["甲", "午"],
        EUL_MI: ["乙", "未"],
        BYEONG_SIN: ["丙", "申"],
        JEONG_YU: ["丁", "酉"],
        MU_SUL: ["戊", "戌"],
        GI_HAE: ["己", "亥"],
        GYEONG_JA: ["庚", "子"],
        SIN_CHUK: ["辛", "丑"],
        IM_IN: ["壬", "寅"],
        GYE_MYO: ["癸", "卯"],
        GAP_JIN: ["甲", "辰"],
        EUL_SA: ["乙", "巳"],
        BYEONG_O: ["丙", "午"],
        JEONG_MI: ["丁", "未"],
        MU_SIN: ["戊", "申"],
        GI_YU: ["己", "酉"],
        GYEONG_SUL: ["庚", "戌"],
        SIN_HAE: ["辛", "亥"],
        IM_JA: ["壬", "子"],
        GYE_CHUK: ["癸", "丑"],
        GAP_IN: ["甲", "寅"],
        EUL_MYO: ["乙", "卯"],
        BYEONG_JIN: ["丙", "辰"],
        JEONG_SA: ["丁", "巳"],
        MU_O: ["戊", "午"],
        GI_MI: ["己", "未"],
        GYEONG_SIN: ["庚", "申"],
        SIN_YU: ["辛", "酉"],
        IM_SUL: ["壬", "戌"],
        GYE_HAE: ["癸", "亥"],
    };

    const [cheongan, jiji] = mapping[pillarCode] || ["甲", "子"];
    return { cheongan, jiji };
}

/**
 * 오행 균형 분석
 */
function analyzeWuxingBalance(pillarCode: string): CharacterAnalysis["wuxing_balance"] {
    const wuxing = getWuxingFromPillarCode(pillarCode);
    const { cheongan, jiji } = getPillarHanja(pillarCode);

    // 일주에서 나타나는 오행만 카운트 (간단 버전)
    const elementCount: Partial<Record<WuxingElement, number>> = {};
    elementCount[wuxing.cheongan] = (elementCount[wuxing.cheongan] || 0) + 2; // 천간이 더 중요
    elementCount[wuxing.jiji] = (elementCount[wuxing.jiji] || 0) + 1;

    // 각 오행의 강도
    const elements: WuxingBalance[] = (["木", "火", "土", "金", "水"] as WuxingElement[]).map((el) => {
        const count = elementCount[el] || 0;
        let presence: WuxingBalance["presence"];
        let presenceValue: number;

        if (count === 0) {
            presence = "없음";
            presenceValue = 0;
        } else if (count === 1) {
            presence = "약함";
            presenceValue = 33;
        } else if (count === 2) {
            presence = "강함";
            presenceValue = 67;
        } else {
            presence = "강함";
            presenceValue = 100;
        }

        return {
            element: el,
            presence,
            presenceValue,
            description: WUXING_INFO[el].trait,
        };
    });

    // 주도 오행과 부족 오행
    const dominant = wuxing.dominant;
    const lacking = elements.find((e) => e.presence === "없음")?.element || null;

    // 균형도 판단
    const nonZeroCount = elements.filter((e) => e.presenceValue > 0).length;
    let overall_balance: CharacterAnalysis["wuxing_balance"]["overall_balance"];
    if (nonZeroCount === 5) overall_balance = "매우 균형";
    else if (nonZeroCount === 4) overall_balance = "균형";
    else if (nonZeroCount === 3) overall_balance = "약간 불균형";
    else overall_balance = "불균형";

    const interpretation =
        overall_balance === "불균형"
            ? `${WUXING_INFO[dominant].name_kr}이 지나치게 강합니다. 다른 영역도 발전시켜야 균형잡힌 삶을 살 수 있습니다.`
            : overall_balance === "약간 불균형"
                ? `${WUXING_INFO[dominant].name_kr}이 강하지만, 전체적으로 나쁘지 않은 균형입니다.`
                : `오행이 고르게 분포되어 있어 안정적입니다.`;

    return {
        elements,
        dominant,
        lacking,
        overall_balance,
        interpretation,
    };
}

/**
 * 인생 영역 분석 (신살 기반)
 */
function analyzeLifeAspects(pillarCode: string, sinsal: Sinsal[]): CharacterAnalysis["life_aspects"] {
    const wuxing = getWuxingFromPillarCode(pillarCode);
    const dominant = wuxing.dominant;

    // 기본 강도 설정 (오행 기반)
    const baseStrength: Record<WuxingElement, Partial<Record<keyof CharacterAnalysis["life_aspects"], number>>> = {
        木: { 관계성: 70, 표현: 80, 리더십: 60 },
        火: { 관계성: 85, 리더십: 80, 표현: 75 },
        土: { 재물: 75, 관계성: 65, 학습: 60 },
        金: { 리더십: 75, 재물: 70, 학습: 65 },
        水: { 학습: 85, 표현: 70, 재물: 65 },
    };

    let scores = {
        관계성: baseStrength[dominant].관계성 || 50,
        리더십: baseStrength[dominant].리더십 || 50,
        재물: baseStrength[dominant].재물 || 50,
        표현: baseStrength[dominant].표현 || 50,
        학습: baseStrength[dominant].학습 || 50,
    };

    // 신살 보너스
    sinsal.forEach((s) => {
        if (s.name === "도화살") scores.관계성 += 20;
        if (s.name === "천을귀인") {
            scores.리더십 += 15;
            scores.재물 += 15;
        }
        if (s.name === "화개살") {
            scores.표현 += 25;
            scores.관계성 -= 10;
        }
        if (s.name === "문창귀인") scores.학습 += 20;
        if (s.name === "역마살") {
            scores.관계성 += 10;
            scores.재물 -= 5;
        }
    });

    // 100 제한
    Object.keys(scores).forEach((key) => {
        scores[key as keyof typeof scores] = Math.min(100, Math.max(0, scores[key as keyof typeof scores]));
    });

    // 강도 레벨 변환
    const toLevel = (val: number): StrengthLevel => {
        if (val >= 80) return "매우 강함";
        if (val >= 65) return "강함";
        if (val >= 45) return "보통";
        if (val >= 30) return "약함";
        return "매우 약함";
    };

    return {
        관계성: {
            name: "관계성",
            strength: toLevel(scores.관계성),
            strengthValue: scores.관계성,
            description: "사람들과의 관계를 맺고 유지하는 능력",
            keywords: scores.관계성 >= 65 ? ["사교적", "친화력", "인기"] : ["내향적", "소수 친구", "독립적"],
        },
        리더십: {
            name: "리더십",
            strength: toLevel(scores.리더십),
            strengthValue: scores.리더십,
            description: "조직을 이끌고 결정을 내리는 능력",
            keywords: scores.리더십 >= 65 ? ["주도적", "카리스마", "결단력"] : ["팔로워", "협력형", "지원"],
        },
        재물: {
            name: "재물",
            strength: toLevel(scores.재물),
            strengthValue: scores.재물,
            description: "돈을 벌고 관리하는 능력",
            keywords: scores.재물 >= 65 ? ["재테크", "저축", "경제관념"] : ["소비형", "돈 관리 약함", "충동 구매"],
        },
        표현: {
            name: "표현",
            strength: toLevel(scores.표현),
            strengthValue: scores.표현,
            description: "자신의 생각과 감정을 표현하는 능력",
            keywords: scores.표현 >= 65 ? ["창의적", "예술적", "표현력"] : ["과묵", "속마음 안 보임", "표현 서툼"],
        },
        학습: {
            name: "학습",
            strength: toLevel(scores.학습),
            strengthValue: scores.학습,
            description: "새로운 것을 배우고 습득하는 능력",
            keywords: scores.학습 >= 65 ? ["독학", "빠른 습득", "학구열"] : ["실전형", "경험 중시", "이론 약함"],
        },
    };
}

/**
 * 핵심 특징 추출
 */
function extractCoreTraits(
    wuxing_balance: CharacterAnalysis["wuxing_balance"],
    life_aspects: CharacterAnalysis["life_aspects"],
    sinsal: Sinsal[]
): CharacterAnalysis["core_traits"] {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // 인생 영역에서 강점/약점
    Object.values(life_aspects).forEach((aspect) => {
        if (aspect.strength === "매우 강함" || aspect.strength === "강함") {
            strengths.push(`${aspect.name}이 뛰어남 (${aspect.keywords.join(", ")})`);
        }
        if (aspect.strength === "약함" || aspect.strength === "매우 약함") {
            weaknesses.push(`${aspect.name}이 약함 (${aspect.keywords.join(", ")})`);
        }
    });

    // 신살에서 특징
    sinsal.forEach((s) => {
        if (s.type === "길신" && s.positive.length > 0) {
            strengths.push(`${s.name}: ${s.positive[0]}`);
        }
        if (s.negative.length > 0) {
            weaknesses.push(`${s.name}: ${s.negative[0]}`);
        }
    });

    // 상위 3개씩만
    const topStrengths = strengths.slice(0, 3);
    const topWeaknesses = weaknesses.slice(0, 3);

    // 인생 모토 (주도 오행 기반)
    const mottos: Record<WuxingElement, string> = {
        木: "성장이 멈추는 순간 죽는다. 계속 배우고 확장하라.",
        火: "열정 없이 사는 것은 죽은 것과 같다. 불타올라라.",
        土: "땅처럼 묵묵히 버텨라. 결국 너를 믿는 사람이 남는다.",
        金: "원칙 없이 사는 것은 방황이다. 너의 기준을 지켜라.",
        水: "물처럼 흘러라. 막히면 돌아가고, 낮은 곳으로 가라.",
    };

    return {
        strength: topStrengths.length > 0 ? topStrengths : ["아직 발견되지 않은 잠재력"],
        weakness: topWeaknesses.length > 0 ? topWeaknesses : ["특별한 약점 없음"],
        life_motto: mottos[wuxing_balance.dominant],
    };
}

/**
 * 종합 평가
 */
function generateSummary(
    wuxing_balance: CharacterAnalysis["wuxing_balance"],
    life_aspects: CharacterAnalysis["life_aspects"],
    sinsal: Sinsal[]
): CharacterAnalysis["summary"] {
    const dominant = wuxing_balance.dominant;

    // 성격 유형
    const { 관계성, 리더십, 표현 } = life_aspects;
    let personality_type = "";

    if (관계성.strengthValue >= 70 && 리더십.strengthValue >= 70) {
        personality_type = "외향형 리더";
    } else if (관계성.strengthValue >= 70) {
        personality_type = "사교형 친화력 리더";
    } else if (표현.strengthValue >= 70) {
        personality_type = "내향형 예술가";
    } else if (리더십.strengthValue >= 70) {
        personality_type = "카리스마형 리더";
    } else {
        personality_type = "균형잡힌 올라운더";
    }

    // 빛나는 상황
    const bestSituations: Record<WuxingElement, string> = {
        木: "새로운 프로젝트를 시작할 때, 창의적인 아이디어가 필요할 때",
        火: "사람들 앞에서 발표할 때, 열정이 필요한 순간",
        土: "팀을 중재하고 안정시켜야 할 때, 신뢰가 중요한 관계",
        金: "원칙과 규칙이 필요할 때, 정확한 판단이 요구될 때",
        水: "복잡한 문제를 분석할 때, 전략이 필요한 상황",
    };

    // 어려운 상황
    const challenges: Record<WuxingElement, string> = {
        木: "마무리가 필요할 때, 하나에 집중해야 할 때",
        火: "차분하게 기다려야 할 때, 감정을 숨겨야 할 때",
        土: "빠른 결정이 필요할 때, 변화에 적응해야 할 때",
        金: "융통성이 필요할 때, 감정적으로 대해야 할 때",
        水: "빠른 행동이 필요할 때, 직관보다 행동이 중요할 때",
    };

    return {
        personality_type,
        best_situation: bestSituations[dominant],
        challenge: challenges[dominant],
    };
}

/**
 * 전체 분석 생성
 */
export function analyzeCharacter(pillarCode: string): CharacterAnalysis {
    const { cheongan, jiji } = getPillarHanja(pillarCode);
    const wuxing_balance = analyzeWuxingBalance(pillarCode);
    const sinsal = calculateSinsal(pillarCode);
    const life_aspects = analyzeLifeAspects(pillarCode, sinsal);
    const core_traits = extractCoreTraits(wuxing_balance, life_aspects, sinsal);
    const summary = generateSummary(wuxing_balance, life_aspects, sinsal);

    return {
        code: pillarCode,
        pillar: { cheongan, jiji },
        wuxing_balance,
        life_aspects,
        core_traits,
        sinsal,
        summary,
    };
}

/**
 * 전체 60개 분석
 */
export function analyzeAllCharacters(): CharacterAnalysis[] {
    return PILLAR_CODES.map((code) => analyzeCharacter(code));
}
