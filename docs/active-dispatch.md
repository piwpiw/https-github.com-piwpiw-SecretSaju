# Active Dispatch Log

- Updated: 2026-03-02
- Status: EXECUTION RUNNING

## Dispatch Wave 1 (Immediate, Parallel)

### T2/T6 (Frontend)
- Task IDs: FE-001, FE-002, FE-003
- Source: `docs/GITHUB_ISSUES.md`
- Scope:
  - FE-001: `- [x] 정적 PNG/JPG 리소스를 동적 SVG로 전면 교체. (변경: src/app/tarot/page.tsx)`
  - FE-002: `- [x] 오행(Five Elements) 및 십성(Sipsong) 레이더 차트에 SVG Stitch(선 그리기) 애니메이션 적용. (변경: src/components/charts/RadarChart.tsx)`
  - FE-003: `- [x] framer-motion과 조합하여 스크롤 및 마우스 오버 시 상호작용하는 UI 고도화. (변경: src/app/relationship/[id]/vs/page.tsx)`
- Delivery: `src/components/` + `src/components/charts/`
- ETA: 1차 업데이트 2시간

### T3 (Backend)
- Task IDs: BE-001, BE-002, BE-003
- Source: `docs/GITHUB_ISSUES.md`
- Scope:
- BE-001: `- [x] 기존 Kakao 단일 인증 체계에서 MCP (Model Context Protocol) 기반 OAuth 2.1 범용 인증 레이어로 확장. (변경: src/app/api/auth/mcp/callback/route.ts, supabase/migrations/005_add_mcp_fields_and_wallet_unique.sql, supabase/migrations/006_relax_users_kakao_id_for_mcp.sql)`
  - BE-002: `- [x] Notion Database API 연동 (문의/결제/오류 이벤트).`
  - BE-003: `- [x] 환영/결제/분석 결과 메일링 트리거 연동.`
- Delivery: `src/lib/auth-mcp.ts`, `src/lib/notion.ts`, `src/lib/mail.ts`, `src/app/api/**`
- ETA: 1차 업데이트 2시간

### T8 (DevOps)
- Task IDs: DO-001, DO-002
- Source: `docs/00-overview/roadmap.md`
- Scope:
  - DO-001: Beta Launch 운영 체크리스트 준비(Beta/Analytics/Bug Bash).
  - DO-002: `Payment integration` 및 `Share feature` 배포 전 준비 항목 정합성 점검.
- Delivery: `.github/`, `vercel.json`, `docs/00-overview/roadmap.md`
- ETA: 1차 업데이트 1시간

## Cross-team Handoff Rules
- 각 팀은 완료 시 `docs/active-dispatch.md`에 완료 항목을 즉시 `[x]`로 표시하고, 관련 파일 경로를 덧붙여 업데이트.
- 충돌 가능성이 높은 파일 편집은 T2/T3에서 동시 회피하도록 `src/components/ui`와 `src/app/api` 변경분은 선별 분기.
- 공통 우선순위: 보안(인증/토큰) > 결제 연동 > UI polish.

## Wave 상태 업데이트 자동 룰(권장)
- Wave 헤더는 `Dispatch Wave XX` 기준으로 `Status`를 `Not Started`, `In Progress`, `Completed` 중 1개로 맞춥니다.
- 한 Wave에서 `[ ]`가 1개라도 있으면 `Status: In Progress`로 유지.
- 해당 Wave에 속한 작업이 모두 `[x]`로 바뀌면 `Status: Completed`로 바로 갱신.
- 작업 완료 시 `[x]`와 함께 `파일 경로`와 `완료일(YYYY-MM-DD)`를 항목 뒤에 괄호로 기재.
- 완료일이 누락된 기존 항목은 다음 갱신 시 보강합니다.

## Blockers & Escalation
- MCP OAuth가 실제 제공자 엔드포인트 미정이면 임시 모크/Mock 모드로 진행 후 BE-001은 실제 엔드포인트 확정 시 마무리.
- Notion/메일 API 키 누락 시 Mock 모드 우선 제공하고, 값 주입 전까지 이벤트 적재 실패는 non-blocking 처리.

