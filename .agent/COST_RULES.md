# Cost Rules

## Defaults
- Read as little as possible before acting.
- Prefer `rg` and targeted file reads over full file scans.
- Do not reload the same large file unless the task changed.
- For structural work, update the canonical structure and governance docs once instead of repeating notes across docs.

## Validation Budget
- Small UI copy or mapping change: lint or focused tests.
- Route, auth, payment, or schema change: lint, typecheck, focused tests.
- Repository structure change: lint, typecheck, main test suite, and path scan.
