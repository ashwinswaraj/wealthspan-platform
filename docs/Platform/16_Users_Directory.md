# Users Directory (user app)

> Status: Not applicable to the user app · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

Subscribers never see other users: every row is keyed by `user_id` and every store method is scoped to one user (`apps/api/src/features/catalog/types.ts`).

## What the user app has instead

- A profile and plan view from `GET /finance/me` and `GET /finance/subscription`.
- Own **Accounts** (cash, bank, credit card, wallet) and **Projects** lists.

The cross-user directory exists only in the admin panel: see `docs/Admin/92_Users_Directory.md`.

## References

- [Data model](../Database/41_Wealthspan_Data_Model.md)
