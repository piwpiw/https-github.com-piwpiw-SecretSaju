# Security Architecture

## 보안 구성
- HTTPS/TLS 강제
- Kakao + Supabase 기반 인증
- 서버측 검증 우선(클라이언트 신뢰 최소화)
- RLS(Row Level Security)로 사용자별 데이터 경계

## 제어 항목
- 환경변수 노출 방지(개발/운영 분리)
- 결제/잔액/세션 액션에 재시도 및 rate-limit 적용
- 오류 메시지 내 내부 상세 코드 노출 최소화

## 운영 체크
- 정기 점검: 인증 만료, 권한 상승 시나리오, CSRF/세션 하이재킹 대응
- 감사: 주요 이벤트 로그(로그인, 결제, 민감 변경) 보존 정책
- 키 회전 정책: 외부 키는 주기 교체, 커밋시점 노출 점검

## 참조
- [Architecture Overview](./overview.md)
- [Tech Stack](../../00-overview/tech-stack.md#security)
