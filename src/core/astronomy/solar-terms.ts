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

import { earthHeliocentricLongitude, earthRadiusVector } from './vsop87-earth';
import { getDeltaTSeconds, approximateYearFromJulianDay } from './delta-t';

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
 * 한국 표준시(KST) 오프셋 (시간 단위)
 *
 * 이 모듈의 계산은 두 개의 서로 다른 시간축을 오간다.
 * - 천문 계산(태양 황경, 율리우스 적일)은 **세계시(UT)** 기준이다.
 * - 사주 엔진이 넘겨주는 `baseDateKST` 는 Date 의 로컬 필드에
 *   **KST 벽시계 값**을 담고 있다 (서버 타임존과 무관한 관례).
 *
 * 예전에는 이 둘을 그대로 비교했다. 그러면 2024년 입춘(KST 17:27)이
 * 08:12 로 취급되어, 그 사이(9시간)에 태어난 사람의 연주가 한 해 밀렸다.
 * 절기 시각은 KST 벽시계로 돌려주고, KST 입력은 UT 로 되돌린 뒤 계산한다.
 */
const KST_OFFSET_HOURS = 9;
const KST_OFFSET_DAYS = KST_OFFSET_HOURS / 24;

/**
 * 율리우스 날짜(Julian Day Number) 계산
 *
 * 천문학 계산에 사용되는 표준 날짜 시스템
 *
 * @param date 그레고리력 날짜 (로컬 필드를 UT 로 해석한다)
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

const DEG_PER_RAD = 180 / Math.PI;
const RAD_PER_DEG = Math.PI / 180;

/**
 * 태양 겉보기 황경 (0-360도).
 *
 * 절기는 태양의 *겉보기* 황경으로 정의된다. 기하 황경에서 장동(nutation)과
 * 광행차(aberration)를 뺀 값이다.
 *
 * 인자는 **세계시(UT)** 기준 율리우스 적일이다. 급수 자체는 지구시(TT)를
 * 요구하므로 내부에서 ΔT 만큼 옮겨 준다. 예전에는 이 구분이 없어 두 시간축을
 * 섞어 쓰고 있었다.
 *
 * @param jd 세계시(UT) 기준 율리우스 적일
 * @returns 태양 겉보기 황경 (0-360도)
 */
export function calculateSolarLongitude(jd: number): number {
    // UT → TT
    const jde = jd + getDeltaTSeconds(approximateYearFromJulianDay(jd)) / 86400;
    const T = (jde - 2451545.0) / 36525;

    // 지구에서 본 태양은 태양에서 본 지구의 정반대편에 있다
    let lambda = (earthHeliocentricLongitude(jde) * DEG_PER_RAD + 180) % 360;
    if (lambda < 0) lambda += 360;

    // VSOP87 좌표계를 FK5 로 맞춘다
    lambda += -0.09033 / 3600;

    // 장동 — 황경 방향 주요 4항
    const omega = 125.04452 - 1934.136261 * T;      // 달 승교점
    const sunMeanLon = 280.4665 + 36000.7698 * T;
    const moonMeanLon = 218.3165 + 481267.8813 * T;
    const nutation = (
        -17.20 * Math.sin(omega * RAD_PER_DEG)
        - 1.32 * Math.sin(2 * sunMeanLon * RAD_PER_DEG)
        - 0.23 * Math.sin(2 * moonMeanLon * RAD_PER_DEG)
        + 0.21 * Math.sin(2 * omega * RAD_PER_DEG)
    ) / 3600;

    // 광행차 — 빛이 오는 동안 지구가 움직인 만큼. 거리에 반비례한다
    const aberration = -20.4898 / 3600 / earthRadiusVector(jde);

    lambda += nutation + aberration;
    lambda %= 360;
    if (lambda < 0) lambda += 360;

    return lambda;
}

/**
 * 특정 태양 황경에 도달하는 시각 계산 (이분 탐색)
 *
 * 예전에는 황경 차이가 0.001도 안에 들면 즉시 반환했다. 태양은 하루에 약
 * 0.9856도를 움직이므로 0.001도는 **88초**다. 황경 계산이 아무리 정확해도
 * 여기서 잘려 나갔다. 실제로 VSOP87 로 바꾼 뒤에도 역서와 최대 87초가
 * 어긋났는데, 그게 이 조기 종료 때문이었다.
 *
 * 이제 구간 폭으로만 끝낸다. 1e-6일 = 0.086초.
 *
 * @param targetLongitude 목표 태양 황경 (0-360도)
 * @param year 연도
 * @returns 절기 시각 (KST 벽시계 기준)
 */
