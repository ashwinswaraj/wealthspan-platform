# Security

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Controls in code

- Catalyst Embedded Authentication; session cookie; user id only from the session.
- CSRF: writes require `X-Requested-With: wealthspan`; cross-site requests are refused (`apps/api/src/middleware/security.ts`).
- Per-user in-memory rate limit plus a Data Store daily chat quota.
- JSON error handler that does not leak stack traces; `no-store` caching.
- Admin access needs an allowlisted email, optionally pinned to a Catalyst user id.
- Admin screens never show what a user typed (names, categories, notes).

Threat model and policy: `docs/Security/`.
