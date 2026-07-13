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
- [ ] Ops/QA OPS-301/302/304/305/306/307/308/314/315/316/317/318/320 — 라이브 배포/수동 브라우저 검증 필요분 잔존 (헤드리스로 불가)

### PWQ-2. 런타임 회귀 스윕 (완료 2026-07-13)
- [x] 전체 54개 라우트 모바일 뷰포트 런타임 스모크(Playwright, `scripts/qa/menu-smoke.mjs`) — 크래시/404/예외 0건
- [x] 전역 위젯 4종 graceful-degradation 처리(weather/geolocation, wallet balance API, ambient audio, user-sync API) — 콘솔 에러/500 스팸 제거
- [x] `/fortune-readers`, `AINarrativeSection` hydration mismatch 버그 발견·수정 (실험 변형 조회를 렌더 중 비순수 호출 → 상태 기반 순수 함수로 전환) — 재검증 5/5 클린
- 최종 결과: 54/54 라우트 정상, tsc 0 / lint 0 / 테스트 68/68 / guard pass / mojibake 0

### 잔여 인코딩 관측
- [x] `docs/01-team/cs/provider_error_mapping.md` EUC-KR → UTF-8 변환 완료
- [x] `docs/archive/legacy/readme.md` EUC-KR → UTF-8 변환 완료
- [x] `docs/01-team/operations/cs-ops-brief.md` 혼합 인코딩(EUC-KR+UTF-8 이어붙임) 완전 복구
- [x] `docs/00-overview/mcp-rollback-checklist.md` 파일 끝부분 mojibake 조각 제거
- [ ] `docs/01-team/engineering/setup.md` — 부분 손상, 완전 복구 불가로 ERROR_LEDGER ERR-L002에 미해결 기록 (앱 기능 영향 없음)
- [ ] `docs/archive/decision-history/admin-audit-priority-plan.md` — 원본 생성 시점 손실(리터럴 `?`), 복구 불가로 ERROR_LEDGER ERR-L003에 기록 (아카이브 참고용, 영향 없음)

**Last Updated**: 2026-07-13
**Updated By**: Claude
