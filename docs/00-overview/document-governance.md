# 문서 거버넌스 (Document Governance)

## 목적
구현 변경사항이 문서에 정확히 반영되고, 팀이 중복 없이 동일 기준으로 실행하도록 문서 체계를 관리한다.

## 1. Source of Truth 규칙
- 도메인별 SOT는 1개만 유지한다.
- 같은 요구사항을 두 문서 이상에 원문으로 쓰지 않는다.
- 파생 문서는 원문 복사 대신 SOT 링크만 둔다.

## 2. SOT 소유권
| 도메인 | SOT 문서 | 책임 |
|---|---|---|
| 제품 요구사항 | `docs/MASTER_PRD.md` | PM |
| 실행/화면 계약 | `docs/00-overview/execution-backlog-ko.md` | PM + FE Lead |
| 로드맵/우선순위 | `docs/00-overview/roadmap.md` | PM |
| 배포 운영 | `docs/01-team/engineering/deployment-guide.md` | DevOps |
| 테스트 운영 | `docs/01-team/engineering/testing-guide.md` | QA + Eng |
| 로컬 실행 안정화 | `docs/01-team/engineering/local-dev-sop.md` | Eng Lead |
| 오류 기준 | `docs/ERROR_CATALOG.md` | Eng |
| 사용자 검증 | `docs/USER_VERIFICATION.md` | QA |
| 작업 진행 상태 | `docs/active-dispatch.md` | PMO |

## 3. 구현 변경 반영 프로토콜
1. 코드 변경의 유형을 식별한다: `feature`, `contract`, `ops`, `bugfix`.
2. 유형에 맞는 SOT 1개만 수정한다.
3. 상태 변경이 있으면 `docs/active-dispatch.md`를 갱신한다.
4. 문서 진입점(`docs/index.md`)은 링크/소유권 변경 시에만 수정한다.
5. 팀 스펙 문서는 상세 요구를 복사하지 않고 SOT 링크만 추가한다.

## 4. 배포/검증 명령 기준
- 로컬 안정화 실행: `npm run dev:safe -- --port 3000 --auto-port`
- 로컬 빠른 검증: `npm run deploy:local`
- 인증 라우트 스모크: `npm run smoke:auth`
- 로컬 품질 게이트(병렬): `npm run preflight:local`
- 재현용 직렬 게이트: `npm run preflight:local:serial`
- CI 정합 사전검증(병렬): `npm run pre-deploy:parallel`
- 빠른 배포 경로: `npm run deploy:fast`

명령의 상세 동작/옵션은 `docs/01-team/engineering/deployment-guide.md`와 `docs/01-team/engineering/local-dev-sop.md`를 단일 기준으로 한다.

## 5. 중복/충돌 방지 체크
- 링크는 상대 경로만 사용한다.
- 문서 하단 메타(`Last Updated`, `Owner`, `Next Review`)를 유지한다.
- 라우트 계약 변경 시 아래 3개를 함께 확인한다.
  - `execution-backlog-ko.md`
  - `active-dispatch.md`
  - `USER_VERIFICATION.md`

## 6. 검토 주기
- 주 1회: 깨진 링크/중복 점검
- 스프린트 시작: 로드맵과 실행 계약 정합성 점검
- 릴리즈 전: 배포/테스트 가이드 최신성 점검

## 7. 품질 KPI
- 깨진 내부 링크: `0`
- 중복 원문 요구사항: `0`
- 핵심문서 최신성(7일 내): `>= 90%`

---
**Last Updated**: 2026-03-05  
**Document Owner**: PMO + Engineering Lead  
**Next Review**: 2026-03-12
