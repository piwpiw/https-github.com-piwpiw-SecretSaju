# 🚀 지금 바로 배포하기

## 완전 자동화 설정 (권장)

```bash
# 한 번에 모든 설정
npm run setup:complete
```

## 단계별 설정

### 1️⃣ GitHub 저장소 연결

```bash
# GitHub 저장소 URL 설정
git remote add origin https://github.com/piwpiw/SecretSaju.git

# 또는 대화형 설정
npm run setup:github
```

**GitHub 저장소**: https://github.com/piwpiw?tab=repositories

### 2️⃣ Supabase 마이그레이션

**Supabase 프로젝트**: https://supabase.com/dashboard/project/jyrdihklwkbeypfxbiwp

#### 방법 1: Supabase Dashboard (가장 쉬움)

1. 위 링크로 Supabase Dashboard 접속
2. 왼쪽 메뉴 → **SQL Editor** 클릭
3. 다음 파일들을 순서대로 실행:
   - `supabase/migrations/001_initial_schema.sql` 복사 → 붙여넣기 → Run
   - `supabase/migrations/002_add_orders_table.sql` 복사 → 붙여넣기 → Run

#### 방법 2: Supabase CLI

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

### 3️⃣ 환경 변수 설정

#### Supabase 환경 변수 가져오기

1. Supabase Dashboard → **Settings** → **API**
2. 다음 값들을 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

#### 환경 변수 설정

```bash
# 대화형 설정
npm run setup:env

# 또는 .env.local 파일 직접 생성
```

`.env.local` 파일 예시:
```bash
# 애플리케이션
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (Supabase Dashboard에서 가져오기)
NEXT_PUBLIC_SUPABASE_URL=https://jyrdihklwkbeypfxbiwp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Kakao OAuth (카카오 개발자 콘솔에서 발급)
NEXT_PUBLIC_KAKAO_JS_KEY=your-kakao-js-key
KAKAO_REST_API_KEY=your-rest-api-key
KAKAO_CLIENT_SECRET=your-client-secret
KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback

# Toss Payments (토스페이먼츠에서 발급)
NEXT_PUBLIC_TOSS_CLIENT_KEY=your-toss-client-key
TOSS_SECRET_KEY=your-toss-secret-key
```

### 4️⃣ Vercel 프로젝트 생성

**Vercel 프로젝트**: https://vercel.com/piwpiw99-5213s-projects/~/settings

#### 방법 1: Vercel CLI (권장)

```bash
# Vercel CLI 설치 (없는 경우)
npm install -g vercel

# Vercel 로그인
vercel login

# 프로젝트 설정
npm run setup:vercel
# 또는
vercel
```

#### 방법 2: Vercel Dashboard

1. https://vercel.com 접속
2. **New Project** 클릭
3. GitHub 저장소 연결
4. 프로젝트 설정:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Install Command: `npm ci`
5. **Environment Variables** 추가 (위에서 설정한 모든 변수)

### 5️⃣ GitHub에 푸시

```bash
# 현재 변경사항 커밋 (이미 커밋됨)
git status

# GitHub에 푸시
git push -u origin main
```

### 6️⃣ 배포 확인

```bash
# 환경 변수 검증
npm run verify:env

# 배포 전 검증
npm run pre-deploy

# 배포
npm run deploy
```

## 과금 최소화 설정 확인

### ✅ 적용된 최적화

1. **Next.js 빌드 최적화**
   - 이미지 최적화 (WebP, AVIF)
   - 번들 크기 감소
   - 불필요한 console.log 제거

2. **Vercel 무료 플랜 최적화**
   - 함수 실행 시간 최소화 (10초)
   - 메모리 최적화 (1024MB)
   - 캐싱 강화

3. **Supabase 무료 플랜 최적화**
   - RLS 정책 활성화
   - 인덱스 최적화
   - Connection Pooling 권장

### 📊 무료 플랜 제한

**Vercel Hobby (무료)**
- 100GB 대역폭/월
- 무제한 빌드
- 무제한 함수 실행 (100GB-hours/월)

**Supabase Free**
- 500MB 데이터베이스
- 500 requests/second
- 5GB 대역폭/월

## 트러블슈팅

### Git 푸시 오류

```bash
# 원격 저장소 확인
git remote -v

# 원격 저장소 재설정
git remote set-url origin https://github.com/piwpiw/SecretSaju.git

# 강제 푸시 (주의)
git push -u origin main --force
```

### Vercel 배포 오류

1. 환경 변수 확인: Vercel Dashboard → Settings → Environment Variables
2. 빌드 로그 확인: Vercel Dashboard → Deployments → Build Logs
3. 로컬 빌드 테스트: `npm run build`

### Supabase 연결 오류

1. 환경 변수 확인: `npm run verify:env`
2. Supabase 프로젝트 상태 확인: Dashboard → Settings → General
3. API 키 재생성: Dashboard → Settings → API

## 다음 단계

1. ✅ GitHub 저장소 연결
2. ✅ Supabase 마이그레이션 실행
3. ✅ 환경 변수 설정
4. ✅ Vercel 프로젝트 생성
5. ✅ 배포 확인

**모든 설정이 완료되면 자동으로 배포됩니다!** 🎉
