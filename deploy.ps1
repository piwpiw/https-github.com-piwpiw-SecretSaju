#!/usr/bin/env pwsh

# deploy.ps1 - SecretSaju deployment helper for Render

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

Write-Host "`n🚀 Trigger Render deploy..." -ForegroundColor Cyan
if ($env:RENDER_DEPLOY_HOOK_URL) {
    try {
        Invoke-RestMethod -Method Post -Uri $env:RENDER_DEPLOY_HOOK_URL | Out-Null
        Write-Host "✅ Render deploy hook sent" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Failed to call Render deploy hook: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "💡 Render auto-deploy from main branch may still proceed." -ForegroundColor Cyan
    }
} else {
    Write-Host "💡 RENDER_DEPLOY_HOOK_URL is not set. Render auto-deploy from main branch is used." -ForegroundColor Cyan
}

Write-Host "`n🎉 Done at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Magenta
