# 상세 배포 가이드

## Notice

- 이 문서는 배포 실행 시 필요한 상세 참고 정보(명령 예시, 실행 팁, 체크 항목)를 정리한 보조 문서입니다.
- 배포 명령/정책의 단일 근거(SOT)는 `docs/01-team/engineering/deployment-guide.md`입니다.
- 본 문서 내용과 SOT가 다르면 **SOT 문서(`docs/01-team/engineering/deployment-guide.md`)를 우선 적용**합니다.
- 문서 충돌 시 각 문서의 `Last Updated`와 `Next Review`로 최신 동기화 상태를 확인한 뒤 적용하세요.

---

## 문서 목적

개발 단계에서 배포 전 검증 시간을 줄이고, 반복 가능한 배포 절차를 만들기 위한 실행 가이드를 제공합니다.
본 문서는 SOT의 확장 설명으로 사용합니다.

## 로컬 기준 빠른 배포 검증

### 1. 기본 점검(권장)

- `npm run deploy:local`
  - 기본 동작: `preflight:local` + `pre-deploy --skip-build --skip-tests`
  - 목적: 배포 전 최소한의 안전성 확인

### 2. preflight 실행 모드

- `npm run preflight:local` (기본)
  - `lint` + `tsc --noEmit` 병렬 실행
- `npm run preflight:local:serial`
  - 동일 항목을 직렬 실행 (재현/디버깅 목적)
- `npm run preflight:local:parallel` (명시 실행 시)
  - 병렬 모드 강제 사용

### 3. 속도 기준(최근 측정, 로컬 기준)

- 병렬 preflight: 약 **9.4초**
- 직렬 preflight: 약 **23.4초**
- 병렬이 빠르므로 기본값으로 유지

## 배포 명령 사용 가이드

- `npm run deploy:fast`
  - `--parallel-checks` 기반으로 빠른 검사 경로 사용
- `npm run deploy`
  - 기본 전체 배포 흐름(표준 경로)
- `npm run deploy:preview`
  - Preview 배포
- `npm run pre-deploy`
  - 배포 전 기본 사전 처리 수행
- `npm run pre-deploy:parallel`
  - pre-deploy 내부에서 build/test 단계를 병렬로 처리

## 표준 배포 흐름

1. 로컬 확인
   - `npm run deploy:local`
   - 실패 시 에러 로그 우선 확인 후 관련 스크립트 개별 실행
2. Git Push / PR 상태 확인
   - `main`은 운영(Production), `dev` 또는 PR은 Preview 기준
3. 배포 실행
   - 운영: `npm run deploy` 또는 `npm run deploy:fast`
   - 미리보기: `npm run deploy:preview`
4. 배포 후 검증
   - `/api/saju/calculate`, `/api/payment/verify` 스모크 확인
   - 결제/웹훅 경로 및 주요 정책 페이지(terms/privacy/refund) 링크 확인
5. 장애 대응
   - 이상 징후 발생 시 즉시 모니터링 및 롤백 프로세스 수행

## 체크리스트

- [ ] `deploy:local` 성공
- [ ] `npm run verify:env` 통과(필요 시)
- [ ] 핵심 API 스모크 통과
- [ ] 결제/환불/웹훙 기본 동작 확인
- [ ] 정책 페이지 링크 정상 동작
- [ ] 장애 기록: `docs/active-dispatch.md`

### 장애 기록 Wave 자동 표기 규칙

- Wave 단위로 장애/이슈를 기록할 때 항목 헤더는 `Wave-XX` 형식으로 표기합니다.

### 릴리스 승인 단계(1차/2차)

- 1차 승인: 빌드/테스트 성공 + 핵심 화면 Smoke 통과 + 보안/시크릿 검토
- 2차 승인: QA 리드 최종 확인 + 운영자 알림 채널 등록
- 승인자 미확정 항목은 배포 실행 전에 `승인자 미정` 태그로 남기고, 배포 블록 처리
- 승인 누락 시 배포를 중단하고 DO-430에서 규칙 배포 템플릿으로 이관
- 예시: `Wave-20 · FE-412 (DestinyNetwork tooltip animation jitter)` 형식.
- 기록 템플릿은 `docs/active-dispatch.md`의 Wave 헤더(`Dispatch Wave YY`)와 동일 형식을 유지합니다.
- 발생일/해결일은 `YYYY-MM-DD` UTC+9 기준으로 기재합니다.
- 동일 항목 반복 이슈가 생길 경우 중복 ID는 `#01`, `#02`로 suffix 처리합니다.

## 롤백 기준(요약)

- 운영에서 심각한 오류가 발생하면 즉시 이전 정상 배포 버전으로 롤백
- 롤백 후 상태 점검: 주요 API 응답, 정적 페이지, 결제 플로우, DB 연결 상태
- 원인 분석은 팀 규칙에 따라 기록 후 SOT 문서와 동기화

## 관련 문서

- `docs/01-team/engineering/deployment-guide.md` (SOT)
- `docs/01-team/engineering/testing-guide.md`
- `docs/active-dispatch.md`

**Last Updated**: 2026-03-02  
**Owner**: DevOps + Engineering Lead  
**Next Review**: 2026-03-08

## Release Approval Checklist Update
- Approval step 1: build/test + core smoke + secret review logged
- Approval step 2: QA lead sign-off + ops notification channel confirmed
- Block release if approver is missing; record as "승인자 미정" and stop
