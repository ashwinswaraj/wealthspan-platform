import { describe, it, expect, beforeEach } from "vitest";
import type { FinanceAccount, FinanceAuditEntry, FinanceEvent, FinanceLoan, FinanceProject, FinanceTransaction } from "@jobrio/types";
import { createFinanceService, FinanceError } from "../../../src/features/finance";
import type { FinanceStore, NewTransaction } from "../../../src/features/finance";

const base = { createdAt: "2026-10-01T00:00:00Z", updatedAt: "2026-10-01T00:00:00Z", deletedAt: null, createdBy: "manual" as const };

const makeStore = () => {
  let n = 0;
  const d = {
    projects: [
      { id: "p1", userId: "u1", name: "Shop", kind: "business", archivedAt: null, ...base },
      { id: "p2", userId: "u2", name: "Other user", kind: "business", archivedAt: null, ...base },
    ] as FinanceProject[],
    accounts: [
      { id: "cash1", userId: "u1", name: "Cash", kind: "cash", openingBalancePaise: 0, creditLimitPaise: null, defaultProjectId: null, archivedAt: null, ...base },
      { id: "bank1", userId: "u1", name: "HDFC", kind: "bank", openingBalancePaise: 0, creditLimitPaise: null, defaultProjectId: null, archivedAt: null, ...base },
      { id: "card1", userId: "u1", name: "Card", kind: "credit_card", openingBalancePaise: 0, creditLimitPaise: 100000_00, defaultProjectId: null, archivedAt: null, ...base },
      { id: "bank2", userId: "u2", name: "Not mine", kind: "bank", openingBalancePaise: 0, creditLimitPaise: null, defaultProjectId: null, archivedAt: null, ...base },
    ] as FinanceAccount[],
    events: [{ id: "e1", userId: "u1", projectId: "p1", name: "Diwali", budgetPaise: null, startDate: null, endDate: null, status: "open", concludedAt: null, ...base }] as FinanceEvent[],
    loans: [] as FinanceLoan[],
    txs: [] as FinanceTransaction[],
    audit: [] as Omit<FinanceAuditEntry, "id">[],
  };
  const mine = <T extends { userId: string; id: string; deletedAt?: string | null }>(rows: T[], u: string, id: string) =>
    rows.find((r) => r.userId === u && r.id === id && !r.deletedAt) ?? null;
  const store: FinanceStore = {
    getProject: async (u, id) => mine(d.projects, u, id),
    getAccount: async (u, id) => mine(d.accounts, u, id),
    getEvent: async (u, id) => mine(d.events, u, id),
    getLoan: async (u, id) => mine(d.loans, u, id),
    getInvestment: async () => null,
    listTransactions: async (u) => d.txs.filter((t) => t.userId === u && !t.deletedAt),
    listEvents: async (u) => d.events.filter((e) => e.userId === u),
    getTransaction: async (u, id) => mine(d.txs, u, id),
    insertTransaction: async (row: NewTransaction) => {
      const t = { ...row, id: `t${++n}`, createdAt: `2026-10-24T00:00:${String(n).padStart(2, "0")}Z`, updatedAt: "", deletedAt: null } as FinanceTransaction;
      d.txs.push(t);
      return t;
    },
    updateTransaction: async (u, id, patch) => {
      const t = mine(d.txs, u, id)!;
      Object.assign(t, patch);
      return t;
    },
    softDeleteTransaction: async (u, id, at) => { mine(d.txs, u, id)!.deletedAt = at; },
    insertAudit: async (e) => { d.audit.push(e); },
  };
  return { store, d };
};

const NOW = new Date("2026-10-24T08:00:00Z");
const expense = { type: "expense", amount: "500", date: "2026-10-24", projectId: "p1", accountId: "cash1", paymentMode: "cash", category: "Food & Groceries" };

