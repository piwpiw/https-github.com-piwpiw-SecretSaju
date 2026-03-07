# Saju Validated Implementation Blueprint

Date: 2026-03-06
Status: Draft for implementation
Companion standard: `docs/02-technical/core-engine/SAJU_DEEP_RESEARCH_STANDARD.md`

## 1. Purpose

This document validates the existing Saju development plan against:

- official astronomy and calendrical sources
- classical Myeongri texts
- the current Secret Saju codebase

It also upgrades the plan into an implementation-ready blueprint with:

- rule boundaries
- canonical data structures
- conflict handling
- evidence and confidence output
- phased delivery

The main design goal is not only "more detailed interpretation".
The main goal is a structure that remains correct when rules, premium content, experiments, and datasets grow over time.

## 2. Fact-check summary

### 2.1 What the current plan gets right

- Exact solar-term handling is the correct standard for Saju year/month boundaries, not pure lunar month boundaries.
- Month order and day master must stay central in the interpretation hierarchy.
- Strong/weak analysis, structure judgement, yongshin, and luck-cycle analysis should be separate modules.
- A versioned evidence layer is necessary if premium interpretation is going to scale.

### 2.2 What must be corrected or downgraded from "standard" to "heuristic"

These items are not safe to treat as universal standards:

- A fixed `30/30/40` split for `deukryeong/deukji/deukse`
- A fixed final score such as `(gangyak * 0.3) + (gyeokguk * 0.4) + (yongshin * 0.3)`
- A fixed threshold such as `>= 60 => strong`, `< 40 => weak`
- A single universal interpretation of 23:00-00:59 births

Reason:
The classical sources support the importance of these factors, but they do not provide one universally accepted numeric scoring formula. These must be modeled as profile-based product heuristics built on top of evidence-bearing raw features.

### 2.3 Facts discovered in the current codebase

- `src/core/api/saju-engine.ts` already uses exact solar-term logic through the calendar layer and applies true solar time for hour-pillar handling.
- `src/core/astronomy/timezone.ts` is now used to record historical Korea standard offset, DST offset, and `birthInstantUtc`, but the engine still needs a cleaner civil-time to UTC to boundary pipeline for broader timezone generalization.
- `src/core/calendar/lunar-solar.ts` now uses the runtime Chinese calendar via `Intl`, including `solarToLunar`, which removes the old 2024 table ceiling but introduces a runtime-support dependency that must stay under test.
- `src/core/calendar/yajasi.ts` is now wired into the main engine through `lineageProfile.hourPillarSource` and `lineageProfile.yajasiPolicy`.
- `src/lib/civil-date.ts` now centralizes civil-date parsing and formatting so `YYYY-MM-DD` inputs are no longer passed through `new Date('YYYY-MM-DD')` in API, repository, and major UI paths.
- `src/core/api/saju-canonical.ts` now emits canonical hidden-stem ten-gods, calendar-boundary semantics, structured evidence, and a heuristic `strengthProfile`.
- `src/core/myeongni/interactions.ts` now covers visible pair relations, natal three-combinations, directional combinations, current daewun/saewun/wolun/ilun transit-aware events, and first-pass transformation success/failure conditions.
- `src/core/myeongni/gyeokguk.ts` and `src/core/myeongni/yongshin.ts` are still simplified rule cores, but candidate layers are now emitted above them for canonical output, including first-pass `jonggyeok`, `jeonwanggyeok`, `hwagyeok`, `tonggwan`, and `byeongyak` signals.
- `src/__tests__/data/golden-dataset.ts` now has 10 visible cases, which is still far below the threshold for a trustworthy regression suite.

## 3. Research-backed corrections that should change the plan

### 3.1 Separate official Chinese calendar logic from Saju lineage logic

Research basis:

- Hong Kong Observatory states that the official Chinese calendar year begins on Lunar New Year's Day.
- The same official source also notes that popular fortune-telling often regards the year as beginning at Spring Commences.

Implementation consequence:

The engine must store both:

- `official_calendar_year_boundary = lunar_new_year`
- `myeongri_year_boundary = lichun_exact`

Rule:
Do not hard-code one boundary and silently assume it covers both official calendar and Myeongri semantics.

### 3.2 Historical civil-time correctness is mandatory

Research basis:

- IANA tzdb documents historical Korea offsets and summer time transitions.
- Solar-term boundaries and day/hour handling depend on the real birth instant, not only the displayed local wall time.

