# Saju Deep Research Standard

Date: 2026-03-06
Status: Working standard
Scope: Secret Saju core engine, result generation, premium interpretation, and future data/AI layers
Implementation blueprint: `docs/02-technical/core-engine/SAJU_VALIDATED_IMPLEMENTATION_BLUEPRINT.md`

## 1. Why this document exists

The project already has a strong calendrical base and a good result UI, but the interpretation layer still mixes deep rules, simplified rules, and product copy.

This document defines the standard that future Saju work must follow:

1. Official astronomy and calendrical sources for time, solar terms, and calendar conversion.
2. Classical Myeongri canon for interpretation hierarchy.
3. Modern calculator and app outputs only as regression references, never as the normative source.
4. Product analytics and user feedback only for ranking, wording, and UX decisions, never for rewriting the raw chart rules.

Inference from research:
There does not appear to be a single universal modern standard document for all Saju interpretation layers. The reliable approach is to define a source hierarchy and keep traceability for every rule.

## 2. Source hierarchy

### Tier A: Official astronomy and calendar sources

Use these for:
- solar term boundaries
- civil time vs. true solar time
- time normalization
- sexagenary cycle basics
- leap month and lunar/solar conversion references

Primary references:
- Hong Kong Observatory, "The Sexagenary Cycle"
- Hong Kong Observatory, "The 24 Solar Terms"
- Hong Kong Observatory, "Chinese Calendar FAQ"
- IANA tzdb for civil-time history and legal offset history
- Meeus-based solar calculation references as supporting implementation guidance

Important caution:
- HKO and official Chinese calendar standards are appropriate normative references for calendar semantics.
- IANA tzdb is globally deployed and operationally important, but IANA itself states that `tzdb` is not authoritative; it is a maintained civil-time data source.
- NOAA solar calculator materials are useful supporting references for equation-of-time and true-solar-time implementation, but NOAA states the public calculator is no longer actively maintained and cannot be guaranteed as an authoritative production source on its own.

Rule:
If two implementation paths disagree on time or calendar handling, Tier A wins.

### Tier B: Classical canon

Use these for:
- day master priority
- month command and month order
- structure and pattern judgement
- yongshin hierarchy
- interaction rules among stems, branches, and luck cycles

Primary references:
- Zi Ping Zhen Quan
- Di Tian Sui
- Shen Feng Tong Kao
- San Ming Tong Hui

Rule:
If two interpretation rules disagree, prefer the rule with stronger support across Tier B sources. Keep the losing rule as an alternate candidate if it still appears in another major lineage.

### Tier C: Modern commercial references

Use these for:
- regression cross-check
- output comparison
- edge-case sanity checks

Rule:
Do not promote a Tier C rule into the engine without a Tier A or Tier B basis, or an explicitly documented product decision.

### Tier D: Internal analytics and user data

Use these for:
- which explanation order improves comprehension
- which chart or summary format improves conversion
- which wording improves retention and trust

Rule:
Tier D can rank or explain a rule. Tier D cannot redefine the raw chart.

## 3. Normative engine standard

### 3.1 Time and calendar standard

The engine must:

- store the user-entered birth datetime in civil time with timezone
- store location latitude and longitude
- keep a derived true solar time field separate from civil time
- keep flags for `calendarType`, `isLeapMonth`, and `timeUnknown`
- derive month boundaries from solar terms, not from lunar month boundaries
- preserve diagnostics when fallback logic is used

Current implementation status:
- Strong: `src/core/api/saju-engine.ts` now emits lineage-policy metadata, canonical features, structured evidence, historical Korea offset diagnostics, and birth-instant UTC metadata.
- Strong: the engine now keeps civil day-boundary handling separate from true-solar hour handling through lineage policy, which closes the previously identified Jo-Ja-Si boundary mismatch.
- Strong: `hourBranchPolicy`, transit-aware interaction events, structure candidates, and yongshin candidates are now emitted through the canonical layer.
- Strong: `src/core/calendar/lunar-solar.ts` now uses the runtime Chinese calendar via `Intl`, replacing the older partial-table approach.
- Strong: `src/lib/civil-date.ts` now normalizes `YYYY-MM-DD` civil-date parsing and formatting across API, repository, and UI paths, removing the previous `new Date('YYYY-MM-DD')` drift risk.
- Strong: `src/core/myeongni/elements.ts` already uses hidden stems and seasonal weighting.
- Partial: pillar derivation still runs on Korea civil wall-clock semantics inside the engine path, so global timezone generalization is not complete yet.

### 3.2 Canonical feature layer

Every chart should be materialized into a canonical feature object before any prose is generated.

Required feature groups:

