import type { FourPillars } from '../calendar/ganji';
import { JIJANGGAN_TABLE } from './jijanggan';
import { calculateOneSipsong } from './sipsong';

export interface GyeokgukCandidate {
  id: string;
  name: string;
  supportingStem: string;
  supportingBranch: string;
  phase: 'initial' | 'middle' | 'main';
  protrusion: boolean;
  candidateClass: 'regular' | 'special';
  specialPattern?: 'jonggyeok' | 'jeonwanggyeok' | 'hwagyeok' | 'none';
  breakRisk: 'low' | 'medium' | 'high';
  confidence: number;
  weight: number;
  evidenceIds: string[];
  conflictFlags: string[];
  summary: string;
}

function getPhase(index: number, length: number): GyeokgukCandidate['phase'] {
  if (length === 2) {
    return index === 0 ? 'initial' : 'main';
  }
  if (index === 0) return 'initial';
  if (index === length - 1) return 'main';
  return 'middle';
}

function getPhaseRank(phase: GyeokgukCandidate['phase'], protrusion: boolean): number {
  if (protrusion && phase === 'main') return 100;
  if (protrusion && phase === 'middle') return 90;
  if (protrusion && phase === 'initial') return 80;
  if (!protrusion && phase === 'main') return 70;
  if (!protrusion && phase === 'middle') return 60;
  return 50;
}

const STEM_INDEX_ELEMENTS = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'] as const;
const BRANCH_INDEX_ELEMENTS = ['water', 'earth', 'wood', 'wood', 'earth', 'fire', 'fire', 'earth', 'metal', 'metal', 'earth', 'water'] as const;
const STEM_TO_INDEX: Record<string, number> = {
  '甲': 0,
  '乙': 1,
  '丙': 2,
  '丁': 3,
  '戊': 4,
  '己': 5,
  '庚': 6,
  '辛': 7,
  '壬': 8,
  '癸': 9,
  '갑': 0,
  '을': 1,
  '병': 2,
  '정': 3,
  '무': 4,
  '기': 5,
  '경': 6,
  '신': 7,
  '임': 8,
  '계': 9,
};

function getStemElement(stemIndex: number) {
  return STEM_INDEX_ELEMENTS[stemIndex];
}

function getBranchElement(branchIndex: number) {
  return BRANCH_INDEX_ELEMENTS[branchIndex];
}

function getStemElementByStem(stem: string) {
  return getStemElement(STEM_TO_INDEX[stem] ?? 0);
}

function getSpecialPattern(params: {
  dayMasterElement: (typeof STEM_INDEX_ELEMENTS)[number];
  monthElement: (typeof STEM_INDEX_ELEMENTS)[number];
  phaseStemElement: (typeof STEM_INDEX_ELEMENTS)[number];
  sameElementStemCount: number;
  sameElementBranchCount: number;
  fireElementCount: number;
  fireBranchCount: number;
  protrusion: boolean;
}): GyeokgukCandidate['specialPattern'] {
  const {
    dayMasterElement,
    monthElement,
    phaseStemElement,
    sameElementStemCount,
    sameElementBranchCount,
    fireElementCount,
    fireBranchCount,
    protrusion,
  } = params;

  const hwagyeokSignal =
    phaseStemElement === 'fire'
    && fireElementCount >= 5
    && fireBranchCount >= 2
    && (monthElement === 'fire' || protrusion);
  if (hwagyeokSignal) {
    return 'hwagyeok';
  }

  const jeonwanggyeokSignal =
    monthElement === dayMasterElement
    && phaseStemElement === dayMasterElement
    && sameElementStemCount >= 3
    && sameElementBranchCount >= 2;
  if (jeonwanggyeokSignal) {
    return 'jeonwanggyeok';
  }

  const jonggyeokSignal =
    sameElementStemCount <= 1
    && sameElementBranchCount === 0
    && !protrusion;
  if (jonggyeokSignal) {
    return 'jonggyeok';
  }

  return 'none';
}

