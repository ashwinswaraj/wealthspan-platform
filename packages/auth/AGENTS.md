# AGENTS.md — packages/auth

Auth is sensitive — confirm before changing. Falls back to root
`AGENTS.md` for anything not covered here.

## Current state

Shared session logic for `apps/web` and `apps/admin`. It holds the `useSession` hook, which asks the Catalyst
function (`/server/finance/me`) whether the cookie session is valid. Sign-in and sign-out themselves run on
Catalyst's Embedded Authentication (`catalyst.auth.signIn` / `signOut`), not in this package.

## Rules

- `[SEC]` **Every change here affects both apps at once.** A change that
  works for `apps/web`'s signup flow but breaks `apps/admin`'s sign-in (or
  vice versa) is a regression, even if only one app was being tested. Check
  both consumers before considering a change done.
- `[SEC]` Never persist a session token, password, or OTP in
  `signupStorage.ts` or any other client storage — it's for non-sensitive
  in-progress form state only (names, selected options), so a user doesn't
  lose partially-filled signup data on refresh.
- `[RULE]` This package exports auth _logic and components_, not app-specific
  styling — `SignIn.tsx`/`SignUp.tsx` should stay usable by both the public
  web app and the admin panel without per-app forks. App-specific chrome
  (page layout, marketing copy) belongs in the consuming app's own
  `features/auth/`, not here.
- `[SCALE]` If `apps/api` grows its own session-issuing logic beyond bearer
  verification, that logic belongs in `apps/api/src/features/auth/`
  (server-side), not here — this package is for client-side auth UI/state.

## Never do without confirmation

- Change the shape of `useSession.ts`'s return value (both apps depend on it)
- Weaken any validation in the sign-in/sign-up flow
- Add a new place that stores credentials or tokens client-side
