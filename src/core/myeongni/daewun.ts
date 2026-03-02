/**
 * Daewun & Saewun Calculation Module
 */

import { getAnnualSolarTerms } from '../astronomy/solar-terms';
import { getGanJiFromIndex, type GanJi, type FourPillars } from '../calendar/ganji';

export interface DaewunInfo {
    startAge: number;
    pillars: Array<{
        pillar: GanJi;
        startAge: number;
        endAge: number;
        order: number;
    }>;
    isForward: boolean;
}

export interface SaewunInfo {
    year: number;
    pillar: GanJi;
    age: number;
}

export interface CurrentUnInfo {
    daewun: DaewunInfo['pillars'][0] | null;
    saewun: SaewunInfo;
    currentAge: number;
}

function isYangStem(stem: string): boolean {
    return ['갑', '병', '무', '경', '임'].includes(stem);
}

export function isDaewunForward(yearStem: string, gender: 'M' | 'F'): boolean {
    const isYang = isYangStem(yearStem);
    return (isYang && gender === 'M') || (!isYang && gender === 'F');
}

export function calculateDaewunStartAge(birthDate: Date, isForward: boolean): number {
    const year = birthDate.getFullYear();
    // Get solar terms for current and adjacent years to covers boundaries
    const solarTerms = [
        ...getAnnualSolarTerms(year - 1),
        ...getAnnualSolarTerms(year),
        ...getAnnualSolarTerms(year + 1)
    ];

    // Filter for 12 Jeol-gi (Major Solar Terms) that start a month
    const JEOL_GI_INDICES = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
    const jeolGiTerms = solarTerms.filter(t => JEOL_GI_INDICES.includes(t.index));
    
    // Sort by date
    jeolGiTerms.sort((a, b) => a.date.getTime() - b.date.getTime());

    let targetTermDate: Date | undefined;

    if (isForward) {
        // Forward: Find the first Jeol-gi AFTER birth
        targetTermDate = jeolGiTerms.find(term => term.date > birthDate)?.date;
    } else {
        // Backward: Find the first Jeol-gi BEFORE or EQUAL to birth
        const prevTerms = jeolGiTerms.filter(term => term.date <= birthDate);
        targetTermDate = prevTerms.length > 0 ? prevTerms[prevTerms.length - 1].date : undefined;
    }

    if (!targetTermDate) return 5; // Fallback

    const diffMs = Math.abs(targetTermDate.getTime() - birthDate.getTime());
    const totalDays = diffMs / (1000 * 60 * 60 * 24);
    
    // Professional conversion: 3 days = 1 year
    // (Total Days / 3)
    // We want the primary "Dae-wun Age" which is an integer (1 to 10)
    let daewunAge = Math.floor(totalDays / 3);
    const remainingDays = totalDays % 3;
    
    // Rounding logic: if remainder >= 1.5 days (which is 6 months), round up
    if (remainingDays >= 1.5) {
        daewunAge += 1;
    }
    
    // Dae-wun age is typically 1 to 10. If 0, it becomes 1 (or remains 0 in some systems, but 1 is standard for "starts at age 1")
    // Most professional systems use 1-10.
    if (daewunAge === 0) daewunAge = 1;

    return Math.min(10, daewunAge);
}

export function calculateDaewunPillars(monthPillar: GanJi, isForward: boolean, count: number = 9): GanJi[] {
    const pillars: GanJi[] = [];
    let currentIndex = monthPillar.ganjiIndex;

    for (let i = 0; i < count; i++) {
        if (isForward) {
            currentIndex = (currentIndex + 1) % 60;
        } else {
            currentIndex = (currentIndex - 1 + 60) % 60;
        }
        pillars.push(getGanJiFromIndex(currentIndex));
    }
    return pillars;
}

export function calculateDaewun(
    birthDate: Date,
    pillars: FourPillars,
    gender: 'M' | 'F'
): DaewunInfo {
    const isForward = isDaewunForward(pillars.year.stem, gender);
    const startAge = calculateDaewunStartAge(birthDate, isForward);
    const daewunPillars = calculateDaewunPillars(pillars.month, isForward);

    return {
        startAge,
        isForward,
        pillars: daewunPillars.map((pillar, index) => ({
            pillar,
            startAge: startAge + index * 10,
            endAge: startAge + (index + 1) * 10 - 1,
            order: index + 1,
        })),
    };
}

export function getDaewunAtAge(daewun: DaewunInfo, age: number): DaewunInfo['pillars'][0] | null {
    return daewun.pillars.find(d => age >= d.startAge && age <= d.endAge) || null;
}

export function calculateSaewun(year: number): GanJi {
    const REFERENCE_YEAR = 1984;
    const yearDiff = year - REFERENCE_YEAR;
    const yearIndex = ((0 + yearDiff) % 60 + 60) % 60;
    return getGanJiFromIndex(yearIndex);
}

export function getSaewunInfo(birthDate: Date, targetYear: number): SaewunInfo {
    const age = targetYear - birthDate.getFullYear(); // approx Korean age logic or simple age
    const pillar = calculateSaewun(targetYear);
    return { year: targetYear, pillar, age };
}

export function getCurrentUnInfo(birthDate: Date, pillars: FourPillars, gender: 'M' | 'F'): CurrentUnInfo {
    const now = new Date();
    const currentAge = now.getFullYear() - birthDate.getFullYear();
    const daewun = calculateDaewun(birthDate, pillars, gender);
    const currentDaewun = getDaewunAtAge(daewun, currentAge);
    const saewun = getSaewunInfo(birthDate, now.getFullYear());

    return {
        daewun: currentDaewun,
        saewun,
        currentAge
    };
}
