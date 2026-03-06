# Deployment & Migration Checklist

## 📦 1. Pre-Deployment (Schema & Data)
- [ ] Run `supabase/migrations` in orders. Ensure `jelly_wallets` table exists with `user_id` unique constraint.
- [ ] Verify `mcp_user_id` column exists in `users` table.
- [ ] Run `npm run extract-types` to ensure `src/types/database.ts` is in sync.
- [ ] Check `NEXT_PUBLIC_BASE_URL` in target environment.

## 🚀 2. OAuth Configuration
- [ ] Register `REDIRECT_URI` in MCP Portal.
- [ ] Register `REDIRECT_URI` in Kakao Developers Portal.

## 🛡️ 3. Environment Variables (.env)
- [ ] All required secrets are set in Vercel/Render dashboard.
- [ ] `MCP_CLIENT_SECRET` is NOT publicly exposed.

## 📉 4. Rollback Plan
In case of critical failures:
1. **Revert Artifact**: Revert to the last stable commit.
2. **Revert DB**: Restore Supabase to the last automatic backup (point-in-time recovery).
3. **Session Purge**: If OAuth state mismatch occurs globally, clear `mcp_oauth_state` cookies.
4. **Kill Switch**: Set `FEATURES.MCP = false` in `src/config/env.ts` to disable the feature immediately.

---
**Last Updated**: 2026-03-03
