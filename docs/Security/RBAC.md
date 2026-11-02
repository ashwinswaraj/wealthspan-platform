# Roles and Authorization

> Status: Draft · Last updated: 2026-11-01

There are two roles: **user** and **admin**.

| Role | How decided | Can do |
|---|---|---|
| User | any signed-in Catalyst account | read and write only their own rows; own subscription; chat if plan active; exports |
| Admin | e-mail in `ADMIN_EMAILS`; if `ADMIN_USER_IDS` is set, the Catalyst user id must be listed too | everything under `/server/finance/admin/*`: overview, users, payments (approve/reject), ledger, audit, health |

## Rules

- Admin status comes only from function environment variables (in `catalyst-config.json`), never from the client or a database field. `GET /admin/me` only reports it.
- A listed e-mail with a different user id is refused (403) and logged as a warning.
- `app.use("/admin", ...)` rejects non-admins before any admin handler runs, in addition to the check in the payment review service.
- The admin panel hiding menu items is UX; the API is the boundary.
- Admin reads are the only cross-user reads in the system. No admin can edit a user's finance records.

## Planned

Per-module admin permissions, a read-only support role, multi-user access to one subscriber's projects (Phase 3).
