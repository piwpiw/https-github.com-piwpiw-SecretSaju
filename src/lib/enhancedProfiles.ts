/**
 * Enhanced Character Profile Generator
 * 
 * 기존 60개 동물에 사주 레이어 적용:
 * - 오행 (Five Elements)
 * - 5차원 스탯 (Stats)
 * - 신살 (Special Stars)
 */

import { getWuxingFromPillarCode, WUXING_INFO } from "./wuxing";
import { calculateSinsal, type Sinsal } from "./sinsal";
import { PILLAR_CODES } from "./saju";

export interface EnhancedCharacterStats {
    사교성: number; // 비겁(나) 관련
    리더십: number; // 관성(권력) 관련
    재물운: number; // 재성(재물) 관련
    창의성: number; // 식상(표현) 관련
    학습력: number; // 인성(학문) 관련
}

export interface EnhancedCharacterProfile {
    code: string;
    pillar: {
        cheongan: string;
        jiji: string;
    };
    wuxing: {
        cheongan_element: string;
        jiji_element: string;
        dominant: string;
        color: string;
    };
    stats: EnhancedCharacterStats;
    sinsal: Sinsal[];
    personality_core: {
        element_trait: string; // 오행 기반 핵심 성격
        strength: string;
        weakness: string;
    };
}

/**
 * 일주 코드 → 한자 매핑 (전체 60개)
 */
const PILLAR_HANJA_MAP: Record<string, [string, string]> = {
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

/**
 * 오행별 스탯 기본값
 */
const WUXING_BASE_STATS: Record<string, Partial<EnhancedCharacterStats>> = {
    木: { 사교성: 75, 창의성: 85, 리더십: 70 }, // 성장, 확장
    火: { 사교성: 90, 리더십: 85, 창의성: 80 }, // 열정, 표현
    土: { 재물운: 80, 사교성: 70, 학습력: 65 }, // 안정, 신뢰
    金: { 리더십: 80, 재물운: 75, 학습력: 70 }, // 원칙, 수렴
    水: { 학습력: 90, 창의성: 75, 재물운: 70 }, // 지혜, 유동
};

/**
 * 오행별 핵심 성격
 */
const WUXING_PERSONALITY: Record<string, { trait: string; strength: string; weakness: string }> = {
    木: {
        trait: "성장하고 확장하려는 욕구",
        strength: "창의적이고 유연함, 새로운 것을 잘 시작함",
        weakness: "완성은 못함, 계획만 많고 실행력 부족",
    },
    火: {
        trait: "열정적으로 표현하고 빛나려는 욕구",
        strength: "카리스마 있고 사람들 끌어모음",
        weakness: "불같이 화내고 쉽게 식음, 번아웃 잦음",
    },
    土: {
        trait: "안정되고 포용하려는 욕구",
        strength: "신뢰받고 중재 잘함, 끈기 있음",
        weakness: "우유부단, 변화 못 따라감, 답답함",
    },
    金: {
        trait: "정리하고 원칙을 세우려는 욕구",
        strength: "강인하고 원칙적, 일 처리 깔끔",
        weakness: "융통성 없음, 냉정하다는 소리 들음",
    },
    水: {
        trait: "지혜롭게 흐르고 저장하려는 욕구",
        strength: "똑똑하고 적응 빠름, 전략적",
        weakness: "우유부단, 겁 많음, 계산적",
    },
};

/**
 * 60개 캐릭터 프로필 생성
 */
export function generateEnhancedProfile(pillarCode: string): EnhancedCharacterProfile {
    const wuxing = getWuxingFromPillarCode(pillarCode);
    const [cheongan, jiji] = PILLAR_HANJA_MAP[pillarCode] || ["甲", "子"];
    const sinsal = calculateSinsal(pillarCode);

    // 오행 기반 기본 스탯
    const baseStats = WUXING_BASE_STATS[wuxing.dominant] || {};

    // 신살 보너스 적용
    const statBonus = calculateSinsalStatBonus(sinsal);

    // 최종 스탯 (100점 만점)
    const stats: EnhancedCharacterStats = {
        사교성: Math.min(100, (baseStats.사교성 || 50) + statBonus.사교성),
        리더십: Math.min(100, (baseStats.리더십 || 50) + statBonus.리더십),
        재물운: Math.min(100, (baseStats.재물운 || 50) + statBonus.재물운),
        창의성: Math.min(100, (baseStats.창의성 || 50) + statBonus.창의성),
        학습력: Math.min(100, (baseStats.학습력 || 50) + statBonus.학습력),
    };

    // 성격 코어
    const personality = WUXING_PERSONALITY[wuxing.dominant] || WUXING_PERSONALITY.木;

    return {
        code: pillarCode,
        pillar: {
            cheongan,
            jiji,
        },
        wuxing: {
            cheongan_element: wuxing.cheongan,
            jiji_element: wuxing.jiji,
            dominant: wuxing.dominant,
            color: WUXING_INFO[wuxing.dominant as keyof typeof WUXING_INFO].color,
        },
        stats,
        sinsal,
        personality_core: {
            element_trait: personality.trait,
            strength: personality.strength,
            weakness: personality.weakness,
        },
    };
}

/**
 * 신살에 따른 스탯 보너스
 */
function calculateSinsalStatBonus(sinsal: Sinsal[]): EnhancedCharacterStats {
    const bonus: EnhancedCharacterStats = {
        사교성: 0,
        리더십: 0,
        재물운: 0,
        창의성: 0,
        학습력: 0,
    };

    sinsal.forEach((s) => {
        switch (s.name) {
            case "도화살":
                bonus.사교성 += 15;
                break;
            case "천을귀인":
                bonus.리더십 += 10;
                bonus.재물운 += 10;
                break;
            case "화개살":
                bonus.창의성 += 20;
                bonus.사교성 -= 10; // 외로움
                break;
            case "문창귀인":
                bonus.학습력 += 15;
                break;
            case "역마살":
                bonus.사교성 += 10;
                bonus.재물운 -= 5; // 불안정
                break;
            case "괴강살":
                bonus.리더십 += 15;
                bonus.사교성 -= 10; // 독단
                break;
        }
    });

    return bonus;
}

/**
 * 전체 60개 프로필 생성
 */
export function generateAllProfiles(): EnhancedCharacterProfile[] {
    return PILLAR_CODES.map((code) => generateEnhancedProfile(code));
}
