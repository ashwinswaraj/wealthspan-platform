import { describe, expect, it } from "vitest";
import { createAdminService, type AdminStore } from "../../../src/features/admin";
import type { PaymentSubmission, Subscription } from "../../../src/features/subscription";

const sub = (
  userId: string,
  plan: Subscription["plan"],
  startsOn: string,
  endsOn: string,
): Subscription => ({
  id: userId + plan,
  userId,
  plan,
  startsOn,
  endsOn,
  paymentId: null,
  createdAt: "",
});
const pay = (
  id: string,
  userId: string,
  status: PaymentSubmission["status"],
): PaymentSubmission => ({
  id,
  userId,
  plan: "pro_annual",
  amountPaise: 199900,
  utr: "123456789012",
  status,
  note: null,
  createdAt: `2026-10-2${id}T10:00:00`,
  reviewedAt: null,
  reviewedBy: null,
});

const store = (): AdminStore => ({
  listUsers: async () => [
    {
      id: "10001",
      email: "Admin@Example.com",
      name: "Ash",
      createdAt: "2026-10-30T08:00:00",
      active: true,
    },
    {
      id: "10002",
      email: "pro@example.com",
      name: "",
      createdAt: "2026-10-01T08:00:00",
      active: true,
    },
    {
      id: "10003",
      email: "trial@example.com",
      name: "T",
      createdAt: "2026-10-30T09:00:00",
      active: false,
    },
    {
      id: "10004",
      email: "free@example.com",
      name: "F",
      createdAt: "2026-01-01T09:00:00",
      active: true,
    },
  ],
  countRows: async (t) => (t === "projects" ? 7 : 42),
  listAllPayments: async (s) =>
    [pay("1", "10002", "approved"), pay("2", "10004", "pending")].filter(
      (p) => !s || p.status === s,
    ),
  listAllSubscriptions: async () => [
    sub("10002", "pro_annual", "2026-10-01", "2027-09-30"),
    sub("10003", "trial", "2026-10-25", "2026-11-23"),
    sub("10004", "pro_monthly", "2026-01-01", "2026-01-30"),
  ],
  recentTransactions: async () => [
    {
      id: "1",
      type: "income",
      category: null,
      party: null,
      paymentMode: "debit_card",
      amountPaise: 5000,
      projectName: "Shop",
      createdAt: "2026-10-30T10:00:00",
    },
  ],
  recentAudit: async () => [
    {
      id: "1",
      action: "create_project",
      entity: "project",
      entityId: "9",
      actor: "10001",
      createdAt: "2026-10-30T10:00:00",
    },
  ],
});
const pinned = (ids: string[]) =>
  createAdminService({
    store: store(),
    adminEmails: ["admin@example.com"],
    adminUserIds: ids,
    now: () => new Date("2026-10-31T06:00:00Z"),
  });
const svc = () =>
  createAdminService({
    store: store(),
    adminEmails: [" admin@example.com "],
    now: () => new Date("2026-10-31T06:00:00Z"),
  });

describe("admin service", () => {
  it("recognises admins by e-mail, case-insensitively", () => {
    expect(svc().isAdminEmail("ADMIN@example.com")).toBe(true);
    expect(svc().isAdminEmail("pro@example.com")).toBe(false);
    expect(svc().isAdminEmail(undefined)).toBe(false);
  });
  it("counts users by live plan (expired = free; trial = Go) and computes MRR + trend", async () => {
    const o = await svc().overview();
    expect(o).toMatchObject({
      users: 4,
      usersByPlan: { free: 2, go: 1, pro: 1 },
      projects: 7,
      transactions: 42,
      pendingPayments: 1,
    });
    expect(o.mrrPaise).toBe(Math.round((199900 * 30) / 365));
    expect(o.usersTrend).toHaveLength(30);
    expect(o.usersTrend[28]).toBe(2); // two sign-ups on 2026-10-30 (index 29 = today)
  });
  it("lists users with plan, validity, status and admin flag", async () => {
    const u = await svc().users();
    expect(u.find((x) => x.id === "10001")).toMatchObject({
      code: "WSP-10001",
      role: "Super Administrator",
      plan: "Free",
      planValidity: "Lifetime Free Tier",
      isSuperAdmin: true,
    });
    expect(u.find((x) => x.id === "10002")).toMatchObject({
      plan: "Pro",
      planValidity: "30 Sep 2027",
    });
    expect(u.find((x) => x.id === "10003")).toMatchObject({ plan: "Go", status: "Suspended" });
  });
  it("maps payments with e-mail and filters by status", async () => {
    const all = await svc().payments();
    expect(all).toHaveLength(2);
    expect((await svc().payments("pending"))[0]).toMatchObject({
      userEmail: "free@example.com",
      status: "pending",
      amountPaise: 199900,
    });
  });
  it("shapes ledger and audit rows", async () => {
    expect((await svc().ledger())[0]).toMatchObject({
      project: "Shop",
      category: "Income",
      mode: "DEBIT CARD",
      status: "Cleared",
    });
    expect((await svc().audit())[0]).toMatchObject({
      title: "create project",
      description: "project 9",
    });
  });
});

describe("admin pinning (e-mail AND user id)", () => {
  it("without pinned ids the e-mail alone is enough (bootstrap)", () => {
    expect(pinned([]).isAdmin({ email: "admin@example.com", userId: "7" })).toBe(true);
    expect(pinned([]).isPinned()).toBe(false);
  });
  it("with pinned ids a matching e-mail on another account is refused", () => {
    const s = pinned(["42"]);
    expect(s.isPinned()).toBe(true);
    expect(s.isAdmin({ email: "admin@example.com", userId: "42" })).toBe(true);
    expect(s.isAdmin({ email: "admin@example.com", userId: "43" })).toBe(false);
    expect(s.isAdmin({ email: "admin@example.com", userId: undefined })).toBe(false);
    expect(s.isAdmin({ email: "other@example.com", userId: "42" })).toBe(false);
  });
  it("the ledger never shows what users typed", async () => {
    const row = (await svc().ledger())[0];
    expect(row.counterparty).toBe("Hidden");
  });
});
