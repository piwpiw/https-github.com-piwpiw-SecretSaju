# Engineering Guidelines

This guide defines the minimum engineering rules for implementation work.

## Read Order

1. [Repository Structure](../../00-overview/repository-structure.md)
2. [Feature Map](../../00-overview/CONTEXT_ENGINE.md)
3. [Master PRD](../../00-overview/MASTER_PRD.md)
4. [Blueprint](../../00-overview/BLUEPRINT.md)
5. [Error Catalog](../../02-technical/ERROR_CATALOG.md)
6. [Agent System](../../../.agent/AGENT_SYSTEM.md)
7. [Cost Rules](../../../.agent/COST_RULES.md)

## Core Rules

- Keep one source of truth per topic.
- Put new tests under `tests/` only.
- Put raw logs, screenshots, and temporary reports under `_temp/` only.
- Do not add new orphan files under `src/components/` or `src/lib/`.
- When file locations change, update the canonical docs in the same change.

## Delivery Rules

- Use the smallest change that closes the issue.
- Keep user-facing behavior stable unless the task explicitly changes it.
- Prefer targeted tests over broad rewrites.
- When auth, payment, or route contracts change, add regression coverage.

## Validation Baseline

- UI or copy change: `npm run lint`
- Route or shared library change: `npm run lint` and `npx tsc --noEmit`
- Auth or payment change: add focused tests and run them
- Structure change: run lint, typecheck, and a path scan

## Execution Record

- Record notable implementation batches in `docs/archive/decision-history/active-dispatch.md`.
- Keep operational rules centralized in `docs/00-overview/document-governance.md`.
