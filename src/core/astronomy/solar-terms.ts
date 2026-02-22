/**
 * Solar Terms (24 節氣) Calculation Module
 * 
 * 24절기 계산 엔진
 * - 태양 황경(Solar Longitude) 기반
 * - 입춘부터 대한까지 24개 절기
 * - 월주(月柱) 결정에 사용
 * 
 * Reference:
 * - 한국천문연구원(KASI) 역서 자료
 * - "Astronomical Algorithms" by Jean Meeus
 */

/**
 * 24절기 이름 및 태양 황경
 */
export const SOLAR_TERMS = [
    // 봄 (春)
    { name: '입춘', nameEn: 'Ipchun', longitude: 315, season: 'spring' },
    { name: '우수', nameEn: 'Usu', longitude: 330, season: 'spring' },
    { name: '경칩', nameEn: 'Gyeongchip', longitude: 345, season: 'spring' },
    { name: '춘분', nameEn: 'Chunbun', longitude: 0, season: 'spring' },
    { name: '청명', nameEn: 'Cheongmyeong', longitude: 15, season: 'spring' },
    { name: '곡우', nameEn: 'Gogu', longitude: 30, season: 'spring' },

    // 여름 (夏)
    { name: '입하', nameEn: 'Ipha', longitude: 45, season: 'summer' },
    { name: '소만', nameEn: 'Soman', longitude: 60, season: 'summer' },
    { name: '망종', nameEn: 'Mangjong', longitude: 75, season: 'summer' },
    { name: '하지', nameEn: 'Haji', longitude: 90, season: 'summer' },
    { name: '소서', nameEn: 'Soseo', longitude: 105, season: 'summer' },
    { name: '대서', nameEn: 'Daeseo', longitude: 120, season: 'summer' },

    // 가을 (秋)
    { name: '입추', nameEn: 'Ipchu', longitude: 135, season: 'autumn' },
    { name: '처서', nameEn: 'Cheoseo', longitude: 150, season: 'autumn' },
    { name: '백로', nameEn: 'Baengno', longitude: 165, season: 'autumn' },
    { name: '추분', nameEn: 'Chubun', longitude: 180, season: 'autumn' },
    { name: '한로', nameEn: 'Hanno', longitude: 195, season: 'autumn' },
    { name: '상강', nameEn: 'Sanggang', longitude: 210, season: 'autumn' },

    // 겨울 (冬)
    { name: '입동', nameEn: 'Ipdong', longitude: 225, season: 'winter' },
    { name: '소설', nameEn: 'Soseol', longitude: 240, season: 'winter' },
    { name: '대설', nameEn: 'Daeseol', longitude: 255, season: 'winter' },
    { name: '동지', nameEn: 'Dongji', longitude: 270, season: 'winter' },
    { name: '소한', nameEn: 'Sohan', longitude: 285, season: 'winter' },
    { name: '대한', nameEn: 'Daehan', longitude: 300, season: 'winter' },
] as const;

/**
 * 절기 정보
 */
export interface SolarTerm {
    /** 절기 이름 (한글) */
    name: string;
    /** 절기 이름 (영문) */
    nameEn: string;
    /** 태양 황경 (0-359도) */
    longitude: number;
    /** 계절 */
    season: 'spring' | 'summer' | 'autumn' | 'winter';
    /** 절기 번호 (0-23) */
    index: number;
}

/**
 * 율리우스 날짜(Julian Day Number) 계산
 * 
 * 천문학 계산에 사용되는 표준 날짜 시스템
 * 
 * @param date 그레고리력 날짜
 * @returns 율리우스 날짜
 */
export function dateToJulianDay(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    let y = year;
    let m = month;

    if (month <= 2) {
        y = year - 1;
        m = month + 12;
    }

    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);

    const jd =
        Math.floor(365.25 * (y + 4716)) +
        Math.floor(30.6001 * (m + 1)) +
        day +
        b -
        1524.5 +
        (hour + minute / 60 + second / 3600) / 24;

    return jd;
}

