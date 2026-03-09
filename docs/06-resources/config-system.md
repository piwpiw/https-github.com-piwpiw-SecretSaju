# Configuration System

This document explains how environment variables and configuration should be managed in the repository.

## Goals

- Keep public and secret configuration clearly separated.
- Centralize validation before runtime failures happen.
- Avoid direct, scattered `process.env` usage in feature code.

## Reference Files

- Local template: [../../.env.local.template](../../.env.local.template)
- Production template: [../../.env.production.template](../../.env.production.template)
- Security reference: [../archive/legacy/SECURITY.md](../archive/legacy/SECURITY.md)

## Rules

- Public-safe values only go in `NEXT_PUBLIC_*`.
- Secrets stay server-side and never appear in client bundles.
- Payment, auth, and external integration keys must be validated before release.
- When environment requirements change, update the templates in the same change.

## Recommended Pattern

```ts
// Good: centralize configuration access
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Bad: duplicate environment access patterns across unrelated files
```

## Release Checklist

- [ ] `.env.local` and `.env.production` are not committed
- [ ] Production uses live keys where required
- [ ] Redirect URIs match the deployed domain
- [ ] Required auth and payment keys are present
- [ ] Templates reflect the latest required variables
