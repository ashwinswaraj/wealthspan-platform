import { describe, expect, it } from "vitest";
import {
  ACCOUNT_ACTIONS,
  ACCOUNT_TRANSITIONS,
  ADMIN_ORDER_ACTIONS,
  CLIENT_ORDER_ACTIONS,
  ORDER_TRANSITIONS,
  assertTransition,
  decideAction,
  findActionById,
  getAvailableActions,
  getPrimaryAction,
  isValidAccountTransition,
  isValidOrderTransition,
  type AccountResource,
  type AccountState,
  type Actor,
} from "../index";
import type { OrderRow, OrderStatus } from "../../orders";

const account = (status: AccountState, type = "Client"): AccountResource => ({
  id: "U-1",
  status,
  type,
});

const order = (s: OrderStatus): OrderRow =>
  ({ id: "JR-1", c: "Acme", a: "₹100", s, when: "now" }) as OrderRow;

const superAdmin: Actor = { role: "super" };
const subAdmin: Actor = { role: "sub" };
const client: Actor = { role: "client" };

const ids = (state: AccountState, actor: Actor, type = "Client") =>
  getAvailableActions({
    definitions: ACCOUNT_ACTIONS,
    state,
    resource: account(state, type),
    actor,
  }).map((a) => a.id);

const orderIds = (
  defs: typeof CLIENT_ORDER_ACTIONS,
  s: OrderStatus,
  actor: Actor,
) => getAvailableActions({ definitions: defs, state: s, resource: order(s), actor }).map((a) => a.id);

describe("account actions — state × role", () => {
  it("offers only forward transitions from Active", () => {
    expect(ids("Active", superAdmin)).toEqual([
      "account.suspend",
      "account.block",
      "account.reset_password",
      "account.delete",
    ]);
  });

  it("never offers Suspend to an already suspended account", () => {
    expect(ids("Suspended", superAdmin)).not.toContain("account.suspend");
    expect(ids("Suspended", superAdmin)).toContain("account.reactivate");
  });

  it("offers no actions on a deleted account", () => {
    expect(ids("Deleted", superAdmin)).toEqual([]);
  });

  it("hides actions a sub-admin has no permission for", () => {
    const sub = ids("Active", subAdmin);
    expect(sub).toContain("account.suspend");
    expect(sub).not.toContain("account.block");
    expect(sub).not.toContain("account.delete");
  });

  it("respects explicitly narrowed sub-admin permissions", () => {
    expect(ids("Active", { role: "sub", permissions: ["users.read"] })).toEqual([]);
  });

  it("blocks account actions on professionals (Workforce Control owns them)", () => {
    expect(ids("Active", superAdmin, "Professional")).toEqual([]);
  });

  it("offers Change Role only for admin accounts", () => {
    expect(ids("Active", superAdmin, "Admin")).toContain("account.change_role");
    expect(ids("Active", superAdmin, "Client")).not.toContain("account.change_role");
  });

  it("marks destructive actions as requiring confirmation and a reason", () => {
    const del = findActionById(ACCOUNT_ACTIONS, "account.delete")!;
    expect(del.destructive).toBe(true);
    expect(del.requiresConfirmation).toBe(true);
    expect(del.requiresReason).toBe(true);
  });

  it("exposes a state-aware primary CTA only where one exists", () => {
    const res = (state: AccountState) =>
      getPrimaryAction({
        definitions: ACCOUNT_ACTIONS,
        state,
        resource: account(state),
        actor: superAdmin,
      })?.id;
    expect(res("Suspended")).toBe("account.review");
    expect(res("Active")).toBeUndefined();
  });
});