## Dispatch Wave: DocOps Sync (2026-03-01)
- Status: Completed
- Scope:
  - Core SOT hubs rewritten for clarity: `docs/index.md`, `docs/README_TEAM.md`, `docs/00-overview/README.md`, `docs/00-overview/document-governance.md`
  - Engineering runtime SOT aligned with actual commands:
    - `docs/01-team/engineering/deployment-guide.md`
    - `docs/01-team/engineering/testing-guide.md`
  - `docs/guides/deployment.md` marked as detail reference with explicit SOT notice.
- Result:
  - Faster instruction handoff (single command matrix)
  - Reduced policy duplication
  - Clear precedence when docs conflict

## Dispatch Wave 2 (Backend Hardening, 2026-03-01)
- Status: In Progress
- Task IDs: BE-015, BE-016
- Source: `src/lib/auth-mcp.ts`, `src/types/database.ts`, `src/lib/supabase.ts`, `docs/GITHUB_ISSUES.md`
- Progress:
  - [x] `src/lib/auth-mcp.ts`: providerUserId를 문자열 기반으로 정합화해 비정수 OIDC subject 처리 정책을 안정화.
  - [x] `src/types/database.ts`: users MCP 필드 + 프로필 필드 정합성 보강.
  - [x] `src/lib/supabase.ts`: mock payload 및 Database 타입 정렬.
  - [x] `docs/GITHUB_ISSUES.md`: MCP OAuth 통합 항목 완료 체크 반영.
- ETA: 즉시 반영

## Dispatch Wave 3 (UI + MCP Readiness, 2026-03-01)
- Status: Completed
- Task IDs: FE-001, FE-002, FE-008, FE-019, BE-009, DO-002
- Source: `src/components/AuthModal.tsx`, `src/app/auth/callback/page.tsx`, `src/app/api/auth/mcp/callback/route.ts`, `docs/guides/integrations.md`
- Progress:
  - [x] `src/components/AuthModal.tsx`: MCP 시작 버튼 접근성, 활성화 상태, 미연동 안내 메시지 추가.
  - [x] `src/app/auth/callback/page.tsx`: MCP 에러 코드 메시지맵 재정의 및 분기 처리.
  - [x] `src/app/api/auth/mcp/callback/route.ts`: 콜백 중복 호출 방지(`state`) 및 프로필 부재 실패 분기 추가.
  - [x] `docs/guides/integrations.md`: MCP 환경변수 운영 문서 반영.
  - [x] `src/lib/kakao-auth.ts`: 쿠키 사용자 데이터 파서에 MCP 확장 필드 반영.
  - [x] `src/app/mypage/page.tsx`: MCP 로그인 제공자 배지/식별자 표시 분기.
- ETA: 즉시 반영

## Dispatch Wave 4 (MCP Production Hardening, 2026-03-01)
- Status: Completed
- Task IDs: BE-010, BE-007, FE-007, FE-019
- Scope:
  - [x] `src/lib/auth-mcp.ts`: MCP OAuth 쿠키 TTL 로그/경고 로그 출력.
  - [x] `src/app/api/auth/mcp/callback/route.ts`: MCP 설정 미비 가드, 요청 추적 로그, 지갑 동기화 업서트 fallback.
  - [x] `src/lib/kakao-auth.ts`: 로그아웃 시 MCP 세션/상태 쿠키 일괄 정리.
  - [x] `src/app/auth/callback/page.tsx`: 에러 코드 노출(진단 로그용) 강화.
  - [x] `docs/00-overview/mcp-rollback-checklist.md`: MCP 장애 대응 운영 체크리스트 문서화.

## Dispatch Wave 5 (Profile Write Guard, 2026-03-02)
- Status: Completed
- Task IDs: FE-020, FE-021
- Scope:
  - [x] `src/app/my-saju/add/page.tsx`: 인증 미확인 상태에서 `local-user` 대체값으로 저장을 진행하지 않도록 진입 가드 추가.
  - [x] `src/app/my-saju/add/page.tsx`: 잔여 잔고 결제 플로우에서 사용자 ID 컨텍스트를 전파해 모달 confirm 분기에서 안전하게 저장 호출.

