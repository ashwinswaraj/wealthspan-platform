# ADR-003: Catalyst Data Store, one shared table set keyed by user_id

> Status: Accepted · Last updated: 2026-11-01

## Context

Wealthspan needs relational money records, soft delete and an audit trail, without running a separate database product.

## Decision

Use Zoho Catalyst Data Store (queried with ZCQL). One set of tables for all users; every row has `user_id` and the server filters by it on every query. All money movements live in one `transactions` table; a project is a label on a transaction. Money is `bigint` paise, dates are `YYYY-MM-DD`, deletes are soft (`deleted_at`). No database foreign keys: the server controls referential behaviour (deleting something still used answers 409).

## Consequences

- Isolation is enforced in server code, not by a database policy, so every store method must take `userId` (covered by tests).
- ZCQL limits (no documented row cap, max 4 joins) shape reporting queries; calculations happen in `packages/utils`.
- Details: [Data Model](../Database/41_Wealthspan_Data_Model.md), [Schema](../Database/42_Catalyst_Data_Store_Schema.md).
