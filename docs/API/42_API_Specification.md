# API Specification

> Status: Draft · Owner: TBD · Last updated: 2026-08-31

## Purpose

Document the endpoints `apps/api` actually exposes. Only `auth` exists so
far — this file grows as real features are added; it does not speculate
about endpoints that don't exist yet.

## Scope

- Covers: endpoints built and present in `apps/api/src/features/`
- Does not cover: endpoints that only exist as ideas (see `.lovable/plan.md`
  for what's planned next)

## Endpoints

### `auth` feature

| Method & path | Handler | Auth required | Returns |
| --- | --- | --- | --- |
| `GET /auth/session` | `getSession` | Bearer token (`Authorization: Bearer <token>`) | `{ userId, email, role }` or `401 { error: "Unauthorized" }` |
| `POST /auth/signout` | `signOut` | Bearer token | `{ ok: true }` or `401 { error: "Unauthorized" }` |

Both verify the token against Supabase Auth (`GET /auth/v1/user` /
`POST /auth/v1/logout` on the configured Supabase project) rather than
maintaining sessions locally — see `apps/api/src/features/auth/service.ts`.

`role` in the session payload comes from the Supabase user's
`app_metadata.role`, defaulting to `"user"` if unset.

## Open Questions

- [ ] Error response shape beyond 401 (validation errors, 500s) isn't
      standardized yet — only one failure mode exists per endpoint so far
- [ ] No endpoints beyond `auth` exist yet — next candidate is `orders`
      (see `.lovable/plan.md`)

## References

- [Master Context](../00_Master_Context.md)
- `apps/api/src/features/auth/`
