#!/bin/bash

# Render setup helper
# Usage: bash scripts/deploy/setup-vercel.sh (or npm run setup:render, setup:vercel)

set -e

echo "🚀 Render setup"
echo "================"
echo ""
echo "1) Configure environment variables in Render Dashboard (Environment Groups)."
echo "2) Connect GitHub branch for main push auto-deploy."
echo "3) Optional: set RENDER_DEPLOY_HOOK_URL in shell/local env for manual deploy trigger."
echo "   - If GitHub auto-deploy is enabled, you do not need this."
echo ""
echo "IMPORTANT: Replace placeholders in render.yaml:"
echo "- __RENDER_WEB_SERVICE__: service URL (ex: https://secretsaju.onrender.com)"
echo "- __RENDER_WEB_DOMAIN__: public domain/domainless URL used by users (ex: https://secretsaju.onrender.com)"
echo ""
echo "Set CRON_SECRET in environment as any random long string. Example generator:"
echo "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo ""
echo "Required app vars to enter in Render:"
echo "- NEXT_PUBLIC_BASE_URL"
echo "- NEXT_PUBLIC_APP_URL"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "Useful optional vars:"
echo "- CRON_SECRET"
echo "- KAKAO_REST_API_KEY"
echo "- KAKAO_CLIENT_SECRET"
echo "- NEXT_PUBLIC_KAKAO_JS_KEY"
echo "- TOSS/Stripe keys"
echo "- Mail/Notion/AI keys"
echo ""
echo "Done."
