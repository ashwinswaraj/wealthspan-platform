# User Roles

> Status: Draft · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Roles today

| Role | App | How it is decided |
| --- | --- | --- |
| **User** (subscriber) | `apps/web` | Any signed-in Catalyst user (Google / Zoho / email). Sees only their own rows. |
| **Admin** | `apps/admin` | E-mail is in `ADMIN_EMAILS`; if `ADMIN_USER_IDS` is also set, the Catalyst user id must be listed too (`apps/api/src/features/admin/service.ts`). |

There is a single user role: no separate account types. A user's subscription state is **Free** (no live plan), **Go** (trial) or **Pro** (paid).

## Not built

- Finer admin roles (support, finance, read-only): Planned, see `Admin/122_Admin_Roles.md`.
- Multi-user access to one set of books (family member, accountant): Phase 3.

## References

- `apps/api/src/features/admin`
- [Permissions Matrix](11_Permissions_Matrix.md)
