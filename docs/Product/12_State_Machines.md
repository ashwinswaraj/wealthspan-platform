# State Machines

> Status: Draft · Owner: Ashwin Swaraj · Last updated: 2026-11-01

States as coded in `packages/constants/src/finance.ts` and `apps/api/src/features/subscription`.

## Event (festival / function)

`open` → `concluded` → (reopen) `open`. While open, expenses move account balances but are shown on a separate "open events" line, not in the Expense total. Conclude and reopen both need confirmation; no row is duplicated.

## Loan

`active` ⇄ `closed` (`/loans/:id/close|reopen`). Outstanding = loan amount − linked EMI expenses.

## Project / account

Active ⇄ archived (`archivedAt`). Deleting something still used by transactions returns 409.

## Any record

Live → soft-deleted (`deletedAt`) → recoverable for 30 days (`SOFT_DELETE_RETENTION_DAYS`).

## Payment submission

`pending` → `approved` | `rejected` (`PaymentStatus`). Approval creates a subscription keyed `pay:<paymentId>`, so it can happen only once.

## Subscription

No live row = **Free**. `trial` (30 days, once) = **Go**. `pro_monthly` / `pro_annual` = **Pro**. Access ends after `endsOn`.

## Chatbot tool call

`proposed` → (`none`: run) | (`undo`: run, offer Undo) | (`confirm`: show change, wait). More than 3 affected rows always needs confirmation. Status: policy defined, tools Planned.
