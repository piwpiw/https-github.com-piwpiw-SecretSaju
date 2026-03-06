# QA Milestone Checklist: Authentication & Registration

This checklist covers mobile and desktop environments for the Wave 21 release.

## 📱 1. Mobile (Chrome/Safari WebKit)

- [ ] **FE-6 (Spacing)**: Horizontal padding is consistent (min 16px-24px).
- [ ] **FE-14 (Touch Target)**: All login buttons (Kakao, Google, etc.) have `min-height: 56px` or `py-4`.
- [ ] **FE-15 (Error Alignment)**: Validation messages for email enter/exit without jumping layout (using `min-h-[20px]`).
- [ ] **UX-01 (Viewport)**: No horizontal scrolling on modal.
- [ ] **UX-02 (Tap Highlight)**: Custom -webkit-tap-highlight-color applied to prevent flickering.

## 💻 2. Desktop (Chrome/Firefox/Edge)

- [ ] **FE-13 (Contrast)**: Buttons from different providers (Google WHITE vs Naver GREEN) meet WCAG 2.1 (AA) 4.5:1.
- [ ] **FE-17 (Double Close)**: Closing while loading results in no action.
- [ ] **FE-20 (Captures)**: Ensure screen-captures for final verification are logged to Notion.

## ⚙️ 3. Security & Callback (BE/DO)

- [ ] **G-4 (State TTL)**: Expiration after 10 minutes confirmed.
- [ ] **G-10 (HTTPS Only)**: Cookies have `Secure` flag on production (check via devtools).
- [ ] **BE-17 (Notion Log)**: Log data for `AUTH_EVENT` appears in Notion after login.

---
**Run Status**: Pending...
**QA Auditor**: Antigravity
**Date**: 2026-03-03
