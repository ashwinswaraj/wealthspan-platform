# ADR-006: Admin panel is a separate SPA, authorised by the API

> Status: Accepted · Last updated: 2026-11-01

## Context

The admin panel sees all subscribers and payment submissions, so it is the highest-privilege surface.

## Decision

- `apps/admin` is its own Vite + TanStack Start SPA, served at `/app/admin/` (the user app is at `/app/`). It never imports `apps/web`.
- Its code is one feature, `features/admin-dashboard/` (sections: dashboard, finance, subscriptions, security, system), because the sections share state and UI atoms.
- Every admin action is a call to `/server/finance/admin/*`, which the API authorises itself. Hiding a nav item is UX only.

## Consequences

Large feature folder; split only when ownership boundaries exist. Permissions: [ADR-008](ADR-008-Admin-Permissions.md).
