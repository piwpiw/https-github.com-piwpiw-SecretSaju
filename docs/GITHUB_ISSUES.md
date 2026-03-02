# ✅ GitHub Issues Base (Phase 2: UI/BE 개선)

현재 저장소 반영 기준으로 수동 추적하기 위한 이슈 목록입니다.
우선순위 및 상태는 실행 이력을 기준으로 정리했습니다.

---

## ✅ [Feature] UI/UX 개선 (SVG & Motion 보강)
* **Status**: Done
* **Priority**: High

### Checklist
- [x] 정적 PNG/JPG 리소스를 동적 SVG 패턴/그래픽으로 전면 교체 완료.
- [x] 오행(Five Elements) 및 십성(Sipsong) 라벨/차트 요소를 SVG Stitch 스타일로 정합화.
- [x] `framer-motion` 기반 스크롤 및 호버/탭 인터랙션으로 UI 반응성 고도화 완료.

### Implementation Spec
- `src/components/charts/RadarChart.tsx`: 오행 라벨 고정/호버 인터랙션 정합.
- `src/app/relationship/[id]/vs/page.tsx`: 공유 버튼 `framer-motion` hover/tap 처리.

---

## ✅ [Feature] MCP OAuth 2.1 통합 강화
* **Status**: Done
* **Priority**: High

### Checklist
- [x] 기존 Kakao 단일 인증에서 MCP 기반 OAuth 2.1 범용 인증으로 확장 완료.
- [x] Authorization Code Grant flow 점검 및 PKCE(Proof Key for Code Exchange) 적용.
- [x] `src/lib/auth-mcp.ts` 및 `/src/app/api/auth/mcp/callback/route.ts` 보안/중복 호출 가드 정합성 완료.
- [x] `clearMcpStorageCookies` → `clearMcpStateArtifacts` 리팩토링 (불필요한 쿠키 초기화 제거).

### Implementation Spec
- App Router 라우팅에서 상태 추적 및 에러 분기 강화.
- 토큰 갱신 정책(Refresh Token Rotation) 및 예외 처리 반영.
- **DB Schema Update**: `users` 테이블에 `mcp_access_token`, `mcp_refresh_token`, `auth_provider` 정합 반영.

---

## ✅ [Feature] Notion API 연동 운영
* **Status**: Done
* **Priority**: Medium

### Checklist
- [x] 문의/오류 이벤트를 Notion Database API로 수집.
- [x] Route Handler에서 Notion 이벤트 기록 및 장애 감시 로그 분리.
- [x] 폴백 전략 강화: 필드 누락 에러 시 다중 후보 필드셋 순차 시도.

### Implementation Spec
- `@notionhq/client` 패키지 반영.
- `src/lib/notion.ts` 구성: `insertNotionRow(data)` 구현/강화.
- 필수 환경변수: `NOTION_API_KEY`, `NOTION_DATABASE_ID` 반영.

---

## ✅ [Feature] 트랜잭셔널 메일 연동
* **Status**: Done
* **Priority**: Medium

### Checklist
- [x] 환영/결제/분석 결과 메일 템플릿 분리 및 결과 전달 채널 연동.
- [x] Next.js API Route 기반 Transactional Email API 연동.

### Implementation Spec
- `resend` 또는 `sendgrid` 기반 운영 환경 구성.
- `src/lib/mail.ts` 구현: `sendWelcomeEmail()`, `sendResultEmail()` 핸들러 반영.
- 템플릿 정리로 운영 메시지 정합성 유지.

---

## ✅ [Feature] Wave 5 — 사주 엔진 고도화 & 버그 수정
* **Status**: Done
* **Priority**: High

