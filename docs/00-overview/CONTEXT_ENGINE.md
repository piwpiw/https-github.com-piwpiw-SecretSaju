# Context Engine

This is the current feature-to-file map for SecretSaju.

## Core Product Areas

| Area | Primary files |
|---|---|
| Saju engine | `src/lib/saju/index.ts`, `src/core/api/saju-engine.ts`, `src/core/calendar/ganji.ts` |
| AI routing and persona | `src/core/ai-routing.ts`, `src/app/api/persona/route.ts`, `src/lib/reader/` |
| Auth | `src/app/api/auth/`, `src/lib/auth/`, `src/app/auth/callback/page.tsx` |
| Payment | `src/app/api/payment/`, `src/lib/payment/`, `src/app/payment/` |
| Shared app state | `src/lib/app/`, `src/components/layout/`, `src/components/profile/`, `src/components/payment/` |
| Result UI | `src/components/result/`, `src/components/ui/`, `src/app/page.tsx` |

## Directory Rules

| Path | Rule |
|---|---|
| `src/components/` | Domain folders only. No new orphan files at root. |
| `src/lib/` | Use domain folders: `app`, `auth`, `contracts`, `integrations`, `payment`, `reader`, `referral`, `saju`. |
| `tests/` | Use `logic`, `routes`, `ui`, `validation`, `fixtures`. |
| `scripts/` | Use grouped folders by purpose. |
| `_temp/` | Only place for raw local artifacts and scratch files. |

## Fast Lookup

| Need | Path |
|---|---|
| Payment verification route | `src/app/api/payment/verify/route.ts` |
| Payment verification helper | `src/lib/payment/payment-verify.ts` |
| Auth callback message mapping | `src/lib/auth/auth-callback-message.ts` |
| Payment failure message mapping | `src/lib/payment/payment-verify-message.ts` |
| Saju profile repository | `src/lib/saju/repositories/saju-profile.repository.ts` |
| Deployment scripts | `scripts/deploy/` |
| QA smoke scripts | `scripts/smoke/` |
| Curated QA archive | `docs/archive/generated/qa/` |
| Decision history | `docs/archive/decision-history/` |

## Non-Negotiable Rules

- Do not create `logs/`, `tmp/`, or root-level scratch files again.
- Keep all new tests under `tests/`. Do not recreate `src/__tests__/`.
- Do not add new docs outside `docs/`, except the root operational entrypoints.
- Do not add new flat files under `src/lib/` without a domain folder.
