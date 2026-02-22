# 🚀 빠른 배포 가이드

## 원클릭 배포 (자동화)

### 1단계: 환경 변수 설정

```bash
# 대화형 환경 변수 설정
npm run setup:env
```

또는 `.env.local` 파일을 직접 생성:

```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_KAKAO_JS_KEY=your-kakao-js-key
KAKAO_REST_API_KEY=your-rest-api-key
KAKAO_CLIENT_SECRET=your-client-secret
KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback
NEXT_PUBLIC_TOSS_CLIENT_KEY=your-toss-client-key
TOSS_SECRET_KEY=your-toss-secret-key
```

### 2단계: 환경 변수 검증

```bash
npm run verify:env
```

### 3단계: 데이터베이스 마이그레이션

```bash
# 마이그레이션 가이드 확인
npm run migrate:db

# Supabase CLI 사용 (권장)
supabase db push

# 또는 Supabase Dashboard → SQL Editor에서 직접 실행
# - supabase/migrations/001_initial_schema.sql
# - supabase/migrations/002_add_orders_table.sql
```

### 4단계: 배포 전 검증

```bash
# 전체 검증 (빌드 + 테스트 포함)
npm run pre-deploy

# 빠른 검증 (빌드/테스트 건너뛰기)
npm run pre-deploy -- --skip-build --skip-tests
```

### 5단계: 배포

```bash
# 프로덕션 배포
npm run deploy

# 프리뷰 배포
npm run deploy:preview
```

## Vercel 자동 배포 설정

### GitHub 연동

1. **Vercel 프로젝트 생성**
   ```bash
   vercel
   ```

2. **GitHub Repository 연결**
   - Vercel Dashboard → Settings → Git
   - GitHub Repository 연결

3. **환경 변수 설정**
   - Vercel Dashboard → Settings → Environment Variables
   - `.env.local`의 모든 변수 추가

4. **자동 배포 활성화**
   - `main` 브랜치 push 시 자동 배포
   - GitHub Actions도 자동 실행

### GitHub Secrets 설정 (선택적)

GitHub Actions 자동 배포를 위해:

1. **Vercel 토큰 생성**
   - Vercel Dashboard → Settings → Tokens
   - 새 토큰 생성

2. **GitHub Secrets 추가**
   - Repository → Settings → Secrets and variables → Actions
   - `VERCEL_TOKEN`: Vercel 토큰
   - `VERCEL_ORG_ID`: Vercel 조직 ID
   - `VERCEL_PROJECT_ID`: Vercel 프로젝트 ID

## 배포 체크리스트

### 배포 전

- [ ] 환경 변수 설정 완료 (`npm run verify:env`)
- [ ] 데이터베이스 마이그레이션 실행 완료
- [ ] 로컬 빌드 성공 (`npm run build`)
- [ ] 테스트 통과 (`npm test`)
- [ ] 배포 전 검증 통과 (`npm run pre-deploy`)

### 배포 후

- [ ] 메인 페이지 로드 확인
- [ ] 카카오 로그인 작동 확인
- [ ] 결제 플로우 테스트
- [ ] 젤리 충전/사용 테스트
- [ ] 사주 계산 기능 확인

## 트러블슈팅

### 빌드 실패

```bash
# 타입 체크
npx tsc --noEmit

# 린트 체크
npm run lint

# 빌드 테스트
npm run build
```

### 환경 변수 오류

```bash
# 환경 변수 검증
npm run verify:env

# 환경 변수 재설정
npm run setup:env
```

### 데이터베이스 오류

```bash
# 마이그레이션 상태 확인
npm run migrate:db

# Supabase 연결 확인
# Supabase Dashboard → Settings → API
```

## 빠른 참조

```bash
# 전체 배포 프로세스 (한 번에)
npm run setup:env      # 1. 환경 변수 설정
npm run verify:env     # 2. 검증
npm run migrate:db     # 3. 마이그레이션 가이드
npm run pre-deploy     # 4. 배포 전 검증
npm run deploy         # 5. 배포
```

## 지원

문제가 발생하면:
1. `DEPLOYMENT.md` 상세 가이드 참고
2. Vercel 로그 확인
3. Supabase 로그 확인
