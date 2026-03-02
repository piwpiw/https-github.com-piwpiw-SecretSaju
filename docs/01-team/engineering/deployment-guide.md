# Engineering Deployment Guide

SOT: 배포 운영 기준은 이 문서가 단일 기준이다.
배경/확장 설명은 `docs/guides/deployment.md`를 참고하되, 실제 명령/정책은 이 문서를 우선한다.

## 문서 우선순위

- 배포 운영 단일 근거(SOT): `docs/01-team/engineering/deployment-guide.md`
- 상세 참고: `docs/guides/deployment.md`
- 상충 시 본 문서 기준으로 처리
- 문서 충돌 판단은 각 문서 상단의 `Last Updated`/`Next Review`로 동기화 상태를 확인

## 배포 대상
- Production: `main` 브랜치
- Staging/Preview: `dev` 브랜치 및 PR

## 표준 배포 흐름
1. 로컬 사전검증: `npm run deploy:local`
2. CI 품질/배포 파이프라인 확인
3. 배포 실행
4. 배포 후 스모크 및 모니터링

## 명령 기준 (구현 반영)
- `npm run preflight:local:parallel`
  - `lint` + `tsc --noEmit` 병렬 실행
- `npm run preflight:local:serial`
  - 재현/디버깅용 직렬 실행
- `npm run preflight:local`
  - 기본값: 병렬 실행
- `npm run deploy:local`
  - `preflight:local` + `pre-deploy --skip-build --skip-tests`
- `npm run pre-deploy`
  - 배포 전 기본 사전 처리 수행
- `npm run pre-deploy:parallel`
  - `pre-deploy` 내 `tests/build` 병렬 점검
- `npm run deploy:fast`
  - `--parallel-checks` + prebuilt 배포 경로
- `npm run deploy`
  - 기본 전체 배포(표준 경로)
- `npm run deploy:preview`
  - PR/스테이징 배포

## 배포 명령 사용 가이드

- `npm run deploy:local`
  - `preflight:local` + `pre-deploy --skip-build --skip-tests`
- `npm run preflight:local` (기본)
  - lint + tsc noEmit 병렬
- `npm run preflight:local:serial`
  - 동일 검사 직렬
- `npm run deploy:fast`
  - 빠른 검증 경로, 병렬 체크 중심
- `npm run deploy`
  - 운영 배포
- `npm run deploy:preview`
  - 미리보기 배포

## 검증 속도 참고 (로컬 측정)
- preflight 병렬: 약 9.4초
- preflight 직렬: 약 23.4초
- 병렬이 기본 운영 경로

## 운영 규칙
- 병렬 모드를 기본으로 사용한다.
- 직렬 모드는 실패 재현, flaky 추적 등 예외 상황에만 사용한다.
- 명령 변경 시 `package.json`과 본 문서를 동일 PR에서 갱신한다.
- CI 정책 변경 시 `.github/workflows/deploy.yml`과 본 문서/상세 가이드를 함께 갱신한다.
- 관련 명령 변경은 `docs/guides/deployment.md`와 동기화한다.

## 체크포인트
- [ ] `deploy:local` 성공
- [ ] 핵심 API 스모크(`/api/saju/calculate`, `/api/payment/verify`)
- [ ] 결제/환불/웹훅 기본 경로 확인
- [ ] 정책 페이지(terms/privacy/refund) 링크 확인
- [ ] 장애 시 `docs/active-dispatch.md` 기록 + 커뮤니케이션

## 관련 문서
- `docs/01-team/engineering/testing-guide.md`
- `docs/guides/deployment.md`
- `docs/00-overview/document-governance.md`

---
**Last Updated**: 2026-03-01  
**Owner**: DevOps + Engineering Lead  
**Next Review**: 2026-03-08
