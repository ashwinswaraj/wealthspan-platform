# API Architecture

> Status: Draft · Owner: TBD · Last updated: 2026-08-31

## Purpose

Describe how `apps/api` is structured and what role it plays relative to
Supabase.

## Scope

- Covers: `apps/api`'s internal structure, its relationship to Supabase Auth
- Does not cover: the database schema (see `docs/Database/`) or specific
  endpoint contracts beyond what's built so far (see `42_API_Specification.md`)

## Details

`apps/api` is a **thin edge layer, not the system of record**. Identity is
handled by Supabase Auth directly — this app verifies bearer tokens and
exposes the resolved session; it does not own user data itself.

Structure follows the monorepo-wide `features/<domain>/` pattern (see root
`AGENTS.md` §3):

```
src/
  features/<domain>/
    controller.ts   HTTP request handling
    service.ts      external calls / business logic
    types.ts         shared shapes for this domain
    routes.ts        route map for this domain
    index.ts         barrel — public API
  config/  middleware/  utils/
  index.ts            app entry point
```

Only `features/auth/` exists so far. No HTTP framework is mounted yet
(`src/index.ts` is currently `export {}`) — see `.lovable/plan.md` for that
decision.

## Open Questions

- [ ] Which HTTP framework (Hono is the natural fit for a
      TanStack-Start-adjacent, edge-deployable stack, but not yet confirmed)
- [ ] Whether `apps/api` will eventually own any data directly, or remain
      purely a pass-through/orchestration layer in front of Supabase

## References

- [Master Context](../00_Master_Context.md)
- `apps/api/AGENTS.md`, `apps/api/README.md`
