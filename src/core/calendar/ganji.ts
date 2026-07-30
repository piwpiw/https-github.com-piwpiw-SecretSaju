/**
 * Ganji (Sexagenary Cycle) Calculation Module
 * 
 * Determines the 60-Ganji pair (Stem + Branch) for each of the Four Pillars.
 * 
 * - Year Pillar (Nyeon-ju): Determined by Lichun (Start of Spring).
 * - Month Pillar (Wol-ju): Determined by Solar Terms (Jol-gi).
 * - Day Pillar (Il-ju): Continuous cycle from reference date.
 * - Hour Pillar (Si-ju): Determined by Day Stem and Time.
 */

import { isBeforeLichun, getSajuMonthIndex } from '../astronomy/solar-terms';

export type Stem = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';
export type Branch = '자' | '축' | '인' | '묘' | '진' | '사' | '오' | '미' | '신' | '유' | '술' | '해';

export interface GanJi {
    stem: Stem;
    branch: Branch;
    gan: Stem;   // Alias for stem
    ji: Branch;  // Alias for branch
    fullName: string; // e.g. "갑자"
    stemIndex: number;   // 0-9
    branchIndex: number; // 0-11
    ganjiIndex: number;  // 0-59 (0=Gapja, 59=Gyehae)
    code: string;        // e.g., "GAP_JA"
}

export interface FourPillars {
    year: GanJi;
    month: GanJi;
    day: GanJi;
    hour: GanJi;
}

