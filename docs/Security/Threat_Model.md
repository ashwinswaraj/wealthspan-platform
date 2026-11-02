# Threat Model

> Status: Draft · Last updated: 2026-11-01

| Threat | Mitigation today | Gap |
|---|---|---|
| Reading another user's data (wrong id) | `user_id` filter on every query, tests | no DB-level policy; rely on code review |
| CSRF on the session cookie | header + Sec-Fetch-Site guard | - |
| Admin takeover or look-alike e-mail | env-pinned e-mail + user id | admin account itself needs strong login (TBD MFA) |
| Chatbot abuse or prompt injection making destructive edits | tools not built; plan: fixed tools, server enforces user and confirmation | must be designed before tools ship |
| Cost abuse of AI | plan check, daily quota, 12-message/2000-char cap, 32 kb body | quota not atomic; no global spend cap |
| Free trial farming | unique `sub_key` per user | new accounts can still get new trials (TBD) |
| Fake payment claims | admin reviews UTR; UTR unique; amount must match | manual process, human error |
| DoS | per-instance rate limits | no shared limiter |
| Secret leak | env vars, gitleaks | wiped on deploy, must be re-set |
| Data loss | soft delete | no backups yet |
| Exports leaking data | login required, 5/min, own rows only | - |
