# SecretSaju 문서 지도 (언제 무엇을 꺼내나)

> 혼란스러우면 이 파일만 보세요. 목적별로 꺼낼 문서를 알려줍니다.

---

## 🚀 Layer 1 — 매 세션 시작 (AI 필수 읽기)

> AI 에이전트가 새 대화를 시작할 때 반드시 읽는 파일들

| 파일 | 목적 |
|------|------|
| `AI_BOOTSTRAP.md` | 프로젝트 전체 압축 컨텍스트. 모든 AI의 진입점 |
| `ERROR_LEDGER.md` | 알려진 에러 & 해결법. 같은 실수 방지 |
| `NEXT_ACTIONS.md` | 지금 해야 할 작업 목록 (SSOT) |

---

## 🎭 Layer 2 — AI 페르소나 지정 (역할 부여할 때)

> "디자이너 관점으로 봐줘", "CEO 입장에서 판단해줘" 할 때 같이 주는 파일들

| 파일 | AI에게 부여하는 역할 |
|------|---------------------|
| `docs/01-team/c-level/ceo-dashboard.md` | 제품 전체 방향 + 성공 지표 관점 |
| `docs/01-team/c-level/cto-technical-strategy.md` | 기술 의사결정 + 아키텍처 관점 |
| `docs/01-team/c-level/cmo-marketing-strategy.md` | 사용자/시장/메시지 관점 |
| `docs/01-team/c-level/cfo-financial-overview.md` | ROI/비용/수익 관점 |
| `docs/01-team/product/TEAM_SPEC_기획자.md` | 기능 기획 + 우선순위 관점 |
| `docs/01-team/product/TEAM_SPEC_디자이너.md` | UI/UX + 감성 관점 |
| `docs/01-team/product/TEAM_SPEC_콘텐츠.md` | 카피/서사/감정 관점 |
| `docs/01-team/engineering/TEAM_SPEC_개발자.md` | 구현/아키텍처/성능 관점 |

**사용 예시:**
```
"cto-technical-strategy.md를 읽고 이 기능의 기술 리스크를 평가해줘"
"TEAM_SPEC_디자이너.md 기준으로 이 버튼 레이아웃 검토해줘"
```

---

## 🔧 Layer 3 — 작업 중 참조 (구현할 때)

> 코드 수정하면서 "이게 맞나?" 확인할 때

| 파일 | 목적 |
|------|------|
| `CONTEXT_ENGINE.md` | 어떤 기능이 어떤 파일에 있는지 지도 |
| `docs/00-overview/execution-backlog-ko.md` | 페이지별 완료 기준 (라우트 계약서) |
| `docs/02-technical/architecture/overview.md` | 시스템 구조 요약 |
| `docs/02-technical/core-engine/SAJU_DEEP_RESEARCH_STANDARD.md` | 사주 엔진 규칙 표준 |
| `docs/02-technical/core-engine/SAJU_VALIDATED_IMPLEMENTATION_BLUEPRINT.md` | 엔진 구현 현황 |
| `docs/01-team/engineering/coding-standards.md` | 코드 작성 규칙 |
| `docs/01-team/engineering/git-workflow.md` | git 브랜치/커밋 규칙 |

---

## 🧠 Layer 4 — 전략 맥락 (기능 우선순위 판단할 때)

> "이 기능 만들 가치 있어?", "어떤 사용자를 위한 제품이지?" 판단할 때

| 파일 | 목적 |
|------|------|
| `docs/00-overview/MASTER_PRD.md` | 전체 제품 요구사항 |
| `docs/00-overview/vision-mission.md` | 제품 존재 이유 |
| `docs/03-business/strategy/market-analysis.md` | 시장/경쟁 맥락 |
| `docs/03-business/strategy/business-model.md` | 수익 구조 |
| `docs/03-business/strategy/growth-strategy.md` | 성장 전략 |
| `docs/05-external/investors/pitch-deck.md` | 투자자 설명 (제품 한 장 요약) |

---

## 🚨 Layer 5 — 위기 대응 (장애/민원 발생 시)

> 새벽에 장애 터졌을 때, 사용자 민원 들어왔을 때

| 파일 | 목적 |
|------|------|
| `docs/01-team/operations/incident-payment-template.md` | 결제 장애 대응 |
| `docs/01-team/operations/incident-auth-template.md` | 인증 장애 대응 |
| `docs/01-team/operations/incident-login-template.md` | 로그인 장애 대응 |
| `docs/01-team/operations/cs-guide.md` | 사용자 민원 대응 |
| `docs/01-team/operations/review-24h.md` | 배포 후 24시간 체크 |
| `docs/01-team/operations/review-72h.md` | 배포 후 72시간 체크 |
| `docs/02-technical/ERROR_CATALOG.md` | 에러 코드별 원인/해결 |

---

## 🗃️ Layer 6 — 이력/참고 (건드리지 않는 것들)

> 과거 작업 기록. 참고만 하고 수정하지 않음

| 폴더 | 내용 |
|------|------|
| `docs/archive/ai-logs/` | AI 작업 이력 18개 |
| `docs/archive/` | 구버전 가이드, 배포 기록 |

---

## ⚡ 빠른 명령어

| 목적 | 명령어 |
|------|--------|
| 로컬 안전 시작 | `npm run dev:safe` |
| 타입 검사 | `npx tsc --noEmit` |
| 린트 | `npm run lint` |
| QA 스크립트 | `node scripts/zero-script-qa.mjs` |
| 로그 위치 | `_temp/qa-report.log` |

---

**Last Updated**: 2026-03-08
**핵심 원칙**: 문서를 삭제하지 말고, 언제 꺼내는지만 알면 된다.
