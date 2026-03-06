# ⚙️ Secret Saju Operational Cycle

This document defines the high-level operational cycle for the 10-Team Agent Architecture.

## 1. The Daily Rhythm `#cycle`
1. **Context Warmup**: T1 Architect reviews `CONTEXT_ENGINE.md` and sets the day's priority.
2. **Dispatch**: Tasks are routed to T2-T10 based on domain (UI, Engine, Security).
3. **Synchronization**: Agents perform `npm run qa` before any commit.
4. **Log Update**: Completed tasks are recorded in the `Decision Log`.

## 2. Team Bandwidth & SLA `#sla`
| Team | Focus Area | Capacity | Est. Turnaround |
|------|------------|----------|-----------------|
| **T1** | Strategy / PRD | 🟢 Full | 10 mins |
| **T2** | FE / UI / Motion | 🟡 Med | 20 mins |
| **T3** | BE / API / DB | 🟡 Med | 20 mins |
| **T4** | Saju Core Engine | 🔴 Low (Complex) | 40 mins |
| **T9** | Security / Auth | 🔴 Low (Strict) | 30 mins |

## 3. Escalation Path `#escalation`
- **Logic Conflict**: If T4 (Engine) and T2 (FE) disagree on data structure -> Escalated to **T1 Architect**.
- **Security Block**: If T9 (Security) blocks a T3 (BE) route -> Requires `[RISK-xxx]` documentation in `CONTEXT_ENGINE`.
- **QA Failure**: 3 consecutive `npm run qa` failures trigger a mandatory `code-review` by T7 QA.

---
*Operationalized on 2026-03-03 using Agent V6 Protocol.*
