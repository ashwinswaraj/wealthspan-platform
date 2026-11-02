# Infrastructure

Ops & security configuration — no application code lives here (see
`ARCHITECTURE_RATIONALE.md`).

## Current folders

- `database/` — rules for the Catalyst Data Store schema (see its own `AGENTS.md`)
- `proxy/` — reverse-proxy rules (`nginx.conf`)
- `secrets/` — secrets-management policy (`secrets-management.md`) — this
  documents _how_ secrets are handled, actual secret values never live in
  this repo
- `seed/` — how the first admin is pinned (`README.md`); no seed scripts
- `audit/` — audit-logging strategy for sensitive/admin actions

## Not yet created

The following are referenced in some docs/tooling as future homes for
infrastructure config, but don't exist yet — don't assume they're there,
and don't create them speculatively (per root `AGENTS.md`'s "no new
top-level folder without asking" rule): `docker/`, `deployment/`,
`monitoring/`, `backups/`, `storage/`, `environments/`, `logging/`. Add one
only when there's a concrete need, matching the naming pattern above.
