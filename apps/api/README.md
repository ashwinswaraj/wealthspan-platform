# @jobrio/api

Backend edge service. Thin layer in front of Supabase — identity itself is
handled by Supabase Auth, this app verifies tokens and will host
non-auth business logic as it grows.

## Layout

```
src/
  features/<domain>/  one folder per business domain — controller.ts (HTTP
                      handling), service.ts (external calls), types.ts,
                      routes.ts, index.ts (barrel). See features/auth/ for
                      the reference shape.
  config/             environment/runtime configuration
  middleware/         cross-cutting request middleware (auth checks, etc.)
  utils/              generic helpers (not business logic)
  index.ts            app entry point — currently an unwired stub
tests/
```

## Current state

Only `features/auth/` exists so far (bearer-token verification against
Supabase Auth — see its own file headers for the exact contract).
`src/index.ts` is not wired to an HTTP framework yet; see
`.lovable/plan.md` for the next steps and `AGENTS.md` (this folder's own,
falling back to the root one) for the rules that apply here.

Copy `.env.example` to `.env` before running. Endpoint contracts, once
routes exist beyond `auth`, are documented in `docs/API/`.
