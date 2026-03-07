# SecretSaju AI Bootstrap (v1.1)
# 이 파일은 어떤 AI 모델이든 프로젝트를 즉시 이해하기 위한 압축 컨텍스트입니다.
# 모든 AI 작업의 첫 번째 단계: 이 파일을 읽는다.

## Identity
사주(四柱) 기반 운명 분석 SaaS. Next.js 15 + Supabase + Framer Motion. 하이엔드 감성 UI.

## Tech Stack
- Framework: Next.js 15 (App Router), TypeScript, React 19
- DB: Supabase (PostgreSQL + RLS)
- Auth: Kakao OAuth + MCP OAuth 2.1 (PKCE)
- Styling: Tailwind CSS + Framer Motion
- Payment: Toss Payments → Jelly 크레딧 시스템
- AI: GPT-4o / Claude 3.5 / Gemini 1.5 (MPPS 앙상블, 폴백 체인)

## Critical File Map
```
src/lib/saju.ts                       ← 만세력 엔진 (60갑자 계산 + Lineage/Canonical 통합)
src/core/api/saju-lineage.ts          ← 사주 학파(Lineage) 프로필 엔진
src/core/api/saju-canonical.ts        ← 명리학적 근거(Evidence) 정규화
src/core/calendar/ganji.ts            ← GanJi 타입 + getDayPillar/getHourPillar
src/core/api/saju-engine.ts           ← 고정밀 사주 API
src/core/myeongni/                    ← 명리학 모듈 (대운/격국/신살/십성/12운성)
src/lib/auth-mcp.ts                   ← MCP OAuth 2.1 PKCE (557줄, 17개 에러코드)
src/lib/kakao-auth.ts                 ← Kakao OAuth
src/lib/persona-matrix.ts             ← AI 페르소나 매트릭스 (연령×성향=30종)
src/core/ai-routing.ts                ← LLM 라우팅 미들웨어 (rawSajuData optional)
src/app/api/persona/route.ts          ← LLM 실연동 (GPT-4o→Claude→Gemini→폴백)
src/components/ui/TransitTicker.tsx   ← 실시간 만세력 (getDayPillar/getHourPillar)
src/components/ui/ProfileWallet.tsx   ← 사주 프로필 DB 관리 (/api/saju/list,delete)
src/components/result/AINarrativeSection.tsx ← AI 서사 (API 자동 호출 + 로딩)
src/components/ResultCard.tsx         ← 메인 결과 카드 (571줄, 핵심 UI)
src/app/page.tsx                      ← 홈페이지 (607줄, FlowState 머신)
supabase/schema.sql                   ← DB 스키마 (381줄, 10+ 테이블)
tests/saju-engine.test.ts             ← 사주 엔진 테스트 20개
tests/ai-routing.test.ts              ← AI 라우팅 테스트 8개
tests/payment-flow.test.ts            ← 결제 로직 테스트 12개
vitest.logic.config.ts                ← React 없는 순수 로직 테스트 설정
CONTEXT_ENGINE.md                     ← 프로젝트 전체 지도 (상세)
NEXT_ACTIONS.md                       ← 유일한 작업 SSOT (P0/P1/P2)
ERROR_LEDGER.md                       ← 에러 이력 (ERR-L001 활성)
docs/00-overview/DEEP_HISTORY.md      ← 모든 결정의 "왜" 기록
```

## Current State (2026-03-06)
- Wave 1-10: ✅ 완료 (엔진, Auth, 경제, UI, 감각 레이어)
- Wave 11 (MPPS): ✅ 실구현 완료
  - `/api/persona` 실연동 (GPT-4o→Claude→Gemini→폴백)
  - `TransitTicker` 만세력 실연동 (오행 충돌 감지)
  - `ProfileWallet` DB 실연동 (/api/saju/list, delete)
  - `AINarrativeSection` API 자동 호출 + 로딩 UI
  - ⚠️ 필요: LLM API 키 환경변수 설정
