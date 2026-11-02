# Session Management

> Status: Draft · Last updated: 2026-11-01

Sessions are issued and expired by Catalyst Authentication (cookie, same domain). Our code never creates, stores or reads session tokens, only the resolved user. Sign-out is Catalyst's. Responses send `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`. Session lifetime and idle timeout: TBD in the Catalyst console. The CSRF header guard (see [Security Policies](63_Security_Policies.md)) protects the cookie-based session.
