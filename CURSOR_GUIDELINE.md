# Cursor 업데이트 요청용 지침

**이 프로젝트를 수정·확장할 때 반드시 아래 문서를 기준으로 하세요.**

## 📁 상세 명세

- **[docs/MASTER_PRD.md](./docs/MASTER_PRD.md)** — 전체 PRD (v4.0), Tech Stack, DACRE, UX Flow, 구현 체크리스트, 검증·Content DB·AI
- **[docs/BLUEPRINT.md](./docs/BLUEPRINT.md)** — 10단계 고도화 로드맵, 관리자/사용자 검증, Content DB·AI 연동
- **[docs/ERROR_CATALOG.md](./docs/ERROR_CATALOG.md)** — 예상 오류 한 줄 체크 (E1~E30)
- **[docs/USER_VERIFICATION.md](./docs/USER_VERIFICATION.md)** — 사용자 E2E 체크리스트

## ⚡ 최소 동작 기준 (사주아이 수준)

- 생년월일·성별 입력 → **일주 기반 60동물 결과** + **추천 음식 3종** + **추천 제품 3종** 즉시 표시
- 공유 시 Lv.2(카드 뒷면) 해금, 결제 CTA 시 Lv.3 블러 해금(스텁)
- 메인에 **오늘의 개소리** 배너 (`/api/daily-fortune`)

## 🚫 유지할 것

- `src/lib/saju.ts` — 일주 계산 로직 및 `PILLAR_CODES` (60갑자)
- `src/data/foodRecommendations.ts`, `productRecommendations.ts` — 코드별 추천 풀
- `src/components/SecretPawsFlow.tsx` — 메인 플로우 (입력 → 결과 → 추천 → 공유 → SecretBlur)
- `supabase/schema.sql` — users, animal_archetypes(food/product JSONB), unlock_logs
- `src/lib/validation.ts` — 생년월일 유효성, ageGroup 화이트리스트
- `src/app/admin/page.tsx` — 관리자 전체 검증 (20명 교차 검증용)

새 기능 추가 시 **docs/MASTER_PRD.md**의 Phase 2/3 섹션과 **docs/BLUEPRINT.md** 10단계를 따르세요. 예외·에러는 **docs/ERROR_CATALOG.md** 한 줄 체크를 반영하세요.
