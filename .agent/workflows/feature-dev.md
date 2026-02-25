---
description: 기능 추가 — 새로운 기능을 체계적으로 빠르게 구현하는 표준 플로우
---

# Feature Development Workflow

새 기능을 최소 비용으로 체계적으로 구현.

## 1. 요구사항 확인
// turbo
- `.agent/AGENT_SYSTEM.md` 읽어서 해당 팀 결정
- 해당 팀 스펙 `.agent/teams/team-XX-*.md` 스캔

## 2. 영향 범위 분석
// turbo
- `grep_search`로 관련 코드 탐색 (팀 scope 내에서만!)
- `view_file_outline`으로 수정 대상 파일 구조 파악

## 3. 스킬 기반 생성
- 컴포넌트 필요 → `/component-gen` 스킬
- API 필요 → `/api-gen` 스킬
- 테스트 필요 → `/test-gen` 스킬
- 버그 → `/quick-fix` 스킬

## 4. 구현
- 관련 파일 수정 (scope-bounded)
- 병렬 가능한 변경은 동시 tool call
- 순차 의존성 있으면 `waitForPreviousTools: true`

## 5. 검증
// turbo
- `/perf-check` 워크플로우 실행
- 실패 시 `/quick-fix` 스킬로 즉시 수정

## 6. 결과 보고
- 변경 파일 목록
- 빌드/테스트 결과
