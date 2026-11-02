# Status and Enum Values

> Status: Draft · Last updated: 2026-11-01

Source of truth is code; this is a readable copy.

| Field                         | Values                                                                                | Defined in                                    |
| ----------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------- |
| transaction `type`            | income, expense, transfer                                                             | `packages/constants/src/finance.ts`           |
| `payment_mode`                | cash, upi, debit_card, credit_card, bank_transfer, cheque, wallet                     | same                                          |
| account `kind`                | cash, bank, credit_card, wallet                                                       | same                                          |
| event `status`                | open, concluded                                                                       | same                                          |
| loan `status`                 | active, closed                                                                        | same                                          |
| investment `kind`, categories | see `INVESTMENT_KINDS`, `INCOME_CATEGORIES`, `EXPENSE_CATEGORIES`                     | same                                          |
| `created_by`                  | manual, chatbot, system                                                               | same                                          |
| subscription plan             | trial (30 days, free), pro_monthly (Rs. 199), pro_annual (Rs. 1,999)                  | `apps/api/src/features/subscription/types.ts` |
| payment status                | pending, approved, rejected                                                           | same                                          |
| chatbot tool level            | none, undo, confirm                                                                   | `finance.ts` (tools not built yet)            |
| sheet keys                    | income, expense, debt-loan, savings-investing, festivals-functions, accounts, project | `packages/constants/src/sheets.ts`            |
