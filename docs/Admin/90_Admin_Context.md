# Admin Context

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

The super admin panel lets the Wealthspan team run the product: see users, approve payments, watch health.

## Facts

- App: `apps/admin` (TanStack Start), same Catalyst domain as the functions, so the session cookie authenticates calls (`apps/admin/src/features/admin-dashboard/lib/adminApi.ts`).
- Who is admin is decided by the server: `ADMIN_EMAILS`, optionally pinned with `ADMIN_USER_IDS`. The browser never decides.
- API: `/server/finance/admin/{me,overview,users,payments,ledger,audit,health}`.
- Privacy: the panel never shows what users typed; ledger rows show type, project and amount only.
- Fields with no value show a dash, never an invented number.
- Screens that are not connected say so (for example the Security switches show "Local only").
