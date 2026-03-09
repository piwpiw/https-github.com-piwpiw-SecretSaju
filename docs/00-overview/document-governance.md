# Document Governance

## Goal

Keep documentation aligned with the codebase without duplicate sources of truth.

## Source of Truth

| Domain | Source of truth | Owner |
|---|---|---|
| Product requirements | `docs/00-overview/MASTER_PRD.md` | PM |
| Roadmap and priority | `docs/00-overview/roadmap.md` | PM |
| Execution and screen contract | `docs/00-overview/execution-backlog-ko.md` | PM + FE Lead |
| Deployment operations | `docs/01-team/engineering/deployment-guide.md` | DevOps |
| Testing operations | `docs/01-team/engineering/testing-guide.md` | QA + Eng |
| Local development | `docs/01-team/engineering/local-dev-sop.md` | Eng Lead |
| Error catalog | `docs/02-technical/ERROR_CATALOG.md` | Eng |
| User verification | `docs/01-team/qa/USER_VERIFICATION.md` | QA |
| Dispatch history | `docs/archive/decision-history/active-dispatch.md` | PMO |

## Rules

- Keep one source-of-truth document per topic.
- Do not duplicate requirement text across multiple live docs.
- Historical notes belong in `docs/archive/decision-history/`.
- Generated summaries worth keeping belong in `docs/archive/generated/`.
- Raw logs, screenshots, and one-off reports belong in `_temp/`.

## Update Protocol

1. Classify the change as `feature`, `contract`, `ops`, or `bugfix`.
2. Update the single source-of-truth document for that topic.
3. Update `docs/index.md` only if the navigation surface changed.
4. If file locations changed, update the path in the same change.
5. If the change is historical context only, write it under `docs/archive/decision-history/`.

## Verification

- Broken internal doc links: `0`
- Duplicate live requirements: `0`
- Root operational docs stay limited to `README.md`, `AI_BOOTSTRAP.md`, `NEXT_ACTIONS.md`, `ERROR_LEDGER.md`
- Raw generated artifacts do not re-enter git outside curated archive snapshots
