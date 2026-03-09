#!/bin/bash

set -e

echo "🔧 Secret Saju - 배포 준비"
echo "===================================="
echo ""

# 1. Git 초기화/원격 확인
echo "1) GitHub 설정"
echo "----------------------------"
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git 초기화 완료"
fi

# GitHub URL 확인
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
    echo ""
    echo "GitHub 원격 URL을 입력하세요."
    echo "예: https://github.com/your-org/SecretSaju.git"
    read -p "URL: " GITHUB_URL

    if [ ! -z "$GITHUB_URL" ]; then
        git remote add origin "$GITHUB_URL"
        echo "✅ GitHub 원격 등록"
    fi
fi

# 파일 스테이징
echo ""
echo "2) 현재 변경사항 스테이징"
git add .

# .env 파일 보호
if git diff --cached --name-only | grep -qE "\.env$|\.env\."; then
    echo "⚠️ 주의: .env 파일이 스테이징되어 있습니다. 제거 후 진행하세요."
    git reset
    echo "✅ .env 파일은 제거했습니다. .gitignore를 다시 확인하세요."
    exit 1
fi

# 커밋
if [ -n "$(git status --porcelain)" ]; then
    git commit -m "Initial commit: Secret Saju deployment setup" || true
    echo "✅ 커밋 완료"
fi

# 2. 환경 변수 확인
echo ""
echo "2) 환경 변수 설정"
echo "----------------------------"
echo ""
echo "아래 문서를 참고해 환경 변수 설정을 먼저 완료하세요."
echo "   npm run setup:env"
echo ""
echo "또는 .env.local 파일을 먼저 생성해 주세요."
echo ""
read -p "환경 변수 설정 완료했나요? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️ 환경 변수 설정을 먼저 완료한 뒤 다시 실행하세요."
    exit 1
fi

# 3. Supabase 초기화 점검
echo ""
echo "3) Supabase 설정"
echo "----------------------------"
echo ""
echo "Supabase Dashboard에서 프로젝트 설정을 완료하세요."
echo "1. https://supabase.com/dashboard/project/jyrdihklwkbeypfxbiwp"
echo "2. SQL Editor 열기"
echo "3. 적용할 SQL 파일:"
echo "   - supabase/migrations/001_initial_schema.sql"
echo "   - supabase/migrations/002_add_orders_table.sql"
echo ""
echo "실행 예시:"
echo "   supabase db push"
echo ""
read -p "Supabase 설정 완료했나요? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️ Supabase 설정을 먼저 완료한 뒤 다시 실행하세요."
    exit 1
fi

# 4. Render + Cloudflare 연결
echo ""
echo "4) Render 배포 설정"
echo "----------------------------"
echo ""
echo "Render 대시보드에서 설정하세요."
echo "   - Services: web/worker/job 생성 또는 검증"
echo "   - Branch: main auto deploy 활성화"
echo "   - Environment Variables 입력"
echo "   - Deploy Hook: GitHub 자동배포 사용 시 불필요(설정하지 않아도 됨)"
echo "   - Origin(원본): Cloudflare proxy 대상은 Render 서비스로 설정"
echo "   - 확인 명령: npm run setup:render"
echo ""
echo "권장 작업:"
echo "   npm run setup:render"
echo ""
read -p "Render 및 Cloudflare 설정 완료했나요? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️ Render 및 Cloudflare 설정을 먼저 완료한 뒤 다시 실행하세요."
    exit 1
fi

# 5. GitHub 배포
echo ""
echo "5) GitHub Push"
echo "----------------------------"
read -p "GitHub push 실행하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push -u origin main || git push -u origin master
    echo "✅ GitHub push 완료"
fi

# 6. 배포 전 점검
echo ""
echo "6) 배포 전 점검"
echo "----------------------------"
echo ""
echo "환경 변수 점검을 실행합니다."
npm run verify:env || echo "⚠️ 환경 변수 점검에서 실패가 있었던 항목을 확인하세요"

echo ""
echo "✅ 초기 설정 완료!"
echo ""
echo "권장 다음 단계:"
echo "1. Render Dashboard에서 환경 변수/연결 상태 재확인"
echo "2. GitHub main → Render 자동 배포 연결 확인"
echo "3. 배포 검증: npm run deploy"
echo ""
echo "참고 문서:"
echo "   - QUICK_DEPLOY.md: Render Quick-start"
echo "   - DEPLOYMENT.md: Render Full Guide"
echo "   - docs/01-team/engineering/setup-supabase.md: Supabase 설정"



