#!/usr/bin/env bash

# Secret Saju deployment flow (Render)
# Usage: ./scripts/deploy.sh [production|preview]
# Optional env:
# - RUN_INSTALL=true|false (default: true)
# - SKIP_TESTS=true|false (default: false)
# - SKIP_BUILD=true|false (default: false)

set -euo pipefail

ENVIRONMENT="${1:-production}"
RUN_INSTALL="${RUN_INSTALL:-true}"
SKIP_TESTS="${SKIP_TESTS:-false}"
SKIP_BUILD="${SKIP_BUILD:-false}"

echo "Deployment mode: ${ENVIRONMENT}"

if [ "${RUN_INSTALL}" = "true" ]; then
  echo "[1/4] Install dependencies"
  npm ci --no-audit --no-fund
else
  echo "[1/4] Skip install (RUN_INSTALL=false)"
fi

echo "[2/4] Pre-deploy checks"
FLAGS=(--parallel-checks)
if [ "${SKIP_TESTS}" = "true" ]; then FLAGS+=(--skip-tests); fi
if [ "${SKIP_BUILD}" = "true" ]; then FLAGS+=(--skip-build); fi
node scripts/pre-deploy.js "${FLAGS[@]}"

echo "[3/4] Trigger Render deploy (hook optional)"
node scripts/render-deploy.js

echo "[4/4] Wait for health"
node scripts/wait-for-health.js

echo "Deployment automation completed."