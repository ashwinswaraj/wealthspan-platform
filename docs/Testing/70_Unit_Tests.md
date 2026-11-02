# Unit Tests

> Status: Draft · Last updated: 2026-11-01

Vitest, run with `pnpm test` (CI: `test` and `ci-api`). Existing suites:

- `packages/utils/src/__tests__`: money maths (`finance.test.ts`), sheet helpers.
- `packages/validation/src/__tests__`: input rules.
- `apps/api/tests`: security middleware, finance, catalog, subscription, admin, chat (Sarvam client, quota), files.

Services are tested with in-memory stores; `catalyst-store.test.ts` checks ZCQL building. Every new service rule needs a test, especially user isolation and money.
