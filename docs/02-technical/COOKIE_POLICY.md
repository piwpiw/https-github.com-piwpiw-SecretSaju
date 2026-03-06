# Secret Saju Cookie Policy (Technical)

This document defines the lifecycle and security requirements for all cookies used within the platform.

## 🍪 1. Authentication Cookies

| Cookie Name | Purpose | Expiration (TTL) | Security Flags |
|---|---|---|---|
| `secret_saju_user_data` | Parsed user profile (nickname, provider) | 7 Days | HttpOnly: No, SameSite: Lax, Secure: Prod |
| `secret_saju_kakao_token` | Kakao Access Token | Session / 1 Day | HttpOnly: Yes, SameSite: Lax, Secure: Prod |
| `mcp_access_token` | MCP Access Token | Dependent on Provider | HttpOnly: Yes, SameSite: Lax, Secure: Prod |
| `mcp_refresh_token` | MCP Refresh Token | Usually 30+ Days | HttpOnly: Yes, SameSite: Lax, Secure: Prod |

## 🛡️ 2. OAuth Flow Artifacts (Ephemeral)

| Cookie Name | Expiration | Purpose |
|---|---|---|
| `mcp_oauth_state` | 10 Minutes | CSRF protection for OAuth callback |
| `mcp_code_verifier` | 10 Minutes | PKCE verifier for token exchange |

## ⚖️ 3. Security Compliance (G-10)

All sensitive cookies must adhere to the following:
- **SameSite=Lax**: Required for OAuth redirects to work while preventing most CSRF.
- **Secure**: Must be set when `NEXT_PUBLIC_BASE_URL` is HTTPS (Production/Staging).
- **HttpOnly**: Mandatory for Access/Refresh tokens to prevent XSS-based theft.

## 🧹 4. Purge Policy (G-6)

"Two-Way Purge" ensures that both:
1. Server-side cookies are cleared (via `NextResponse.cookies.set('', { maxAge: 0 })`).
2. Client-side storage (LocalStorage/SessionStorage) is cleared on logout.

---
**Last Updated**: 2026-03-03
