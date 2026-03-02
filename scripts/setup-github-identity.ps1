param(
    [string]$Username = "piwpiw",
    [string]$Email = "piwpiw99@gmail.com",
    [string]$Repo = "SecretSaju"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoUrl = "https://github.com/$Username/$Repo.git"
$scopedRepoUrl = "https://$Username@github.com/$Username/$Repo.git"

Write-Host "==== GitHub identity setup (PowerShell) ===="
git config --global user.name "$Username"
git config --global user.email "$Email"
git config --global credential.https://github.com.username "$Username"
git config --global credential.interactive false
git config --global credential.useHttpPath true
git config --global credential.helper manager-core

git config --local user.name "$Username"
git config --local user.email "$Email"
git config --local credential.https://github.com.username "$Username"
git config --local credential.interactive false
git config --local credential.useHttpPath true
git config --local credential.https://github.com/$Username/$Repo.git.username "$Username"

git remote set-url origin "$scopedRepoUrl"
git remote set-url --push origin "$scopedRepoUrl"

Write-Host "`nCurrent git remote:"
git remote -v
Write-Host "`nCurrent local git config:"
git config --local --get-regexp '^user|^credential'
Write-Host "`nCurrent global git config:"
git config --global --get-regexp '^user|^credential'
Write-Host "`nDone. Use these for CLI-only push: git push origin main"
Write-Host "Repo: $repoUrl"
Write-Host "If prompted, use a PAT once in GitHub Desktop/GCM and save it for this account."
