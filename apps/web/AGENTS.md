# AGENTS.md — apps/web

Rules specific to this app. Falls back to root `AGENTS.md` for anything not
covered here.

## Current state

Public-facing app: marketing site + client/professional dashboards +
signup + legal pages, organized into `src/features/{marketing, auth,
signup, dashboard-client, dashboard-professional, legal}/`. Two features
intentionally share one atoms module —
`src/components/dashboard/shared.tsx` (`SectionHeader`, `Card`, `Pill`,
`StatusBadge`) is used by both `dashboard-client` and
`dashboard-professional`; it stays at the top level, not duplicated into
either feature (see root `AGENTS.md` §3).

`src/routes/dashboard/super.tsx` and `super.sub.tsx` import `apps/admin`'s
Dashboard page directly — a known, documented exception to the
apps-never-import-each-other rule (root `AGENTS.md` §6). Don't extend this
pattern to new routes.

## Rules

- `[RULE]` Client-facing and professional-facing dashboard logic are
  **separate features** (`dashboard-client` vs `dashboard-professional`)
  even where the UI looks similar — don't merge them to "reduce
  duplication"; the two roles have different permissions and data shapes.
- `[SEC]` This app is public-facing — never assume a request is
  authenticated just because a route is under `dashboard/`. Every
  dashboard page must check the session itself (client-side redirect is
  not a security boundary; the real check happens API-side once
  `apps/api` is wired up).
- `[SCALE]` `packages/constants`' order/service registries are currently
  the client-side source of truth for order state
  (`features/dashboard-client/lib/order-*.ts` reads from them). This is a
  known interim state — once `apps/api` has a real `orders` feature (see
  `.lovable/plan.md`), these registries should read from the API instead
  of holding state client-side.
- `[CLR]` `docs/Platform/` has a numbered spec per module (15–36) — check
  there before designing new client-facing flows from scratch.
- `[RULE]` UI comes from `@jobrio/ui/design-system` only — this app has no
  local `design-system/` folder of its own; don't create one.

## Never do without confirmation

- Restructure `src/routes/` without regenerating `routeTree.gen.ts` (root
  `AGENTS.md` §4)
- Add a new top-level route that bypasses session checks
- Add a second cross-app import into `apps/admin` beyond the existing
  `super`/`super.sub` exception
