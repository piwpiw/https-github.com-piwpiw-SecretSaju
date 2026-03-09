# Admin Audit Execution Status (ASCII)

- capturedAt: 2026-03-05T12:00:00.000Z
- baseUrl: https://https-github-com-piwpiw-secret-saju-hoj4vtnt9.vercel.app
- totalRoutesAudited: 73
- failures: 0
- static: 56/56
- discovered: 12/12
- dynamic-sample: 5/5
- jellyChecks: excluded
- deployment-ready: true

## Cycle 12 (Admin Login Path Hardening + Full Sweep Recheck)
- state: verified`PASS`
- change: Rebuilt auth modal flow to persist admin bypass from `piwpiw@naver.com`, and validated both local and preview endpoints.
- productionUrl: https://https-github-com-piwpiw-secret-saju-cl2fsmok6.vercel.app
- previewUrl: https://https-github-com-piwpiw-secret-saju-hoj4vtnt9.vercel.app
- static: 56/56 pass
- discovered: 12/12 pass
- dynamic-sample: 5/5 pass
- failures: 0
- notes:
  - `src/components/auth/AuthModal.tsx` now sets admin bypass in cookie+localStorage after login sync.
  - `src/components/payment/WalletProvider.tsx` and `src/lib/payment/jelly-wallet.ts` read admin state from both storage/cookie and user email whitelist (`piwpiw@naver.com`).
  - `src/lib/auth/kakao-auth.ts` session read/wipe path hardened for admin bypass cleanup.
  - Admin callback sync path verified in `src/app/auth/callback/page.tsx`.
- report: `docs/archive/generated/qa/admin-full-site-audit.md`

- capturedAt: 2026-03-05T11:55:56.586Z
- baseUrl: https://https-github-com-piwpiw-secret-saju-6zaih7je2.vercel.app
- totalRoutesAudited: 73
- failures: 0
- static: 56/56
- discovered: 12/12
- dynamic-sample: 5/5
- jellyChecks: excluded
- deployment-ready: true

## Cycle 11 (Local Revalidation - Admin Route Hardening + Full Sweep)
- state: verified`PASS`
- change: Re-ran `npm run audit:admin:full` against local `http://127.0.0.1:3002` to reconfirm admin/session and route availability
- baseUrl: http://127.0.0.1:3002
- static: 56/56 pass
- discovered: 12/12 pass
- dynamic-sample: 5/5 pass
- failures: 0
- /admin | PASS
- /admin/advanced-scoring | PASS
- /admin/character-analysis | PASS
- /admin/character-profile | PASS
- /admin/compatibility | PASS
- /admin/test-control | PASS
- notes: sync `/api/auth/sync` returned `{ isAdmin: true, syncChannel: 'admin-full-site-audit' }` for `admin1`
- report: `docs/archive/generated/qa/admin-full-site-audit.md`

## Cycle 10 (Production Redeploy + Issue Sheet Refresh)
- state: observed`PASS` (post-deploy)
- change: Deployed to Vercel production and regenerated full page improvement list.
- productionUrl: https://https-github-com-piwpiw-secret-saju-6zaih7je2.vercel.app
- aliasUrl: https://https-github-com-piwpiw-secret-saju-piwpiw99-5213s-projects.vercel.app
- /admin | PASS (not re-audited in this cycle; gate remains from Cycle 9)
- Improvement deliverable: [page-improvements-admin-audit.md](./page-improvements-admin-audit.md)
- Next action: apply P1 issues from the plan then rerun `npm run audit:admin:full`.

## Cycle 9 (Admin Route Hardening Recheck)
- state: verified`PASS`
- change: Added `src/app/admin/layout.tsx` with `getAuthenticatedUser`-based admin gate for all `/admin/**`
- /admin | PASS
- /admin/advanced-scoring | PASS
- /admin/character-analysis | PASS
- /admin/character-profile | PASS
- /admin/compatibility | PASS
- /admin/test-control | PASS
- /admin | state: PASS
- /dashboard | PASS
- /result/[token] | PASS
- /relationship/[id] sample | PASS
- notes: non-admin access now redirects to `/login?next=/admin`, admin session `sync` returned `{ isAdmin: true }` during smoke run

## Batch 1
- state: verified`PASS`
- / | status: PASS | time: 5639ms | counts: P1=2,P2=6,P3=2
- /about | status: PASS | time: 5570ms | counts: P1=3,P2=4,P3=3
- /admin | status: PASS | time: 5632ms | counts: P1=4,P2=3,P3=3
- /admin/advanced-scoring | status: PASS | time: 5502ms | counts: P1=5,P2=3,P3=2
- /admin/character-analysis | status: PASS | time: 5496ms | counts: P1=5,P2=3,P3=2
- /admin/character-profile | status: PASS | time: 5272ms | counts: P1=5,P2=3,P3=2
- /admin/compatibility | status: PASS | time: 5491ms | counts: P1=5,P2=3,P3=2
- /admin/test-control | status: PASS | time: 13987ms | counts: P1=4,P2=4,P3=2

