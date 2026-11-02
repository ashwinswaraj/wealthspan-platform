# API Architecture

> Status: Draft · Last updated: 2026-11-01

## Shape

`apps/api` is three Zoho Catalyst Advanced I/O functions (Node 22, Express, 30 s limit) under `apps/api/catalyst/functions/{finance,chat,files}`. Their `entry.ts` files only wire routes; logic lives in `apps/api/src/features/<domain>/`:

```
features/
  finance/       transactions + summary (service.ts, catalyst-store.ts, types.ts)
  catalog/       projects, accounts, events, loans, investments
  subscription/  trial, plans, UTR payment submissions and review
  admin/         overview, users, payments, ledger, audit
  chat/          sarvam.ts (provider adapter), quota.ts (daily limit)
  files/         report + writers (PDF, Excel, CSV, Word), sheet .xlsx
middleware/security.ts   CSRF guard, rate limit, JSON errors
```

Each service takes a `store` interface; `catalyst-store.ts` is the ZCQL implementation, tests use in-memory stores.

`build.mjs` bundles each entry into `functions/<name>/index.js` (generated, committed; run `pnpm --filter @wealthspan/api build:catalyst`).

## Request pipeline

`hardenApp` -> `requestGuard` (CSRF, nosniff, no-store) -> JSON body (32 kb) -> Catalyst session lookup (401 if none) -> `rateLimit` -> route -> `notFound` -> `jsonErrors`.

## Rules

- The user id comes only from `userManagement().getCurrentUser()`.
- Every store query filters by `user_id`; admin routes are the only cross-user reads.
- Money is integer paise in and out; the UI converts to rupees.
- `features/auth` and `config/` in `apps/api/src` are leftovers from the previous product, pending removal; no function uses them.
