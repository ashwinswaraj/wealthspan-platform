/* ------------------------------------------------------------------
 * The authority layer is the gate every account mutation passes through.
 * These tests walk the state x role x permission x action matrix: valid,
 * invalid state, unauthorized, invalid transition, missing reason and
 * stale state.
 * ------------------------------------------------------------------ */

import { describe, expect, it } from "vitest";

import { ACCOUNT_ACTIONS, type AccountResource } from "../accountActions";
import { ACCOUNT_TRANSITIONS, type AccountState } from "../accountLifecycle";
import { authorizeAction } from "../authority";
import type { Actor } from "../types";

const superAdmin: Actor = { role: "super", id: "admin:super" };
const subAdmin: Actor = { role: "sub", id: "admin:sub" };

const account = (status: AccountState, type = "Client"): AccountResource => ({
  id: "U-1",
  status,
  type,
});

const run = (
  actionId: string,
  resource: AccountResource,
  actor: Actor,
  extra: { reason?: string; expectedState?: AccountState } = {},
) =>
  authorizeAction<AccountState, AccountResource>({
    actionId,
    definitions: ACCOUNT_ACTIONS,
    resource,
    state: resource.status,
    actor,
    transitions: ACCOUNT_TRANSITIONS,
    resourceName: "account",
    ...extra,
  });

describe("authorizeAction — account", () => {
  it("allows a valid transition for a permitted actor", () => {
    const out = run("account.suspend", account("Active"), superAdmin, { reason: "Fraud review" });
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.to).toBe("Suspended");
  });

  it("rejects an action whose state no longer allows it", () => {
    const out = run("account.suspend", account("Suspended"), superAdmin, { reason: "x" });
    expect(out).toMatchObject({ ok: false, code: "invalid_state" });
  });

  it("rejects a permitted actor when the state cannot make the move", () => {
    // Super admin holds users.suspend, but a Deleted account cannot be suspended.
    const out = run("account.suspend", account("Deleted"), superAdmin, { reason: "x" });
    expect(out.ok).toBe(false);
  });

  it("rejects an actor without the permission", () => {
    const out = run("account.delete", account("Active"), subAdmin, { reason: "x" });
    expect(out).toMatchObject({ ok: false, code: "forbidden" });
  });

  it("rejects a business-rule violation (professionals are Workforce-controlled)", () => {
    const out = run("account.suspend", account("Active", "Professional"), superAdmin, {
      reason: "x",
    });
    expect(out).toMatchObject({ ok: false, code: "business_rule" });
  });

  it("rejects when a required reason is missing", () => {
    const out = run("account.suspend", account("Active"), superAdmin);
    expect(out).toMatchObject({ ok: false, code: "missing_input" });
  });

  it("rejects a stale screen acting on an out-of-date state", () => {
    const out = run("account.reactivate", account("Active"), superAdmin, {
      reason: "x",
      expectedState: "Suspended",
    });
    expect(out).toMatchObject({ ok: false, code: "stale_state" });
  });

  it("rejects an unknown action id", () => {
    const out = run("account.nuke", account("Active"), superAdmin);
    expect(out).toMatchObject({ ok: false, code: "unknown_action" });
  });

  it("allows a non-transition action without moving state", () => {
    const out = run("account.reset_password", account("Active"), superAdmin);
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.to).toBeUndefined();
  });
});
