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
    const solarTerms = getAnnualSolarTerms(year);
    if (!solarTerms.length) return 5; // Fallback

    const allTerms = solarTerms; // Use all 24 terms

    // Sort terms by date just in case
    // assuming solarTerms are sorted.

    let targetTerm: Date | undefined;

    if (isForward) {
        targetTerm = allTerms.find(term => term.date > birthDate)?.date || allTerms[0].date;
    } else {
        const prevTerms = allTerms.filter(term => term.date <= birthDate);
        targetTerm = prevTerms.length > 0 ? prevTerms[prevTerms.length - 1].date : allTerms[allTerms.length - 1].date;
    }

    const diffMs = Math.abs(targetTerm.getTime() - birthDate.getTime());
    const diffDays = diffMs / (24 * 60 * 60 * 1000); // Floating point days
    const daewunStartAge = Math.round(diffDays / 3);

    return Math.min(10, Math.max(0, daewunStartAge));
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
