# Platform Rules

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Rules the product enforces

1. Money is integer paise; dates are `YYYY-MM-DD`.
2. A transfer never counts as income or expense.
3. Open festival expenses reduce account balances at once but stay out of the Expense total until the event is concluded; then the same rows count on their own dates.
4. Deletes are soft (30 days). Every record has `created_by` and timestamps.
5. Users only ever see their own rows.
6. Statistics come from `packages/utils/src/finance.ts`, never from the model.
7. One free trial per user (unique `sub_key`).
8. Chatbot limit: 40 messages per user per day (IST).

## References

- [Data model](../Database/41_Wealthspan_Data_Model.md)