Implementation consequence:

The pipeline must convert the entered birth time using:

- historical legal UTC offset
- historical DST if applicable
- user-entered location

Current gap:
historical Korea offset and DST are now recorded in the main engine, and civil-date input drift is normalized before engine entry, but year/month boundary derivation still needs a stricter civil-time to UTC to astronomy separation before the design can claim full global-grade normalization.

Rule:
No "high precision" claim is valid until historical civil-time normalization is not only recorded, but also used as the authoritative boundary input for all pillar derivation paths.

### 3.3 Exact solar-term boundaries must be computed on the absolute birth instant

Research basis:

- Hong Kong Observatory states that solar-term times are determined astronomically from the sun's longitude.
- This means the comparison is about actual instants, not just rough local calendar dates.

Implementation consequence:

- year/month pillar boundaries must be checked against exact term instants
- the birth instant must be normalized first
- true solar time is not a substitute for historical civil-time normalization

### 3.4 True solar time should be isolated by purpose

The engine should distinguish three different time concepts:

- `civil_birth_time`
- `absolute_birth_instant_utc`
- `local_true_solar_time`

Reason:

- civil time is needed for legal/historical reconstruction
- UTC instant is needed for exact boundary comparisons
- true solar time is mainly needed for school-dependent hour/day interpretation logic

Rule:
Do not use true solar time as a blanket replacement for all pillar boundary logic.

### 3.5 Ya-Ja-Si and day-boundary policy must be configurable

Research basis:

- different professional schools treat late rat hour differently
- the codebase already contains multiple handling strategies

Implementation consequence:

Introduce a `lineage_profile` with configurable policies:

- `day_boundary_policy`
- `hour_branch_policy`
- `yajasi_policy`
- `year_boundary_policy`

Rule:
Do not bury school-dependent choices inside one hard-coded function.

Current checkpoint:
- `year_boundary_policy`, `day_boundary_policy`, `hour_pillar_source`, and `yajasi_policy` are now exposed
- the engine now separates civil day-boundary handling from hour-source handling
- `hour_branch_policy` is now exposed and wired into hour-branch derivation

## 4. The target architecture

### 4.1 Layered pipeline

1. Input normalization
2. Civil-time reconstruction
3. Astronomical boundary calculation
4. Pillar derivation
5. Canonical feature construction
6. Rule evaluation
7. Explanation assembly
8. Analytics and feedback capture

### 4.2 Input normalization layer

Required fields:

- birth date as a civil-date string (`YYYY-MM-DD`) or an equivalent normalized structure
- birth time
- timezone identifier
- location latitude and longitude
- gender
- calendar type
- leap-month flag
- time-known confidence

Required outputs:

- `raw_input`
- `normalized_input`
- `input_warnings`
- `normalization_version`

Current checkpoint:
- the app now normalizes date-only birth inputs with `src/lib/civil-date.ts`
- API and repository boundaries no longer rely on JavaScript's timezone-sensitive date-string parser for `YYYY-MM-DD`
- timezone identifier capture is still incomplete outside the Korea-focused engine path

### 4.3 Civil-time reconstruction layer

Required outputs:

- `civil_birth_time_local`
- `historical_utc_offset_minutes`
- `historical_dst_offset_minutes`
- `birth_instant_utc`
- `timezone_evidence`

Suggested source of truth:

- IANA tzdb data for legal offset history
- internal fallback tables only if they are generated from a verifiable source

Important caution:

- IANA tzdb is the practical global interoperability source for civil-time systems, but it is not an official legal authority by itself.
- When a jurisdiction-specific legal source exists and conflicts with local fallback code, legal/public authority must win and the tzdb-based implementation must be revalidated.

### 4.4 Astronomical boundary layer

Required outputs:

- `lichun_instant`
- `major_term_boundaries`
- `minor_term_boundaries`
- `term_source_version`
- `astronomy_warnings`

Rule:
The layer must expose exact timestamps, not only branch indexes.

### 4.5 Pillar derivation layer

Required outputs:

- `year_pillar_myeongri`
- `year_pillar_official`
- `month_pillar`
- `day_pillar`
- `hour_pillar`
- `pillar_policy_snapshot`

Important detail:

- year/month should be based on exact solar-term boundary logic
- day/hour should be derived under a declared lineage policy
- hour-pillar calculation must record whether it used civil time, true solar time, or a Ya-Ja-Si override

## 5. Canonical feature schema

