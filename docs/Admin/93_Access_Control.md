# Access Control

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## How admin access works

- Every `/finance/admin/*` request passes an admin check at the edge (`app.use("/admin", ...)` in the finance function).
- Admin = email in `ADMIN_EMAILS`; if `ADMIN_USER_IDS` is set the Catalyst user id must also be listed, so registering with someone else's email is not enough.
- Bootstrap: read your id from `GET /admin/me`, then pin it.
- Writes need the CSRF header; the admin UI sends `X-Requested-With: wealthspan`.

Finer roles: `123_RBAC.md` (Planned).
