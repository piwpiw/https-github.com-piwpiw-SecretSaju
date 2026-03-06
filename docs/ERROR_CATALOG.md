# 🐛 Secret Saju — Error Catalog (Structured) `#errors`

> [!TIP]
> This catalog is the source of truth for all known platform errors. When resolving a new issue, add it here immediately.

## 1. Metadata and UI Errors
| ID | Pattern/Symptom | Primary Cause | Standard Resolution |
|----|-----------------|---------------|---------------------|
| **ERR-001** | `window is not defined` | Accessing DOM in SSR | Add `"use client"` directive. |
| **ERR-003** | Motion frame drops | Framer Motion prop error | Verify `layoutId` or `key` props. |
| **ERR-004** | Garbled Korean text | Encoding mismatch (EUC-KR) | Force rewrite to UTF-8 using `write_to_file`. |
| **ERR-008** | Hydration Mismatch | Date/Time diff between S/C | Use `useEffect` or `suppressHydrationWarning`. |

## 2. API and Database Errors
| ID | Pattern/Symptom | Primary Cause | Standard Resolution |
|----|-----------------|---------------|---------------------|
| **ERR-002** | Supabase RLS Denied | Missing/Weak DB Policy | Update `schema.sql` and handoff to T9. |
| **ERR-007** | Route Contract (TS2344) | Exporting non-HTTP helpers | Remove `export` or move to `src/lib`. |
| **ERR-009** | 504 Gateway Timeout | Heavy scraper/engine logic | Optimize performance or move to Edge Functions. |
| **ERR-010** | Supabase Connection Auth | Expired/Missing token | Refresh session or check `.env` variables. |
| **ERR-013** | OAuth State Mismatch | State parameter diff on callback | Clear artifacts and enforce 10-min TTL logic (G-4). |
| **ERR-014** | PKCE Verifier Failure | code_challenge / verifier mismatch | Ensure verifier is preserved in browser cookie. |
| **ERR-015** | MCP User Sync Missing | Null providerUserId on response | Verify provider payload mapping in `auth-mcp.ts` (G-5). |
| **ERR-016** | Provider Profile Denied | Missing scope / access_denied | Check app settings in provider portal (access_denied). |

## 3. Business Logic and Core Engine
| ID | Pattern/Symptom | Primary Cause | Standard Resolution |
|----|-----------------|---------------|---------------------|
| **ERR-005** | `Cannot find name 'X'` | Hoisting issue in `saju.ts` | Move const/type declarations to top. |
| **ERR-006** | Duplicate Key in literal | Duplicate property keys | Clean up redundant keys for TS strict mode. |
| **ERR-011** | Toss Verify Failure | Invalid orderId or secret | Log details to Notion and check Toss Admin. |
| **ERR-012** | Saju Index Out of Bounds | PILLAR_CODES logic error | Verify 0-59 range mapping in `saju.ts`. |

---

## 🛠️ Management Runbook
- **Detection**: Use `npm run qa` or Vercel logs.
- **Logging**: All critical failures must be logged to Notion (via `notion.ts`).
- **Escalation**: Security or Payment flaws (ERR-011) must be escalated to T9 (Security/Ops) immediately.
