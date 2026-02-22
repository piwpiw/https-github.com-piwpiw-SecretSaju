# 배포 스크립트 가이드

이 디렉토리에는 배포 자동화를 위한 스크립트들이 포함되어 있습니다.

## 스크립트 목록

### 1. `setup-env.sh` - 환경 변수 설정
대화형으로 환경 변수를 입력받아 `.env.local` 파일을 생성합니다.

```bash
npm run setup:env
# 또는
bash scripts/setup-env.sh
```

### 2. `verify-env.js` - 환경 변수 검증
필수 환경 변수가 모두 설정되었는지 확인합니다.

```bash
npm run verify:env
# 또는
node scripts/verify-env.js
```

### 3. `migrate-db.js` - 데이터베이스 마이그레이션 가이드
Supabase 마이그레이션 실행 방법을 안내합니다.

```bash
npm run migrate:db
# 또는
node scripts/migrate-db.js
```

### 4. `pre-deploy.js` - 배포 전 검증
배포 전 모든 필수 사항을 검증합니다.

```bash
npm run pre-deploy
# 또는
node scripts/pre-deploy.js

# 빌드/테스트 건너뛰기
node scripts/pre-deploy.js --skip-build --skip-tests
```

### 5. `deploy.sh` - 자동 배포 스크립트
전체 배포 프로세스를 자동화합니다.

```bash
bash scripts/deploy.sh production
# 또는
bash scripts/deploy.sh preview
```

## 사용 예시

### 첫 배포

```bash
# 1. 환경 변수 설정
npm run setup:env

# 2. 검증
npm run verify:env

# 3. 마이그레이션
npm run migrate:db
# Supabase Dashboard에서 SQL 실행

# 4. 배포 전 검증
npm run pre-deploy

# 5. 배포
npm run deploy
```

### 빠른 재배포

```bash
# 검증만 하고 배포
npm run pre-deploy -- --skip-build --skip-tests
npm run deploy
```

## 주의사항

- Windows에서는 `.sh` 스크립트 대신 npm 스크립트를 사용하세요
- 모든 스크립트는 프로젝트 루트에서 실행해야 합니다
- 환경 변수는 반드시 `.env.local`에 설정하세요 (Git에 커밋하지 마세요)
