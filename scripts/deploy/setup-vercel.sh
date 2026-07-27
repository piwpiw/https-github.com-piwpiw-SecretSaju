#!/bin/bash

# Vercel 설정 안내
# 사용법: bash scripts/deploy/setup-vercel.sh (또는 npm run setup:vercel)
#
# 배포 대상은 Vercel 하나입니다. `main`에 푸시하면 프로덕션이, PR을 열면 프리뷰가
# Vercel Git 연동으로 자동 배포됩니다. 별도의 배포 훅 호출은 필요 없습니다.

set -e

echo "🚀 Vercel 설정"
echo "================"
echo ""
echo "1) Vercel 프로젝트에 GitHub 저장소를 연결합니다 (main → Production)."
echo "2) Project Settings → Environment Variables 에 아래 값을 넣습니다."
echo "3) 빌드 설정은 vercel.json 이 정본입니다 (framework: nextjs, install: npm ci)."
echo ""
echo "필수 환경변수:"
echo "- NEXT_PUBLIC_BASE_URL       (예: https://<project>.vercel.app)"
echo "- NEXT_PUBLIC_APP_URL"
echo ""
echo "로그인·이력 저장을 쓸 경우:"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo "- NEXT_PUBLIC_KAKAO_JS_KEY"
echo "- KAKAO_REST_API_KEY"
echo "- KAKAO_CLIENT_SECRET"
echo ""
echo "선택:"
echo "- CRON_SECRET  (긴 임의 문자열)"
echo "    node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo "- TOSS / Stripe 결제 키 (무료 오픈 기간에는 불필요)"
echo "- Mail / Notion / AI 키"
echo ""
echo "주의: NEXT_PUBLIC_* 는 **빌드 시점에 정의되어 있어야** 클라이언트 번들에"
echo "      치환됩니다. 나중에 추가했다면 반드시 재배포하세요."
echo ""
echo "완료."
