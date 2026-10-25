/* ------------------------------------------------------------------
 * executeAccountAction is the single mutation path for accounts:
 * it must reject invalid requests without mutating, and audit the
 * ones it allows.
 * ------------------------------------------------------------------ */

import { describe, expect, it } from "vitest";

import { executeAccountAction } from "../accountRegistry";
import { getAuditSnapshot } from "../auditRegistry";
import type { AccountResource } from "../actions/accountActions";
import type { Actor } from "../actions/types";

const superAdmin: Actor = { role: "super", id: "admin:super" };
const subAdmin: Actor = { role: "sub", id: "admin:sub" };

const account: AccountResource = { id: "U-9", status: "Active", type: "Client" };

/** The audit log is append-only, so assert on the delta, not the total. */
const auditDelta = <T>(fn: () => T): { result: T; added: number } => {
  const before = getAuditSnapshot().length;
  const result = fn();
  return { result, added: getAuditSnapshot().length - before };
};

describe("executeAccountAction", () => {
  it("applies a valid suspension and records an audit event", () => {
    const { result, added } = auditDelta(() =>
      executeAccountAction({
        actionId: "account.suspend",
        account,
        expectedStatus: "Active",
        actor: superAdmin,
        reason: "Payment fraud",
      }),
    );

    expect(result).toMatchObject({ ok: true, status: "Suspended", changed: true });
    expect(added).toBe(1);
    expect(getAuditSnapshot()[0]).toMatchObject({
      entity: "account",
      entityId: "U-9",
      from: "Active",
      to: "Suspended",
    });
  });

  it("does not audit or mutate when the actor lacks permission", () => {
    const { result, added } = auditDelta(() =>
      executeAccountAction({
        actionId: "account.delete",
        account,
        actor: subAdmin,
        reason: "cleanup",
      }),
    );

    expect(result.ok).toBe(false);
    expect(added).toBe(0);
  });

  it("does not audit or mutate on a stale state", () => {
    const { result, added } = auditDelta(() =>
      executeAccountAction({
        actionId: "account.suspend",
        account,
        expectedStatus: "Suspended",
        actor: superAdmin,
        reason: "x",
      }),
    );

    expect(result).toMatchObject({ ok: false, code: "stale_state" });
    expect(added).toBe(0);
  });

  it("reports a non-transition action as unchanged but still audits it", () => {
    const { result, added } = auditDelta(() =>
      executeAccountAction({
        actionId: "account.reset_password",
        account,
        actor: superAdmin,
      }),
    );

    expect(result).toMatchObject({ ok: true, changed: false, status: "Active" });
    expect(added).toBe(1);
  });
});
