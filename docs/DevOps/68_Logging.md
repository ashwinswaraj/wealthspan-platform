# Logging

> Status: Draft · Last updated: 2026-11-01

Functions log with `console.error` to Catalyst's function logs. Rules in code:

- Log only a truncated error message (`.slice(0, 200..300)`), never request bodies, chat text, tokens or `SARVAM_API_KEY`.
- The browser never receives stack traces; `jsonErrors` returns a short JSON message.
- Business-level history is the `audit_log` table, not the function logs.
- A refused admin attempt (listed e-mail, wrong user id) is logged as a warning without the id.

Retention follows Catalyst's log settings; TBD whether to export logs.
