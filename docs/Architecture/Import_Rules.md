# Import Rules

> Status: Active · Owner: TBD · Last updated: 2026-08-31

## Purpose

Define how code inside `apps/*/src/features/<domain>/` should be imported,
so features stay independently reasoned-about and code-splitting keeps working.

## Rules

- **Import from a feature's barrel (`index.ts`), not its internals.**
  `import { Thing } from "@/features/orders"`, never
  `import { Thing } from "@/features/orders/components/Thing"`.
- **Exception — `lazy()` code-split imports.** A section wrapped in
  `React.lazy(() => import(...))` for route-level code-splitting keeps its
  import path deep and specific to that one module. Routing it through the
  barrel would pull the whole feature into every lazy chunk. Reference
  implementation: `apps/admin/src/pages/dashboard/admin/Dashboard.tsx`.
- **A feature's internals never import another feature's internals.**
  Cross-feature imports go through the other feature's barrel.
- **Code shared by 2+ features is not business logic** — it's UI atoms or
  helpers — and belongs in the app's top-level `src/components/`,
  `src/hooks/`, or `src/utils/`, not duplicated into each feature or left
  in one for another to reach into. Reference:
  `apps/web/src/components/dashboard/shared.tsx`.
- **`lib/` is third-party glue only** (router adapters, SDK wrappers) —
  never business logic. A `lib/` file only ever imported by one feature is
  misplaced; move it into that feature's own `lib/`.
- **UI comes from `@jobrio/ui/design-system` only** — never reach into
  `@jobrio/ui/src/components/*` directly from feature code, and never
  recreate a design-system primitive locally.

## Enforcement

Not currently enforced by tooling — observed by convention. See
`Dependency_Rules.md` for the same caveat on app/package boundaries.

## References

- [Master Context](../00_Master_Context.md)
- Root [`AGENTS.md`](../../AGENTS.md) §3–4
