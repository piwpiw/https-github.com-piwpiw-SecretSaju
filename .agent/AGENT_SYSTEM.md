# 🏛️ Agent System — SecretSaju Multi-Agent Architecture

> [!IMPORTANT]
> 이 문서는 모든 에이전트의 **최상위 진입점**입니다.
> 모든 에이전트는 작업 시작 전 반드시 **Step 0**을 수행해야 합니다.

---

## ⚡ Step 0 — Context Injection (필수, 모든 에이전트 공통)

```
1. view_file → .agent/CONTEXT_ENGINE.md   (프로젝트 상태·도메인 지식)
2. view_file → .agent/AGENT_PROTOCOLS.md  (통신·SLA·핸드오프 규약)
3. view_file → .agent/COST_RULES.md       (과금 제어 규칙)
4. view_file → .agent/teams/team-XX-*.md  (배정된 팀 스펙)
```

---

## 🏗️ 1. Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│  CONTEXT ENGINEERING LAYER                                   │
│  CONTEXT_ENGINE.md  — 프로젝트 상태·도메인·에러 카탈로그     │
└──────────────────────────┬──────────────────────────────────┘
                           │ 자동 로드 (Step 0)
┌──────────────────────────▼──────────────────────────────────┐
│  AGENT ENGINEERING LAYER                                     │
│  AGENT_PROTOCOLS.md — Handoff·Memory·SLA·Failure·ReAct      │
└──────────────────────────┬──────────────────────────────────┘
                           │ 프로토콜 바인딩
┌──────────────────────────▼──────────────────────────────────┐
│  TEAM AGENT LAYER                                            │
│  team-01~10.md — 각 팀의 Full Spec (Identity·Tools·SLA 등)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏢 2. Representative Agent (대표 에이전트)

**역할**: 모든 요청의 진입점 — 분석 → 배정 → 통합 → 보고

### Dispatch Flow
1. **Step 0**: Context Injection 수행 (위 참조)
2. **분석**: 요청 키워드·문맥 파악
3. **팀 선택**: Dispatch Rules 테이블 기반 1차/2차 팀 확정
4. **병렬성 판단**: `AGENT_PROTOCOLS.md` Parallelism Rules 참조
5. **실행**: Scope-bounded 작업 수행
6. **통합**: 결과 검증 후 `notify_user` 보고

---

## 🚦 3. Dispatch Rules

| 키워드 / 도메인 | 1차 팀 | 2차 협업 | 실행 방식 |
|----------------|--------|---------|---------|
| 기획, PRD, 스펙, 문서, 로드맵 | **T1 Planning** | — | Sequential |
| 컴포넌트, 페이지, UI, JSX, 화면 | **T2 Frontend** | T6 Design | Parallel |
| API, 라우터, DB, Supabase, 결제 | **T3 Backend** | T9 Security | Sequential |
| 만세력, 사주, DACRE, 오행, 갑자 | **T4 Engine** | — | Sequential |
| 데이터, 동물, 추천, 콘텐츠 | **T5 Data** | T4 Engine | Parallel |
| CSS, 테마, 컬러, 애니메이션, 디자인 | **T6 Design** | T2 Frontend | Parallel |
| 테스트, QA, 버그, 에러, 검증 | **T7 QA** | 발생 팀 | Sequential |
| 배포, CI/CD, Vercel, 빌드, 환경변수 | **T8 DevOps** | T7 QA | Sequential |
| 보안, 인증, OAuth, Kakao, CORS | **T9 Security** | T3 Backend | Sequential |
| SEO, Analytics, 바이럴, 공유, 마케팅 | **T10 Growth** | T2 Frontend | Parallel |

---

## 👥 4. Teams Registry

| ID | Name | Mission | Cost Tier | SLA | Spec |
|----|------|---------|-----------|-----|------|
| T1 | Planning | PRD·로드맵 관리 | 🟢 Low | ~10 calls | [team-01](teams/team-01-planning.md) |
| T2 | Frontend | UI·컴포넌트 구현 | 🟡 Mid | ~20 calls | [team-02](teams/team-02-frontend.md) |
| T3 | Backend | API·DB 로직 | 🟡 Mid | ~20 calls | [team-03](teams/team-03-backend.md) |
| T4 | Engine | 사주 엔진 | 🔴 High | ~30 calls | [team-04](teams/team-04-engine.md) |
| T5 | Data | 콘텐츠·데이터 | 🟢 Low | ~10 calls | [team-05](teams/team-05-data.md) |
| T6 | Design | 디자인 시스템 | 🟢 Low | ~10 calls | [team-06](teams/team-06-design.md) |
| T7 | QA | 테스트·검증 | 🟡 Mid | ~20 calls | [team-07](teams/team-07-qa.md) |
| T8 | DevOps | 인프라·배포 | 🟢 Low | ~10 calls | [team-08](teams/team-08-devops.md) |
| T9 | Security | 보안·인증 | 🔴 High | ~30 calls | [team-09](teams/team-09-security.md) |
| T10 | Growth | 분석·마케팅 | 🟢 Low | ~10 calls | [team-10](teams/team-10-growth.md) |

---

## 🛠️ 5. Skill & Workflow Registry

### Skills (단일 실행 모듈)
| Skill | 용도 | 담당 팀 | 제약 |
|-------|------|--------|------|
| [zero-shot-fix](skills/zero-shot-fix/SKILL.md) | 원샷 핫픽스 | All | MAX_TURNS=1 |
| [api-gen](skills/api-gen/SKILL.md) | API 라우트 생성 | T3 | ≤5 calls |
| [component-gen](skills/component-gen/SKILL.md) | 컴포넌트 생성 | T2 | 디자인 토큰 필수 |
| [code-review](skills/code-review/SKILL.md) | 코드 품질 점검 | T7 | 읽기 전용 |
| [test-gen](skills/test-gen/SKILL.md) | 테스트 자동 생성 | T7 | 매트릭스 기반 |

### Workflows (다중 연속 작업)
| Workflow | 설명 | Turbo |
|----------|------|-------|
| [/dispatch](workflows/dispatch.md) | 요청 분류 및 팀 배정 | Partial |
| [/feature-dev](workflows/feature-dev.md) | 기능 개발 표준 플로우 | Partial |
| [/vibe-coding](workflows/vibe-coding.md) | 자연어 기반 빠른 개발 | Partial |
| [/lint-sweep](workflows/lint-sweep.md) | 안티 패턴 탐색·정리 | All |
| [/perf-check](workflows/perf-check.md) | 빌드·성능 검증 | Partial |
| [/context-sync](workflows/context-sync.md) | CONTEXT_ENGINE 동기화 | Partial |
| [ai-collaboration](workflows/ai-collaboration.md) | AI 협업 방법론 | — |
| [architecture](workflows/architecture.md) | 아키텍처 가이드라인 | All |

---

## 🛑 6. Global Rules of Engagement

1. **Step 0 필수**: Context Injection 없이 작업 시작 절대 금지
2. **Scope Bounded**: 팀 Scope 외 파일 무단 접근 금지
3. **Surgical Diff**: 최소 변경 원칙 — `multi_replace`로 일괄 처리
4. **Single QA**: `npm run qa` 1회로 TypeScript + Lint 통합 검증
5. **Memory Update**: 완료 후 `CONTEXT_ENGINE.md` Decision Log 업데이트
6. **Zero Yapping**: 결과 보고는 핵심 1~3문장만 (`notify_user`)
