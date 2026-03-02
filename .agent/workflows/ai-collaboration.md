---
description: 문서 기반 AI 협업 사이클 — Context Engineering 기반 고도화 방법론
---

# 🌀 AI Collaboration Cycle

본 프로젝트는 **Context Engineering**을 핵심으로 한 문서 기반 AI 협업 방법론을 엄격히 준수합니다.
문서가 곧 에이전트의 컨텍스트이자 진실의 원천(Source of Truth)입니다.

---

## 1. Context Engineering First (컨텍스트 우선)

모든 작업의 출발점은 `CONTEXT_ENGINE.md`입니다:
- 에이전트는 `CONTEXT_ENGINE.md`를 **신선한 상태로 유지**할 책임이 있습니다.
- 모든 중요한 결정, 에러 해결, Phase 변경은 즉시 반영합니다.
- 낡은 컨텍스트는 에이전트 환각(Hallucination)의 주된 원인입니다.

---

## 2. Document → Design → Code → Sync (개발 사이클)

```
1. 문서화(Documentation)
   → 요구사항 발생 시 MASTER_PRD.md 또는 task.md 기록

2. 설계 먼저(Design First)
   → implementation_plan.md 작성 → 유저 승인 수령

3. AI 코드 생성
   → 설계 기반 코딩 (write_to_file, replace_file_content)
   → 항상 팀 Scope 내에서만 작업

4. 즉시 동기화(Immediate Sync)
   → 구현 완료 후 CONTEXT_ENGINE.md 업데이트 (Phase, File Map, Error Catalog)
```

---

## 3. Zero Script QA (로그 기반 자동 분석)

```
- 코딩 완료 후 npm run qa 실행
- 에러 로그 → Error Catalog 등재 (재발 원천 차단)
- 동일 에러 2회 반복 → Failure Escalation Protocol 발동
```

---

## 4. Knowledge Tree (구조화된 지식 관리)

```
.agent/
├── CONTEXT_ENGINE.md     ← 살아있는 프로젝트 상태 (Always Fresh)
├── AGENT_PROTOCOLS.md    ← 에이전트 행동 규약 (Stable)
├── AGENT_SYSTEM.md       ← 아키텍처 허브 (Version-controlled)
├── teams/                ← 팀별 전문 지식 (Independent)
├── workflows/            ← 반복 작업 자동화 (Reusable)
└── skills/               ← 단일 실행 모듈 (Atomic)

docs/
├── MASTER_PRD.md         ← 비즈니스 요구사항 (T1 관리)
└── ERROR_CATALOG.md      ← 상세 에러 해결법 (T7 관리)
```

---

## 5. 마이크로 타임박싱 (10분 단위 작업)

- 작업을 **10분 단위 마이크로 태스크**로 분할
- 각 단위 완료 시 Context Engine 즉시 업데이트
- 비효율 발견 시 해당 워크플로우 파일(이 문서) 자가 업데이트
- `notify_user`로 진행 상황 주기적 보고

---

## 6. Handoff Protocol (팀 간 지식 전달)

팀 간 이관 시 `AGENT_PROTOCOLS.md` Handoff Schema 필수 준수:
- 구두(텍스트) 설명 → JSON 포맷으로 형식화
- Handoff 없는 팀 전환 금지
