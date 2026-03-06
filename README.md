# 🔮 Secret Saju (시크릿사주)

> **Premium Fortune-Telling Platform — High-Precision Saju Engine & Immersive UI**

<p align="center">
  <strong>This project is orchestrated by a 10-Team Agent Architecture for rapid, high-quality delivery.</strong><br>
  All configurations, code, and documents are systematically managed.
</p>

---

## 📑 Essential Documents

| Document | Purpose |
|----------|---------|
| **[CONTEXT_ENGINE.md](./.agent/CONTEXT_ENGINE.md)** | **[CRITICAL]** Current project status, decision log, and file map. |
| **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | Technical layers, data flow, and agent roles. |
| **[MASTER_PRD.md](./docs/MASTER_PRD.md)** | Product requirements, roadmap, and business logic. |
| **[ERROR_CATALOG.md](./docs/ERROR_CATALOG.md)** | Known error patterns and standard solutions. |
| **[OPERATIONS.md](./docs/OPERATIONS.md)** | Operational cycle, SLAs, and escalation paths. |

---

## 🚀 Current State (Wave 5)

### ✅ Completed Milestones
- **Saju Engine (Wave 5)**: High-precision calculations based on 12 Solar Terms (Jeol-gi), Sinsal (Gods/Killers) expansion.
- **Crawler Layer**: DinnerQueen and Revu adapters for real-time campaign data integration.
- **Premium UI**: Jeomsin-inspired dark theme, glassmorphism, and Framer Motion animations.
- **Payment & Growth**: Toss Payments (Advanced Verify), Referral system, and Kakao Share API.

### 🔄 In Progress / Next Steps
- **AI Agent Integration**: Autonomous content generation for personalized fortune results.
- **Global Expansion**: Multi-language support and international payment gateways.
- **Data Analytics**: Advanced user behavior tracking and conversion optimization.

---

## 📂 Project Structure

```
SecretSaju/
├── .agent/                 # Agent orchestration (Context, Protocols)
├── docs/                   # Structured documentation (PRD, Arch, Guides)
├── scripts/                # Utility scripts (QA, Migrate, Deploy)
├── supabase/               # Database schema and migrations
├── src/
│   ├── app/                # Next.js App Router (Pages & API)
│   ├── components/         # Premium UI Components
│   ├── core/               # Pure logic & Math (Saju Engine)
│   ├── lib/                # Shared utilities & Adapters (Crawlers, Auth)
│   └── types/              # Unified TypeScript definitions
└── public/                 # Static assets
```

---

## 🔧 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Copy `.env.local.template` to `.env.local` and fill in the required keys:
- Supabase URL/Key
- Toss Payments Client/Secret Key
- Kakao JS/Rest API Key

### 3. Verification
Run the QA suite to ensure everything is correct:
```bash
npm run qa
```

### 4. Development
```bash
npm run dev:safe -- --port 3000 --auto-port
```

### 5. Browser MCP (Playwright)
Browser execution MCP is configured for Cursor in `.cursor/mcp.json` and also provided in root `.mcp.json`.

Manual run:
```bash
npm run mcp:browser
```

Quick check:
```bash
npx -y @playwright/mcp@latest --help
```

---

## 🛡️ Development Guidelines

1. **Context-First**: Always check `CONTEXT_ENGINE.md` before starting a task.
2. **Type Safety**: No `any`. Ensure all data structures follow `src/types/`.
3. **Pure Logic**: Saju core logic must remain pure (no UI/Window references).
4. **Agent Collaboration**: Respect team scopes (T1-T10) as defined in `ARCHITECTURE.md`.

---

<p align="center">
  <strong>Made with 🔮 by Bohemian Studio</strong><br>
  <sub>Version 5.0.0 | Last Updated: 2026-03-03</sub>
</p>
