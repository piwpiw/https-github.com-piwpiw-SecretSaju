/**
 * Advanced Saju Scoring System
 * 
 * 전통 명리학의 정통 수치화 방법론:
 * - 일간 강약 점수 (得令得地得勢)
 * - 격국 판정 (格局判定)
 * - 용신 선정 (用神選定)
 */

import { WuxingElement, CHEONGAN_TO_WUXING, JIJI_TO_WUXING } from "./wuxing";

/**
 * 4기둥 (연월일시)
 */
import { FourPillars, Stem, Branch } from "../core/calendar/ganji";

/**
 * 일간 강약 점수
 */
export interface GangYakScore {
    deukryeong: number; // 득령 (0-30점)
    deukji: number; // 득지 (0-30점)
    deukse: number; // 득세 (0-40점)
    total: number; // 합계 (0-100점)
    level: "신약" | "중화" | "신강";
    description: string;
}

/**
 * 12운성 (십이운성) - 오행의 생로병사
 */
export type Sibiiunseong =
    | "장생" // 長生 - 탄생
    | "목욕" // 沐浴 - 성장 시작
    | "관대" // 冠帶 - 사회 진출
    | "건록" // 建祿 - 전성기
    | "제왕" // 帝旺 - 최고점
    | "쇠" // 衰 - 쇠퇴 시작
    | "병" // 病 - 병듦
    | "사" // 死 - 죽음
    | "묘" // 墓 - 무덤
    | "절" // 絶 - 소멸
    | "태" // 胎 - 잉태
    | "양"; // 養 - 양육

/**
 * 12운성 테이블 (천간별 지지에서의 상태)
 */
const SIBIIUNSEONG_TABLE: Record<string, Record<string, Sibiiunseong>> = {
    甲: {
        亥: "장생",
        子: "목욕",
        丑: "관대",
        寅: "건록",
        卯: "제왕",
        辰: "쇠",
        巳: "병",
        午: "사",
        未: "묘",
        申: "절",
        酉: "태",
        戌: "양",
    },
    乙: {
        午: "장생",
        巳: "목욕",
        辰: "관대",
        卯: "건록",
        寅: "제왕",
        丑: "쇠",
        子: "병",
        亥: "사",
        戌: "묘",
        酉: "절",
        申: "태",
        未: "양",
    },
    丙: {
        寅: "장생",
        卯: "목욕",
        辰: "관대",
        巳: "건록",
        午: "제왕",
        未: "쇠",
        申: "병",
        酉: "사",
        戌: "묘",
        亥: "절",
        子: "태",
        丑: "양",
    },
    丁: {
        酉: "장생",
        申: "목욕",
        未: "관대",
        午: "건록",
        巳: "제왕",
        辰: "쇠",
        卯: "병",
        寅: "사",
        丑: "묘",
        子: "절",
        亥: "태",
        戌: "양",
    },
    戊: {
        寅: "장생",
        卯: "목욕",
        辰: "관대",
        巳: "건록",
        午: "제왕",
        未: "쇠",
        申: "병",
        酉: "사",
        戌: "묘",
        亥: "절",
        子: "태",
        丑: "양",
    },
    己: {
        酉: "장생",
        申: "목욕",
        未: "관대",
        午: "건록",
        巳: "제왕",
        辰: "쇠",
        卯: "병",
        寅: "사",
        丑: "묘",
        子: "절",
        亥: "태",
        戌: "양",
    },
    庚: {
        巳: "장생",
        午: "목욕",
        未: "관대",
        申: "건록",
        酉: "제왕",
        戌: "쇠",
        亥: "병",
        子: "사",
        丑: "묘",
        寅: "절",
        卯: "태",
        辰: "양",
    },
    辛: {
        子: "장생",
        亥: "목욕",
        戌: "관대",
        酉: "건록",
        申: "제왕",
        未: "쇠",
        午: "병",
        巳: "사",
        辰: "묘",
        卯: "절",
        寅: "태",
        丑: "양",
    },
    壬: {
        申: "장생",
        酉: "목욕",
        戌: "관대",
        亥: "건록",
        子: "제왕",
        丑: "쇠",
        寅: "병",
        卯: "사",
        辰: "묘",
        巳: "절",
        午: "태",
        未: "양",
    },
    癸: {
        卯: "장생",
        寅: "목욕",
        丑: "관대",
        子: "건록",
        亥: "제왕",
        戌: "쇠",
        酉: "병",
        申: "사",
        未: "묘",
        午: "절",
        巳: "태",
        辰: "양",
    },
};

/**
 * 12운성별 점수 (득지 계산용)
 */
const SIBIIUNSEONG_SCORE: Record<Sibiiunseong, number> = {
    제왕: 10,
    건록: 9,
    관대: 7,
    장생: 8,
    양: 5,
    태: 4,
    목욕: 3,
    쇠: 2,
    병: 1,
    사: 0,
    묘: 0,
    절: 0,
};

/**
 * 월지별 왕상휴수사 (왕성도)
 * 
 * 봄(寅卯辰): 木旺, 火相, 水休, 金囚, 土死
 * 여름(巳午未): 火旺, 土相, 木休, 水囚, 金死
 * 가을(申酉戌): 金旺, 水相, 土休, 火囚, 木死
 * 겨울(亥子丑): 水旺, 木相, 金休, 土囚, 火死
 */
