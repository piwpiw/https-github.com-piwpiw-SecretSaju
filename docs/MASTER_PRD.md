# MASTER PRD: Secret Paws (멍냥의 이중생활)

**Version:** 4.0 (10단계 고도화 · 검증 · Content DB·AI 준비)  
**Objective:** Hyper-Personalized Fortune Telling Platform with Viral Loops, Micro-Transactions, Food/Product Recommendations. 런칭용 예외처리·테스트·관리자/사용자 검증 반영.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **서비스명** | 멍냥의 이중생활 (Secret Paws) |
| **핵심 가치** | 사회적 가면(Persona) 뒤에 숨겨진 본능(Instinct)을 밈(Meme)과 데이터로 폭로한다. |
| **타겟** | 10대(재미/공유) ~ 30대(현실/자조/결제) |
| **플랫폼** | 모바일 웹 (Web App), 추후 앱 패키징 가능 |
| **최소 수준** | **사주아이 수준** — 생년·월·일 입력 → 일주 기반 60동물 결과 + 추천 음식/제품까지 즉시 동작 |

---

## 2. Tech Stack & Infrastructure

| 구분 | 스택 |
|------|------|
| **Framework** | Next.js 14 (App Router, TypeScript) |
| **Styling** | Tailwind CSS, Shadcn/ui 스타일(Design System), Framer Motion |
| **Backend/DB** | Supabase (PostgreSQL, Edge Functions, Auth, Storage) |
| **Payment** | Toss Payments (Widget Mode) |
| **AI** | OpenAI GPT-4o-mini (Phase 3 개인화 텍스트용, 선택) |
| **Analytics** | Vercel Analytics + Google Analytics 4 (Phase 2) |

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
  birth_date TIMESTAMP WITH TIME ZONE NOT NULL,
  gender TEXT CHECK (gender IN ('M', 'F')),
  kakao_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- animal_archetypes (정적 + 추천)
CREATE TABLE animal_archetypes (
  code VARCHAR(10) PRIMARY KEY,
  animal_name TEXT NOT NULL,
  base_traits JSONB NOT NULL DEFAULT '{}',
  age_context JSONB NOT NULL DEFAULT '{}',
  food_recommendations JSONB DEFAULT '[]',
  product_recommendations JSONB DEFAULT '[]'
);

-- unlock_logs
CREATE TABLE unlock_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  target_friend_id UUID,
  unlock_level INT NOT NULL CHECK (unlock_level IN (2, 3)),
  amount INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.3 추천 데이터 (음식·제품)

- **음식:** `food_recommendations` — `[{ name, reason, emoji }]` (연령대별 확장 가능)
- **제품:** `product_recommendations` — `[{ name, category, reason, emoji, link? }]`
- 현재: `src/data/foodRecommendations.ts`, `src/data/productRecommendations.ts`에서 60갑자별 3개씩 풀 기반 매핑. DB 연동 시 `animal_archetypes` JSONB 사용.

---

## 4. UX Flow & Features

### Phase 1 (현재 구현 완료)

1. **The Hook:** 메인 — 생년월일·성별 입력 → 로딩 → 결과
2. **The Reveal (Lv.1):** 결과 카드 — 동물명, 일주, 겉모습, 해시태그
3. **추천:** 동물 타입별 추천 음식 3종, 추천 제품 3종
4. **오늘의 개소리:** `/api/daily-fortune` → 메인 상단 배너
5. **Viral Lock (Lv.2):** 공유 CTA → 공유/복사 시 카드 뒷면(친구들이 보는 너) 해금
6. **Monetization (Lv.3):** "새벽 2시의 본능" 블러 → 300원 결제 CTA → 결제 모달(스텁) 후 해금

### Phase 2 (예측·준비됨)

- Supabase 실제 연동: `.env` 설정, `schema.sql` 마이그레이션, `lib/supabase.ts` 사용
- Toss Payments: `lib/payment.ts` 위젯 호출, `/api/payment/verify` 서버 검증, `/payment/success`, `/payment/fail` 리다이렉트
- Share: OG 이미지·딥링크, 공유 메시지 포맷 고정
- Analytics: `lib/analytics.ts` — result_view, share_click, payment_click, payment_complete

### Phase 3 (예측·스텁만)

- **익명 선물하기:** `/gift` — 친구 생년월일 입력 → 결제 → 익명 결과 링크 전달
- **AI 개인화:** OpenAI로 결과 문구/비밀 문구 연령·성별 맞춤 생성 (선택)
- **PWA/앱 패키징:** manifest, Service Worker, Capactior 등

---

## 5. 구현 체크리스트 (Cursor 업데이트 시 기준)

### ✅ 이미 구현된 요소

- [x] Next.js 14 App Router, TypeScript, Tailwind, Framer Motion
- [x] DACRE: `lib/saju.ts` (일주 계산), `lib/archetypes.ts` (아키타입 조회)
- [x] 60동물 목업: `data/animals.json` + 60개 동물명 폴백
- [x] **추천 음식/제품:** `data/foodRecommendations.ts`, `data/productRecommendations.ts` → 결과 화면 연동
- [x] UI: HeroSection, BirthInputForm, ResultCard(플립), RecommendationsSection, ShareSection, SecretBlur, SecretPawsFlow
- [x] API: `/api/recommendations`, `/api/daily-fortune`, `/api/payment/verify` (스텁)
- [x] 페이지: `/`, `/payment/success`, `/payment/fail`, `/gift` (스텁)
- [x] Supabase 스키마: `supabase/schema.sql` (users, animal_archetypes, unlock_logs, food/product JSONB)
- [x] 결제/분석 스텁: `lib/payment.ts`, `lib/analytics.ts`

### ⬜ Phase 2에서 구현할 요소

- [ ] `.env`에 Supabase URL/Key 설정 후 DB 마이그레이션
- [ ] Toss 클라이언트 키·success/fail URL 설정, `lib/payment.ts`에서 위젯 호출
- [ ] `/payment/success`에서 query로 paymentKey/orderId 수신 → `/api/payment/verify` 호출 → unlock_logs insert
- [ ] OG 메타태그 및 공유 썸네일
- [ ] `lib/analytics.ts`에 gtag 또는 Vercel Analytics 연동

### ⬜ Phase 3에서 구현할 요소

- [ ] `/gift`: 친구 생년월일 입력 폼 → 결제 → 결과 페이지 고유 링크 생성·전달
- [ ] (선택) OpenAI로 연령·성별 맞춤 문구 생성
- [ ] PWA manifest, 오프라인/캐시 전략

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
