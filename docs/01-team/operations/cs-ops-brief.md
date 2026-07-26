# CS Guide - 에러 대응 표

## 결제/로그인 에러 대응

- `PAYMENT_*`: 결제 API 에러는 주문번호/금액/상태를 함께 확인하고, 동일 주문 중복 검증은 로그의 `idempotent_attempt_count` 기준으로 처리합니다.
- `provider_error`: OAuth 연동 실패 시 `error`/`error_description`을 사용자에게 표시하고 24시간 이내 이슈 발생률을 집계합니다.

## 장애 대응 우선순위 순번표(1차/2차/3차)

- 1차: 사용자 영향도 높은 장애(로그인/결제) 발생 시 즉시 알림 전파
  - 지표: 결제 검증 실패율 급증, 인증 콜백 실패, 전역 500 급등
- 2차: API 타임아웃/재시도 실패, 메일 실패(Receipt/Welcome) 알림 누락
- 3차: 콘텐츠/문구/접근성 누락, UI 정합성 이슈

## provider_error 기본 대응 플로우

1. `provider_error`가 감지되면 `code`, `error_description`, 원인 URL 파라미터를 로그 보존
2. 동일 사용자 동시 재시도 시 토큰/상태 캐시를 기준으로 중복 진입 차단
3. 에러 유형별 대응 담당자 지정(결제/인증/운영) 후 15분 이내 1차 원인 분류
4. 재발 조건이면 72시간 롤백 기준 체크 후 알림 채널 강화

## Ops Templates
- Payment incident: `docs/01-team/operations/incident-payment-template.md`
- Login incident: `docs/01-team/operations/incident-login-template.md`
- Auth provider incident: `docs/01-team/operations/incident-auth-template.md`
- 24h review: `docs/01-team/operations/review-24h.md`
- 72h review: `docs/01-team/operations/review-72h.md`
- Monthly link health: `docs/01-team/operations/link-health-checklist.md`
