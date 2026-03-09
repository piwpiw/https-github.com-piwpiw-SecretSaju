# GitHub Issues Base (Phase 2: UI/BE 개선)

현재 문서의 인코딩 손상 이슈 대응 후 복구본으로 재정비했습니다.

## [Feature] UI/UX 개선 (SVG & Motion 보강)
- **Status**: Done
- **Priority**: High

### Checklist
- [x] 기존 정적 PNG/JPG 리소스를 동적 SVG 패턴/그라데이션으로 전면 교체.
- [x] 오행(Five Elements) 및 십성(Sipsong) 레이블/차트 선 처리 로직을 SVG Stitch 방식으로 보강.
- [x] `framer-motion` 기반 호버/탭 인터랙션을 적용.

### Implementation Spec
- `src/components/charts/RadarChart.tsx`: 오행 레이블 고정/호버 애니메이션 보강.
- `src/app/relationship/[id]/vs/page.tsx`: 공유 버튼 `framer-motion` hover/tap 처리.

## [Feature] MCP OAuth 2.1 통합 강화
- **Status**: Done
- **Priority**: High

### Checklist
- [x] 기존 Kakao 단일 인증에서 MCP 기반 OAuth 2.1 범용 인증으로 확장.
- [x] Authorization Code Grant flow에 `PKCE(Proof Key for Code Exchange)` 적용.
- [x] `src/lib/auth/auth-mcp.ts` 및 `src/app/api/auth/mcp/callback/route.ts` 보안/중복 처리 가드 보강.
- [x] `clearMcpStorageCookies` / `clearMcpStateArtifacts` 리팩터링으로 불필요 쿠키 초기화를 정리.

### Implementation Spec
- App Router 인증 요청 추적 분기를 개선해 예외 경로 가시성 향상.
- 토큰 갱신 정책(Refresh Token Rotation) 처리 예외 케이스를 반영.
- DB 스키마: `users` 테이블에 `mcp_access_token`, `mcp_refresh_token`, `auth_provider` 반영.

## [Feature] Notion API 연동
- **Status**: Done
- **Priority**: Medium

### Checklist
- [x] 문의/결제/오류 이벤트의 Notion Database API 연동.
- [x] API Route에서 Notion 로깅 분기(성공/실패) 추가 및 가시성 강화.
- [x] 라우트별 실패 코드/오류 원인 기록 파이프라인 분리.

### Implementation Spec
- `@notionhq/client` 의존성 반영.
- `src/lib/integrations/notion.ts`: `insertNotionRow(data)` 구현/강화.
- 환경변수: `NOTION_API_KEY`, `NOTION_DATABASE_ID` 반영.

## [Feature] 환영/결제/분석 메일 자동화
- **Status**: Done
- **Priority**: Medium

### Checklist
- [x] 회원/결제/분석 결과 메일 발송을 분리된 트랜잭션 채널로 분리 처리.
- [x] Next.js API Route 기반 트랜잭션 메일 API 연동.
- [x] 운영/문서화용 템플릿 메시지 정합성 확보.

### Implementation Spec
- `src/lib/integrations/mail.ts`: `sendWelcomeEmail()`, `sendResultEmail()` 처리 구현 반영.

## [Feature] Wave 5 Calculation Logic Completion
- **Status**: Done
- **Priority**: High

### Checklist
- [x] 일간/월간/간지 기반 핵심 천간 계산 경로 안정화.
- [x] 십성/신강신약(양/음) 처리 보정.
- [x] 용신 및 명리 기반 코어 로직 정합성 점검.
- [x] `AuthModal.tsx` 라벨 깨짐 정리 (UTF-8 정규화).
- [x] `Footer.tsx` 라벨 깨짐 정리 (UTF-8 정규화).

## Recovery Note
- 원본 문자열 데이터는 과거 인코딩 훼손 이력으로 일부 문구가 정합 불가했으나, 현재 체크리스트/담당 범위/실행 이력은 운영 추적 가능한 정합본으로 재구성되었습니다.
