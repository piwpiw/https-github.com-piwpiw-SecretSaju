import { describe, expect, it } from 'vitest';
import { SIXTY_GANJI, type FourPillars } from '@/core/calendar/ganji';
import { analyzeElements } from '@/core/myeongni/elements';
import { calculateGangYak } from '@/lib/advancedScoring';
import { calculateYongshin } from '@/core/myeongni/yongshin';
import { evaluateGyeokgukCandidates } from '@/core/myeongni/gyeokguk-candidates';
import { evaluateYongshinCandidates } from '@/core/myeongni/yongshin-candidates';

function byIndex(index: number) {
  const found = SIXTY_GANJI[index];
  if (!found) throw new Error(`Missing ganji index ${index}`);
  return found;
}

describe('candidate engine enrichment', () => {
  it('emits special-pattern and break-risk metadata for structure candidates', () => {
    const pillars: FourPillars = {
      year: byIndex(20),
      month: byIndex(36),
      day: byIndex(50),
      hour: byIndex(8),
    };

    const candidates = evaluateGyeokgukCandidates(pillars);

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every((candidate) => candidate.candidateClass === 'regular' || candidate.candidateClass === 'special')).toBe(true);
    expect(candidates.every((candidate) => ['low', 'medium', 'high'].includes(candidate.breakRisk))).toBe(true);
  });

  it('emits jeonwanggyeok signals when the chart is overwhelmingly concentrated on the day-master element', () => {
    const pillars: FourPillars = {
      year: byIndex(50),
      month: byIndex(51),
      day: byIndex(0),
      hour: byIndex(51),
    };

    const candidates = evaluateGyeokgukCandidates(pillars);

    expect(candidates.some((candidate) => candidate.specialPattern === 'jeonwanggyeok')).toBe(true);
  });

  it('emits hwagyeok signals when fire dominance and fire-season support align', () => {
    const pillars: FourPillars = {
      year: byIndex(42),
      month: byIndex(53),
      day: byIndex(42),
      hour: byIndex(6),
    };

    const candidates = evaluateGyeokgukCandidates(pillars);

    expect(candidates.some((candidate) => candidate.specialPattern === 'hwagyeok')).toBe(true);
  });

  it('emits tonggwan or byeongyak alternates in yongshin candidates when balance conflicts exist', () => {
    const pillars: FourPillars = {
      year: byIndex(35),
      month: byIndex(48),
      day: byIndex(0),
      hour: byIndex(27),
    };
    const elements = analyzeElements(pillars, new Date(2024, 0, 1, 12, 0, 0, 0));
    const gangyak = calculateGangYak(pillars);
    const yongshin = calculateYongshin(elements, gangyak);

    const candidates = evaluateYongshinCandidates(elements, gangyak, yongshin);

    expect(candidates.length).toBeGreaterThan(3);
    expect(candidates.some((candidate) => candidate.method === 'tonggwan' || candidate.method === 'byeongyak')).toBe(true);
    expect(candidates.every((candidate) => typeof candidate.priority === 'number')).toBe(true);
  });
});
