# Repository Rules

> Status: Active · Last updated: 2026-11-01

## Purpose

The hard constraints that keep this monorepo from drifting back into an
inconsistent state — what every contributor (human or AI) must not do
without explicit confirmation.

## Rules

- **pnpm only.** No `package-lock.json`, `yarn.lock`, or `bun.lock` —
  `pnpm-lock.yaml` is the single lockfile. Internal cross-package
  dependencies use `"@wealthspan/x": "workspace:*"`, never a version number.
- **Root `build`/`typecheck`/`test` stay `turbo run <task>`**, fanning out
  to every app. Root `dev` stays scoped to `apps/web`
  (`--filter=@wealthspan/web`) until `apps/web` and `apps/admin` have distinct
  dev ports — see `.lovable/plan.md`. Never add a root script that calls
  `vite`/`tsc` directly.
- **Never hand-edit a generated file**: `apps/{web,admin}/src/routeTree.gen.ts`
  (TanStack Router codegen) and `apps/api/catalyst/functions/*/index.js`
  (built by `pnpm --filter @wealthspan/api build:catalyst`).
- **Never change a Data Store table or column** without updating
  `docs/Database/42_Catalyst_Data_Store_Schema.md` in the same change.
- **Never put secrets in the repo.** `SARVAM_API_KEY` is set in the Catalyst console; `catalyst-config.json` holds only non-secret env vars.
- **Never add files or move folders without matching the README tree**; `pnpm check:structure` enforces it.
- **Never touch `.env`/`.env.*`** other than `.env.example`.
- **Never run destructive DB commands** (dropping tables, unscoped
  deletes/updates) without explicit confirmation.
- **Never add a new top-level folder** (root or inside `apps/*/src/`)
  without asking — every existing one has a documented reason in
  `ARCHITECTURE_RATIONALE.md`.
- **Never introduce a new library/framework** not already in use without
  confirming first.

## References

- Root [`AGENTS.md`](../../AGENTS.md) §7
