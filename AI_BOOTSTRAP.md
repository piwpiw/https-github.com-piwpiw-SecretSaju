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

- Manual: configure `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_KEY` in Vercel.
- Manual: verify end-to-end real payment flow with a live card.
- Automatic: keep route contracts, message mapping, and payment/auth validation paths covered by tests.

## Last Checkpoint

- Date: 2026-03-09
- By: Codex
- Completed:
  - Repository structure normalized around grouped `scripts/`, `tests/`, `src/components/`, and `src/lib/`
  - `logs/`, `tmp/`, root temp files, task-pool JSONL, and design captures moved out of the live tree
  - `README.md`, `docs/index.md`, `docs/00-overview/CONTEXT_ENGINE.md`, and script/doc governance updated to the new layout
- Remaining manual work:
  - Vercel production environment keys
  - Live payment E2E confirmation
