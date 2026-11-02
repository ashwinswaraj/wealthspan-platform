# Entries & Transactions

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

How money movements are entered and viewed.

## Model

- **All money movements are ONE transactions table.** A project is a label on a row.
- Types: `income`, `expense`, `transfer` (own account to own account; never counts toward profit).
- Required: project, account, payment mode, category, amount (paise), date. Payment mode must suit the account kind.
- Entries are created by hand in a sheet or by the chatbot (`created_by`: `manual`, `chatbot`, `system`).
- Debt/EMI, investments and festival spending are linked via `loan_id`, `investment_id`, `event_id`.

API: `/finance/transactions` (list, create, update, delete) and `/finance/summary`. Lifecycle: `31_Order_Lifecycle.md`.

## References

- [Data model](../Database/41_Wealthspan_Data_Model.md)
