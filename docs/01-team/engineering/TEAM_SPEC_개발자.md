# Developer Team Spec

## Mission

Implement product requirements safely across UI, route logic, auth, payment, and operational stability.

## Read First

1. [Repository Structure](../../00-overview/repository-structure.md)
2. [Feature Map](../../00-overview/CONTEXT_ENGINE.md)
3. [Execution Backlog](../../00-overview/execution-backlog-ko.md)
4. [Document Governance](../../00-overview/document-governance.md)

## Main Write Zones

- `src/app/`
- `src/components/`
- `src/lib/`
- `tests/`
- `docs/01-team/engineering/`

## Delivery Rules

- Keep route URLs and external contracts stable unless explicitly changed.
- Place new code in the correct domain folder.
- Add focused regression coverage for auth, payment, and route behavior.
- Record meaningful implementation batches in the dispatch history.

## Validation

- Minimum: `npm run lint`
- Shared logic or route changes: `npx tsc --noEmit`
- Auth/payment changes: targeted tests plus route verification

## Related Docs

- [Active Dispatch](../../archive/decision-history/active-dispatch.md)
- [Content Team Spec](../product/TEAM_SPEC_콘텐츠.md)
- [Deployment Guide](./deployment-guide.md)
- [Testing Guide](./testing-guide.md)
