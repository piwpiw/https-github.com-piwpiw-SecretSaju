# Local Development SOP

SOT: 로컬 실행 안정화 기준은 이 문서가 단일 기준이다.
이 문서는 `testing-guide.md`, `deployment-guide.md`의 로컬 실행 파트를 보완한다.

## Scope
- 대상: 로컬 실행, 로그인/회원가입 UI 수정, 배포 전 로컬 사전 점검
- 목적: 동일 오류의 반복 재발 차단

## Incident Baseline (2026-03-04)
1. `EADDRINUSE`가 반복되어 `next dev` 기동 실패
2. `AuthModal.tsx` 문자열/태그 파손으로 빌드 파서 에러 발생
3. 인코딩 훼손 문자열이 누적되며 수정 범위가 확장
4. preflight 이전 브라우저 확인으로 오류 탐지가 지연

## Root Causes
1. 포트 충돌 관리가 수동으로 분산되어 일관된 재시작 절차가 없었음
2. 대형 TSX 파일에서 부분 수정을 반복해 구문 무결성이 깨졌음
3. 인코딩 이상 징후 발견 시 파일 단위 복구 절차가 없었음
4. 로컬 실행 전 강제 품질 게이트가 없었음

## Mandatory Workflow
1. 로컬 서버 시작은 `npm run dev:safe -- --port 3000 --auto-port`를 기본으로 사용한다.
2. Auth/Modal/Callback 변경 후 `npm run preflight:local` 실패 시 브라우저 검증을 진행하지 않는다.
3. 로그인 계열 수정 시 `npm run smoke:auth`를 실행해 핵심 라우트를 스모크한다.
4. 문자열 깨짐(인코딩 이상) 발견 시 부분 패치를 중단하고 파일 단위 복구 후 재작업한다.
5. 동일 에러 2회 반복 시 즉시 원인 분류 기록을 남기고 수정 전략을 전환한다.

## Command SOP
```bash
# 1) 로컬 실행 안정화 (기본)
npm run dev:safe -- --port 3000 --auto-port

# 2) 긴급 재현 (preflight 생략)
npm run dev:safe:quick -- --port 3000

# 3) 로그인 핵심 라우트 스모크
npm run smoke:auth

# 4) 배포 전 로컬 게이트
npm run deploy:local
```

## Failure Classification Template
- `Category`: Port | Syntax | Encoding | Auth Flow | Unknown
- `First Seen`: YYYY-MM-DD HH:mm (KST)
- `Repro`: command + route
- `Fix Type`: Partial patch | File rewrite | Config update
- `Regression Guard`: added command/doc/checklist

## Do / Do Not
- Do: 포트 정리, preflight 통과, 라우트 스모크, 실패 분류 기록
- Do Not: 수동 `npm run dev` 반복 재시도, 인코딩 파손 상태에서 부분 수정 지속

---
**Last Updated**: 2026-03-05  
**Owner**: Engineering Lead  
**Next Review**: 2026-03-12
