# ADR-004: Security baseline

> Status: Accepted · Last updated: 2026-11-01

## Decision

1. Login is Catalyst Cloud Scale Embedded Authentication (Google, Zoho, email). Session cookie, same domain as the functions.
2. Every function resolves the user from the session; no user id is accepted from the client.
3. CSRF: writes need header `X-Requested-With: wealthspan`; `Sec-Fetch-Site: cross-site` is refused; functions never answer CORS preflights.
4. Admin rights come only from env vars `ADMIN_EMAILS` and `ADMIN_USER_IDS` (when both are set, an admin needs both).
5. Chat needs an active plan or trial and has a daily quota (40 messages per IST day).
6. Secrets (`SARVAM_API_KEY`) live only in function env vars, never in the repo.

## Consequences

Rate limits are per instance and in memory. A review of the whole flow is required before launch. See [Security docs](../Security/Auth_Flow.md).
