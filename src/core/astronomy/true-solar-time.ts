/**
 * True Solar Time Calculation Module
 * 
 * 진태양시(眞太陽時) 계산 엔진
 * - 균시차(Equation of Time, EOT) 보정
 * - 경도(Longitude) 보정
 * - 표준시 → 진태양시 변환
 * 
 * Reference:
 * - "Astronomical Algorithms" by Jean Meeus
 * - NOAA Solar Calculator: https://www.esrl.noaa.gov/gmd/grad/solcalc/calcdetails.html
 */

/**
 * 위치 정보
 */
export interface Location {
    latitude: number;   // 위도 (-90 ~ 90, 북위 양수)
    longitude: number;  // 경도 (-180 ~ 180, 동경 양수)
}

/**
 * 한국 주요 도시 위치 정보
 */
export const KOREA_LOCATIONS = {
    SEOUL: { latitude: 37.5665, longitude: 126.9780 },
    BUSAN: { latitude: 35.1796, longitude: 129.0756 },
    INCHEON: { latitude: 37.4563, longitude: 126.7052 },
    DAEGU: { latitude: 35.8714, longitude: 128.6014 },
    DAEJEON: { latitude: 36.3504, longitude: 127.3845 },
    GWANGJU: { latitude: 35.1595, longitude: 126.8526 },
    ULSAN: { latitude: 35.5384, longitude: 129.3114 },
    JEJU: { latitude: 33.4996, longitude: 126.5312 },
    SEJONG: { latitude: 36.4800, longitude: 127.2890 },
} as const;

/**
 * 한국 표준 경도 (KST = UTC+9 기준)
 */
const KOREA_STANDARD_LONGITUDE = 135.0;

/**
 * 1년의 일수를 반환 (윤년 고려)
 */
function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 날짜의 연중 일수(Day of Year) 계산
 * @param date 날짜
 * @returns 1월 1일 = 1, 12월 31일 = 365 or 366
 */
export function getDayOfYear(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay) + 1;
}

/**
 * 균시차(Equation of Time, EOT) 계산
 * 
 * 지구 공전 궤도가 타원이고 자전축이 기울어져 있어 발생하는 시간 차이.
 * 평균 태양시와 진태양시의 차이를 분 단위로 반환.
 * 
 * 공식 (NOAA 기준):
 * B = (360/365) × (dayOfYear - 81) in degrees
 * EOT = 9.87 × sin(2B) - 7.53 × cos(B) - 1.5 × sin(B) (분 단위)
 * 
 * @param dayOfYear 연중 일수 (1-365 or 366)
 * @returns 균시차 (분 단위, -14 ~ +16분)
 */
export function calculateEOT(dayOfYear: number): number {
    // B는 라디안 단위로 변환
    const B = ((360 / 365) * (dayOfYear - 81)) * (Math.PI / 180);

    // EOT 계산 (분 단위)
    const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

    return eot;
}

/**
 * 경도 보정값 계산
 * 
 * 표준 경도와 실제 관측 지점의 경도 차이를 시간으로 환산.
 * 경도 1도 = 4분 차이 (360도 = 24시간)
 * 
 * @param longitude 실제 경도 (동경 양수)
 * @param standardLongitude 표준 경도 (한국: 135.0°)
 * @returns 보정값 (분 단위, 서쪽이면 양수)
 */
export function calculateLongitudeOffset(
    longitude: number,
    standardLongitude: number = KOREA_STANDARD_LONGITUDE
): number {
    // 경도 1도당 4분
    // 서쪽(작은 경도)에 있을수록 해가 늦게 뜨므로 시간을 더해야 함? NO.
    // 진태양시 = 평균태양시 + 보정
    // 135도(표준)에서 12시일 때, 127도(서울)는 아직 해가 남중하지 않음. 즉 진태양시는 12시 이전임.
    // 따라서 135 - 127 = 8도 차이. 8 * 4 = 32분.
    // 표준시 12:00 -> 진태양시 11:28 (약 32분 뺴야 함)

    // 공식: (Local Longitude - Standard Longitude) * 4 minutes
    // (127 - 135) * 4 = -8 * 4 = -32분. 맞음.

    return (longitude - standardLongitude) * 4;
}

/**
 * 표준시를 진태양시로 변환
 * 
 * 진태양시 = 표준시 + 경도 보정 + 균시차
 * 
 * @param standardTime 표준시 (예: KST)
 * @param location 관측 위치
 * @returns 진태양시
 */
export function calculateTrueSolarTime(
    standardTime: Date,
    location: Location
): Date {
    // 1. 경도 보정 계산
    const longitudeOffset = calculateLongitudeOffset(location.longitude);

    // 2. 균시차 계산
    const dayOfYear = getDayOfYear(standardTime);
    const eot = calculateEOT(dayOfYear);

    // 3. 총 보정값 (분 단위)
    const totalOffsetMinutes = longitudeOffset + eot;

    // 4. 진태양시 계산
    const trueSolarTime = new Date(standardTime);
    trueSolarTime.setMinutes(trueSolarTime.getMinutes() + totalOffsetMinutes);

    return trueSolarTime;
}

/**
 * Alias for calculateTrueSolarTime for backward compatibility/consistency
 */
export const getTrueSolarTime = calculateTrueSolarTime;

/**
 * 진태양시 상세 정보 인터페이스
 */
export interface TrueSolarTimeDetails {
    /** 원본 표준시 */
    standardTime: Date;
    /** 계산된 진태양시 */
    trueSolarTime: Date;
    /** 경도 보정값 (분) */
    longitudeOffset: number;
    /** 균시차 (분) */
    eot: number;
    /** 총 보정값 (분) */
    totalOffset: number;
    /** 연중 일수 */
    dayOfYear: number;
    /** 위치 정보 */
    location: Location;
}

/**
 * 진태양시 계산 (상세 정보 포함)
 * 
 * @param standardTime 표준시
 * @param location 관측 위치
 * @returns 진태양시 상세 정보
 */
export function calculateTrueSolarTimeWithDetails(
    standardTime: Date,
    location: Location
): TrueSolarTimeDetails {
    const dayOfYear = getDayOfYear(standardTime);
    const longitudeOffset = calculateLongitudeOffset(location.longitude);
    const eot = calculateEOT(dayOfYear);
    const totalOffset = longitudeOffset + eot;

    const trueSolarTime = new Date(standardTime);
    trueSolarTime.setMinutes(trueSolarTime.getMinutes() + totalOffset);

    return {
        standardTime,
        trueSolarTime,
        longitudeOffset,
        eot,
        totalOffset,
        dayOfYear,
        location,
    };
}