describe("finance service", () => {
  let ctx: ReturnType<typeof makeStore>;
  let svc: ReturnType<typeof createFinanceService>;
  beforeEach(() => { ctx = makeStore(); svc = createFinanceService({ store: ctx.store, now: () => NOW }); });

  it("saves an expense as integer paise and writes an audit entry", async () => {
    const { transaction } = await svc.createTransaction("u1", { ...expense, amount: "1,200.50" }, "chatbot");
    expect(transaction.amountPaise).toBe(120050);
    expect(ctx.d.audit).toHaveLength(1);
    expect(ctx.d.audit[0]).toMatchObject({ actor: "chatbot", action: "create_transaction", userId: "u1" });
  });

  it("rejects invalid entries with field errors", async () => {
    await expect(svc.createTransaction("u1", { ...expense, amount: "-5" })).rejects.toMatchObject({ code: "invalid", fields: { amount: expect.any(String) } });
  });

  it("never lets a user touch another user's project or account", async () => {
    await expect(svc.createTransaction("u1", { ...expense, projectId: "p2" })).rejects.toMatchObject({ fields: { projectId: expect.any(String) } });
    await expect(svc.createTransaction("u1", { type: "transfer", amount: 100, date: "2026-10-24", fromAccountId: "bank1", toAccountId: "bank2" })).rejects.toMatchObject({ fields: { toAccountId: expect.any(String) } });
  });

  it("checks the payment mode fits the account", async () => {
    await expect(svc.createTransaction("u1", { ...expense, paymentMode: "upi" })).rejects.toMatchObject({ fields: { paymentMode: expect.any(String) } });
  });

  it("warns (but saves) a credit card bill typed as an expense", async () => {
    await svc.createTransaction("u1", { ...expense, accountId: "card1", paymentMode: "credit_card", amount: 8000 });
    const r = await svc.createTransaction("u1", { ...expense, accountId: "bank1", paymentMode: "bank_transfer", amount: 8000, party: "HDFC credit card bill" });
    expect(r.warnings).toHaveLength(2);
    expect(r.transaction.id).toBeTruthy();
  });

  it("transfers need no project and don't count in the summary", async () => {
    await svc.createTransaction("u1", { type: "transfer", amount: 8000, date: "2026-10-24", fromAccountId: "bank1", toAccountId: "card1" });
    await svc.createTransaction("u1", expense);
    const s = await svc.getSummary("u1");
    expect(s.expensePaise).toBe(50000);
    expect(s.incomePaise).toBe(0);
  });

  it("open-event spending is shown separately, not in expense", async () => {
    await svc.createTransaction("u1", { ...expense, eventId: "e1", amount: 3000 });
    const s = await svc.getSummary("u1");
    expect(s.expensePaise).toBe(0);
    expect(s.openEventsPaise).toBe(300000);
  });

  it("update merges the patch, re-validates and audits before/after", async () => {
    const { transaction } = await svc.createTransaction("u1", expense);
    const r = await svc.updateTransaction("u1", transaction.id, { amount: 750 }, "chatbot");
    expect(r.transaction.amountPaise).toBe(75000);
    expect(ctx.d.audit.at(-1)).toMatchObject({ action: "update_transaction", actor: "chatbot" });
    await expect(svc.updateTransaction("u1", transaction.id, { amount: 0 })).rejects.toBeInstanceOf(FinanceError);
  });

  it("soft-deletes, hides from lists, and cannot touch someone else's row", async () => {
    const { transaction } = await svc.createTransaction("u1", expense);
    await expect(svc.deleteTransaction("u2", transaction.id)).rejects.toMatchObject({ code: "not_found", status: 404 });
    await svc.deleteTransaction("u1", transaction.id, "chatbot");
    expect((await svc.listTransactions("u1")).total).toBe(0);
    expect(ctx.d.txs[0].deletedAt).toBe(NOW.toISOString());
    expect(ctx.d.audit.at(-1)).toMatchObject({ action: "delete_transaction" });
  });

  it("lists newest first with filters and paging", async () => {
    for (const day of ["01", "05", "03"]) await svc.createTransaction("u1", { ...expense, date: `2026-10-${day}` });
    const all = await svc.listTransactions("u1");
    expect(all.items.map((t) => t.date)).toEqual(["2026-10-05", "2026-10-03", "2026-10-01"]);
    const page = await svc.listTransactions("u1", { from: "2026-10-02", limit: 1 });
    expect(page.total).toBe(2);
    expect(page.items).toHaveLength(1);
  });
});
