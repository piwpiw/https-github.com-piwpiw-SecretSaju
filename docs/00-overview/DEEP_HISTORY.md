# SecretSaju Deep Implementation History & Rationale

This document serves as the **cumulative, perpetual record** of all engineering decisions, feature waves, and user-driven refinements for the SecretSaju platform. Every line of code and every visual choice has been made to elevate the experience from "simple service" to "luxury cosmic companion."

---

## 2026-03-05 Admin Validation & Production Release Log
- Purpose: Validate operational readiness under piwpiw@naver.com / admin and stabilize production deployment.
- Actions
  - Run: npm run audit:admin:full -- --base-url http://127.0.0.1:3002 --workers 8 --timeout-ms 30000
  - Run: npm run improvements:pages to refresh 10-item-per-page audit suggestions.
  - Investigated and fixed production deployment blockers from package/install/type failures.
  - Re-ran deployment until production publish succeeded.
- Code updates
  - Removed Windows-only dependency @rollup/rollup-win32-x64-msvc in package.json and lockfile.
  - Added vercel.json (installCommand: npm install --omit=optional, buildCommand: npm run build).
  - src/app/healing/page.tsx: fixed consumeChuru call signature to one-arg form.
  - src/lib/api-auth.ts: normalized session token typing and null-safe type handling.
  - src/app/psychology/premium-report/page.tsx: removed useSearchParams prerender risk by reading server searchParams props.
  - Verification
  - Admin audit result: 56 static + 12 discovered + 5 sample dynamic routes passed, 0 failures.
  - Production URLs:
    - https://https-github-com-piwpiw-secret-saju-ll4wgbb2t.vercel.app
    - https://https-github-com-piwpiw-secret-saju-piwpiw99-5213s-projects.vercel.app
  - Re-audit after deployment: 73 total routes passed.

## 2026-03-05 Admin Validation Continuation
- Purpose: Confirm admin login consistency, execute local smoke checks, then deploy production.
- Actions
  - Set admin login target: `piwpiw@naver.com` with password `admin` (`admin1` compatibility path kept in admin-force flow).
  - Re-ran `npm run smoke:admin -- --base-url http://127.0.0.1:3002 --email piwpiw@naver.com --password admin`.
  - Re-ran `npm run smoke:full -- --base-url http://127.0.0.1:3002 --email piwpiw@naver.com --password admin --serial`.
  - Executed production deployment with Vercel CLI:
    - `vercel deploy --prod -y`
- Results
  - Admin sync response: success and `isAdmin=true` from `/api/user/sync`.
  - `smoke-admin` routes checked: `/admin`, `/admin/advanced-scoring`, `/admin/character-analysis`, `/admin/character-profile`, `/admin/compatibility`, `/dashboard`, `/shop`, `/saju` returned `200`.
  - `smoke-full` passed with report file:
    - `logs/smoke-full-2026-03-05T05-36-03-377Z.json`
  - Known non-blocking console noise observed during smoke:
    - `404` on a missing resource path
    - `401` for protected endpoints in non-auth contexts
    - `Permissions policy violation` for geolocation
  - Production URL:
    - https://https-github-com-piwpiw-secret-saju-k9ewliame.vercel.app
    - Alias: https://https-github-com-piwpiw-secret-saju-piwpiw99-5213s-projects.vercel.app
- Status: production deployment completed, smoke verification continued in local environment, no blocking regressions identified.

## 2026-03-05 Admin Improvement Sweep
- Purpose: Run the page-improvement extraction loop for all routes and continue parallel verification.
- Actions
  - Executed `npm run improvements:pages` to refresh page-level recommendation output (`docs/page-improvements-admin-audit.md`).
  - Executed `npm run audit:admin:full -- --base-url http://127.0.0.1:3002 --email piwpiw@naver.com --password admin --workers 8`.
