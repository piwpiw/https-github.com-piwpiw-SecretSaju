# Saju Validated Implementation Blueprint (압축 요약)
> 상세 원문은 docs/archive/decision-history/ 참조. Companion: SAJU_DEEP_RESEARCH_STANDARD.md

## 핵심 수정 사항 (Heuristic으로 다운그레이드)

이것들은 "표준"이 아니라 **제품 휴리스틱**으로 처리해야 함:
- 고정 `30/30/40` deukryeong/deukji/deukse 분할
- 고정 최종점수 `(gangyak*0.3) + (gyeokguk*0.4) + (yongshin*0.3)`
- 고정 임계값 `>= 60 => strong`, `< 40 => weak`
- 23:00-00:59 출생 단일 해석

이유: 고전 소스가 중요성을 지지하지만, 보편적 수치 공식은 없음.

## 8계층 파이프라인 아키텍처

```
1. Input normalization     → YYYY-MM-DD, timezone, leap-flag
2. Civil-time reconstruction → historical UTC offset + DST + birthInstantUtc
3. Astronomical boundary    → lichun_instant, major/minor term timestamps
4. Pillar derivation        → year(myeongri/official), month, day, hour + policy snapshot
5. Canonical feature        → CanonicalChart 객체 생성
6. Rule evaluation          → 버전/소스 포함 RuleDefinition 레지스트리
7. Explanation assembly     → Evidence 기반 서사 생성
8. Analytics capture        → 버전 태깅된 이벤트 수집
```

## CanonicalChart 핵심 스키마

```ts
interface CanonicalChart {
  chartId: string; chartVersion: string; lineageProfileId: string;
  input: { calendarType; isLeapMonth; birthTimeKnown; timezoneId; location; };
  time: { civilBirthTime; birthInstantUtc; trueSolarTime; historicalUtcOffset; };
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar; };
  hiddenStems; elements; tenGods; interactions; strength; structures;
  yongshin; luck; auxiliary; evidence: EvidenceEntry[];
}
```

**규칙**: 프리미엄 해석은 반드시 이 객체에서만 읽어야 함 (ad hoc 유틸 직접 접근 금지).

## 현재 구현 상태

| 영역 | 상태 |
|------|------|
| exact solar-term logic (saju-engine.ts) | ✅ 완료 |
| civil-date normalization (civil-date.ts) | ✅ 완료 |
| lineage policy (yajasi/day_boundary/hour_branch) | ✅ 완료 |
| canonical output + evidence (saju-canonical.ts) | ✅ 완료 |
| Intl-based lunar-solar conversion | ✅ 완료 |
| visible interaction events (natal/transit) | ✅ 완료 |
| hidden-stem ten-god canonical output | ✅ 완료 |
| global timezone generalization | ⏳ 부분 완료 |
| gyeokguk candidate arbitration (lineage-grade) | ⏳ 미완 |
| yongshin arbitration (special-pattern) | ⏳ 미완 |
| golden dataset (현재 10개, 목표 300+) | ⏳ 부족 |

## 롤아웃 단계

| Phase | 상태 | 내용 |
|-------|------|------|
| 1 | ✅ 완료 | canonical feature schema, evidence output |
| 2 | 🔄 부분 | interaction engine, hidden-stem matrix, gangyak evidence |
| 3 | ⏳ | gyeokguk/yongshin candidate arbitration, luck-cycle 연동 |
| 4 | ⏳ | 검증 데이터셋 확장, 애널리틱스 버전 연결 |

## Big-data 필수 테이블

```
birth_inputs_raw / birth_inputs_normalized / charts_canonical
chart_features / rule_evaluations / interpretation_outputs
premium_unlock_events / user_feedback_events / chart_ground_truth_cases
```

**버전 필드 (모든 계산 테이블 필수)**: `calendar_engine_version`, `rule_engine_version`, `lineage_profile_id`, `copy_engine_version`

## 검증 목표 (Golden Dataset)

| 케이스 유형 | 목표 |
|------------|------|
| 절기 경계/달력 정확성 | 300+ |
| 형충합파해 상호작용 | 200+ |
| 강약 엣지케이스 | 150+ |
| 격국/용신 충돌 | 100+ |
| 원국+대운 복합 | 100+ |

Last Updated: 2026-03-08
