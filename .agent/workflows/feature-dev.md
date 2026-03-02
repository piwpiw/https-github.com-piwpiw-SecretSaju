---
description: 기능 추가 — 새로운 기능을 체계적으로 빠르게 구현하는 표준 플로우
---

# Feature Development Workflow (Automated Pipeline)

새 기능을 최소 비용으로 체계적으로 구현하고, 인간 개입 없이 **다음 부서로 자동 체인 연결(Automated Handoff)** 하는 ReAct 진화 플로우입니다.

---

## Step 0 — Smart Context Injection (부분 로딩)
// turbo
- `grep_search` → `.agent/CONTEXT_ENGINE.md` 내 `#phase` 및 `#design` 위치 파악
- `view_file` → 해당 10~20줄의 범위만 부분 로딩하여 컨텍스트 획득
- 목표 팀의 스펙 문서 매핑

## Step 1 — Blast Radius & Import Tracing
// turbo
- 기능 추가를 위해 수정해야 하는 파일들을 `view_file_outline`으로 구조 파악
- `grep_search`를 통해, 이 모듈을 Import하고 있는 상위 계층 파일을 모두 스캔 (연쇄 파괴 방어)

## Step 2 — Skill Chaining Execution
- UI 작업 → `/component-gen` 자동 MCP 시퀀스 구동
- 로직 작업 → `/api-gen` 자동 MCP 시퀀스 구동
- 코드 병합은 `multi_replace_file_content`로 원샷 타격
- *작업 중 발생한 Handoff 필요성은 Step 5에서 일괄 처리*

## Step 3 — Quality Gate (Zero-Shot 연동)
// turbo
- `run_command` → `npm run qa`
- 에러 발생 시 → 즉각 `/zero-shot-fix` 스킬 자율 기동
- *2턴 이상 에러 발생 시 로직 롤백 후 T7 QA로 구조 진단 에스컬레이션*

## Step 4 — State Memory Update
- `CONTEXT_ENGINE.md` 내 `#filemap` (신규 파일 추가 분), `#errors` (신규로 해결된 버그 패턴) 즉각 기록.
- 이 과정은 문서 추적 봇으로서 의무.

## Step 5 — 🤖 Automated Trigger & Handoff
- 모든 개발이 완료되었다면 작업은 여기서 끝나는 것이 아닙니다. 
- *AGENT_PROTOCOLS.md*의 [1. Automation Trigger Rules]를 스캔하십시오.
- `API_GENERATED`, `UI_COMPILED` 등 자신에게 해당하는 Trigger JSON을 작성하여, 즉시 **다음 팀을 에이전트 내에서 직접 구동(Call)** 시켜 작업의 연쇄 반응을 만드십시오.
- 다음 대상 팀이 성공적으로 확인 메시지를 반환했을 때만, 사용자(User)에게 `notify_user`로 "기능 배포 완료 및 연관 팀 검증 중"이라고 1문장 보고합니다.
