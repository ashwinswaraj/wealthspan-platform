# Admin Documentation

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

Specs for the Wealthspan Super Admin panel (`apps/admin`). The panel has six screens today: Overview, User Directory, Subscriptions & Billing, Security & Access Logs, Financial Ledger & Projects, System Configuration & Health.

Files are numbered by topic and organized flat in this folder:

| Range       | Contents                                                                                                                                                                                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `91`–`106`  | One doc per admin module (Dashboard, Users Directory, Access Control, Admin team and roles, Plans and Catalog, Entry review, Chatbot actions, Data quality, Billing, Support and refunds, Communication Center, Platform Rules, Policies, Audit and Logs, Security, System). |
| `107`–`115` | Admin design system, tokens, navigation, layout, table and form standards.                                                                                                                                                                                                   |
| `116`–`121` | Cross-module processes: entry review, chatbot actions, data quality, payments, support and refunds, communication.                                                                                                                                                           |
| `122`–`124` | Admin roles, RBAC and per-module permissions.                                                                                                                                                                                                                                |

Each doc marks what is shipped versus Planned/TBD. Admin API: `/server/finance/admin/*` (`apps/api/src/features/admin`).

Context: `90_Admin_Context.md`. Decisions: `docs/ADR/ADR-006` … `ADR-010`.
