---
description: 대표 에이전트가 요청을 분류하고 팀에 배정하는 디스패치 워크플로우
---

# Dispatch Workflow

## 1. 요청 분석
// turbo
- `.agent/AGENT_SYSTEM.md`의 Dispatch Rules 테이블을 참조하여 키워드 매칭

## 2. 팀 선택
- 1차 팀 결정 (키워드 기반)
- 2차 팀 필요 여부 확인 (크로스팀 의존성)

## 3. 팀 스펙 로드
// turbo
- 선택된 팀의 `.agent/teams/team-XX-*.md` 파일을 `view_file`로 읽기
- Scope, MCP Tools, Skills 확인

## 4. 과금 규칙 확인
// turbo
- `.agent/COST_RULES.md` 참조
- 팀 Cost Tier에 따른 tool call 예산 확인

## 5. Scope-Bounded 작업 수행
- 팀 스펙의 Scope 경로만 접근
- `view_file_outline` 우선 → 필요 범위만 `view_file`/`view_code_item`
- 변경은 `replace_file_content` 또는 `multi_replace_file_content`

## 6. 크로스팀 의존성 처리
- Dependencies에 명시된 팀이 선행 작업 필요 시 순차 실행
- 충돌 발생 시 대표 에이전트가 scope 기준으로 판단

## 7. 결과 통합·보고
- 변경 파일 목록
- 빌드/테스트 결과 (필요 시 T7 QA 호출)
- 관련 문서 업데이트 여부 확인
