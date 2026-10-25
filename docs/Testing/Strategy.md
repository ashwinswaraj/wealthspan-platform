# Testing Strategy

> Status: Draft · Owner: TBD · Last updated: 2026-08-31

## Purpose

Describe the testing approach and tooling for the monorepo — what's set
up structurally, distinct from what test cases actually exist (currently:
none).

## Current state

- **Config files exist but are empty placeholders**:
  `packages/config/testing/vitest.config.ts` and
  `playwright.config.ts` are both 0 bytes — they establish where shared
  test config will live, but contain no actual configuration yet.
- **No test files exist anywhere in the repo yet.**
- `root package.json`'s `test` script (`turbo run test`) and `turbo.json`'s
  `test` pipeline task are wired up and will run once individual
  packages/apps add their own `test` script — there's just nothing for
  them to run today.
- `tests/` (root) has only a `.gitkeep` — reserved for cross-app
  E2E/integration tests per `ARCHITECTURE_RATIONALE.md`.

## Intended approach (per root `AGENTS.md` and `ARCHITECTURE_RATIONALE.md`)

- **Unit tests** live inside each feature folder, next to the code they
  test — not centralized. Tool: Vitest (implied by
  `packages/config/testing/vitest.config.ts`'s existence, though not yet
  configured).
- **E2E/integration tests** that span multiple apps (e.g. an order created
  in `apps/web` showing up correctly in `apps/admin`) live in root
  `tests/`. Tool: Playwright (implied by
  `packages/config/testing/playwright.config.ts`'s existence, not yet
  configured).

## Open Questions

- [ ] Actual `vitest.config.ts`/`playwright.config.ts` contents (test
      environment, coverage thresholds, CI integration)
- [ ] Coverage targets — none defined yet
- [ ] `docs/Testing/73_QA_Checklist.md` and `74_Release_Checklist.md` are
      still drafts; no checklist exists to reference yet

## References

- [Master Context](../00_Master_Context.md)
- Root [`AGENTS.md`](../../AGENTS.md)
- `packages/config/testing/`
