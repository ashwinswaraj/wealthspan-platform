# Subscription Billing

> Status: Active (manual UPI); gateway TBD · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

Approve Pro payments and see revenue.

## Screen: Subscriptions & Billing

- Pending, approved, rejected payments (`GET /admin/payments?status=`): UTR, user email, reference code `WSP-xxxxx`, plan, amount, date.
- Approve or reject with a note: `POST /admin/payments/:id/approve|reject`. Approval creates the subscription.
- Check the UTR and reference against the bank statement before approving.
- MRR comes from the overview.

No payment gateway exists; choosing one is TBD.
