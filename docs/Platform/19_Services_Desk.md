# Plans & Catalog

> Status: Active (plans fixed in code; catalog shipped) · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

What a user can subscribe to, and the lists they pick from.

## Plans (`apps/api/src/features/subscription/types.ts`, `PLANS`)

| Plan id | Label | Price | Access |
| --- | --- | --- | --- |
| `trial` | 1 month free trial (shown as "Go") | free | 30 days, once per user |
| `pro_monthly` | Pro, monthly | Rs 199 (19900 paise) | 30 days |
| `pro_annual` | Pro, annual | Rs 1,999 (199900 paise) | 365 days |

## Catalog (`apps/api/src/features/catalog`)

Per-user records the sheets work on: `projects`, `accounts`, `events`, `loans`, `investments`. Soft delete only (recoverable for 30 days). Fixed lists (income and expense categories, payment modes, account kinds) live in `packages/constants/src/finance.ts`.

Prices are edited in code today; an admin editor is not wired (see `docs/Admin/95_Services_Desk.md`).
