# Relationships

> Status: Draft · Last updated: 2026-11-01

```
user (Catalyst) 1 - n  projects, accounts
project         1 - n  transactions, loans, investments, events
account         1 - n  transactions (account_id, or from_account_id / to_account_id for a transfer)
loan            1 - n  transactions (EMI expenses, loan_id)
investment      1 - n  transactions (transfers into it, investment_id)
event           1 - n  transactions (event_id)
user            1 - n  subscriptions, payment_submissions, audit_log, chat_usage
payment_submission 1 - 0..1 subscription (approval creates it; paymentId)
```

References are plain bigint ids with no database foreign keys, so the server decides what happens on delete: something still used by transactions cannot be deleted (409) and should be archived or closed instead. Every lookup also checks the row's `user_id`.
