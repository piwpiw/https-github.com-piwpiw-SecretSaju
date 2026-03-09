#!/bin/bash

# GitHub 저장소 설정 스크립트
# 사용법: ./scripts/setup/setup-github.sh

set -e

echo "🔗 GitHub 저장소 설정"
echo "======================"
echo ""

# Git 초기화 확인
if [ ! -d ".git" ]; then
    echo "📦 Git 저장소 초기화 중..."
    git init
fi

# .gitignore 확인
if [ ! -f ".gitignore" ]; then
    echo "⚠️  .gitignore 파일이 없습니다!"
    exit 1
fi

# 원격 저장소 확인
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$REMOTE_URL" ]; then
    echo "📝 GitHub 저장소 URL을 입력하세요:"
    echo "   예: https://github.com/piwpiw/SecretSaju.git"
    read -p "URL: " GITHUB_URL

    if [ -z "$GITHUB_URL" ]; then
        echo "❌ URL이 입력되지 않았습니다."
        exit 1
    fi

    git remote add origin "$GITHUB_URL"
    echo "✅ 원격 저장소 추가 완료: $GITHUB_URL"
else
    echo "✅ 원격 저장소 이미 설정됨: $REMOTE_URL"
fi

# 브랜치 설정
echo ""
echo "🌿 브랜치 설정 중..."
git checkout -b main 2>/dev/null || git checkout main

# 초기 커밋
echo ""
echo "📝 파일 스테이징 중..."
git add .

# .env 파일이 포함되어 있는지 확인
if git diff --cached --name-only | grep -q "\.env"; then
    echo "⚠️  경고: .env 파일이 포함되어 있습니다!"
    echo "   .env 파일은 Git에 커밋하면 안 됩니다 (보안 및 과금 위험)"
    read -p "계속하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        git reset
        echo "❌ 취소되었습니다. .env 파일을 .gitignore에 추가하세요."
        exit 1
    fi
fi

echo ""
read -p "커밋 메시지를 입력하세요 (기본: Initial commit): " COMMIT_MSG
COMMIT_MSG=${COMMIT_MSG:-"Initial commit"}

git commit -m "$COMMIT_MSG"

echo ""
echo "🚀 GitHub에 푸시하시겠습니까?"
read -p "푸시 (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 GitHub에 푸시 중..."
    git push -u origin main
    echo "✅ 푸시 완료!"
else
    echo "⏭️  푸시를 건너뛰었습니다."
    echo "   나중에 다음 명령어로 푸시하세요:"
    echo "   git push -u origin main"
fi

echo ""
echo "✅ GitHub 설정 완료!"
