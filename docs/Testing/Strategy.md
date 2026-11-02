# Testing Strategy

> Status: Draft · Last updated: 2026-11-01

## Pyramid

1. **Unit tests (real, many):** Vitest, next to the code or in `apps/api/tests`. Cover money maths, validation, services with in-memory stores, security middleware, quota, Sarvam adapter, file writers. Run by `pnpm test` and CI.
2. **Integration (planned, few):** against the Catalyst Development environment ([71](71_Integration_Tests.md)).
3. **End to end (planned, fewest):** Playwright for the main user flows ([72](72_End_to_End_Tests.md)); root `tests/` is reserved for them.
4. **Manual:** [QA checklist](73_QA_Checklist.md) and [release checklist](74_Release_Checklist.md).

## What must always be tested

- Numbers: anything in `packages/utils/src/finance.ts`.
- Isolation: a service never returns or changes another user's row.
- Gates: CSRF header, rate limits, subscription entitlement, daily quota, admin pinning.
- Chatbot (when tools exist): confirmation can only be satisfied by server-stored state; the model cannot change numbers.

## Open

- [ ] Coverage target (none defined)
- [ ] Shared Vitest/Playwright config in `packages/config/testing` is still empty