- `chart_core`: year, month, day, hour stem/branch, day master, calendar metadata
- `hidden_stems`: per branch hidden stem list with weight and visibility
- `element_scores`: raw scores, normalized scores, seasonal adjustments
- `ten_gods_surface`: surface ten-god mapping for visible stems and branches
- `ten_gods_hidden`: hidden-stem ten-god mapping with weight
- `interaction_events`: stem combinations, branch combinations, clashes, punishments, harms, breaks, and transformations
- `strength_scores`: deukryeong, deukji, deukse, final gangyak score, heuristic metadata, and supporting evidence
- `structure_candidates`: gyeokguk candidates, supporting evidence, break conditions, confidence
- `yongshin_candidates`: johoo, eokbu, tonggwan, byeongyak, special-pattern candidates, confidence
- `luck_cycles`: daewun, saewun, and eventually monthly and daily layers
- `auxiliary_signals`: shinsal, gongmang, palace-like supplements if adopted
- `evidence_log`: rule id, source tier, source text, conflict flags, confidence

Rule:
Premium content may only read from the canonical feature layer, not from ad hoc helper logic.

### 3.3 Classical inference standard

The engine must treat the following as first-class modules, not side heuristics:

1. Day master centered reading
2. Month order as a primary judgement axis
3. Hidden-stem visibility and protrusion
4. Strength scoring with evidence
5. Structure judgement with candidate competition
6. Yongshin judgement with method source and conflict notes
7. Natal chart plus luck-cycle interaction rules

Required minimum rule families:

- stem combination
- branch combination
- clash
- punishment
- harm
- break
- transformation success and failure conditions
- hidden-stem emergence and suppression
- pattern completion and pattern break

Rule:
No premium explanation should assert certainty if the engine only has a simplified heuristic for that layer.

### 3.4 Output standard

Every result block that can affect trust, payment, or decision-making must expose structured evidence.

Minimum output fields:

- `summary`
- `evidence`
- `rule_source`
- `confidence`
- `conflict_flags`
- `data_quality`

Rule:
If confidence is low, the UI should say that the chart has multiple valid readings.

## 4. Current system audit against the standard

### 4.1 Strong areas

- High-quality time handling in `src/core/api/saju-engine.ts`
- Canonical chart output, evidence logging, and lineage profile exposure in `src/core/api/saju-canonical.ts` and `src/core/api/saju-lineage.ts`
- Seasonal and hidden-stem weighted element scoring in `src/core/myeongni/elements.ts`
- Partial interaction engine coverage for stem combinations, branch combinations, clashes, punishments, harms, and breaks in `src/core/myeongni/interactions.ts`
- Hidden-stem ten-god expansion is now available in the canonical layer
- Civil-date normalization is now centralized in `src/lib/civil-date.ts`, reducing cross-runtime birth-date drift in API and UI consumers
- Basic support for sipsong, sinsal, gyeokguk, sibiwoonseong, gangyak, yongshin, and daewun
- Good result explainability and chart UI in `src/components/ResultCard.tsx` and `src/components/result/InteractiveInsightLab.tsx`
- Existing diagnostics and `qualityScore`, which is a good base for future evidence and confidence layers

### 4.2 Weak areas

- `src/core/myeongni/sipsong.ts` is still surface-oriented; the canonical layer now emits hidden-stem ten-gods, but the main rule engine still lacks weighted kinship/protrusion reasoning.
- `src/core/myeongni/interactions.ts` now covers visible pair relations, natal three-combinations, directional combinations, current daewun/saewun/wolun/ilun interactions, and first-pass transformation success/failure conditions, but detailed transformation arbitration is still simplified.
- `src/core/api/saju-canonical.ts` now emits a `strengthProfile`, but this is still a documented product heuristic layer over the existing gangyak formula, not a lineage-grade raw strength engine.
- `src/core/myeongni/gyeokguk.ts` is simplified; a first-pass candidate layer now emits `jonggyeok`, `jeonwanggyeok`, and `hwagyeok` signals plus break-risk metadata, but it is still heuristic signal detection rather than lineage-grade special-pattern arbitration.
- `src/core/myeongni/yongshin.ts` is mostly johoo plus eokbu; a first-pass candidate layer now emits `tonggwan` and `byeongyak` alternates, but it still lacks special-pattern override arbitration.
- `src/core/myeongni/sinsal.ts` covers only a narrow subset of shinsal, while `src/lib/sinsal.ts` contains additional logic outside the main engine path.
- `src/core/myeongni/daewun.ts` now exposes daewun, saewun, wolun, and ilun, but monthly/daily transit interpretation is still only a first-pass current-layer implementation.
- The golden validation dataset has only 10 visible cases in `src/__tests__/data/golden-dataset.ts`, which is still too small for a serious regression standard.

### 4.3 Architectural weakness

Important rules are split between the core engine path and separate helpers. That is acceptable for experimentation, but it is not acceptable for a big-data or premium-grade standard because:

- evidence cannot be traced consistently
- confidence cannot be computed consistently
- A/B wording can drift away from the actual rule path
- rule changes become hard to validate across products

## 5. Missing or under-modeled items from long-used traditional practice

These items appear materially under-modeled compared with the classical reading frame:

### Priority 1

- hyeong/chung/hap/pa/hae engine as a first-class rule module
- hidden-stem ten-god and kinship matrix
- natal plus daewun plus saewun interaction engine

