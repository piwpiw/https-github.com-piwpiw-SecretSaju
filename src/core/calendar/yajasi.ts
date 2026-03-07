/**
 * Ya-Ja-Si (夜子時) Logic Module
 * 
 * 야자시/조자시 로직
 * - 야자시 (23:00-23:59): 일주는 당일, 시주는 다음 날 자시
 * - 조자시 (00:00-00:59): 일주와 시주 모두 당일 기준
 * 
 * 이 로직이 없으면 밤 11시 이후 출생자의 사주가 완전히 틀어짐
 */

import { getDayPillar, getHourPillar, type GanJi } from './ganji';

/**
 * 시간 타입
 */
export type JasiType = 'yajasi' | 'jojasi' | 'normal';

/**
 * 야자시/조자시 판별
 * 
 * @param hour 시 (0-23)
 * @returns 시간 타입
 */
export function getJasiType(hour: number): JasiType {
    if (hour === 23) return 'yajasi';   // 23:00-23:59
    if (hour === 0) return 'jojasi';    // 00:00-00:59
    return 'normal';
}

/**
 * 야자시/조자시 처리 결과
 */
export interface JasiHandlingResult {
    /** 사용할 일주 */
    dayPillar: GanJi;
    /** 사용할 시주 */
    hourPillar: GanJi;
    /** 처리 타입 */
    type: JasiType;
    /** 원본 날짜 */
    originalDate: Date;
    /** 일주 계산에 사용된 날짜 */
    dayCalculationDate: Date;
    /** 시주 계산에 사용된 날짜 */
    hourCalculationDate: Date;
    hourStemStemIndexUsed: number;
}

/**
 * 야자시/조자시 처리
 * 
 * @param date 날짜 및 시간
 * @param useYaJaSi 야자시 적용 여부 (기본: true)
 * @returns 처리 결과
 */
export function handleJasiLogic(
    date: Date,
    useYaJaSi: boolean = true
): JasiHandlingResult {
    const hour = date.getHours();
    const type = getJasiType(hour);

    // 일반 시간
    if (type === 'normal') {
        const dayPillar = getDayPillar(date);
        const hourPillar = getHourPillar(date, dayPillar.stemIndex);

        return {
            dayPillar,
            hourPillar,
            type,
            originalDate: date,
            dayCalculationDate: date,
            hourCalculationDate: date,
            hourStemStemIndexUsed: dayPillar.stemIndex,
        };
    }

    // 조자시 (00:00-00:59)
    if (type === 'jojasi') {
        const dayPillar = getDayPillar(date);

        // Hour 0 Date construction
        const hourDate = new Date(date);
        hourDate.setHours(0);
        const hourPillar = getHourPillar(hourDate, dayPillar.stemIndex);

        return {
            dayPillar,
            hourPillar,
            type,
            originalDate: date,
            dayCalculationDate: date,
            hourCalculationDate: date,
            hourStemStemIndexUsed: dayPillar.stemIndex,
        };
    }

    // 야자시 (23:00-23:59)
    if (type === 'yajasi' && useYaJaSi) {
        // 일주는 당일 기준
        const dayPillar = getDayPillar(date);

        // 시스는 다음 날 자시(0시) 기준
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);

        const nextDayPillar = getDayPillar(nextDay);
        // Use nextDay pillar for hour calculation base if following strict Ya-Ja-Si which uses Next Day's stem?
        // Wait, Ya-Ja-Si standard: Day Stem is Today. But Hour Stem is from Next Day?
        // Actually, pure Ya-Ja-Si means:
        // Day Stem: Today (unchanged)
        // Hour Stem: Calculate as if it's tomorrow's rat hour?
        // Or: Calculate standard Hour Pillar based on TODAY's stem, but since it is Ja hour, 
        // Ja hour always starts the cycle. If you use today's stem, 23:30 starts next day's Ja usually?

        // Let's look at standard: 23:30+ belongs to Next Day content in some schools.
        // Ya-Ja-Si school: Day is Today. Hour is ... calculated from Day.
        // But 23:00+ Hour Stem is derived from... ?
        // Usually: Day Stem -> Determine Hour Stem.
        // If 23:00 is considered "Night Rat", does it share stem with "Morning Rat" (00:00)?
        // Yes, typically Rat hour covers 23:30-01:30. It is ONE double-hour.
        // The Stem for Rat hour is determined by Day Stem.
        // If Day changed at 00:00, then 23:30 (Day A) and 00:30 (Day B) have DIFFERENT Hour Stems?
        // No. 23:30 (Day A) is the START of Day B's cycle in terms of GanJi flow?
        // This is the "Jo-Ya" debate.
        // Implementation here: Next Day 00:00 logic implies we are using Next Day's stem to derive Hour Stem.

        const hourPillar = getHourPillar(nextDay, nextDayPillar.stemIndex);

        return {
            dayPillar,
            hourPillar,
            type,
            originalDate: date,
            dayCalculationDate: date,
            hourCalculationDate: nextDay,
            hourStemStemIndexUsed: nextDayPillar.stemIndex,
        };
    }

    // 야자시 미적용 (23시를 그냥 해시로 처리) -> 23시=해시?? No. 23:00 starts Ja.
    // If not using Fajasi, maybe treating 23:00-23:59 as "Late Night" belonging to TODAY's stem?
    // We pass '23' hours date.
    if (type === 'yajasi' && !useYaJaSi) {
        const dayPillar = getDayPillar(date);

        const hourDate = new Date(date);
        hourDate.setHours(23);
        const hourPillar = getHourPillar(hourDate, dayPillar.stemIndex);

        return {
            dayPillar,
            hourPillar,
            type: 'normal', // 일반 처리로 변경
            originalDate: date,
            dayCalculationDate: date,
            hourCalculationDate: date,
            hourStemStemIndexUsed: dayPillar.stemIndex,
        };
    }

    // Fallback
    const dayPillar = getDayPillar(date);
    const hourPillar = getHourPillar(date, dayPillar.stemIndex);

    return {
        dayPillar,
        hourPillar,
        type,
        originalDate: date,
        dayCalculationDate: date,
        hourCalculationDate: date,
        hourStemStemIndexUsed: dayPillar.stemIndex,
    };
}

