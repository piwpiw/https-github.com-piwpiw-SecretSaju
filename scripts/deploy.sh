#!/bin/bash

# Secret Saju - 자동 배포 스크립트
# 사용법: ./scripts/deploy.sh [production|preview]

set -e

ENV=${1:-production}
echo "🚀 배포 시작: $ENV"

# 1. 의존성 설치
echo "📦 의존성 설치 중..."
npm ci

# 2. 타입 체크
echo "🔍 TypeScript 타입 체크 중..."
npx tsc --noEmit

# 3. 린트 체크
echo "✨ ESLint 실행 중..."
npm run lint

# 4. 테스트 실행
echo "🧪 테스트 실행 중..."
npm test -- --run

# 5. 빌드
echo "🏗️  빌드 중..."
npm run build

# 6. 환경 변수 검증
echo "🔐 환경 변수 검증 중..."
node scripts/verify-env.js

# 7. Vercel 배포
if [ "$ENV" = "production" ]; then
    echo "🌐 프로덕션 배포 중..."
    vercel --prod --yes
else
    echo "🔍 프리뷰 배포 중..."
    vercel --yes
fi

echo "✅ 배포 완료!"
