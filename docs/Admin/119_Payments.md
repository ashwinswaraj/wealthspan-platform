# Payment Approval Process

> Status: Active (manual) · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Steps

1. Open Subscriptions & Billing, filter Pending.
2. Match the user's UTR and `WSP-` reference with the bank statement (amount must equal the plan price).
3. Approve: a subscription is created from today. Reject: add a note.
4. Duplicate UTRs are refused by the server; an approved payment cannot be approved twice.

Gateway automation is TBD.
