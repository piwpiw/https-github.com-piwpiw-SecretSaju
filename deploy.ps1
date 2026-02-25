#!/usr/bin/env pwsh
# deploy.ps1 — SecretSaju 원클릭 배포
# 사용법: .\deploy.ps1 "커밋 메시지"

param(
    [string]$Message = "update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$ErrorActionPreference = "Stop"

Write-Host "`n🔨 빌드 검증..." -ForegroundColor Cyan
npx next build 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 빌드 실패 — 배포 중단" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 빌드 성공" -ForegroundColor Green

Write-Host "`n📦 Git 커밋 & 푸시..." -ForegroundColor Cyan
git add -A
$status = git status --porcelain
if (-not $status) {
    Write-Host "⏭️  변경사항 없음 — 스킵" -ForegroundColor Yellow
} else {
    git commit -m $Message
    git push origin main
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Git push 실패" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ GitHub 푸시 완료" -ForegroundColor Green
}

Write-Host "`n🚀 Vercel 프로덕션 배포..." -ForegroundColor Cyan
npx vercel --prod --yes 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Vercel CLI 배포 실패 — GitHub 연동으로 자동 배포됩니다" -ForegroundColor Yellow
} else {
    Write-Host "✅ 배포 완료!" -ForegroundColor Green
}

Write-Host "`n🎉 완료 — $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Magenta
