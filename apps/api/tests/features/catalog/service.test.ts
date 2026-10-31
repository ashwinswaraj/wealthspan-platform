import { describe, expect, it } from "vitest";
import type { FinanceAuditEntry, FinanceTransaction } from "@jobrio/types";
import {
  CatalogError,
  createCatalogService,
  type CatalogEntity,
  type CatalogStore,
} from "../../../src/features/catalog";

function memStore(): CatalogStore {
  const rows: Record<string, any[]> = {};
  let n = 0;
  const t = (e: string) => (rows[e] ??= []);
  return {
    list: async (e, u) => t(e).filter((r) => r.userId === u && !r.deletedAt) as never,
    get: async (e, u, id) =>
      (t(e).find((r) => r.id === id && r.userId === u && !r.deletedAt) ?? null) as never,
    insert: async (e, row) => {
      const r = { ...row, id: String(++n), createdAt: "x", updatedAt: "x", deletedAt: null };
      t(e).push(r);
      return r as never;
    },
    update: async (e, u, id, patch) => {
      const r = t(e).find((x) => x.id === id && x.userId === u)!;
      Object.assign(r, patch);
      return { ...r } as never;
    },
    softDelete: async (e, u, id, at) => {
      t(e).find((x) => x.id === id && x.userId === u)!.deletedAt = at;
    },
  };
}
const setup = (txs: Partial<FinanceTransaction>[] = []) => {
  const audit: FinanceAuditEntry[] = [];
  const svc = createCatalogService({
    store: memStore(),
    now: () => new Date("2026-10-28T10:00:00Z"),
    finance: {
      listTransactions: async () => txs as FinanceTransaction[],
      insertAudit: async (e) => {
        audit.push(e as never);
      },
    },
  });
  return { svc, audit };
};
const code = (p: Promise<unknown>) =>
  p.then(
    () => "ok",
    (e: CatalogError) => e.code,
  );

describe("projects", () => {
  it("creates, validates, lists only own", async () => {
    const { svc } = setup();
    expect(await code(svc.create("projects", "u", { name: "A", kind: "personal" }))).toBe(
      "invalid",
    );
    const p = await svc.create("projects", "u", { name: "  Shop  ", kind: "business" });
    expect(p).toMatchObject({ name: "Shop", kind: "business", archivedAt: null });
    expect(await svc.list("projects", "u")).toHaveLength(1);
    expect(await svc.list("projects", "other")).toHaveLength(0);
  });
  it("other user cannot read, edit or delete", async () => {
    const { svc } = setup();
    const p = await svc.create("projects", "u", { name: "Shop", kind: "business" });
    expect(await code(svc.update("projects", "x", p.id, { name: "Hack" }))).toBe("not_found");
    expect(await code(svc.remove("projects", "x", p.id))).toBe("not_found");
  });
  it("partial update keeps the rest and is audited", async () => {
    const { svc, audit } = setup();
    const p = await svc.create("projects", "u", { name: "Shop", kind: "business" });
    const r = await svc.update("projects", "u", p.id, { name: "Big Shop" }, "chatbot");
    expect(r).toMatchObject({ name: "Big Shop", kind: "business" });
    expect(audit.map((a) => `${a.actor}:${a.action}:${a.entity}`)).toEqual([
      "manual:create_project:project",
      "chatbot:update_project:project",
    ]);
  });
  it("cannot delete a project that has entries or events; can when empty", async () => {
    const used = setup([{ projectId: "1" } as never]);
    const p = await used.svc.create("projects", "u", { name: "Shop", kind: "business" });
    expect(await code(used.svc.remove("projects", "u", p.id))).toBe("conflict");

    const { svc } = setup();
    const q = await svc.create("projects", "u", { name: "Shop", kind: "business" });
    await svc.create("events", "u", { projectId: q.id, name: "Diwali" });
    expect(await code(svc.remove("projects", "u", q.id))).toBe("conflict");
  });
  it("soft delete hides it", async () => {
    const { svc } = setup();
    const p = await svc.create("projects", "u", { name: "Shop", kind: "business" });
    await svc.remove("projects", "u", p.id);
    expect(await svc.list("projects", "u")).toHaveLength(0);
  });
});

