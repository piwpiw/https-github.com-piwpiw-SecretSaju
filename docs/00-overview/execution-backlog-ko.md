# Execution Backlog (Route-Level)

This document is the canonical page contract for implementation and QA.

## Scope
- Core routes below are the single source of truth for required screen behavior.
- Support / informational routes use minimum visibility contracts in this document.
- Dynamic routes (`/wiki/[slug]`, `/relationship/[id]`, `/analysis-history/[type]/[id]`) inherit the same minimum requirements:
  - content renders in context
  - safe empty states
  - clear back button and secondary action

## Priority Rules
- P0: Direct impact on conversion, payment, or retention.
- P1: Growth impact and engagement multipliers.
- P2: Quality and operational support features.

## Active Route Contracts

| Route | Priority | Screen Goal | Core Functions | Must-Show Elements | Definition of Done |
|---|---|---|---|---|---|
| `/` (Home) | P0 | Start first analysis quickly and clearly | Birth input, quick validation, start CTA | Hero, input controls, primary CTA, trust note, top nav, legal footer links | Users can submit valid input within 90 seconds |
| `/fortune` | P0 | Deliver meaningful first value | Render result, element summary, next action CTA | 4-pillar summary, interpretation block, premium preview, share + recompute CTA | Result renders without blank states; conversion path is visible above the fold |
| `/payment/loading` | P0 | Display payment processing state | Animated loading indicator, clear status message | Loading animation, status message, cancel/back option | Loading state transitions to success or fail within timeout |
| `/payment/success` | P0 | Confirm payment result and unlock path | Verify payment, show unlocked state, return actions | Success title, payment ID, amount, unlocked list, result CTA, support link | Retry/fallback behavior exists for failure cases |

| `/payment/fail` | P0 | Recover failed payment | Show failure reason, retry payment, safe return | Failure reason, retry CTA, support contact | User can retry or exit without dead-end |
| `/shop` | P0 | Convert to jelly purchase | Package comparison, purchase start, wallet snapshot | Jelly balance, package cards, value badge, purchase CTA, policy link | A recommended package is clear and checkout handoff works |
| `/mypage` | P0 | Manage account and content assets | Profile CRUD entry points, balance, history | Account summary, balance, profile list, add/edit/delete actions, history link, logout | Core actions are discoverable in one screen |
| `/compatibility` | P1 | Improve engagement and shareability | Profile pair selection, score, interpretation | Profile selectors, total score, category scores, insight summary, share CTA | Score and insights appear after one profile selection |
| `/daily` | P1 | Increase daily revisit behavior | Fortune fetch, streak, refresh schedule | Date, forecast, lucky/unlucky signal, streak badge, next refresh, share CTA | Card updates at least once per day |
| `/calendar` | P1 | Build repeat usage around monthly planning | Monthly luck grid, day drill-down, reminder | Month calendar, legend, day detail panel, reminder CTA | Users can inspect any day of current month |
| `/gift` | P1 | Complete referral/gift conversion | Recipient flow and post-payment sharing | Recipient form, sender memo, price summary, payment CTA, share link | Gift link is shown after successful purchase |
| `/history` | P2 | Improve trust with transparency | Show analysis/payment history | Filter tabs, item list, status, timestamp, detail CTA | Empty state includes next action guidance |
| `/support` | P2 | Reduce churn from unresolved issues | FAQ + inquiry submission + expectations | FAQ links, inquiry fields, category selector, response expectation, privacy note | Valid inquiry sends and confirms clearly |
| `/admin` | P1 | Provide operational confidence | API health, sample checks, audit summary | Environment status, API test actions, payment verification test, content preview | Operators can validate critical journeys from one page |

## Route Coverage Matrix (Public Pages)

