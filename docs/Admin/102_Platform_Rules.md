# Platform Rules

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Admin-side rules

- Admin routes are read-mostly; the only write today is approving or rejecting a payment.
- Never show user-typed content.
- Show a dash, not a guess, when data is missing.
- Money is integer paise; format with `formatINR`.
- Product rules: `docs/Platform/26_Platform_Rules.md`.
