# MCP Rollback Checklist

## 즉시 수행 항목

- `.env`에서 MCP 변수 임시 비활성화
  - `NEXT_PUBLIC_USE_MOCK_DATA=true`로 전환
  - 또는 `NEXT_PUBLIC_MCP_CLIENT_ID`, `NEXT_PUBLIC_MCP_AUTH_URL`, `NEXT_PUBLIC_MCP_TOKEN_URL`, `NEXT_PUBLIC_MCP_REDIRECT_URI` 제거
- 기존 로그인 동선 복구
  - `MCP` 버튼 비활성화 또는 숨김 처리
  - 카카오/기본 OAuth만 이용 가능한지 확인

## DB 롤백 (필요 시)

- `users.mcp_user_id` 컬럼과 MCP 토큰 컬럼은 즉시 삭제할 수 없으므로, 비운영 전환 기준으로 비운영 키만 무효화
- `mcp_access_token`, `mcp_refresh_token`, `auth_provider`, `mcp_user_id`, `last_login_at`는 유지 후 무효화 우선
- `jelly_wallets` 기본 구조는 유지

## 세션 및 쿠키 정리

- MCP 관련 쿠키 삭제
  - `mcp_access_token`
  - `mcp_refresh_token`
  - `mcp_oauth_state`
  - `mcp_code_verifier`
- 사용자 쿠키(`user_data`) 초기화 후 재로그인 유도

## 트래픽 전환

- 오류율 알림 임계치 초과 시 `/api/auth/mcp/callback` 호출을 모니터링 제외 처리
- `/auth/callback?error=` 접속 비율 추적
  - 주요 추적 에러명(코드 기준, 2026-07 재확인): 최상위 `error=`는 `provider_error`, `oauth_callback_error`, `invalid_oauth_state`, `token_exchange_failed`, `missing_oauth_profile`, `missing_provider_user_id` 중 하나로 발생하며, 세부 원인은 `provider_error=` 파라미터(`missing_required_params`, `invalid_pkce_code_verifier`, `duplicate_state`, `duplicate_code_verifier` 등)로 구분됨(`src/app/api/auth/mcp/callback/route.ts`)
  - 참고: `expired_oauth_state`/`missing_oauth_artifacts`는 메시지 맵에 상수로 정의되어 있으나, 현재 콜백 로직은 상태 만료/아티팩트 부재 시 `oauth_callback_error`(`missing_required_params`)로 처리하며 이 두 코드를 최상위 `error` 값으로 직접 발생시키지 않음
- 임시 안내 문구: 로그인 실패 시 기본 로그인/문의 경로로 유도

## 복구 확인

- 사용자 재로그인 성공률(1시간 단위) 확인
- `/dashboard` 접근 가능성 확인
- 기존 지갑/프로필 데이터 무결성 확인

## 재활성화 전 체크리스트

- MCP 엔드포인트/클라이언트 시크릿 점검
- `USERINFO_URL` 응답 스키마 재확인
- `mcp_state` 쿠키의 JSON 페이로드 파싱 정책(`{ value, issuedAt }`) 검열
- `mcp_state` 쿠키 max-age(10분) 만료 정책 정상 작동 여부 재확인 — 쿠키 만료/부재 시 `oauth_callback_error`(`missing_required_params`)로 처리됨. `issuedAt`은 쿠키 페이로드에 저장되지만 현재 코드는 이를 별도 TTL 비교/만료 코드 분기에 사용하지 않음(코드 기준 2026-07 재확인, `src/lib/auth/auth-mcp.ts`)
- `mcp_code_verifier` 쿠키 TTL 및 정합성 검증 확인
