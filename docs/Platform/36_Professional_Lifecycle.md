# Subscriber Account Lifecycle

> Status: Active (core); closure Planned · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Stages

1. **Sign up** via Catalyst auth (Google, Zoho or email).
2. **Free**: no live subscription.
3. **Go trial**: 30 days, one per user.
4. **Pro**: monthly or annual after an approved payment; back to Free when `endsOn` passes.
5. **Suspended**: the admin directory shows an inactive user as Suspended.
6. **Closure and data export** (Planned): users can export their data today via files; account deletion is not built.

Admin sees the stage as Free, Go or Pro with validity (`GET /finance/admin/users`).