## Dispatch Wave 6 (Observability & Commerce Stability, 2026-03-02)
- Status: Completed
- Task IDs: BE-002, BE-003
- Scope:
  - [x] `src/lib/notion.ts`: Notion 로그 스키마 정합성 및 메타데이터 병합 보강.
  - [x] `src/app/api/inquiry/route.ts`: 문의 API에서 Notion 로깅 결과를 확인해 운영 경고 메시지 출력.
  - [x] `src/app/api/payment/initialize/route.ts`: 결제 초기화 구성값/결과 로그 추적 강화.
  - [x] `src/app/api/payment/verify/route.ts`: 결제 검증 금액 정합성 가드 및 Notion 로깅 강건화.
  - [x] `src/app/api/gift/send/route.ts`: 결과 링크 생성 Base URL 결측 처리.
  - [x] `src/lib/mail.ts`: 메일 발송 누락 설정 대응 및 API 실패 명시 처리.

## Dispatch Wave 7 (Payment Consistency & Auth Callback Idempotency, 2026-03-02)
- Status: Completed
- Task IDs: BE-007, BE-018
- Scope:
  - [x] `src/app/api/payment/verify/route.ts`: 지갑 반영 실패를 즉시 실패로 처리해 잔액 불일치 조기 감지.
  - [x] `src/app/api/auth/kakao/callback/route.ts`: 동일 OAuth code 재호출 중복 처리 방지 가드 추가.
  - [x] `src/app/api/payment/initialize/route.ts`: 결제 콜백 URL 누락 시 즉시 구성 오류 응답 및 모니터링 로깅 강화.
  - [x] `src/app/api/payment/verify/route.ts`: 지갑 조회 단계 DB 에러를 분리 로깅/실패 처리(PGRST116 제외).

## Dispatch Wave 8 (Transactional Email Triggering, 2026-03-02)
- Status: Completed
- Task IDs: BE-004
- Scope:
  - [x] `src/lib/mail.ts`: 결제 완료 영수증 메일 송신 핸들러 추가.
  - [x] `src/app/api/payment/verify/route.ts`: 결제 완료 시 영수증 메일 트리거 반영.

## Dispatch Wave 9 (Payment UX Stabilization, 2026-03-02)
- Status: Completed
- Task IDs: FE-022, FE-023
- Scope:
  - [x] `src/app/payment/fail/page.tsx`: 결제 실패 화면 텍스트 깨짐 이슈 정리 및 사용자 친화 메시지 정합화.
  - [x] `src/app/payment/success/page.tsx`: 결제 성공/검증 상태 문구 정합화(영문 기준) 유지 및 안내 UX 점검.

## Dispatch Wave 10 (MCP PKCE & Chart UX Stability, 2026-03-02)
- Status: Completed
- Task IDs: BE-029, FE-024
- Scope:
  - [x] `src/lib/auth-mcp.ts`, `src/app/api/auth/mcp/callback/route.ts`: PKCE 기반 Authorization Code 플로우, state/code_verifier 재사용 제약 및 중복 콜백 가드 점검.
  - [x] `src/components/charts/RadarChart.tsx`: 오행 라벨 인코딩 안정화 및 호버/탭 인터랙션을 `framer-motion`으로 보강.

## Dispatch Wave 11 (Texture & Interaction Refinement, 2026-03-02)
- Status: Completed
- Task IDs: FE-025, FE-026
- Scope:
  - [x] `src/components/dashboard/DestinyNetwork.tsx`, `src/app/encyclopedia/page.tsx`, `src/components/QuantumBackground.tsx`, `src/app/custom/partnership/page.tsx`, `src/app/login/page.tsx`: 외부 PNG 텍스처 배경(`stardust`, `dark-matter`)을 SVG data URI 패턴으로 교체해 정적 자산 의존 제거.
  - [x] `src/app/relationship/[id]/vs/page.tsx`: 공유 버튼에 `framer-motion` hover/tap 인터랙션 추가.

## Dispatch Wave 12 (Mock DB & MCP Identifier Hardening, 2026-03-02)
- Status: Completed
- Task IDs: BE-310, BE-311
- Scope:
  - [x] `src/lib/supabase.ts`: mock Supabase 체인을 `insert/upsert/update/delete/select/single/where/order/limit` 동작에 맞게 보강해 API 테스트/개발 동작을 위한 상태 기반 응답을 제공.
  - [x] `src/lib/auth-mcp.ts`: MCP 프로필 파싱에서 `provider_id/providerUserId/provider_user_id`를 추가 인식하도록 보강하고, `rawId` 후보 소스를 확장해 `providerUserId` 추출 신뢰성을 강화.

