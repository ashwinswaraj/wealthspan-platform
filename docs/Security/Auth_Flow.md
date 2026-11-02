# Auth Flow

> Status: Draft · Last updated: 2026-11-01

## How a request is authenticated

1. The user signs in through Catalyst Cloud Scale **Embedded Authentication** (Google, Zoho or e-mail). Catalyst sets a session cookie.
2. The SPA (served at `/app/`, admin at `/app/admin/`) calls `/server/<function>/...` on the **same domain**, with `credentials: "include"` and header `X-Requested-With: wealthspan` (`apps/web/src/services/api.ts`).
3. Every function first runs `catalyst.initialize(req).userManagement().getCurrentUser()`. No user means `401 { error: "unauthorized" }`. The id and e-mail come only from this call.
4. Services receive `userId` as a parameter and every Data Store query filters by it.

There is no custom login function, no tokens handled by our code and no e-mail-OTP table.

## Chat gate

`POST /chat` additionally needs an active trial or plan (`402 subscription_required`) and a daily quota (`429 daily_limit`).

## Client route guards

Redirecting a signed-out user to the login screen is UX only; the real check is the 401 from the function.

## Open items

- [ ] Verify on real Catalyst: `getCurrentUser()` field names and session expiry/refresh behaviour
- [ ] Decide session lifetime and idle timeout in the Catalyst console
- [ ] Security review before real users (see [Threat_Model](Threat_Model.md))
