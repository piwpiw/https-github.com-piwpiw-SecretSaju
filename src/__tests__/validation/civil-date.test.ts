import { describe, expect, it } from 'vitest';
import {
    getCurrentCivilDateInTimeZone,
    formatCivilDate,
    isFutureCivilDate,
    parseCivilDate,
    parseCivilTimeParts,
} from '@/lib/civil-date';

describe('civil-date utilities', () => {
    it('parses YYYY-MM-DD without timezone drift', () => {
        const parsed = parseCivilDate('1990-05-15');

        expect(parsed).not.toBeNull();
        expect(parsed?.getFullYear()).toBe(1990);
        expect(parsed?.getMonth()).toBe(4);
        expect(parsed?.getDate()).toBe(15);
    });

    it('uses the civil date prefix when an ISO timestamp is present', () => {
        const parsed = parseCivilDate('1990-05-15T00:00:00.000Z');

        expect(parsed).not.toBeNull();
        expect(formatCivilDate(parsed)).toBe('1990-05-15');
    });

    it('rejects impossible civil dates', () => {
        expect(parseCivilDate('1990-02-31')).toBeNull();
    });

    it('parses HH:mm time parts and compares future dates by calendar day', () => {
        expect(parseCivilTimeParts('23:45')).toEqual({ hour: 23, minute: 45, second: 0 });

        const today = new Date(2026, 2, 7, 21, 30, 0, 0);
        expect(isFutureCivilDate(new Date(2026, 2, 7, 23, 59, 0, 0), today)).toBe(false);
        expect(isFutureCivilDate(new Date(2026, 2, 8, 0, 0, 0, 0), today)).toBe(true);
    });

    it('derives the current civil date from an explicit timezone', () => {
        const reference = new Date(Date.UTC(2026, 2, 7, 16, 0, 0));
        const koreaToday = getCurrentCivilDateInTimeZone('Asia/Seoul', reference);

        expect(formatCivilDate(koreaToday)).toBe('2026-03-08');
    });
});
