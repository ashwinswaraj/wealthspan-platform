# ADR-001: Monorepo structure — apps/* + feature-driven src/

> Status: Accepted · Last updated: 2026-08-31

## Status

Accepted (implemented 2026-08-31).

## Context

The codebase previously had a duplicate legacy app at the repo root
(`src/`, `public/`) alongside the real `apps/web`, plus flat
type-driven folders (`components/`, `pages/`, `lib/`) inside each app
rather than domain-organized code. Root `package.json` also duplicated
`apps/web`'s entire dependency list and had a `dev` script that silently
only started one of three apps.

## Decision

Restructure into `apps/{web,admin,api}` + `packages/*` (10 shared
libraries) + `infrastructure/` + `docs/`, with each app's `src/` organized
as `features/<domain>/` (barrel-exported via `index.ts`) instead of
type-driven buckets. Root `package.json` scripts delegate to Turborepo
(`turbo run <task>`) rather than calling build tools directly. Full
per-folder rationale recorded in `ARCHITECTURE_RATIONALE.md`.

## Consequences

- **Positive**: features are independently reasoned-about; barrel exports
  make each feature's public API explicit; root scripts can't silently
  skip an app again (they run through Turborepo's pipeline).
- **Positive**: removed real duplicate/dead code found during the move
  (a legacy root app, two orphaned components, business logic misplaced
  in generic `lib/` folders in both `apps/web` and `apps/admin`).
- **Trade-off**: `apps/admin`'s dashboard code was consolidated into one
  large feature rather than split per business domain — see ADR-006.
- **Trade-off**: one pre-existing cross-app boundary violation
  (`apps/web` importing `apps/admin`'s Dashboard directly) was documented
  rather than fixed, since the correct fix is a further architecture
  decision, not a mechanical move — tracked in `.lovable/plan.md`.
- **Follow-up**: root `dev` had to be scoped to `apps/web` only after this
  restructure surfaced that `apps/web`/`apps/admin` share a default dev
  port — see `Decision_Log.md`.

## References

- [Master Context](../00_Master_Context.md)
- [`ARCHITECTURE_RATIONALE.md`](../../ARCHITECTURE_RATIONALE.md)
- [`Decision_Log.md`](../Architecture/Decision_Log.md)
- Root [`AGENTS.md`](../../AGENTS.md)
