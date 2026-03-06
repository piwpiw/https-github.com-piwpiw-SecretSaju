# 🌐 Context Engine — SecretSaju Project Manifest (Enhanced)

> [!IMPORTANT]
> 이 문서는 **모든 에이전트가 작업 시작 전 의무적으로 로드**해야 하는 프로젝트의 살아있는 상태 문서입니다.
> **최소 토큰 로드 원칙**: 에이전트는 작업에 필요한 `#섹션`만 `grep_search`로 찾은 후, `view_file`의 StartLine/EndLine을 지정하여 **부분 로드**해야 합니다. 전체 읽기 금지.

---

## 1. 🔖 Project Identity `#identity`
| 항목       | 값 |
|------------|---|
# Project: 시크릿사주 (Secret Saju)
- **Studio**: 보헤미안 스튜디오 (Bohemian Studio)
- **Lead**: 박인웅 (Park In-woong)
| **Tech**     | Next.js 15 (App Router), TS, Tailwind, Supabase, Toss |
| **Style**    | Framer Motion + Glassmorphism (`bg-white/5 backdrop-blur-md`) |
| **Deploy**   | Vercel (Production) |

---

## 2. 🗺️ Smart Indexing File Map `#filemap`
> 에이전트는 Recursive 탐색(`list_dir` 반복) 대신 이 인덱스를 캐시로 사용하십시오.

| 역할 | 경로 | 권한(W) |
|------|------|--------|
| 사주 순수 코어 | `src/core/api/saju-engine/` | T4 |
| 60갑자 매핑 코드 | `src/lib/saju.ts` | T4 |
| API 로직 | `src/app/api/` | T3 |
| 인증 로직 | `src/lib/auth*.ts` | T9 |
| 페이지/컴포넌트 | `src/app/`, `src/components/` | T2 |
| 글로벌 테마 CSS | `src/app/globals.css`, `tailwind.config.ts` | T6 |
| 데이터 파일 | `src/data/`, `data/` | T5 |
| 프로젝트 로드맵 | `docs/MASTER_PRD.md` | T1 |

---

## 3. 📊 Current State Snapshot `#phase`
- **Focus**: Q3 스케일업 (글로벌 확장, AI 에이전트 통합, 데이터 분석 자동화)
- **Health**:
  - [Crawler] ✅ DinnerQueen/Revu 어댑터 구현 및 테스트 완료 `[KPI-001: Scraper Stability 98%]`
  - [UI] ✅ Daily Fortune (내일/한달 탭) 및 프리미엄 카드 레이아웃 적용 완료 `[KPI-002: UI Fidelity High]`
  - [Agent] ✅ 10-Team Agent Architecture (T1~T10) 활성화 및 분산 작업 체계 안정화 `[KPI-003: Agent Sync latency < 100ms]`
  - [QA] ✅ `npm run qa` Pass (TSC 0, Lint 0)

---

## 3.1 🔥 Project Heat Map & Risks `#heatmap`
| Region | Activity Level | Risk Level | Mitigation |
|--------|----------------|------------|------------|
| `src/core/saju` | 🔴 High | 🟡 Medium | Intensive Unit Testing (`[RISK-001]`) |
| `src/app/api` | 🟡 Medium | 🔴 High | Security Auth Audit (`[RISK-002]`) |
| `docs/` | 🟢 Low | 🟢 Low | Auto-sync Workflows |

---

## 4. 🔮 Domain Knowledge `#domain`
- **핵심 체계**: 천간(10) / 지지(12) / 오행(木火土金水)
- **DACRE 시스템**: Day-Animal-Character-Resonance-Element 연동
- **불변 원칙**: `PILLAR_CODES` 60개 매핑 구조 임의 변경 절대 금지

---

## 5. 🎨 Design System `#design`
- **테마**: Premium Mystic / 심층 다크 (`#0a0a0f`)
- **패턴**: `bg-white/5 backdrop-blur-md border border-white/10` (글래스모피즘)
- **규정**: 신규 화면은 반드시 `framer-motion`의 `initial={{ opacity: 0 }}` 적용

---

## 6. 🚫 Active Constraints `#constraints`
1. `src/core/api/saju-engine/` 내 로직의 외부 UI 참조 금지 (순수 함수)
2. `PILLAR_CODES` 단 하나라도 수정 시 60갑자 누락/오류 검증 필수
3. `.env` 변수값 로깅/출력 시 즉시 보안 위반(T9 에스컬레이션)
4. T1 승인 없는 타 팀간의 Scope 무단 수정 금지