describe("accounts", () => {
  it("stores rupees as paise; credit limit only on cards", async () => {
    const { svc } = setup();
    const a = await svc.create("accounts", "u", {
      name: "HDFC",
      kind: "bank",
      openingBalance: 1500.5,
    });
    expect(a).toMatchObject({ openingBalancePaise: 150050, creditLimitPaise: null });
    expect(
      await code(svc.create("accounts", "u", { name: "HDFC 2", kind: "bank", creditLimit: 5000 })),
    ).toBe("invalid");
    const c = await svc.create("accounts", "u", {
      name: "ICICI card",
      kind: "credit_card",
      creditLimit: 100000,
    });
    expect(c.creditLimitPaise).toBe(10000000);
  });
  it("default project must be the user's own", async () => {
    const { svc } = setup();
    const other = await svc.create("projects", "v", { name: "Theirs", kind: "business" });
    expect(
      await code(
        svc.create("accounts", "u", { name: "Cash", kind: "cash", defaultProjectId: other.id }),
      ),
    ).toBe("invalid");
  });
  it("blocked from deletion while transactions use it (any of the 3 columns)", async () => {
    for (const k of ["accountId", "fromAccountId", "toAccountId"]) {
      const { svc } = setup([{ [k]: "1" } as never]);
      const a = await svc.create("accounts", "u", { name: "Cash", kind: "cash" });
      expect(a.id).toBe("1");
      expect(await code(svc.remove("accounts", "u", a.id))).toBe("conflict");
    }
  });
});

describe("events, loans, investments", () => {
  const seed = async () => {
    const s = setup();
    const p = await s.svc.create("projects", "u", { name: "Home", kind: "personal" });
    return { ...s, p };
  };
  it("event needs own project, converts budget, conclude / reopen", async () => {
    const { svc, p } = await seed();
    expect(await code(svc.create("events", "u", { projectId: "999", name: "Diwali" }))).toBe(
      "invalid",
    );
    const e = await svc.create("events", "u", {
      projectId: p.id,
      name: "Diwali",
      budget: 50000,
      startDate: "2026-11-01",
      endDate: "2026-11-03",
    });
    expect(e).toMatchObject({ status: "open", budgetPaise: 5000000 });
    expect(
      await code(
        svc.create("events", "u", {
          projectId: p.id,
          name: "Bad",
          startDate: "2026-11-05",
          endDate: "2026-11-01",
        }),
      ),
    ).toBe("invalid");
    expect((await svc.setEventStatus("u", e.id, "concluded")).concludedAt).toBe(
      "2026-10-28T10:00:00.000Z",
    );
    expect(await code(svc.setEventStatus("u", e.id, "concluded"))).toBe("conflict");
    expect((await svc.setEventStatus("u", e.id, "open")).concludedAt).toBeNull();
  });
  it("loan: validates, paise, status", async () => {
    const { svc, p } = await seed();
    expect(
      await code(svc.create("loans", "u", { projectId: p.id, lender: "SBI", principal: 0 })),
    ).toBe("invalid");
    const l = await svc.create("loans", "u", {
      projectId: p.id,
      lender: "SBI",
      principal: 500000,
      emi: 12500.5,
      emiDayOfMonth: 5,
      tenureMonths: 48,
      interestRatePct: 9.5,
    });
    expect(l).toMatchObject({
      principalPaise: 50000000,
      emiPaise: 1250050,
      status: "active",
      emiDayOfMonth: 5,
    });
    expect((await svc.setLoanStatus("u", l.id, "closed")).status).toBe("closed");
  });
  it("investment: kind checked, partial update re-validated", async () => {
    const { svc, p } = await seed();
    expect(
      await code(
        svc.create("investments", "u", { projectId: p.id, name: "Nifty SIP", kind: "lottery" }),
      ),
    ).toBe("invalid");
    const i = await svc.create("investments", "u", {
      projectId: p.id,
      name: "Nifty SIP",
      kind: "sip",
      currentValue: 12000,
    });
    expect(i.currentValuePaise).toBe(1200000);
    expect(await code(svc.update("investments", "u", i.id, { kind: "lottery" }))).toBe("invalid");
    expect(
      (await svc.update("investments", "u", i.id, { currentValue: 15000 })).currentValuePaise,
    ).toBe(1500000);
  });
  it("archive toggles", async () => {
    const { svc, p } = await seed();
    expect((await svc.archive("projects", "u", p.id, true)).archivedAt).not.toBeNull();
    expect((await svc.archive("projects", "u", p.id, false)).archivedAt).toBeNull();
  });
});
