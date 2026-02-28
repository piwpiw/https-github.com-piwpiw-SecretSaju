# 🚀 완전 자동화 배포 - 지금 바로 실행

## ⚡ 원클릭 배포

```bash
npm run setup:auto
```

이 명령어 하나로 모든 것이 자동으로 처리됩니다!

## 📋 필요한 값만 입력

스크립트가 실행되면 다음 값들만 입력하면 됩니다:

### 1. GitHub 저장소 URL (선택적)
```
https://github.com/piwpiw/SecretSaju.git
```
- GitHub에서 저장소를 만들지 않았다면 "Enter"로 건너뛰기 가능

### 2. Supabase 환경 변수 (필수)
브라우저에서 열린 Supabase 페이지에서:
- Settings → API → Project URL 복사
- Settings → API → anon public 복사
- Settings → API → service_role secret 복사

### 3. 마이그레이션 실행 (필수)
브라우저에서 열린 Supabase SQL Editor에서:
1. `supabase/migrations/001_initial_schema.sql` 파일 내용 복사 → 붙여넣기 → Run
2. `supabase/migrations/002_add_orders_table.sql` 파일 내용 복사 → 붙여넣기 → Run

## 🎯 자동으로 처리되는 것들

✅ Git 초기화 및 커밋
✅ GitHub 원격 저장소 연결
✅ 환경 변수 파일 생성
✅ Vercel 로그인 및 배포
✅ GitHub 푸시

## 🚨 문제 해결

### 스크립트가 멈춤
- Ctrl+C로 중단 후 다시 실행
- 또는 단계별로 수동 실행

### Vercel 로그인 실패
```bash
vercel login
# 브라우저에서 로그인
```

### GitHub 푸시 실패
```bash
git remote add origin https://github.com/piwpiw/SecretSaju.git
git push -u origin main
```

## 📞 빠른 도움말

모든 설정 페이지가 이미 브라우저에 열려있습니다:
- ✅ Supabase Dashboard
- ✅ Vercel Login
- ✅ GitHub New Repository
- ✅ Kakao Developers
- ✅ Toss Payments

**지금 바로 `npm run setup:auto` 실행하세요!** 🚀
