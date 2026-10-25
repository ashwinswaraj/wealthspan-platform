# Admin Documentation

Specs for the Jobrio Super Admin panel (`apps/admin`).

Files are numbered by topic and organized flat in this folder:

| Range | Contents |
| --- | --- |
| `91`–`106` | One doc per admin module (Dashboard, Users Directory, Access Control, Workforce Control, Services Desk, Order Desk, Assignment Engine, QA Desk, Finance & Escrow, Dispute Center, Communication Center, Platform Rules, Policies, Audit & Logs, Security, System). |
| `107`–`115` | Admin design system, tokens, navigation, layout, table and form standards. |
| `116`–`121` | Cross-module admin processes: order review, assignment, QA, payments, disputes, communication. |
| `122`–`124` | Admin roles, RBAC and per-module permissions. |

Admin-only API contracts consumed by `apps/admin` live in `docs/API/` as the
API surface grows.

Context: `90_Admin_Context.md`. Decisions: `docs/ADR/ADR-006` … `ADR-010`.