export function findSolarTermDate(targetLongitude: number, year: number): Date {
    // 검색 범위 설정 (해당 연도 전체)
    let startJD = dateToJulianDay(new Date(year, 0, 1, 0, 0, 0));
    let endJD = dateToJulianDay(new Date(year, 11, 31, 23, 59, 59));

    // 목표 황경이 연초(315-360도)인 경우, 전년도 12월부터 검색
    if (targetLongitude >= 285) {
        startJD = dateToJulianDay(new Date(year - 1, 11, 1, 0, 0, 0));
    }

    // 구간이 0.086초보다 좁아질 때까지 반으로 줄인다
    const toleranceDays = 1e-6;
    while (endJD - startJD > toleranceDays) {
        const midJD = (startJD + endJD) / 2;
        const diff = normalizeAngleDifference(targetLongitude, calculateSolarLongitude(midJD));

        if (diff > 0) {
            startJD = midJD;
        } else {
            endJD = midJD;
        }
    }

    // 계산은 세계시 축에서 했다. 벽시계로 돌려준다.
    return julianDayToDate((startJD + endJD) / 2 + KST_OFFSET_DAYS);
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
 * 절기를 황경 순으로 미리 정렬해 둔다. 태양 황경은 한 해 동안 0에서 360까지
 * 단조 증가하므로, "현재 황경 이하인 마지막 절기" 가 곧 지금 절기다.
 * 예전에는 호출마다 24개를 다시 정렬했다.
 */
const TERMS_BY_LONGITUDE = SOLAR_TERMS
    .map((term, index) => ({ ...term, index }))
    .sort((a, b) => a.longitude - b.longitude);

/**
 * 특정 날짜의 현재 절기 찾기
 *
 * @param date 날짜 (로컬 필드에 KST 벽시계 값이 담겨 있다)
 * @returns 현재 절기 정보
 */
export function getCurrentSolarTerm(date: Date): SolarTerm {
    // 입력은 KST 벽시계이므로 UT 로 되돌린 뒤 태양 황경을 구한다.
    const jd = dateToJulianDay(date) - KST_OFFSET_DAYS;
    const longitude = calculateSolarLongitude(jd);

    // 황경 0도(춘분)가 목록의 첫 항목이고 calculateSolarLongitude 는 0-360 을
    // 보장하므로, 최소 하나는 반드시 걸린다.
    let found = TERMS_BY_LONGITUDE[0];
    for (const term of TERMS_BY_LONGITUDE) {
        if (longitude < term.longitude) break;
        found = term;
    }

    return { ...found };
}

/**
 * 특정 연도의 모든 절기 날짜 계산
 * 
 * @param year 연도
 * @returns 24절기 날짜 목록
 */
/**
 * 연도별 절기표 캐시.
 *
 * VSOP87 은 저차 급수보다 항이 훨씬 많아 한 번 계산이 비싸다. 그런데
 * `isBeforeLichun`, `getSolarTermProximity`, `getMonthBranchIndex` 가 같은 해를
 * 반복해서 묻는다. 절기 시각은 연도만 정해지면 불변이므로 그대로 재사용한다.
 *
 * Date 는 가변이라 밖으로 내보낼 때 복사한다. 호출부가 setDate 같은 걸 하면
 * 캐시가 오염된다.
 */
const annualTermsCache = new Map<number, Array<SolarTerm & { date: Date }>>();

export function getAnnualSolarTerms(year: number): Array<SolarTerm & { date: Date }> {
    const cached = annualTermsCache.get(year);
    if (cached) {
        return cached.map((term) => ({ ...term, date: new Date(term.date.getTime()) }));
    }

    const computed = SOLAR_TERMS.map((term, index) => ({
        ...term,
        index,
        date: findSolarTermDate(term.longitude, year),
    }));

    annualTermsCache.set(year, computed);
    return computed.map((term) => ({ ...term, date: new Date(term.date.getTime()) }));
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

/**
 * 이 엔진이 계산한 절기 시각의 오차 한계 (분).
 *
 * 근거: VSOP87 절단 급수로 계산한 2024년 24절기를 한국천문연구원 역서와
 * 대조했을 때 평균 -1.0초, 최대 35.5초였다. 역서가 분 단위로 반올림돼 있어
 * 그 이하로는 잴 수 없다. 여유를 두어 2분으로 잡는다.
 *
 * (저차 급수를 쓰던 시절에는 최대 468초, 한계를 12분으로 두어야 했다.)
 *
 * 절입 경계에서 이만큼 안쪽에 태어난 사람에게는 월주가(입춘이면 연주까지)
 * 달라질 수 있다고 알려 준다. 조용히 한쪽으로 확정하면 틀렸을 때 알 방법이 없다.
 */
export const SOLAR_TERM_UNCERTAINTY_MINUTES = 2;

/** 절기 경계 근접 판정 결과 */
export interface SolarTermProximity {
    /** 가장 가까운 절기 */
    term: SolarTerm;
    /** 그 절기의 시각 (KST 벽시계) */
    termDate: Date;
    /** 경계까지 남은 시간. 음수면 이미 지났다 (분) */
    minutesFromBoundary: number;
    /** 오차 한계 안쪽인가 */
    withinUncertainty: boolean;
    /** 월주 경계를 정하는 절(節)인가. 중기(中氣)는 월주를 바꾸지 않는다 */
    isMonthBoundary: boolean;
}

/**
 * 주어진 시각이 절기 경계에 얼마나 가까운지 알려준다.
 *
 * @param date 날짜 (로컬 필드에 KST 벽시계 값)
 */
export function getSolarTermProximity(date: Date): SolarTermProximity {
    const year = date.getFullYear();

    // 연말·연초 경계를 놓치지 않도록 앞뒤 해까지 훑는다
    const candidates = [year - 1, year, year + 1].flatMap((y) => getAnnualSolarTerms(y));

    let nearest = candidates[0];
    let nearestGap = Math.abs(candidates[0].date.getTime() - date.getTime());
    for (const candidate of candidates) {
        const gap = Math.abs(candidate.date.getTime() - date.getTime());
        if (gap < nearestGap) {
            nearest = candidate;
            nearestGap = gap;
        }
    }

    const minutesFromBoundary = (nearest.date.getTime() - date.getTime()) / 60000;

    return {
        term: { name: nearest.name, nameEn: nearest.nameEn, longitude: nearest.longitude, season: nearest.season, index: nearest.index },
        termDate: nearest.date,
        minutesFromBoundary,
        withinUncertainty: Math.abs(minutesFromBoundary) <= SOLAR_TERM_UNCERTAINTY_MINUTES,
        // 절(節)은 절기 목록에서 짝수 인덱스다 (입춘 0, 경칩 2, 청명 4 ...)
        isMonthBoundary: nearest.index % 2 === 0,
    };
}
