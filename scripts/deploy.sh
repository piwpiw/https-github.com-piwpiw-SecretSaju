#!/bin/bash

# Secret Saju deployment flow (Render)
# Usage: ./scripts/deploy.sh [production|preview]

set -e

ENV=${1:-production}
echo "🚀 Deployment mode: $ENV"

echo "1) Install dependencies"
npm ci

echo "2) TypeScript check"
npm run lint

echo "3) Unit tests"
npm test -- --run

echo "4) Build"
npm run build

echo "5) Verify env"
node scripts/verify-env.js

echo "6) Trigger Render deploy"
if [ "$ENV" = "production" ]; then
  node scripts/render-deploy.js
else
  node scripts/render-deploy.js
fi

echo "✅ Done"
