# MCP Environment Specification

This document details the required environment variables for the Magic Capsule Platform (MCP) OAuth 2.1 integration.

## 🔑 1. Environment Variables

| Variable Name | Required | Frontend Access | Description | Example Value |
|---|---|---|---|---|
| `NEXT_PUBLIC_MCP_CLIENT_ID` | Yes | Yes | The client ID for the MCP OAuth client | `secret-saju-client-id` |
| `MCP_CLIENT_SECRET` | Yes | No | The client secret (Server-side only) | `mcp_sk_live_...` |
| `NEXT_PUBLIC_MCP_AUTH_URL` | Yes | Yes | The authorization endpoint URL | `https://auth.mcp.example.com/authorize` |
| `NEXT_PUBLIC_MCP_TOKEN_URL` | Yes | Yes | The token exchange endpoint URL | `https://api.mcp.example.com/token` |
| `NEXT_PUBLIC_MCP_USERINFO_URL` | Yes | Yes | The user profile endpoint URL | `https://api.mcp.example.com/userinfo` |
| `NEXT_PUBLIC_MCP_REDIRECT_URI` | Yes | Yes | The callback URI (must match portal) | `https://secretsaju.com/api/auth/mcp/callback` |
| `NEXT_PUBLIC_MCP_SCOPE` | No | Yes | Requested OAuth scopes (default: openid profile email) | `openid profile email` |

## 🛡️ 2. Security Configuration

- **PKCE**: Mandatory. The system automatically handles code generation and verification.
- **State**: Mandatory. Used to prevent CSRF.
- **Cookies**: 
    - `mcp_oauth_state`: HttpOnly, Lax, Secure (on production).
    - `mcp_code_verifier`: HttpOnly, Lax, Secure (on production).
    - TTL: Default 600 seconds.

## 🐛 3. Error Codes (McpCallbackErrorCode)

Refer to `src/lib/auth-mcp.ts` for current enum.

- `missing_required_params`: Code or state missing from URL.
- `invalid_oauth_state`: State mismatch or malformed.
- `expired_oauth_state`: Login session took too long (> 10 mins).
- `token_exchange_failed`: Provider rejected the code/verifier.
- `user_sync_failed`: Could not save user to Supabase.

## 🔄 4. Provider User ID Parsing Policy

We accept both integer and string IDs. All IDs are normalized to strings before database lookup/insertion.
Supported ID fields in payload (priority order):
`sub`, `id`, `external_id`, `provider_user_id`, or `kakao_id` (for legacy compatibility).

## 🛡️ 5. Data Privacy & Sanitization (G-12, G-15)

- **PII Masking**: When logging authentication events to Notion (or external services), email addresses must be masked (e.g., `te***@domain.com`).
- **XSS Prevention**: User nicknames provided by MCP must be sanitized to remove HTML tags before storage or display.
- **ReturnTo Persistence**: The `auth_return_to` path is stored in `localStorage` to ensure user flow continuity after authentication.

---
**Last Updated**: 2026-03-03 (Revision 2.1)
