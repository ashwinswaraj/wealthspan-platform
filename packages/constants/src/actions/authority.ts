/* ------------------------------------------------------------------
 * Action authority — the final gate every mutation must pass through.
 *
 * `getAvailableActions()` decides what a surface may *render*.
 * `authorizeAction()` decides what may actually *happen*, and it does not
 * trust anything the UI believed:
 *
 *   1. the action id must exist in the resource's action set
 *   2. the state the UI rendered from must still be the current state
 *      (otherwise the request is stale — Admin B changed it meanwhile)
 *   3. state + permission + business rule must all allow it (decideAction)
 *   4. a required reason must be present
 *   5. the resulting transition must be declared in the lifecycle map
 *
 * Hiding a button is a UX affordance. This function is the rule.
 * ------------------------------------------------------------------ */

import { decideAction, findActionById, assertTransition } from "./resolver";
import type { Actor, ActionDefinition, ActionDenialCode } from "./types";

export type AuthorizedAction<S extends string, R> = {
  ok: true;
  definition: ActionDefinition<S, R>;
  /** Target state when the action is a lifecycle transition. */
  to?: S;
  reason?: string;
};

export type RejectedAction = {
  ok: false;
  code: ActionDenialCode;
  reason: string;
};

export type ActionOutcome<S extends string, R> = AuthorizedAction<S, R> | RejectedAction;

export type AuthorizeArgs<S extends string, R> = {
  actionId: string;
  definitions: readonly ActionDefinition<S, R>[];
  /** The resource as it exists right now — never a value captured in a closure. */
  resource: R;
  /** The resource's authoritative current state. */
  state: S;
  /**
   * The state the UI was rendered from. When it differs from `state` the
   * request is rejected as stale so the surface can reconcile and re-resolve.
   */
  expectedState?: S;
  actor: Actor;
  reason?: string;
  /** Lifecycle map used to validate `definition.to`. */
  transitions?: Record<S, readonly S[]>;
  /** Label used in transition error messages ("account", "order", …). */
  resourceName?: string;
};

export const authorizeAction = <S extends string, R>({
  actionId,
  definitions,
  resource,
  state,
  expectedState,
  actor,
  reason,
  transitions,
  resourceName,
}: AuthorizeArgs<S, R>): ActionOutcome<S, R> => {
  const definition = findActionById(definitions, actionId);
  if (!definition)
    return {
      ok: false,
      code: "unknown_action",
      reason: `Unknown action "${actionId}".`,
    };

  if (expectedState !== undefined && expectedState !== state)
    return {
      ok: false,
      code: "stale_state",
      reason: `This ${definition.resource} changed to "${state}" while the screen was open. The view has been refreshed — please review and try again.`,
    };

  const decision = decideAction({ definition, state, resource, actor });
  if (!decision.allowed) return { ok: false, code: decision.code, reason: decision.reason };

  if (definition.requiresReason && !reason?.trim())
    return {
      ok: false,
      code: "missing_input",
      reason: "A reason is required for this action.",
    };

  if (definition.to && transitions) {
    const transition = assertTransition({
      from: state,
      to: definition.to,
      transitions,
      resource: resourceName ?? definition.resource,
    });
    if (!transition.allowed)
      return { ok: false, code: "invalid_transition", reason: transition.reason };
  }

  return {
    ok: true,
    definition,
    ...(definition.to ? { to: definition.to } : {}),
    ...(reason?.trim() ? { reason: reason.trim() } : {}),
  };
};
