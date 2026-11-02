# Subscription Payment Lifecycle

> Status: Active (manual UPI); gateway TBD · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## States

- Subscription: `trial` (30 days, once) or paid (`pro_monthly`, `pro_annual`). `free` when none is live.
- Payment submission: `pending` -> `approved` or `rejected`.

## Flow

1. User starts the trial (`POST /finance/subscription/trial`); duplicates are rejected by unique `sub_key` `trial:<userId>`.
2. For Pro, user pays by UPI and submits UTR (`POST /finance/subscription/payments`). A UTR is accepted once.
3. Admin checks the bank statement and approves or rejects with a note.
4. Approval creates the subscription (`sub_key` `pay:<paymentId>`, so one payment cannot be approved twice); access runs `startsOn` to `endsOn`.

## TBD

Gateway, auto-renewal, invoices, refunds.
