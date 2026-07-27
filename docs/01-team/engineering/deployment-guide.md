# Engineering Deployment Guide

SOT: 배포 운영 기준은 이 문서가 단일 기준이다.
배경/확장 설명은 `docs/guides/deployment.md`를 참고하되, 실제 명령/정책은 이 문서를 우선한다.

## 문서 우선순위

- 배포 운영 단일 근거(SOT): `docs/01-team/engineering/deployment-guide.md`
- 상세 참고: `docs/guides/deployment.md`
- 상충 시 본 문서 기준으로 처리
- 문서 충돌 판단은 각 문서 상단의 `Last Updated`/`Next Review`로 동기화 상태를 확인

## 배포 정책 (최우선 규칙)
- 배포 플랫폼은 **Vercel only**로 고정한다. (2026-07-27 확정)
- **배포를 실행하는 명령은 없다.** Vercel Git 연동이 수행한다 — `main` 푸시 = 프로덕션, PR = 프리뷰.
- 빌드 설정의 정본은 `vercel.json`이다 (`framework: nextjs`, `installCommand: npm ci`).
- GitHub Actions는 품질 검사(Quality)만 담당하고 배포를 트리거하지 않는다.
- 푸시 전에는 반드시 로컬 사전 검증을 통과해야 한다. 실패 시 푸시하지 않는다.
- `NEXT_PUBLIC_*` 환경변수는 **빌드 시점에 정의되어 있어야** 클라이언트 번들에 치환된다. Vercel에서 나중에 추가했다면 반드시 재배포한다. (ERROR_LEDGER: FREE_LAUNCH 사건)

> 이전 정책(Render only)은 폐기했다. Render 훅 시크릿이 설정된 적이 없어
> `main` 푸시마다 CI가 실패했고, 정작 배포는 Vercel이 하고 있었다.
> `render.yaml`·`deploy-policy.js`·`render-deploy.js`·`auto-deploy.js`와
> `npm run deploy*` 계열 명령을 모두 제거했다.

## 배포 대상
- Production: `main` 브랜치
- Staging/Preview: `dev` 브랜치 및 PR

## 표준 배포 흐름
1. 로컬 안정화 실행: `npm run dev:safe -- --port 3000 --auto-port`
2. 로컬 사전검증: `npm run deploy:local`
3. 푸시 / PR 생성 → Vercel 프리뷰 자동 배포, GitHub Actions Quality 확인
4. `main` 병합 → Vercel 프로덕션 자동 배포
5. 배포 후 스모크 및 모니터링

## 명령 기준 (구현 반영)
- `npm run preflight:local:parallel`
  - `lint` + `tsc --noEmit` 병렬 실행
- `npm run preflight:local:serial`
  - 재현/디버깅용 직렬 실행
- `npm run preflight:local`
  - 기본값: 병렬 실행
- `npm run dev:safe -- --port 3000 --auto-port`
  - 포트 충돌 자동 정리 + preflight + `next dev` 실행
- `npm run smoke:auth`
  - 로그인 핵심 라우트 스모크(`/`, `/login`, `/signup`, `/auth/callback`)
- `npm run deploy:local`
  - `preflight:local` + `pre-deploy --skip-build --skip-tests`
- `npm run pre-deploy`
  - 배포 전 기본 사전 처리 수행
- `npm run pre-deploy:parallel`
  - `pre-deploy` 내 `tests/build` 병렬 점검
- `npm run predeploy:check`
  - `scripts/deploy/deploy.sh` — 설치 + 사전 점검 일괄 실행

## 배포 전 점검 명령

배포를 실행하는 명령은 없다. 아래는 **푸시 전 로컬 점검**이다.

- `npm run deploy:local`
  - `preflight:local` + `pre-deploy --skip-build --skip-tests`
- `npm run predeploy:check`
  - 설치 + 사전 점검 일괄
- `npm run preflight:local` (기본)
  - lint + tsc noEmit 병렬
- `npm run preflight:local:serial`
  - 동일 검사 직렬

## 검증 속도 참고 (로컬 측정)
- preflight 병렬: 약 9.4초
- preflight 직렬: 약 23.4초
- 병렬이 기본 운영 경로

## 운영 규칙
- 병렬 모드를 기본으로 사용한다.
- 직렬 모드는 실패 재현, flaky 추적 등 예외 상황에만 사용한다.
- 로컬 서버 재시작은 수동 `npm run dev` 대신 `npm run dev:safe -- --auto-port`를 기본으로 사용한다.
- 인증/회원가입 UI 변경 시 `npm run smoke:auth`를 릴리스 전 필수로 수행한다.
- 모든 사용자 요청 기반 배포는 최소 `deploy:local` 성공을 완료한 뒤에만 시작한다.
- 변경사항 영향 범위를 가로지르는 페이지/API는 최소 스모크(`/api/saju/calculate`, `/api/payment/verify`, `/api/health`)를 함께 확인해야 한다.
- 명령 변경 시 `package.json`과 본 문서를 동일 PR에서 갱신한다.
- CI 정책 변경 시 `.github/workflows/deploy.yml`과 본 문서/상세 가이드를 함께 갱신한다.
- 관련 명령 변경은 `docs/guides/deployment.md`와 동기화한다.
- 배포 실행은 반드시 `node scripts/deploy/deploy-policy.js` 통과 전제에서 진행한다.

## 체크포인트
- [ ] `deploy:local` 성공
- [ ] `smoke:auth` 성공
- [ ] 핵심 API 스모크(`/api/saju/calculate`, `/api/payment/verify`)
- [ ] 결제/환불/웹훅 기본 경로 확인
- [ ] 정책 페이지(terms/privacy/refund) 링크 확인
- [ ] 장애 시 `docs/archive/decision-history/active-dispatch.md` 기록 + 커뮤니케이션

## 관련 문서
- `docs/01-team/engineering/testing-guide.md`
- `docs/01-team/engineering/local-dev-sop.md`
- `docs/guides/deployment.md`
- `docs/00-overview/document-governance.md`

---
**Last Updated**: 2026-03-05  
**Owner**: DevOps + Engineering Lead  
**Next Review**: 2026-03-12
