#!/usr/bin/env bash
set -euo pipefail

USERNAME="${1:-piwpiw}"
EMAIL="${2:-piwpiw99@gmail.com}"
REPO="${3:-SecretSaju}"

REPO_URL="https://github.com/${USERNAME}/${REPO}.git"
SCOPED_URL="https://$USERNAME@github.com/${USERNAME}/${REPO}.git"

echo "==== GitHub identity setup (Git) ===="
git config --global user.name "$USERNAME"
git config --global user.email "$EMAIL"
git config --global "credential.https://github.com.username" "$USERNAME"
git config --global credential.interactive false
git config --global credential.useHttpPath true
git config --global credential.helper manager

git config --local user.name "$USERNAME"
git config --local user.email "$EMAIL"
git config --local "credential.https://github.com.username" "$USERNAME"
git config --local credential.interactive false
git config --local credential.useHttpPath true
git config --local "credential.https://github.com/$USERNAME/$REPO.git.username" "$USERNAME"

git remote set-url origin "$SCOPED_URL"
git remote set-url --push origin "$SCOPED_URL"

echo
echo "Current git remote:"
git remote -v
echo
echo "Current local git config:"
git config --local --get-regexp '^user\.|^credential\.' || true
echo
echo "Current global git config:"
git config --global --get-regexp '^user\.|^credential\.' || true
echo
echo "Done. Repo: $REPO_URL"