## Dispatch Wave 13 (MCP Profile ID Coverage Expansion, 2026-03-02)
- Status: Completed
- Task IDs: BE-312
- Scope:
  - [x] `src/lib/auth-mcp.ts`: `external_id`, `externalId`, `providerSubject`, `provider_subject`, `subject/profile.sub` 등 추가 ID 후보를 파싱해 id fallback 커버리지를 확대.

## Dispatch Wave 14 (MCP Identifier Robustness, 2026-03-02)
- Status: Completed
- Task IDs: BE-313
- Scope:
  - [x] `src/lib/auth-mcp.ts`: `external_user_id`, `externalUserId` 등 추가 ID 스키마를 반영해 OIDC/Kakao 호환 토큰 클레임에도 대응.

## Dispatch Wave 15 (MCP Callback Identifier Fallback, 2026-03-02)
- Status: Completed
- Task IDs: BE-314
- Scope:
  - [x] `src/app/api/auth/mcp/callback/route.ts`: `id_token` payload의 `sub`/`external_id`/`provider_id`를 폴백으로 사용해 `providerUserId` 누락 실패 가능성을 감소.

## Dispatch Wave 16 (MCP Profile Payload Compatibility, 2026-03-02)
- Status: Completed
- Task IDs: BE-315
- Scope:
  - [x] `src/lib/auth-mcp.ts`: `parseUserId`가 `data` 래핑 응답(`{ data: {...} }`)과 중첩된 클레임 구조를 재귀 파싱해 호환성을 확장.

## Dispatch Wave 17 (MCP UX & Callback Diagnostics, 2026-03-02)
- Status: Completed
- Task IDs: FE-331, BE-316, DO-109
- Scope:
  - [x] `src/components/AuthModal.tsx`: MCP/카카오/구글/네이버/이메일 로그인 버튼에 `type="button"` 및 접근성 라벨을 추가해 UI 상호작용 고도화.
  - [x] `src/app/api/auth/mcp/callback/route.ts`: OAuth 제공자 에러 코드(`error`, `error_description`)를 선제 수신해 `provider_error`로 라우팅하는 진단 분기 추가.
  - [x] `src/app/auth/callback/page.tsx`: `provider_error` 메시지 및 제공자 에러 상세 파라미터 노출 지원으로 트러블슈팅 가시성 강화.

## Dispatch Wave 18 (Kakao Error Channel Alignment, 2026-03-02)
- Status: Completed
- Task IDs: BE-317, FE-332, DO-110
- Scope:
  - [x] `src/app/api/auth/kakao/callback/route.ts`: OAuth 에러/누락 코드/중복 콜백/설정 누락/로그인 실패를 `/auth/callback` 진단 흐름으로 정합.
  - [x] `src/app/auth/callback/page.tsx`: `kakao_not_configured`, `login_failed`, `no_code` 코드 메시지맵 및 공통 상세 사유 표시 정비.

## Dispatch Wave 19 (Parallel Callback Diagnostics Continuation, 2026-03-02)
- Status: Completed
- Task IDs: FE-333, FE-334, BE-318
- Source: `src/app/auth/callback/page.tsx`, `src/app/api/auth/kakao/callback/route.ts`
- Scope:
  - [x] `src/app/api/auth/kakao/callback/route.ts`: Kakao OAuth token/userinfo 단계에서 provider 에러·상세 설명을 `/auth/callback`에 정규 파라미터로 전달.
  - [x] `src/app/auth/callback/page.tsx`: 오류 코드 외 `provider_error`, `provider_error_description` 진단 문구를 보편 노출로 정리.
  - [x] `src/app/api/auth/kakao/callback/route.ts`: 인코딩 깨짐 기본값 문자열 정리 및 에러 분기에서 메시지 파라미터 일관 처리.

## Dispatch Wave 20 (Parallel Work Queue, 2026-03-02)
- Status: Completed
- Source: 전 항목 공통 (코드/문서)

### FE-TEAM (UI/UX) - 20개 병렬 항목
- [x] FE-401: `src/app/login/page.tsx` 로그인 CTA 접근성 라벨 및 포커스 인덱스 재확인.
  - [x] FE-402: `src/app/auth/callback/page.tsx` 에러 상태 시 홈 버튼에 `aria-label` 추가.
