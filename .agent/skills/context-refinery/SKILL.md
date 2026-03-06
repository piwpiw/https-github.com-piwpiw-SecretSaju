# SKILL.md: Context-Refinery — Autonomous Documentation & Map Sync

## Overview
`context-refinery` is an advanced automation skill designed to keep the project's documentation (`CONTEXT_ENGINE.md`, `DEEP_HISTORY.md`, `task.md`) in perfect synchronization with the codebase. It eliminates manual record-keeping by extracting structural changes directly from the filesystem and git logs.

---

## ⚙️ Capabilities
1. **Structural Analysis**: Scans `src/` for new components or pages and updates the **File Map** in `CONTEXT_ENGINE.md`.
2. **Rationale Extraction**: Analyzes recent `multi_replace_file_content` calls to draft entries for `DEEP_HISTORY.md`.
3. **Status Tracking**: Checks `[ ]` markers in `task.md` against implemented files to toggle `[x]`.
4. **Token Drift Detection**: Monitors `globals.css` for new design tokens and updates the UI inventory.

---

## 🛠️ Usage Patterns

### Scenario 1: Feature Completion
"I've added the new PillarVisualizer. Execute `context-refinery` to update the project map and history."

### Scenario 2: New Sprint Planning
"Define Wave 11 tasks. Run `context-refinery` to initialize the task list based on the new implementation plan."

---

## 📜 Execution Script (Internal Logic)
1. **Step 1**: Run `find_by_name` and `list_dir` on `src/`.
2. **Step 2**: Compare against `CONTEXT_ENGINE.md`'s §1 Logical Feature Map.
3. **Step 3**: Identify orphaned files or missing indices.
4. **Step 4**: Append latest `implementation_plan_vX.md` items to `task.md`.
5. **Step 5**: Summarize the "Why" into `DEEP_HISTORY.md`.
6. **Step 6**: Update `AI_BOOTSTRAP.md` Last Checkpoint and verify `ERROR_LEDGER.md` ❌ items.

---
*Created by Antigravity for the SecretSaju Advanced Agentic Era.*
