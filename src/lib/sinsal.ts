/**
 * 신살 (神煞, Sinsal / Special Stars) System
 * 
 * 사주에서 특별한 능력/운명을 나타내는 요소
 * RPG 게임의 "패시브 스킬"과 유사
 */

export type SinsalType = "길신" | "흉신" | "중성";

export interface Sinsal {
    name: string;
    hanja?: string;
    type: SinsalType;
    category: "인연" | "재능" | "이동" | "학문" | "건강" | "기타";
    effect: string;
    positive: string[];
    negative: string[];
    description: string;
    emoji: string;
}

/**
 * 주요 신살 정의
 */
export const SINSAL_DEFINITIONS: Record<string, Sinsal> = {
    천을귀인: {
        name: "천을귀인",
        hanja: "天乙貴人",
        type: "길신",
        category: "인연",
        effect: "귀인 만남, 위기 탈출",
        positive: ["귀인 만남", "도움 받음", "위기 해결"],
        negative: [],
        description: "중요한 순간에 도와주는 사람이 나타남. 운이 좋은 편.",
        emoji: "👼",
    },
    도화살: {
        name: "도화살",
        hanja: "桃花煞",
        type: "중성",
        category: "인연",
        effect: "이성운 MAX, 매력 폭발",
        positive: ["매력적", "인기", "사교성"],
        negative: ["바람기", "관계 복잡", "스캔들"],
        description: "이성에게 인기 많음. 근데 관계가 복잡해질 수 있음.",
        emoji: "🌸",
    },
    역마살: {
        name: "역마살",
        hanja: "驛馬煞",
        type: "중성",
        category: "이동",
        effect: "이동, 해외, 변화",
        positive: ["해외 기회", "활동성", "변화 적응"],
        negative: ["불안정", "정착 어려움", "이별"],
        description: "한 곳에 오래 정착하기 어려움. 이동/해외 인연 많음.",
        emoji: "🐎",
    },
    화개살: {
        name: "화개살",
        hanja: "華蓋煞",
        type: "길신",
        category: "재능",
        effect: "예술, 종교, 학문",
        positive: ["예술적 재능", "학문", "영성"],
        negative: ["외로움", "고독", "이해받지 못함"],
        description: "예술/학문 분야 재능. 근데 외로움을 많이 탐.",
        emoji: "🎨",
    },
    문창귀인: {
        name: "문창귀인",
        hanja: "文昌貴人",
        type: "길신",
        category: "학문",
        effect: "시험운, 학업 능력",
        positive: ["학업 우수", "시험 합격", "글쓰기"],
        negative: [],
        description: "공부 잘하고 시험운 좋음. 자격증 따기 유리.",
        emoji: "📝",
    },
    괴강살: {
        name: "괴강살",
        hanja: "魁罡煞",
        type: "흉신",
        category: "기타",
        effect: "강한 성격, 독단",
        positive: ["강인함", "추진력", "리더십"],
        negative: ["독단", "고집", "인간관계 갈등"],
        description: "성격 강하고 고집 셈. 리더 되면 강력하지만 갈등 많음.",
        emoji: "💪",
    },
    백호대살: {
        name: "백호대살",
        hanja: "白虎大煞",
        type: "흉신",
        category: "건강",
        effect: "사고, 부상 주의",
        positive: [],
        negative: ["사고", "부상", "수술"],
        description: "사고나 부상 조심. 운전 주의, 격한 운동 피하기.",
        emoji: "🐯",
    },
    양인살: {
        name: "양인살",
        hanja: "羊刃煞",
        type: "흉신",
        category: "건강",
        effect: "칼날 기운, 사고",
        positive: ["결단력", "추진력"],
        negative: ["사고", "수술", "폭력성"],
        description: "날카로운 기운. 칼 다루는 직업(의사, 요리사) 적합. 사고 주의.",
        emoji: "🔪",
    },
    공망: {
        name: "공망",
        hanja: "空亡",
        type: "흉신",
        category: "기타",
        effect: "텅 빔, 상실",
        positive: ["무욕", "초연함"],
        negative: ["상실", "허무", "노력 헛됨"],
        description: "노력해도 결과 안 나올 수 있음. 비워야 채워지는 운.",
        emoji: "🕳️",
    },
    천덕귀인: {
        name: "천덕귀인",
        hanja: "天德貴人",
        type: "길신",
        category: "인연",
        effect: "덕망, 도덕성",
        positive: ["덕망", "신뢰", "도움"],
        negative: [],
        description: "도덕성 높고 사람들에게 신뢰받음. 좋은 인연 많음.",
        emoji: "😇",
    },
    월덕귀인: {
        name: "월덕귀인",
        hanja: "月德貴人",
        type: "길신",
        category: "인연",
        effect: "월별 길신",
        positive: ["월별 행운", "도움"],
        negative: [],
        description: "특정 월에 행운이 따름. 그 달에 중요한 일 추진하면 좋음.",
        emoji: "🌙",
    },
    홍염살: {
        name: "홍염살",
        hanja: "紅艶煞",
        type: "중성",
        category: "인연",
        effect: "이성 매력, 도화",
        positive: ["매력", "사교성"],
        negative: ["스캔들", "바람"],
        description: "도화살과 유사. 이성에게 인기 많지만 스캔들 주의.",
        emoji: "💋",
    },
    천살: {
        name: "천살",
        hanja: "穿殺",
        type: "흉신",
        category: "기타",
        effect: "관계 뚫림, 배신",
        positive: [],
        negative: ["배신", "이별", "관계 파탄"],
        description: "관계가 깨지기 쉬움. 배신당할 수 있으니 조심.",
        emoji: "💔",
    },
    지살: {
        name: "지살",
        hanja: "地煞",
        type: "흉신",
        category: "기타",
        effect: "땅 기운 흉",
        positive: [],
        negative: ["사고", "재난"],
        description: "땅과 관련된 사고 주의. 부동산 조심.",
        emoji: "🌋",
    },
    육해살: {
        name: "육해살",
        hanja: "六害煞",
        type: "흉신",
        category: "기타",
        effect: "해로움, 방해",
        positive: [],
        negative: ["방해", "손해", "갈등"],
        description: "일이 잘 안 풀림. 방해꾼이 많음.",
        emoji: "⚠️",
    },
};

