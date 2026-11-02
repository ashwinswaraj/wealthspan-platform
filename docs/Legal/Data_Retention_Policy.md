# Data Retention Policy

> **Draft — not legal advice, needs lawyer review.** Operator: Wealthspan (legal entity, address and grievance officer: TBD). Last updated: 2026-11-01.

| Data                                        | Kept                                                                                                                                  | Then                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Finance records (transactions, loans, etc.) | while your account exists                                                                                                             | deleted with the account                                 |
| Soft-deleted records                        | 30 days, recoverable                                                                                                                  | purged (a scheduled purge job is Planned, not built yet) |
| Audit log                                   | TBD (proposed: 12 months after the change)                                                                                            | purged                                                   |
| Chat messages                               | not stored by Wealthspan today beyond the request; only a per-day message counter is kept (`chat_usage`). Sarvam's own retention: TBD | -                                                        |
| Subscriptions and payment submissions       | while the account exists; tax/accounting record rules may require longer (TBD with accountant)                                        | -                                                        |
| Function logs                               | per Catalyst log settings; contain no message text                                                                                    | -                                                        |
| Backups                                     | not defined yet                                                                                                                       | see DevOps/69                                            |

Account deletion (Planned) will remove the user's rows from all tables except records we are legally required to keep.
