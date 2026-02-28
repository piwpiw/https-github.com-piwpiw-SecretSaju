# 🚀 배포 가이드

## 빠른 시작

### 1. Vercel 배포 (권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### 2. 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables에서 다음 변수들을 설정하세요:

#### 필수 환경 변수

```bash
# 애플리케이션
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Kakao OAuth
NEXT_PUBLIC_KAKAO_JS_KEY=your-kakao-js-key
KAKAO_REST_API_KEY=your-rest-api-key
KAKAO_CLIENT_SECRET=your-client-secret
KAKAO_REDIRECT_URI=https://your-domain.vercel.app/api/auth/kakao/callback

# Toss Payments (결제)
NEXT_PUBLIC_TOSS_CLIENT_KEY=your-toss-client-key
TOSS_SECRET_KEY=your-toss-secret-key
```

#### 선택적 환경 변수

```bash
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# 환경 설정
NODE_ENV=production
```

### 3. GitHub Actions 자동 배포 설정

1. **Vercel 토큰 생성**
   - Vercel Dashboard → Settings → Tokens
   - 새 토큰 생성 후 복사

2. **GitHub Secrets 설정**
   - Repository → Settings → Secrets and variables → Actions
   - 다음 Secrets 추가:
     - `VERCEL_TOKEN`: Vercel 토큰
     - `VERCEL_ORG_ID`: Vercel 조직 ID
     - `VERCEL_PROJECT_ID`: Vercel 프로젝트 ID

3. **자동 배포 활성화**
   - `main` 브랜치에 push하면 자동으로 프로덕션 배포
   - `dev` 브랜치에 push하면 스테이징 배포

### 4. Supabase 마이그레이션 실행

```bash
# Supabase CLI 설치
npm i -g supabase

# 로그인
supabase login

# 마이그레이션 실행
supabase db push
```

또는 Supabase Dashboard에서 직접 실행:
- SQL Editor → `supabase/migrations/001_initial_schema.sql` 실행
- SQL Editor → `supabase/migrations/002_add_orders_table.sql` 실행

### 5. Toss Payments 설정

1. **Toss Payments 가입**
   - https://www.tosspayments.com 접속
   - 사업자 등록 후 테스트/실제 키 발급

2. **환경 변수 설정**
   - 테스트: `test_ck_...` (테스트용)
   - 실제: `live_ck_...` (운영용)

3. **결제 승인 URL 설정**
   - 성공: `https://your-domain.vercel.app/payment/success`
   - 실패: `https://your-domain.vercel.app/payment/fail`

### 6. 카카오 로그인 설정

1. **카카오 개발자 콘솔**
   - https://developers.kakao.com 접속
   - 앱 생성 및 플랫폼 설정

2. **리다이렉트 URI 등록**
   - `https://your-domain.vercel.app/api/auth/kakao/callback`

3. **환경 변수 설정**
   - JavaScript 키, REST API 키, Client Secret 설정

## 배포 체크리스트

### 배포 전 확인사항

- [ ] 모든 환경 변수 설정 완료
- [ ] Supabase 마이그레이션 실행 완료
- [ ] Toss Payments 테스트 결제 성공
- [ ] 카카오 로그인 테스트 성공
- [ ] 빌드 에러 없음 (`npm run build`)
- [ ] 테스트 통과 (`npm test`)

### 배포 후 확인사항

- [ ] 메인 페이지 로드 확인
- [ ] 카카오 로그인 작동 확인
- [ ] 결제 플로우 테스트
- [ ] 젤리 충전/사용 테스트
- [ ] 사주 계산 기능 확인
- [ ] 에러 로그 모니터링

## 트러블슈팅

### 빌드 실패

```bash
# 로컬에서 빌드 테스트
npm run build

# 타입 체크
npx tsc --noEmit

# 린트 체크
npm run lint
```

### 환경 변수 누락

Vercel Dashboard에서 모든 환경 변수가 설정되었는지 확인하세요.

### 결제 오류

1. Toss Payments 키가 올바른지 확인
2. 결제 승인 URL이 정확한지 확인
3. 주문 테이블이 생성되었는지 확인

### 데이터베이스 오류

1. Supabase 연결 정보 확인
2. 마이그레이션 실행 여부 확인
3. RLS 정책 확인

## 모니터링

- **Vercel Analytics**: 성능 모니터링
- **Supabase Dashboard**: 데이터베이스 모니터링
- **Toss Payments Dashboard**: 결제 내역 확인

## 롤백

Vercel Dashboard → Deployments → 이전 배포 선택 → Promote to Production
