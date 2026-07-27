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

## 배포 기준(필수)

- 배포 플랫폼: **Vercel only** (2026-07-27 확정)
- **배포 명령은 없다.** Vercel Git 연동이 수행한다 — `main` 푸시 = 프로덕션, PR = 프리뷰.
- 빌드 설정의 정본은 `vercel.json` (`framework: nextjs`, `installCommand: npm ci`).
- GitHub Actions는 품질 검사(Quality)만 담당하고 배포를 트리거하지 않는다.
- 푸시 전 `npm run deploy:local` 또는 동등한 로컬 사전검증을 반드시 성공해야 한다.
- 로컬 검증 실패는 푸시 블록 처리한다.

> 배경: 이전에는 Render 전용 정책(`deploy-policy.js`)이 `render.yaml`과 배포 훅을
> 요구하고 `.vercel` 존재 시 배포를 차단했습니다. 그런데 훅 시크릿이 설정된 적이
> 없어 **`main` 푸시마다 CI가 실패**했고, 정작 실제 배포는 Vercel이 하고 있었습니다.
> Render 경로(`render.yaml`, `deploy-policy.js`, `render-deploy.js`, `auto-deploy.js`,
> `npm run deploy*` 계열)를 전부 제거해 배포 대상을 하나로 정리했습니다.

## 로컬 기준 빠른 배포 검증

### 1. 기본 점검(권장)

- `npm run dev:safe -- --port 3000 --auto-port`
  - 포트 점유 정리 + preflight + dev server 실행
- `npm run deploy:local`
  - 기본 동작: `preflight:local` + `pre-deploy --skip-build --skip-tests`
  - 목적: 배포 전 최소한의 안전성 확인
  - 주의: `--skip-build`로 실행되므로 `npm run build`(아래) 가드는 건너뛴다. 별도로 최소 1회 실행 필요
- `npm run build`
  - 실제 명령: `npm run guard:result-card && next build`
  - `guard:result-card`는 `ResultCard.tsx` / `saju-hanja.ts`의 UTF-8·한자 이스케이프 손상을 사전 차단하는 가드(ERROR_LEDGER.md E-001/E-002 재발 방지)
  - `pre-deploy`(`--skip-build` 미사용) 또는 `pre-deploy:parallel` 실행 시 자동 포함되지만, `deploy:local`/`deploy:fast` 경로에서는 생략되므로 PR 머지 전 최소 1회 직접 확인

### 2. preflight 실행 모드

- `npm run preflight:local` (기본)
  - `lint` + `tsc --noEmit` 병렬 실행
- `npm run dev:safe:quick -- --port 3000`
  - preflight 생략 재현 모드(긴급 디버깅 전용)
- `npm run smoke:auth`
  - 로그인 핵심 라우트 스모크(`/`, `/login`, `/signup`, `/auth/callback`)
- `npm run preflight:local:serial`
  - 동일 항목을 직렬 실행 (재현/디버깅 목적)
- `npm run preflight:local:parallel` (명시 실행 시)
  - 병렬 모드 강제 사용

### 3. 속도 기준(최근 측정, 로컬 기준)

- 병렬 preflight: 약 **9.4초**
- 직렬 preflight: 약 **23.4초**
- 병렬이 빠르므로 기본값으로 유지

## 배포 전 점검 명령

배포를 실행하는 명령은 없습니다. 아래는 **푸시 전에 로컬에서 돌리는 점검**입니다.

- `npm run deploy:local`
  - `preflight:local` + `pre-deploy --skip-build --skip-tests`
- `npm run predeploy:check`
  - `scripts/deploy/deploy.sh` — 설치 + 사전 점검 일괄 실행
- `npm run pre-deploy`
  - 사전 점검 기본 경로
- `npm run pre-deploy:parallel`
  - build/test 단계를 병렬 처리

## 빠른 반복 배포 지침(최소 변경 모드)

- 수정 범위는 사전 영향도 3단계만 허용: 워크플로(`.github/workflows/deploy.yml`), 점검 스크립트(`scripts/deploy/deploy.sh`, `scripts/deploy/pre-deploy.js`), 빌드 설정(`vercel.json`, `package.json`).
- 이 범위를 벗어나는 수정은 `수락 필요`로 간주하고 즉시 중단.
- 실행은 항상 병렬 확인 후 일괄 반영:
  - `npm run pre-deploy:parallel`
  - `npm run predeploy:check`
- 실패 지점은 첫 실패 항목만 수정하고 재실행, 성공 항목은 건너뛰기(`SKIP_*` 플래그로 최소 재실행).
- 병목 완화 우선순위: 템플릿 수정보다 설정 누락 제거, 문서 갱신보다 배포 체인 안정성 우선.

## 표준 배포 흐름

