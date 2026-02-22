# ERROR CATALOG: 예상 오류 및 한 줄 체크

**목적:** 예상 가능한 오류를 한 줄씩 정리하고, 수정·검증 시 체크용으로 사용.

---

## 1. 입력 유효성 (클라이언트)

| # | 예상 오류 | 한 줄 체크 | 처리 위치 |
|---|-----------|------------|-----------|
| E1 | 생년 미입력/빈 문자열 | `year.trim() === ''` → "연도를 입력하세요" | BirthInputForm |
| E2 | 월/일 미입력 | `!month \|\| !day` → "월과 일을 입력하세요" | BirthInputForm |
| E3 | 연도 범위 초과 (예: 1899, 2031) | `year < 1900 \|\| year > 2030` → "1900~2030년 사이로 입력하세요" | BirthInputForm |
| E4 | 월 범위 초과 | `month < 1 \|\| month > 12` → "1~12월 사이로 입력하세요" | BirthInputForm |
| E5 | 일 범위 초과 (월 무관 1~31) | `day < 1 \|\| day > 31` → "1~31일 사이로 입력하세요" | BirthInputForm |
| E6 | 존재하지 않는 날짜 (2월 30일 등) | `new Date(y,m-1,d)` 후 `getMonth()+1 !== m \|\| getDate() !== d` | validation.ts |
| E7 | 미래 생년월일 | `birthDate > new Date()` → "생년월일은 오늘 이전이어야 합니다" | validation.ts / SecretPawsFlow |
| E8 | NaN (숫자 아님) | `isNaN(Number(year))` 등 → "숫자를 입력하세요" | BirthInputForm |

---

## 2. DACRE / 라이브러리 (런타임)

| # | 예상 오류 | 한 줄 체크 | 처리 위치 |
|---|-----------|------------|-----------|
| E9 | Date 생성 실패 (Invalid Date) | `isNaN(birthDate.getTime())` → fallback 또는 에러 반환 | saju.ts / SecretPawsFlow |
| E10 | 일주 인덱스 음수/60 이상 | `(x % 60 + 60) % 60` 또는 `Math.max(0, Math.min(59, idx))` | saju.ts |
| E11 | code가 PILLAR_CODES에 없음 | `PILLAR_CODES.includes(code)` → 폴백 인덱스 0 또는 400 | archetypes.ts, API |
| E12 | ageGroup이 10s|20s|30s 아님 | 화이트리스트 체크 후 기본값 "20s" | archetypes.ts, API |
| E13 | animals.json 로드 실패/손상 | ARCHETYPES 빈 배열 대비 getDefaultArchetype 사용 | archetypes.ts |
| E14 | 추천 풀 빈 배열 | `FOOD_POOL[i]` 등 optional chaining 또는 기본 1개 반환 | foodRecommendations.ts, productRecommendations.ts |

---

## 3. API 라우트

| # | 예상 오류 | 한 줄 체크 | 처리 위치 |
|---|-----------|------------|-----------|
| E15 | code 쿼리 누락 | `!code` → 400 + { error: "Missing code" } | /api/recommendations |
| E16 | code 잘못됨 | `!PILLAR_CODES.includes(code)` → 400 | /api/recommendations |
| E17 | daily-fortune 서버 에러 | try/catch → 500 + { error: "Daily fortune failed" } | /api/daily-fortune |
| E18 | payment/verify body 누락 | `!body.paymentKey` 등 → 400 | /api/payment/verify |
| E19 | JSON parse 실패 | try/catch request.json() → 400 | POST API 전반 |

---

## 4. UI / 클라이언트

| # | 예상 오류 | 한 줄 체크 | 처리 위치 |
|---|-----------|------------|-----------|
| E20 | 결과 계산 중 throw | try/catch → setError, "결과를 불러오지 못했어요. 다시 시도해 주세요." | SecretPawsFlow |
| E21 | fetch 실패 (daily-fortune 등) | .catch → 배너 숨기거나 "오늘의 개소리 로드 실패" | DailyFortuneBanner |
| E22 | 공유 API 거부 (navigator.share) | catch 후 clipboard fallback 이미 적용 여부 확인 | ShareSection |
| E23 | result null인데 ResultCard 렌더 | `result && <ResultCard ... />` 이미 적용 여부 확인 | SecretPawsFlow |
| E24 | foods/products 빈 배열 | 길이 0일 때 "추천 준비 중" 등 안내 문구 | RecommendationsSection |

---

## 5. 환경 / 빌드

| # | 예상 오류 | 한 줄 체크 | 처리 위치 |
|---|-----------|------------|-----------|
| E25 | NEXT_PUBLIC_* 미설정 (Supabase 등) | getSupabase() null 반환으로 방어 | supabase.ts |
| E26 | 빌드 시 JSON import 실패 | resolveJsonModule true, 파일 경로 대소문자 | tsconfig, 데이터 경로 |
| E27 | hydration 불일치 | 서버/클라이언트 동일 데이터 소스(날짜 등) 주의 | daily-fortune 등 |

---

## 6. 보안 / 운영

| # | 예상 오류 | 한 줄 체크 | 처리 위치 |
|---|-----------|------------|-----------|
| E28 | /admin 비인가 접근 | (Phase 2) 쿼리 키 또는 세션 체크 | /admin/page.tsx |
| E29 | API 과다 호출 | (Phase 2) rate limit 또는 캐시 | API routes |
| E30 | 결제 검증 없이 해금 | 서버 검증 후에만 unlock_logs 기록 | /api/payment/verify |

---

## 체크리스트 사용법

- PR 전: 위 표에서 해당하는 번호(E1~E30)가 코드에서 처리되었는지 한 줄씩 확인
- 관리자 검증: /admin에서 E9~E18 해당 API·입력 시나리오 테스트
- 사용자 검증: E1~E8, E20~E24 시나리오 수동 테스트
