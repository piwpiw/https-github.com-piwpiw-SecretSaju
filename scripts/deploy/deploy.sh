#!/usr/bin/env bash

# Secret Saju 배포 전 점검 (Vercel)
#
# 배포 자체는 Vercel Git 연동이 수행합니다 — `main`에 푸시하면 프로덕션이,
# PR을 열면 프리뷰가 자동으로 배포됩니다. 그래서 이 스크립트는 **푸시하기 전에
# 로컬에서 돌려 보는 점검**만 담당하고, 배포 훅은 호출하지 않습니다.
#
# 사용법: ./scripts/deploy/deploy.sh
# 선택 환경변수:
# - RUN_INSTALL=true|false (기본 true)
# - SKIP_TESTS=true|false  (기본 false)
# - SKIP_BUILD=true|false  (기본 false)

set -euo pipefail

RUN_INSTALL="${RUN_INSTALL:-true}"
SKIP_TESTS="${SKIP_TESTS:-false}"
SKIP_BUILD="${SKIP_BUILD:-false}"

echo "배포 전 점검 (배포는 Vercel Git 연동이 수행)"

if [ "${RUN_INSTALL}" = "true" ]; then
  echo "[1/2] 의존성 설치"
  npm ci --no-audit --no-fund
else
  echo "[1/2] 설치 건너뜀 (RUN_INSTALL=false)"
fi

echo "[2/2] 사전 점검"
FLAGS=(--parallel-checks)
if [ "${SKIP_TESTS}" = "true" ]; then FLAGS+=(--skip-tests); fi
if [ "${SKIP_BUILD}" = "true" ]; then FLAGS+=(--skip-build); fi
node scripts/deploy/pre-deploy.js "${FLAGS[@]}"

echo ""
echo "점검 완료. main 에 푸시하면 Vercel 프로덕션 배포가 시작됩니다."
