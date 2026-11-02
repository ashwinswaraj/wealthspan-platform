# Dependency Rules

> Status: Active · Last updated: 2026-11-01

- `packages/*` never import from `apps/*`.
- `apps/web` and `apps/admin` may import any `packages/*` but never each other.
- `apps/api` may import server-safe packages (`@wealthspan/types`, `validation`, `constants`, `utils`). It does not use `@wealthspan/auth` (client login UI/state); users are identified by the Catalyst session.
- Internal dependencies use `"@wealthspan/x": "workspace:*"`.
- Money rules (`packages/utils/src/finance.ts`) are the only place totals, balances and loan outstanding are computed; apps and the chatbot call them.

## Enforcement

Convention plus review; no lint rule yet (`eslint-plugin-boundaries` would be the next step). `pnpm check:structure` only checks the folder tree.

## Known leftovers

`packages/database`, `packages/auth` and one dependency in `apps/web/package.json` still carry code from the previous product's login and database. They are unused by Wealthspan's functions and are scheduled for removal.