- [x] FE-403: `src/app/auth/callback/page.tsx` `provider_error_description` 길이 길 때 토글형 축약/펼침.
- [x] FE-404: `src/components/AuthModal.tsx` 버튼별 `loading` 상태 스타일 분기 강화.
- [x] FE-405: `src/components/AuthModal.tsx` 버튼 disabled 상태 문구 지역화 보강.
  - [x] FE-406: `src/app/mypage/page.tsx` 로그인 제공자 배지 렌더 fallback 텍스트 통일.
- [x] FE-407: `src/app/dashboard/page.tsx` 주요 KPI 카드 반응형 간격 정렬.
  - [x] FE-408: `src/app/payment/fail/page.tsx` 재시도 버튼 터치 타겟 최소 44x44 보강.
  - [x] FE-409: `src/app/payment/success/page.tsx` 토스트 메시지 접근성 역할 추가.
- [x] FE-410: `src/app/relationship/[id]/vs/page.tsx` 공유 버튼 키보드 접근성(Enter/Space) 보강.
  - [x] FE-411: `src/components/charts/RadarChart.tsx` 터치 해상도에서 포인터 이벤트 최적화.
- [x] FE-412: `src/components/dashboard/DestinyNetwork.tsx` 툴팁 노출 애니메이션 안정화.
- [x] FE-413: `src/app/custom/partnership/page.tsx` 배경 SVG 성능 lazy-load 전략. (2026-03-02)
- [x] FE-414: `src/app/tarot/page.tsx` 모바일 뷰 버튼 라벨 자동 개행 처리. (2026-03-02)
- [x] FE-415: `src/app/encyclopedia/page.tsx` 카드 리스트 스켈레톤 상태 추가.
- [x] FE-416: `src/app/my-saju/add/page.tsx` 로딩/에러 빈 상태 메시지 별도 컴포넌트.
  - [x] FE-417: `src/components/Nav.tsx` 다크/라이트 토글 버튼 상태 표시 강화.
  - [x] FE-418: `src/components/Footer.tsx` 링크 접근성 대비명도 검사 반영.
  - [x] FE-419: `src/app/payment/success/page.tsx` 결제 코드가 유실될 때 CTA 안내 문구 추가.
  - [x] FE-420: `src/app/payment/fail/page.tsx` `fallback` 링크를 홈/충전 두 갈래로 구분.

### BE-TEAM (Backend) - 20개 병렬 항목
- [x] BE-401: `src/app/api/auth/mcp/callback/route.ts` `redirectWithError`에서 `request_id` 필수성 강화.
  - [x] BE-402: `src/app/api/auth/kakao/callback/route.ts` `tokenData.error`/`access_token` 동시 대응 로깅 개선.
- [x] BE-403: `src/app/api/auth/kakao/callback/route.ts` `processedCodeSet` 누수 방지 cleanup 헬퍼 통합.
- [x] BE-404: `src/app/api/auth/kakao/callback/route.ts` 사용자 조회 실패 시 provider_error 코드 분리.
- [x] BE-405: `src/app/api/auth/mcp/callback/route.ts` 유효하지 않은 PKCE 값 즉시 감사 로그 추가.
- [x] BE-406: `src/lib/auth-mcp.ts` providerUserId 파싱 규칙 문서형 주석 보강.
- [x] BE-407: `src/lib/supabase.ts` mock 체인에서 중복 insert/업서트 에지 케이스 추가.
- [x] BE-408: `src/app/api/payment/verify/route.ts` 지갑 잔액 정합성 경고 카운터 노출. (2026-03-02)
- [x] BE-409: `src/app/api/payment/initialize/route.ts` 결제 키 누락 시 `errorCode` 표준화. (2026-03-02)
- [x] BE-410: `src/app/api/payment/verify/route.ts` 동일 주문번호 재검증 idempotency 로그 강화. (2026-03-02)
- [x] BE-411: `src/app/api/inquiry/route.ts` Notion payload 실패 타입 별도 재시도 지표. (2026-03-02)
- [x] BE-412: `src/lib/mail.ts` mock/실서비스 모드 응답 스키마 분기. (2026-03-02)
- [x] BE-413: `src/lib/notion.ts` schema 정합성 에러 필드 매핑 강화.
- [x] BE-414: `src/lib/kakao-auth.ts` 로그아웃 쿠키 정리 동기화 보강. (2026-03-02)
- [x] BE-415: `src/lib/analytics.ts` 이벤트 중복 방지 가드. (2026-03-02)
- [x] BE-416: `src/app/api/gift/send/route.ts` 리다이렉트 URL 인코딩 통일. (2026-03-02)
- [x] BE-417: `src/app/api/ai/personalize/route.ts` 캐시 키 충돌 케이스 회피. (2026-03-02)
- [x] BE-418: `src/app/api/auth/kakao/callback/route.ts` welcome email 실패시 재시도 플래그. (2026-03-02)
- [x] BE-419: `src/app/api/auth/mcp/callback/route.ts` `profile` fallback 체인 unit-testable 분리. (2026-03-02)
- [x] BE-420: `src/app/api/auth/mcp/callback/route.ts` `storage` 쿠키 삭제 시점 일원화. (2026-03-02)

