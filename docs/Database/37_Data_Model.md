# Data Model (overview)

> Status: Draft · Last updated: 2026-11-01

Full model: [41_Wealthspan_Data_Model.md](41_Wealthspan_Data_Model.md). Physical tables: [42_Catalyst_Data_Store_Schema.md](42_Catalyst_Data_Store_Schema.md).

In one paragraph: a user owns Accounts and Projects. Projects hold Transactions (income / expense / transfer), Loans, Investments and Events. All users share one table set, separated by `user_id` which the server takes from the Catalyst session. Money is integer paise, dates are `YYYY-MM-DD`, deletes are soft for 30 days, and every change is written to `audit_log`.

Platform tables (not part of the finance model): `subscriptions`, `payment_submissions`, `chat_usage`.

Code that must stay in sync: `packages/constants/src/finance.ts`, `packages/types/src/finance.ts`, `packages/validation/src/finance.ts`, `packages/utils/src/finance.ts`.
