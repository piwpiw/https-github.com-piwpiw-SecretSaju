#!/bin/bash

# Vercel setup helper
# Usage: bash scripts/deploy/setup-vercel.sh (or npm run setup:vercel)

set -e

echo "▲ Vercel setup"
echo "==============="
echo ""
echo "1) Authenticate CLI: vercel login"
echo "2) Link project once from repo root: vercel link"
echo "3) Configure env vars in Vercel Dashboard or with: vercel env add"
echo "4) Preview deploy: npm run deploy:vercel"
echo "5) Production deploy: npm run deploy:vercel:prod"
echo ""
echo "Recommended required vars:"
echo "- NEXT_PUBLIC_BASE_URL"
echo "- NEXT_PUBLIC_APP_URL"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "Optional app vars:"
echo "- KAKAO_*"
echo "- TOSS_* / STRIPE_*"
echo "- OPENAI_* / GOOGLE_* / ANTHROPIC_*"
echo "- MAIL / NOTION / CRON vars"
echo ""
echo "Current repo uses vercel.json buildCommand: npm run build"
echo "Done."
