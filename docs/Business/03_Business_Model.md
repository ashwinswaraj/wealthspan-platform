# Business Model

> Status: Draft · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Purpose

How Wealthspan makes money and what it costs to serve a user.

## Model

Subscription (SaaS) for individuals and small-business owners in India.

- **Free "Go" trial:** 30 days, one per user (enforced by a unique `trial:<userId>` key).
- **Pro:** monthly or annual (see [Pricing](05_Pricing.md)).
- No ads, and user data is never sold.

## Cost drivers

- Zoho Catalyst functions, Data Store and authentication.
- AI chat via Sarvam (`sarvam-105b`); capped at 40 messages per user per day (`DAILY_CHAT_LIMIT`) to put a ceiling on cost per user.
- File generation (PDF / Excel / CSV / Word) runs in the `files` function.

## Revenue flow today

The user pays by UPI, enters the 12-digit UTR in the app, and an admin approves the payment, which starts the subscription. This is manual by design for launch; an automated gateway is TBD (see `docs/Integrations/49_Payment_Gateway.md`).

## Open questions

- Gateway choice and GST invoicing for subscriptions: TBD.
- Whether Free keeps limited access after the trial: TBD (not implemented; access ends at `endsOn`).

## References

- `apps/api/src/features/subscription`
- [Master Context](../00_Master_Context.md)
