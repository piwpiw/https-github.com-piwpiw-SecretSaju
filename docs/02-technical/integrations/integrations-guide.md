# Integrations Guide

This document is the operational overview for the repository's main external integrations.

## Kakao Login

- Callback route: `src/app/api/auth/kakao/`
- Client flow entry: `src/components/auth/` and `src/app/auth/`
- Local base URL usually starts at `http://localhost:3000`

Checklist:
- Set Kakao JavaScript and REST keys
- Confirm redirect URIs match the current environment
- Verify login, logout, and callback recovery behavior

## MCP OAuth

- Callback route: `src/app/api/auth/mcp/callback/route.ts`
- Message mapping: `src/lib/auth/auth-callback-message.ts`
- PKCE and state artifacts are short-lived and must be validated strictly

Checklist:
- Confirm `CLIENT_ID`, auth URL, token URL, and redirect URI
- Keep client secret server-only
- Verify invalid `state` and invalid `code_verifier` flows

## Supabase

- Integration client: `src/lib/integrations/supabase.ts`
- Schema and migrations: `supabase/`

Checklist:
- Confirm project URL and anon key for client usage
- Keep service role key server-only
- Apply required migrations before release

## Payment

- Verification route: `src/app/api/payment/verify/route.ts`
- Helpers: `src/lib/payment/`

Checklist:
- Verify amount, order ID, and payment key matching
- Confirm success and fail pages map messages correctly
- Run focused route tests after contract changes

## Historical Tracking

- Operational history: [active-dispatch.md](../../archive/decision-history/active-dispatch.md)
- Error reference: [ERROR_CATALOG.md](../ERROR_CATALOG.md)
