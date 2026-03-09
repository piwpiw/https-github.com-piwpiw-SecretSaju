# Screen Test Automation Decision

## 2026-03-06

- Goal: reduce wasted time in screen testing before admin fixes, deployment, and next UI loop.
- Decision: use deterministic Playwright-based smoke checks as the default gate; reserve GPT-5.4 computer-use style desktop control for exception investigation only.

## Why

- This repo already has Playwright MCP, CDP reuse, and smoke scripts.
- Browser automation is faster and more repeatable than model-driven desktop manipulation for regression gates.
- GPT-driven desktop control is still useful for exploratory UI investigation, third-party widgets, and selector-resistant flows.

## Local verification

- `scripts/smoke/mcp-browser-smoke.mjs` passed in a clean browser run at about 5.8s during direct benchmark on a healthy local server.
- Warm CDP reuse was roughly similar at about 5.7s; first CDP attach was slower.
- `scripts/smoke/smoke-admin-mode.mjs` was updated to inject admin bypass state at the context level so screen checks do not block on the login UI.
- `npm run smoke:fast` was added to run a shorter gate focused on admin and browser checks.

## Fast path

1. `npm run lint`
2. `npm run qa`
3. Start a clean production-like local server
4. `npm run smoke:fast -- --base-url <url> --email piwpiw@naver.com --password admin`
5. Run broader smoke/audit only before deploy or when auth/admin internals changed

## Important note

- For local production-like validation, prefer the standalone server output over ad-hoc long-running dev instances.
- If a route fails because of server/runtime state, do not spend time escalating to desktop-control automation first; fix the runtime baseline and rerun deterministic smoke.
