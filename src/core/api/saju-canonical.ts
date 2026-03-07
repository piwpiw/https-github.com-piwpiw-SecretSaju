import type { Location } from '../astronomy/true-solar-time';
import type { FourPillars } from '../calendar/ganji';
import { JIJANGGAN_TABLE } from '../myeongni/jijanggan';
import type { ElementAnalysisResult } from '../myeongni/elements';
import type { SipsongResult } from '../myeongni/sipsong';
import type { DaewunInfo, CurrentUnInfo } from '../myeongni/daewun';
import type { GangYakScore } from '../../lib/advancedScoring';
import type { YongshinAnalysis } from '../myeongni/yongshin';
import type { Sinsal } from '../myeongni/sinsal';
import type { GyeokgukInfo } from '../myeongni/gyeokguk';
import type { SibiwoonseongAnalysis } from '../myeongni/sibiwoonseong';
import type { InteractionEvent } from '../myeongni/interactions';
import type { GyeokgukCandidate } from '../myeongni/gyeokguk-candidates';
import type { YongshinCandidate } from '../myeongni/yongshin-candidates';
import { calculateOneSipsong } from '../myeongni/sipsong';
import type { LineageProfile } from './saju-lineage';

export type EvidenceSourceTier = 'A' | 'B' | 'C' | 'D' | 'engine';

export interface EvidenceEntry {
  id: string;
  title: string;
  summary: string;
  sourceTier: EvidenceSourceTier;
  ruleSource: string;
  confidence: number;
  signals: string[];
}

export interface CanonicalSajuFeatures {
  chartCore: {
    version: string;
    model: string;
    calendarType: 'solar' | 'lunar';
    isLeapMonth: boolean;
    fourPillars: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
    dayMaster: string;
    lineageProfile: {
      id: string;
      name: string;
      description: string;
      yearBoundaryPolicy: string;
      dayBoundaryPolicy: string;
      hourPillarSource: string;
      hourBranchPolicy: string;
      yajasiPolicy: string;
    };
    calendarBoundaries: {
      officialYearBoundary: 'lunar_new_year';
      myeongriYearBoundary: string;
      officialCalendarYear: number | null;
      myeongriCalendarYear: number;
    };
  };
  timeContext: {
    civilBirthTime: string;
    birthInstantUtc: string;
    trueSolarTime: string;
    trueSolarOffsetMinutes: number;
    historicalUtcOffsetMinutes: number;
    historicalDstOffsetMinutes: number;
    location: Location;
    timeUnknownFallbackUsed: boolean;
  };
  hiddenStems: Array<{
    pillar: 'year' | 'month' | 'day' | 'hour';
    branch: string;
    stems: Array<{ stem: string; weight: number }>;
  }>;
  elementScores: {
    weighted: ElementAnalysisResult['scores'];
    counts: ElementAnalysisResult['counts'];
    basicPercentages: ElementAnalysisResult['basicPercentages'];
    dominant: string[];
    lacking: string[];
    excessive: string[];
  };
  tenGodsSurface: Array<{ position: string; value: string }>;
  tenGodsHidden: Array<{
    pillar: 'year' | 'month' | 'day' | 'hour';
    branch: string;
    items: Array<{ stem: string; weight: number; tenGod: string }>;
  }>;
  interactions: InteractionEvent[];
  transitInteractions: InteractionEvent[];
  strengthProfile: {
    total: number;
    level: string;
    description: string;
    confidence: number;
    climateBalance: {
      temperature: string;
      humidity: string;
      score: number;
    };
    heuristic: {
      id: string;
      note: string;
      thresholds: string[];
    };
    components: Array<{
      key: 'deukryeong' | 'deukji' | 'deukse';
      label: string;
      value: number;
      max: number;
      normalizedPercent: number;
      hint: string;
    }>;
  };
  strength: GangYakScore | null;
  structure: GyeokgukInfo | null;
  structureCandidates: GyeokgukCandidate[];
  yongshin: YongshinAnalysis | null;
  yongshinCandidates: YongshinCandidate[];
  luckCycles: {
    daewun: DaewunInfo | null;
    currentUn: CurrentUnInfo | null;
  };
  auxiliarySignals: {
    sinsal: Sinsal[];
    sibiwoonseong: SibiwoonseongAnalysis | null;
  };
  evidence: EvidenceEntry[];
}

