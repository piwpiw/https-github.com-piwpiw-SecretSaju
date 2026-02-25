# 🎯 Agent System: Representative + 10 Teams

## Overview

대표 에이전트(Representative)가 요청을 분석하고, 10개 팀 에이전트에 디스패치하는 다중 에이전트 시스템.

---

## Representative Agent (대표)

**역할**: 모든 요청의 진입점. 분류 → 배정 → 통합.

### Dispatch Flow
```
요청 수신 → 키워드 분석 → 팀 선택 → 스펙 로드 → 실행 → 결과 통합
```

### Dispatch Rules

| 키워드 / 상황 | 1차 팀 | 2차 팀 (필요시) |
|---------------|--------|----------------|
| 기획, PRD, 요구사항, 스펙, 기능정의 | T1 Planning | — |
| 컴포넌트, 페이지, UI, 화면, 레이아웃 | T2 Frontend | T6 Design |
| API, 라우트, 서버, DB, Supabase | T3 Backend | T9 Security |
| 사주, 만세력, 일주, 오행, DACRE | T4 Engine | — |
| 데이터, 동물, 추천, 콘텐츠, JSON | T5 Data | — |
| 디자인, 테마, 컬러, 폰트, 애니메이션 | T6 Design | T2 Frontend |
| 테스트, 검증, QA, 버그, 에러 | T7 QA | 관련 팀 |
| 배포, CI/CD, 빌드, Vercel, 환경변수 | T8 DevOps | — |
| 보안, 인증, Auth, Kakao, CORS | T9 Security | T3 Backend |
| 분석, Analytics, SEO, 공유, 바이럴 | T10 Growth | — |

### Cross-Team Protocol
1. **단일 팀 충분** → 해당 팀만 실행
2. **2팀 필요** → 의존 관계 순서로 순차 실행
3. **3팀 이상** → 대표가 작업 분해 후 우선순위 순 실행

### Escalation
- 팀 간 충돌 → 대표가 scope 기준으로 판단
- COST_RULES 위반 → 대표가 차단 후 최적화 방안 제시

---

## Teams

| ID | Name | Scope | Cost | Spec |
|----|------|-------|------|------|
| T1 | Planning | 기획·요구분석 | 🟢 low | [team-01-planning.md](teams/team-01-planning.md) |
| T2 | Frontend | UI·UX 구현 | 🟡 mid | [team-02-frontend.md](teams/team-02-frontend.md) |
| T3 | Backend | API·서버 로직 | 🟡 mid | [team-03-backend.md](teams/team-03-backend.md) |
| T4 | Engine | 사주 핵심 엔진 | 🔴 high | [team-04-engine.md](teams/team-04-engine.md) |
| T5 | Data | 데이터·콘텐츠 | 🟢 low | [team-05-data.md](teams/team-05-data.md) |
| T6 | Design | 디자인 시스템 | 🟢 low | [team-06-design.md](teams/team-06-design.md) |
| T7 | QA | 테스트·검증 | 🟡 mid | [team-07-qa.md](teams/team-07-qa.md) |
| T8 | DevOps | 배포·인프라 | 🟢 low | [team-08-devops.md](teams/team-08-devops.md) |
| T9 | Security | 보안·인증 | 🔴 high | [team-09-security.md](teams/team-09-security.md) |
| T10 | Growth | 분석·마케팅 | 🟢 low | [team-10-growth.md](teams/team-10-growth.md) |

---

## Skills Registry

스킬은 `.agent/skills/` 에 있는 재사용 가능한 표준 패턴. 팀 에이전트가 작업 시 해당 스킬의 `SKILL.md`를 로드하여 사용.

| Skill | 용도 | 사용 팀 | Cost |
|-------|------|---------|------|
| [code-review](skills/code-review/SKILL.md) | 파일 품질 검증 | T7 QA, All | 10 calls |
| [quick-fix](skills/quick-fix/SKILL.md) | 에러 즉시 수정 | All | 8 calls |
| [component-gen](skills/component-gen/SKILL.md) | React 컴포넌트 생성 | T2 Frontend | 5 calls |
| [api-gen](skills/api-gen/SKILL.md) | API Route 생성 | T3 Backend | 5 calls |
| [test-gen](skills/test-gen/SKILL.md) | Vitest 테스트 생성 | T7 QA | 6 calls |

---

## Workflows Registry

워크플로우는 `.agent/workflows/` 에 있는 단계별 실행 지침. `// turbo` 주석이 있으면 자동 실행.

| Workflow | 설명 | Turbo |
|----------|------|-------|
| [dispatch](workflows/dispatch.md) | 대표 디스패치 (요청→팀 배정) | 부분 |
| [vibe-coding](workflows/vibe-coding.md) | 바이브 코딩 (자연어→구현) | 부분 |
| [feature-dev](workflows/feature-dev.md) | 기능 개발 (분석→스킬→검증) | 부분 |
| [perf-check](workflows/perf-check.md) | 성능 검증 (tsc→build→bundle) | **전체** |
| [lint-sweep](workflows/lint-sweep.md) | 안티 패턴 탐색 (any/log/TODO) | **전체** |

---

## Tool Optimization Standards

모든 에이전트가 따라야 하는 도구 사용 최적화 규칙.

### 1. 파일 읽기 체인 (최소 비용)
```
view_file_outline → view_code_item (필요 함수만) → view_file (최후 수단, StartLine/EndLine 필수)
```
**절대 하지 말 것**: 전체 파일을 처음부터 읽기

### 2. 파일 수정 체인
```
단일 수정: replace_file_content
복수 수정 (같은 파일): multi_replace_file_content
새 파일: write_to_file (스킬 템플릿 사용)
```
**절대 하지 말 것**: Overwrite: true로 전체 덮어쓰기

### 3. 검색 체인
```
파일 찾기: find_by_name (scope 디렉토리 내에서만)
코드 검색: grep_search (Includes로 파일 타입 필터!)
구조 탐색: list_dir (1단계만, 재귀 금지)
```

### 4. 실행 체인
```
타입 체크: npx tsc --noEmit
빌드: npx next build
테스트: npx vitest run --reporter=verbose
```
**Windows PowerShell 주의**: `tail` 대신 `Select-Object -Last N` 사용

---

## Rules

1. **Scope 엄수**: 각 팀은 자기 scope 파일만 수정
2. **과금 준수**: [COST_RULES.md](COST_RULES.md) 필수 적용
3. **스킬 우선**: 새 코드 생성 시 반드시 해당 스킬 템플릿 사용
4. **워크플로우 우선**: 표준 작업은 워크플로우 실행
5. **문서 동기화**: 변경 시 관련 docs/ 문서 업데이트
6. **최소 동작 보장**: saju.ts 핵심 플로우를 깨는 변경 금지

