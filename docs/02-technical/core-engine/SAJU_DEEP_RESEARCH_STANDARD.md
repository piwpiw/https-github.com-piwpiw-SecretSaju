# Saju Deep Research Standard (압축 요약)
> Date: 2026-03-06 | Companion: SAJU_VALIDATED_IMPLEMENTATION_BLUEPRINT.md

## 소스 계층 (Source Hierarchy)

| Tier | 용도 | 주요 소스 |
|------|------|-----------|
| A (최우선) | 절기 경계, 시간 정규화, 달력 변환 | Hong Kong Observatory, IANA tzdb |
| B | 일주 우선순위, 월령, 격국/용신 해석 규칙 | 子平真詮, 滴天髓, 神峯通考, 三命通會 |
| C | 회귀 교차검증, 출력 비교 | 상용 계산기 (규칙 승격 불가) |
| D | UX 랭킹, 문구, 전환율 | 내부 애널리틱스 (원국 규칙 재정의 불가) |

**규칙**: Tier C/D는 규칙을 정의할 수 없음. Tier A가 시간/달력 충돌 시 항상 우선.

## 엔진 표준 요구사항

### 시간/달력
- civil 출생시각 + timezone 저장 (별도 true solar time 필드)
- 월경계는 음력월이 아닌 **절기**로 결정
- `calendarType`, `isLeapMonth`, `timeUnknown` 플래그 필수

### Canonical Feature Layer
프리미엄 콘텐츠는 반드시 canonical 객체에서만 읽어야 함:

```
chart_core / hidden_stems / element_scores
ten_gods_surface + ten_gods_hidden / interaction_events
strength_scores / structure_candidates / yongshin_candidates
luck_cycles / auxiliary_signals / evidence_log
```

### 출력 표준 (신뢰/결제에 영향하는 모든 블록)
- `summary` / `evidence` / `rule_source` / `confidence` / `conflict_flags` / `data_quality`

## 현재 구현 감사 결과

### 강한 영역 ✅
- `saju-engine.ts` — 정밀 절기 로직, lineage policy 메타데이터
- `saju-canonical.ts` — canonical chart, structured evidence
- `civil-date.ts` — YYYY-MM-DD 파싱 정규화
- `elements.ts` — hidden stem + seasonal weighted element scoring
- `interactions.ts` — natal pair/three-combination/transit 이벤트

### 약한 영역 ⚠️
- `sipsong.ts` — 표면 지향; hidden-stem kinship/protrusion 추론 미완
- `gyeokguk.ts` — first-pass 신호 탐지 수준; lineage-grade 특수격 판정 미완
- `yongshin.ts` — johoo+eokbu 위주; tonggwan/byeongyak 대안 후보 미완
- `sinsal.ts` — 좁은 신살 커버리지
- golden dataset — 10개 (목표 300+, 심각하게 부족)

## 구현 단계

| Phase | 상태 | 내용 |
|-------|------|------|
| 1 | ✅ | canonical schema, rule path 통합, evidence/confidence 계약 |
| 2 | 🔄 부분 | interaction engine, hidden-stem 가중 행렬, gangyak evidence |
| 3 | ⏳ | gyeokguk/yongshin candidate arbitration, luck-cycle 연결 |
| 4 | ⏳ | 검증 데이터셋 확장, 애널리틱스-버전 연결 |

## 절대 규칙 (Non-negotiable)

1. 인용 소스 없는 새 규칙 추가 금지 (또는 명시적 product heuristic 라벨 필수)
2. Evidence/confidence 없는 프리미엄 클레임 금지
3. 절기 경계를 무시하는 달력 지름길 금지
4. 핵심 사주 읽기에서 canonical 경로 외부에 숨겨진 helper 로직 금지
5. 버전된 feature/해석 결과 저장 없이 "빅데이터 기반" 주장 금지

Last Updated: 2026-03-08
