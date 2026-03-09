# Scripts Index

Scripts are grouped by operational purpose. Do not add new one-off files at the `scripts/` root.

## Categories

| Folder | Purpose |
|---|---|
| `dev/` | Local dev bootstrap and preflight |
| `deploy/` | Deployment policy, rollout, health checks |
| `smoke/` | Auth, browser, and fast/full smoke checks |
| `db/` | Database setup, migration, and seed utilities |
| `qa/` | Audits, QA orchestration, validation helpers |
| `setup/` | Local environment and account setup helpers |
| `ops/` | Background jobs and recurring operational workers |
| `experiments/` | Non-canonical experiments and one-off probes |
| `lib/` | Shared script helpers |

## Common Commands

```bash
npm run dev:safe
npm run preflight:local
npm run smoke:auth
npm run smoke:fast
npm run smoke:full
npm run deploy
npm run qa
npm run migrate:db
```

## Direct Paths

| Need | Path |
|---|---|
| Safe local dev | `scripts/dev/dev-safe.js` |
| Local preflight | `scripts/dev/preflight-local.js` |
| Render deploy flow | `scripts/deploy/` |
| Smoke suite | `scripts/smoke/` |
| Full admin audit | `scripts/qa/admin-full-site-audit.mjs` |
| Zero-script QA | `scripts/qa/zero-script-qa.mjs` |
| Env verification | `scripts/setup/verify-env.js` |
| Background worker | `scripts/ops/background-worker.js` |

## Artifact Policy

- Script output that must not be tracked goes under `_temp/`.
- Raw smoke JSON, screenshots, and browser captures do not belong in `logs/` or `tmp/`.
- If a summary is worth preserving, move only the curated summary to `docs/archive/generated/`.