### DO-TEAM (Delivery/QA/Operations) - 20개 병렬 항목
- [x] DO-401: `docs/USER_VERIFICATION.md` 핵심 E2E 항목 최종 판독 버전 최신화.
- [x] DO-402: `docs/01-team/qa/test-scenarios.md` 항목별 PASS 기준 수치 정리.
- [x] DO-403: `docs/01-team/engineering/onboarding.md` 신규 작업자 검증 체크 최신화.
- [x] DO-404: `docs/guides/deployment.md` 장애 기록 템플릿에 Wave 번호 자동화 표기.
- [x] DO-405: `docs/README_TEAM.md` 역할/책임 표 재정렬.
- [x] DO-406: `docs/active-dispatch.md` Wave 진행 현황 자동 업데이트 룰 정리.
- [x] DO-407: `docs/TEAM_SPEC_디자이너.md` 모바일 반응형 핵심 체크리스트 반영. (2026-03-02)
- [x] DO-408: `docs/TEAM_SPEC_콘텐츠.md` 콘텐츠 배포 우선순위 20개 항목 정렬. (2026-03-02)
- [x] DO-409: `docs/operations/cs-guide.md` 신규 에러 코드별 대응표 업데이트. (2026-03-02)
- [x] DO-410: `docs/01-team/cs/provider_error_mapping.md` 하위 대응 매뉴얼에서 provider_error 매핑 추가. (2026-03-02)
- [x] DO-411: `docs/01-team/qa/test-scenarios.md` 결제/로그인 smoke 케이스 우선순위 재배치. (2026-03-02)
- [x] DO-412: `docs/development/guidelines.md` 환경변수 점검 항목 정합성 점검표 보완. (2026-03-02)
- [x] DO-413: `docs/00-overview/roadmap.md` Beta launch 체크리스트 현황 반영. (2026-03-02)
- [x] DO-414: `docs/00-overview/mcp-rollback-checklist.md` 운영자 연락망 정합성 업데이트. (2026-03-02)
- [x] DO-415: `docs/ARCHITECTURE.md` (해당 경로 존재 시) 인증 흐름 다이어그램 재검증. (2026-03-02)
- [x] DO-416: `docs/ERROR_CATALOG.md` provider_error 신규 코드 설명추가. (2026-03-02)
- [x] DO-417: `docs/guides/integrations.md` 카카오/MCP 동작별 에러 대응 추가. (2026-03-02)
- [x] DO-418: `docs/GITHUB_ISSUES.md` Wave 20 체크리스트 연동. (2026-03-02)
- [x] DO-419: `docs/active-dispatch.md` 완료 시 `[x]` 변환 규칙 가시성 강화. (2026-03-02)
- [x] DO-420: `docs/ARCHIVE/readme.md` 문서군 아카이브 상태 마킹 및 중복 항목 정리 규칙 반영. (2026-03-02)



## Wave 완료 규칙 가시성

- Wave 완료 후 `[x]` 전환 시 완료일/수행자/파일 경로를 항목 뒤에 표기

## Dispatch Wave 21 (Post-Wave 20 다음 진행)
- Status: In Progress
- 운영 원칙: "화면/기능 고도화 + 운영 안정성" 2개 라인을 병렬로 진행, 장애 가능도 높은 백엔드/결제 항목은 선가중치.

