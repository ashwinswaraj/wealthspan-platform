# Secrets Management

> Status: Draft · Last updated: 2026-11-01

- `SARVAM_API_KEY` is set as a function environment variable in the Catalyst console, never committed.
- `catalyst deploy` wipes env vars not listed in a function's `catalyst-config.json`, so after every deploy re-set `SARVAM_API_KEY`. Only non-secret values (`ADMIN_EMAILS`, `ADMIN_USER_IDS`, `NODE_ENV`) are committed.
- Google sign-in Client Secret lives in the Catalyst console.
- CI runs a secret scan (gitleaks) and `pnpm audit`.
- Never log secrets; never prefix a secret with `VITE_` (it would ship to the browser).
- If a key leaks: rotate it at the provider, re-set it, redeploy ([Incident_Response](Incident_Response.md)).