/**
 * 일주에 따른 신살 판정
 * 
 * 실제 명리학 공식
 */
export function calculateSinsal(pillarCode: string, birthYear?: number): Sinsal[] {
    const sinsals: Sinsal[] = [];

    // 천간-지지 분리
    const codeMap = getPillarHanja(pillarCode);
    if (!codeMap) return [];

    const { cheongan, jiji } = codeMap;

    // 1. 천을귀인 (천간 기준)
    const tianyi: Record<string, string[]> = {
        甲: ["丑", "未"],
        乙: ["子", "申"],
        丙: ["亥", "酉"],
        丁: ["亥", "酉"],
        戊: ["丑", "未"],
        己: ["子", "申"],
        庚: ["丑", "未"],
        辛: ["寅", "午"],
        壬: ["卯", "巳"],
        癸: ["卯", "巳"],
    };
    if (tianyi[cheongan]?.includes(jiji)) {
        sinsals.push(SINSAL_DEFINITIONS.천을귀인);
    }

    // 2. 도화살 (지지 기준)
    const taohua = ["子", "午", "卯", "酉"];
    if (taohua.includes(jiji)) {
        sinsals.push(SINSAL_DEFINITIONS.도화살);
    }

    // 3. 역마살
    const yima: Record<string, string[]> = {
        寅: ["申"], 午: ["申"], 戌: ["申"],
        申: ["寅"], 子: ["寅"], 辰: ["寅"],
        巳: ["亥"], 酉: ["亥"], 丑: ["亥"],
        亥: ["巳"], 卯: ["巳"], 未: ["巳"],
    };
    if (yima[jiji]) {
        sinsals.push(SINSAL_DEFINITIONS.역마살);
    }

    // 4. 화개살
    const huagai: Record<string, string[]> = {
        寅: ["戌"], 午: ["戌"], 戌: ["戌"],
        申: ["辰"], 子: ["辰"], 辰: ["辰"],
        巳: ["丑"], 酉: ["丑"], 丑: ["丑"],
        亥: ["未"], 卯: ["未"], 未: ["未"],
    };
    if (huagai[jiji]?.includes(jiji)) {
        sinsals.push(SINSAL_DEFINITIONS.화개살);
    }

    // 5. 공망 (갑자 순서 기반)
    const gongmang = checkGongmang(pillarCode);
    if (gongmang) {
        sinsals.push(SINSAL_DEFINITIONS.공망);
    }

    return sinsals;
}

/**
 * 공망 계산 (60갑자 순서 기반)
 */
function checkGongmang(pillarCode: string): boolean {
    const gongmangPairs: string[][] = [
        ["GAP_JA", "EUL_CHUK"], // 戌亥 공망
        ["BYEONG_JA", "JEONG_CHUK"], // 申酉
        // ... 나머지 조합도 추가 필요
    ];

    // 간단 구현 (일부만)
    const gongmangCodes = ["GAP_SUL", "EUL_HAE", "BYEONG_SIN", "JEONG_YU"];
    return gongmangCodes.includes(pillarCode);
}

/**
 * 일주 코드 → 한자 변환
 */
function getPillarHanja(pillarCode: string): { cheongan: string; jiji: string } | null {
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
        // ... (60개 전부)
    };

    const result = mapping[pillarCode];
    if (!result) return null;

    return { cheongan: result[0], jiji: result[1] };
}
