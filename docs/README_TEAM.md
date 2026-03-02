# SecretSaju Team Operating Guide

## Goal
Keep implementation, documentation, and team execution synchronized so instructions can be issued quickly and executed without ambiguity.

## Team-Agent Operating Principles
- One requirement is defined once in one SOT document.
- Team docs consume the SOT by links, not copied text.
- Route/screen contracts are maintained only in `docs/00-overview/execution-backlog-ko.md`.
- Deployment and verification commands follow engineering guides only.

## Role-to-Document Map
| 팀역할 | 책임 범위 | Primary Doc | Secondary Doc |
|---|---|---|---|
| Product Planner | 기능 전략/우선순위/릴리즈 판단 | `docs/TEAM_SPEC_기획자.md` | `docs/00-overview/roadmap.md` |
| Designer | UI/UX 정책, 톤/컴포넌트 톤앤매너 | `docs/TEAM_SPEC_디자이너.md` | `docs/UI_UX_DESIGN_SPEC.md` |
| Developer | 화면/로직 구현, 인증/결제/운영 안정성 | `docs/TEAM_SPEC_개발자.md` | `docs/01-team/engineering/*.md` |
| Content Owner | 용어 정합성, 문구/콘텐츠 품질 | `docs/TEAM_SPEC_콘텐츠.md` | `docs/00-overview/execution-backlog-ko.md` |

## Fast Instruction Template
Use the format below for task requests:
1. Objective: what to change and why.
2. Scope: exact files/routes/components.
3. Constraints: what must not change.
4. Done Criteria: measurable acceptance checks.
5. Deadline/Priority: P0/P1/P2.

## Execution Command Baseline
| Situation | Command |
|---|---|
| Local fast check before implementation merge | `npm run deploy:local` |
| Local quality gate only | `npm run preflight:local` |
| Deterministic repro | `npm run preflight:local:serial` |
| CI-aligned precheck | `npm run pre-deploy:parallel` |
| Fast production deploy path | `npm run deploy:fast` |

## Documentation Update Rules
1. Check `docs/index.md` entry and target SOT owner first.
2. Edit exactly one SOT document for one requirement.
3. Reflect execution status in `docs/active-dispatch.md`.
4. Add only links in team docs when cross-team visibility is needed.
5. Keep this guide focused on operations only.

## Collaboration Handoff Format
- Context: what changed and why.
- Files: exact paths touched.
- Verification: commands run and result.
- Risks: known residual risk and mitigation.
- Next Action: owner and due date.

## Quick Links
- [Documentation Index](./index.md)
- [Document Governance](./00-overview/document-governance.md)
- [Execution Backlog (Route Contract)](./00-overview/execution-backlog-ko.md)
- [Active Dispatch](./active-dispatch.md)
- [Engineering Deployment Guide](./01-team/engineering/deployment-guide.md)
- [Engineering Testing Guide](./01-team/engineering/testing-guide.md)

---
**Last Updated**: 2026-03-02  
**Version**: 2.0 (Operational Sync)  
**Owner**: Product Operations

## Handoff Template (Latest)
- Context: what changed and why
- Files: exact paths touched
- Verification: commands run and results
- Risks: residual risk + mitigation
- Next Action: owner + due date
