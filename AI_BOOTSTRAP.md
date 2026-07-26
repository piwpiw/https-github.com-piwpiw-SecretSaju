# SecretSaju AI Bootstrap

Read this first for active implementation work.

## Identity

SecretSaju is a premium fortune-telling SaaS built on Next.js, Supabase, Tailwind, and a custom saju engine.

## Current Code Map

| Area | Primary paths |
|---|---|
| App router and API routes | `src/app/` |
| Domain components | `src/components/` |
| Shared libraries | `src/lib/` |
| Saju engine and calculations | `src/lib/saju/`, `src/core/` |
| Payment | `src/app/api/payment/`, `src/lib/payment/`, `src/app/payment/` |
| Auth | `src/app/api/auth/`, `src/lib/auth/`, `src/app/auth/` |
| Tests | `tests/logic/`, `tests/routes/`, `tests/ui/`, `tests/validation/` |
| Operational scripts | `scripts/dev/`, `scripts/deploy/`, `scripts/smoke/`, `scripts/qa/` |
| Documentation | `docs/index.md`, `docs/00-overview/CONTEXT_ENGINE.md`, `docs/00-overview/repository-structure.md` |

## Canonical Rules

- Repository layout and placement rules: `docs/00-overview/repository-structure.md`
- Documentation ownership and SOT rules: `docs/00-overview/document-governance.md`
- Feature-to-file map: `docs/00-overview/CONTEXT_ENGINE.md`

## Current Priorities

- Project is in **free open-launch mode** (`FREE_LAUNCH` flag, default ON): all premium/secret content unlocked, no payment required. See `docs/02-technical/FREE_LAUNCH_RUNBOOK.md` for full manual checklist.
- Manual: configure `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_KEY` in Vercel (still required for persona LLM responses).
- Manual: Toss payment keys and live-card E2E are **not needed while `FREE_LAUNCH` is on** — deferred until paid conversion (set `NEXT_PUBLIC_FREE_LAUNCH=false` then wire keys).
- Automatic: keep route contracts, message mapping, and payment/auth validation paths covered by tests.

## Last Checkpoint

- Date: 2026-07-26
- By: Claude
- **Verification rule (learned the hard way)**: verify with `npx next build` + `node .next/standalone/server.js`. `next dev` serves stale lazy-loaded chunks, and `next start` is unsupported with this project's `output: standalone` config (it silently served an old build). Both masked real bugs during this session.
- Completed (production-build verification pass, 2026-07-26):
  - **`FREE_LAUNCH` was always false in the browser** — `process.env.NEXT_PUBLIC_*` is only inlined when defined at build time, so leaving it unset (the "default on" intent) left the raw expression in the client bundle and silently re-locked every paywall. Now a literal `true` in `src/config/constants.ts`; also wired the two gates that had been missed (`AINarrativeSection`, `/fortune-readers`).
  - `/shop`: removed a dead "이 플랜 선택" CTA (a `<div>` with no handler inside a `cursor-pointer` `<label>`); shows the free-launch state instead
  - Home birth form: "시간 모름" toggle was a `<div onClick>` — keyboard-inaccessible despite changing the saju result. Now `<button role="checkbox" aria-checked>`.
  - `/my-saju/list`: "인연 네트워크" showed hardcoded fake people (김철수 85% 등) as the user's own relationships — now driven by real profiles with an empty state
  - New QA tools: `scripts/qa/interaction-smoke.mjs` (drives inputs + primary action per page), `scripts/qa/fake-button-scan.mjs` (finds dead / keyboard-inaccessible CTAs)
  - Verified on the standalone production build: 54/54 routes OK, interaction 18/18 error-free, fake-button scan clean, tsc 0, lint 0, tests 68/68, guard pass
- Completed earlier (free open-launch prep, 2026-07-13):
  - `FREE_LAUNCH` flag (`src/config/constants.ts`) added — opens `isUnlocked()` (jelly-wallet), `ResultCard` (secretUnlocked), and `SecretBlur` gates so all premium content is free
  - `vercel.json` `installCommand` fixed to `npm ci` (was excluding native optional deps and breaking the build; see ERROR_LEDGER E-006)
  - CI `deploy.yml` workflow fixed (unescaped backticks breaking `$GITHUB_STEP_SUMMARY`; see ERROR_LEDGER E-007)
  - Mobile perf: home First Load JS reduced 296→255 kB, third-party texture requests removed
  - Global widgets (weather, wallet, audio, user-sync) hardened for graceful degradation
  - Verified: production build green (105 pages), tsc 0, lint 0, tests 68/68
- Remaining manual work (see `docs/02-technical/FREE_LAUNCH_RUNBOOK.md`):
  - Vercel env vars (base URL, Supabase, Kakao login)
  - Kakao login + Supabase migrations applied to production
  - Cloudflare Workers Git integration disconnected (currently breaks every commit's build)
  - Post-deploy smoke checklist
