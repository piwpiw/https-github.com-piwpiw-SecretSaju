---
description: 멀티 AI 동시 개발 — Claude/Gemini/Codex 병렬 작업 충돌 방지 및 동기화
---

# Multi-AI Collaboration Workflow

Claude, Gemini, Codex가 각각 **다른 대화창**에서 같은 프로젝트를 작업할 때의 표준 프로토콜.
역할은 고정되지 않음 — 어떤 AI든 모든 작업 가능.

---

## 작업 시작 시 (모든 AI 공통, 순서 필수)

// turbo
1. `AI_BOOTSTRAP.md` 읽기 → 프로젝트 전체 상태 파악 (~2K tokens)
// turbo
2. `ERROR_LEDGER.md` 읽기 → 알려진 에러 확인, 같은 실수 방지
3. 작업 대상 파일을 `view_file`로 읽기 → **절대 기억이나 추측으로 수정하지 않는다**

## 작업 중 규칙

4. **import 추가 확인**: 새 심볼을 JSX에서 사용하면 import도 함께 추가
5. **JSX 구조 확인**: 열림/닫힘 태그 완결성 확인 (특히 ResultCard.tsx)
6. **한글 인코딩**: 파일 전체 덮어쓰기 시 UTF-8 확인
7. **공유 파일**: `globals.css`, `layout.tsx`, `schema.sql`은 추가만, 삭제 금지

## 에러 발생 시

8. `ERROR_LEDGER.md`에 즉시 기록 (에러코드 E-XXX 형식)
9. 원인과 해결법을 구체적으로 기록 — 다음 AI가 이 기록을 보고 예방함

## 작업 종료 시 (Handoff Checkpoint)

// turbo
10. `AI_BOOTSTRAP.md`의 `Last Checkpoint` 섹션을 갱신한다:
```
시각: YYYY-MM-DDTHH:MM
작업자: Claude / Gemini / Codex
작업 내용: (한 줄 요약)
다음 작업: (다음 AI가 이어받을 내용)
```
// turbo
11. 새 파일이 생겼으면 `CONTEXT_ENGINE.md §1`에 등록
// turbo
12. `DEEP_HISTORY.md`에 작업 요약 추가

---

## 왜 이 프로토콜이 필요한가?

| 문제 | 원인 | 이 프로토콜의 해결책 |
|------|------|-------------------|
| 컨텍스트 낭비 | 모델 전환 시 매번 처음부터 설명 | `AI_BOOTSTRAP.md` (2K tokens로 압축) |
| 할루시네이션 연쇄 | AI가 파일 상태를 기억에 의존 | "수정 전 view_file 필수" 규칙 |
| 에러 재발생 | 이전 AI의 에러 이력을 모름 | `ERROR_LEDGER.md` 공유 |
| 코드 복잡도 증가 | 서로 다른 스타일 혼재 | `CONTEXT_ENGINE.md` 규칙 준수 |
