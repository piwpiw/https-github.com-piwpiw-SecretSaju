# SecretSaju Documentation Index

## Purpose
This index is the only entry point for documentation navigation.
Each domain keeps exactly one source-of-truth (SOT) document.

## Core SOT Map
| Domain | Source of Truth | Use Case |
|---|---|---|
| Product requirement | `docs/MASTER_PRD.md` | Product scope, phase, release requirement |
| Execution contract (route/page) | `docs/00-overview/execution-backlog-ko.md` | Screen goals, must-show elements, done criteria |
| Strategy roadmap | `docs/00-overview/roadmap.md` | Priority, milestone, sequence |
| Deployment runtime | `docs/01-team/engineering/deployment-guide.md` | Deploy process, command policy, recovery |
| Error and guardrail | `docs/ERROR_CATALOG.md` | Exception handling baseline |
| User verification | `docs/USER_VERIFICATION.md` | End-user QA and acceptance flow |
| Documentation policy | `docs/00-overview/document-governance.md` | SOT ownership and dedupe rules |
| Active task dispatch | `docs/active-dispatch.md` | Current wave, owner, handoff status |

## Engineering Runtime Docs
- [Deployment Guide](./01-team/engineering/deployment-guide.md)
- [Testing Guide](./01-team/engineering/testing-guide.md)
- [Onboarding](./01-team/engineering/onboarding.md)
- [Git Workflow](./01-team/engineering/git-workflow.md)

## Team Specs
- [TEAM_SPEC_기획자](./TEAM_SPEC_기획자.md)
- [TEAM_SPEC_개발자](./TEAM_SPEC_개발자.md)
- [TEAM_SPEC_디자이너](./TEAM_SPEC_디자이너.md)
- [TEAM_SPEC_콘텐츠](./TEAM_SPEC_콘텐츠.md)

## Fast Command Matrix
| Goal | Command | Notes |
|---|---|---|
| Local fast preflight | `npm run preflight:local` | lint + type-check in parallel |
| Local serial repro | `npm run preflight:local:serial` | deterministic repro for flaky cases |
| Local deploy precheck | `npm run deploy:local` | preflight + pre-deploy(skip build/tests) |
| Full pre-deploy parallel | `npm run pre-deploy:parallel` | env/config/migration + build/tests parallel |
| Fast production deploy path | `npm run deploy:fast` | prechecks + prebuilt deploy |

## Update Order (Mandatory)
1. Update one target SOT document only.
2. Update `docs/active-dispatch.md` status if scope/owner changed.
3. Update this index only for link or ownership changes.
4. Update team spec docs by link, not by duplicate requirements.

## Link Hygiene
- Use relative paths only.
- Do not add broken archive links to active sections.
- Keep duplicate policy text out of team docs; link governance instead.

---
**Last Updated**: 2026-03-01  
**Document Owner**: Product Operations + Engineering Lead  
**Next Review**: 2026-03-08
