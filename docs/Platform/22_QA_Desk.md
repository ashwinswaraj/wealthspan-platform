# Data Quality

> Status: Partly built (guards shipped; review Planned) · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

Keep the numbers trustworthy.

## Shipped (in `packages/utils/src/finance.ts`)

- `looksLikeCardBillPayment`: warns that a card-bill expense is really a transfer.
- `findSameAmountCardExpenses`: flags an expense with the same amount as a credit-card expense in the last 45 days.
- Validation of required fields and payment mode vs account (`packages/validation`).

## Planned

A review list of suspected duplicates and anomalies for the user. Lifecycle: `33_QA_Lifecycle.md`.

## References

- [Data model](../Database/41_Wealthspan_Data_Model.md)
