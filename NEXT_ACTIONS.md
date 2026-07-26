# SecretSaju NEXT_ACTIONS — 진짜 해야 할 것들
# 모든 AI 에이전트와 플랫폼이 참조하는 단일 작업 목록
# 이 파일이 "무엇을 해야 하는가"의 유일한 진실의 원천(SSOT)입니다.
#
# 사용법: [ ] 미완료 | [/] 진행중 | [x] 완료
# 완료 시: [x]로 변경 + AI_BOOTSTRAP.md Last Checkpoint 갱신

---

## 🔴 Priority 0 — 지금 당장

### P0-1. 실제 LLM API 키 설정 (수동)
- [ ] Vercel 환경변수 설정: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_KEY`
- **검증**: `/api/persona` POST → 실제 LLM 응답 반환

> P0 나머지 모두 완료 (LLM 체인, TransitTicker, ProfileWallet, 빌드 안정성)

---

## 🟡 Priority 1 — 다음 스프린트

### P1-3. 결제 End-to-End 실 테스트 (수동)
- [ ] 실 테스트 카드로 결제 → 젤리 잔액 변동 확인 (키 설정 필요)

> P1 나머지 모두 완료 (MASTER_PRD, 테스트 커버리지, 궁합, 일일운세, Wave 12 Lineage UI)

---

## 🟢 Priority 2 — 품질/운영

> P2 모두 완료 (선물하기, PWA, GA4, Content DB, Mock 모드 정리)

---

## 📋 문서 정합성

| 문서 | 상태 |
|------|------|
| `MASTER_PRD.md` | ✅ v6.0 현행화 완료 |
| `execution-backlog-ko.md` | ✅ 라우트 계약서 (유지) |
| `AI_BOOTSTRAP.md` | ✅ 최신 |
| `ERROR_LEDGER.md` | ✅ 최신 |
| `implementation_plan_v11.md` | 🗃️ 이 파일로 대체됨 (참고용) |

---

## 🔵 진행 중 / 다음 우선순위

### DOC-1. 대형 문서 Compact (완료)
- [x] `docs/00-overview/DEEP_HISTORY.md` (25KB → ~2KB)
- [x] `docs/00-overview/fortune-reader-system-design-2026-03-07.md` (18KB)
- [x] `docs/02-technical/core-engine/SAJU_VALIDATED_IMPLEMENTATION_BLUEPRINT.md` (18KB)
- [x] `docs/02-technical/core-engine/SAJU_DEEP_RESEARCH_STANDARD.md` (16KB)
- [x] `docs/02-technical/architecture/overview.md` (15KB)
- [x] `docs/01-team/engineering/coding-standards.md` (14KB)
- [x] `NEXT_ACTIONS.md` — 완료 항목 아카이브
- [x] `AI_BOOTSTRAP.md` — 구버전 Resume Checkpoint 섹션 제거 (free-launch 현황으로 갱신)

### PWQ-1. 병렬 작업 큐 소진 (완료 2026-07-13)
- [x] Frontend FE-312~320 잔여 항목 해소 (실제 수정 + 이미 충족분 검증)
- [x] Backend BE-305~320 잔여 항목 해소 (실제 수정 + 이미 충족분 검증)
- [x] `docs/archive/decision-history/parallel-work-queue.md` mojibake 손상 → UTF-8 복원
- [x] Ops/QA 문서 정합성 항목(OPS-309/310/311/312/313/319) — deployment.md, setup.md, active-dispatch.md, roadmap.md, mcp-rollback-checklist.md 최신화 + UI 영어 카피 누락 3건 수정
- [x] Ops/QA 자동화 가능 항목(OPS-303/305/306/307/308/315/316/318/320) — 모바일 브레이크포인트·404/빈상태·성능·세션만료·직접진입·접근성 전수 점검, 버그 4건 발견·수정(오버플로우 2건, 로딩/빈상태 중복노출 1건, a11y 아리아라벨 6건)
- [x] ERROR_LEDGER ERR-L004 해결 (2026-07-14) — 세션 쿠키 만료 후 localStorage 캐시로 로그인 상태 유지되던 버그, 사용자 결정에 따라 TTL(1시간) 방식 채택. `src/lib/auth/kakao-auth.ts`
- [ ] Ops/QA OPS-301/302/304/314/317 — 라이브 배포/실 결제 키/크로스브라우저 필요로 헤드리스 불가, 최종 잔존

### PWQ-2. 런타임 회귀 스윕 (완료 2026-07-13)
- [x] 전체 54개 라우트 모바일 뷰포트 런타임 스모크(Playwright, `scripts/qa/menu-smoke.mjs`) — 크래시/404/예외 0건
- [x] 전역 위젯 4종 graceful-degradation 처리(weather/geolocation, wallet balance API, ambient audio, user-sync API) — 콘솔 에러/500 스팸 제거
- [x] `/fortune-readers`, `AINarrativeSection` hydration mismatch 버그 발견·수정 (실험 변형 조회를 렌더 중 비순수 호출 → 상태 기반 순수 함수로 전환) — 재검증 5/5 클린
- 최종 결과: 54/54 라우트 정상, tsc 0 / lint 0 / 테스트 68/68 / guard pass / mojibake 0

### PWQ-3. 프로덕션 빌드 기준 실구동 검증 (완료 2026-07-26)
> 배운 점: `next dev`는 지연 로드 청크를 캐시해 수정이 반영되지 않은 것처럼 보였고, 이 프로젝트는 `output: standalone` 설정이라 `next start`도 미지원(낡은 빌드를 서빙). **검증은 반드시 `next build` + `node .next/standalone/server.js`로 할 것.**
- [x] `FREE_LAUNCH`가 브라우저에서 항상 false로 평가되던 치명적 버그 수정 — `process.env.NEXT_PUBLIC_*`는 빌드 시 정의된 경우에만 치환되므로, 미설정(=기본 ON 의도) 시 표현식이 클라이언트 번들에 그대로 남아 모든 유료 장벽이 다시 잠김. 리터럴 `true`로 전환 + 누락된 게이트 2곳(`AINarrativeSection`, `/fortune-readers`) 연결
- [x] `/shop` 죽은 CTA 제거 — "이 플랜 선택"이 onClick 없는 `<div>`(소스 주석: *stylized button-look label*)였고 `<label className="cursor-pointer">`로 감싸 클릭 가능해 보였음. 무료 오픈 상태 표시로 교체 + 안내 배너/동작하는 CTA 추가
- [x] 홈 메인 폼 "시간 모름" 체크박스 키보드 접근 불가 수정 — `<div onClick>` → `<button role="checkbox" aria-checked>`. 사주 계산 결과를 바꾸는 항목이라 기능적으로도 중요
- [x] `/my-saju/list` 가짜 데이터 노출 수정 — "인연 네트워크"가 하드코딩된 김철수 85%·이영희 92%·박민수 78%를 사용자 실제 관계인 것처럼 표시. 실제 프로필 기반으로 전환 + 빈 상태 추가
- [x] 인터랙션/가짜버튼 검증 도구 추가: `scripts/qa/interaction-smoke.mjs`(입력·주요 버튼 실제 구동), `scripts/qa/fake-button-scan.mjs`(죽은/키보드 접근 불가 CTA 탐지)
- 최종 결과: 54/54 라우트 정상 · 인터랙션 18/18 에러 0 · 가짜버튼 스캔 잔여 0 · tsc 0 / lint 0 / 테스트 68/68 / guard pass

### 잔여 인코딩 관측
- [x] `docs/01-team/cs/provider_error_mapping.md` EUC-KR → UTF-8 변환 완료
- [x] `docs/archive/legacy/readme.md` EUC-KR → UTF-8 변환 완료
- [x] `docs/01-team/operations/cs-ops-brief.md` 혼합 인코딩(EUC-KR+UTF-8 이어붙임) 완전 복구
- [x] `docs/00-overview/mcp-rollback-checklist.md` 파일 끝부분 mojibake 조각 제거
- [ ] `docs/01-team/engineering/setup.md` — 부분 손상, 완전 복구 불가로 ERROR_LEDGER ERR-L002에 미해결 기록 (앱 기능 영향 없음)
- [ ] `docs/archive/decision-history/admin-audit-priority-plan.md` — 원본 생성 시점 손실(리터럴 `?`), 복구 불가로 ERROR_LEDGER ERR-L003에 기록 (아카이브 참고용, 영향 없음)

**Last Updated**: 2026-07-13
**Updated By**: Claude
