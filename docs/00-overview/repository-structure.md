# Repository Structure

This is the canonical source of truth for repository layout and file placement rules.

## Root Layout

```text
src/        app code, API routes, components, shared libraries
tests/      logic, route, UI, validation, and fixture tests
scripts/    grouped operational scripts by category
docs/       live docs, archives, and curated generated summaries
public/     runtime static assets
supabase/   schema and migrations
data/       build-time reference data
_temp/      local-only scratch, logs, reports, screenshots
```

## Placement Rules

- Runtime artifacts go only under `_temp/`.
- New docs go under `docs/`, except `README.md`, `AI_BOOTSTRAP.md`, `NEXT_ACTIONS.md`, and `ERROR_LEDGER.md`.
- New tests go under `tests/`.
- `src/lib/` is domain-grouped: `app`, `auth`, `contracts`, `integrations`, `payment`, `reader`, `referral`, `saju`.
- `src/components/` is domain-grouped: `auth`, `layout`, `payment`, `profile`, `result`, `shared`, `system`, plus feature folders already in use.
- `scripts/` is grouped by purpose: `dev`, `deploy`, `smoke`, `db`, `qa`, `setup`, `ops`, `experiments`.

## Fast Lookup

| Need | Path |
|---|---|
| Payment verify route | `src/app/api/payment/verify/route.ts` |
| Payment verify helper | `src/lib/payment/payment-verify.ts` |
| Auth callback messages | `src/lib/auth/auth-callback-message.ts` |
| Payment failure messages | `src/lib/payment/payment-verify-message.ts` |
| Deploy scripts | `scripts/deploy/` |
| Smoke scripts | `scripts/smoke/` |
| Live QA docs | `docs/01-team/qa/` |
| Temporary browser logs | `_temp/browser/`, `_temp/logs/` |

## Change Protocol

1. If a file location changes, update this document in the same change.
2. If a rule changes, update this document and `docs/index.md`.
3. Do not restate placement rules in multiple live docs unless a short pointer is enough.
