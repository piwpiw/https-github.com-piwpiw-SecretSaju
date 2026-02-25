# 📝 GitHub Issues Base (Phase 2: 고도화 및 외부 연동)

아래 항목은 GitHub 리포지토리에 즉시 Issue로 등록하고 스프린트 관리를 할 수 있도록 작성된 명세입니다.

---

## 🟢 [Feature] UI/UX 한단계 업그레이드 (SVG & Stitch 디자인)
* **Status**: Todo
* **Priority**: High

### Checklist
- [ ] 정적 PNG/JPG 리소스를 동적 SVG로 전면 교체.
- [ ] 오행(Five Elements) 및 십성(Sipsong) 레이더 차트에 SVG Stitch(선 그리기) 애니메이션 적용.
- [ ] `framer-motion`과 조합하여 스크롤 및 마우스 오버 시 상호작용하는 UI 고도화.

### Implementation Spec
- `src/components/ui/` 하위에 `SvgChart.tsx`, `StitchIcon.tsx` 컴포넌트 추가.
- `d3.js` 또는 `framer-motion`의 `pathLength` 속성을 활용한 드로잉 애니메이션 구현.

---

## 🔵 [Feature] MCP OAuth 2.1 통합 인증 구축
* **Status**: Todo
* **Priority**: High

### Checklist
- [ ] 기존 Kakao 단일 인증 체계에서 MCP (Model Context Protocol) 기반 OAuth 2.1 범용 인증 레이어로 확장.
- [ ] Authorization Code Grant 흐름 점검 및 PKCE(Proof Key for Code Exchange) 적용.
- [ ] `src/lib/auth-mcp.ts` 모듈 생성.

### Implementation Spec
- NextAuth.js 또는 독립적인 OAuth 2.1 프로토콜 기반 핸들러 작성.
- 리프레시 토큰 로테이션(Refresh Token Rotation) 체계 구현으로 보안성 강화.
- **DB Schema Update**: `users` 테이블에 `mcp_access_token`, `mcp_refresh_token`, `auth_provider` 컬럼 추가.

---

## 🟠 [Feature] 노션(Notion) API 연동 및 관리자 로깅
* **Status**: Todo
* **Priority**: Medium

### Checklist
- [ ] 중요 결제 이벤트, 고객 문의(Inquiries) 트래킹을 위한 Notion Database API 연동.
- [ ] 백엔드(Route Handlers)에서 이벤트 발생 시 Notion으로 로깅.

### Implementation Spec
- `@notionhq/client` 패키지 설치.
- `src/lib/notion.ts` 작성: `insertNotionRow(data)` 함수 구현.
- 환경변수 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 주입.

---

## 🟣 [Feature] 자동 메일 발송 시스템 (SendGrid/Resend) 연동
* **Status**: Todo
* **Priority**: Medium

### Checklist
- [ ] 가입 환영 메일, 결제 영수증, 익명 사주 분석 결과 메일 전송 트리거 추가.
- [ ] Next.js API Route 내부에서 Transactional Email API 연동.

### Implementation Spec
- `resend` 패키지 설치 및 설정.
- `src/lib/mail.ts` 작성: `sendWelcomeEmail()`, `sendResultEmail()` 함수 구축.
- 이메일 템플릿(React Email)을 활용해 UI 일관성 유지.