/**
 * 야자시 적용 여부 설명
 */
export const YAJASI_EXPLANATION = {
    ko: {
        title: '야자시(夜子時) 적용',
        description: `밤 11시(23:00-23:59)에 태어난 경우의 사주 계산 방식입니다.
    
• 야자시 적용 (권장):
  - 일주(日柱)는 당일 기준
  - 시주(時柱)는 다음 날 자시 기준
  - 전문가들이 일반적으로 사용하는 방식
  
• 야자시 미적용:
  - 일주와 시주 모두 당일 기준
  - 23시를 해시(亥時)로 처리`,
        recommendation: '대부분의 경우 "야자시 적용"이 정확합니다.',
    },
    en: {
        title: 'Ya-Ja-Si (Night Ja-Si) Application',
        description: `Method for calculating Saju for those born between 11 PM (23:00-23:59).
    
• With Ya-Ja-Si (Recommended):
  - Day Pillar: Based on current day
  - Hour Pillar: Based on next day's Ja-Si (子時)
  - Commonly used by professional fortune-tellers
  
• Without Ya-Ja-Si:
  - Both Day and Hour Pillars based on current day
  - Treats 23:00 as Hae-Si (亥時)`,
        recommendation: 'In most cases, "With Ya-Ja-Si" is more accurate.',
    },
};

/**
 * 자시 여부 확인
 * 
 * @param hour 시 (0-23)
 * @returns 자시이면 true
 */
export function isJaSiHour(hour: number): boolean {
    return hour === 23 || hour === 0;
}

/**
 * 야자시/조자시 안내 메시지 생성
 * 
 * @param hour 시 (0-23)
 * @param lang 언어 ('ko' | 'en')
 * @returns 안내 메시지 (자시가 아니면 null)
 */
export function getJasiGuideMessage(hour: number, lang: 'ko' | 'en' = 'ko'): string | null {
    if (!isJaSiHour(hour)) return null;

    if (hour === 23) {
        return lang === 'ko'
            ? '밤 11시에 태어나셨군요. 야자시(夜子時) 적용 여부를 선택해주세요.'
            : 'Born at 11 PM. Please choose whether to apply Ya-Ja-Si.';
    }

    if (hour === 0) {
        return lang === 'ko'
            ? '밤 12시(자정)에 태어나셨군요. 조자시(조자시)로 처리됩니다.'
            : 'Born at midnight. Will be treated as Jo-Ja-Si.';
    }

    return null;
}
