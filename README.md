# SecretSaju

Premium fortune-telling platform built on Next.js, Supabase, and a custom saju engine.

## Start Here

| File | Purpose |
|---|---|
| `AI_BOOTSTRAP.md` | Fast context for active implementation work |
| `NEXT_ACTIONS.md` | Single source of truth for remaining work |
| `ERROR_LEDGER.md` | Known failures, mitigations, and follow-up |
| `docs/index.md` | Documentation index and repo navigation |
| `docs/00-overview/CONTEXT_ENGINE.md` | Feature-to-file map for the current codebase |
| `docs/00-overview/repository-structure.md` | Canonical repository layout and placement rules |

## Quick Commands

```bash
npm run dev:safe -- --port 3000 --auto-port
npm run lint
npx tsc --noEmit
npm run test:logic
npm run smoke:auth
npm run deploy
npm run deploy:vercel
```

## Fast Lookup

| Need | Path |
|---|---|
| Payment verify route | `src/app/api/payment/verify/route.ts` |
| Payment verify helper | `src/lib/payment/payment-verify.ts` |
| Auth callback messages | `src/lib/auth/auth-callback-message.ts` |
| Payment failure messages | `src/lib/payment/payment-verify-message.ts` |
| Deploy scripts | `scripts/deploy/` |
| Render production deploy | `npm run deploy` |
| Vercel preview deploy | `npm run deploy:vercel` |
| Smoke scripts | `scripts/smoke/` |
| Live QA docs | `docs/01-team/qa/` |
| Temporary browser logs | `_temp/browser/` and `_temp/logs/` |

Repository layout and placement rules live in `docs/00-overview/repository-structure.md`.
