# Engineering Testing Guide

SOT: 테스트 운영 기준은 이 문서가 단일 기준이다.
테스트 케이스 상세는 기능별 문서에 유지하되, 게이트/절차는 이 문서를 우선한다.

## Document Priority

- 테스트 운영 단일 근거(SOT): `docs/01-team/engineering/testing-guide.md`
- 배포 운영 상세는 `docs/01-team/engineering/deployment-guide.md`와 `docs/guides/deployment.md`를 참고한다.
- 충돌 시 본 문서(테스트 SOT)가 우선한다.
- 문서 충돌 판단은 각 문서의 `Last Updated`/`Next Review`로 동기화 상태를 확인한 뒤 처리한다.

## Base Gates
- `npm run preflight:local` (기본: 병렬)
- `npm run test`
- `vitest.config.ts` / `vitest.logic.config.ts` / `vitest.golden.config.ts`
  - 로컬 OOM 방지를 위해 `maxWorkers: 2`로 제한
- `npm run build`

## Command Policy
- `npm run preflight:local`
  - 병렬 게이트: `lint` + `tsc --noEmit`
- `npm run preflight:local:serial`
  - 직렬 재현용 게이트
- `npx vitest run --config vitest.logic.config.ts`
  - 순수 로직 테스트 전용 빠른 게이트
- `npm run test:logic`
  - `tests/*.test.ts`만 실행
- `npm run test:engine`
  - 사주 엔진 핵심 검증 게이트
- `npm run test:golden`
  - 골든 데이터셋 회귀 검증(현재 별도 추적 대상)
- `npm run test:local`
  - `preflight + test` 통합 빠른 게이트
- `npm run test:engine:local`
  - `preflight + engine test + build`
- `npm run test:release`
  - `preflight + test + build`
- `npm run pre-deploy -- --parallel-checks`
  - pre-deploy의 병렬 실행 확인
- `npm run dev:safe -- --port 3000 --auto-port`
  - 로컬 실행 기본 명령(포트 정리 + preflight + dev server)
- `npm run dev:safe:quick -- --port 3000`
  - preflight를 생략한 긴급 재현용 실행
- `npm run smoke:auth`
  - 로그인 핵심 라우트(`/`, `/login`, `/signup`, `/auth/callback`) 스모크
- `npm run smoke:fast`
  - 관리자/브라우저 핵심 플로우 병렬 스모크
- `npm run smoke:full`
  - home/admin/browser 전체 브라우저 스모크 + 로그 리포트 생성

## Current Inventory (2026-03-07)
- Static gate
  - `npm run preflight:local`
  - `npm run lint`
  - `npx tsc --noEmit`
- Fast logic tests
  - `vitest.logic.config.ts`
  - 대상: `tests/saju-engine.test.ts`, `tests/ai-routing.test.ts`, `tests/payment-flow.test.ts`, `tests/auth-wallet.test.ts`
- Engine validation tests
  - `src/__tests__/unit/astronomy.test.ts`
  - `src/__tests__/validation/candidate-engines.test.ts`
  - `src/__tests__/validation/civil-date.test.ts`
  - `src/__tests__/validation/lunar-solar.test.ts`
  - `src/__tests__/validation/interactions.test.ts`
  - `src/__tests__/validation/saju-engine-metadata.test.ts`
  - `src/__tests__/validation/golden.test.ts`
- Browser/route smoke
  - `npm run smoke:auth`
  - `npm run smoke:fast`
  - `npm run smoke:full`
  - `npm run qa`
- Build gate
  - `npm run build`

## Known Issues (Fact-based)
1. `golden.test.ts` is intentionally separated from the default `npm test` gate.
   - 목적: 일상 개발 게이트를 빠르고 안정적으로 유지
   - 운영 원칙: 엔진/학파/경계값 변경 시에만 별도 실행
2. `src/__tests__/data/golden-dataset.ts`는 현재 10건만 포함한다.
   - 현재 회귀는 통과하지만, 표준화 수준의 엔진 검증 세트로 보기에는 표본이 너무 작다.
   - 경계 케이스와 학파 분기 케이스를 계속 확장해야 한다.

## Recommended Local Strategy

