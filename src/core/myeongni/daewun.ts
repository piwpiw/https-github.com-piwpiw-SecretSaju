/**
 * Daewun & Saewun Calculation Module
 */

import { getAnnualSolarTerms } from '../astronomy/solar-terms';
import { getDayPillar, getGanJiFromIndex, getMonthPillar, getYearPillar, type GanJi, type FourPillars } from '../calendar/ganji';

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

export interface WolunInfo {
    year: number;
    month: number;
    pillar: GanJi;
}

export interface IlunInfo {
    date: string;
    pillar: GanJi;
}

export interface CurrentUnInfo {
    daewun: DaewunInfo['pillars'][0] | null;
    saewun: SaewunInfo;
    wolun: WolunInfo;
    ilun: IlunInfo;
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

    if (!targetTermDate) {
        // 앞뒤 3개년 절기를 모두 훑으므로 여기 도달하면 절기 데이터 자체가
        // 깨진 것이다. 조용히 임의값을 돌려주는 대신 즉시 드러낸다.
        throw new Error(`대운수 계산 실패: ${birthDate.toISOString()} 주변에서 절입을 찾지 못했습니다.`);
    }

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

/**
 * 달력 연도 라벨의 간지. "2026년은 병오년" 같은 연 단위 리포트용이다.
 * "지금 이 순간의 세운"은 입춘 경계를 타야 하므로 `calculateSaewunForDate` 를 쓴다.
 */
export function calculateSaewun(year: number): GanJi {
    const REFERENCE_YEAR = 1984;
    const yearDiff = year - REFERENCE_YEAR;
    const yearIndex = ((0 + yearDiff) % 60 + 60) % 60;
    return getGanJiFromIndex(yearIndex);
}

/**
 * 특정 시점의 세운. 세운의 해는 1월 1일이 아니라 입춘에 바뀐다 —
 * 매년 1월 1일~입춘 사이에는 전년도 간지가 세운이다. 연주와 같은 규칙이므로
 * `getYearPillar` 를 그대로 쓴다.
 */
export function calculateSaewunForDate(date: Date): GanJi {
    return getYearPillar(date);
}

export function getSaewunInfo(birthDate: Date, targetYear: number): SaewunInfo {
    // 세는나이: 태어난 해를 1세로 센다. 대운수(起運數)가 세는나이 진입
    // 나이이므로 여기서도 같은 규약을 쓴다.
    const age = targetYear - birthDate.getFullYear() + 1;
    const pillar = calculateSaewun(targetYear);
    return { year: targetYear, pillar, age };
}

export function calculateWolun(date: Date): GanJi {
    const yearPillar = getYearPillar(date);
    return getMonthPillar(date, yearPillar.stemIndex);
}

export function getWolunInfo(date: Date): WolunInfo {
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        pillar: calculateWolun(date),
    };
}

export function calculateIlun(date: Date): GanJi {
    return getDayPillar(date);
}

export function getIlunInfo(date: Date): IlunInfo {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return {
        date: `${yyyy}-${mm}-${dd}`,
        pillar: calculateIlun(date),
    };
}

export function getCurrentUnInfo(birthDate: Date, pillars: FourPillars, gender: 'M' | 'F'): CurrentUnInfo {
    const now = new Date();
    // 세는나이 (태어난 해 = 1세). 대운수가 세는나이 진입 나이이므로 현행
    // 대운 선택도 같은 규약이어야 한다. 예전에는 연나이(만 규약도 아닌
    // 단순 차)를 써서 대운 전환이 표준 만세력보다 1년 늦게 잡혔다.
    const currentAge = now.getFullYear() - birthDate.getFullYear() + 1;
    const daewun = calculateDaewun(birthDate, pillars, gender);
    const currentDaewun = getDaewunAtAge(daewun, currentAge);

    // 세운의 해는 입춘에 바뀐다. 1월 1일~입춘 사이에는 전년도 간지가 세운.
    const saewunPillar = calculateSaewunForDate(now);
    const saewunYear = saewunPillar.ganjiIndex === calculateSaewun(now.getFullYear()).ganjiIndex
        ? now.getFullYear()
        : now.getFullYear() - 1;
    const saewun: SaewunInfo = {
        year: saewunYear,
        pillar: saewunPillar,
        age: currentAge,
    };
    const wolun = getWolunInfo(now);
    const ilun = getIlunInfo(now);

    return {
        daewun: currentDaewun,
        saewun,
        wolun,
        ilun,
        currentAge
    };
}