| Route | Priority | Must-Show Minimum | Acceptance Check |
|---|---|---|---|
| `/about` | P2 | Feature summary, trust badges, contact CTA | User can find company/about or contact path in one click |
| `/analysis-history/[type]/[id]` | P2 | Context summary, detail card, related actions | Safe empty state for missing items and back-navigation |
| `/dashboard` | P2 | Dashboard summary tiles, quick links, trend preview | Core metrics cards and action links are rendered and navigable |
| `/astrology` | P2 | Core astrology overview, category cards, analysis start CTA | At least one category card and entry CTA are visible |
| `/auth/callback` | P2 | Authentication result handling, loading state, next-step link | Success or failure state moves user to next step without stale loop |
| `/blog` | P2 | Featured article list, category markers, search or filter | First articles render or explicit empty-state guidance |
| `/consultation` | P2 | Consultation entry, booking/info CTA, eligibility note | Entry route is visible and actionable |
| `/custom/partnership` | P2 | Partnership inquiry summary and contact flow | Request form or partner CTA is discoverable |
| `/destiny` | P2 | Destiny entry blocks, "Get Started" CTA | At least one destiny entry route is accessible |
| `/dreams` | P2 | Dream input, interpretation placeholder, start CTA | Input area and result action are visible |
| `/encyclopedia` | P2 | Search/filter, article cards, featured terms | Search input or filter + first card/placeholder visible |
| `/faq` | P2 | FAQ list, search, escalation path | User can open one FAQ item and find support escalation |
| `/healing` | P2 | Benefit summary, content cards, apply CTA | Content cards render and action buttons work |
| `/inquiry` | P2 | Inquiry form, category selector, consent path | Required fields validate and submit path exists |
| `/legal` | P2 | Agreement summary, effective date, version info | Legal sections load and policy links are visible |
| `/login` | P2 | Login methods and terms agreement | Social login buttons and policies are visible |
| `/luck` | P2 | Daily luck cards, interpretation block, CTA | Luck summary and action suggestion are present |
| `/more` | P2 | Quick links and core service entries | One functional link and one secondary action are visible |
| `/my-saju/add` | P2 | Profile creation form, validation feedback, save CTA | Save action becomes available when required fields are filled |
| `/my-saju/list` | P2 | Profile list, edit/delete entry, add profile CTA | At least one action item is interactable |
| `/naming` | P2 | Naming selector, sample output, proceed CTA | Proceed CTA starts naming flow |
| `/palmistry` | P2 | Palmistry intro, example cards, start CTA | Example card and action path are visible |
| `/privacy` | P2 | Privacy scope summary, user rights, withdrawal path | Privacy policy and withdrawal CTA visible |
| `/psychology` | P2 | Psychology feature list, method summary, start CTA | At least one psychology module can be started |
| `/refund` | P2 | Refund policy summary, eligibility and support link | Refund support link and guidance are accessible |
| `/relationship/[id]` | P1 | Relationship profile summary and insight block | Relationship card and action links render correctly |
| `/relationship/[id]/vs` | P1 | Comparison summary and share-ready context | Comparison outcome and secondary action are visible |
| `/saju` | P2 | Saju concept overview, recent items, analysis start | Profile list and start analysis action are visible |
| `/select-fortune` | P2 | Fortune type selector, launch CTA | Selector change updates next-step state |
| `/shinsal` | P2 | Shinsal intro, card list, analysis CTA | At least one card opens preview |
| `/story` | P2 | Story index, preview card, share path | Story list and one detail route are available |
| `/tarot` | P2 | Tarot mode selector, draw CTA, result card region | Draw action begins and result card renders |
| `/terms` | P2 | Terms summary, version/date, download/action path | Terms are readable and links resolve |
| `/tojeong` | P2 | Tojeong concept summary and start CTA | One clear starting route is visible |
| `/wiki` | P2 | Knowledge index, tag search, article preview | Search + at least one article preview visible |
| `/wiki/[slug]` | P2 | Article title, body summary, related links | Unknown slugs fall back to safe empty state |
| `/admin/advanced-scoring` | P1 | Advanced score controls and metrics view | Admin can open scoring view and read metric labels |
| `/admin/character-analysis` | P1 | Character analysis configuration and health view | Configuration list renders and is editable/read-only safe |
| `/admin/character-profile` | P1 | Character profile registry + status | List/detail visibility and action buttons render |
| `/admin/compatibility` | P1 | Admin controls for compatibility data and audits | Data table + test action button are visible |
| `/admin/test-control` | P1 | Diagnostic controls and run-state summary | Test suite trigger and result status are visible |

## Cross-Route Requirements
- Global nav: Home, My Page, Shop, Support.
- Legal links in footer: Terms, Privacy, Refund.
- Standard loading/error/empty states with explicit next actions.
- Track key events once: `start_analysis`, `share_click`, `payment_click`, `payment_complete`.
- Mobile-first layout with 360px-safe interactions.

## Sprint Sequencing
- Sprint A (P0 reliability): `/`, `/fortune`, `/shop`, `/payment/success`, `/payment/fail`, `/mypage`
- Sprint B (P1 growth): `/compatibility`, `/daily`, `/calendar`, `/gift`, `/admin`
- Sprint C (P2 trust/ops): `/history`, `/support`, global polish

## QA Checklist
- P0/P1 routes show required elements in first meaningful render.
- CTA controls are keyboard/mouse/touch safe.
- No dead-end after errors.
- Conversion events fire exactly once per action.
- Route coverage remains synchronized with `src/app` page files.

**Owner**: Product Operations / Engineering Lead
**Last Updated**: 2026-03-01