### Checklist
- [x] Daewun 절기(Jeol-gi 12절) 기반 고정밀 대운 시작 나이 계산
- [x] Sinsal 8종 확장 (천을귀인, 문창귀인, 백호살, 괴강살 추가)
- [x] 용신(Yongshin) 기반 일일운세 스코어링 (기존 랜덤 → Myeongni 로직)
- [x] AuthModal.tsx 인코딩 깨짐 수정 (UTF-8 재작성)
- [x] Footer.tsx 인코딩 깨짐 수정 (UTF-8 재작성)
- [x] saju.ts STEM_ELEMENTS 미정의 TS 에러 수정
- [x] saju.ts elementBasicPercentages 버그 수정 (ec.금 → epb.금)
- [x] MCP OAuth clearMcpStateArtifacts 리팩토링
- [x] Supabase Mock upsert onConflict 옵션 지원

---

## ✅ Residual Work Status (최종 완료)
- [x] MCP OAuth PKCE: complete (src/lib/auth-mcp.ts, src/app/api/auth/mcp/callback/route.ts).
- [x] 보안/인증 예외 처리: state TTL 및 payload parse 동기화 완료
- [x] UI/UX SVG & Motion tasks: production-level 보강 반영 완료.
  - `src/components/charts/RadarChart.tsx`
  - `src/app/relationship/[id]/vs/page.tsx`
- [x] 외부 PNG/JPG 의존성 제거: 로그인/유사 화면 및 배경 컴포넌트들을 data URI 패턴 교체 완료.
  - `src/components/dashboard/DestinyNetwork.tsx`
  - `src/app/encyclopedia/page.tsx`
  - `src/components/QuantumBackground.tsx`
  - `src/app/custom/partnership/page.tsx`
  - `src/app/login/page.tsx`
- [x] MCP 문서 정합성 동기화 완료
  - `docs/GITHUB_ISSUES.md` 항목 정렬 정리 및 Done 상태 변경
  - `docs/00-overview/mcp-rollback-checklist.md` 운영(만료) 절차 동기화

---

## 🔄 [Feature] Q2-001 — Toss 결제 서버 검증 완성
* **Status**: In Progress
* **Priority**: Critical (P0)

### Checklist
- [ ] `/api/payment/verify` 서명 검증 + 젤리 지급 완성
- [ ] `payment/success` 페이지 결제 응답 상태 연동
- [ ] 중복 결제 방지 로직 (`orders` 테이블 idempotency)

---

## 🔄 [Feature] Q2-002 — GA4 Analytics + OG 이미지 API
* **Status**: In Progress
* **Priority**: High (P1)

### Checklist
- [ ] `src/lib/analytics.ts` GA4 trackEvent 래퍼
- [ ] `layout.tsx` GA4 Script 주입
- [ ] `/api/og/route.tsx` 동적 사주 결과 카드 이미지 (1200×630)
- [ ] 결과 페이지 OG 메타태그 적용

---

## 🔄 [Feature] Q2-003 — 카카오 공유 버튼
* **Status**: In Progress
* **Priority**: High (P1)

### Checklist
- [ ] `src/components/share/KakaoShareButton.tsx` (Kakao JS SDK)
- [ ] `/fortune` 결과 페이지 카카오 공유 연동
- [ ] VS 비교 페이지 카카오 공유 연동

---

## 📋 [Feature] Q2-004 — 레퍼럴 시스템
* **Status**: Planned
* **Priority**: Medium (P1)

### Checklist
- [ ] 초대 코드 발급 API (`/api/referral/generate`)
- [ ] 초대 코드 적립 API (`/api/referral/redeem`)
- [ ] 마이페이지 ReferralCard 컴포넌트

---

## 📋 [Feature] Q2-005 — 운세 캘린더 고도화
* **Status**: Planned
* **Priority**: Medium (P1)

### Checklist
- [ ] 용신 오행 기반 일별 길흉 색상 코딩
- [ ] 날짜 클릭 → 신살/십성 드릴다운 패널
- [ ] 월별 운세 히트맵

## Wave 21 Issue Bundling Rules
- Create issues in bundles of 20 per team (FE/BE/DO)
- Prefix: `Wave-21` in title and label
- Keep each issue single-scope and map to one checklist item
- Close only after `docs/active-dispatch.md` is updated