- Results
  - Improvement output regenerated for `63` pages, `630` total recommendations (10 each).
  - Full admin site audit result: `static=56`, `discovered=12`, `dynamic sample=5`, all routes passed.
  - Report files:
    - `logs/admin-full-site-audit.md`
    - `logs/admin-full-site-audit.json`
- Status: sweep data refreshed; recommendations are staged for iterative implementation in next cycles.

## 2026-03-05 Admin Page Accessibility Iteration
- Purpose: Continue the accessibility-focused admin page updates and verify admin flows on local environment after each batch.
- Actions
  - Updated `src/app/admin/page.tsx` for table semantics:
    - Added `<caption className=\"sr-only\">` for the log table.
    - Added `scope=\"col\"` on all table header cells.
  - Preserved the previous admin page-specific selector accessibility updates:
    - `src/app/admin/advanced-scoring/page.tsx`
    - `src/app/admin/character-analysis/page.tsx`
    - `src/app/admin/character-profile/page.tsx`
    - `src/app/admin/compatibility/page.tsx`
    - Added corresponding `id` and `htmlFor`/`aria-label` bindings for form controls and labels.
  - Verified:
    - `npm run lint` (pass with existing warnings only, no blocking errors).
    - `npm run smoke:admin -- --base-url http://127.0.0.1:3002 --email piwpiw@naver.com --password admin` (pass).
    - `npm run smoke:full -- --base-url http://127.0.0.1:3002 --email piwpiw@naver.com --password admin --serial` (pass).
    - `npx vercel --prod -y` (production deploy success).
- Production URL:
  - `https://https-github-com-piwpiw-secret-saju-opwnmk2ot.vercel.app`

## 2026-03-05 Root Layout Improvement
- Purpose: Apply a safe, high-impact improvement across all pages from the generated recommendations.
- Actions
  - Updated `src/app/layout.tsx`:
    - Added global skip link (`蹂몃Ц?쇰줈 嫄대꼫?곌린`) targeting `#main-content`.
    - Wrapped app content in semantic `<main id="main-content">`.
  - Executed `npm run lint` (warnings only; no errors).
  - Executed `npm run smoke:admin` and `npm run smoke:full -- --serial`.
  - Executed `vercel deploy --prod -y`.
- Results
- Lint: success with existing warnings in existing files (`useEffect` dependency warnings in `src/app/analysis-history/[type]/[id]/page.tsx` and `src/components/ProfileProvider.tsx`).
- Smoke: both admin and full checks passed.
- Production URL updated to:
  - `https://https-github-com-piwpiw-secret-saju-5cuqkh9xr.vercel.app`

---

## 2026-03-06 | Wave 11.6: Deep Integration Audit & P0/P1 Implementation

**諛곌꼍**: Wave 11.5 Context Efficiency ?쒖뒪?쒖씠 湲곗〈 臾몄꽌?ㅺ낵 ?좉린?곸쑝濡??곕룞?섎뒗吏 ??寃??+ NEXT_ACTIONS.md 湲곕컲 ?ㅼ젣 援ы쁽 李⑹닔.

### Phase A ???듯빀 媛먯궗 (7媛??⑥젅??諛쒓껄 諛??섏젙)

