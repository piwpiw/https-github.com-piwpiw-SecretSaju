# Supabase 설정 가이드

## 1. Supabase 프로젝트 확인

프로젝트 URL: https://supabase.com/dashboard/project/jyrdihklwkbeypfxbiwp

## 2. 환경 변수 가져오기

1. Supabase Dashboard → Settings → API
2. 다음 값들을 복사:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret**: `SUPABASE_SERVICE_ROLE_KEY`

## 3. 마이그레이션 실행

### 방법 1: Supabase Dashboard (권장 - 무료)

1. Supabase Dashboard → SQL Editor
2. 다음 파일들을 순서대로 실행:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_add_orders_table.sql`

### 방법 2: Supabase CLI

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref jyrdihklwkbeypfxbiwp

# 마이그레이션 실행
supabase db push
```

## 4. 무료 플랜 최적화 설정

### Row Level Security (RLS) 활성화 확인
- 모든 테이블에 RLS가 활성화되어 있는지 확인
- `supabase/schema.sql`에 RLS 정책이 포함되어 있음

### 데이터베이스 인덱스 확인
- 인덱스가 제대로 생성되었는지 확인
- 쿼리 성능 최적화로 API 호출 감소

### 연결 풀 설정 (과금 절감)
- Supabase Dashboard → Settings → Database
- Connection Pooling 활성화
- Transaction 모드 사용 (무료 플랜 최적화)

## 5. API Rate Limiting 설정

Supabase Dashboard → Settings → API:
- Rate Limiting 활성화
- 무료 플랜: 500 requests/second

## 6. 환경 변수 설정

로컬 개발:
```bash
# .env.local 파일에 추가
NEXT_PUBLIC_SUPABASE_URL=https://jyrdihklwkbeypfxbiwp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Vercel 배포:
- Vercel Dashboard → Settings → Environment Variables
- 위의 3개 변수 추가

## 7. 테스트

```bash
# 환경 변수 검증
npm run verify:env

# 로컬에서 테스트
npm run dev
```

## 무료 플랜 제한사항

- **Database**: 500MB 저장공간
- **API Requests**: 500 requests/second
- **Bandwidth**: 5GB/month
- **Edge Functions**: 2M invocations/month

## 과금 절감 팁

1. **캐싱 활용**: API 응답 캐싱으로 요청 수 감소
2. **인덱스 최적화**: 쿼리 성능 향상으로 처리 시간 감소
3. **Connection Pooling**: 연결 재사용으로 리소스 절약
4. **RLS 정책 최적화**: 불필요한 쿼리 방지
