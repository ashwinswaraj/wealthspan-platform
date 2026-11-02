# Data Classification

> Status: Draft · Last updated: 2026-11-01

| Class              | Examples                                                     | Handling                                                                 |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Secret             | `SARVAM_API_KEY`, Google client secret                       | env vars only; never logged                                              |
| Sensitive personal | transactions, balances, loans, investments, notes, chat text | per-user isolation, HTTPS, not in logs, sent to Sarvam only as chat text |
| Personal           | name, e-mail, UTR                                            | admin-visible only where needed                                          |
| Operational        | health checks, quota counters, audit log                     | admin-visible                                                            |
| Public             | landing page, docs                                           | -                                                                        |

Out of scope in Phase 1 (not collected): bank credentials, card numbers, government IDs, SMS content.
