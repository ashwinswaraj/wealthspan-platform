# Infrastructure

Ops & security configuration — no application code lives here (see
`ARCHITECTURE_RATIONALE.md`).

## Current folders

- `database/` — local Supabase CLI config (`config.toml`); migrations will
  live here once schema work starts (see its own `AGENTS.md`)
- `proxy/` — reverse-proxy rules (`nginx.conf`)
- `secrets/` — secrets-management policy (`secrets-management.md`) — this
  documents *how* secrets are handled, actual secret values never live in
  this repo
- `seed/` — one-off seed scripts (`seed-admin.ts`) — data, not schema; kept
  separate from `database/` so migrations stay safely re-runnable
- `audit/` — audit-logging strategy for sensitive/admin actions

## Not yet created

The following are referenced in some docs/tooling as future homes for
infrastructure config, but don't exist yet — don't assume they're there,
and don't create them speculatively (per root `AGENTS.md`'s "no new
top-level folder without asking" rule): `docker/`, `deployment/`,
`monitoring/`, `backups/`, `storage/`, `environments/`, `logging/`. Add one
only when there's a concrete need, matching the naming pattern above.
