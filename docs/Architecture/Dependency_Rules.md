# Dependency Rules

> Status: Active · Owner: TBD · Last updated: 2026-08-31

## Purpose

Define which parts of the monorepo may import from which other parts, so
dependencies flow one direction and no app becomes coupled to another.

## Rules

- `packages/*` → **never** imports from any `apps/*`. Shared code must not
  depend on an app; if a package needs app-specific behavior, that's a sign
  the code belongs in the app, not the package.
- `apps/web` and `apps/admin` → may import from any `packages/*`, but
  **never from each other**.
- `apps/api` → may import from `packages/*` that make sense server-side
  (`@jobrio/types`, `@jobrio/validation`, `@jobrio/constants`); it does not
  depend on `@jobrio/auth` (that package is client-side auth UI/state — see
  its own `AGENTS.md`), talking to Supabase Auth directly instead.
- Internal cross-package dependencies always use
  `"@jobrio/x": "workspace:*"` — never a version number or relative path
  reaching across package boundaries.

## Known exception

`apps/web/src/routes/dashboard/super.tsx` and `super.sub.tsx` import
`apps/admin`'s Dashboard page directly (a "super admin embedded in web"
route). This is a pre-existing violation of the web↔admin rule above,
documented rather than silently fixed — see root `AGENTS.md` §6 and
`.lovable/plan.md` for the open decision (extract a shared package, or
keep as a documented exception).

## Enforcement

**Not currently enforced by tooling.** `eslint.config.js`'s only
`no-restricted-imports` rule is unrelated (it flags the Next.js
`server-only` package, not app/package boundaries) — these rules are
observed by convention only. Adding a real lint rule for this (e.g. via
`eslint-plugin-boundaries` or a custom rule) is open work, not yet done.

## References

- [Master Context](../00_Master_Context.md)
- Root [`AGENTS.md`](../../AGENTS.md) §6
- [`ARCHITECTURE_RATIONALE.md`](../../ARCHITECTURE_RATIONALE.md)
