/**
 * Lunar-Solar Calendar Conversion Module
 *
 * Uses the runtime's Intl Chinese calendar support as the primary conversion source.
 * This avoids maintaining a partial static table and supports leap-month detection.
 */

export interface LunarDate {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
}

const CHINESE_CALENDAR_FORMATTER = new Intl.DateTimeFormat('en-u-ca-chinese', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
});

const MONTH_NAME_TO_NUMBER: Record<string, number> = {
    'First Month': 1,
    'Second Month': 2,
    'Third Month': 3,
    'Fourth Month': 4,
    'Fifth Month': 5,
    'Sixth Month': 6,
    'Seventh Month': 7,
    'Eighth Month': 8,
    'Ninth Month': 9,
    'Tenth Month': 10,
    'Eleventh Month': 11,
    'Twelfth Month': 12,
};

function buildUtcDate(year: number, month: number, day: number): Date {
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

function toLocalCivilDate(utcDate: Date): Date {
    return new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(), 0, 0, 0, 0);
}

function parseIntlLunarDate(date: Date): LunarDate {
    const parts = CHINESE_CALENDAR_FORMATTER.formatToParts(date);
    const monthPart = parts.find((part) => part.type === 'month')?.value ?? '';
    const dayPart = parts.find((part) => part.type === 'day')?.value ?? '';
    const yearPart = parts.find((part) => String(part.type) === 'relatedYear')?.value ?? '';

    const isLeapMonth = monthPart.includes('bis') || monthPart.startsWith('Leap ');
    const normalizedMonth = monthPart.replace('bis', '').replace(/^Leap\s+/, '').trim();
    const month = MONTH_NAME_TO_NUMBER[normalizedMonth];
    const day = Number.parseInt(dayPart, 10);
    const year = Number.parseInt(yearPart, 10);

    if (!Number.isFinite(month) || !Number.isFinite(day) || !Number.isFinite(year)) {
        throw new Error('[lunar-solar] Failed to parse Intl Chinese calendar parts');
    }

    return {
        year,
        month,
        day,
        isLeapMonth,
    };
}

function assertIntlSupport() {
    const probe = CHINESE_CALENDAR_FORMATTER.formatToParts(buildUtcDate(2024, 2, 10));
    if (!probe.some((part) => String(part.type) === 'relatedYear')) {
        throw new Error('[lunar-solar] Intl Chinese calendar support is unavailable in this runtime');
    }
}

/**
 * Converts Lunar Date to Solar Date.
 *
 * Searches across a safe window around the lunar year using the runtime's Chinese calendar formatter.
 */
export function lunarToSolar(lunar: LunarDate): Date {
    assertIntlSupport();

    const searchStart = buildUtcDate(lunar.year - 1, 11, 1);
    const searchEnd = buildUtcDate(lunar.year + 1, 3, 1);

    for (let cursor = searchStart.getTime(); cursor <= searchEnd.getTime(); cursor += 24 * 60 * 60 * 1000) {
        const candidateUtc = new Date(cursor);
        const parsed = parseIntlLunarDate(candidateUtc);
        if (
            parsed.year === lunar.year &&
            parsed.month === lunar.month &&
            parsed.day === lunar.day &&
            parsed.isLeapMonth === lunar.isLeapMonth
        ) {
            return toLocalCivilDate(candidateUtc);
        }
    }

    throw new Error(`[lunar-solar] No matching solar date found for lunar ${lunar.year}-${lunar.month}-${lunar.day}${lunar.isLeapMonth ? ' leap' : ''}`);
}

export function solarToLunar(solar: Date): LunarDate {
    assertIntlSupport();

    const utcDate = buildUtcDate(solar.getFullYear(), solar.getMonth() + 1, solar.getDate());
    return parseIntlLunarDate(utcDate);
}

/**
 * 12지신(쥐띠~돼지띠)을 한글/영문으로 매핑
 */
const ZODIAC_ANIMALS = [
    '쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지',
] as const;

const ZODIAC_ANIMALS_EN = [
    'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
] as const;

/**
 * 연도를 기준으로 십이지 띠 동물을 반환
 *
 * @param year 음력 연도
 * @param lang 언어 코드 (`ko` 또는 `en`)
 * @returns 띠 문자열
 */
export function getZodiacAnimal(year: number, lang: 'ko' | 'en' = 'ko'): string {
    const normalizedIndex = ((year - 4) % 12 + 12) % 12;
    return lang === 'ko' ? ZODIAC_ANIMALS[normalizedIndex] : ZODIAC_ANIMALS_EN[normalizedIndex];
}
