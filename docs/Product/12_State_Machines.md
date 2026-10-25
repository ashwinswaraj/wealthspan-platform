# State Machines

> Status: Draft · Owner: TBD · Last updated: 2026-08-31

## Purpose

Document the order lifecycle state machine as it's actually defined in
code — `packages/constants/src/orders.ts`'s `OrderStatus` type, which both
`apps/web` (client order creation) and `apps/admin` (Order Desk) read from
the same live registry (`orderRegistry.ts`).

## Scope

- Covers: the `OrderStatus` enum as coded today
- Does not cover: whether every state transition shown below is actually
  enforced/validated anywhere — the type only defines the possible states,
  it doesn't itself prove which transitions are guarded

## Details

Numbered stages, straight from the source comments in `orders.ts`:

| # | Status | Meaning |
| --- | --- | --- |
| 1 | `pending` | Pending Review (new order) |
| 1b | `info_requested` | Awaiting Client Info (admin asked for more details) |
| 1c | `rejected` | Rejected — archived, admin declined with a reason |
| 2 | `awaiting_payment` | Bill sent, awaiting payment |
| 3 | `payment_received` | Payment received, ready to assign |
| 4 | `assigned` | Assigned — requirement clarity stage |
| 5 | `progress` | In progress |
| 5b | `abandoned` | No professional response / dropped |
| 6 | `qa` | In QA |
| 7 | `delivered` | Delivered |
| 8 | `awaiting_approval` | Awaiting client approval |
| 9 | `rework` | In rework |
| 10 | `disputed` | Disputed |
| 11 | `released` | Escrow released — archived |
| 12 | `cancelled` | Cancelled & refunded — archived |
| 13 | `resolved` | Resolved disputes — archived |

This is a single linear-ish lifecycle with branch points (info request /
rejection early, abandonment mid-flow, dispute/rework late) rather than a
strict linear pipeline — states 1b, 1c, 5b, and 10 are all off-ramps from
the main 1→13 path, not sequential steps within it.

## Open Questions

- [ ] No formal state-transition table exists yet (which statuses can
      legally follow which) — only the enum of possible states
- [ ] Whether transition validity is enforced anywhere in code today, or
      only conventionally

## References

- `packages/constants/src/orders.ts`
- `packages/constants/src/orderRegistry.ts`
- `docs/Platform/31_Order_Lifecycle.md`, `docs/Admin/96_Order_Desk.md` (product-level specs, still drafts)
