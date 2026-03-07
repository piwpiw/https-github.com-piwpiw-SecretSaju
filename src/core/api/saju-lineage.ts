export type YearBoundaryPolicy = 'lichun';
export type HourPillarSource = 'civil' | 'true-solar';
export type YajasiPolicy = 'strict' | 'disabled';
export type DayBoundaryPolicy = 'civil' | 'hour-source';
export type HourBranchPolicy = 'civil' | 'hour-source';

export interface LineagePolicySnapshot {
  yearBoundaryPolicy: YearBoundaryPolicy;
  dayBoundaryPolicy: DayBoundaryPolicy;
  hourPillarSource: HourPillarSource;
  hourBranchPolicy: HourBranchPolicy;
  yajasiPolicy: YajasiPolicy;
}

export interface LineageProfile extends LineagePolicySnapshot {
  id: string;
  name: string;
  description: string;
}

export const LINEAGE_PROFILES: Record<string, LineageProfile> = {
  modern_precision: {
    id: 'modern_precision',
    name: 'Modern Precision',
    description: 'Uses Lichun year boundary, civil day handling, true solar time for hour handling, and strict Ya-Ja-Si logic.',
    yearBoundaryPolicy: 'lichun',
    dayBoundaryPolicy: 'civil',
    hourPillarSource: 'true-solar',
    hourBranchPolicy: 'hour-source',
    yajasiPolicy: 'strict',
  },
  civil_reference: {
    id: 'civil_reference',
    name: 'Civil Reference',
    description: 'Uses Lichun year boundary, civil day handling, civil birth time for hour handling, and disables Ya-Ja-Si splitting.',
    yearBoundaryPolicy: 'lichun',
    dayBoundaryPolicy: 'civil',
    hourPillarSource: 'civil',
    hourBranchPolicy: 'civil',
    yajasiPolicy: 'disabled',
  },
} as const;

export type LineageProfileId = keyof typeof LINEAGE_PROFILES;

export function resolveLineageProfile(profileId?: string): LineageProfile {
  if (profileId && profileId in LINEAGE_PROFILES) {
    return LINEAGE_PROFILES[profileId as LineageProfileId];
  }

  return LINEAGE_PROFILES.modern_precision;
}
