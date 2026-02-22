#!/bin/bash

# 완전 자동화 설정 스크립트
# GitHub + Supabase + Vercel 한 번에 설정

set -e

echo "🚀 Secret Saju - 완전 자동화 설정"
echo "===================================="
echo ""

# 1. Git 초기화 및 GitHub 연결
echo "📦 1단계: Git 및 GitHub 설정"
echo "----------------------------"
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git 초기화 완료"
fi

# GitHub URL 확인
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
    echo ""
    echo "GitHub 저장소 URL을 입력하세요:"
    echo "예: https://github.com/piwpiw/SecretSaju.git"
    read -p "URL: " GITHUB_URL

    if [ ! -z "$GITHUB_URL" ]; then
        git remote add origin "$GITHUB_URL"
        echo "✅ GitHub 원격 저장소 추가"
    fi
fi

# 파일 스테이징
echo ""
echo "📝 파일 커밋 준비 중..."
git add .

# .env 파일 체크
if git diff --cached --name-only | grep -qE "\.env$|\.env\."; then
    echo "⚠️  경고: .env 파일이 포함되어 있습니다!"
    git reset
    echo "❌ .env 파일은 커밋하면 안 됩니다. .gitignore를 확인하세요."
    exit 1
fi

# 커밋
if [ -n "$(git status --porcelain)" ]; then
    git commit -m "Initial commit: Secret Saju 프로젝트 설정 완료" || true
    echo "✅ 커밋 완료"
fi

# 2. 환경 변수 설정 가이드
echo ""
echo "🔐 2단계: 환경 변수 설정"
echo "----------------------------"
echo ""
echo "다음 명령어로 환경 변수를 설정하세요:"
echo "   npm run setup:env"
echo ""
echo "또는 .env.local 파일을 직접 생성하세요."
echo ""
read -p "환경 변수 설정을 완료하셨나요? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  환경 변수 설정 후 다시 실행하세요."
    exit 1
fi

# 3. Supabase 마이그레이션 안내
echo ""
echo "🗄️  3단계: Supabase 마이그레이션"
echo "----------------------------"
echo ""
echo "Supabase Dashboard에서 마이그레이션을 실행하세요:"
echo "1. https://supabase.com/dashboard/project/jyrdihklwkbeypfxbiwp 접속"
echo "2. SQL Editor 열기"
echo "3. 다음 파일들을 순서대로 실행:"
echo "   - supabase/migrations/001_initial_schema.sql"
echo "   - supabase/migrations/002_add_orders_table.sql"
echo ""
echo "또는 Supabase CLI 사용:"
echo "   supabase db push"
echo ""
read -p "마이그레이션을 완료하셨나요? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  마이그레이션 완료 후 다시 실행하세요."
    exit 1
fi

# 4. Vercel 설정
echo ""
echo "🌐 4단계: Vercel 프로젝트 설정"
echo "----------------------------"
echo ""
echo "Vercel CLI로 프로젝트를 설정하세요:"
echo "   npm run setup:vercel"
echo ""
echo "또는 수동으로:"
echo "   vercel"
echo ""
read -p "Vercel 설정을 완료하셨나요? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  Vercel 설정 완료 후 다시 실행하세요."
    exit 1
fi

# 5. GitHub 푸시
echo ""
echo "📤 5단계: GitHub에 푸시"
echo "----------------------------"
read -p "GitHub에 푸시하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push -u origin main || git push -u origin master
    echo "✅ GitHub 푸시 완료"
fi

# 6. 최종 검증
echo ""
echo "✅ 6단계: 최종 검증"
echo "----------------------------"
echo ""
echo "환경 변수 검증 중..."
npm run verify:env || echo "⚠️  환경 변수 검증 실패"

echo ""
echo "🎉 설정 완료!"
echo ""
echo "📋 다음 단계:"
echo "1. Vercel Dashboard에서 환경 변수 설정"
echo "2. GitHub 저장소와 Vercel 연결 (자동 배포)"
echo "3. 배포 확인: npm run deploy"
echo ""
echo "📚 참고 문서:"
echo "   - QUICK_DEPLOY.md: 빠른 배포 가이드"
echo "   - DEPLOYMENT.md: 상세 배포 가이드"
echo "   - scripts/setup-supabase.md: Supabase 설정"