---

## 7. 📝 Decision Log `#decisions`
| 날짜 | 결정 | 요약 | 주체 |
|------|------|------|-----|
| 26-03-03 | **Next-Gen Doc (V6)** | Mermaid 다이어그램(Architecture/Engine) 도입, KPI/Risk 태깅 시스템 구축, 운영 가이드(`OPERATIONS.md`) 및 핸드오프 템플릿 표준화 완료 | T1 Architect |
| 26-03-03 | **Agent/Crawler Sync** | 10-Team Agent Architecture 공식 활성화, DinnerQueen/Revu 크롤러 어댑터 구현 및 검증, Daily Fortune 프리미엄 UI(탭/카드) 고도화 완료, 프로젝트 문서군(PRD/Architecture) 동기화 | T1/T2/T4 |
| 26-03-02 | **Build/Feature Polish** | Referral 시스템(코드 생성/사용), GA4 전환 분석, Kakao 공유(동적 OG), Toss 결제 검증 고도화(Notion sync), 인코딩(Encyclopedia/Tarot 등 5종) 복구, tsc/lint 0 error 달성 | T2/T3/T9 |
| 26-03-02 | **Wave 5 완료** | Daewun 절기 기반(Jeol-gi 12절) 고정밀화, Sinsal 8종(천을귀인·문창·백호·괴강 추가), 용신 기반 일일운세 스코어링, AuthModal·Footer 인코딩 복구, saju.ts STEM_ELEMENTS 통합, MCP clearMcpStateArtifacts 리팩토링 | T4/T9 |

| 26-03-01 | **Dispatch Wave 4 완료** | daily(파동매트릭스SvgChart추가, 레이아웃최적화), mypage(캘린더메뉴통합, 라우팅정리) — tsc 0 errors | T2/T4 |
| 26-03-01 | **Dispatch Wave 3 완료** | psychology(모듈10종확장+뇌파레이더SVG), dashboard(관계카드SVG+UI강화), encyclopedia(사전목록 6→30확장+카테고리추가), tojeong(운세점수바 5개+총점시각화) — tsc 0 errors | T2/T4/T6 |
| 26-03-01 | **Dispatch Wave 2 완료** | saju(SvgChart+ScrollReveal), tarot(22장+역위), dreams(24키워드+심층해석3단), naming(실제획수계산+사격시각화), shinsal(10종확장+조언), healing(포춘쿠키20개), fortune(SvgChart통합), palmistry(5선점수바), astrology(행성/원소데이터+4점수바) — tsc 0 errors | T2/T4/T6 |
| 26-03-01 | **Dispatch Wave 1 완료** | FE-001~003(SvgChart, StitchIcon, InteractiveMotion), BE-003(Mail API Route) 구현 완료. tsc 0 errors | T2/T3/T6 |
| 26-03-01 | **V1.0 Production Readiness** | Admin Pass, Calendar, Support(수익화) 구현 및 배포 | Architect |
| 26-02-28 | Vercel 배포 | Next.js 서버 최적화 | T8 |

---

## 8. 🐛 Error Catalog `#errors`
> 반복되는 에러와 그 해결책. 이 목록에 없는 에러 최초 해결 시 즉시 등재(Memory Update) 필수.

| ID | 패턴 | 원인 | 표준 해결책 |
|----|------|------|------------|
| ERR-001 | `window is not defined` | SSR 구역 내 DOM 개체 사용 | 최상단에 `"use client"` 지시어 추가 |
| ERR-002 | Supabase RLS 거부 | DB 정책 허점 | `schema.sql` 내 RLS 정책 업데이트 후 T3/T9 Handoff |
| ERR-003 | 모션 프레임 드랍 | `framer-motion` 속성 에러 | `layoutId` 또는 `key` props 확인 |
| ERR-004 | 인코딩 깨짐 (EUC-KR) | 파일 저장 인코딩 불일치 | 파일 전체 재작성 (UTF-8), `write_to_file` Overwrite 사용 |
| ERR-005 | `Cannot find name 'X'` in saju.ts | 상수가 함수 아래 선언되어 호이스팅 불가 | 사용 전 최상단에 const 선언 이동 |
| ERR-006 | Duplicate key in object literal | TS strict mode에서 중복 프로퍼티 키 에러 | 중복 키 제거 (e.g. messageByCode) |
| ERR-007 | Next.js API Route Error (TS2344) | HTTP 메서드 외의 함수를 export 하여 라우트 계약 위반 | `export` 키워드 제거 또는 별도 lib 파일로 분리 |

