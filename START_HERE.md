# 🎯 시작하기 - 지금 바로!

## ⚡ 가장 빠른 방법

```bash
npm run setup:auto
```

**이게 전부입니다!** 스크립트가 필요한 값만 물어보고 나머지는 자동 처리합니다.

## 📝 입력해야 할 값

### 1. GitHub 저장소 URL (선택)
```
https://github.com/piwpiw/SecretSaju.git
```
없으면 Enter로 건너뛰기

### 2. Supabase 값 3개 (필수)
브라우저에 열린 Supabase 페이지에서:
- Project URL
- anon key
- service_role key

### 3. 마이그레이션 실행 (필수)
브라우저에 열린 Supabase SQL Editor에서:
- `supabase/migrations/001_initial_schema.sql` 실행
- `supabase/migrations/002_add_orders_table.sql` 실행

## ✅ 자동 처리

나머지는 모두 자동입니다:
- Git 커밋
- GitHub 연결
- Vercel 배포
- 환경 변수 설정

**지금 바로 실행하세요!** 🚀

```bash
npm run setup:auto
```
