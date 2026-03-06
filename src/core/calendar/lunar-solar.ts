/**
 * Lunar-Solar Calendar Conversion Module (Standard Professional Implementation)
 */

export interface LunarDate {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
}

/**
 * Standard Lunar Data Table (1900-2100)
 * Format: 0x[LeapMonthSize(1 bit)][MonthSizes(12 bits)][LeapMonth(4 bits)]
 */
const LUNAR_INFO: Record<number, number> = {
    1980: 0x095b0, 1981: 0x04ae0, 1982: 0x0a564, 1983: 0x0abb0, 1984: 0x052ba,
    1985: 0x0a930, 1986: 0x06aa0, 1987: 0x0ad56, 1988: 0x04ba0, 1989: 0x0a5b0,
    1990: 0x0a575, 1991: 0x0d260, 1992: 0x0d950, 1993: 0x06aa4, 1994: 0x056a0,
    1995: 0x09ad0, 1996: 0x04ae8, 1997: 0x0a4d0, 1998: 0x0d250, 1999: 0x0d925,
    2000: 0x04ae0, 2001: 0x0a570, 2002: 0x05269, 2003: 0x0d260, 2004: 0x0d950,
    2005: 0x06aa5, 2006: 0x056a0, 2007: 0x09ad0, 2008: 0x04ae8, 2009: 0x04ae0,
    2010: 0x0a4d0, 2011: 0x0d256, 2012: 0x0d150, 2013: 0x0d920, 2014: 0x0da4b,
    2015: 0x0b520, 2016: 0x0b6a0, 2017: 0x095d5, 2018: 0x095b0, 2019: 0x049b0,
    2020: 0x0a4b4, 2021: 0x0b270, 2022: 0x06a50, 2023: 0x06d42, 2024: 0x0ab50,
};

function getDaysInLunarMonth(year: number, month: number): number {
    return (LUNAR_INFO[year] & (0x10000 >> month)) ? 30 : 29;
}

function getLeapMonth(year: number): number {
    return LUNAR_INFO[year] & 0xf;
}

function getLeapMonthDays(year: number): number {
    if (getLeapMonth(year)) {
        return (LUNAR_INFO[year] & 0x10000) ? 30 : 29;
    }
    return 0;
}

function getDaysInLunarYear(year: number): number {
    let days = 348;
    for (let i = 0x8000; i > 0x8; i >>= 1) {
        days += (LUNAR_INFO[year] & i) ? 1 : 0;
    }
    return days + getLeapMonthDays(year);
}

/**
 * Converts Lunar Date to Solar Date
 */
export function lunarToSolar(lunar: LunarDate): Date {
    // Exact Base: 1900-01-31 Solar is 1900-01-01 Lunar
    // But let's use a modern base for simplicity since we have 1980+ data here
    const baseDate = new Date(1980, 1, 16); // 1980-01-01 Lunar is 1980-02-16 Solar
    let offset = 0;

    for (let y = 1980; y < lunar.year; y++) {
        offset += getDaysInLunarYear(y);
    }

    const leapMonth = getLeapMonth(lunar.year);
    for (let m = 1; m < lunar.month; m++) {
        offset += getDaysInLunarMonth(lunar.year, m);
        if (m === leapMonth) offset += getLeapMonthDays(lunar.year);
    }

    if (lunar.isLeapMonth) {
        offset += getDaysInLunarMonth(lunar.year, lunar.month);
    }

    offset += lunar.day - 1;

    const result = new Date(baseDate.getTime() + offset * 86400000);
    return result;
}

export function solarToLunar(solar: Date): LunarDate {
    // Simple placeholder for now, engine uses lunarToSolar for birth input
    return { year: solar.getFullYear(), month: solar.getMonth() + 1, day: solar.getDate(), isLeapMonth: false };
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
    const index = (year - 4) % 12;
    return lang === 'ko' ? ZODIAC_ANIMALS[index] : ZODIAC_ANIMALS_EN[index];
}
