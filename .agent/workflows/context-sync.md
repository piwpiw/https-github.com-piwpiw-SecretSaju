---
description: CONTEXT_ENGINE.md 동기화 — 프로젝트 상태를 최신으로 유지하는 워크플로우
---

# Context Sync Workflow

`CONTEXT_ENGINE.md`가 실제 프로젝트 상태와 일치하도록 주기적으로 동기화.
대형 기능 완료 후 또는 Sprint 시작 전에 실행.

---

## 실행 조건
- 대형 기능 완료 직후
- 새 Sprint(Phase) 시작 전
- 팀원이 "컨텍스트가 낡은 것 같다"고 판단할 때
- `/context-sync` 명시적 호출 시

---

## Step 1 — 완료 기능 확인
// turbo
```powershell
git log --oneline -20
```
최근 커밋 분석 → 완료된 기능 목록 도출

## Step 2 — Phase 업데이트
// turbo
- `view_file` → `CONTEXT_ENGINE.md` §3 Current Phase
- 완료 → ✅, 진행중 → 🔄, 예정 → 📋

## Step 3 — File Map 업데이트
// turbo
- `list_dir` → `src/app/`, `src/components/`, `src/app/api/`
- 신규 파일 → `CONTEXT_ENGINE.md` §2 File Map에 추가
- 삭제된 파일 → 해당 항목 제거

## Step 4 — Error Catalog 정리
- `CONTEXT_ENGINE.md` §8 Error Catalog 확인
- 해결된 에러 → 해결책 업데이트
- 새로 발견된 패턴 → 신규 항목 추가

## Step 5 — Design System 업데이트
// turbo
- `view_file_outline` → `src/app/globals.css` (신규 CSS 변수 확인)
- 신규 토큰 → `CONTEXT_ENGINE.md` §5 Design System에 반영

## Step 6 — 동기화 결과 보고
- `notify_user` → "CONTEXT_ENGINE 동기화 완료. Phase X: 완료 N개, 진행 M개."