### Tier 1: Fast feedback (< 15s)
Use for most code edits.

1. `npm run preflight:local`
2. `npx vitest run --config vitest.logic.config.ts`

### Tier 2: Engine-safe gate (~ 10-20s)
Use for calendar, saju, premium interpretation, API response-shape changes.

1. `npm run preflight:local`
2. `npm run test:engine`
3. `npm run build`

### Tier 3: Release gate
Use before deploy or after cross-cutting changes.

1. `npm run dev:safe -- --port 3000 --auto-port`
2. `npm run smoke:auth`
3. 영향 범위가 넓으면 `npm run smoke:fast`
4. 최종 `npm run build`

### Tier 4: Research / regression gate
Use for engine correctness work only.

1. `npm run test:golden`
2. 실패 시 데이터셋/학파 정책/엔진 로직을 분리 분석한다.

## Operational Rule
- 일상 개발 기본 게이트는 `preflight + logic vitest`로 고정한다.
- 기본 통합 게이트는 `npm run test:local` 또는 `npm run test:release`를 사용한다.
- `npm test`는 범위를 고정한 뒤 기본 테스트 묶음으로 사용한다.
- `golden.test.ts`는 일상 게이트가 아니라 엔진 회귀 게이트로 분리한다.
- 브라우저 smoke는 로그인/결제/결과 페이지처럼 UI와 API가 같이 엮이는 변경에서만 추가한다.

## Incident Root Causes (2026-03)
1. 포트 충돌: 기존 `next dev` 프로세스가 남아 `EADDRINUSE`를 반복 유발
2. TSX 문자열 파손: 부분 수정 중 따옴표/태그 닫힘 누락으로 빌드 파서 실패
3. 인코딩 훼손: 한글 문자열이 깨진 상태에서 추가 수정되어 문법 오류가 연쇄 발생
4. 사전 게이트 누락: 수정 후 preflight 없이 브라우저 확인부터 진행하여 오류 발견이 지연됨

## Recurrence Prevention Gate (Mandatory)
1. 로컬 실행 시작은 `npm run dev:safe -- --auto-port`를 기본으로 한다.
2. Auth/Modal/Callback 경로 수정 시 브라우저 검증 전에 `npm run preflight:local`을 반드시 통과한다.
3. 로그인 계열 변경 시 `npm run smoke:auth`를 통과한다.
4. 인코딩 깨짐 문구가 보이면 즉시 해당 파일 전체를 UTF-8 기준으로 복구 후 수정한다.
5. 동일 에러 2회 반복 시, 부분 패치 중단 후 파일 단위 교체 전략으로 전환한다.

## Test Layers
1. Static quality: lint + type-check
2. Fast logic tests: `vitest.logic.config.ts`
3. Engine validation tests: `src/__tests__/validation/*`
4. Build validation: `next build`
5. Route/browser acceptance: smoke scripts
6. Route-level acceptance: `docs/00-overview/execution-backlog-ko.md`
7. User-level acceptance: `docs/USER_VERIFICATION.md`

## Failure Handling
- 실패 시 재현 명령, 실패 구간, 원인 가설을 기록한다.
- 릴리즈 블로커는 `docs/active-dispatch.md`에 즉시 등록한다.
- 재발 방지를 위해 최소 1개 회귀 케이스를 추가한다.

## Update Rules
- 테스트 게이트 변경 시 `package.json` 스크립트와 본 문서를 동시에 갱신한다.
- 라우트 계약 변경 시 `execution-backlog-ko.md`와 정합성을 확인한다.
- `npm test`의 신뢰도에 영향이 가는 include/exclude 변경 시 `vitest.config.ts`, `vitest.logic.config.ts`, `scripts/pre-deploy.js`를 함께 갱신한다.

## References
- `docs/00-overview/document-governance.md`
- `docs/00-overview/execution-backlog-ko.md`
- `docs/USER_VERIFICATION.md`
- `docs/01-team/engineering/deployment-guide.md`
- `docs/01-team/engineering/local-dev-sop.md`

---
**Last Updated**: 2026-03-07  
**Owner**: QA Lead + Engineering Lead  
**Next Review**: 2026-03-14