/**
 * 율리우스 날짜를 그레고리력으로 변환
 * 
 * @param jd 율리우스 날짜
 * @returns 그레고리력 날짜
 */
export function julianDayToDate(jd: number): Date {
    const z = Math.floor(jd + 0.5);
    const f = jd + 0.5 - z;

    let a = z;
    if (z >= 2299161) {
        const alpha = Math.floor((z - 1867216.25) / 36524.25);
        a = z + 1 + alpha - Math.floor(alpha / 4);
    }

    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);

    const day = b - d - Math.floor(30.6001 * e) + f;
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;

    const dayInt = Math.floor(day);
    const timeFraction = day - dayInt;

    const hour = Math.floor(timeFraction * 24);
    const minute = Math.floor((timeFraction * 24 - hour) * 60);
    const second = Math.floor(((timeFraction * 24 - hour) * 60 - minute) * 60);

    return new Date(year, month - 1, dayInt, hour, minute, second);
}

/**
 * 태양 황경 계산 (근사 공식)
 * 
 * @param jd 율리우스 날짜
 * @returns 태양 황경 (0-360도)
 */
export function calculateSolarLongitude(jd: number): number {
    // J2000.0 기준 (2000년 1월 1일 12시 UTC)
    const T = (jd - 2451545.0) / 36525.0;

    // 태양 평균 황경 (L0)
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;

    // 태양 평균 근점이각 (M)
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const Mrad = M * (Math.PI / 180);

    // 이심률 보정
    const C =
        (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
        (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
        0.000289 * Math.sin(3 * Mrad);

    // 태양 진황경
    let lambda = L0 + C;

    // 0-360 범위로 정규화
    lambda = lambda % 360;
    if (lambda < 0) lambda += 360;

    return lambda;
}

/**
 * 특정 태양 황경에 도달하는 날짜 계산 (이분 탐색)
 * 
 * @param targetLongitude 목표 태양 황경 (0-360도)
 * @param year 연도
 * @returns 절기 날짜
 */
export function findSolarTermDate(targetLongitude: number, year: number): Date {
    // 검색 범위 설정 (해당 연도 전체)
    let startJD = dateToJulianDay(new Date(year, 0, 1, 0, 0, 0));
    let endJD = dateToJulianDay(new Date(year, 11, 31, 23, 59, 59));

    // 목표 황경이 연초(315-360도)인 경우, 전년도 12월부터 검색
    if (targetLongitude >= 285) {
        startJD = dateToJulianDay(new Date(year - 1, 11, 1, 0, 0, 0));
    }

    // 이분 탐색
    const tolerance = 0.00001; // 약 1초 정밀도

    while (endJD - startJD > tolerance) {
        const midJD = (startJD + endJD) / 2;
        const longitude = calculateSolarLongitude(midJD);

        // 황경이 0도를 넘어가는 경우 처리
        const diff = normalizeAngleDifference(targetLongitude, longitude);

        if (Math.abs(diff) < 0.001) {
            // 충분히 가까우면 종료
            return julianDayToDate(midJD);
        }

        if (diff > 0) {
            startJD = midJD;
        } else {
            endJD = midJD;
        }
    }

    return julianDayToDate((startJD + endJD) / 2);
}

/**
 * 각도 차이 정규화 (-180 ~ 180)
 */
function normalizeAngleDifference(target: number, current: number): number {
    let diff = target - current;

    // 0도 경계 처리 (예: 목표 5도, 현재 355도 → diff = 10도)
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    return diff;
}

/**
 * 특정 날짜의 현재 절기 찾기
 * 
 * @param date 날짜
 * @returns 현재 절기 정보
 */
export function getCurrentSolarTerm(date: Date): SolarTerm {
    const jd = dateToJulianDay(date);
    const longitude = calculateSolarLongitude(jd);

    // Sort terms by longitude for searching
    // 0(Chunbun) -> ... -> 345(Gyeongchip)
    // Note: The cycle resets at 0.
    // If longitude is 0-360.

    // Create lookup array sorted by longitude
    const sortedTerms = [...SOLAR_TERMS].sort((a, b) => a.longitude - b.longitude);

    // Find the term with the largest longitude <= current longitude
    let candidateIndex = -1;

    for (let i = 0; i < sortedTerms.length; i++) {
        if (longitude >= sortedTerms[i].longitude) {
            candidateIndex = i;
        } else {
            // Since sorted, once we exceed, we stop (if valid candidate found)
            break;
        }
    }

    // If candidate found, return it
    if (candidateIndex !== -1) {
        // Special case: If longitude is 359, it matches 345 (last term in sorted).
        // If longitude is 0, it matches 0.
        // Seems correct.

        // However, we need to map back to the original index?
        // sortedTerms[i] is the term object.
        // We need to return it with its ORIGINAL index in SOLAR_TERMS.
        // SOLAR_TERMS order is fixed.
        // We can find the index in SOLAR_TERMS easily.
        const foundTerm = sortedTerms[candidateIndex];
        const originalIndex = SOLAR_TERMS.findIndex(t => t.name === foundTerm.name);
        return {
            ...foundTerm,
            index: originalIndex
        };
    }

    // If NO candidate found (e.g. longitude < 0?? Should not happen 0-360).
    // Or if longitude < 0 (first term is 0).
    // If calculateSolarLongitude returns negative? It normalizes to 0-360.
    // But if it returns 359.99. Sorted list ends at 345.
    // It returns 345. Correct.

    // Wait. If longitude is 350. Match 345.
    // Gyeongchip (345).
    // Correct.

    // If longitude < 0? No.
    // So candidateIndex should always be found unless list empty.
    // Default to last element if something weird logic?
    // Actually, if list is [0, 15, ..., 345].
    // Any L >= 0 will match at least index 0.
    // So safe.

    // Fallback
    return {
        ...SOLAR_TERMS[0], // Should not reach
        index: 0
    };
}

/**
 * 특정 연도의 모든 절기 날짜 계산
 * 
 * @param year 연도
 * @returns 24절기 날짜 목록
 */
export function getAnnualSolarTerms(year: number): Array<SolarTerm & { date: Date }> {
    return SOLAR_TERMS.map((term, index) => ({
        ...term,
        index,
        date: findSolarTermDate(term.longitude, year),
    }));
}

/**
 * 절기에 따른 월간지(月干支) 인덱스 반환
 * 
 * 입춘(0) → 인월(2)
 * 경칩(2) → 묘월(3)
 * 청명(4) → 진월(4)
 * ...
 * 
 * @param solarTermIndex 절기 인덱스 (0-23)
 * @returns 지지 인덱스 (0-11)
 */
export function getMonthBranchIndexFromSolarTerm(solarTermIndex: number): number {
    // 절기 2개당 1개월
    // 입춘(0) → 인월(2)
    // 경칩(2) → 묘월(3)
    // 청명(4) → 진월(4)
    const monthIndex = Math.floor(solarTermIndex / 2);

    // 인월부터 시작 (지지 인덱스 2)
    return (monthIndex + 2) % 12;
}

/**
 * 특정 날짜의 월지 인덱스 계산
 * 
 * @param date 날짜
 * @returns 월지 인덱스 (0-11)
 */
export function getMonthBranchIndex(date: Date): number {
    const currentTerm = getCurrentSolarTerm(date);
    return getMonthBranchIndexFromSolarTerm(currentTerm.index);
}

/**
 * Alias for getMonthBranchIndex
 */
export const getSajuMonthIndex = getMonthBranchIndex;

/**
 * Checks if a date is before Lichun (Start of Spring) of that year.
 * Precise calculation based on Solar Longitude.
 * 
 * @param date Birth date
 * @returns true if before Lichun (belongs to previous year)
 */
export function isBeforeLichun(date: Date): boolean {
    const year = date.getFullYear();
    const lichunList = getAnnualSolarTerms(year);
    const lichun = lichunList.find(t => t.name === '입춘');

    if (!lichun) return false; // Should not happen

    return date.getTime() < lichun.date.getTime();
}