export function evaluateGyeokgukCandidates(saju: FourPillars): GyeokgukCandidate[] {
  const visibleStems = [saju.year.stem, saju.month.stem, saju.hour.stem];
  const monthBranch = saju.month.branch;
  const phases = JIJANGGAN_TABLE[monthBranch] ?? [];
  const dayMasterElement = getStemElement(saju.day.stemIndex);
  const monthElement = getBranchElement(saju.month.branchIndex);
  const sameElementStemCount = [saju.year.stemIndex, saju.month.stemIndex, saju.day.stemIndex, saju.hour.stemIndex]
    .filter((stemIndex) => getStemElement(stemIndex) === dayMasterElement).length;
  const sameElementBranchCount = [saju.year.branchIndex, saju.month.branchIndex, saju.day.branchIndex, saju.hour.branchIndex]
    .filter((branchIndex) => getBranchElement(branchIndex) === dayMasterElement).length;
  const fireElementCount =
    [saju.year.stemIndex, saju.month.stemIndex, saju.day.stemIndex, saju.hour.stemIndex]
      .filter((stemIndex) => getStemElement(stemIndex) === 'fire').length
    + [saju.year.branchIndex, saju.month.branchIndex, saju.day.branchIndex, saju.hour.branchIndex]
      .filter((branchIndex) => getBranchElement(branchIndex) === 'fire').length;
  const fireBranchCount = [saju.year.branchIndex, saju.month.branchIndex, saju.day.branchIndex, saju.hour.branchIndex]
    .filter((branchIndex) => getBranchElement(branchIndex) === 'fire').length;

  return phases
    .map((phaseEntry, index) => {
      const phase = getPhase(index, phases.length);
      const protrusion = visibleStems.includes(phaseEntry.stem);
      const phaseStemElement = getStemElementByStem(phaseEntry.stem);
      const specialPattern = getSpecialPattern({
        dayMasterElement,
        monthElement,
        phaseStemElement,
        sameElementStemCount,
        sameElementBranchCount,
        fireElementCount,
        fireBranchCount,
        protrusion,
      });
      const breakRisk: GyeokgukCandidate['breakRisk'] =
        specialPattern === 'hwagyeok' && fireBranchCount >= 3
          ? 'low'
          : specialPattern === 'jeonwanggyeok' && sameElementStemCount >= 4
            ? 'low'
            : protrusion && phase === 'main'
          ? 'low'
          : protrusion || phase === 'main'
            ? 'medium'
            : 'high';
      const specialBoost =
        specialPattern === 'hwagyeok'
          ? 0.07
          : specialPattern === 'jeonwanggyeok'
            ? 0.06
            : specialPattern === 'jonggyeok'
              ? 0.04
              : 0;
      const confidence = Math.min(
        0.95,
        Number((
          0.48
          + (protrusion ? 0.22 : 0)
          + phaseEntry.weight / 100
          + getPhaseRank(phase, protrusion) / 1000
          + specialBoost
        ).toFixed(2)),
      );
      return {
        id: `gyeok:${monthBranch}:${phaseEntry.stem}:${phase}`,
        name: calculateOneSipsong(saju.day.stem, phaseEntry.stem),
        supportingStem: phaseEntry.stem,
        supportingBranch: monthBranch,
        phase,
        protrusion,
        candidateClass: specialPattern === 'none' ? 'regular' : 'special',
        specialPattern,
        breakRisk,
        confidence,
        weight: phaseEntry.weight,
        evidenceIds: [
          `gyeok.hidden.${monthBranch}.${phaseEntry.stem}`,
          protrusion ? 'gyeok.protrusion.detected' : 'gyeok.protrusion.absent',
          specialPattern === 'jonggyeok'
            ? 'gyeok.special.jonggyeok'
            : specialPattern === 'jeonwanggyeok'
              ? 'gyeok.special.jeonwanggyeok'
              : specialPattern === 'hwagyeok'
                ? 'gyeok.special.hwagyeok'
                : 'gyeok.special.none',
        ],
        conflictFlags: [
          ...(protrusion ? [] : ['non_protruding_candidate']),
          ...(specialPattern === 'hwagyeok' && fireBranchCount < 3 ? ['transformation_support_thin'] : []),
          ...(specialPattern === 'jeonwanggyeok' && sameElementBranchCount < 3 ? ['root_support_moderate'] : []),
          ...(breakRisk === 'high' ? ['break_risk_high'] : breakRisk === 'medium' ? ['break_risk_medium'] : []),
        ],
        summary: protrusion
          ? `Month branch hidden stem ${phaseEntry.stem} protrudes into visible stems${specialPattern === 'jonggyeok' ? ', but a following-pattern signal is still present.' : specialPattern === 'jeonwanggyeok' ? ', and an overly-strong day-master signal is accumulating around the same element.' : specialPattern === 'hwagyeok' ? ', and the chart shows a fire-dominant transformation signal.' : '.'}`
          : `Month branch hidden stem ${phaseEntry.stem} remains implicit and is treated as a fallback frame candidate${specialPattern === 'jonggyeok' ? ' under a weak-daymaster following-pattern signal.' : specialPattern === 'jeonwanggyeok' ? ' while the chart still shows an overly-strong same-element concentration.' : specialPattern === 'hwagyeok' ? ' under a fire-dominant transformation signal.' : '.'}`,
      } satisfies GyeokgukCandidate;
    })
    .sort((left, right) => {
      const rankDiff = getPhaseRank(right.phase, right.protrusion) - getPhaseRank(left.phase, left.protrusion);
      if (rankDiff !== 0) return rankDiff;
      return right.weight - left.weight;
    });
}
