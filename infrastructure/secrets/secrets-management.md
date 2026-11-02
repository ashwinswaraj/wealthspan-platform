# Secrets Management

`[SEC]` Policy for handling secrets in this repo. No actual secret values live here or anywhere in version control.

## Current state

Wealthspan runs on Zoho Catalyst, so secrets live in Catalyst, not in files:

- **Non-secret settings** (`NODE_ENV`, `ADMIN_EMAILS`, `ADMIN_USER_IDS`) are in each function's
  `catalyst-config.json`.
- **Secrets** (`SARVAM_API_KEY`) are set in the Catalyst console (Functions → the function → Environment
  Variables). A deploy wipes variables that are not in `catalyst-config.json`, so **re-set `SARVAM_API_KEY`
  after every deploy**.
- `.env.example` (root and `apps/api`) list variable **names** only, never values.
- The browser build uses only public settings (`VITE_API_BASE`). Nothing with `KEY`, `SECRET` or `TOKEN` in its
  name may ever be prefixed `VITE_` or bundled client-side.
- Google sign-in needs an OAuth Client ID/Secret; they are entered in the Catalyst console (Authentication →
  Social login), not in code.

## Rules

- `[SEC]` Never commit a real `.env` file, a Catalyst token or an API key.
- `[SEC]` Never log a secret, return one in an API response, or paste one into a commit, issue or PR.
- `[RULE]` A new secret means adding its **name** to `.env.example` in the same change.
- `[SEC]` If a key or token is ever pasted into chat or a ticket, treat it as leaked and rotate it.

## Rotation

Rotate `SARVAM_API_KEY` and any Catalyst CLI token whenever they might have been exposed, and at least once a
year. After rotating, set the new value in the console and redeploy.

## References

- `apps/api/.env.example`, `.env.example`
- `apps/api/catalyst/functions/*/catalyst-config.json`
- `docs/Security/61_Secrets_Management.md`
