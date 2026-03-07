import { describe, expect, it } from 'vitest';
import { SajuEngine } from '@/core/api/saju-engine';
import { KOREA_LOCATIONS } from '@/core/astronomy/true-solar-time';

describe('Saju engine metadata and canonical features', () => {
    it('emits lineage, evidence, interactions, and canonical features', async () => {
        const result = await SajuEngine.calculate({
            birthDate: new Date(1990, 0, 27),
            birthTime: '23:30',
            gender: 'M',
            location: KOREA_LOCATIONS.SEOUL,
            lineageProfileId: 'civil_reference',
        });

        expect(result.meta?.inputs.lineageProfileId).toBe('civil_reference');
        expect(result.meta?.lineage.id).toBe('civil_reference');
        expect(Array.isArray(result.evidence)).toBe(true);
        expect(result.evidence.length).toBeGreaterThan(0);
        expect(Array.isArray(result.interactions)).toBe(true);
        expect(result.interactions.every((event) => Array.isArray(event.evidenceIds))).toBe(true);
        expect(result.canonicalFeatures.chartCore.lineageProfile.id).toBe('civil_reference');
        expect(result.canonicalFeatures.chartCore.lineageProfile.dayBoundaryPolicy).toBe('civil');
        expect(result.canonicalFeatures.chartCore.lineageProfile.hourBranchPolicy).toBe('civil');
        expect(result.canonicalFeatures.chartCore.calendarBoundaries.officialYearBoundary).toBe('lunar_new_year');
        expect(Array.isArray(result.canonicalFeatures.tenGodsHidden)).toBe(true);
        expect(result.canonicalFeatures.tenGodsHidden.length).toBe(4);
        expect(Array.isArray(result.canonicalFeatures.structureCandidates)).toBe(true);
        expect(result.canonicalFeatures.structureCandidates.length).toBeGreaterThan(0);
        expect(result.canonicalFeatures.structureCandidates[0]).toHaveProperty('candidateClass');
        expect(result.canonicalFeatures.structureCandidates[0]).toHaveProperty('breakRisk');
        expect(Array.isArray(result.canonicalFeatures.yongshinCandidates)).toBe(true);
        expect(result.canonicalFeatures.yongshinCandidates.length).toBeGreaterThan(0);
        expect(result.canonicalFeatures.yongshinCandidates[0]).toHaveProperty('priority');
        expect(Array.isArray(result.canonicalFeatures.transitInteractions)).toBe(true);
        expect(result.currentUn?.wolun?.pillar?.fullName).toBeTruthy();
        expect(result.currentUn?.ilun?.pillar?.fullName).toBeTruthy();
        expect(result.canonicalFeatures.strengthProfile.components.length).toBe(3);
        expect(result.canonicalFeatures.strengthProfile.heuristic.id).toBe('gangyak-legacy-v1');
        expect(result.canonicalFeatures.timeContext.birthInstantUtc).toMatch(/Z$/);
        expect(result.meta?.diagnostics.historicalUtcOffsetMinutes).toBeGreaterThan(0);
        expect(result.meta?.diagnostics.myeongriCalendarYear).toBeGreaterThan(0);
    });

    it('keeps civil day boundaries separate from true-solar hour handling', async () => {
        const result = await SajuEngine.calculate({
            birthDate: new Date(2024, 0, 2),
            birthTime: '00:30',
            gender: 'F',
            location: KOREA_LOCATIONS.SEOUL,
        });

        expect(result.fourPillars.day.fullName).toBe('을축');
        expect(result.fourPillars.hour.fullName).toBe('병자');
        expect(result.meta?.lineage.id).toBe('modern_precision');
        expect(result.meta?.lineage.dayBoundaryPolicy).toBe('civil');
        expect(result.meta?.lineage.hourPillarSource).toBe('true-solar');
        expect(result.meta?.lineage.hourBranchPolicy).toBe('hour-source');
        expect(result.canonicalFeatures.chartCore.lineageProfile.dayBoundaryPolicy).toBe('civil');
        expect(result.canonicalFeatures.chartCore.lineageProfile.hourBranchPolicy).toBe('hour-source');
    });
});
