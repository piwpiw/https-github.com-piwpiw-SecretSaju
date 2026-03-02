# Kakao Login Integration

## 목적
Kakao OAuth 로그인 후 세션 연동 및 접근 제어를 안정적으로 처리한다.

## Flow
1. 클라이언트에서 로그인 시작
2. 인가 코드 수신 후 백엔드 교차검증
3. Supabase 세션 발급
4. API 인증 토큰/쿠키로 보호된 API 접근 가능

## 환경변수
- `NEXT_PUBLIC_KAKAO_JS_KEY`
- `KAKAO_REST_API_KEY`
- `KAKAO_CLIENT_SECRET`

## 품질 포인트
- Redirect URI 정확성(운영/개발 분리)
- 세션 만료/재발급 동작
- 로그인 실패 시 재시도 가이드 제공

## 참조
- [API Reference](../api/README.md)
- [Security Guide](../architecture/overview.md#security-architecture)
