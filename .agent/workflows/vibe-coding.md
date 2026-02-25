---
description: 바이브 코딩 — 자연어 요청으로 빠르게 개발하는 워크플로우
---

# Vibe Coding Workflow

자연어 요청을 받아 최소 컨텍스트로 빠르게 구현하는 워크플로우.

## 1. 의도 파악
// turbo
- 사용자 자연어 요청에서 핵심 작업 추출
- `.agent/AGENT_SYSTEM.md` Dispatch Rules로 팀 자동 매칭

## 2. 최소 컨텍스트 수집
// turbo
- 관련 팀 스펙의 Scope 파일만 `view_file_outline`으로 구조 파악
- 변경 필요한 파일만 정밀 읽기

## 3. 빠른 구현
- 변경 범위 최소화 (Incremental Context)
- 독립적 변경은 병렬 tool call
- 관련 변경은 `multi_replace_file_content`로 일괄

## 4. 즉시 검증
// turbo
- `npm run build` (빌드 검증)
- 실패 시 에러 메시지 기반 즉시 수정

## 5. 피드백 루프
- 결과 보고 → 사용자 피드백 → 반복
- 추가 요청 시 Step 1로 복귀