### FE-TEAM (UI/UX) - 20개 병렬 항목
- [x] FE-421: `src/app/(main)/page.tsx` 레이아웃 여백과 CTA 우선순위 재정렬(375/390/768 기준).
- [x] FE-422: `src/app/payment/loading/page.tsx` 결제 대기/타임아웃 UI에 단계별 상태 텍스트 반영.
- [x] FE-423: `src/app/payment/fail/page.tsx` 3개 실패 유형별 CTA 분기 버튼 라벨 고정. (2026-03-02, FE)
- [x] FE-424: `src/app/payment/success/page.tsx` 파라미터 누락 안내 UI 추가 및 홈 복귀 플로우 보강. (2026-03-02, FE)
- [x] FE-425: `src/components/AuthModal.tsx` 접근성 라벨/포커스 이동 체인 통합 점검. (2026-03-02, FE)
- [x] FE-426: `src/app/auth/callback/page.tsx` provider_error 긴 문구 토글 컴포넌트 및 복사 기능 추가.
- [x] FE-427: `src/app/dashboard/page.tsx` KPI 카드 최소 터치영역(44x44) 통일. (2026-03-02, FE)
- [x] FE-428: `src/components/Nav.tsx` 테마 토글 상태 영속성과 툴팁 일치성 정합. (2026-03-02, FE)
- [x] FE-429: `src/components/QuantumBackground.tsx` 낮은 성능 기기용 대체 렌더 모드 적용.
- [x] FE-430: `src/app/relationship/[id]/vs/page.tsx` 공유 버튼 키보드(Enter/Space) 및 ESC 닫기 처리.
- [x] FE-431: `src/components/charts/RadarChart.tsx` 터치 포인터 과도 이벤트 디바운스.
- [x] FE-432: `src/app/encyclopedia/page.tsx` 카드 이미지 lazy-load 및 fallback 렌더.
- [x] FE-433: `src/app/my-saju/add/page.tsx` 빈 상태/로딩/에러 상태 컴포넌트 분리.
- [x] FE-434: `src/app/custom/partnership/page.tsx` 배경 로드 지연 전략 토글 및 폴백.
- [x] FE-435: `src/app/tarot/page.tsx` 모바일 하단 버튼 라인 고정과 개행 규칙 정리.
- [x] FE-436: `src/app/mypage/page.tsx` 제공자 배지/텍스트 정렬 기준 재정의.
- [x] FE-437: `src/app/login/page.tsx` 소셜 로그인 연속 클릭 방지 및 버튼 상태 동기화. (2026-03-02, FE)
- [x] FE-438: `src/app/error.tsx` 글로벌 에러 복구 CTA(재시도/고객센터) 분기 추가. (2026-03-02, FE)
- [x] FE-439: `src/components/Footer.tsx` 링크 대비명도 지표 자동 점검용 속성 추가. (2026-03-02, FE)
- [x] FE-440: `src/app/payment/success/page.tsx` 2중 라우팅(성공/검증중) 상태 텍스트 정합.

### BE-TEAM (Backend) - 20개 병렬 항목
- [x] BE-421: `src/app/api/payment/initialize/route.ts` 주문 생성 실패 원인별 `error_code` 분기 강화.
- [x] BE-422: `src/app/api/payment/verify/route.ts` idempotency 상한 초과 경고 알람 포인트 추가. (2026-03-02, BE)
- [x] BE-423: `src/app/api/inquiry/route.ts` Notion 실패 재시도 정책 지표(재시도 횟수/지연) 반영. (2026-03-02, BE)
- [x] BE-424: `src/lib/notion.ts` 실패 매핑(404/401/5xx) 키 정합성 명세 강화.
- [x] BE-425: `src/lib/mail.ts` 실패 재시도 플래그 TTL 정책 수립(브라우저/세션 정합성).
- [x] BE-426: `src/lib/analytics.ts` 중복 이벤트 감지 시간 창을 환경설정 값으로 이동.
- [x] BE-427: `src/app/api/auth/kakao/callback/route.ts` 환영 이메일 실패 플래그 정리 및 재시도 UX 연동.
- [x] BE-428: `src/app/api/auth/mcp/callback/route.ts` state/code_verifier 재사용 탐지 로그 고도화.
- [x] BE-429: `src/lib/supabase.ts` mock 체인에 제한 업서트/에러 지연 케이스 추가.
- [x] BE-430: `src/lib/auth-mcp.ts` providerUserId 파싱 후보 및 타입 정리 문서화.
- [x] BE-431: `src/app/api/payment/verify/route.ts` 지갑 업데이트 후 잔액 오차 경고 임계치 정의. (2026-03-02, BE)
- [x] BE-432: `src/lib/kakao-auth.ts` 쿠키 제거 범위(도메인/경로) 일괄 클리어 확인.
- [x] BE-433: `src/app/api/gift/send/route.ts` 링크 토큰 만료 정책 문서화.
- [x] BE-434: `src/app/api/ai/personalize/route.ts` 캐시 키 정규화 규칙을 공통 유틸로 이전.
- [x] BE-435: 결제/로그인 주요 에러코드의 `error_code` 응답 스키마 문서 테스트.
- [x] BE-436: `src/app/api/auth/mcp/callback/route.ts` 사용자 정보 부재 fallback 분기 강화.
- [x] BE-437: `src/app/api/payment/initialize/route.ts` allowlist URL 검증 로직 추가. (2026-03-02, BE)
- [x] BE-438: `src/app/api/payment/verify/route.ts` 실패 거래 추적 카운터와 운영 경보 정책 정리.
- [x] BE-439: `src/app/api/payment/verify/route.ts` 결제 성공률 모니터링 지표용 이벤트 태그 추가. (2026-03-02, BE)
- [x] BE-440: `src/lib/mail.ts` 실제/모의 모드 응답 스키마 자동 비교 검사 가이드.

