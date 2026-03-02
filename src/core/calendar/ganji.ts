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
    const ganjiIndex = SIXTY_GANJI.findIndex(
        g => g.stemIndex === monthStemIndex && g.branchIndex === monthBranchIndex
    );

    return SIXTY_GANJI[ganjiIndex];
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
 * Calculates Hour Pillar (Si-ju)
 * Based on Day Stem and Time.
 * 
 * Day Stem -> Hour Stem Start (for Ja-hour 23:30-01:30):
 * 甲(0)/己(5) -> 0 (甲子)
 * 乙(1)/庚(6) -> 2 (丙子)
 * 丙(2)/辛(7) -> 4 (戊子)
 * 丁(3)/壬(8) -> 6 (庚子)
 * 戊(4)/癸(9) -> 8 (壬子)
 * 
 * Formula: (DayStemIndex % 5 * 2) % 10 = Start Hour Stem Index
 */
export function getHourPillar(trueSolarDate: Date, dayStemIndex: number): GanJi {
    const hours = trueSolarDate.getHours();
    const minutes = trueSolarDate.getMinutes();

    // Determine Hour Branch (Zodiac Hour)
    // Ja: 23:30 - 01:29 (centered at 00:00)
    // Chuk: 01:30 - 03:29 (centered at 02:00)
    // ...
    // Index = floor((hours + 1) / 2) % 12
    // 23+1 = 24 / 2 = 12 % 12 = 0 (Ja)
    // 0+1 = 1 / 2 = 0 (Ja)
    // 1+1 = 2 / 2 = 1 (Chuk)
    // 12+1 = 13 / 2 = 6 (O)

    // Precise boundary:
    // Ja hour = 23:30-01:29, then every 2 hours.
    const minutesOfDay = hours * 60 + minutes;
    const shifted = (minutesOfDay - 90 + 1440) % 1440; // 01:30 -> 0
    const hourBranchIndex = (Math.floor(shifted / 120) + 1) % 12;

    // Calculate Hour Stem
    const startStemIndex = (dayStemIndex % 5 * 2) % 10;
    const hourStemIndex = (startStemIndex + hourBranchIndex) % 10;

    const ganjiIndex = SIXTY_GANJI.findIndex(
        g => g.stemIndex === hourStemIndex && g.branchIndex === hourBranchIndex
    );

    return SIXTY_GANJI[ganjiIndex];
}
