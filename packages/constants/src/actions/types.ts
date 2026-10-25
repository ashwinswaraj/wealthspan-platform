/* ------------------------------------------------------------------
 * Canonical action model.
 *
 * Every UI surface (table row, card, drawer, detail page, mobile view)
 * must derive its CTAs from `getAvailableActions()` instead of rendering
 * a static list. The same definitions are re-used by the mutation layer
 * (`packages/constants/src/*Registry.ts`) so an invalid transition is
 * rejected even when a stale UI asks for it.
 * ------------------------------------------------------------------ */

import type { Permission } from "./permissions";

/** Who is attempting the action. */
export type ActorRole = "super" | "sub" | "client" | "professional" | "system";

export type Actor = {
  role: ActorRole;
  /** Explicit grants. When omitted, the role's default grants are used. */
  permissions?: Permission[];
  /** Used for ownership/scope checks (client id, professional name, admin id). */
  id?: string;
};

/** How an action should surface when it is not currently executable. */
export type ActionVisibility = "hidden" | "disabled";

export type ActionTone = "primary" | "neutral" | "warning" | "danger" | "success";

export type ActionGroup = "primary" | "secondary" | "overflow";

/**
 * A single action definition. `allowedStates` is the authoritative list of
 * resource states the action may run from; `to` is the state the resource
 * moves into (omitted for non-transition actions such as "View").
 */
export type ActionDefinition<TState extends string, TResource = unknown> = {
  id: string;
  label: string | ((resource: TResource) => string);
  resource: string;
  icon?: string;
  tone?: ActionTone;
  group: ActionGroup;
  /** States this action is valid from. `"*"` means every state. */
  allowedStates: readonly TState[] | "*";
  /** Resulting state, when the action is a lifecycle transition. */
  to?: TState;
  requiredPermissions: readonly Permission[];
  destructive?: boolean;
  requiresConfirmation?: boolean;
  requiresReason?: boolean;
  /** When invalid: hide (default) or show disabled with a reason. */
  visibility?: ActionVisibility;
  /**
   * Extra business rules beyond state + permission. Return a string to
   * explain why the action is unavailable, or `true` when allowed.
   */
  availability?: (ctx: { resource: TResource; actor: Actor }) => true | string;
};

export type ResolvedAction<TState extends string, TResource = unknown> = {
  definition: ActionDefinition<TState, TResource>;
  id: string;
  label: string;
  group: ActionGroup;
  tone: ActionTone;
  icon?: string;
  destructive: boolean;
  requiresConfirmation: boolean;
  requiresReason: boolean;
  /** Present only when the action is surfaced as disabled. */
  disabled: boolean;
  disabledReason?: string;
  to?: TState;
};

export type ActionDenialCode =
  | "invalid_state"
  | "forbidden"
  | "business_rule"
  | "unknown_action"
  /** The UI acted on a resource state that is no longer current. */
  | "stale_state"
  /** A required reason / input was not supplied. */
  | "missing_input"
  /** The action is valid but its resulting transition is not. */
  | "invalid_transition";

export type ActionDenial = {
  allowed: false;
  reason: string;
  code: ActionDenialCode;
};

export type ActionApproval = { allowed: true };

export type ActionDecision = ActionApproval | ActionDenial;
