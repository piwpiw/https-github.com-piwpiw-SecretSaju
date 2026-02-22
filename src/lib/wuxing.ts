/**
 * 오행 (五行, Wu Xing / Five Elements) System
 * 
 * 사주 명리학의 핵심 레이어
 * 모든 천간과 지지는 오행 중 하나에 속함
 */

export type WuxingElement = "木" | "火" | "土" | "金" | "水";
export type YinYang = "양" | "음";

export interface ElementInfo {
    element: WuxingElement;
    name_kr: string;
    name_en: string;
    color: string;
    season: string;
    trait: string;
    direction: string;
}

export const WUXING_INFO: Record<WuxingElement, ElementInfo> = {
    木: {
        element: "木",
        name_kr: "목(나무)",
        name_en: "Wood",
        color: "#22c55e", // green
        season: "봄",
        trait: "성장, 확장, 창의",
        direction: "동",
    },
    火: {
        element: "火",
        name_kr: "화(불)",
        name_en: "Fire",
        color: "#ef4444", // red
        season: "여름",
        trait: "열정, 표현, 활동",
        direction: "남",
    },
    土: {
        element: "土",
        name_kr: "토(흙)",
        name_en: "Earth",
        color: "#eab308", // yellow
        season: "환절기",
        trait: "안정, 포용, 신뢰",
        direction: "중앙",
    },
    金: {
        element: "金",
        name_kr: "금(금속)",
        name_en: "Metal",
        color: "#e5e7eb", // white/silver
        season: "가을",
        trait: "수렴, 정리, 원칙",
        direction: "서",
    },
    水: {
        element: "水",
        name_kr: "수(물)",
        name_en: "Water",
        color: "#3b82f6", // blue
        season: "겨울",
        trait: "지혜, 유동, 저장",
        direction: "북",
    },
};

/**
 * 천간 (天干) → 오행 매핑
 */
export const CHEONGAN_TO_WUXING: Record<string, { element: WuxingElement; yinyang: YinYang }> = {
    甲: { element: "木", yinyang: "양" }, // 큰 나무
    乙: { element: "木", yinyang: "음" }, // 풀, 덩굴
    丙: { element: "火", yinyang: "양" }, // 태양
    丁: { element: "火", yinyang: "음" }, // 촛불
    戊: { element: "土", yinyang: "양" }, // 산
    己: { element: "土", yinyang: "음" }, // 밭
    庚: { element: "金", yinyang: "양" }, // 쇠
    辛: { element: "金", yinyang: "음" }, // 보석
    壬: { element: "水", yinyang: "양" }, // 바다
    癸: { element: "水", yinyang: "음" }, // 이슬
};

/**
 * 지지 (地支) → 오행 매핑
 */
export const JIJI_TO_WUXING: Record<string, { element: WuxingElement; hidden: WuxingElement[] }> = {
    子: { element: "水", hidden: ["水"] },
    丑: { element: "土", hidden: ["土", "金", "水"] },
    寅: { element: "木", hidden: ["木", "火", "土"] },
    卯: { element: "木", hidden: ["木"] },
    辰: { element: "土", hidden: ["土", "木", "水"] },
    巳: { element: "火", hidden: ["火", "土", "金"] },
    午: { element: "火", hidden: ["火", "土"] },
    未: { element: "土", hidden: ["土", "火", "木"] },
    申: { element: "金", hidden: ["金", "水", "土"] },
    酉: { element: "金", hidden: ["金"] },
    戌: { element: "土", hidden: ["土", "金", "火"] },
    亥: { element: "水", hidden: ["水", "木"] },
};

/**
 * 오행 관계
 */
export type WuxingRelation = "상생" | "상극" | "동일" | "비화" | "누설";

/**
 * 상생 (相生) - 생해주는 관계
 * 木 → 火 → 土 → 金 → 水 → 木
 */
