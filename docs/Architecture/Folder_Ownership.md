# Folder Ownership

> Status: Active · Owner: TBD · Last updated: 2026-08-31

## Purpose

Record why each top-level folder exists and who (which review path) owns
changes to it, so structure doesn't drift back to being ad hoc.

## Ownership map

| Folder | Reason it exists | Review path |
| --- | --- | --- |
| `apps/web` | Public client/professional app | `@wealthspan/web` app maintainers (see `.github/CODEOWNERS`) |
| `apps/admin` | Highest-privilege surface — super-admin panel | Admin maintainers; every mutating action needs an audit trail (see `apps/admin/AGENTS.md`) |
| `apps/api` | Thin edge layer in front of Supabase Auth | API maintainers |
| `packages/*` | Shared code, never depends on an app | Cross-app; changes affect every consumer, check all of them |
| `packages/auth`, `packages/database` | Sensitive — auth & schema | Extra caution, see their own `AGENTS.md` |
| `infrastructure/` | Ops & security config, no app code | Ops/security |
| `infrastructure/database` | Migrations only | Never edit directly — see its `AGENTS.md` |
| `docs/` | Product & architecture documentation | Whoever owns the domain the doc covers |
| `tests/` | Root-level cross-app E2E/integration only | Cross-app; unit tests live inside each feature instead |
| `tools/` | Repeat-task scripts, added only as patterns emerge | Whoever adds the need |

For the full per-file rationale (not just folders), see
`ARCHITECTURE_RATIONALE.md` — every entry there is tagged `[SEC]`, `[SCALE]`,
`[CLR]`, or `[RULE]`. The rule from that file still holds: a new top-level
folder needs one of those four justifications, or it shouldn't exist.

## References

- [Master Context](../00_Master_Context.md)
- [`ARCHITECTURE_RATIONALE.md`](../../ARCHITECTURE_RATIONALE.md)
- `.github/CODEOWNERS`
