# CS 대응 매뉴얼 - Provider Error 매핑

## 공통 provider_error 매핑

- `invalid_code`: 인가 코드 무효/만료
- `token_exchange_failed`: 토큰 교환 실패
- `kakao_userinfo_failed`: 사용자 정보 조회 실패
- `kakao_user_sync_failed`: Supabase 사용자 동기화 실패
- `user_lookup_failed`: 기존 사용자 조회 실패
- `missing_provider_user_id`: provider ID 추출 실패
- `oauth_callback_error`: OAuth 일반 오류
- `provider_error`: 상위 공급자 전달 오류

위 항목은 `/auth/callback` 쿼리 파라미터 기준으로 원인 분류하고, `provider_error_description`을 함께 확인합니다.
