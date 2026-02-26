# BLUEPRINT: Secret Paws 10단계 고도화

**Version:** 1.0 · 20명 동시 개발/검증 대응  
**목표:** 구조 정리, 10단계 고도화, 예외처리·테스트·관리자/사용자 검증, Content DB·AI 연동 준비

---

## 10단계 로드맵 (주요 포인트)

| 단계 | 이름 | 주요 포인트 | 수정·개선 포인트 |
|------|------|-------------|------------------|
| **1** | **기반 정리** | 디렉터리·네이밍·env·타입 일원화 | `src/lib/validation.ts`, `.env.example` 검증 |
| **2** | **예외처리** | 입력/API/런타임 예외 일괄 처리 | `ERROR_CATALOG.md` 기준 한 줄씩 체크 |
| **3** | **유효성 검사** | 생년월일·API 파라미터·경계값 | min/max 날짜, code/ageGroup 화이트리스트 |
| **4** | **에러 UX** | 사용자 노출 메시지·복구 CTA | 토스트/인라인 메시지, "다시 시도" |
| **5** | **관리자 검증** | /admin 전체 기능 체크리스트 | API·DACRE·추천·결제 스텁·공유 일괄 검증 |
| **6** | **사용자 검증** | E2E 시나리오·체크리스트 | 입력→결과→추천→공유→Lv.3 플로우 |
| **7** | **테스트** | 단위·통합·검증 스크립트 | saju, archetypes, API route 테스트 |
| **8** | **런칭 준비** | 404/500/에러 바운더리·로깅 | `error.tsx`, `not-found.tsx`, 로그 포맷 |
| **9** | **Content DB** | Supabase 콘텐츠 테이블·마이그레이션 | animal_archetypes 보강, 음식/제품 DB화 |
| **10** | **AI 연동** | 콘텐츠 다듬기·개인화 문구 | OpenAI 연동, 연령/성별 맞춤 문구 생성 |
| **11** | **무인 자동화** | n8n Webhook 연동 & Zero-Shot Fix | CRM, 마케팅 자동화, CI/CD 단일 픽스 체계 확립 |

---

## 관리자 모드 검증 (전체 검증)

- **경로:** `/admin`
- **역할:** 20명 개발/검증 시 전체 기능을 한 화면에서 체크
- **체크 항목:**
  1. DACRE: 고정 생년월일 3건 → 일주/코드/나이대 일치
  2. 추천: 동일 코드 → 음식 3종·제품 3종 반환
  3. API: `/api/recommendations`, `/api/daily-fortune` 200 + 스키마
  4. API: `/api/payment/verify` 스텁 응답
  5. 페이지: `/`, `/payment/success`, `/payment/fail`, `/gift` 접근 가능
  6. 예외: 잘못된 code/날짜 → 400 또는 클라이언트 에러 메시지

---

## 사용자 모드 검증 (E2E 시나리오)

- **시나리오 1:** 메인 → 생년월일 입력 → 결과 카드 + 추천 음식/제품 → 스크롤
- **시나리오 2:** 공유 버튼 → (공유 또는 복사) → 카드 뒷면 해금
- **시나리오 3:** 새벽 2시 본능 → 300원 CTA → 결제 모달 → 닫기/해금
- **시나리오 4:** 잘못된 날짜(2월 30일 등) → 제출 시 유효성 메시지
- **시나리오 5:** 오늘의 개소리 배너 노출

---

## Content DB · AI 연동 (9–10단계)

### Content DB (9단계)

- **위치:** Supabase `animal_archetypes` 확장 + (선택) `content_versions`
- **내용:** base_traits, age_context, food_recommendations, product_recommendations를 DB에서 로드
- **마이그레이션:** 기존 `data/animals.json`, food/product 풀 → DB 시드 또는 동기화 스크립트
- **API:** `/api/content/archetype?code=` 또는 Edge Function으로 콘텐츠 반환

### AI 연동 (10단계)

- **목적:** 콘텐츠 다듬기, 연령/성별 맞춤 문구
- **입력:** code, ageGroup, gender, (선택) seed 문구
- **출력:** hook, secret_preview, mask 등 자연어 문구
- **저장:** 생성 결과 캐시(DB 또는 KV), 재사용 시 캐시 우선

---

## 교차 검증 (20명 수준)

- **코드:** PR 시 필수 체크 — `ERROR_CATALOG.md` 항목 위반 여부
- **관리자:** /admin 체크리스트 전 항목 통과 후 머지
- **사용자:** E2E 시나리오 5종 이상 수동 또는 자동 검증 후 릴리스
- **문서:** PRD·BLUEPRINT·ERROR_CATALOG 업데이트 시 PRD 버전 bump

---

## 추가된 파일 (v4.0)

| 경로 | 용도 |
|------|------|
| `src/lib/validation.ts` | 생년월일 유효성, ageGroup 화이트리스트 |
| `src/app/admin/page.tsx` | 관리자 전체 검증 체크리스트 |
| `src/app/error.tsx` | 에러 바운더리 |
| `src/app/not-found.tsx` | 404 페이지 |
| `docs/ERROR_CATALOG.md` | 예상 오류 한 줄 체크 |
| `docs/USER_VERIFICATION.md` | 사용자 E2E 체크리스트 |

---

## 문서 참조

- **PRD:** [MASTER_PRD.md](./MASTER_PRD.md) — 요구사항, 스키마, API, Phase, 검증·Content DB·AI
- **에러:** [ERROR_CATALOG.md](./ERROR_CATALOG.md) — 예상 오류 및 한 줄 체크
- **사용자 검증:** [USER_VERIFICATION.md](./USER_VERIFICATION.md) — E2E 시나리오
- **Cursor:** [CURSOR_GUIDELINE.md](../CURSOR_GUIDELINE.md) — 구조 유지·수정 시 참고
