#!/usr/bin/env pwsh

# deploy.ps1 - SecretSaju 배포 헬퍼 (Vercel)
#
# 배포는 Vercel Git 연동이 수행합니다. main 에 푸시하면 프로덕션 배포가
# 자동으로 시작되므로, 이 스크립트는 빌드 확인 + 커밋 + 푸시까지만 합니다.

param(
    [string]$Message = "update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$ErrorActionPreference = "Stop"

Write-Host "`n✅ Build started..." -ForegroundColor Cyan
npx next build 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build succeeded" -ForegroundColor Green

Write-Host "`n🚀 Push changes to main" -ForegroundColor Cyan
git add -A
$status = git status --porcelain
if (-not $status) {
    Write-Host "⚠️ No changes to commit" -ForegroundColor Yellow
} else {
    git commit -m $Message
    git push origin main
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Git push failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ GitHub push succeeded" -ForegroundColor Green
}

Write-Host "`n🚀 Vercel 프로덕션 배포가 자동으로 시작됩니다 (main 푸시 감지)." -ForegroundColor Cyan
Write-Host "   진행 상황은 Vercel 대시보드에서 확인하세요." -ForegroundColor Cyan

Write-Host "`n🎉 Done at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Magenta
