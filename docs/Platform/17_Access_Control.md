# Access Control

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

Decide who may call what in the user app.

## Rules

- Identity: Zoho Catalyst Cloud Scale Embedded Authentication (Google, Zoho or email). The browser session cookie authenticates every call to `/server/*`.
- The server takes the user id from the session only; neither the browser nor the AI model supplies it.
- Every query is filtered by `user_id`; there is one shared database, not one per user.
- Writes need the header `X-Requested-With: wealthspan` (CSRF guard in `apps/api/src/middleware/security.ts`) and are rate limited.
- Paid features check entitlement (`createSubscriptionService`): free, trial ("Go") or Pro.
- Admin routes (`/finance/admin/*`) are separate: see `docs/Admin/93_Access_Control.md`.
- Multi-user roles for one account (for example an accountant) are Planned (Phase 3).

## References

- [Data model](../Database/41_Wealthspan_Data_Model.md)
