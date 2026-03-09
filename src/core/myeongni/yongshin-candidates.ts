import type { GangYakScore } from '@/lib/saju/advancedScoring';
import type { Element, ElementAnalysisResult } from './elements';
import type { YongshinAnalysis } from './yongshin';

export interface YongshinCandidate {
  id: string;
  element: Element;
  role: 'primary' | 'support' | 'watchout' | 'alternate';
  method: 'johoo' | 'eokbu' | 'balance' | 'tonggwan' | 'byeongyak';
  confidence: number;
  evidenceIds: string[];
  conflictFlags: string[];
  priority: number;
  summary: string;
}

function normalizeMethod(source?: string): YongshinCandidate['method'] {
  if (source?.includes('조후') || source?.toLowerCase().includes('johoo')) return 'johoo';
  if (source?.includes('억부') || source?.toLowerCase().includes('eok')) return 'eokbu';
  return 'balance';
}

export function evaluateYongshinCandidates(
  elements: ElementAnalysisResult,
  gangyak: GangYakScore,
  yongshin: YongshinAnalysis,
): YongshinCandidate[] {
  const primaryMethod = normalizeMethod(yongshin.source);
  const alternateElement = (elements.lacking[0] ?? elements.mainElement) as Element;
  const thermalExtreme = elements.balance.temperature === 'Hot' || elements.balance.temperature === 'Cold';
  const methodConflict = thermalExtreme && primaryMethod !== 'johoo';
  const weakAndDry = gangyak.level === '신약' && elements.balance.humidity === 'Dry';
  const tonggwanElement = (elements.excessive[0] ?? elements.lacking[0] ?? elements.mainElement) as Element;

  const candidates: YongshinCandidate[] = [
    {
      id: `yongshin:${yongshin.primary.element}:primary`,
      element: yongshin.primary.element,
      role: 'primary',
      method: primaryMethod,
      confidence: thermalExtreme ? 0.88 : 0.8,
      evidenceIds: ['yongshin.primary', `yongshin.method.${primaryMethod}`],
      conflictFlags: methodConflict ? ['johoo_override_pending'] : [],
      priority: 100,
      summary: yongshin.primary.reason,
    },
    {
      id: `yongshin:${yongshin.secondary.element}:support`,
      element: yongshin.secondary.element,
      role: 'support',
      method: primaryMethod,
      confidence: 0.74,
      evidenceIds: ['yongshin.secondary', `yongshin.method.${primaryMethod}`],
      conflictFlags: [],
      priority: 80,
      summary: yongshin.secondary.reason,
    },
    {
      id: `yongshin:${yongshin.unfavorable.element}:watchout`,
      element: yongshin.unfavorable.element,
      role: 'watchout',
      method: primaryMethod,
      confidence: 0.7,
      evidenceIds: ['yongshin.unfavorable', `gangyak.level.${gangyak.level}`],
      conflictFlags: [],
      priority: 40,
      summary: yongshin.unfavorable.reason,
    },
  ];

  if (!candidates.some((candidate) => candidate.element === alternateElement && candidate.role === 'primary')) {
    candidates.push({
      id: `yongshin:${alternateElement}:alternate`,
      element: alternateElement,
      role: 'alternate',
      method: 'balance',
      confidence: 0.63,
      evidenceIds: ['yongshin.balance.alternate', `elements.lacking.${alternateElement}`],
      conflictFlags: methodConflict ? ['primary_vs_balance_conflict'] : [],
      priority: 60,
      summary: `Balance candidate derived from the most lacking element under the current five-element distribution.`,
    });
  }

  if (!candidates.some((candidate) => candidate.element === tonggwanElement && candidate.method === 'tonggwan')) {
    candidates.push({
      id: `yongshin:${tonggwanElement}:tonggwan`,
      element: tonggwanElement,
      role: 'alternate',
      method: 'tonggwan',
      confidence: 0.58,
      evidenceIds: ['yongshin.tonggwan.bridge', `elements.excessive.${tonggwanElement}`],
      conflictFlags: ['bridging_candidate'],
      priority: 55,
      summary: `Bridging candidate used to mediate between excessive and lacking element clusters.`,
    });
  }

  if (weakAndDry && !candidates.some((candidate) => candidate.method === 'byeongyak')) {
    candidates.push({
      id: `yongshin:${elements.mainElement}:byeongyak`,
      element: elements.mainElement,
      role: 'support',
      method: 'byeongyak',
      confidence: 0.6,
      evidenceIds: ['yongshin.byeongyak.support', `gangyak.level.${gangyak.level}`, `humidity.${elements.balance.humidity}`],
      conflictFlags: ['condition_recovery_candidate'],
      priority: 70,
      summary: `Condition-recovery candidate added because the chart is weak and dry, so preserving the day-master condition matters before ordinary balancing.`,
    });
  }

  return candidates.sort((left, right) => {
    const priorityDiff = right.priority - left.priority;
    if (priorityDiff !== 0) return priorityDiff;
    return right.confidence - left.confidence;
  });
}
