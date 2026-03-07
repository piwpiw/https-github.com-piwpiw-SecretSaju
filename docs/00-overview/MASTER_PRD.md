# MASTER PRD: Secret Saju (시크릿사주)

**Version:** 6.0 (Wave 11.5 완료 · Context Efficiency Engineering · Multi-AI MPPS)  
**Objective:** Hyper-Personalized Fortune Telling Platform with MPPS (Multi-LLM Persona), real-time Transit Engine, and Anti-Hallucination Multi-AI development system.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **서비스명** | 시크릿사주 (Secret Saju) |
| **핵심 가치** | 운명의 암호(Secret)를 고정밀 사주 엔진과 미려한 UI로 풀어낸다. |
| **타겟** | 20대(운세/재미) ~ 40대(현실 조언/심층 분석) |
| **플랫폼** | 모바일 우선 웹 (Mobile-First Web App) |
| **최소 수준** | **Jeomsin(점신) 수준** — 고정밀 만세력 + 일일 운세 점수 + 10-Team Agent 기반 무결점 운영 |

---

## 2. Tech Stack & Infrastructure

| 구분 | 스택 |
|------|------|
| **Framework** | Next.js 15 (App Router, TypeScript, React 19) |
| **Styling** | Tailwind CSS, Framer Motion, Glassmorphism design system |
| **Backend/DB** | Supabase (PostgreSQL, Edge Functions, Auth, Storage) |
| **Payment** | Toss Payments (Widget Mode) + Stripe (Checkout, secondary) |
| **AI** | GPT-4o / Claude 3.5 / Gemini 1.5 (MPPS Ensemble, Wave 11+) |
| **Analytics** | Vercel Analytics + GA4 |
| **Auth** | Kakao OAuth + MCP OAuth (custom provider) |

**Design Tokens**

- Primary: `#7C3AED` (Deep Violet)
- Secondary: `#F59E0B` (Amber Gold)
- Background: `#09090B` (Rich Black)
- Typography: Noto Sans KR (본문), Do Hyeon (제목)

---

## 3. Core Logic: DACRE 엔진

### 3.1 입력·출력

- **Input:** 생년월일(·성별)
- **Processing:** 만세력 기준일(2000-01-01 戊午) 대비 경과일 mod 60 → 일주 인덱스 0~59
- **Output:** 일주 코드(예: GAP_JA), 한글명(갑자), 나이대(10s/20s/30s)

### 3.2 데이터 구조 (Supabase Schema)