- Wave 11.5: ✅ Context Efficiency (AI_BOOTSTRAP, ERROR_LEDGER, anti-hallucination)
- Wave 11.6: ✅ 통합 감사 7개 수정 + P0 전체 + P1 대부분 완료
- 테스트: 40개 작성 (saju-engine, ai-routing, payment-flow)
  - ERR-L001 해결 후 `npx vitest run --config vitest.logic.config.ts` 실행 가능
- 확인: `npm run build` exit 0, `npx tsc --noEmit` exit 0
- 배포: Vercel 프로덕션 완료 (2026-03-05)
- 현재 P2 대기: `NEXT_ACTIONS.md` P2 항목 (PWA, GA4, Content DB)

## Last Checkpoint
```
시각: 2026-03-06T00:35
작업자: Claude
완료:
  - Wave 11.6 P0 전체 구현 (/api/persona LLM 체인, TransitTicker 만세력, ProfileWallet DB)
  - 테스트 40개 작성 (saju-engine/ai-routing/payment-flow)
  - MASTER_PRD v6.0, 문서 7개 단절점 연동 수정
  - ERR-L001 (rollup win32) ERROR_LEDGER 등재
  - DEEP_HISTORY.md Wave 11.6 이력 추가
다음 작업:
  - API 키 설정 후 LLM 실연동 테스트
  - ERR-L001 해결 후 vitest 실행
  - P2: PWA manifest, GA4, Content DB, Mock 정리
에러:
  - ERR-L001: rollup win32 네이티브 모듈 미설치 (ERROR_LEDGER 참조)
```

## Rules (절대)
1. 수정 전 반드시 `view_file`로 현재 상태 확인 — 가정하지 마라
2. 작업 후 이 파일의 `Last Checkpoint`를 갱신하라
3. 에러 발생/해결 시 `ERROR_LEDGER.md`에 반드시 기록하라
4. 공유 파일(globals.css, layout.tsx, schema.sql)은 추가만, 삭제/구조변경 금지
5. 한글 인코딩 주의 — UTF-8 BOM 없이 저장
6. 작업 항목은 `NEXT_ACTIONS.md`에서 가져오라 — 다른 문서의 체크리스트는 이력용

## Model Tips (강제 아님, 참고용)
- **Claude**: 복잡한 UI 로직, 보안 코드, 감정적 서사 작성에 강함
- **Gemini**: 대규모 리팩토링, 긴 파일 분석, 아키텍처 검토에 강함
- **Codex/GPT**: API 보일러플레이트, 테스트 생성, 빠른 패치에 강함

## 알려진 블로커
- **ERR-L001**: `npx vitest run` → rollup win32 네이티브 모듈 미설치 에러
  - 원인: `vercel.json` installCommand `--omit=optional` (npm bug #4828)
  - 대안: `npx tsc --noEmit` 타입 검사 (✅ 통과)
  - 해결: `ERROR_LEDGER.md ERR-L001` 참조
## Resume Checkpoint
```
Time: 2026-03-06T09:55+09:00
Agent: Codex
Observed:
  - `lint` and `npx tsc --noEmit` were already passing before reboot.
  - The active blocker was local `next dev` instability on `/login`, not a production build failure.
  - `tmp-dev-score.log` shows webpack cache rename failures (`EPERM`) followed by
    `TypeError: __webpack_modules__[moduleId] is not a function` and `_next/static` 404s.
Action taken:
  - Updated `scripts/dev-safe.js` to remove `.next/cache/webpack` before starting dev by default.
  - Added `--skip-cache-clean` and `--clean-full` flags for controlled recovery.
Next:
  - Start local dev with `npm run dev:safe` or `npm run dev:safe:quick`.
  - Re-check `/login` after cache cleanup.
  - Continue remaining P1/P2 work once dev runtime is stable.
```
