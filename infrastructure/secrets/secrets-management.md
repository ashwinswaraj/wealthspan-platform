# Secrets Management

`[SEC]` Policy for handling secrets in this repo — no actual secret values
live here or anywhere in version control.

## Current state

No secrets vault/provider (Doppler, Vault, 1Password, etc.) is configured
in this repo. Secrets are currently handled via `.env` files (git-ignored)
seeded from each app's `.env.example`:

- Root `.env.example` and `apps/api/.env.example` list required variable
  **names** only — never real values.
- `apps/api/.env.example` currently declares: `DATABASE_URL`,
  `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`,
  `SESSION_TTL`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`.
- Root `.env.example` uses more generic names for the same kind of
  integrations (`PAYMENT_GATEWAY_KEY`, `EMAIL_API_KEY`, `SMS_API_KEY`,
  `MAPS_API_KEY`) rather than `apps/api`'s provider-specific ones
  (`STRIPE_SECRET_KEY`, `RESEND_API_KEY`) — this naming mismatch between
  root and `apps/api` hasn't been reconciled; don't assume they refer to
  configured values just because a name exists in one file.
- Client-side apps use `VITE_`-prefixed public keys only (see
  `packages/database/src/client.ts`'s `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_PUBLISHABLE_KEY`) — these are safe to expose to the
  browser by design (Supabase's publishable key + RLS policies, not a
  secret in the traditional sense). Nothing with `SERVICE_ROLE` or
  `SECRET` in its name should ever be prefixed `VITE_` or otherwise
  bundled client-side.

## Rules

- `[SEC]` Never commit a real `.env` file — only `.env.example` files (with
  variable names, no values) are tracked.
- `[SEC]` Never log a secret value, return one in an API response, or
  paste one into a commit message, issue, or PR description.
- `[RULE]` Adding a new secret means adding its **name** to the relevant
  `.env.example` in the same change — don't introduce an undocumented
  required variable.
- `[SCALE]` As the team grows past sharing `.env` files manually, adopt a
  real secrets manager rather than continuing to pass values around
  informally — not yet urgent at current scale, but worth revisiting
  before onboarding external contributors.

## Rotation

No rotation strategy is defined yet — this is open work, not a documented
policy. Whatever is chosen should cover at minimum: `JWT_SECRET`,
`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`.

## References

- `apps/api/.env.example`
- `.env.example` (root)
- `packages/database/src/client.ts`
- `apps/api/AGENTS.md`
