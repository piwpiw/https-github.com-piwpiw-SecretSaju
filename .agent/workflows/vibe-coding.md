---
description: 바이브 코딩 — 자연어 요청으로 빠르게 개발하는 워크플로우
---

# Vibe Coding Workflow

자연어 요청을 받아 **최소 컨텍스트·최대 속도**로 구현.
Context Engineering 원칙을 준수하되 최소 로드로 빠르게 진행.

---

## Step 0 — 최소 Context 로드
// turbo
- `view_file` → `.agent/CONTEXT_ENGINE.md` §5 Design System (빠른 참조)
- `view_file` → `.agent/AGENT_SYSTEM.md` Dispatch Rules (팀 자동 매핑)

## Step 1 — 의도 파악 & 팀 매핑
// turbo
- 자연어에서 핵심 작업 추출 (명사+동사)
- Dispatch Rules 기반 담당 팀 즉시 결정
- 팀 스펙 Context Loading 섹션 최소 로드

## Step 2 — Scope 탐색 (최소)
// turbo
- `view_file_outline` → 수정 대상 파일 구조만 파악
- `grep_search` → 변경 위치 정확한 라인 번호 확보
- 전체 파일 읽기 금지 — 필요한 블록만

## Step 3 — 빠른 구현
- 독립적 변경: 병렬 tool call
- 연관 변경: `multi_replace_file_content` 1회 일괄
- 디자인 규칙: `bg-white/5 backdrop-blur-md`, Framer Motion 필수

## Step 4 — 즉시 검증
// turbo
- `run_command` → `npm run build` (빌드 검증)
- 실패 시: 에러 메시지 기반 즉시 1회 수정 (zero-shot-fix 원칙)

## Step 5 — 피드백 루프
- `notify_user` → 결과 1~2문장 보고
- 추가 요청 → Step 1으로 복귀 (Context는 재사용)
