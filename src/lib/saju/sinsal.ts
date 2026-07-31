/**
 * 신살 (神煞, Sinsal / Special Stars) System
 * 
 * 사주에서 특별한 능력/운명을 나타내는 요소
 * RPG 게임의 "패시브 스킬"과 유사
 */

import { SIXTY_GANJI } from "@/core/calendar/ganji";

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
 * 일주 하나만 보고 판정하는 신살.
 *
 * 도화·역마·화개는 원래 연지(또는 일지)를 기준으로 다른 기둥의 지지를 보는
 * 살이지만, 여기는 일주 코드 하나만 받는 자리다(사주 전체 기준 판정은
 * `src/core/myeongni/sinsal.ts` 의 `analyzeSinsal` 이 한다). 그래서 이 파일은
 * 지지 자체의 부류로 보는 통용 간법을 쓴다:
 *
 * - 도화지: 자오묘유 (각 삼합국의 목욕지)
 * - 역마지: 인신사해 (각 삼합국의 병지)
 * - 화개지: 진술축미 (각 삼합국의 고지)
 *
 * 예전 코드는 역마 표를 `if (yima[jiji])` 로 검사해 12지지 전부 참이 되어
 * 역마살이 모든 일주에 붙었고, 화개는 자기 지지끼리 비교하고 있었다.
 * 공망은 기둥 하나로는 판정 자체가 성립하지 않는다 — 어떤 기둥도 자기가
 * 속한 순(旬)의 공망지를 지지로 가질 수 없으므로, 하드코딩돼 있던 가짜
 * 판정을 제거했다(60갑자 중 아무 조합도 자기 공망이 아니다).
 */
export function calculateSinsal(pillarCode: string): Sinsal[] {
    const sinsals: Sinsal[] = [];

    const codeMap = getPillarHanja(pillarCode);
    if (!codeMap) return [];

    const { cheongan, jiji } = codeMap;
    const pillar = cheongan + jiji;

    // 1. 천을귀인 — 일간이 자기 지지에서 귀인을 만나는 네 일주(일귀).
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

    // 2. 도화살 — 도화지
    if (["子", "午", "卯", "酉"].includes(jiji)) {
        sinsals.push(SINSAL_DEFINITIONS.도화살);
    }

    // 3. 역마살 — 역마지
    if (["寅", "申", "巳", "亥"].includes(jiji)) {
        sinsals.push(SINSAL_DEFINITIONS.역마살);
    }

    // 4. 화개살 — 화개지
    if (["辰", "戌", "丑", "未"].includes(jiji)) {
        sinsals.push(SINSAL_DEFINITIONS.화개살);
    }

    // 5. 문창귀인 — 일간의 문창지가 마침 자기 지지인 여섯 일주
    const munchang: Record<string, string> = {
        甲: "巳", 乙: "午", 丙: "申", 丁: "酉", 戊: "申",
        己: "酉", 庚: "亥", 辛: "子", 壬: "寅", 癸: "卯",
    };
    if (munchang[cheongan] === jiji) {
        sinsals.push(SINSAL_DEFINITIONS.문창귀인);
    }

    // 6. 백호대살 — 간지 조합 자체로 정해지는 일곱 기둥
    if (["甲辰", "乙未", "丙戌", "丁丑", "戊辰", "壬戌", "癸丑"].includes(pillar)) {
        sinsals.push(SINSAL_DEFINITIONS.백호대살);
    }

    // 7. 괴강살 — 진·술 위의 무·경·임
    if (["戊辰", "戊戌", "庚辰", "庚戌", "壬辰", "壬戌"].includes(pillar)) {
        sinsals.push(SINSAL_DEFINITIONS.괴강살);
    }

    // 8. 양인살 — 일간의 양인이 자기 지지인 세 일주(일인)
    if (["丙午", "戊午", "壬子"].includes(pillar)) {
        sinsals.push(SINSAL_DEFINITIONS.양인살);
    }

    return sinsals;
}

const STEM_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCH_HANJA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/**
 * 일주 코드 → 한자 변환.
 *
 * 예전에는 60개 중 12개만 손으로 적어 둔 표를 썼고, 나머지 48개 일주는
 * 여기서 null 이 나와 신살이 통째로 빈 배열이었다. 코드 목록은
 * `SIXTY_GANJI` 가 이미 갖고 있으므로 그것으로 전체 표를 만든다.
 */
const CODE_TO_HANJA: Record<string, { cheongan: string; jiji: string }> = Object.fromEntries(
    SIXTY_GANJI.map(g => [g.code, { cheongan: STEM_HANJA[g.stemIndex], jiji: BRANCH_HANJA[g.branchIndex] }])
);

function getPillarHanja(pillarCode: string): { cheongan: string; jiji: string } | null {
    return CODE_TO_HANJA[pillarCode] ?? null;
}
