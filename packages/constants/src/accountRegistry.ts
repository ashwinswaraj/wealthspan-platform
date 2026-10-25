/* ------------------------------------------------------------------
 * Account action authority + audit trail.
 *
 * The Users Directory (and any future account surface) must route every
 * mutation through `executeAccountAction`. It re-validates state,
 * permission, business rule, required reason and lifecycle transition
 * *after* the click — so a stale screen, a hand-crafted call or a second
 * admin acting concurrently can never push an account into an invalid
 * state. Nothing is mutated when the request is rejected.
 *
 * This is the same role a backend endpoint plays: the UI hiding a button
 * is never the security boundary.
 * ------------------------------------------------------------------ */

import { recordAuditEvent } from "./auditRegistry";
import { ACCOUNT_ACTIONS, type AccountResource } from "./actions/accountActions";
import { ACCOUNT_TRANSITIONS, type AccountState } from "./actions/accountLifecycle";
import { authorizeAction } from "./actions/authority";
import type { Actor } from "./actions/types";

export type AccountActionRequest = {
  actionId: string;
  /** The account as it exists right now. */
  account: AccountResource;
  /** The status the screen was rendered from; used for stale detection. */
  expectedStatus?: AccountState;
  actor: Actor;
  reason?: string;
  /** Identifier written to the audit trail. */
  actorId?: string;
};

export type AccountActionResult =
  | { ok: true; status: AccountState; changed: boolean; label: string }
  | { ok: false; code: string; reason: string };

export const executeAccountAction = ({
  actionId,
  account,
  expectedStatus,
  actor,
  reason,
  actorId,
}: AccountActionRequest): AccountActionResult => {
  const outcome = authorizeAction<AccountState, AccountResource>({
    actionId,
    definitions: ACCOUNT_ACTIONS,
    resource: account,
    state: account.status,
    ...(expectedStatus !== undefined ? { expectedState: expectedStatus } : {}),
    actor,
    ...(reason !== undefined ? { reason } : {}),
    transitions: ACCOUNT_TRANSITIONS,
    resourceName: "account",
  });

  if (!outcome.ok) return { ok: false, code: outcome.code, reason: outcome.reason };

  const label =
    typeof outcome.definition.label === "function"
      ? outcome.definition.label(account)
      : outcome.definition.label;

  recordAuditEvent({
    entity: "account",
    entityId: account.id,
    action: label,
    from: account.status,
    ...(outcome.to ? { to: outcome.to } : {}),
    actor: actorId ?? actor.id ?? actor.role,
    ...(outcome.reason ? { metadata: { reason: outcome.reason } } : {}),
  });

  return {
    ok: true,
    status: outcome.to ?? account.status,
    changed: Boolean(outcome.to),
    label,
  };
};