The canonical feature object is the most important structural upgrade.

```ts
interface CanonicalChart {
  chartId: string;
  chartVersion: string;
  lineageProfileId: string;

  input: {
    calendarType: 'solar' | 'lunar';
    isLeapMonth: boolean;
    birthTimeKnown: boolean;
    timezoneId: string;
    location: { latitude: number; longitude: number };
  };

  time: {
    civilBirthTime: string;
    birthInstantUtc: string;
    trueSolarTime: string;
    historicalUtcOffsetMinutes: number;
    historicalDstOffsetMinutes: number;
  };

  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
  };

  hiddenStems: HiddenStemFeature[];
  elements: ElementFeatureSet;
  tenGods: TenGodFeatureSet;
  interactions: InteractionEvent[];
  strength: StrengthFeatureSet;
  structures: StructureCandidate[];
  yongshin: YongshinCandidateSet;
  luck: LuckCycleFeatureSet;
  auxiliary: AuxiliarySignalSet;
  evidence: EvidenceEntry[];
}
```

Rule:
No premium interpretation should read directly from ad hoc utility functions once this object exists.

## 6. Rule engine design

### 6.1 Rule registry

Every rule must be explicit and versioned.

```ts
interface RuleDefinition {
  id: string;
  domain:
    | 'time'
    | 'pillar'
    | 'interaction'
    | 'strength'
    | 'structure'
    | 'yongshin'
    | 'luck'
    | 'auxiliary';
  lineageProfiles: string[];
  sources: SourceRef[];
  prerequisites: string[];
  evaluator: string;
  emits: string[];
  conflictsWith?: string[];
}
```

### 6.2 Interaction engine

This should be the first major new engine module.

The engine must emit normalized events for:

- stem combination
- branch six-combination
- branch three-combination
- branch directional combination
- clash
- punishment
- harm
- break
- hidden-stem emergence
- transformation success
- transformation blocked

Event shape:

```ts
interface InteractionEvent {
  type: string;
  actors: string[];
  scope: 'natal' | 'luck' | 'cross';
  result: 'detected' | 'formed' | 'blocked' | 'broken';
  resultingElement?: string;
  strength: number;
  evidenceIds: string[];
  conflictFlags: string[];
}
```

### 6.3 Strength engine

The strength engine should not start from a single fixed total score.

Instead, compute raw factors first:

- month-command support
- root presence in branches
- hidden-stem weight support
- visible stem support
- hostile control and drain
- seasonal climate bias
- twelve-phase support

Then allow a lineage profile to convert the raw factors into:

- `weak`
- `balanced`
- `strong`

and an optional product score.

Rule:
Raw features are standard. Final score mapping is profile-specific.

### 6.4 Structure engine

The current `gyeokguk` logic has a first-pass candidate layer, and it now emits break-risk plus `jonggyeok`, `jeonwanggyeok`, and `hwagyeok` signals, but it still needs lineage-grade break-condition and false-pattern modeling.

Each candidate should include:

- candidate type
- required conditions
- break conditions
- confirming factors
- weakening factors
- confidence
- evidence list

The engine should support at least:

- regular structures
- follow/obedience-like special patterns
- overly-strong patterns
- false-pattern rejection

Rule:
The engine now supports more than one active candidate in the canonical layer before final arbitration, but special-pattern arbitration is still incomplete and the current special-pattern labels should be treated as evidence-bearing heuristics, not final lineage-standard verdicts.

### 6.5 Yongshin engine

The yongshin engine must not produce a single answer too early.

Candidate families:

- `johoo`
- `eokbu`
- `tonggwan`
- `byeongyak`
- `special_pattern`

Each candidate should include:

- element
- method
- evidence
- penalties
- supporting interactions
- contradiction flags
- confidence

Arbitration order:

1. Check if a special pattern invalidates ordinary balancing logic.
2. Check climate extremes and seasonal urgency.
3. Check strong/weak balancing need.
4. Check whether a pass-through or mediation element is required.
5. Rank candidates, do not discard conflicts silently.

Rule:
When candidates disagree, the UI must surface the conflict as a low-confidence or multi-reading chart.

## 7. Data model for big-data development

### 7.1 Minimum tables

- `birth_inputs_raw`
- `birth_inputs_normalized`
- `charts_canonical`
- `chart_features`
- `rule_evaluations`
- `interpretation_outputs`
- `premium_unlock_events`
- `user_feedback_events`
- `chart_ground_truth_cases`

