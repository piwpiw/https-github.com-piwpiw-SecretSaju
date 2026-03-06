# Secret Saju Operations Master Guide (V2)

This guide documents the critical operation protocols, monitoring metrics, and disaster recovery strategies for the platform.

## 🔑 1. Security & Rotation (DO-11)

- **Secret Rotation**: All provider secrets (Kakao, Google, MCP) must be rotated every **180 days**. 
- **Procedure**:
  1. Generate new secret in provider portal.
  2. Update Vercel/Render ENVIRONMENT variables.
  3. Deploy (Zero-downtime).
  4. Revoke old secret after 24 hours of stable monitoring.

## ⏱️ 2. Performance Thresholds (DO-12)

| Component | Target (p95) | Threshold (Critical) |
|---|---|---|
| **OAuth Redirect** | < 300ms | > 1000ms |
| **Token Exchange** | < 800ms | > 2500ms |
| **User Profile Sync** | < 500ms | > 1500ms |
| **Database Upsert** | < 50ms | > 200ms |

## 🚒 3. Disaster Recovery (DO-15, 16)

- **RTO (Recovery Time Objective)**: 30 Minutes.
- **RPO (Recovery Point Objective)**: 5 Minutes (Database replication lag).
- **Log Masking**: Ensure `mcp_access_token` and `refresh_token` are NEVER logged. Use `[REDACTED]` in structured logs (BE-16).
- **Kill-Switch**: If MCP auth failure rate > 15%, set `FEATURES.MCP = false` in `.env`.

## 📈 4. Monitoring Metrics (DO-18)

- **Auth Success Rate**: Daily target > 95%.
- **OAuth State Mismatch Rate**: Target < 0.5% (High rate indicates CSRF or browser cookie issues).
- **Token Error Rate**: Weekly dashboard (Grafana/Vercel) to track `ERR-013` to `ERR-016`.

## 🗺️ 5. Expansion Roadmap (DO-20)

- **Q2 2026**: Add Apple IdP support via MCP integration.
- **Q3 2026**: Implement biometric (WebAuthn) secondary auth for high-value wallet actions.
- **Q4 2026**: Decentralized ID (DID) export via MCP.

---
**Document Status**: Finalized
**Version**: 2.1
**Date**: 2026-03-03
