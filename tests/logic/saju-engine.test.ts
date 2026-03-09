import { describe, it, expect } from 'vitest';
import { getDayPillarIndex, getPillarNameKo, getPillarCode } from '@/lib/saju';
import { getDayPillar, getHourPillar, SIXTY_GANJI } from '@/core/calendar/ganji';

describe('Saju Core Engine', () => {
    describe('getDayPillarIndex', () => {
        it('Reference date 2000-01-01 should return index 54 (戊午)', () => {
            const ref = new Date(2000, 0, 1);
            expect(getDayPillarIndex(ref)).toBe(54);
        });

        it('Returns value in range 0-59', () => {
            const dates = [
                new Date(1990, 5, 15),
                new Date(2000, 0, 1),
                new Date(2025, 11, 31),
                new Date(1970, 0, 1),
            ];
            for (const d of dates) {
                const idx = getDayPillarIndex(d);
                expect(idx).toBeGreaterThanOrEqual(0);
                expect(idx).toBeLessThan(60);
            }
        });

        it('Consecutive days increment by 1 (mod 60)', () => {
            const d1 = new Date(2025, 2, 1);
            const d2 = new Date(2025, 2, 2);
            const i1 = getDayPillarIndex(d1);
            const i2 = getDayPillarIndex(d2);
            expect(i2).toBe((i1 + 1) % 60);
        });

        it('Cycle repeats every 60 days', () => {
            const base = new Date(2025, 0, 1);
            const plus60 = new Date(base.getTime() + 60 * 24 * 60 * 60 * 1000);
            expect(getDayPillarIndex(base)).toBe(getDayPillarIndex(plus60));
        });
    });

    describe('getPillarNameKo', () => {
        it('Returns Korean name for index 0 (갑자)', () => {
            const name = getPillarNameKo(0);
            expect(name).toMatch(/갑자/);
        });

        it('All 60 pillar names are non-empty strings', () => {
            for (let i = 0; i < 60; i++) {
                const name = getPillarNameKo(i);
                expect(typeof name).toBe('string');
                expect(name.length).toBeGreaterThan(0);
            }
        });

        it('Index 60 wraps to index 0 (갑자)', () => {
            expect(getPillarNameKo(60)).toBe(getPillarNameKo(0));
        });
    });

    describe('getPillarCode', () => {
        it('Returns a valid code string (ALL_CAPS with underscore)', () => {
            for (let i = 0; i < 60; i++) {
                const code = getPillarCode(i);
                expect(code).toMatch(/^[A-Z]+_[A-Z]+$/);
            }
        });

        it('GAP_JA is at index 0', () => {
            expect(getPillarCode(0)).toBe('GAP_JA');
        });
    });

    describe('getDayPillar (ganji.ts)', () => {
        it('Returns a valid GanJi object', () => {
            const pillar = getDayPillar(new Date(2025, 2, 5));
            expect(pillar).toHaveProperty('stem');
            expect(pillar).toHaveProperty('branch');
            expect(pillar).toHaveProperty('ganjiIndex');
            expect(pillar.ganjiIndex).toBeGreaterThanOrEqual(0);
            expect(pillar.ganjiIndex).toBeLessThan(60);
        });

        it('fullName is 2 characters (간지)', () => {
            const pillar = getDayPillar(new Date(2025, 0, 1));
            expect(pillar.fullName.length).toBe(2);
        });
    });

    describe('getHourPillar', () => {
        it('Returns a valid GanJi for midnight', () => {
            const midnight = new Date(2025, 2, 5, 0, 0);
            const day = getDayPillar(midnight);
            const hour = getHourPillar(midnight, day.stemIndex);
            expect(hour.ganjiIndex).toBeGreaterThanOrEqual(0);
            expect(hour.ganjiIndex).toBeLessThan(60);
        });

        it('Different hours produce different hour pillars', () => {
            const morning = new Date(2025, 2, 5, 8, 0);  // 08:00
            const evening = new Date(2025, 2, 5, 20, 0); // 20:00
            const day = getDayPillar(morning);
            const h1 = getHourPillar(morning, day.stemIndex);
            const h2 = getHourPillar(evening, day.stemIndex);
            expect(h1.ganjiIndex).not.toBe(h2.ganjiIndex);
        });
    });

    describe('SIXTY_GANJI integrity', () => {
        it('Has exactly 60 entries', () => {
            expect(SIXTY_GANJI.length).toBe(60);
        });

        it('Each entry has required fields', () => {
            for (const g of SIXTY_GANJI) {
                expect(typeof g.stem).toBe('string');
                expect(typeof g.branch).toBe('string');
                expect(typeof g.ganjiIndex).toBe('number');
                expect(typeof g.code).toBe('string');
            }
        });

        it('No duplicate ganjiIndex values', () => {
            const indices = SIXTY_GANJI.map(g => g.ganjiIndex);
            const unique = new Set(indices);
            expect(unique.size).toBe(60);
        });
    });
});
