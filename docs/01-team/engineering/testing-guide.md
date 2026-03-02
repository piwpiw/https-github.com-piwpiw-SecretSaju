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

---
**Last Updated**: 2026-03-01  
**Owner**: QA Lead + Engineering Lead  
**Next Review**: 2026-03-08
