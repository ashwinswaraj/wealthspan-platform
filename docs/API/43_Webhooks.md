# Webhooks

> Status: Draft · Last updated: 2026-11-01

There are no inbound or outbound webhooks in Phase 1. Payments are manual UPI submissions reviewed by an admin, so no gateway callback exists.

If a payment gateway is chosen (TBD), its webhook would need: signature verification, idempotency on the gateway event id (the same idea as the unique `sub_key` on subscriptions), and a Catalyst function route that is the only one exempt from the session check. None of this is built.
