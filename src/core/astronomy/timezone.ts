/**
 * Timezone & Summer Time Handling Module
 * 
 * 시간대 및 서머타임(Summer Time) 처리
 * - 한국 표준시(KST) = UTC+9
 * - 한국 서머타임 역사 (1948-1961, 1987-1988)
 * - UTC ↔ KST 변환
 */

/**
 * 한국 서머타임 기록
 * 
 * 출처: 
 * - 1948-1951: 미군정 시기
 * - 1955-1960: 대한민국 정부
 * - 1987-1988: 올림픽 준비
 */
interface SummerTimeRecord {
    year: number;
    /** 서머타임 시작 (MM-DD HH:mm) */
    start: string;
    /** 서머타임 종료 (MM-DD HH:mm) */
    end: string;
    /** 시간 조정 (분) */
    offsetMinutes: number;
}

/**
 * 한국 서머타임 역사 데이터
 */
const KOREA_SUMMER_TIME_HISTORY: SummerTimeRecord[] = [
    // 1948년 - 미군정
    { year: 1948, start: '06-01 00:00', end: '09-13 00:00', offsetMinutes: 60 },

    // 1949년
    { year: 1949, start: '04-03 00:00', end: '09-11 00:00', offsetMinutes: 60 },

    // 1950년 (6.25 전쟁으로 중단)
    { year: 1950, start: '04-01 00:00', end: '09-10 00:00', offsetMinutes: 60 },

    // 1951년
    { year: 1951, start: '05-06 00:00', end: '09-09 00:00', offsetMinutes: 60 },

    // 1955년
    { year: 1955, start: '05-05 00:00', end: '09-09 00:00', offsetMinutes: 60 },

    // 1956년
    { year: 1956, start: '05-20 00:00', end: '09-30 00:00', offsetMinutes: 60 },

    // 1957년
    { year: 1957, start: '05-05 00:00', end: '09-22 00:00', offsetMinutes: 60 },

    // 1958년
    { year: 1958, start: '05-04 00:00', end: '09-21 00:00', offsetMinutes: 60 },

    // 1959년
    { year: 1959, start: '05-03 00:00', end: '09-20 00:00', offsetMinutes: 60 },

    // 1960년
    { year: 1960, start: '05-01 00:00', end: '09-18 00:00', offsetMinutes: 60 },

    // 1987년 (서울 올림픽 준비)
    { year: 1987, start: '05-10 00:00', end: '10-11 00:00', offsetMinutes: 60 },

    // 1988년 (서울 올림픽)
    { year: 1988, start: '05-08 00:00', end: '10-09 00:00', offsetMinutes: 60 },
];

/**
 * 특정 날짜가 서머타임 기간인지 확인
 * 
 * @param date 확인할 날짜 (KST)
 * @returns 서머타임이면 true
 */
export function isKoreaSummerTime(date: Date): boolean {
    const year = date.getFullYear();
    const record = KOREA_SUMMER_TIME_HISTORY.find((r) => r.year === year);

    if (!record) return false;

    // 서머타임 시작/종료 날짜 생성
    const [startMonth, startDay, startHour, startMinute] = parseMMDDHHmm(record.start);
    const [endMonth, endDay, endHour, endMinute] = parseMMDDHHmm(record.end);

    const startDate = new Date(year, startMonth - 1, startDay, startHour, startMinute);
    const endDate = new Date(year, endMonth - 1, endDay, endHour, endMinute);

    return date >= startDate && date < endDate;
}

/**
 * 서머타임 보정 값 반환 (분 단위)
 * 
 * @param date 확인할 날짜
 * @returns 서머타임이면 60분, 아니면 0분
 */
export function getKoreaSummerTimeOffset(date: Date): number {
    return isKoreaSummerTime(date) ? 60 : 0;
}

/**
 * "MM-DD HH:mm" 형식 파싱
 */
function parseMMDDHHmm(str: string): [number, number, number, number] {
    const [datePart, timePart] = str.split(' ');
    const [month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    return [month, day, hour, minute];
}

/**
 * UTC → KST 변환
 * 
 * @param utcDate UTC 시간
 * @returns KST 시간
 */
export function utcToKST(utcDate: Date): Date {
    const kst = new Date(utcDate);

    // 기본 UTC+9
    kst.setHours(kst.getHours() + 9);

    // 서머타임 확인 및 추가 보정
    const summerTimeOffset = getKoreaSummerTimeOffset(kst);
    if (summerTimeOffset > 0) {
        kst.setMinutes(kst.getMinutes() + summerTimeOffset);
    }

    return kst;
}

/**
 * KST → UTC 변환
 * 
 * @param kstDate KST 시간
 * @returns UTC 시간
 */
export function kstToUTC(kstDate: Date): Date {
    const utc = new Date(kstDate);

    // 서머타임 확인
    const summerTimeOffset = getKoreaSummerTimeOffset(kstDate);

    // UTC로 변환 (KST = UTC+9 + 서머타임)
    const totalOffset = 9 * 60 + summerTimeOffset;
    utc.setMinutes(utc.getMinutes() - totalOffset);

    return utc;
}

/**
 * 시간대 정보
 */
export interface TimezoneInfo {
    /** 시간대 이름 */
    name: string;
    /** UTC 오프셋 (분) */
    offsetMinutes: number;
    /** 서머타임 여부 */
    isDST: boolean;
    /** 서머타임 오프셋 (분) */
    dstOffsetMinutes: number;
}

/**
 * KST 시간대 정보 반환
 * 
 * @param date 확인할 날짜
 * @returns KST 시간대 정보
 */
export function getKSTTimezoneInfo(date: Date): TimezoneInfo {
    const isDST = isKoreaSummerTime(date);
    const dstOffset = isDST ? 60 : 0;

    return {
        name: isDST ? 'KDT' : 'KST',
        offsetMinutes: 9 * 60 + dstOffset,
        isDST,
        dstOffsetMinutes: dstOffset,
    };
}

/**
 * 다른 시간대로 변환 (범용)
 * 
 * @param date 원본 날짜
 * @param fromOffsetMinutes 원본 UTC 오프셋 (분)
 * @param toOffsetMinutes 목표 UTC 오프셋 (분)
 * @returns 변환된 날짜
 */
export function convertTimezone(
    date: Date,
    fromOffsetMinutes: number,
    toOffsetMinutes: number
): Date {
    const result = new Date(date);
    const diff = toOffsetMinutes - fromOffsetMinutes;
    result.setMinutes(result.getMinutes() + diff);
    return result;
}

/**
 * 전 세계 주요 시간대 (UTC 오프셋, 분 단위)
 */
export const WORLD_TIMEZONES = {
    UTC: 0,
    KST: 9 * 60,          // 한국 표준시
    JST: 9 * 60,          // 일본 표준시
    CST: 8 * 60,          // 중국 표준시
    EST: -5 * 60,         // 미국 동부 표준시
    PST: -8 * 60,         // 미국 서부 표준시
    GMT: 0,               // 그리니치 표준시
    CET: 1 * 60,          // 중앙 유럽 시간
    IST: 5 * 60 + 30,     // 인도 표준시
    AEST: 10 * 60,        // 호주 동부 표준시
} as const;

/**
 * 서머타임 기록 전체 조회 (디버깅/관리자용)
 * 
 * @returns 한국 서머타임 역사 전체
 */
export function getKoreaSummerTimeHistory(): readonly SummerTimeRecord[] {
    return KOREA_SUMMER_TIME_HISTORY;
}