export interface CanonicalBuildInput {
  version: string;
  model: string;
  calendarType: 'solar' | 'lunar';
  isLeapMonth: boolean;
  fourPillars: FourPillars;
  civilBirthTime: Date;
  birthInstantUtc: Date;
  trueSolarTime: Date;
  trueSolarOffsetMinutes: number;
  historicalUtcOffsetMinutes: number;
  historicalDstOffsetMinutes: number;
  location: Location;
  timeUnknownFallbackUsed: boolean;
  lineageProfile: LineageProfile;
  officialCalendarYear: number | null;
  myeongriCalendarYear: number;
  elements: ElementAnalysisResult;
  sipsong: SipsongResult;
  interactions: InteractionEvent[];
  transitInteractions: InteractionEvent[];
  gangyak: GangYakScore | null;
  gyeokguk: GyeokgukInfo | null;
  structureCandidates: GyeokgukCandidate[];
  yongshin: YongshinAnalysis | null;
  yongshinCandidates: YongshinCandidate[];
  daewun: DaewunInfo | null;
  currentUn: CurrentUnInfo | null;
  sinsal: Sinsal[];
  sibiwoonseong: SibiwoonseongAnalysis | null;
  warnings: string[];
  qualityScore: number;
  lunarConverted: boolean;
  trueSolarAdjusted: boolean;
}

function toIsoLocal(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
}

