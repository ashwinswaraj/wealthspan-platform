# ADR-002: API as Zoho Catalyst Advanced I/O functions (Express)

> Status: Accepted · Last updated: 2026-11-01

## Context

The owner chose to run everything on Zoho Catalyst. Advanced I/O functions have a 30 s execution limit and are reached at `/server/<function>/...` on the app's own domain.

## Decision

Three Node 22 Express functions, built from `apps/api/src/features/*` by `apps/api/catalyst/build.mjs`:

| Function  | Job                                                                  |
| --------- | -------------------------------------------------------------------- |
| `finance` | transactions, summary, catalog entities, subscription, admin console |
| `chat`    | AI accountant (Sarvam `sarvam-105b` behind an adapter)               |
| `files`   | PDF / Excel / CSV / Word exports and sheet `.xlsx`                   |

The browser calls them same-domain with the session cookie; the user id is read from the Catalyst session on every request and never from the body or query.

## Consequences

- No separate API gateway; the 30 s limit forces the Sarvam client to time out below 30 s.
- Rate limits are in memory per function instance (a brake, not an exact quota).
- Generated `functions/*/index.js` is committed and must be rebuilt after source changes.

## References

- [API Architecture](../API/41_API_Architecture.md), [API Specification](../API/42_API_Specification.md)
