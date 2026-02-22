#!/bin/bash

# Vercel 프로젝트 설정 스크립트
# 사용법: ./scripts/setup-vercel.sh

set -e

echo "🚀 Vercel 프로젝트 설정"
echo "======================="
echo ""

# Vercel CLI 확인
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI 설치 중..."
    npm install -g vercel
fi

echo "🔐 Vercel 로그인 확인..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Vercel에 로그인해야 합니다."
    vercel login
fi

echo ""
echo "📝 프로젝트 설정 시작..."
echo "   다음 질문에 답변하세요:"
echo ""

# Vercel 프로젝트 연결/생성
vercel --yes

echo ""
echo "✅ Vercel 프로젝트 설정 완료!"
echo ""
echo "📋 다음 단계:"
echo "1. Vercel Dashboard에서 환경 변수 설정"
echo "2. GitHub 저장소 연결 (자동 배포 활성화)"
echo "3. 도메인 설정 (선택적)"
echo ""
echo "환경 변수 설정 가이드:"
echo "   Vercel Dashboard → Settings → Environment Variables"
echo "   npm run verify:env 로 필요한 변수 확인"
