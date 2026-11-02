# AGENTS.md — packages/database

Never run destructive queries here without explicit confirmation. Falls
back to root `AGENTS.md` for anything not covered here.

## Current state

The database is the **Zoho Catalyst Data Store**, reached only from the Catalyst functions in `apps/api`. This
package holds the shared bits: the table-name list (`types.ts`) and query helpers such as `esc` (`client.ts`).
Tables are created in the Catalyst console; the schema is `docs/Database/42_Catalyst_Data_Store_Schema.md`.

## Rules

- `[SEC]` **Never run `DROP`, `TRUNCATE`, or unscoped `DELETE`/`UPDATE`**
  through this package or any script that imports it, without explicit
  human confirmation of the exact statement and target environment.
- `[RULE]` No migration tool exists: schema changes are made in the Catalyst console after the schema doc is
  updated (see `infrastructure/database/AGENTS.md`).
- `[SCALE]` `apps/admin` and `packages/auth` both depend on this package's
  types — a schema change that alters a table shape used by either will
  need `pnpm typecheck` run across the whole repo (via `turbo`) before it's
  safe to merge, not just in the app you're editing.
- `[CLR]` Full schema documentation lives in `docs/Database/` (Data Model,
  Entities, Relationships, Status Enums) — keep it in sync when the
  generated types change meaningfully, don't let it drift.

## Never do without confirmation

- Hand-edit `src/client.ts` or `src/types.ts` (regenerate instead)
- Run any migration against a non-local database
- Change `auth.persistSession`/`autoRefreshToken` behavior in `client.ts`
  — this affects session handling for every app that uses it
