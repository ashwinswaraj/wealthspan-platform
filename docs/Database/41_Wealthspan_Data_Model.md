# Wealthspan — Data Model

Status: DRAFT v1 · Owner: Ashwin Swaraj · Date: 2026-10-24

Code that implements these rules (and must stay in sync with this file):

- `packages/constants/src/finance.ts` — fixed lists, chatbot tool policy
- `packages/types/src/finance.ts` — record shapes
- `packages/validation/src/finance.ts` — input rules
- `packages/utils/src/finance.ts` — all calculations (summary, balances, loans, duplicate guards)

This document describes the model, not a database product. Table/column
names (snake_case) are decided when the database choice is confirmed.

## 1. The big picture

```
User
 ├─ Accounts   (Cash, HDFC bank, SBI credit card, a wallet …)
 └─ Projects   (Personal, Kirana Shop, Freelance …)
      ├─ Transactions  (income / expense / transfer)
      ├─ Loans         (debt / EMI)
      ├─ Investments   (savings & investing)
      └─ Events        (festivals & functions)
```

- Everything is stored together, keyed by `user_id`. Users never see each
  other's rows. There is NOT one database per user.
- **All money movements live in ONE transactions table.** A project is a
  label on a transaction, not a separate place. This is what makes
  "everything combined" reports possible.
- Money is integer paise. Dates are `YYYY-MM-DD`.
- Every record has `created_by` (`manual` / `chatbot` / `system`),
  timestamps and `deleted_at` (soft delete, recoverable for 30 days).

## 2. Transaction types

| Type     | Meaning                              | Required                                               | Counts toward profit     |
| -------- | ------------------------------------ | ------------------------------------------------------ | ------------------------ |
| income   | money came in                        | project, account, payment mode, category, amount, date | yes                      |
| expense  | money went out                       | project, account, payment mode, category, amount, date | yes (except open events) |
| transfer | own money moved between own accounts | from account, to account, amount, date                 | **never**                |

Transfer is how a credit-card bill payment, a cash deposit, or money put
into an investment is recorded. This is what prevents counting the same
rupee twice.

**Payment mode is a fixed, required list:** cash, upi, debit_card,
credit_card, bank_transfer, cheque, wallet. The mode must suit the account
(`PAYMENT_MODE_ACCOUNT_KINDS`): cash↔cash account, credit_card↔credit card
account, etc.

## 3. Accounts

Kinds: `cash`, `bank`, `credit_card`, `wallet`.

`balance = opening + income − expense − transfers out + transfers in`

A credit card is a liability: spending makes its balance negative (the
dues); paying the bill is a transfer from a bank account and brings it back
to zero.

## 4. Projects and income sources

A project is a "money space" with its own profit and loss.

- Personal expenses and salary → the **Personal** project.
- Each business → its own project.
- An income source gets its own project **only if it has its own costs and
  its own profit to track** (shop, freelance work, a rented property with
  maintenance). Otherwise it is just the `source` field on income
  transactions (e.g. "Salary — ABC Ltd"), and reports can group by source.

## 5. The five sections of the app

| Section               | What it is                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Income                | transactions with type = income                                                                                                                              |
| Expense               | transactions with type = expense                                                                                                                             |
| Debt, loan, EMI       | Loans list. Each EMI is an expense transaction linked by `loan_id`. Outstanding = loan amount − linked EMIs (Phase 1: interest is not split from principal). |
| Savings & investing   | Investments list. Money put in is a **transfer** (`investment_id`), never an expense. The current value is typed in by the user.                             |
| Festivals & functions | Events with an optional budget. Expenses link to an event with `event_id`.                                                                                   |

## 6. Events: how a festival moves into Expense

- While an event is **open**, its expenses are real transactions: account
  balances drop immediately (the money has really gone). They are shown in
  a separate "open events" line and per event, and are **not** in the
  Expense total.
- When the user **concludes** the event, the same rows start counting as
  normal Expense (category "Festival: <name>"), on their **own dates**.
  No new transaction is created, so nothing is counted twice.
- Reopening a concluded event reverses this. Both actions need confirmation.
- Reports can be by calendar year or financial year (April–March).

## 7. Double-counting guards (manual entry)

- A user can choose "Transfer" and pick the two accounts.
- If an expense looks like a card bill (`looksLikeCardBillPayment`), or has
  the same amount as a credit-card expense in the last 45 days
  (`findSameAmountCardExpenses`), the app warns and offers to record it as a
  transfer instead.

## 8. Chatbot rules

The chatbot never touches the database. It calls fixed tools; the server
enforces everything. The user's identity comes from the login token only.

| Level   | Tools                                     | Behaviour                                      |
| ------- | ----------------------------------------- | ---------------------------------------------- |
| none    | search / summary / list / generate file   | runs immediately                               |
| undo    | create_*                                  | runs immediately, shows Undo                   |
| confirm | update__, delete__, conclude/reopen event | shows what will change, waits for confirmation |

- More than 3 rows affected in one call → always confirm.
- Deletes are soft deletes (30 days).
- Numbers always come from `packages/utils/src/finance.ts`, never from the
  model. The model only explains them.
- Every change is written to an audit log (actor, tool, before, after, undone_at).

## 9. Not in Phase 1

SMS reading, bank/card auto-connect, Account Aggregator, statement upload
(Phase 2); GST / tax filing, multi-user roles, forecasts (Phase 3).
