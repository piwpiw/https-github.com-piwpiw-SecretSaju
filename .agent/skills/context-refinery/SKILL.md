# context-refinery

Use when repository structure, feature maps, or operational docs drift from the codebase.

## Workflow
1. Compare current file layout with `docs/00-overview/CONTEXT_ENGINE.md` and `docs/index.md`.
2. Update only canonical docs.
3. Remove stale paths and duplicate references.
4. Verify with `rg`, lint, and typecheck when needed.
