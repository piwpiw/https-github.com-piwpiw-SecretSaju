import { describe, expect, it } from 'vitest';
import { lunarToSolar, solarToLunar } from '@/core/calendar/lunar-solar';

describe('Lunar/Solar conversion', () => {
    it('converts 2024 lunar new year to the correct solar date', () => {
        const solar = lunarToSolar({ year: 2024, month: 1, day: 1, isLeapMonth: false });

        expect(solar.getFullYear()).toBe(2024);
        expect(solar.getMonth()).toBe(1);
        expect(solar.getDate()).toBe(10);
    });

    it('converts known leap-month lunar date to the correct solar date', () => {
        const solar = lunarToSolar({ year: 2023, month: 2, day: 1, isLeapMonth: true });

        expect(solar.getFullYear()).toBe(2023);
        expect(solar.getMonth()).toBe(2);
        expect(solar.getDate()).toBe(22);
    });

    it('converts solar new year day back to lunar first month first day', () => {
        const lunar = solarToLunar(new Date(2024, 1, 10));

        expect(lunar).toEqual({
            year: 2024,
            month: 1,
            day: 1,
            isLeapMonth: false,
        });
    });
});
