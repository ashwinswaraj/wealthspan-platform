# State-Based Actions

> Status: Active · Last updated: 2026-11-01

**Rule:** a user action is allowed only if the record's current state, the user's rights and the business rule all allow it. Hiding a button is UX; the server decides.

## Where it applies in Wealthspan

| Thing                     | States                               | Rule                                                                                                                                                                                                                                                                                                           |
| ------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Event (festival/function) | `open` -> `concluded` -> `open`      | Conclude/reopen move its expenses between the "open events" line and normal Expense; both need confirmation. Same rows, no new transaction.                                                                                                                                                                    |
| Loan                      | `active` <-> `closed`                | `close` / `reopen` routes; EMIs stay linked by `loan_id`.                                                                                                                                                                                                                                                      |
| Project, account          | active <-> archived                  | Archive instead of delete when still used; deleting something in use answers 409.                                                                                                                                                                                                                              |
| Record                    | live -> soft-deleted (30 days)       | `deleted_at`; restore window, then purge (cron Planned).                                                                                                                                                                                                                                                       |
| Payment submission        | `pending` -> `approved` / `rejected` | Only an admin, only from `pending`; approval creates the subscription once (unique `sub_key`).                                                                                                                                                                                                                 |
| Chatbot action            | none / undo / confirm                | Defined in `packages/constants/src/finance.ts`; create_* runs with Undo, update/delete/conclude/reopen need confirmation, more than 3 rows always confirm. Tools are not built yet; when they are, the pending confirmation is stored on the server and used once, never a `confirmed: true` from the browser. |

## Known gap

The server enforces transitions in each service (for example a payment can only be reviewed from `pending`). Shared action-resolver code from the previous product has been removed; if one is added later it must be driven by the table above and call the same server rules.