const SHENGSHENG_MAP: Record<WuxingElement, WuxingElement> = {
    木: "火", // 나무가 불을 생함
    火: "土", // 불이 흙을 생함
    土: "金", // 흙이 금을 생함
    金: "水", // 금이 물을 생함
    水: "木", // 물이 나무를 생함
};

/**
 * 상극 (相剋) - 극하는 관계
 * 木 → 土 → 水 → 火 → 金 → 木
 */
const XIANGKE_MAP: Record<WuxingElement, WuxingElement> = {
    木: "土", // 나무가 흙을 극함
    土: "水", // 흙이 물을 극함
    水: "火", // 물이 불을 극함
    火: "金", // 불이 금을 극함
    金: "木", // 금이 나무를 극함
};

/**
 * 두 오행의 관계 계산
 */
export function getWuxingRelation(from: WuxingElement, to: WuxingElement): WuxingRelation {
    if (from === to) return "동일";
    if (SHENGSHENG_MAP[from] === to) return "상생"; // from이 to를 생함
    if (XIANGKE_MAP[from] === to) return "상극"; // from이 to를 극함
    if (SHENGSHENG_MAP[to] === from) return "비화"; // to가 from을 생함 (역상생)
    if (XIANGKE_MAP[to] === from) return "누설"; // to가 from을 극함 (역상극)
    return "동일"; // fallback
}

/**
 * 관계의 점수화 (궁합 계산용)
 */
export function getWuxingCompatibilityScore(from: WuxingElement, to: WuxingElement): number {
    const relation = getWuxingRelation(from, to);

    switch (relation) {
        case "상생": return 85; // 내가 상대를 도와줌 (좋은 관계)
        case "비화": return 80; // 상대가 나를 도와줌 (좋은 관계)
        case "동일": return 60; // 비슷함 (우호적이지만 경쟁)
        case "상극": return 40; // 내가 상대를 제약 (갈등)
        case "누설": return 45; // 상대가 나를 제약 (압박)
        default: return 50;
    }
}

/**
 * 관계의 설명
 */
export function getWuxingRelationDescription(
    from: WuxingElement,
    to: WuxingElement
): { relation: WuxingRelation; description: string; emoji: string } {
    const relation = getWuxingRelation(from, to);

    const descriptions: Record<WuxingRelation, { description: string; emoji: string }> = {
        상생: {
            description: `${WUXING_INFO[from].name_kr}이 ${WUXING_INFO[to].name_kr}을 생해줌. 도움을 주는 관계.`,
            emoji: "🌱",
        },
        비화: {
            description: `${WUXING_INFO[to].name_kr}이 ${WUXING_INFO[from].name_kr}을 생해줌. 도움을 받는 관계.`,
            emoji: "🌟",
        },
        상극: {
            description: `${WUXING_INFO[from].name_kr}이 ${WUXING_INFO[to].name_kr}을 극함. 제약하는 관계.`,
            emoji: "⚔️",
        },
        누설: {
            description: `${WUXING_INFO[to].name_kr}이 ${WUXING_INFO[from].name_kr}을 극함. 억압받는 관계.`,
            emoji: "🔒",
        },
        동일: {
            description: `${WUXING_INFO[from].name_kr} 끼리. 친구이자 경쟁자.`,
            emoji: "🤝",
        },
    };

    return {
        relation,
        ...descriptions[relation],
    };
}

/**
 * 60갑자 코드에서 오행 추출
 */
export function getWuxingFromPillarCode(pillarCode: string): {
    cheongan: WuxingElement;
    jiji: WuxingElement;
    dominant: WuxingElement;
} {
    // 일주 코드 예: "GAP_JA" → 甲子
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
    const cheonganElement = CHEONGAN_TO_WUXING[cheongan].element;
    const jijiElement = JIJI_TO_WUXING[jiji].element;

    // 일간(천간)을 주도적 오행으로 사용
    return {
        cheongan: cheonganElement,
        jiji: jijiElement,
        dominant: cheonganElement,
    };
}
