# Naming Conventions

> Status: Active · Last updated: 2026-11-01

## Purpose

Keep naming consistent across a monorepo with 3 apps and 10 packages, so
code reads the same regardless of which part of the repo you're in.

## Conventions

- **Files**: kebab-case (`finance.ts`, `sheet-grid.tsx`)
- **Components**: PascalCase (`SheetGrid`, `PageHeader`)
- **Functions/variables**: camelCase
- **DB tables/columns**: snake_case (`tx_date`, `amount_paise`); money fields carry the `_paise` suffix, JSON fields `...Paise`
- **Feature folders**: kebab-case, a real domain name — never
  `example-feature` or another placeholder
  (`projects`, `admin-dashboard`, not `ProjectsFeature`)
- **Workspace packages**: `@wealthspan/<name>`, kebab-case after the scope
  (`@wealthspan/ui`, `@wealthspan/utils`)
- **Barrel files**: always `index.ts` at the feature root, re-exporting the
  feature's public API

## References

- Root [`AGENTS.md`](../../AGENTS.md) §8
