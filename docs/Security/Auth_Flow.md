# Auth Flow

> Draft — grounded in current code; still needs security review before launch.

## How authentication actually works today

Identity is owned by **Supabase Auth**, not by any app in this repo:

- `packages/database/src/client.ts` creates the Supabase client apps use
  client-side, configured with `persistSession: true` and
  `autoRefreshToken: true` — session tokens live in the browser via
  Supabase's own storage handling, not a custom implementation.
- `packages/auth/` provides the client-side `SignIn`/`SignUp` components
  and a `useSession` hook shared by `apps/web` and `apps/admin`.
- `apps/api/src/features/auth/` verifies a bearer token **server-side** by
  calling Supabase's `/auth/v1/user` endpoint directly (see
  `service.ts::fetchSupabaseUser`) — it does not decode/verify a JWT
  locally, it asks Supabase to resolve it. Sign-out
  (`service.ts::revokeSupabaseSession`) similarly proxies to Supabase's
  `/auth/v1/logout`.
- A resolved session carries `role` from the Supabase user's
  `app_metadata.role` (defaults to `"user"` if unset) — this is the same
  field `apps/admin` reads to distinguish `"super"` vs `"sub"` admins (see
  `RBAC.md`).

## What this means in practice

- There is currently **no independent token-verification path** — every
  check against Supabase Auth's live endpoint. This is simple and correct,
  but means `apps/api` cannot verify a session without a network call to
  Supabase; there's no local JWT-verification fast path yet.
- Client-side route guards (redirecting an unauthenticated user away from
  a dashboard route) are **not a security boundary** — see
  `apps/web/AGENTS.md` — the real check is the API call itself, once
  `apps/api` has more than the `auth` feature wired up.

## Open Questions

- [ ] Formal token-verification/caching strategy for `apps/api` once it
      handles real traffic volume (calling Supabase's `/auth/v1/user` per
      request doesn't scale indefinitely)
- [ ] Session/refresh-token expiry policy beyond Supabase's defaults
- [ ] Security review of the whole flow before handling real user data

## References

- `packages/database/src/client.ts`
- `packages/auth/`
- `apps/api/src/features/auth/`
- `docs/Security/RBAC.md`
