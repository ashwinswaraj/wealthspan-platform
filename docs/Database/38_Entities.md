# Entities

> Status: Draft · Last updated: 2026-11-01

| Entity             | Table                 | Meaning                                                                                                              |
| ------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Project            | `projects`            | A money space (Personal, a shop, freelance work) with its own profit and loss                                        |
| Account            | `accounts`            | Cash, bank, credit card or wallet; balance = opening + income - expense - transfers out + transfers in               |
| Transaction        | `transactions`        | One money movement: `income`, `expense` or `transfer`                                                                |
| Loan               | `loans`               | Debt / EMI; EMIs are expense transactions linked by `loan_id`                                                        |
| Investment         | `investments`         | Savings and investing holding; money put in is a transfer linked by `investment_id`; current value typed by the user |
| Event              | `events`              | Festival or function with optional budget; expenses link by `event_id`                                               |
| Audit entry        | `audit_log`           | Who changed what, before and after (actor: `manual`, `chatbot`, `system`)                                            |
| Subscription       | `subscriptions`       | A trial or paid period (`sub_key` is unique: `trial:<userId>` or `pay:<paymentId>`)                                  |
| Payment submission | `payment_submissions` | A user's UPI payment claim (plan, amount, 12-digit UTR) awaiting admin review                                        |
| Chat usage         | `chat_usage`          | Messages used per user per IST day (`usage_key` = `<userId>:<day>`)                                                  |

Users and login sessions are owned by Catalyst Authentication; there is no profile table yet.
