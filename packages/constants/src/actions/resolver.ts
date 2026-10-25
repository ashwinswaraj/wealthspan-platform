/* ------------------------------------------------------------------
 * Single action resolver used by every surface and by the mutation layer.
 *
 *   canPerformAction = stateAllowsAction
 *                   && actorHasPermission
 *                   && businessRulesAllowAction
 *
 * UI calls `getAvailableActions()` and renders exactly what comes back.
 * Registries call `decideAction()` / `assertTransition()` before mutating,
 * which is what makes a stale UI harmless.
 * ------------------------------------------------------------------ */

import { hasPermissions } from "./permissions";
import type {
  Actor,
  ActionDecision,
  ActionDefinition,
  ResolvedAction,
} from "./types";

const labelOf = <S extends string, R>(def: ActionDefinition<S, R>, resource: R) =>
  typeof def.label === "function" ? def.label(resource) : def.label;

const stateAllows = <S extends string, R>(def: ActionDefinition<S, R>, state: S) =>
  def.allowedStates === "*" || def.allowedStates.includes(state);

/** Full decision for one action — the authority used by mutations. */
export const decideAction = <S extends string, R>({
  definition,
  state,
  resource,
  actor,
}: {
  definition: ActionDefinition<S, R>;
  state: S;
  resource: R;
  actor: Actor;
}): ActionDecision => {
  if (!stateAllows(definition, state))
    return {
      allowed: false,
      code: "invalid_state",
      reason: `"${labelOf(definition, resource)}" is not available while the ${definition.resource} is "${state}".`,
    };

  if (!hasPermissions(actor, definition.requiredPermissions))
    return {
      allowed: false,
      code: "forbidden",
      reason: `Your role does not have permission to ${labelOf(definition, resource).toLowerCase()}.`,
    };

  const business = definition.availability?.({ resource, actor });
  if (typeof business === "string")
    return { allowed: false, code: "business_rule", reason: business };

  return { allowed: true };
};

/**
 * Resolve every action available for a resource in its current state.
 * Invalid actions are omitted unless the definition explicitly asks to be
 * surfaced as `disabled` with the reason.
 */
export const getAvailableActions = <S extends string, R>({
  definitions,
  state,
  resource,
  actor,
}: {
  definitions: readonly ActionDefinition<S, R>[];
  state: S;
  resource: R;
  actor: Actor;
}): ResolvedAction<S, R>[] => {
  const out: ResolvedAction<S, R>[] = [];
  for (const definition of definitions) {
    const decision = decideAction({ definition, state, resource, actor });
    // A permission failure is never shown as a disabled control — an actor
    // should not learn about controls their role cannot use.
    const showDisabled =
      definition.visibility === "disabled" &&
      !decision.allowed &&
      decision.code !== "forbidden";
    if (!decision.allowed && !showDisabled) continue;
    out.push({
      definition,
      id: definition.id,
      label: labelOf(definition, resource),
      group: definition.group,
      tone: definition.tone ?? "neutral",
      ...(definition.icon ? { icon: definition.icon } : {}),
      destructive: definition.destructive ?? false,
      requiresConfirmation: definition.requiresConfirmation ?? definition.destructive ?? false,
      requiresReason: definition.requiresReason ?? false,
      disabled: !decision.allowed,
      ...(decision.allowed ? {} : { disabledReason: decision.reason }),
      ...(definition.to ? { to: definition.to } : {}),
    });
  }
  return out;
};

/** The one state-aware primary CTA for a resource, if any exists. */
export const getPrimaryAction = <S extends string, R>(args: {
  definitions: readonly ActionDefinition<S, R>[];
  state: S;
  resource: R;
  actor: Actor;
}): ResolvedAction<S, R> | undefined =>
  getAvailableActions(args).find((a) => a.group === "primary" && !a.disabled);

export const findActionById = <S extends string, R>(
  definitions: readonly ActionDefinition<S, R>[],
  id: string,
) => definitions.find((d) => d.id === id);

/**
 * Transition guard for the mutation layer. Returns a denial instead of
 * throwing so callers can surface the message to the user.
 */
export const assertTransition = <S extends string>({
  from,
  to,
  transitions,
  resource,
}: {
  from: S;
  to: S;
  transitions: Record<S, readonly S[]>;
  resource: string;
}): ActionDecision => {
  if (from === to) return { allowed: true };
  if (transitions[from]?.includes(to)) return { allowed: true };
  return {
    allowed: false,
    code: "invalid_state",
    reason: `A ${resource} cannot move from "${from}" to "${to}".`,
  };
};