export const STEMS: Stem[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
export const BRANCHES: Branch[] = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
const PILLAR_CODES: string[] = [
    "GAP_JA", "EUL_CHUK", "BYEONG_IN", "JEONG_MYO", "MU_JIN", "GI_SA", "GYEONG_O", "SIN_MI", "IM_SIN", "GYE_YU",
    "GAP_SUL", "EUL_HAE", "BYEONG_JA", "JEONG_CHUK", "MU_IN", "GI_MYO", "GYEONG_JIN", "SIN_SA", "IM_O", "GYE_MI",
    "GAP_SIN", "EUL_YU", "BYEONG_SUL", "JEONG_HAE", "MU_JA", "GI_CHUK", "GYEONG_IN", "SIN_MYO", "IM_JIN", "GYE_SA",
    "GAP_O", "EUL_MI", "BYEONG_SIN", "JEONG_YU", "MU_SUL", "GI_HAE", "GYEONG_JA", "SIN_CHUK", "IM_IN", "GYE_MYO",
    "GAP_JIN", "EUL_SA", "BYEONG_O", "JEONG_MI", "MU_SIN", "GI_YU", "GYEONG_SUL", "SIN_HAE", "IM_JA", "GYE_CHUK",
    "GAP_IN", "EUL_MYO", "BYEONG_JIN", "JEONG_SA", "MU_O", "GI_MI", "GYEONG_SIN", "SIN_YU", "IM_SUL", "GYE_HAE",
];

export const SIXTY_GANJI: GanJi[] = Array.from({ length: 60 }, (_, i) => {
    const stemIndex = i % 10;
    const branchIndex = i % 12;
    const stem = STEMS[stemIndex];
    const branch = BRANCHES[branchIndex];
    return {
        stem,
        branch,
        gan: stem,
        ji: branch,
        fullName: `${stem}${branch}`,
        stemIndex,
        branchIndex,
        ganjiIndex: i,
        code: PILLAR_CODES[i]
    };
});

/**
 * Returns GanJi from the 60-cycle index
 */
export function getGanJiFromIndex(index: number): GanJi {
    const safeIndex = ((index % 60) + 60) % 60;
    return SIXTY_GANJI[safeIndex];
}

/**
 * Calculates the Year Pillar (Nyeon-ju)
 * @param date Birth date
 * @returns Year GanJi
 */
export function getYearPillar(date: Date): GanJi {
    let year = date.getFullYear();

    // If before Lichun (approx Feb 4), it belongs to previous year
    if (isBeforeLichun(date)) {
        year -= 1;
    }

    // 1984 was Gapja (0) year.
    // Formula: (year - 1984) % 60. Or simpler: (year - 4) % 60
    // Note: Handle negative modulo correctly
    const offset = (year - 4) % 60;
    const ganjiIndex = offset >= 0 ? offset : offset + 60;

    return SIXTY_GANJI[ganjiIndex];
}

/**
 * Calculates the Month Pillar (Wol-ju)
 * Formula: Derived from Year Stem and Saju Month Index
 * 
 * Year Stem -> Month Stem Start Index:
 * 甲(0)/己(5) -> 2 (丙寅 start)
 * 乙(1)/庚(6) -> 4 (戊寅 start)
 * 丙(2)/辛(7) -> 6 (庚寅 start)
 * 丁(3)/壬(8) -> 8 (壬寅 start)
 * 戊(4)/癸(9) -> 0 (甲寅 start)
 * 
 * Formula: (YearStemIndex % 5 * 2 + 2) % 10 = Start Month Stem Index
 */
export function getMonthPillar(date: Date, yearStemIndex: number): GanJi {
    const monthBranchIndex = getSajuMonthIndex(date); // 0=Ja, 1=Chuk, 2=In... (Absolute Index)

    // Calculate Month Stem
    // Base stem for the first month (In-month) of the year
    const startStemIndex = (yearStemIndex % 5 * 2 + 2) % 10;

    // Calculate offset from In-month (Branch 2)
    // In(2)->0, Myo(3)->1, ... Ja(0)->10, Chuk(1)->11
    const monthOffset = (monthBranchIndex - 2 + 12) % 12;

    const monthStemIndex = (startStemIndex + monthOffset) % 10;

    // Find combined GanJi index
    return SIXTY_GANJI[getGanJiIndex(monthStemIndex, monthBranchIndex)];
}

/**
 * Calculates Day Pillar (Il-ju)
 * Based on continuous count from a reference date.
 * Reference: 2000-01-01 was Wu-Wu (戊午, index 54)
 */
export function getDayPillar(date: Date): GanJi {
    const referenceDate = new Date(Date.UTC(2000, 0, 1)); // Jan 1 2000 UTC
    const referenceIndex = 54; // 戊午

    // Normalize date to UTC midnight to avoid timezone issues for day diff
    const targetDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    const diffTime = targetDate.getTime() - referenceDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const offset = (referenceIndex + diffDays) % 60;
    const ganjiIndex = offset >= 0 ? offset : offset + 60;

    return SIXTY_GANJI[ganjiIndex];
}

/**
 * 시지 경계를 어느 시계 위에서 자를지 정하는 기준.
 *
 * - `true-solar`: 이미 진태양시로 환산된 시각을 받는다. 자시는 23:00-00:59.
 * - `kst-civil` : 보정 없는 한국 표준시(KST) 시계를 받는다. 서울은 표준경도
 *                 135도보다 약 8도 서쪽이라 남중이 30분쯤 늦으므로, 자시를
 *                 23:30-01:29 로 잡는 관례를 쓴다.
 *
 * 두 보정을 겹쳐 쓰면 안 된다. 예전에는 진태양시로 환산한 시각에 30분 관례를
 * 한 번 더 적용해서, 시 경계 30분 안에 태어난 사람의 시주가 한 칸씩 밀렸다.
 */
export type HourBoundaryMode = 'true-solar' | 'kst-civil';

/**
 * 자시가 시작하는 시각을 자정 기준 분으로 돌려준다.
 *
 * 시지 경계를 판단하는 곳이 두 군데(여기와 야자시 판별)라서, 예전에는 한쪽이
 * 23:00 을 쓰고 다른 쪽이 23:30 을 쓰는 일이 생겼다. 기준을 한 곳에서만
 * 정의해 두 곳이 갈라지지 않게 한다.
 */
export function getJaSiStartMinutes(boundary: HourBoundaryMode): number {
    return boundary === 'true-solar' ? 23 * 60 : 23 * 60 + 30;
}

/**
 * 천간·지지 인덱스 쌍으로 60갑자 인덱스를 구한다.
 *
 * 천간은 10, 지지는 12 주기이고 최소공배수가 60이므로, 짝이 맞는 조합은
 * 60개뿐이다(홀짝이 어긋난 조합은 존재하지 않는다). 예전에는 `findIndex` 로
 * 훑었는데, 없는 조합이 들어오면 -1 이 나와 `SIXTY_GANJI[-1]` 즉 undefined 를
 * 그대로 반환했다. 지금까지 그런 조합이 들어온 적은 없지만, 조용히 undefined 를
 * 흘리는 경로는 남겨 둘 이유가 없다.
 *
 * 중국인의 나머지 정리로 직접 구하고, 짝이 안 맞으면 즉시 던진다.
 */
export function getGanJiIndex(stemIndex: number, branchIndex: number): number {
    const s = ((stemIndex % 10) + 10) % 10;
    const b = ((branchIndex % 12) + 12) % 12;

    if ((s - b) % 2 !== 0) {
        throw new Error(
            `존재하지 않는 간지 조합입니다: 천간 ${s}(${STEMS[s]}) · 지지 ${b}(${BRANCHES[b]}). ` +
            '천간과 지지는 홀짝이 같아야 합니다.'
        );
    }

    // i ≡ s (mod 10), i ≡ b (mod 12) 를 만족하는 0..59 의 유일한 i
    for (let i = s; i < 60; i += 10) {
        if (i % 12 === b) return i;
    }

    // 위 반복은 짝이 맞으면 반드시 답을 찾는다. 여기까지 오면 논리가 깨진 것이다.
    throw new Error(`간지 인덱스를 찾지 못했습니다: ${s}, ${b}`);
}

/**
 * Calculates Hour Pillar (Si-ju)
 * Based on Day Stem and Time.
 *
 * Day Stem -> Hour Stem Start (for Ja-hour):
 * 甲(0)/己(5) -> 0 (甲子)
 * 乙(1)/庚(6) -> 2 (丙子)
 * 丙(2)/辛(7) -> 4 (戊子)
 * 丁(3)/壬(8) -> 6 (庚子)
 * 戊(4)/癸(9) -> 8 (壬子)
 *
 * Formula: (DayStemIndex % 5 * 2) % 10 = Start Hour Stem Index
 *
 * @param baseTime 시지를 자를 기준 시각
 * @param dayStemIndex 일간 인덱스 (0-9)
 * @param boundary 경계 기준. 기본값은 보정 없는 KST 시계(23:30 자시)
 */
export function getHourPillar(
    baseTime: Date,
    dayStemIndex: number,
    boundary: HourBoundaryMode = 'kst-civil'
): GanJi {
    const hours = baseTime.getHours();
    const minutes = baseTime.getMinutes();

    // 자시의 시작점을 자정 기준 분으로 표현한다.
    // 진태양시 기준이면 23:00, KST 시계 기준이면 23:30.
    const jaStartMinutes = getJaSiStartMinutes(boundary);

    const minutesOfDay = hours * 60 + minutes;
    const shifted = (minutesOfDay - jaStartMinutes + 1440) % 1440; // 자시 시작 -> 0
    const hourBranchIndex = Math.floor(shifted / 120) % 12;

    // Calculate Hour Stem
    const startStemIndex = (dayStemIndex % 5 * 2) % 10;
    const hourStemIndex = (startStemIndex + hourBranchIndex) % 10;

    return SIXTY_GANJI[getGanJiIndex(hourStemIndex, hourBranchIndex)];
}
