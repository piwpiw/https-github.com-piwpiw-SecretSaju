---
name: test-gen
description: 테스트 자동 생성 — 단위/통합/E2E 테스트 매트릭스 기반 생성
---

# 🧪 Test Generator Skill (Enhanced)

프로젝트 무결성을 위한 **Vitest 및 Playwright/Subagent** 기반 테스트를 자동 생성합니다.

---

## 🚀 MCP sequence

1. **LOGIC_READ**: `view_code_item`으로 테스트 대상 로직 정밀 분석
2. **MOCK_PREP**: `src/lib/supabase.ts` 등 의존 모듈 모킹(Mocking) 전략 수립
3. **MATRIX_CONFIG**: 테스트 매트릭스(Normal/Edge/Error Case) 정의
4. **FILE_WRITE**: `src/__tests__/` 또는 지정된 경로에 테스트 코드 생성
5. **EXECUTION**: `run_command` → `npx vitest run {file}`

---

## 📐 Test Matrix Standards

| 유형 | 대상 | 도구 | 기준 |
|------|------|------|------|
| **Unit** | 엔진 함수, 유틸리티 | Vitest | 엣지 케이스 포함 100% 통과 |
| **Integrated** | API Routes, DB 연동 | Vitest + Supertest | 성공/실패 응답 규격 확인 |
| **E2E** | 사용자 흐름 (로그인~결제) | Playwright / Browser Subagent | 핵심 퍼널 성공 여부 |

---

## 🔄 Automation Hook
- 테스트 생성 및 실패 시 → 즉시 **T7 QA**에 Handoff 하여 **Error Catalog** 등재 요청
- 엔진 수정 시(`src/core/`) → 자동으로 `scripts/verify_engine.ts` 실행 포함
