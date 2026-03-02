---
description: 대표 에이전트가 요청을 분류하고 팀에 배정하는 디스패치 워크플로우
---

# Dispatch Workflow (Automated Core)

모든 요청의 표준 진입점이자, 다중 팀 간의 **이벤트 체인 컨트롤 타워**.

---

## Step 0 — Smart Context Injection (부분 로드)
// turbo
- `grep_search` → `.agent/CONTEXT_ENGINE.md` 내 `#identity`와 `#phase` 라인 탐색.
- 알아낸 Start~End Line 구간만 `view_file`로 로드하여 현재 목표를 파악.
- (전체 컨텍스트 로딩 금지)

## Step 1 — 분류 & 매핑 브레인
// turbo
- 사용자의 프롬프트를 분해: 명사(대상)와 동사(행동) 파악.
- `.agent/AGENT_SYSTEM.md` 내 Dispatch Rules를 스캔.
- **주 실행 팀(Primary)**과 **후행 트리거 부서(Secondary)**를 확정.
- 실행 방식: 병렬(병진 가능한 컴포넌트들) 혹은 직렬.

## Step 2 — Scope Locking
// turbo
- 배정된 팀 스펙 문서를 `view_file`로 부분 조회.
- 해당 팀이 건드릴 수 없는 파일(`Read-only`이거나 다른 파트 관할)을 명확히 배제한 탐색 지침 생성.
- `view_file_outline`으로 목적지 파일 아웃라인만 스캔 후 작업 라인 특정.

## Step 3 — 🚀 Skill Activation & Handoff Chain
- 팀 스스로 작업이 불가능할 경우(예: API 기반이라 UI를 모름), 해당 팀은 즉시 `/api-gen` 스킬 등을 기동.
- 작업 종료 즉시 (에이전트 판단 하에) **Handoff Trigger JSON**을 발행.
- Dispatch 시스템은 해당 JSON을 캡처하여 **다음 대상 팀을 강제 기동(Wake)**.

```json
// Handoff Wake Signal (Example)
{
  "chain_id": "DISPATCH-WAKE-0001",
  "from_team": "T3",
  "to_team": "T2",
  "trigger_event": "API_GENERATED",
  "payload": {"API_URI": "/api/users", "action": "연동 컴포넌트 생성 개시"}
}
```

## Step 4 — QA Gate (통합 방어선)
// turbo
- `npm run qa` 실행.
- T7 QA 에이전트에 통과 검토를 무개입 핑(Ping) 전송.

## Step 5 — 지식 스냅샷 보고 (Memory & Notify)
- 기능 구현, 패치, 스펙 변경 내역을 `CONTEXT_ENGINE.md` 해당 파트 해시태그(`#decisions`, `#errors` 등)를 찾아 업데이트.
- 변경점 **1문장 요약** 후 `notify_user` 송출.