describe("decideAction denials", () => {
  it("denies an invalid state with an invalid_state code", () => {
    const def = findActionById(ACCOUNT_ACTIONS, "account.suspend")!;
    const d = decideAction({
      definition: def,
      state: "Suspended",
      resource: account("Suspended"),
      actor: superAdmin,
    });
    expect(d).toMatchObject({ allowed: false, code: "invalid_state" });
  });

  it("denies a missing permission with a forbidden code", () => {
    const def = findActionById(ACCOUNT_ACTIONS, "account.delete")!;
    const d = decideAction({
      definition: def,
      state: "Active",
      resource: account("Active"),
      actor: subAdmin,
    });
    expect(d).toMatchObject({ allowed: false, code: "forbidden" });
  });

  it("denies a business-rule failure even for a super admin", () => {
    const def = findActionById(ACCOUNT_ACTIONS, "account.suspend")!;
    const d = decideAction({
      definition: def,
      state: "Active",
      resource: account("Active", "Professional"),
      actor: superAdmin,
    });
    expect(d).toMatchObject({ allowed: false, code: "business_rule" });
  });
});

describe("order actions", () => {
  it("gives the client approve/revise only after delivery", () => {
    expect(orderIds(CLIENT_ORDER_ACTIONS, "delivered", client)).toContain(
      "order.approve_delivery",
    );
    expect(orderIds(CLIENT_ORDER_ACTIONS, "progress", client)).not.toContain(
      "order.approve_delivery",
    );
  });

  it("unlocks messaging only once a professional is assigned", () => {
    expect(orderIds(CLIENT_ORDER_ACTIONS, "pending", client)).not.toContain("order.message");
    expect(orderIds(CLIENT_ORDER_ACTIONS, "assigned", client)).toContain("order.message");
  });

  it("allows cancellation only before escrow funding", () => {
    expect(orderIds(CLIENT_ORDER_ACTIONS, "awaiting_payment", client)).toContain("order.cancel");
    expect(orderIds(CLIENT_ORDER_ACTIONS, "payment_received", client)).not.toContain(
      "order.cancel",
    );
  });

  it("offers no client actions on completed orders", () => {
    expect(orderIds(CLIENT_ORDER_ACTIONS, "released", client)).toEqual([]);
  });

  it("never lets a client release escrow", () => {
    expect(orderIds(ADMIN_ORDER_ACTIONS, "delivered", client)).not.toContain(
      "order.release_escrow",
    );
  });

  it("picks the right state-aware admin primary CTA", () => {
    const primary = (s: OrderStatus) =>
      getPrimaryAction({
        definitions: ADMIN_ORDER_ACTIONS,
        state: s,
        resource: order(s),
        actor: superAdmin,
      })?.id;
    expect(primary("pending")).toBe("order.review");
    expect(primary("assigned")).toBe("order.manage_assignment");
    expect(primary("qa")).toBe("order.review_qa");
    expect(primary("disputed")).toBe("order.manage_dispute");
    expect(primary("released")).toBe("order.view");
  });
});

describe("transition guards", () => {
  it("accepts documented transitions and rejects everything else", () => {
    expect(isValidAccountTransition("Active", "Suspended")).toBe(true);
    expect(isValidAccountTransition("Deleted", "Active")).toBe(false);
    expect(isValidOrderTransition("pending", "awaiting_payment")).toBe(true);
    expect(isValidOrderTransition("pending", "released")).toBe(false);
  });

  it("treats a stale no-op transition as allowed", () => {
    expect(
      assertTransition({
        from: "Suspended",
        to: "Suspended",
        transitions: ACCOUNT_TRANSITIONS,
        resource: "account",
      }).allowed,
    ).toBe(true);
  });

  it("rejects a stale transition with a readable reason", () => {
    const d = assertTransition({
      from: "released",
      to: "rework",
      transitions: ORDER_TRANSITIONS,
      resource: "order",
    });
    expect(d.allowed).toBe(false);
    expect(d.allowed === false && d.reason).toMatch(/cannot move/);
  });

  it("keeps every action's target state inside its lifecycle map", () => {
    for (const def of ACCOUNT_ACTIONS) {
      if (!def.to || def.allowedStates === "*") continue;
      for (const from of def.allowedStates)
        expect(isValidAccountTransition(from, def.to)).toBe(true);
    }
    for (const def of [...CLIENT_ORDER_ACTIONS, ...ADMIN_ORDER_ACTIONS]) {
      if (!def.to || def.allowedStates === "*") continue;
      for (const from of def.allowedStates) expect(isValidOrderTransition(from, def.to)).toBe(true);
    }
  });
});
