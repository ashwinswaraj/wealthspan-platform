# @wealthspan/admin

Wealthspan Super Admin control panel.

## Layout

```
src/
  features/
    admin-dashboard/  the bulk of this app's logic (users, subscriptions,
                       payments, plans, roles, security, audit, system,
                       and more) — consolidated into one feature rather
                       than split per-domain; see root AGENTS.md §9.2 for why
  routes/              file-based TanStack routes (auto-generates
                       routeTree.gen.ts — never hand-edit that file)
  pages/               thin page components rendered by routes
  components/          cross-feature shared UI only (currently near-empty
                       — most admin UI lives inside admin-dashboard)
  layouts/  hooks/  lib/  services/  utils/  config/
public/                static assets
tests/                 test suite
```

Module specs live in `docs/Admin/` (one numbered doc per module) and
`docs/ADR/ADR-006` through `ADR-010`. Shared UI comes from
`@wealthspan/ui/design-system`; shared types from `@wealthspan/types`.

## Rules

See `AGENTS.md` (this folder's own, falling back to the root one) for the
full list — this app is the highest-privilege surface in the repo, so its
rules are stricter than most: every mutating action needs an audit trail,
and role/permission checks are never relaxed to unblock a change.
