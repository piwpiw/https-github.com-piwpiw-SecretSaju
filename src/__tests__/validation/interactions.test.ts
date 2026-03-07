import { describe, expect, it } from 'vitest';
import { SIXTY_GANJI, type FourPillars } from '@/core/calendar/ganji';
import { analyzeTransitInteractions, analyzeVisibleInteractions } from '@/core/myeongni/interactions';

function pickByBranch(branchIndex: number) {
    const found = SIXTY_GANJI.find((item) => item.branchIndex === branchIndex);
    if (!found) {
        throw new Error(`Missing branch ${branchIndex}`);
    }
    return found;
}

describe('interaction engine expansion', () => {
    it('detects punishment, harm, and break relations with evidence metadata', () => {
        const pillars: FourPillars = {
            year: pickByBranch(5),
            month: pickByBranch(8),
            day: pickByBranch(0),
            hour: pickByBranch(7),
        };

        const events = analyzeVisibleInteractions(pillars);
        const types = events.map((event) => event.type);

        expect(types).toContain('branch_punishment');
        expect(types).toContain('branch_harm');
        expect(types).toContain('branch_break');
        expect(types).toContain('branch_combination');
        expect(events.every((event) => Array.isArray(event.evidenceIds))).toBe(true);
        expect(events.some((event) => event.conflictFlags.includes('multi_relation_pair'))).toBe(true);
    });

    it('detects three-combination frames when all three branches are present', () => {
        const pillars: FourPillars = {
            year: pickByBranch(8),
            month: pickByBranch(0),
            day: pickByBranch(4),
            hour: pickByBranch(1),
        };

        const events = analyzeVisibleInteractions(pillars);
        expect(events.some((event) => event.type === 'branch_three_combination')).toBe(true);
    });

    it('marks combination transformation as formed or blocked based on surrounding support', () => {
        const supported: FourPillars = {
            year: SIXTY_GANJI.find((item) => item.stemIndex === 0 && item.branchIndex === 2)!,
            month: SIXTY_GANJI.find((item) => item.stemIndex === 5 && item.branchIndex === 1)!,
            day: pickByBranch(4),
            hour: pickByBranch(10),
        };
        const blocked: FourPillars = {
            year: SIXTY_GANJI.find((item) => item.stemIndex === 0 && item.branchIndex === 2)!,
            month: SIXTY_GANJI.find((item) => item.stemIndex === 5 && item.branchIndex === 11)!,
            day: pickByBranch(3),
            hour: pickByBranch(8),
        };

        const supportedEvents = analyzeVisibleInteractions(supported);
        const blockedEvents = analyzeVisibleInteractions(blocked);

        expect(supportedEvents.some((event) => event.type === 'stem_transformation' && event.result === 'formed')).toBe(true);
        expect(blockedEvents.some((event) => event.type === 'stem_transformation' && event.result === 'blocked')).toBe(true);
    });

    it('detects natal-to-transit interactions for daewun and saewun scopes', () => {
        const pillars: FourPillars = {
            year: pickByBranch(8),
            month: pickByBranch(0),
            day: pickByBranch(6),
            hour: pickByBranch(11),
        };

        const events = analyzeTransitInteractions(pillars, {
            daewun: SIXTY_GANJI.find((item) => item.branchIndex === 4) ?? null,
            saewun: SIXTY_GANJI.find((item) => item.branchIndex === 1) ?? null,
            wolun: SIXTY_GANJI.find((item) => item.branchIndex === 1) ?? null,
            ilun: SIXTY_GANJI.find((item) => item.branchIndex === 6) ?? null,
        });

        expect(events.some((event) => event.scope === 'daewun')).toBe(true);
        expect(events.some((event) => event.scope === 'saewun')).toBe(true);
        expect(events.some((event) => event.scope === 'wolun')).toBe(true);
        expect(events.some((event) => event.scope === 'ilun')).toBe(true);
        expect(events.some((event) => event.type === 'branch_three_combination')).toBe(true);
        expect(events.some((event) => event.type === 'branch_directional_combination')).toBe(true);
    });
});