```sql
-- users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kakao_id BIGINT UNIQUE,
  auth_provider TEXT DEFAULT 'kakao',
  email TEXT,
  nickname TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- saju_profiles
CREATE TABLE saju_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT DEFAULT 'self',
  birthdate DATE NOT NULL,
  birth_time TIME,
  calendar_type TEXT NOT NULL,
  gender TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- jelly_wallets
CREATE TABLE jelly_wallets (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  total_consumed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  jellies INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- campaigns (Crawlers)
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  landing_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 추천 데이터 (음식·제품)
- **현재 활용:** `food_recommendations`, `product_recommendations` 테이블 연동 (Phase 9+).
- **폴백:** `src/data/foodRecommendations.ts`, `src/data/productRecommendations.ts` 60갑자별 매핑.

---

## 4. UX Flow & Features

### Phase 1 (완료)
- 메인: 생년월일 입력 → 결과
- 결과 카드: 동물명, 일주, 해시태그
- 추천: 음식/제품 3종

### Phase 2 (완료)
- Supabase 실제 연동 및 마이그레이션
- Toss Payments 위젯 호출 및 서버 검증 고도화
- Kakao 공유(동적 OG) 및 Web Share API 연동
- GA4 분석 통합

### Phase 3 (완료/고도화)
- Wave 5 Saju Engine: Daewun 절기 기반 고정밀화, Sinsal 8종 확장, 용신 기반 일일운세 스코어링
- 10-Team Agent Architecture: T1~T10 분산 개발 체계 구축
- Crawlers: DinnerQueen, Revu 어댑터 구현 및 캠페인 데이터 동기화

### Phase 3 (예측·스텁만)

- **익명 선물하기:** `/gift` — 친구 생년월일 입력 → 결제 → 익명 결과 링크 전달
- **AI 개인화:** OpenAI로 결과 문구/비밀 문구 연령·성별 맞춤 생성 (선택)
- **PWA/앱 패키징:** manifest, Service Worker, Capactior 등

---

## 5. 구현 체크리스트 (Cursor 업데이트 시 기준)

### ✅ 이미 구현된 요소 (Up to Wave 11.5)

- [x] Next.js 15 App Router, TypeScript, Tailwind, Framer Motion
- [x] **Wave 5 Saju Engine:** Daewun 절기 기반 12절 고정밀화, Sinsal 10종 확장
- [x] **Toss Payments:** 실결제 + 서버 검증 + Notion sync + 첫구매 보너스 + 환불 정책
- [x] **Stripe:** Create-checkout 보조 결제 경로
- [x] **DB:** Supabase RLS 정책 및 Full-Schema 마이그레이션 완료
- [x] **Auth:** Kakao OAuth + MCP OAuth (custom, PKCE 포함)
- [x] **UI/UX:** Daily Fortune, Premium Card, Glassmorphism, Ambient Sound, Reading Progress Bar
- [x] **Crawlers:** 20+ Platform Adapters (DinnerQueen, Revu, SeoulOppa, GangnamFood 등)
- [x] **i18n:** 한국어/영어 다국어 (en/ko)
- [x] **Referral:** 추천인 코드 생성 및 사용 로직
- [x] **Wave 11 MPPS:** AI 라우팅, 페르소나 매트릭스, AI Intelligence Badge, Narrative Section
- [x] **Wave 11.5:** AI_BOOTSTRAP, ERROR_LEDGER, Context Efficiency Protocol, NEXT_ACTIONS
- [x] **Admin:** 73개 라우트 감사 통과 (0 failures)
- [x] **Production:** Vercel 배포 완료 (2026-03-05)

### ⬜ 남은 구현 항목 (NEXT_ACTIONS.md 참조)

**P0 (LLM API Keys 설정 후 즉시 완료)**
- [ ] `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GOOGLE_AI_KEY` 환경변수 설정 → Persona API 실연동

**P1 (다음 스프린트)**
- [ ] Content DB: `animal_archetypes` Supabase 테이블 보강 (현재 코드 참조)
- [ ] PWA manifest + Service Worker + 오프라인 캐시
- [ ] GA4 실이벤트 (`start_analysis`, `payment_complete`)

**P2 (품질 향상)**
- [ ] 선물하기 `/gift` E2E 검증
- [ ] Mock 모드 통합 유틸리티로 정리

> 전체 목록은 `NEXT_ACTIONS.md` 참조 (P0/P1/P2 우선순위 정의)

### ✅ 고도화·검증 (v4.0)

- [x] **예외처리:** `lib/validation.ts` (생년월일 유효성), BirthInputForm 인라인 에러, SecretPawsFlow try/catch + 사용자 메시지
- [x] **API 예외:** recommendations/daily-fortune/payment/verify try/catch, ageGroup 화이트리스트(`normalizeAgeGroup`)
- [x] **에러 UX:** error.tsx, not-found.tsx, 추천 빈 배열 시 "추천 준비 중"
- [x] **관리자 검증:** `/admin` — DACRE·API·추천·결제 스텁·잘못된 code 400 일괄 체크
- [x] **문서:** [docs/ERROR_CATALOG.md](./ERROR_CATALOG.md) (예상 오류 한 줄 체크), [docs/BLUEPRINT.md](./BLUEPRINT.md) (10단계), [docs/USER_VERIFICATION.md](./USER_VERIFICATION.md) (사용자 E2E)

### ⬜ Content DB · AI (9–10단계, BLUEPRINT)

- [ ] **Content DB:** animal_archetypes 보강·마이그레이션, 음식/제품 DB화, `/api/content/archetype` 또는 Edge Function
- [ ] **AI 연동:** 콘텐츠 다듬기·연령/성별 맞춤 문구 생성, 캐시 전략

---

## 6. 디렉터리 및 파일 구조 (전체)

```
SecretSaju/
├── docs/
│   ├── MASTER_PRD.md                 # 이 지침문서 (v4.0)
│   ├── BLUEPRINT.md                  # 10단계 고도화 로드맵
│   ├── ERROR_CATALOG.md              # 예상 오류 한 줄 체크
│   └── USER_VERIFICATION.md          # 사용자 모드 E2E 체크리스트
├── supabase/
│   └── schema.sql                     # users, animal_archetypes, unlock_logs
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── recommendations/route.ts   # GET ?code=&ageGroup=
│   │   │   ├── daily-fortune/route.ts     # GET 오늘의 개소리
│   │   │   └── payment/verify/route.ts    # POST 결제 검증
│   │   ├── payment/success/page.tsx
│   │   ├── payment/fail/page.tsx
│   │   ├── admin/page.tsx                 # 관리자 전체 검증
│   │   ├── gift/page.tsx                  # Phase 3 익명 선물
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── HeroSection.tsx
│   │   ├── BirthInputForm.tsx
│   │   ├── ResultCard.tsx
│   │   ├── RecommendationsSection.tsx     # 음식·제품 추천
│   │   ├── ShareSection.tsx
│   │   ├── SecretBlur.tsx
│   │   ├── SecretPawsFlow.tsx
│   │   └── DailyFortuneBanner.tsx
│   ├── data/
│   │   ├── animals.json
│   │   ├── foodRecommendations.ts        # 60갑자별 추천 음식 풀
│   │   └── productRecommendations.ts     # 60갑자별 추천 제품 풀
│   └── lib/
│       ├── saju.ts                       # 일주 계산, PILLAR_CODES
│       ├── archetypes.ts                 # getArchetypeByCode
│       ├── validation.ts                 # validateBirthInput, normalizeAgeGroup
│       ├── utils.ts
│       ├── supabase.ts                   # getSupabase()
│       ├── payment.ts                    # requestPayment 스텁
│       └── analytics.ts                  # trackEvent 스텁
├── .env.example
├── README.md
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## 7. API 명세

