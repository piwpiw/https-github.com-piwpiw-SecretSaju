#!/bin/bash

# 환경 변수 설정 가이드 스크립트
# .env.local 파일 생성 도우미

set -e

ENV_FILE=".env.local"

echo "🔧 환경 변수 설정 가이드"
echo "========================"
echo ""

if [ -f "$ENV_FILE" ]; then
    echo "⚠️  .env.local 파일이 이미 존재합니다."
    read -p "덮어쓰시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "취소되었습니다."
        exit 0
    fi
fi

echo "# Secret Saju - 환경 변수 설정"
echo "# 생성일: $(date)"
echo "" > "$ENV_FILE"

echo "📝 환경 변수 입력을 시작합니다..."
echo ""

# 애플리케이션 URL
read -p "애플리케이션 URL (예: http://localhost:3000): " APP_URL
echo "NEXT_PUBLIC_BASE_URL=$APP_URL" >> "$ENV_FILE"
echo "NEXT_PUBLIC_APP_URL=$APP_URL" >> "$ENV_FILE"
echo ""

# Supabase
echo "=== Supabase 설정 ==="
read -p "Supabase URL: " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
read -p "Supabase Service Role Key: " SUPABASE_SERVICE_KEY

echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" >> "$ENV_FILE"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> "$ENV_FILE"
echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY" >> "$ENV_FILE"
echo ""

# Kakao
echo "=== Kakao OAuth 설정 ==="
read -p "Kakao JavaScript Key: " KAKAO_JS_KEY
read -p "Kakao REST API Key: " KAKAO_REST_KEY
read -p "Kakao Client Secret: " KAKAO_SECRET
read -p "Kakao Redirect URI: " KAKAO_REDIRECT

echo "NEXT_PUBLIC_KAKAO_JS_KEY=$KAKAO_JS_KEY" >> "$ENV_FILE"
echo "KAKAO_REST_API_KEY=$KAKAO_REST_KEY" >> "$ENV_FILE"
echo "KAKAO_CLIENT_SECRET=$KAKAO_SECRET" >> "$ENV_FILE"
echo "KAKAO_REDIRECT_URI=$KAKAO_REDIRECT" >> "$ENV_FILE"
echo ""

# Toss Payments
echo "=== Toss Payments 설정 ==="
read -p "Toss Client Key: " TOSS_CLIENT_KEY
read -p "Toss Secret Key: " TOSS_SECRET_KEY

echo "NEXT_PUBLIC_TOSS_CLIENT_KEY=$TOSS_CLIENT_KEY" >> "$ENV_FILE"
echo "TOSS_SECRET_KEY=$TOSS_SECRET_KEY" >> "$ENV_FILE"
echo ""

# 선택적
read -p "Google Analytics ID (선택적, Enter로 건너뛰기): " GA_ID
if [ ! -z "$GA_ID" ]; then
    echo "NEXT_PUBLIC_GA_ID=$GA_ID" >> "$ENV_FILE"
fi

echo "NODE_ENV=development" >> "$ENV_FILE"

echo ""
echo "✅ .env.local 파일이 생성되었습니다!"
echo "📋 다음 명령어로 환경 변수를 확인하세요:"
echo "   node scripts/verify-env.js"