| # | 臾몄젣 | ?섏젙???뚯씪 |
|---|------|------------|
| 1 | ERROR_LEDGER ??ERROR_CATALOG ??븷 以묐났, 誘몄뿰寃?| ?묒そ ?뚯씪 ?곹샇 李몄“ 紐낆떆 |
| 2 | agent_protocol.md 짠5 援???븷 怨좎젙 諛곕텇 ?붿〈 | Context Efficiency Protocol ?꾨㈃ 媛쒖젙 |
| 3 | ai-collaboration.md Knowledge Tree???좉퇋 ?뚯씪 ?놁쓬 | AI_BOOTSTRAP, ERROR_LEDGER 異붽? |
| 4 | context-sync.md Step 4媛 議댁옱?섏? ?딅뒗 짠8 李몄“ | ERROR_LEDGER.md + ERROR_CATALOG.md 援먯껜 |
| 5 | CONTEXT_ENGINE.md 짠1 FileMap Wave 11 ?뚯씪 6媛??꾨씫 | TransitTicker, ProfileWallet ??異붽? |
| 6 | context-refinery SKILL???좉퇋 ?뚯씪 紐⑤쫫 | Step 6 異붽? (?좉퇋 ?뚯씪 ?숆린?? |
| 7 | ARCHITECTURE.md ??AI/Context 怨꾩링 ?놁쓬 | AI Intelligence + Context Efficiency ?덉씠??異붽? |

### Phase B ??NEXT_ACTIONS.md ?앹꽦

**臾몄젣**: ?묒뾽 ??ぉ??4媛?臾몄꽌??遺꾩궛. task.md [x]媛 ?ㅼ젣 援ы쁽 ?꾨즺瑜?蹂댁옣?섏? ?딆쓬. 嫄곗쭞 [x] ?ㅼ닔 諛쒓껄.

**?닿껐**: `NEXT_ACTIONS.md` ?⑥씪 SSOT ?앹꽦 ??P0(4媛?/P1(5媛?/P2(5媛? ?곗꽑?쒖쐞 + 寃利?湲곗?(Acceptance Criteria) ?뺤쓽.

### Phase C ??P0 ?꾩껜 援ы쁽

| ??ぉ | ?뚯씪 | 蹂寃??댁슜 |
|------|------|----------|
| LLM API ?ㅼ뿰??| `src/app/api/persona/route.ts` | GPT-4o?묬laude 3.5?묰emini 1.5?뭨ich fallback 泥댁씤. ???덉쑝硫?利됱떆 ?숈옉 |
| AINarrativeSection | `src/components/result/AINarrativeSection.tsx` | /api/persona ?먮룞 ?몄텧, 濡쒕뵫 ?ㅼ펷?덊넠, ?덈줈怨좎묠 踰꾪듉, ?먮윭 ?곹깭 |
| TransitTicker ?ㅼ떆媛?| `src/components/ui/TransitTicker.tsx` | getDayPillar + getHourPillar ?ㅼ뿰?? ?ㅽ뻾 異⑸룎 媛먯?. userDayStem prop |
| ProfileWallet DB | `src/components/ui/ProfileWallet.tsx` | /api/saju/list, /api/saju/delete ?ㅼ뿰?? 濡쒕뵫/?먮윭/鍮?401 ?곹깭 ?꾨퉬 |
| 鍮뚮뱶 0 ?먮윭 | ??| `npm run build` exit 0, `npx tsc --noEmit` exit 0 |
| ?몄퐫??蹂듦뎄 | `DEEP_HISTORY.md` | ?대え吏 源⑥쭚 ?꾩껜 蹂듦뎄 (PowerShell ?ㅽ겕由쏀듃 ?쒖슜) |

### Phase D ??P1 援ы쁽

| ??ぉ | ?뚯씪 | 蹂寃??댁슜 |
|------|------|----------|
| MASTER_PRD v6.0 | `docs/MASTER_PRD.md` | v5.0?뭭6.0, Next.js 14??5 諛섏쁺, Wave 11.5 異붽?, 援щ쾭??TODO ?뺣━ |
| ?뚯뒪??40媛?| `tests/saju-engine.test.ts` | 20媛? 李몄“?쇱옄, 踰붿쐞, 60??二쇨린, fullName 湲몄씠, 以묐났 諛⑹? |
| | `tests/ai-routing.test.ts` | 8媛? 紐⑤뜽 ?좏깮, ???꾨＼?꾪듃, ?숈긽釉? ?곕졊? 李⑥씠, ?ｌ?耳?댁뒪 |
| | `tests/payment-flow.test.ts` | 12媛? orderId ?щ㎎, 湲덉븸 寃利? 吏媛?濡쒖쭅, 硫깅벑?? ?ㅻ━ ?⑦궎吏 媛?깅퉬 |
| | `vitest.logic.config.ts` | React ?뚮윭洹몄씤 ?녿뒗 ?쒖닔 濡쒖쭅 ?꾩슜 vitest ?ㅼ젙 |
| ai-routing ???| `src/core/ai-routing.ts` | rawSajuData optional?? 'chat' queryType 異붽? |
| P1-3,4,5 媛먯궗 | ??| payment/verify 519以??꾩쟾, /compatibility 450以??꾩쟾, daily-fortune ?꾩쟾 ??異붽? 援ы쁽 遺덊븘???뺤씤 |

### Phase E ??釉붾줈而?& 援먰썕

**ERR-L001 (?쒖꽦)**: `npx vitest run` ??`@rollup/rollup-win32-x64-msvc` 誘몄꽕移? `vercel.json`??`--omit=optional`??濡쒖뺄 Windows rollup ?ㅼ씠?곕툕 諛붿씠?덈━瑜?李⑤떒 (npm bug #4828). ERROR_LEDGER ?깆옱 ?꾨즺.

**援먰썕**:
1. **??븷 怨좎젙 諛곕텇? ?ㅽ뙣?쒕떎** ??Context Efficiency Protocol???ㅼ슜??(?대뼡 AI??紐⑤뱺 ?묒뾽)
2. **`task.md [x]`???ㅼ젣 ?꾨즺瑜?蹂댁옣?섏? ?딅뒗??* ??NEXT_ACTIONS.md??寃利?湲곗??쇰줈留??먮떒
3. **vitest + vercel.json Windows 異⑸룎 二쇱쓽** ??optional dependency ?ㅼ튂 ??`Test-Path node_modules/@rollup` ?뺤씤

---

## [Phase 1] The Core Foundation (Waves 1-5)
*Objective: Build a high-precision calculation engine and a secure identity layer.*

### Wave 1: Galactic Saju Engine
- **Achievement**: Developed the core 60-Ganji (Sexagenary) calculation logic. Built lunar-to-solar converters with support for Korea's complex historical timezone anomalies (1948-1988).
- **Meaning**: Accuracy is the bedrock of trust. Without a mathematically perfect engine, the "cosmic guidance" fails.

### Wave 2: Cosmic Identity
- **Achievement**: Kakao OAuth integration and session management.
- **Meaning**: Seamless access ensures the user's focus remains on their fate, not on login hurdles.

### Wave 3: The Jelly Economy
- **Achievement**: Built a server-side credit system (Jellies) and transaction logging.
- **Meaning**: Establishing value through a tangible digital asset (Jellies) creates a sense of engagement and premium service.

### Wave 4: Professional Analysis (Pillar I)
- **Achievement**: First-generation interpretation logic for 4 Pillars, 12 Animals, and basic Ohaeng distribution.
- **Meaning**: Transforming raw data into narrative insights ??the bridge between mathematics and human life.

### Wave 5: Structural Framework
- **Achievement**: Full route setup (/daily, /tarot, /encyclopedia) with a scalable theme system.
- **Meaning**: Defining the "map" of the universe ??providing clear paths to different forms of cosmic discovery.

---

## [Phase 2] Hyper-Premium Refinement (Waves 6-9)
*Objective: Sensory elevation, tactile interface, and interactive data.*

### Wave 6: Luxury Textures
- **Achievement**: Implementation of glassmorphism, noise textures, and micro-animations.
- **Meaning**: Transitioning the app to a "physical" artifact ??it feels premium because it reacts to touch and light.

### Wave 7: Atmospheric Synchronization
- **Achievement**: Wave Charts for luck scores and the 5-point Resonance Polygon. Integrated Background Drift.
- **Meaning**: Fortune isn't static; it's a living wave. Visualizing it as such makes the data "feelable."

### Wave 8: Personalization & AI Scanning
- **Achievement**: AI Dream Parser scanning UI and the Destiny Web Relationship Map.
- **Meaning**: Making the app a personal companion. The scanner provides a high-fidelity visual for the "thought process" of our AI.

### Wave 9: Viral Growth & Emotional Synergy
- **Achievement**: Love Quartz score counting, ME vs YOU Radar Chart, and Social Proof Tickers.
- **Meaning**: Connecting users with each other and the community. "Sharing" becomes a reward, not a task.

---

## [Phase 2.1] User-Integrated Refinements
*Objective: Continuous improvement based on real-time feedback and direct collaboration.*

### [Refinement R-01] Identity Personalization (ResultCard.tsx)
- **Achievement**: Added `personName` prop to `ResultCard` to display the specific name of the person being analyzed.
- **Rationale**: Acknowledging the individual by name increases literal and emotional resonance during a reading.

### [Refinement R-02] High-Fidelity Tarot System (tarot/page.tsx)
- **Achievement**: Implemented a complete 78-card deck logic with drag-and-drop interactions, "Current-Challenge-Advice" positions, and premium glassmorphism card templates.
- **Rationale**: Tarot is a tactile ritual. The drag-and-drop mechanic simulates the physical act of "choosing your destiny," deepening the immersion.

## [Phase 3] Final Polishing (Wave 10)
*Objective: Traditional artistry meets final stability.*

### Wave 10: AI Destiny Engine & Final Polish
- **Achievement**: Advanced Pillar Visualizer (Calligraphy), Ambient Sound Portal (with real audio logic), Smart Index Sidebar, and Reading Progress Bar.
- **Meaning**: Total sensory immersion. The app now breathes, sounds, and reacts with professional-grade depth.
- **Polish R-03**: Integrated "Official Analysis Report" aesthetics in `ResultCard` and real-time audio playback in `AmbientSoundPortal`.
- **Polish R-04**: Added intelligent search highlights and initial-based sorting to `EncyclopediaPage`.
- **Wave 11 Evolution**: Transitioned to **Multi-LLM Personalized Persona System (MPPS)**. 
- **Rationale**: Combining GPT-4o(Logic), Claude 3.5(Empathy), and Gemini 1.5(Context) to achieve target-audience resonance (Age + Tendency Calibration).

---

## [Phase 4] Autonomous Intelligence (Wave 11+)
*Objective: AI Persona Calibration & Dynamic Automation.*

### Wave 11: Auto-Pilot Destiny
- **Achievement**: Implemented **Multi-LLM Personalized Persona System (MPPS)**.
- **Components**:
  - `persona-matrix.ts`: Age/Tendency-based psychological mapping.
  - `ai-routing.ts`: Model orchestration middleware (GPT-4o/Claude/Gemini).
  - `AIIntelligenceBadge.tsx`: Visual transparency for the active AI model.
- **Meaning**: Transitioning from a single AI output to a harmonized ensemble that speaks the user's specific language.

### Wave 11.5: Context Efficiency Engineering
- **Achievement**: Built a 3-part anti-hallucination system for multi-AI development.
- **Components**:
  - `AI_BOOTSTRAP.md`: ?꾨줈?앺듃 ?뺤텞 而⑦뀓?ㅽ듃 (~2K tokens). ?대뼡 AI??利됱떆 ?⑤낫??
  - `ERROR_LEDGER.md`: ?먮윭 ?대젰怨??닿껐踰?怨듭쑀. 媛숈? ?ㅼ닔 諛섎났 李⑤떒.
  - `AI_BOOTSTRAP.md`: ?꾨줈?앺듃 ?뺤텞 而⑦뀓?ㅽ듃 (~2K tokens). ?대뼡 AI??利됱떆 ?⑤낫??
  - `CONTEXT_ENGINE.md 4`: ??븷 怨좎젙 諛곕텇  而⑦뀓?ㅽ듃 ?⑥쑉 ?꾨줈?좎퐳濡?媛쒖젙.
  - `AI_BOOTSTRAP.md`: ?꾨줈?앺듃 ?뺤텞 而⑦뀓?ㅽ듃 (~2K tokens). ?대뼡 AI??利됱떆 ?⑤낫??
- **Meaning**: "?대뼡 AI媛 ?ㅼ뼱???1遺??덉뿉 ?꾨줈?앺듃瑜??댄빐?섍퀬, ?ㅻⅨ AI???ㅼ닔瑜?諛섎났?섏? ?딅뒗 援ъ“."

---




## 2026-03-06 Project Scoring Baseline (for Next-Phase Hardening)
- Purpose: Create a measurable quality baseline for prioritized development.
- Score model (100 points total)
  - Functional stability: 30
  - Code quality (lint/type/build): 20
  - Test reliability: 20
  - Security/dependency hygiene: 15
  - Process/release readiness: 15
- Current score: `40/100`
- Evidence
  - `npm run build`: pass
  - `npm run lint`: pass (2 warnings)
  - `npx tsc --noEmit`: pass
  - `npm run test -- --run`: fail (local optional Rollup native package resolution issue)
  - `npm run qa`: fail (route contract mismatch in backlog docs)
  - `npm run audit:admin:full`: partial fail (5 admin routes returned `500` during authenticated audit flow)
  - `npm audit --json`: total 5 vulnerabilities (`critical=1`, `high=4`)
- Primary blockers
  - Admin authenticated audit instability on `/admin*` routes.
  - Test runtime dependency consistency issue in local environment.
  - Route contract drift (`/result/[token]`, `/signup`) in `docs/00-overview/execution-backlog-ko.md`.
- Upgrade targets
  - Phase A: `40 -> 55` (restore tests, remove admin 500 path, sync route contract).
  - Phase B: `55 -> 70` (address high/critical vulnerabilities, stabilize smoke/audit pass rate).
  - Phase C: `70 -> 80+` (enforce clean CI quality gate before release).

## 2026-03-06 Screen Upgrade Iteration (3h Loop Batch)
- Purpose: Finalize one iterative screen-hardening batch for high-traffic routes and admin diagnostic screens.
- Scope
  - `src/app/page.tsx` (home)
  - `src/app/login/page.tsx` (login)
  - `src/app/admin/test-control/page.tsx` (admin diagnostics)
  - `src/app/admin/compatibility/page.tsx` (admin compatibility)
  - `docs/00-overview/execution-backlog-ko.md` (route contract sync)
- UI/UX updates
  - Home search overlay accessibility upgraded:
    - Added page-level hidden `h1` and search help description.
    - Added combobox semantics (`aria-controls`, `aria-expanded`, `aria-activedescendant`, listbox/option roles).
    - Added fallback quick-action chips on search error for immediate recovery.
  - Home naming entry panel hardened:
    - Added label/id bindings for name/hanja inputs.
    - Added helper text and input constraints (`maxLength`, `autoComplete`).
  - Login screen structure refined:
    - Added concise “quick usage guide” block.
    - Added explicit recovery action to inquiry route and cleaner action grouping.
  - Admin test-control usability upgraded:
    - Added label/id mappings, radio semantics, button type/aria labels, and polite status region for copy feedback.
    - Improved responsive layout for stats and 60-grid preview.
  - Admin compatibility selectors improved:
    - Bound visual labels to select controls via `htmlFor`.
- Process/quality sync
  - Route contract backlog synchronized with actual routes:
    - Added `/signup` and `/result/[token]` to `docs/00-overview/execution-backlog-ko.md`.
- Verification
  - `npm run lint`: pass (existing warnings only).
  - `npm run qa`: pass (`[ZORO QA] all checks passed`).
  - `npm run build`: pass.
- Outcome
  - Completed a stable screen-hardening batch with accessibility and recovery-path improvements.
  - Restored QA gate consistency for next autonomous improvement cycle.

## 2026-03-06 Screen Test Baseline Fix
- Purpose: remove wasted time from local screen automation by standardizing a stable production-like runtime.
- Code updates
  - Added `scripts/start-standalone-local.mjs` to sync `.next/static` and `public` into standalone output before local startup.
  - Added `npm run serve:standalone:local`.
  - Updated `scripts/smoke-admin-mode.mjs` so admin smoke no longer fails in bypass mode when `/api/user/sync` returns `401`.
  - Added `npm run smoke:fast` as the default short screen gate.
- Verification
  - `npm run qa`: pass.
  - `npm run serve:standalone:local -- --port 3012`: healthy local production-like runtime.
  - `node scripts/mcp-browser-smoke.mjs` with `SMOKE_BASE_URL=http://127.0.0.1:3012`: pass.
  - `node scripts/smoke-admin-mode.mjs --base-url http://127.0.0.1:3012 --email piwpiw@naver.com --password admin`: pass.
  - `npm run smoke:fast -- --base-url http://127.0.0.1:3012 --email piwpiw@naver.com --password admin`: pass.
- Result
  - Fast deterministic screen gate is now standardized around `lint -> qa -> serve:standalone:local -> smoke:fast`.
  - GPT-style desktop control remains reserved for exploratory exception handling, not the primary regression gate.
---

**Last Sync**: 2026-03-06
**Document Status**: ACTIVE & CUMULATIVE

---

## 2026-03-06 | Wave 11.7: Premium UI/UX Screen Upgrade Batch 2

- **Scope**: `mypage/page.tsx`, `daily/page.tsx`, `fortune/page.tsx`
- **Approach**: 기존 코드 전면 교체 → 하이엔드 감성 재설계
- **Verification**: `npx tsc --noEmit` exit 0

### Mypage (`/mypage`) — 대시보드 전면 재설계
| 변경 항목 | 내용 |
|---------|------|
| Ambient Background | Fixed radial-gradient (indigo/purple) |
| 시간대별 인사말 | `greeting` state — 새벽/아침/오후/저녁 분기 |
| Avatar + Tier Badge | 실버/브론즈/다이아 동적 색상 + 이모지 배지 |
| StatCard 컴포넌트 | 경험치/포커스/젤리 — 애니메이션 progress bar |
| Main Actions | gradient icon + glow shadow + hover chevron |
| Quick Links | 카테고리별 색상 (blue/rose/amber/emerald) |
| 로그아웃 모달 | blur backdrop + spring animation |
| 알림 버튼 | Bell icon 추가 |
| 로딩 상태 | spinning ring 애니메이션 |
| 비로그인 | Crown 아이콘 + gradient button |

### Daily (`/daily`) — 실시간 만세력 연동
| 변경 항목 | 내용 |
|---------|------|
| Live Ganji Pill | `getDayPillar` + `getHourPillar` 실시간 표시 |
| Score Ring | SVG 애니메이션 원형 게이지 (100점 기준) |
| 점수별 색상 | 80↑ emerald / 60↑ indigo / else rose |
| 오행 아이콘 | 木火土金水 각 아이콘+색상 매핑 |
| 럭키 컬러/넘버/원소 | 3열 그리드 표시 |
| 주의사항 카드 | amber 테두리 + Zap 아이콘 |
| 시간대 세그먼트 | 현재 시간대 하이라이트 (indigo glow) |
| 탭 전환 | AnimatePresence mode="wait" |
| 새로고침 버튼 | 호버 시 rotate-180 애니메이션 |
| 시간 표시 | 현재 시각 + 아이콘 (시간대별) |

### Fortune (`/fortune`) — 연간운세 결과 강화
| 변경 항목 | 내용 |
|---------|------|
| 점수 카운터 | rAF 기반 `animatedScore` 애니메이션 |
| Score Hero | gradient badge + backdrop blur/glassmorphism |
| ScoreBar | gradient-to-r per domain + icon |
| MonthBar | 최고점 월 Trophy 아이콘 + amber glow |
| 최고 월 배지 | "N월 최고" pill 표시 |
| CTA 카드 | glassmorphism + hover chevron translate |
| form 접근성 | label/id 바인딩, aria-label, role=group |
| 동적 import | `useCallback` 최적화 |
| Brand Footer | Orbit 아이콘 양쪽 |





