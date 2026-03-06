# Operation Notification Channels

This document outlines the channels and protocols for different incident categories.

## 📡 1. Primary Channels

- **Slack**: `#saju-alerts` (System failures/Error rates)
- **Email**: `ops@secretsaju.com` (Scheduled reports/General inquiries)
- **Notion**: [Operations Database](https://notion.so/secretsaju/ops) (Structured logs from `notion.ts`)

## 🚨 2. Escalation Matrix

| Category | Channel | Notify | RTO Policy |
|---|---|---|---|
| **Payment Failures** | Slack (High-Prio) | CFO, Tech Lead | < 15 Mins (Kill-switch if systemic) |
| **Authentication/OAuth** | Slack | FE/BE Leads | < 30 Mins (Fallback to fallback) |
| **CS Inquiry** | Notion/Email | CS Team | < 2 Hours |
| **Manual Payout** | Admin Dashboard | Finance | < 24 Hours |

## 🛠️ 3. Integration Status

- [x] Notion (Category: PAYMENT_EVENT, AUTH_EVENT)
- [ ] Slack Webhook (Planned)
- [ ] Email SMTP (Partially active for Welcome)

---
**Last Updated**: 2026-03-03