| Method | Path | 설명 | Phase |
|--------|------|------|-------|
| GET | `/api/recommendations?code=GAP_JA&ageGroup=20s` | 음식·제품 추천 JSON | 1 ✅ |
| GET | `/api/daily-fortune` | 오늘 날짜 기준 한 줄 예언 | 1 ✅ |
| POST | `/api/payment/verify` | 결제 검증·unlock_logs 기록 | 2 스텁 |

---

## 8. Cursor 업데이트 요청 시 지시사항

1. **기존 구조 유지:** 이 PRD와 위 디렉터리 구조를 기준으로, 새 기능 추가 시에도 `src/app`, `src/components`, `src/data`, `src/lib`, `supabase` 구분을 유지한다.
2. **데이터 일관성:** 일주는 항상 60갑자(0~59)와 `PILLAR_CODES`와 동기화한다. 동물·음식·제품 추천은 코드 단위로 확장 가능하게 유지한다.
3. **Phase 구분:** Phase 2(결제·DB·공유·분석)는 스텁/주석으로 이미 경로와 역할이 정해져 있으므로, 연동 시 해당 파일만 채우고 새 의존성은 최소화한다.
4. **최소 동작 기준:** "사주아이 수준" — 입력 → 일주 결과 + 동물 + 추천 음식/제품 + 공유/블러 해금 플로우가 **지금 상태에서도** 동작해야 한다. 이 플로우를 깨는 변경은 하지 않는다.

---

## 9. 3단계 예측 요약

| 단계 | 내용 | 상태 |
|------|------|------|
| **1단계** | 입력 → 결과 → 추천(음식/제품) → 공유 → Lv.3 블러/결제 스텁, 오늘의 개소리, API·페이지 스텁 | ✅ 구현 완료 |
| **2단계** | Supabase 연동, Toss 결제 연동, 결제 성공/실패 처리, OG/공유, Analytics | 스텁·스키마·경로 준비됨 |
| **3단계** | 익명 선물하기(/gift), AI 개인화(선택), PWA/앱 | 스텁·문서만 준비됨 |

---

## 10. 검증 · 예외 · Content DB·AI (v4.0)

### 검증

- **관리자 모드:** `/admin` — DACRE 고정 생년, 추천(GAP_JA), API 3종, 잘못된 code 400 자동 체크. [BLUEPRINT.md](./BLUEPRINT.md) 참고.
- **사용자 모드:** [USER_VERIFICATION.md](./USER_VERIFICATION.md) — E2E 5대 시나리오 체크리스트.

### 예외·에러

- **한 줄 체크:** [ERROR_CATALOG.md](./ERROR_CATALOG.md) — E1~E30 예상 오류 및 처리 위치. PR·검증 시 참고.
- **구현:** `lib/validation.ts`, BirthInputForm 인라인 에러, SecretPawsFlow try/catch, API try/catch, error.tsx, not-found.tsx.

### Content DB · AI (9–10단계)

- **Content DB:** Supabase `animal_archetypes` 확장 보강, 음식/제품 DB화·시드, (선택) `content_versions`. API 또는 Edge Function으로 콘텐츠 반환.
- **AI 연동:** 콘텐츠 다듬기·연령/성별 맞춤 문구 생성, 생성 결과 캐시(DB/KV). [BLUEPRINT.md](./BLUEPRINT.md) 9–10단계 참고.

이 지침문서를 Cursor에 업데이트 요청할 때 함께 전달하면, 위 구조와 Phase를 기준으로 수정·추가가 가능합니다.
