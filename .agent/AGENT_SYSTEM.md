# 🎯 Agent System: Dispatch & 10 Teams

> [!IMPORTANT]
> **Secret Paws**의 다중 에이전트 시스템(Representative + 10 Teams) 명세서입니다. 
> 모든 에이전트는 본 문서를 읽고 **자신의 소속 팀과 스펙**에 맞는 행동만을 수행해야 합니다.

---

## 🏗️ 1. Representative Agent (대표)

**역할**: 모든 요청의 진입점. 분류 ➔ 배정 ➔ 통합.

### ⚡ Dispatch Flow (작업 분배)
1. **요청 수신**: 유저의 입력을 키워드/문맥으로 분석합니다.
2. **팀 선택**: 아래 `Dispatch Rules`를 기반으로 1차/2차 담당 팀을 확정합니다.
3. **스펙 로드**: 해당 팀의 `team-XX-*.md` 파일과 `SKILL.md`를 읽어들입니다.
4. **결과 통합**: 작업 완료 시, 스크립트 에러가 없는지 자체 검증 후 종료합니다.

### 🚦 Dispatch Rules

| 키워드 / 도메인 | 1차 전담 팀 | 2차 협업 팀 |
|---------------|-------------|------------|
| 기획, PRD, 스펙, 문서 | **T1 Planning** | — |
| 컴포넌트, 페이지, UI, JSX | **T2 Frontend** | T6 Design |
| API, 라우터, DB(Supabase) | **T3 Backend** | T9 Security |
| 만세력, 사주, DACRE 알고리즘 | **T4 Engine** | — |
| 데이터, 동물 풀, 추천 풀 | **T5 Data** | — |
| CSS, 테마, 애니메이션, UI 엣지 | **T6 Design** | T2 Frontend |
| 통합 테스트, 검증, 에러 분석 | **T7 QA** | 개별 팀 |
| CI/CD, 환경변수, Vercel | **T8 DevOps** | — |
| 결제/인증(Kakao/Toss) | **T9 Security** | T3 Backend |
| SEO, 바이럴(Insta), 마케팅 | **T10 Growth** | — |

---

## 👥 2. Teams Registry
> [!NOTE]
> 각 팀의 구체적 권한과 접근 파일(Scope)은 링크된 Spec 문서를 따릅니다.

| ID | Name | Role Summary | Cost Tier | Spec / Guideline |
|----|------|--------------|-----------|------------------|
| T1 | Planning | 요건 분석 및 설계 | 🟢 Low | [team-01-planning.md](teams/team-01-planning.md) |
| T2 | Frontend | View & Component | 🟡 Mid | [team-02-frontend.md](teams/team-02-frontend.md) |
| T3 | Backend | API & Database | 🟡 Mid | [team-03-backend.md](teams/team-03-backend.md) |
| T4 | Engine | 명리학 알고리즘 | 🔴 High | [team-04-engine.md](teams/team-04-engine.md) |
| T5 | Data | JSON & Content | 🟢 Low | [team-05-data.md](teams/team-05-data.md) |
| T6 | Design | UX/UI System | 🟢 Low | [team-06-design.md](teams/team-06-design.md) |
| T7 | QA | Test & Fixes | 🟡 Mid | [team-07-qa.md](teams/team-07-qa.md) |
| T8 | DevOps | 인프라 자동화 | 🟢 Low | [team-08-devops.md](teams/team-08-devops.md) |
| T9 | Security | 인증 및 결제 무결성 | 🔴 High | [team-09-security.md](teams/team-09-security.md) |
| T10| Growth | n8n / 파이프라인 | 🟢 Low | [team-10-growth.md](teams/team-10-growth.md) |

---

## 🛠️ 3. Skill & Workflow Registry

> [!CAUTION]
> 파편화된 스크립트 테스트와 중복 에러 픽스를 금지하기 위해 **통합 스킬 체계**를 운영합니다.

### 📌 Skills (단일 실행 모듈)
| Skill Name | 용도 | 사용 대상 | 제약 조건 |
|------------|------|-----------|-----------|
| **zero-shot-fix** | `npm run qa` 에러 원샷 핫픽스 | All Teams | **MAX_TURNS: 1**, 요약(Yapping) 전면 금지 |
| **code-review** | 타겟 파일 무결성 및 최적화 점검 | T7 QA | 읽기/리포팅 모드 |
| **api-gen** | 신규 API 라우트 스캐폴딩 | T3 Backend | `multi_replace` 동시 주입 |
| **component-gen** | 뷰 컴포넌트 뼈대 생성 | T2 Frontend | 동적/정적 분리 명확화 |

### 🔄 Workflows (다중 연속 작업)
| Workflow | 설명 |
|----------|------|
| **feature-dev** | 기능 개발 (영향도 분석 ➔ 스킬 호출 ➔ 배포 준비) |
| **perf-check** | 성능 평가 (tsc ➔ build ➔ bundle) |
| **lint-sweep** | 안티 패턴(Any, Console, TODO) 탐색 및 청소 |

---

## 🛑 4. Rule of Engagement (필수 행동 수칙)

1. **절대 규칙 (`COST_RULES.md` 참조)**: 
   - 파일 전체를 스캔하는 무분별한 `view_file` 호출 금지. (`StartLine`, `EndLine` 필수)
   - 테스트 ➔ 수정 ➔ 에러 확인으로 이어지는 "루프"는 2회를 초과할 수 없음.
2. **외과수술적 수정 (Surgical Diffs)**:
   - 모든 수정은 `diff`를 연상하듯이 최솟값만 변경하세요. 
   - 관련된 파일들을 `grep`으로 선제 타격 범위(Blast Radius)에 넣고 `multi_replace`로 한 번에 처리합니다.
3. **단일 통합 QA**: 
   - 개별 모듈 테스트를 무한 시도하지 않고, `npm run qa`를 한 번 실행하여 TypeScript/Lint 무결점을 확보합니다.