1. 로컬 안정화
   - `npm run dev:safe -- --port 3000 --auto-port`
2. 로컬 확인
   - `npm run smoke:auth` (인증/회원가입 UI 수정 시 필수)
   - `npm run deploy:local`
   - 실패 시 에러 로그 우선 확인 후 관련 스크립트 개별 실행
3. Git Push / PR
   - `main` 푸시 → Vercel 프로덕션 배포 자동 시작
   - PR 생성 → Vercel 프리뷰 배포 자동 시작
4. 배포 확인
   - PR 코멘트의 Vercel 상태(Building → Ready)와 프리뷰 링크로 확인
   - 프로덕션은 Vercel 대시보드에서 확인
5. 배포 후 검증
   - `/api/saju/calculate` 스모크 확인
   - 결제 관련 확인(`/api/payment/verify` 스모크, 결제/웹훅 경로)은 `NEXT_PUBLIC_FREE_LAUNCH`가 `false`로 유료 전환된 배포에서만 필수. 무료 오픈 런칭(기본값, `FREE_LAUNCH` ON) 상태에서는 결제 키 자체가 설정되지 않으므로 해당 스모크는 생략하고 프리미엄/시크릿 콘텐츠가 잠금 없이 노출되는지만 확인(`docs/02-technical/FREE_LAUNCH_RUNBOOK.md` 참고)
   - 주요 정책 페이지(terms/privacy/refund) 링크 확인
6. 장애 대응
   - 이상 징후 발생 시 즉시 모니터링 및 롤백 프로세스 수행

## 체크리스트

- [ ] `deploy:local` 성공
- [ ] `npm run build`(`guard:result-card && next build`) 최소 1회 통과 — 인코딩/한자 이스케이프 가드(E-001/E-002 재발 방지)
- [ ] `smoke:auth` 성공 (인증/회원가입 수정 시)
- [ ] `npm run verify:env` 통과(필요 시)
- [ ] 핵심 API 스모크 통과
- [ ] 결제/환불/웹훅 기본 동작 확인 (유료 전환 배포에 한함, `NEXT_PUBLIC_FREE_LAUNCH=false`일 때만 필수)
- [ ] 정책 페이지 링크 정상 동작
- [ ] 장애 기록: `docs/archive/decision-history/active-dispatch.md`

### 장애 기록 Wave 자동 표기 규칙

- Wave 단위로 장애/이슈를 기록할 때 항목 헤더는 `Wave-XX` 형식으로 표기합니다.

### 릴리스 승인 단계(1차/2차)

- 1차 승인: 빌드/테스트 성공 + 핵심 화면 Smoke 통과 + 보안/시크릿 검토
- 2차 승인: QA 리드 최종 확인 + 운영자 알림 채널 등록
- 승인자 미확정 항목은 배포 실행 전에 `승인자 미정` 태그로 남기고, 배포 블록 처리
- 승인 누락 시 배포를 중단하고 DO-430에서 규칙 배포 템플릿으로 이관
- 예시: `Wave-20 · FE-412 (DestinyNetwork tooltip animation jitter)` 형식.
- 기록 템플릿은 `docs/archive/decision-history/active-dispatch.md`의 Wave 헤더(`Dispatch Wave YY`)와 동일 형식을 유지합니다.
- 발생일/해결일은 `YYYY-MM-DD` UTC+9 기준으로 기재합니다.
- 동일 항목 반복 이슈가 생길 경우 중복 ID는 `#01`, `#02`로 suffix 처리합니다.

## 롤백 기준(요약)

- 운영에서 심각한 오류가 발생하면 즉시 이전 정상 배포 버전으로 롤백
- 롤백 후 상태 점검: 주요 API 응답, 정적 페이지, 결제 플로우, DB 연결 상태
- 원인 분석은 팀 규칙에 따라 기록 후 SOT 문서와 동기화

## 관련 문서

- `docs/01-team/engineering/deployment-guide.md` (SOT)
- `docs/01-team/engineering/testing-guide.md`
- `docs/01-team/engineering/local-dev-sop.md`
- `docs/archive/decision-history/active-dispatch.md`
- `docs/02-technical/DEPLOYMENT_CHECKLIST.md` (스키마/OAuth/롤백 요약 체크리스트)
- `docs/02-technical/FREE_LAUNCH_RUNBOOK.md` (무료 오픈 런칭 배포 계획 — 결제 키 불요 사유)

**Last Updated**: 2026-07-27  
**Owner**: DevOps + Engineering Lead  
**Next Review**: 2026-08-03

## Release Approval Checklist Update
- Approval step 1: build/test + core smoke + secret review logged
- Approval step 2: QA lead sign-off + ops notification channel confirmed
- Block release if approver is missing; record as "승인자 미정" and stop
