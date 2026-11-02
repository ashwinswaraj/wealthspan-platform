# Entries & Transactions Lifecycle

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

States an entry goes through from creation to removal.

## Transaction

1. **Created** manually (sheet) or by the chatbot (`created_by`). Server validates fields, payment mode vs account, and runs duplicate guards (card-bill and same-amount warnings).
2. **Live**: counted in balances and in the summary.
3. **Edited**: changes by hand apply at once; by the chatbot they need confirmation.
4. **Deleted**: soft delete (`deleted_at`); recoverable for 30 days.

## Festival or function (event)

`open` (expenses move balances, but are excluded from Expense total) -> `concluded` (same rows count as Expense on their own dates, category "Festival: name") -> may be reopened (reverses it). Endpoints: `/finance/events/:id/conclude` and `/reopen`. Both need confirmation.

## Loan

`active` -> closed (`/finance/loans/:id/close`) -> reopened. Each EMI is an expense linked by `loan_id`.

Every change is audit-logged.

## References

- [Data model](../Database/41_Wealthspan_Data_Model.md)
