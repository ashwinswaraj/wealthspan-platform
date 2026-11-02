# Payment Gateway

> Status: Draft · Last updated: 2026-11-01

**Gateway: TBD. No payment provider is integrated.**

## What exists today

Manual UPI flow (`apps/api/src/features/subscription`):
1. User picks `pro_monthly` (Rs. 199) or `pro_annual` (Rs. 1,999) and pays by UPI outside the app.
2. User submits plan, amount and the 12-digit UTR (`POST /subscription/payments`). The amount must match the plan; a UTR can only be used once.
3. An admin approves or rejects it in the admin panel (`/admin/payments/:id/approve|reject`). Approval creates the subscription exactly once (unique `sub_key`).

The free 1-month trial needs no payment (`POST /subscription/trial`, once per user).

## Why this is temporary

Manual review does not scale, has no automatic renewals and no automatic refunds. Prices are in `PLANS` and are placeholders until pricing is decided.

## Open decisions

- [ ] Gateway (Razorpay, Cashfree, PhonePe, other) and UPI AutoPay for renewals
- [ ] Webhook design: see [API/43_Webhooks.md](../API/43_Webhooks.md)
- [ ] GST invoicing and who issues it (needs an accountant)
- [ ] Refund automation: see [Legal/83_Refund_Policy.md](../Legal/83_Refund_Policy.md)

Never store card or bank credentials; a gateway would keep them.
