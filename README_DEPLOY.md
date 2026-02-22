# 🚀 완전 자동화 배포 - 지금 바로!

## ⚡ 원클릭 배포

```bash
npm run setup:auto
```

**이게 전부입니다!** 필요한 값만 입력하면 나머지는 자동으로 처리됩니다.

## 📋 필요한 값 (3가지)

### 1. GitHub 저장소 URL (선택)
```
https://github.com/piwpiw/SecretSaju.git
```
- 저장소가 없으면 Enter로 건너뛰기 가능

### 2. Supabase 환경 변수 3개 (필수)
브라우저에 열린 Supabase 페이지에서:
1. **Settings → API → Project URL** 복사
2. **Settings → API → anon public** 복사
3. **Settings → API → service_role secret** 복사

### 3. Supabase 마이그레이션 실행 (필수)
브라우저에 열린 Supabase SQL Editor에서:
1. `supabase/migrations/001_initial_schema.sql` 파일 열기
2. 내용 전체 복사 → SQL Editor에 붙여넣기 → **Run** 클릭
3. `supabase/migrations/002_add_orders_table.sql` 파일 열기
4. 내용 전체 복사 → SQL Editor에 붙여넣기 → **Run** 클릭

## ✅ 자동으로 처리되는 것들

- ✅ Git 커밋
- ✅ GitHub 원격 저장소 연결
- ✅ 환경 변수 파일 생성
- ✅ Vercel 로그인 및 배포
- ✅ GitHub 푸시

## 🎯 지금 바로 실행

```bash
npm run setup:auto
```

스크립트가 실행되면:
1. 필요한 값만 물어봄
2. 나머지는 자동 처리
3. 배포 완료!

## 📚 브라우저 페이지

다음 페이지들이 이미 열려있습니다:
- ✅ Supabase Dashboard
- ✅ Vercel Login
- ✅ GitHub New Repository
- ✅ Kakao Developers
- ✅ Toss Payments

**준비 완료! 지금 바로 실행하세요!** 🚀
