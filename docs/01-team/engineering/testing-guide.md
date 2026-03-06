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
- `npm run build`

## Command Policy
- `npm run preflight:local`
  - 병렬 게이트: `lint` + `tsc --noEmit`
- `npm run preflight:local:serial`
  - 직렬 재현용 게이트
- `npm run pre-deploy -- --parallel-checks`
  - pre-deploy의 병렬 실행 확인
- `npm run dev:safe -- --port 3000 --auto-port`
  - 로컬 실행 기본 명령(포트 정리 + preflight + dev server)
- `npm run dev:safe:quick -- --port 3000`
  - preflight를 생략한 긴급 재현용 실행
- `npm run smoke:auth`
  - 로그인 핵심 라우트(`/`, `/login`, `/signup`, `/auth/callback`) 스모크

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
2. Unit/integration: `vitest`
3. Build validation: `next build`
4. Route-level acceptance: `docs/00-overview/execution-backlog-ko.md`
5. User-level acceptance: `docs/USER_VERIFICATION.md`

## Failure Handling
- 실패 시 재현 명령, 실패 구간, 원인 가설을 기록한다.
- 릴리즈 블로커는 `docs/active-dispatch.md`에 즉시 등록한다.
- 재발 방지를 위해 최소 1개 회귀 케이스를 추가한다.

## Update Rules
- 테스트 게이트 변경 시 `package.json` 스크립트와 본 문서를 동시에 갱신한다.
- 라우트 계약 변경 시 `execution-backlog-ko.md`와 정합성을 확인한다.

## References
- `docs/00-overview/document-governance.md`
- `docs/00-overview/execution-backlog-ko.md`
- `docs/USER_VERIFICATION.md`
- `docs/01-team/engineering/deployment-guide.md`
- `docs/01-team/engineering/local-dev-sop.md`

---
**Last Updated**: 2026-03-05  
**Owner**: QA Lead + Engineering Lead  
**Next Review**: 2026-03-12
