# Database Schema

## 핵심 엔티티
- `users`
- `saju_profiles`
- `jelly_wallets`
- `jelly_transactions`
- `unlocks`
- `inquiries`
- `admin_events`

## 관계 개요
- `users` 1:N `saju_profiles`
- `users` 1:1 `jelly_wallets`
- `saju_profiles` 1:N `unlocks`
- `users` 1:N `jelly_transactions`
- `users` 1:N `inquiries`

## 운영 규칙
- RLS 기반 사용자별 데이터 분리 강제
- 결제/잔액 변경은 서버 라우트에서만 허용
- 민감필드(PII)는 최소화 및 접근 로그 추적

## 점검 포인트
- 잔액 트랜잭션 무결성(이중 소비 방지)
- 프로필 삭제/복원 정책 일관성
- 감사 로그 저장 규칙

## 참조
- [Architecture Overview](./overview.md)