### 7.2 Version fields

Every table that depends on computation must store:

- `calendar_engine_version`
- `astronomy_engine_version`
- `rule_engine_version`
- `lineage_profile_id`
- `copy_engine_version`

### 7.3 Why this matters

Without these fields, you cannot tell whether:

- a conversion lift came from better copy or better rule logic
- a regression came from calendar code or interpretation code
- a premium complaint came from a chart error or a wording issue

## 8. Validation blueprint

### 8.1 Truth-source classes

Each golden case should carry a truth-source class:

- `A`: official astronomical/calendar fact
- `B`: classical text example with interpretable outcome
- `C`: agreement across trusted professional calculators
- `D`: internal adjudicated case with documented disagreement

### 8.2 Minimum dataset expansion

Target:

- 300 cases for boundary and calendar correctness
- 200 cases for interaction rules
- 150 cases for strong/weak edge cases
- 100 cases for structure/yongshin conflicts
- 100 natal-plus-luck cases

### 8.3 Required edge-case families

- exact Lichun boundary
- exact major-term boundary
- leap-month lunar input
- unsupported lunar-year range
- historical Korea UTC+8:30 period
- historical Korea DST period
- 23:00-00:59 births under multiple lineage profiles
- missing-time degradation
- charts with conflicting yongshin methods
- charts where combination exists but transformation is blocked

### 8.4 Confidence policy

The system should not collapse disagreement too early.

If two trusted sources disagree:

- keep both candidate outcomes
- record why they disagree
- reduce confidence
- display a bounded explanation instead of a false certainty

## 9. Delivery plan

### Phase 0: hard corrections

- wire `timezone.ts` into the main engine or replace it with a verified tzdb-backed service
- replace the current lunar conversion table/range with a verified full-range implementation
- expose lineage policy in the engine entry point

### Phase 1: canonical chart

- add `CanonicalChart`
- add evidence entry schema
- route all existing modules through a single canonical build step

### Phase 2: interaction engine

- implement normalized interaction events
- feed these events into result rendering
- add rule-level tests

### Phase 3: strength, structure, yongshin candidate engines

- refactor simplified modules into candidate emitters
- add confidence and conflict handling
- keep the old explanation layer as fallback until parity is reached

### Phase 4: validation and analytics integration

- expand golden datasets
- store versioned rule outputs
- connect premium UX and trust metrics to engine versions

## 10. Non-negotiable engineering rules

- No claim of "traditional standard" for a rule that is actually a product heuristic.
- No claim of "high precision" while historical timezone and lunar-range gaps remain.
- No premium prose without a canonical feature reference.
- No rule output without `evidence`, `rule_source`, and `confidence`.
- No school-dependent policy hidden inside a utility function.

## 11. Research basis

Official and primary references:

- Hong Kong Observatory, "The Sexagenary Cycle"  
  https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm
- Hong Kong Observatory, "The 24 Solar Terms"  
  https://www.hko.gov.hk/en/gts/time/24solarterms.htm
- Hong Kong Observatory, "Chinese Calendar FAQ"  
  https://www.hko.gov.hk/en/gts/time/faq_chinese_calendar.htm
- Hong Kong Observatory, "Chinese Calendar and the 24 Solar Terms"  
  https://www.hko.gov.hk/en/gts/time/24solarterms_and_chinese_calendar.htm
- IANA tzdb Asia source  
  https://data.iana.org/time-zones/tzdb/asia
- IANA tz-link note on scope and authority  
  https://data.iana.org/time-zones/tz-link.html
- NOAA Solar Calculator notice  
  https://gml.noaa.gov/grad/solcalc/
- Di Tian Sui  
  https://ctext.org/wiki.pl?if=gb&chapter=955484
- Shen Feng Tong Kao  
  https://ctext.org/wiki.pl?if=gb&res=686672
- San Ming Tong Hui  
  https://ctext.org/wiki.pl?if=gb&res=410562

Current implementation references:

- `src/core/api/saju-engine.ts`
- `src/core/astronomy/timezone.ts`
- `src/core/astronomy/true-solar-time.ts`
- `src/core/calendar/ganji.ts`
- `src/core/calendar/lunar-solar.ts`
- `src/core/calendar/yajasi.ts`
- `src/core/myeongni/gyeokguk.ts`
- `src/core/myeongni/yongshin.ts`
- `src/__tests__/data/golden-dataset.ts`
