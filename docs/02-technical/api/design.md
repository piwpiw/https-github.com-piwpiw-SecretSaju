# API Design

## 범위
API 레이어의 설계 의도, 인증 정책, 응답 계약, 에러 규칙을 한 곳에 정리한다.

## 설계 원칙
- RESTful 경로 + 명확한 실패 처리
- 인증 기반 엔드포인트 분리(공개/보호)
- PII 최소 수집, 응답에서 민감정보 비노출
- 동일 기능은 중복 엔드포인트 없이 재사용

## 핵심 레이어
- `src/app/api/saju/*` : 사주 계산, 조회, 프로필 처리
- `src/app/api/payment/*` : 결제 시작/검증/정산 연계
- `src/app/api/wallet/*` : 잔액, 히스토리, 소비

## 응답 / 에러 규칙
- 공통 응답: 성공/실패 플래그 + payload + message
- 에러는 상위 코드 체계로 집계(참조: ERROR_CATALOG)
- 결제/인증 실패는 사용자 친화 메시지 + 내부 추적코드 분리

## 운영 포인트
- API 계약 변경은 `api/README.md`와 `execution-backlog-ko.md` 연동
- 성능 저하 우려 구간은 서버 액션/캐시 정책으로 선제 점검

## 참조
- [API Reference](../api/README.md)
- [Error Handling Guide](../api/README.md#error-handling)
