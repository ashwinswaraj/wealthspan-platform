# State-Based Action Architecture

**Rule:** STATE → PERMISSION → BUSINESS RULE → AVAILABLE ACTIONS → UI CTA.
Never RESOURCE → SHOW ALL POSSIBLE ACTIONS.

No surface may hardcode which CTAs exist. Every action a user can click must be
resolved from the canonical engine in `packages/constants/src/actions/`.

## The engine

| File | Responsibility |
| --- | --- |
| `actions/types.ts` | `ActionDefinition`, `ResolvedAction`, `Actor`, `ActionDenialCode` |
| `actions/permissions.ts` | permission catalogue + role → permission map (single source) |
| `actions/accountLifecycle.ts` | `AccountState` + legal transitions |
| `actions/orderLifecycle.ts` | `OrderStatus` + legal transitions |
| `actions/accountActions.ts` | `ACCOUNT_ACTIONS` definitions |
| `actions/orderActions.ts` | `ADMIN_ORDER_ACTIONS` definitions |
| `actions/resolver.ts` | `getAvailableActions`, `getPrimaryAction`, `decideAction` |
| `actions/authority.ts` | `authorizeAction` — the final gate before any mutation |
| `accountRegistry.ts` / `orderRegistry.ts` | `executeAccountAction` / `updateOrderInRegistry` — re-validate, mutate, audit |

## How to add an action

1. Add an `ActionDefinition` (with `allowedStates`, `requiredPermissions`, `to`,
   `destructive`, `requiresConfirmation`, `requiresReason`, `availability`).
2. Render it via `getAvailableActions(...)` + `<ActionBar />`. Never add a bare
   `<button>` for a state-dependent action.
3. Execute through the registry's execute function so `authorizeAction` runs
   again after the click (stale-state detection) and an audit event is recorded.

## Non-negotiables

- `canPerformAction = stateAllowsAction && actorHasPermission && businessRulesAllowAction`.
  Permission alone is never enough; a Super Admin cannot suspend an account
  whose state has no `→ SUSPENDED` transition.
- Invalid actions are **hidden**, not disabled, in contextual menus.
- Destructive actions require confirmation, a reason, and an audit event.
- List, detail, drawer and mobile surfaces must call the same resolver with the
  same resource — one state cannot yield different actions on two surfaces.
- Frontend gating is UX only. Server-side validation is the authority; see
  "Known gap" below.

## Known gap

`apps/api` is still a scaffold (§11 of root `AGENTS.md`), so there is no HTTP
endpoint to enforce transitions server-side. `authorizeAction` currently runs in
the registries, which are the only mutation path. When the API framework is
chosen, the same `authorizeAction` must be called there before persisting; the
client call becomes advisory only.