export function buildCanonicalSajuFeatures(input: CanonicalBuildInput): CanonicalSajuFeatures {
  const hiddenStemGroups = [
    { pillar: 'year' as const, branch: input.fourPillars.year.branch, stems: JIJANGGAN_TABLE[input.fourPillars.year.branch] },
    { pillar: 'month' as const, branch: input.fourPillars.month.branch, stems: JIJANGGAN_TABLE[input.fourPillars.month.branch] },
    { pillar: 'day' as const, branch: input.fourPillars.day.branch, stems: JIJANGGAN_TABLE[input.fourPillars.day.branch] },
    { pillar: 'hour' as const, branch: input.fourPillars.hour.branch, stems: JIJANGGAN_TABLE[input.fourPillars.hour.branch] },
  ];
  const hiddenStems: CanonicalSajuFeatures['hiddenStems'] = [
    ...hiddenStemGroups.map((entry) => ({
      pillar: entry.pillar,
      branch: entry.branch,
      stems: entry.stems.map((item) => ({ stem: item.stem, weight: item.weight })),
    })),
  ];

  const tenGodsSurface = Object.entries(input.sipsong ?? {}).map(([position, value]) => ({
    position,
    value,
  }));
  const dayMaster = input.fourPillars.day.stem;
  const tenGodsHidden: CanonicalSajuFeatures['tenGodsHidden'] = hiddenStemGroups.map((entry) => ({
    pillar: entry.pillar,
    branch: entry.branch,
    items: entry.stems.map((item) => ({
      stem: item.stem,
      weight: item.weight,
      tenGod: calculateOneSipsong(dayMaster, item.stem),
    })),
  }));

  const evidence: EvidenceEntry[] = [
    {
      id: 'calendar-boundary',
      title: 'Year/Month Boundary Policy',
      summary: `Year and month pillars follow the ${input.lineageProfile.yearBoundaryPolicy} policy under the ${input.lineageProfile.name} profile.`,
      sourceTier: 'A',
      ruleSource: 'solar-term-boundary',
      confidence: 0.9,
      signals: [input.lineageProfile.yearBoundaryPolicy, input.lineageProfile.id],
    },
    {
      id: 'hour-pillar-source',
      title: 'Hour Pillar Source',
      summary: `Hour pillar was derived from ${input.timeUnknownFallbackUsed ? 'civil fallback time' : input.lineageProfile.hourPillarSource}.`,
      sourceTier: 'engine',
      ruleSource: 'hour-pillar-policy',
      confidence: input.timeUnknownFallbackUsed ? 0.55 : 0.84,
      signals: [input.lineageProfile.hourPillarSource, input.lineageProfile.yajasiPolicy],
    },
    {
      id: 'day-boundary-policy',
      title: 'Day Boundary Policy',
      summary: `Day pillar boundary followed the ${input.lineageProfile.dayBoundaryPolicy} policy while preserving the hour-source policy separately.`,
      sourceTier: 'engine',
      ruleSource: 'day-boundary-policy',
      confidence: 0.86,
      signals: [input.lineageProfile.dayBoundaryPolicy, input.lineageProfile.hourPillarSource],
    },
    {
      id: 'hour-branch-policy',
      title: 'Hour Branch Policy',
      summary: `Hour branch selection followed the ${input.lineageProfile.hourBranchPolicy} policy.`,
      sourceTier: 'engine',
      ruleSource: 'hour-branch-policy',
      confidence: 0.84,
      signals: [input.lineageProfile.hourBranchPolicy, input.lineageProfile.hourPillarSource],
    },
    {
      id: 'historical-offset',
      title: 'Historical Civil-Time Context',
      summary: `Historical Korea offset ${input.historicalUtcOffsetMinutes}m and DST ${input.historicalDstOffsetMinutes}m were recorded for the entered birth time.`,
      sourceTier: 'A',
      ruleSource: 'historical-timezone',
      confidence: 0.75,
      signals: [String(input.historicalUtcOffsetMinutes), String(input.historicalDstOffsetMinutes)],
    },
    {
      id: 'lunar-conversion',
      title: 'Calendar Conversion',
      summary: input.lunarConverted ? 'The input lunar date was converted to a solar civil date before pillar derivation.' : 'The input was treated as a solar civil date.',
      sourceTier: 'A',
      ruleSource: 'calendar-conversion',
      confidence: input.lunarConverted ? 0.78 : 0.92,
      signals: [input.calendarType],
    },
    {
      id: 'hidden-ten-gods',
      title: 'Hidden Stem Ten-God Matrix',
      summary: 'Hidden stems were expanded into weighted ten-god signals against the day master.',
      sourceTier: 'B',
      ruleSource: 'hidden-stem-ten-gods',
      confidence: 0.8,
      signals: [input.fourPillars.day.stem, String(tenGodsHidden.length)],
    },
    {
      id: 'quality-score',
      title: 'Engine Quality',
      summary: `This chart was assembled with a quality score of ${input.qualityScore}/100 and ${input.warnings.length} diagnostic warnings.`,
      sourceTier: 'engine',
      ruleSource: 'engine-quality',
      confidence: 0.9,
      signals: [String(input.qualityScore), String(input.warnings.length)],
    },
  ];

  if (input.trueSolarAdjusted) {
    evidence.push({
      id: 'true-solar-adjustment',
      title: 'True Solar Time Adjustment',
      summary: `True solar time changed the hour context by ${input.trueSolarOffsetMinutes.toFixed(2)} minutes.`,
      sourceTier: 'A',
      ruleSource: 'true-solar-time',
      confidence: 0.82,
      signals: [String(input.trueSolarOffsetMinutes)],
    });
  }

  const strengthProfile: CanonicalSajuFeatures['strengthProfile'] = {
    total: Number(input.gangyak?.total ?? 0),
    level: input.gangyak?.level ?? '중화',
    description: input.gangyak?.description ?? '강약 평가는 득령·득지·득세 구성요소를 합산한 제품형 지표입니다.',
    confidence: 0.74,
    climateBalance: {
      temperature: input.elements.balance.temperature,
      humidity: input.elements.balance.humidity,
      score: input.elements.balance.score,
    },
    heuristic: {
      id: 'gangyak-legacy-v1',
      note: '득령/득지/득세 30/30/40과 60/40 구간은 제품 휴리스틱이며, 전통 공통 표준 단일식은 아닙니다.',
      thresholds: ['>=60 strong', '40-59 balanced', '<40 weak'],
    },
    components: [
      {
        key: 'deukryeong',
        label: '득령',
        value: Number(input.gangyak?.deukryeong ?? 0),
        max: 30,
        normalizedPercent: Math.max(0, Math.min(100, Math.round((Number(input.gangyak?.deukryeong ?? 0) / 30) * 100))),
        hint: '월지에서 받는 계절 기운과 월령의 우세를 읽는 축입니다.',
      },
      {
        key: 'deukji',
        label: '득지',
        value: Number(input.gangyak?.deukji ?? 0),
        max: 30,
        normalizedPercent: Math.max(0, Math.min(100, Math.round((Number(input.gangyak?.deukji ?? 0) / 30) * 100))),
        hint: '사주 지지에 뿌리를 두는 정도와 지지 기반 지지력을 읽는 축입니다.',
      },
      {
        key: 'deukse',
        label: '득세',
        value: Number(input.gangyak?.deukse ?? 0),
        max: 40,
        normalizedPercent: Math.max(0, Math.min(100, Math.round((Number(input.gangyak?.deukse ?? 0) / 40) * 100))),
        hint: '주변 천간과 보조 세력이 일간을 도와주는 정도를 읽는 축입니다.',
      },
    ],
  };
  evidence.push({
    id: 'strength-profile',
    title: 'Strength Profile',
    summary: `Strength profile recorded with ${strengthProfile.components.length} components and heuristic ${strengthProfile.heuristic.id}.`,
    sourceTier: 'engine',
    ruleSource: 'strength-profile-v1',
    confidence: strengthProfile.confidence,
    signals: [
      String(strengthProfile.total),
      strengthProfile.level,
      strengthProfile.heuristic.id,
      `${strengthProfile.climateBalance.temperature}/${strengthProfile.climateBalance.humidity}`,
    ],
  });

  if (input.structureCandidates.length) {
    evidence.push({
      id: 'structure-candidates',
      title: 'Structure Candidates',
      summary: `Tracked ${input.structureCandidates.length} structure candidates from the month-branch hidden stems.`,
      sourceTier: 'B',
      ruleSource: 'gyeokguk-candidate-layer',
      confidence: input.structureCandidates[0]?.confidence ?? 0.7,
      signals: input.structureCandidates.slice(0, 3).map((candidate) => candidate.id),
    });
  }

  if (input.yongshinCandidates.length) {
    evidence.push({
      id: 'yongshin-candidates',
      title: 'Yongshin Candidates',
      summary: `Tracked ${input.yongshinCandidates.length} yongshin candidates across primary, support, and alternate methods.`,
      sourceTier: 'engine',
      ruleSource: 'yongshin-candidate-layer',
      confidence: input.yongshinCandidates[0]?.confidence ?? 0.7,
      signals: input.yongshinCandidates.slice(0, 4).map((candidate) => candidate.id),
    });
  }

  if (input.transitInteractions.length) {
    evidence.push({
      id: 'transit-interactions',
      title: 'Transit Interactions',
      summary: `Detected ${input.transitInteractions.length} current daewun/saewun interaction events against the natal chart.`,
      sourceTier: 'engine',
      ruleSource: 'transit-interaction-layer',
      confidence: 0.73,
      signals: input.transitInteractions.slice(0, 4).map((event) => event.id),
    });
  }

  return {
    chartCore: {
      version: input.version,
      model: input.model,
      calendarType: input.calendarType,
      isLeapMonth: input.isLeapMonth,
      fourPillars: {
        year: input.fourPillars.year.fullName,
        month: input.fourPillars.month.fullName,
        day: input.fourPillars.day.fullName,
        hour: input.fourPillars.hour.fullName,
      },
      dayMaster: input.fourPillars.day.stem,
      lineageProfile: {
        id: input.lineageProfile.id,
        name: input.lineageProfile.name,
        description: input.lineageProfile.description,
        yearBoundaryPolicy: input.lineageProfile.yearBoundaryPolicy,
        dayBoundaryPolicy: input.lineageProfile.dayBoundaryPolicy,
        hourPillarSource: input.lineageProfile.hourPillarSource,
        hourBranchPolicy: input.lineageProfile.hourBranchPolicy,
        yajasiPolicy: input.lineageProfile.yajasiPolicy,
      },
      calendarBoundaries: {
        officialYearBoundary: 'lunar_new_year',
        myeongriYearBoundary: input.lineageProfile.yearBoundaryPolicy,
        officialCalendarYear: input.officialCalendarYear,
        myeongriCalendarYear: input.myeongriCalendarYear,
      },
    },
    timeContext: {
      civilBirthTime: toIsoLocal(input.civilBirthTime),
      birthInstantUtc: input.birthInstantUtc.toISOString(),
      trueSolarTime: input.trueSolarTime.toISOString(),
      trueSolarOffsetMinutes: Number(input.trueSolarOffsetMinutes.toFixed(2)),
      historicalUtcOffsetMinutes: input.historicalUtcOffsetMinutes,
      historicalDstOffsetMinutes: input.historicalDstOffsetMinutes,
      location: input.location,
      timeUnknownFallbackUsed: input.timeUnknownFallbackUsed,
    },
    hiddenStems,
    elementScores: {
      weighted: input.elements.scores,
      counts: input.elements.counts,
      basicPercentages: input.elements.basicPercentages,
      dominant: input.elements.dominant,
      lacking: input.elements.lacking,
      excessive: input.elements.excessive,
    },
    tenGodsSurface,
    tenGodsHidden,
    interactions: input.interactions,
    transitInteractions: input.transitInteractions,
    strengthProfile,
    strength: input.gangyak,
    structure: input.gyeokguk,
    structureCandidates: input.structureCandidates,
    yongshin: input.yongshin,
    yongshinCandidates: input.yongshinCandidates,
    luckCycles: {
      daewun: input.daewun,
      currentUn: input.currentUn,
    },
    auxiliarySignals: {
      sinsal: input.sinsal,
      sibiwoonseong: input.sibiwoonseong,
    },
    evidence,
  };
}