const WANGSEONG_SCORE: Record<string, Record<WuxingElement, number>> = {
    // 봄 (木旺)
    寅: { 木: 30, 火: 20, 水: 10, 金: 5, 土: 0 },
    卯: { 木: 30, 火: 20, 水: 10, 金: 5, 土: 0 },
    辰: { 木: 30, 火: 20, 水: 10, 金: 5, 土: 0 },

    // 여름 (火旺)
    巳: { 火: 30, 土: 20, 木: 10, 水: 5, 金: 0 },
    午: { 火: 30, 土: 20, 木: 10, 水: 5, 金: 0 },
    未: { 火: 30, 土: 20, 木: 10, 水: 5, 金: 0 },

    // 가을 (金旺)
    申: { 金: 30, 水: 20, 土: 10, 火: 5, 木: 0 },
    酉: { 金: 30, 水: 20, 土: 10, 火: 5, 木: 0 },
    戌: { 金: 30, 水: 20, 土: 10, 火: 5, 木: 0 },

    // 겨울 (水旺)
    亥: { 水: 30, 木: 20, 金: 10, 土: 5, 火: 0 },
    子: { 水: 30, 木: 20, 金: 10, 土: 5, 火: 0 },
    丑: { 水: 30, 木: 20, 金: 10, 土: 5, 火: 0 },
};

/**
 * 득령 계산 (30점 만점)
 */
function calculateDeukryeong(
    ilgan: Stem,
    monthJiji: Branch
): number {
    const ilganElement = CHEONGAN_TO_WUXING[ilgan]?.element;
    if (!ilganElement) return 0;

    const scoreTable = WANGSEONG_SCORE[monthJiji];
    if (!scoreTable) return 0;

    return scoreTable[ilganElement] || 0;
}

/**
 * 득지 계산 (30점 만점)
 * 
 * 4개 지지에서 12운성 점수 합산 후 정규화
 */
function calculateDeukji(
    ilgan: Stem,
    jijis: Branch[]
): number {
    const runseongTable = SIBIIUNSEONG_TABLE[ilgan];
    if (!runseongTable) return 0;

    let totalScore = 0;
    jijis.forEach((jiji) => {
        const runseong = runseongTable[jiji];
        if (runseong) {
            totalScore += SIBIIUNSEONG_SCORE[runseong];
        }
    });

    // 최대 점수: 4 × 10 = 40점
    // 30점 만점으로 정규화
    return Math.min(30, Math.round((totalScore / 40) * 30));
}

/**
 * 득세 계산 (40점 만점)
 * 
 * 4개 천간에서 도와주는 글자 개수
 */
function calculateDeukse(
    ilgan: Stem,
    cheongans: Stem[]
): number {
    const ilganElement = CHEONGAN_TO_WUXING[ilgan]?.element;
    if (!ilganElement) return 0;

    // 오행 상생 관계
    const shengMap: Record<WuxingElement, WuxingElement> = {
        木: "火",
        火: "土",
        土: "金",
        金: "水",
        水: "木",
    };

    const shengReverseMap: Record<WuxingElement, WuxingElement> = {
        火: "木",
        土: "火",
        金: "土",
        水: "金",
        木: "水",
    };

    let helpCount = 0;
    cheongans.forEach((cheongan) => {
        const element = CHEONGAN_TO_WUXING[cheongan]?.element;
        if (!element) return;

        // 비겁 (같은 오행)
        if (element === ilganElement) {
            helpCount++;
        }
        // 인성 (생해주는 오행)
        else if (shengReverseMap[ilganElement] === element) {
            helpCount++;
        }
    });

    // 1개당 10점
    return Math.min(40, helpCount * 10);
}

/**
 * 일간 강약 점수 계산
 */
export function calculateGangYak(
    fourPillars: FourPillars
): GangYakScore {
    const ilgan = fourPillars.day.stem;
    const monthJiji = fourPillars.month.branch;

    const jijis = [
        fourPillars.year.branch,
        fourPillars.month.branch,
        fourPillars.day.branch,
        fourPillars.hour.branch,
    ];

    const cheongans = [
        fourPillars.year.stem,
        fourPillars.month.stem,
        // 일간 자신은 제외
        fourPillars.hour.stem,
    ];

    const deukryeong = calculateDeukryeong(ilgan, monthJiji);
    const deukji = calculateDeukji(ilgan, jijis);
    const deukse = calculateDeukse(ilgan, cheongans);

    const total = deukryeong + deukji + deukse;

    let level: GangYakScore["level"];
    let description: string;

    if (total >= 60) {
        level = "신강";
        description = "일간이 강합니다. 설기(泄氣)가 필요하며, 식상과 재성이 좋습니다.";
    } else if (total >= 40) {
        level = "중화";
        description = "일간이 균형잡혀 있습니다. 가장 이상적인 상태입니다.";
    } else {
        level = "신약";
        description = "일간이 약합니다. 생조(生助)가 필요하며, 인성과 비겁이 좋습니다.";
    }

    return {
        deukryeong,
        deukji,
        deukse,
        total,
        level,
        description,
    };
}


