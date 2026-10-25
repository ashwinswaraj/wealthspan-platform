# Payment Gateway

> Status: Draft · Owner: TBD · Last updated: 2026-08-31

## Purpose

Document the actual state of payment integration — which is currently
**scaffolding and UI mockup, not a live integration**.

## Details

- `apps/api/.env.example` declares `STRIPE_SECRET_KEY` — the name is
  reserved, but no code in the repo actually calls the Stripe API.
- `apps/admin`'s settings screen (`features/admin-dashboard/components/sections/system.tsx`)
  displays `"Stripe"` as a configured provider, and its audit log
  (`sections/audit.tsx`) shows simulated events like
  `stripe.payment_intent.succeeded` — **this is static display/demo data**,
  not a real webhook feed.
- `apps/admin`'s finance section explicitly marks unwired actions, e.g. a
  button labeled `"Resend Invoice · Backend Required"` — the team has
  already flagged these as not functional (see `UX_INTEGRITY_AUDIT.md`,
  which found the same pattern across "payment-provider transactions and
  QR/UPI collection").
- `packages/constants/src/services.ts` mentions "Stripe, PayPal, Razorpay"
  as an example of a *service Jobrio professionals might offer clients*
  (payment-integration consulting) — unrelated to Jobrio's own payment
  processing.

## What this means

Nothing here should be read as "Stripe is integrated." The env var and UI
exist as placeholders for when a real integration is built.

## Open Questions

- [ ] Which payment provider is actually chosen (Stripe is the only one
      with a reserved env var, but that's not the same as a decision)
- [ ] Escrow/release mechanics (referenced throughout `OrderStatus` as
      `released`/`disputed`) currently have no backing payment
      infrastructure at all

## References

- `apps/api/.env.example`
- `UX_INTEGRITY_AUDIT.md`
- `docs/Platform/23_Finance_&_Escrow.md`, `docs/Admin/99_Finance_&_Escrow.md` (product specs, still drafts)
