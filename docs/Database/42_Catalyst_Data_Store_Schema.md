# Wealthspan — Catalyst Data Store schema (Development env)

Project: Wealthspan (id `64308000000013049`), org `60090691965`, Development environment.
Created 2026-10-24. Model spec: `41_Wealthspan_Data_Model.md`.

Rules
- Every table is scope GLOBAL; **the server filters by `user_id` on every query** (taken from the Catalyst session, never from the client).
- `id` in the API = Catalyst `ROWID`. Created/modified time = system `CREATEDTIME` / `MODIFIEDTIME`.
- Money = `bigint` paise. Dates = `date` (`YYYY-MM-DD`). Soft delete = `deleted_at` (purged after 30 days by a cron function).
- References between tables are plain `bigint` ids (no DB foreign keys) so the server controls soft-delete behaviour.
- `date` is a reserved-looking word, so the transaction date column is `tx_date`.

| Table | Table id | Columns (besides system ones) |
|---|---|---|
| projects | 64308000000032001 | user_id, name, kind, archived_at, deleted_at, created_by |
| accounts | 64308000000033001 | user_id, name, kind, opening_balance_paise, credit_limit_paise, default_project_id, archived_at, deleted_at, created_by |
| transactions | 64308000000034001 | user_id, type, amount_paise, tx_date, project_id, account_id, from_account_id, to_account_id, event_id, loan_id, investment_id, payment_mode, category, party, source, note, deleted_at, created_by |
| loans | 64308000000035001 | user_id, project_id, lender, principal_paise, interest_rate_pct, emi_paise, emi_day_of_month, start_date, tenure_months, status, deleted_at, created_by |
| investments | 64308000000036001 | user_id, project_id, name, kind, current_value_paise, folio_no, deleted_at, created_by |
| events | 64308000000033360 | user_id, project_id, name, budget_paise, start_date, end_date, status, concluded_at, deleted_at, created_by |
| audit_log | 64308000000034360 | user_id, actor, action, entity, entity_id, before_json, after_json, undone_at |

Not yet created: chat history table, pending-confirmation table, users/profile table.
Production environment must be created by deploying/promoting Development.
Secrets (Sarvam key etc.) live only in function environment variables, never in the repo.