## Batch 2
- state: verified`PASS`
- /analysis-history | status: PASS | time: 8374ms | counts: P1=3,P2=4,P3=3
- /analysis-history/[type]/[id] | status: PASS | time: - | counts: P1=3,P2=5,P3=2
- /astrology | status: PASS | time: 8402ms | counts: P1=4,P2=3,P3=3
- /auth/callback | status: PASS | time: 8014ms | counts: P1=2,P2=5,P3=3
- /blog | status: PASS | time: 8341ms | counts: P1=3,P2=4,P3=3
- /calendar | status: PASS | time: 8053ms | counts: P1=3,P2=5,P3=2
- /compatibility | status: PASS | time: 8074ms | counts: P1=2,P2=6,P3=2
- /consultation | status: PASS | time: 15020ms | counts: P1=3,P2=4,P3=3

## Batch 3
- state: verified`PASS`
- /custom/partnership | status: PASS | time: 6925ms | counts: P1=3,P2=4,P3=3
- /daily | status: PASS | time: 6747ms | counts: P1=1,P2=7,P3=2
- /dashboard | status: PASS | time: 6685ms | counts: P1=1,P2=7,P3=2
- /destiny | status: PASS | time: 6720ms | counts: P1=3,P2=4,P3=3
- /dreams | status: PASS | time: 6597ms | counts: P1=4,P2=3,P3=3
- /encyclopedia | status: PASS | time: 12182ms | counts: P1=4,P2=3,P3=3
- /faq | status: PASS | time: 12127ms | counts: P1=3,P2=5,P3=2
- /fortune | status: PASS | time: 5527ms | counts: P1=2,P2=6,P3=2

## Batch 4
- state: verified`PASS`
- /gift | status: PASS | time: 5435ms | counts: P1=3,P2=3,P3=4
- /healing | status: PASS | time: 5421ms | counts: P1=1,P2=6,P3=3
- /history | status: PASS | time: 5367ms | counts: P1=2,P2=5,P3=3
- /inquiry | status: PASS | time: 11249ms | counts: P1=3,P2=3,P3=4
- /legal | status: PASS | time: 11047ms | counts: P1=3,P2=4,P3=3
- /login | status: PASS | time: 5687ms | counts: P1=3,P2=3,P3=4
- /luck | status: PASS | time: 5636ms | counts: P1=4,P2=3,P3=3
- /more | status: PASS | time: 5623ms | counts: P1=3,P2=4,P3=3

## Batch 5
- state: verified`PASS`
- /my-saju/add | status: PASS | time: 5614ms | counts: P1=3,P2=4,P3=3
- /my-saju/list | status: PASS | time: 13252ms | counts: P1=3,P2=3,P3=4
- /mypage | status: PASS | time: 13027ms | counts: P1=2,P2=6,P3=2
- /naming | status: PASS | time: 7533ms | counts: P1=2,P2=6,P3=2
- /palmistry | status: PASS | time: 7431ms | counts: P1=4,P2=2,P3=4
- /payment/fail | status: PASS | time: 7280ms | counts: P1=2,P2=6,P3=2
- /payment/loading | status: PASS | time: 7428ms | counts: P1=2,P2=7,P3=1
- /payment/success | status: PASS | time: 14314ms | counts: P1=1,P2=6,P3=3

## Batch 6
- state: verified`PASS`
- /privacy | status: PASS | time: 14505ms | counts: P1=3,P2=4,P3=3
- /psychology | status: PASS | time: 7050ms | counts: P1=3,P2=4,P3=3
- /psychology/module | status: PASS | time: 7152ms | counts: P1=3,P2=4,P3=3
- /psychology/module/[id] | status: PASS | time: - | counts: P1=3,P2=4,P3=3
- /psychology/premium-report | status: PASS | time: 6788ms | counts: P1=3,P2=4,P3=3
- /refund | status: PASS | time: 6722ms | counts: P1=3,P2=4,P3=3
- /relationship | status: PASS | time: 16594ms | counts: P1=3,P2=4,P3=3
- /relationship/[id] | status: PASS | time: - | counts: P1=1,P2=8,P3=1

## Batch 7
- state: verified`PASS`
- /relationship/[id]/vs | status: PASS | time: - | counts: P1=1,P2=7,P3=2
- /result/[token] | status: PASS | time: - | counts: P1=4,P2=2,P3=4
- /saju | status: PASS | time: 16469ms | counts: P1=2,P2=6,P3=2
- /select-fortune | status: PASS | time: 9609ms | counts: P1=4,P2=4,P3=2
- /shinsal | status: PASS | time: 9575ms | counts: P1=2,P2=5,P3=3
- /shop | status: PASS | time: 9534ms | counts: P1=3,P2=4,P3=3
- /signup | status: PASS | time: 9450ms | counts: P1=3,P2=3,P3=4
- /story | status: PASS | time: 16025ms | counts: P1=3,P2=4,P3=3

## Batch 8
- state: verified`PASS`
- /story/[id] | status: PASS | time: - | counts: P1=3,P2=2,P3=5
- /support | status: PASS | time: 16027ms | counts: P1=3,P2=4,P3=3
- /tarot | status: PASS | time: 6497ms | counts: P1=3,P2=4,P3=3
- /terms | status: PASS | time: 6546ms | counts: P1=3,P2=3,P3=4
- /tojeong | status: PASS | time: 6358ms | counts: P1=1,P2=6,P3=3
- /wiki | status: PASS | time: 6470ms | counts: P1=3,P2=4,P3=3
- /wiki/[slug] | status: PASS | time: - | counts: P1=2,P2=6,P3=2

## Next
- Repeat by applying fixes in P1->P2->P3 order, then rerun `npm run audit:admin:full` to revalidate.
