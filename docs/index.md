# Documentation Index

Use this file as the entrypoint for repository navigation.

## Primary Entry Points

| Path | Role |
|---|---|
| `../AI_BOOTSTRAP.md` | Active implementation context |
| `../NEXT_ACTIONS.md` | Current work queue and priorities |
| `../ERROR_LEDGER.md` | Error history and mitigations |
| `00-overview/CONTEXT_ENGINE.md` | Feature-to-file map |
| `00-overview/repository-structure.md` | Canonical repository layout and placement rules |
| `00-overview/document-governance.md` | Documentation ownership and update rules |

## Live Documentation

| Folder | Content |
|---|---|
| `00-overview/` | PRD, roadmap, architecture-level overview, execution map |
| `01-team/` | Engineering, QA, operations, product, and team-facing SOPs |
| `02-technical/` | Architecture, integrations, core engine, deployment contracts |
| `03-business/` | Business strategy and growth docs |
| `05-external/` | External-facing materials |
| `06-resources/` | Shared reference assets and supporting material |

## Archives

| Folder | Content |
|---|---|
| `archive/legacy/` | Old setup and deployment docs kept for reference |
| `archive/decision-history/` | Historical AI and operational decision logs |
| `archive/generated/qa/` | Curated QA summaries worth preserving |
| `archive/generated/design-snapshots/` | Design capture snapshots kept in git |

## Fast Lookup

| Question | Path |
|---|---|
| Where is payment verification code? | `../src/app/api/payment/verify/route.ts`, `../src/lib/payment/payment-verify.ts` |
| Where are auth callback messages mapped? | `../src/lib/auth/auth-callback-message.ts`, `../src/app/auth/callback/page.tsx` |
| Where are deploy scripts? | `../scripts/deploy/` |
| Where are live QA docs? | `01-team/qa/` |
| Where are temporary browser logs? | `../_temp/browser/`, `../_temp/logs/` |

## Repository Rules

- Structural rules live in `00-overview/repository-structure.md`.
- Documentation ownership rules live in `00-overview/document-governance.md`.
- Generated raw output does not belong in `docs/`; keep it under `_temp/`.
- If a feature contract changes, update one source-of-truth document only.
