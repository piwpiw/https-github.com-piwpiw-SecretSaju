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

### DOC-1. 대형 문서 Compact (진행 중)
- [x] `docs/00-overview/DEEP_HISTORY.md` (25KB → ~2KB)
- [x] `docs/00-overview/fortune-reader-system-design-2026-03-07.md` (18KB)
- [x] `docs/02-technical/core-engine/SAJU_VALIDATED_IMPLEMENTATION_BLUEPRINT.md` (18KB)
- [x] `docs/02-technical/core-engine/SAJU_DEEP_RESEARCH_STANDARD.md` (16KB)
- [x] `docs/02-technical/architecture/overview.md` (15KB)
- [x] `docs/01-team/engineering/coding-standards.md` (14KB)
- [x] `NEXT_ACTIONS.md` — 완료 항목 아카이브
- [ ] `AI_BOOTSTRAP.md` — 구버전 Resume Checkpoint 섹션 제거

**Last Updated**: 2026-03-08T02:00
**Updated By**: Claude