Current checkpoint:
- visible `hap/chung/hyeong/hae/pa` coverage is implemented for natal pair relations, natal `three-combination` / `directional-combination` frames are emitted, and current daewun/saewun transit events are also exposed
- hidden-stem ten-god output is implemented in the canonical layer, and structure/yongshin candidate layers now exist as first-pass canonical outputs
- special-pattern structure signals currently include `jonggyeok`, `jeonwanggyeok`, and `hwagyeok`, but they must still be treated as evidence-bearing product heuristics until lineage-specific break and formation rules are fully encoded

### Priority 2

- richer gyeokguk candidate system including break conditions
- richer yongshin arbitration across johoo, eokbu, tonggwan, byeongyak, and special patterns
- expanded shinsal only after the main rule engine is normalized

### Priority 3

- gongmang integration into the canonical engine output
- palace-like supplements such as myeonggung or singung, only if the product chooses a lineage and documents it explicitly
- richer monthly, daily, and hourly transit layers for premium subscriptions

Rule:
Do not expand superficial shinsal breadth before the core interaction engine is complete.

## 6. Big-data development standard

If the project wants to become "big-data based", the engine must stop emitting prose-only results and start emitting reusable, normalized features.

Required data design:

- immutable raw birth input table
- immutable normalized chart table
- versioned derived feature table
- rule-evaluation table with rule ids and evidence
- interpretation table linked to rule outputs
- analytics events table linked to chart version and interpretation version
- feedback table linked to trust, usefulness, save, share, purchase, and revisit behavior

Required versioning:

- `calendar_engine_version`
- `rule_engine_version`
- `copy_engine_version`
- `ui_experiment_version`

Rule:
No experiment result should be interpreted without the engine version that produced it.

## 7. Validation standard

The current golden test approach is a start, but not enough.

Minimum validation expansion:

- 300+ golden cases before calling the engine "standardized"
- solar-term boundary cases
- Ipchun before/after cases
- Yajasi/Jojasi boundary cases
- lunar and leap-month conversion cases
- unknown-time degradation cases
- strong/weak edge cases
- special-pattern and false-pattern cases
- yongshin conflict cases
- natal plus daewun plus saewun interaction cases

Validation sources:

- classical worked examples where available
- cross-check against multiple professional calculators
- internal adjudication notes when sources differ

Rule:
When sources differ, preserve the disagreement in the dataset rather than hiding it.

## 8. Implementation order

### Phase 1

Status: implemented

- build the canonical feature schema
- merge scattered rule logic into one evaluation path
- add evidence and confidence output contracts

### Phase 2

Status: partially implemented

- implement interaction engine for stem and branch relations
- implement weighted hidden-stem ten-god matrix
- refactor gangyak to output evidence by component

Current checkpoint:
- visible pair interaction events are implemented
- natal three-combinations and directional combinations are implemented
- hidden-stem ten-god output is implemented in the canonical layer
- gangyak component evidence is implemented as `strengthProfile`, but raw-factor refactoring is still pending
- civil-date parsing and serialization are normalized to `YYYY-MM-DD` semantics in API, repository, and UI paths
- structure candidate validation now also covers first-pass `jeonwanggyeok` and `hwagyeok` signal cases

### Phase 3

- refactor gyeokguk to candidate scoring
- refactor yongshin to candidate arbitration
- connect natal and luck-cycle interaction results

### Phase 4

- expand validation dataset
- connect product analytics to interpretation versions
- build premium narrative blocks from evidence-backed outputs only

## 9. Non-negotiable rules

- No new rule without a cited source or an explicitly labeled product heuristic.
- No premium claim without evidence and confidence.
- No calendar shortcut that ignores solar-term boundaries.
- No hidden helper logic outside the canonical evaluation path for core Saju readings.
- No "big-data" claim unless the system stores versioned features and interpretation outcomes.

## 10. Research sources

Official astronomy and calendrical references:

- Hong Kong Observatory, The Sexagenary Cycle  
  https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm
- Hong Kong Observatory, The 24 Solar Terms  
  https://www.hko.gov.hk/en/gts/time/24solarterms.htm
- Hong Kong Observatory, Chinese Calendar FAQ  
  https://www.hko.gov.hk/en/gts/time/faq_chinese_calendar.htm
- NOAA Solar Calculation references  
  https://gml.noaa.gov/grad/solcalc/

Classical references:

- Zi Ping Zhen Quan  
  https://zh.wikisource.org/wiki/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%A9%AE
- Di Tian Sui  
  https://zh.wikisource.org/wiki/%E6%BB%B4%E5%A4%A9%E9%AB%93
- Shen Feng Tong Kao  
  https://ctext.org/wiki.pl?if=en&chapter=813250
- San Ming Tong Hui  
  https://ctext.org/wiki.pl?if=gb&res=410562

Product-internal references:

- `src/core/api/saju-engine.ts`
- `src/core/myeongni/elements.ts`
- `src/core/myeongni/sipsong.ts`
- `src/core/myeongni/gyeokguk.ts`
- `src/core/myeongni/yongshin.ts`
- `src/core/myeongni/sinsal.ts`
- `src/core/myeongni/daewun.ts`
- `src/__tests__/validation/golden.test.ts`
- `src/__tests__/data/golden-dataset.ts`
- `docs/ADVANCED_SCORING_PLAN.md`
