# Admin Full Site Audit

- Base URL: `http://127.0.0.1:3002`
- Started At: `2026-03-05T15:32:18.954Z`
- Finished At: `2026-03-05T15:34:54.669Z`
- Workers: `8`
- Effective Password: `admin1`
- Jelly checks: `excluded`

## Sync
- sync.ok: `true`
- sync.status: `200`
- sync.isAdmin: `true`

## Summary
- Static routes: 56 (pass 51 / fail 5)
- Discovered extra routes: 12 (pass 12 / fail 0)
- Dynamic sample routes: 5 (pass 5 / fail 0)
- Total audited routes: 73
- Total failures: 5

## Failures
- [static] `/admin` status=500 error=none
  - 5xx: 500 http://127.0.0.1:3002/admin
  - console: Failed to load resource: the server responded with a status of 500 (Internal Server Error)
- [static] `/admin/advanced-scoring` status=500 error=none
  - 5xx: 500 http://127.0.0.1:3002/admin/advanced-scoring
  - console: Failed to load resource: the server responded with a status of 500 (Internal Server Error)
- [static] `/admin/character-analysis` status=500 error=none
  - 5xx: 500 http://127.0.0.1:3002/admin/character-analysis
  - console: Failed to load resource: the server responded with a status of 500 (Internal Server Error)
- [static] `/admin/character-profile` status=500 error=none
  - 5xx: 500 http://127.0.0.1:3002/admin/character-profile
  - console: Failed to load resource: the server responded with a status of 500 (Internal Server Error)
- [static] `/admin/compatibility` status=500 error=none
  - 5xx: 500 http://127.0.0.1:3002/admin/compatibility
  - console: Failed to load resource: the server responded with a status of 500 (Internal Server Error)

## Note
- Dynamic sample routes are best-effort checks for unresolved dynamic patterns without fixture IDs.
- This run intentionally does not validate jelly balance/consume behavior.