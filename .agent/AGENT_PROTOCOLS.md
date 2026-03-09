# Agent Protocols

## Core Rules
- Load `docs/00-overview/CONTEXT_ENGINE.md` before substantial work.
- Treat `docs/00-overview/repository-structure.md` as the canonical repository placement rule set.
- Keep changes scoped to the requested task.
- Run the smallest validation set that proves the change.
- Update canonical docs when repository rules change.
- Prefer direct, short handoff notes over long summaries.

## Handoff Format
```json
{
  "from": "T2",
  "to": "T7",
  "reason": "UI changed and needs regression coverage",
  "files": ["src/components/result/ResultCard.tsx"],
  "validation": ["npm run lint", "npm run test"]
}
```

## Quality Gates
- Code change: lint or typecheck required.
- Route or contract change: targeted tests required.
- Structure change: update `docs/00-overview/repository-structure.md`, `docs/index.md`, and `docs/00-overview/CONTEXT_ENGINE.md`.
