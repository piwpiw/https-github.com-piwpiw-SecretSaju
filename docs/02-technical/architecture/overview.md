# Architecture Overview - Secret Saju (압축 요약)

## 핵심 원칙
- **Serverless-First**: Vercel 자동 스케일링, 서버 관리 없음
- **Separation of Concerns**: UI → API/Core Engine → Supabase
- **Type-Safe End-to-End**: TypeScript 풀스택

## 레이어 구조

```
Client (React/Next.js)
  ↓ API Routes (Serverless)
  ↓ Core Engine (Pure TypeScript)
  ↓ Supabase (PostgreSQL + RLS)
     + Kakao OAuth / Toss Payments / Vercel Analytics
```

## 주요 API 엔드포인트

```
/api/saju/calculate   POST  사주 계산
/api/saju/create      POST  프로필 저장
/api/saju/list        GET   프로필 목록
/api/saju/delete      DELETE 프로필 삭제
/api/auth/kakao/login GET   OAuth 시작
/api/auth/kakao/callback GET OAuth 콜백
/api/payment/verify   POST  결제 검증
/api/wallet/balance   GET   젤리 잔액
/api/wallet/history   GET   거래 내역
/api/persona          POST  AI 서사 생성
```

## Core Engine 구조 (`src/core/`)

```
api/
  saju-engine.ts       # 메인 계산 오케스트레이터
  saju-canonical.ts    # Canonical feature + evidence
  saju-lineage.ts      # 학파 프로필
astronomy/
  true-solar-time.ts   # 진태양시
  timezone.ts          # 역사적 한국 UTC 오프셋
calendar/
  ganji.ts             # 60갑자
  lunar-solar.ts       # 음양력 변환 (Intl 기반)
  yajasi.ts            # 야자시 처리
myeongni/
  elements.ts / sipsong.ts / sinsal.ts
  gyeokguk.ts / yongshin.ts / daewun.ts / interactions.ts
```

## DB 핵심 테이블

```
users            카카오 OAuth 사용자
saju_profiles    저장된 사주 프로필 (birthdate, gender, calendar_type)
jelly_wallets    젤리 크레딧 잔액
jelly_transactions 거래 내역 (purchase/consume/gift)
unlocks          기능 해금 기록
inquiries        CS 문의
```

RLS 정책: 사용자는 자신의 데이터만 접근 가능 (`auth.uid() = user_id`)

## 보안 레이어
1. HTTPS Only (TLS 1.3)
2. HTTP-Only Cookies (XSS 방지)
3. SameSite Cookies (CSRF 방지)
4. Supabase RLS (DB 레벨 접근 제어)
5. Zod 입력 검증
6. Rate Limiting (Vercel Edge, 예정)

## 배포
- **Production**: `main` branch → secretsaju.com
- **Preview**: PR마다 자동 생성 URL
- CI: TypeScript + ESLint + vitest + Next.js build

Last Updated: 2026-03-08
