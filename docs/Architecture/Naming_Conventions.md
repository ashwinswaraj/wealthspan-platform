# Naming Conventions

> Status: Active · Owner: TBD · Last updated: 2026-08-31

## Purpose

Keep naming consistent across a monorepo with 3 apps and 10 packages, so
code reads the same regardless of which part of the repo you're in.

## Conventions

- **Files**: kebab-case (`order-catalog.ts`, `client-dashboard-layout.tsx`)
- **Components**: PascalCase (`ClientDashboardLayout`, `SectionHeader`)
- **Functions/variables**: camelCase
- **DB tables**: snake_case
- **Feature folders**: kebab-case, a real domain name — never
  `example-feature` or another placeholder
  (`dashboard-client`, `admin-dashboard`, not `DashboardClient`)
- **Workspace packages**: `@wealthspan/<name>`, kebab-case after the scope
  (`@wealthspan/ui`, `@wealthspan/database`)
- **Barrel files**: always `index.ts` at the feature root, re-exporting the
  feature's public API

## References

- [Master Context](../00_Master_Context.md)
- Root [`AGENTS.md`](../../AGENTS.md) §8