### DO-TEAM (Delivery/QA/Operations) - 20개 병렬 항목
- [x] DO-421: `docs/01-team/qa/test-scenarios.md` 브라우저 호환성 섹션 체크포인트 정리. (2026-03-02, DO)
- [x] DO-422: `docs/01-team/qa/test-scenarios.md` 배포 전/후 체크리스트를 완료 기준 기반으로 재배치. (2026-03-02, DO)
- [x] DO-423: `docs/operations/cs-guide.md` 장애 대응 순번표(1차/2차/3차) 보강. (2026-03-02, DO)
- [x] DO-424: `docs/operations/cs-guide.md` provider_error별 기본 대응 플로우 추가. (2026-03-02, DO)
- [x] DO-425: `docs/ERROR_CATALOG.md` 에러 코드와 대응 스크립트 링크 정합.
- [x] DO-426: `docs/guides/deployment.md` 릴리스 승인 단계별 체크 항목 갱신.
- [x] DO-427: `docs/README_TEAM.md` 인수인계 템플릿 및 역할표 최신화.
- [x] DO-428: `docs/GITHUB_ISSUES.md` Wave 21 태스크 발행 규칙(20개 단위 묶음) 적용.
- [x] DO-429: `docs/ARCHITECTURE.md` 인증/결제 흐름 최신 운영 플로우 업데이트.
- [x] DO-430: `docs/01-team/engineering/onboarding.md` 파이프라인 시작 체크리스트 추가.
- [x] DO-431: `docs/ARCHIVE/readme.md` 아카이브 중복 문서 정리 규칙 수립.
- [x] DO-432: `docs/00-overview/roadmap.md` 인수(인증/결제/운영) 연동 항목 마일스톤 추가.
- [x] DO-433: `docs/development/guidelines.md` 환경변수·시크릿 키 점검 항목 표준 양식 반영.
- [x] DO-434: `docs/01-team/qa/test-scenarios.md` 성능/접근성 KPI(목표치) 라벨화.
- [x] DO-435: `docs/active-dispatch.md` Wave 20 종료 로그 및 Wave 21 시작 로그 양식 통일.
- [x] DO-436: `docs/operations` 폴더 내 장애 기록 템플릿 샘플 3종(결제/로그인/인증) 생성.
- [x] DO-437: `docs/TEAM_SPEC_디자이너.md` 고도화 UI 규범: 터치 타겟/텍스트 계층 기준 추가.
- [x] DO-438: `docs/TEAM_SPEC_콘텐츠.md` 콘텐츠 배포 우선순위 20개에 운영 메트릭 태그 부여.
- [x] DO-439: `docs/operations` 문서의 링크 건전성(404/이중 링크) 월간 점검표 도입.
- [x] DO-440: 24시간/72시간 운영 리뷰 노트 템플릿 생성 및 템플릿 링크 공개.

### 공통 진행 규칙
- 팀별로 20개를 나눠 받되, 각 5개 단위로 1차 동기화 후 다음 5개 진입.
- 핵심 API/결제 항목은 FE/DO와 동시 병렬이지만, 장애 리스크 항목은 BE 우선 반영 후 FE 반영.


## Wave Log Format
- Wave-XX | YYYY-MM-DD | Owner | Summary
- Use same format for close/open entries across waves
