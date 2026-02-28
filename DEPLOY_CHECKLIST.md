# ✅ 배포 체크리스트 - 지금 바로 실행

## 🎯 현재 상태

- ✅ Git 초기화 완료
- ✅ 커밋 완료 (203개 파일)
- ✅ 과금 최소화 최적화 적용
- ⏳ GitHub 원격 저장소 연결 필요
- ⏳ Supabase 마이그레이션 필요
- ⏳ Vercel 프로젝트 생성 필요

## 📋 지금 바로 해야 할 일

### 1️⃣ GitHub 저장소 생성 및 연결

```bash
# GitHub에서 새 저장소 생성
# https://github.com/new 접속
# 저장소 이름: SecretSaju
# Public 또는 Private 선택

# 원격 저장소 연결
git remote add origin https://github.com/piwpiw/SecretSaju.git

# 푸시
git branch -M main
git push -u origin main
```

**또는 자동화 스크립트:**
```bash
npm run setup:github
```

### 2️⃣ Supabase 마이그레이션 실행

**프로젝트**: https://supabase.com/dashboard/project/jyrdihklwkbeypfxbiwp

1. Supabase Dashboard 접속
2. **SQL Editor** 클릭
3. 다음 파일 내용 복사 → 붙여넣기 → **Run**:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_add_orders_table.sql`

**환경 변수 가져오기:**
- Settings → API → Project URL, anon key, service_role key 복사

### 3️⃣ 환경 변수 설정

```bash
# 대화형 설정
npm run setup:env

# 또는 .env.local 파일 생성
```

필수 변수:
- Supabase (위에서 가져온 값)
- Kakao OAuth (카카오 개발자 콘솔)
- Toss Payments V2 (결제위젯 API 키, Client/Secret Key)
- Toss Webhook URL 및 Secret (결제 상태 동기화용)

### 4️⃣ Vercel 프로젝트 생성

**방법 1: CLI (권장)**
```bash
npm install -g vercel
vercel login
vercel
```

**방법 2: Dashboard**
1. https://vercel.com 접속
2. New Project → GitHub 저장소 연결
3. 환경 변수 설정 (Settings → Environment Variables)

### 5️⃣ 배포 확인

```bash
# 환경 변수 검증
npm run verify:env

# 배포
npm run deploy
```

## 🎁 과금 최소화 적용 완료

### ✅ 적용된 최적화

1. **Next.js 빌드 최적화**
   - 이미지 최적화 (WebP, AVIF)
   - 번들 크기 감소
   - 불필요한 console.log 제거

2. **Vercel 최적화**
   - 함수 실행 시간: 10초 (무료 플랜 최적화)
   - 메모리: 1024MB
   - 캐싱 강화 (30일)

3. **Supabase 최적화**
   - RLS 정책 활성화
   - 인덱스 최적화
   - Connection Pooling 권장

## 📊 예상 비용

**무료 플랜으로 충분:**
- Vercel Hobby: $0/월
- Supabase Free: $0/월
- GitHub: $0/월

**월간 사용량 예상:**
- 트래픽: ~10GB (무료 한도 내)
- API 호출: ~100K (무료 한도 내)
- 빌드: 무제한 (무료)

## 🚨 주의사항

### 절대 하지 말아야 할 것

1. ❌ `.env.local` 파일을 Git에 커밋
2. ❌ Vercel Pro 플랜으로 업그레이드 (필요 없음)
3. ❌ Supabase Pro 플랜으로 업그레이드 (필요 없음)
4. ❌ 불필요한 API 호출

### 과금 방지 체크리스트

- [ ] `.env.local`이 `.gitignore`에 포함되어 있는지 확인
- [ ] Vercel 무료 플랜 사용 확인
- [ ] Supabase 무료 플랜 사용 확인
- [ ] 이미지 최적화 활성화 확인
- [ ] 캐싱 설정 확인

## 📚 참고 문서

- `SETUP_NOW.md` - 상세 설정 가이드
- `QUICK_DEPLOY.md` - 빠른 배포 가이드
- `DEPLOYMENT.md` - 전체 배포 가이드
- `scripts/setup-supabase.md` - Supabase 설정

## 🎉 완료 후

배포가 완료되면:
1. 메인 페이지 접속 확인
2. 카카오 로그인 테스트
3. 결제 플로우 테스트
4. 젤리 충전/사용 테스트

**모든 것이 무료 플랜으로 작동합니다!** 🎊
