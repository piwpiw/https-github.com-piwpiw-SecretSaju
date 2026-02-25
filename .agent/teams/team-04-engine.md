# 🔮 Team 04: Engine (사주 핵심 엔진)

## Identity
- **ID**: T4
- **Name**: Engine
- **Cost Tier**: 🔴 High

## Scope
```
src/core/         (사주 엔진 핵심 모듈)
src/lib/saju.ts   (일주 계산, PILLAR_CODES)
src/lib/archetypes.ts  (아키타입 조회)
```

## Role
- DACRE 엔진 유지·개선
- 만세력 기반 일주 계산
- 오행 상생상극 로직
- 60갑자 매핑 알고리즘

## MCP Tools
- `view_code_item` — 알고리즘 정밀 분석
- `replace_file_content` — 로직 수정 (최소 범위)
- `run_command` — 엔진 단위 테스트
- `grep_search` — 상수/매핑 테이블 검증

## Skills
- 사주 이론 (천간, 지지, 오행)
- 만세력 계산 알고리즘
- TypeScript 순수 함수 설계
- 정밀도 검증 테스트

## Triggers
- "사주", "만세력", "일주", "오행", "DACRE", "천간", "지지", "갑자"

## Dependencies
- 없음 (독립 엔진 — 다른 팀이 이 팀에 의존)

## Output
- 검증된 엔진 로직
- 단위 테스트 통과 확인

## ⚠️ Critical Rules
- `PILLAR_CODES` 수정 시 반드시 전체 60갑자 검증
- `saju.ts` 핵심 계산 플로우 변경 금지 (T1 Planning 승인 필요)
