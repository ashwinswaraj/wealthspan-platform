# Pricing

> Status: Draft · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Source of truth

Plans and prices are defined only in `PLANS` in `apps/api/src/features/subscription/types.ts`. Prices are in paise.

| Plan id | Name | Price | Access |
| --- | --- | --- | --- |
| `trial` | 1 month free trial ("Go") | Rs. 0 | 30 days |
| `pro_monthly` | Pro, monthly | Rs. 199 | 30 days |
| `pro_annual` | Pro, annual | Rs. 1,999 | 365 days |

Tiers shown in admin: **Free / Go / Pro** (`trial` is Go; paid plans are Pro).

## Rules

- One trial per user.
- A payment can be approved only once (`pay:<paymentId>` key); a UTR already submitted is rejected as a duplicate.
- Access runs from `startsOn` to `endsOn` (last day with access).

## Open questions

- Final launch prices and any discount codes: TBD.
- Whether prices include GST: TBD.
