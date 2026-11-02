# Security Policies

> Status: Draft · Last updated: 2026-11-01

Controls in place (all in code):

1. **CSRF:** writes need `X-Requested-With: wealthspan`; `Sec-Fetch-Site: cross-site` is refused; functions never answer CORS preflights.
2. **Headers:** `X-Content-Type-Options: nosniff`, `Cache-Control: no-store`, `x-powered-by` removed.
3. **Errors:** `jsonErrors` returns short JSON; 500s log a truncated message only.
4. **Input:** shared validation rules (`packages/validation`); bodies capped at 32 kb; ZCQL strings escaped; ids checked as digits.
5. **Isolation:** `user_id` filter on every query.
6. **Admin pinning** and **entitlement** checks ([RBAC](RBAC.md)).
7. **Abuse limits** ([Rate Limiting](62_Rate_Limiting.md)); unique `sub_key` and UTR stop duplicate trials and payments.
8. **Supply chain:** CI audit, CodeQL, secret scan.

Policy: least privilege, no secrets in repo, no raw user text in logs, review before launch.
