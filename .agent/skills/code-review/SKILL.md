---
name: code-review
description: 코드 리뷰 — 빠른 파일 품질 검증 및 개선점 식별
---

# 🔍 Code Review Skill (Enhanced)

이 스킬은 **T7 QA** 및 모든 팀이 코드 품질을 정밀 검증하기 위해 사용합니다.

---

## 🚀 MCP sequence

1. **SYSTEM_ALIGN**: `.agent/AGENT_SYSTEM.md` 및 `CONTEXT_ENGINE.md` 로드 (프로젝트 기준 확인)
2. **TARGET_ANALYSIS**: `view_file_outline` → `view_code_item`으로 타겟 코드 분석
3. **BLAST_RADIUS**: `grep_search`로 의존성 파악
4. **CHECKLIST_EXEC**: 아래 10대 보안/성능/디자인 체크리스트 실행
5. **REPORT**: 개선 포인트 3가지 이하로 압축 보고

---

## 📋 10-Point Checklist

1. **Premium Theme**: `bg-white/5`, `backdrop-blur-md` 등 글래스모피즘 준수 여부
2. **Animation**: `framer-motion` 초기/진입 애니메이션 누락 여부
3. **Type Safety**: `: any` 사용 여부 및 인터페이스 명확성
4. **Security**: `.env` 직접 참조, 하드코딩된 Secret, API Key 노출 여부
5. **Next.js 15 Standards**: 클라이언트/서버 컴포넌트 적절 분리 (`"use client"` 위치)
6. **Performance**: 이미지 최적화(`next/image`), 불필요한 리렌더링 유발 코드
7. **Error Handling**: `try-catch` 유무 및 사용자 친화적 에러 메시지
8. **Mock Bypass**: `NEXT_PUBLIC_USE_MOCK_DATA` 환경 변수 대응 여부
9. **Saju Invariants**: (T4 전용) 엔진 계산 불변 조건 위반 여부
10. **File Position**: 프로젝트 디렉토리 구조(src/core, src/lib 등) 준수 여부

---

## 🔄 Auto-Fix Connection
- 크리티컬 이슈 발견 시 즉시 **zero-shot-fix** 스킬로 연동 처리 제안
