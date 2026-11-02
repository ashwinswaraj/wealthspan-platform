import { describe, it, expect } from "vitest";
import { createCatalystFinanceStore, type CatalystLike } from "../../../src/features/finance";

const fake = (
  rowsFor: (q: string) => Array<Record<string, Record<string, unknown>>> = () => [],
) => {
  const queries: string[] = [];
  const writes: Array<{ table: string; op: string; row: Record<string, unknown> }> = [];
  const app: CatalystLike = {
    zcql: () => ({
      executeZCQLQuery: async (q) => {
        queries.push(q);
        return rowsFor(q);
      },
    }),
    datastore: () => ({
      table: (table) => ({
        insertRow: async (row) => {
          writes.push({ table, op: "insert", row });
          return {
            ROWID: "900",
            CREATEDTIME: "2026-10-24 10:00:00",
            MODIFIEDTIME: "2026-10-24 10:00:00",
            ...row,
          };
        },
        updateRow: async (row) => {
          writes.push({ table, op: "update", row });
          return row;
        },
      }),
    }),
  };
  return { app, queries, writes };
};

const txRow = {
  ROWID: "11",
  user_id: "u1",
  type: "expense",
  amount_paise: "50000",
  tx_date: "2026-10-24",
  project_id: "5",
  account_id: "6",
  from_account_id: "null",
  to_account_id: null,
  payment_mode: "cash",
  category: "Food",
  party: "",
  source: null,
  note: null,
  event_id: null,
  loan_id: null,
  investment_id: null,
  deleted_at: null,
  created_by: "chatbot",
  CREATEDTIME: "2026-10-24 10:00:00",
  MODIFIEDTIME: "2026-10-24 10:00:00",
};

describe("catalyst finance store", () => {
  it("every read is scoped to the user and hides deleted rows", async () => {
    const { app, queries } = fake();
    const s = createCatalystFinanceStore(app);
    await s.listTransactions("u1");
    await s.listEvents("u1");
    await s.getProject("u1", "1");
    await s.getAccount("u1", "2");
    await s.getEvent("u1", "3");
    await s.getLoan("u1", "4");
    await s.getInvestment("u1", "5");
    await s.getTransaction("u1", "6");
    expect(queries).toHaveLength(8);
    for (const q of queries) {
      expect(q).toContain("user_id = 'u1'");
      expect(q).toContain("deleted_at IS NULL");
    }
  });

  it("escapes quotes in the user id and refuses non-numeric row ids", async () => {
    const { app, queries } = fake();
    const s = createCatalystFinanceStore(app);
    await s.listTransactions("u1' OR '1'='1");
    expect(queries[0]).toContain("user_id = 'u1\\' OR \\'1\\'=\\'1'");
    await expect(s.getTransaction("u1", "1 OR 1=1")).rejects.toThrow("bad id");
  });

  it("maps rows: paise as numbers, null-like values become null", async () => {
    const { app } = fake(() => [{ transactions: txRow }]);
    const [t] = await createCatalystFinanceStore(app).listTransactions("u1");
    expect(t).toMatchObject({
      id: "11",
      amountPaise: 50000,
      fromAccountId: null,
      toAccountId: null,
      party: null,
      createdBy: "chatbot",
      createdAt: "2026-10-24T10:00:00",
    });
  });

  it("reads every page, so a per-query row cap cannot hide data", async () => {
    let call = 0;
    const { app, queries } = fake(() =>
      call++ === 0
        ? Array.from({ length: 250 }, () => ({ transactions: txRow }))
        : [{ transactions: txRow }],
    );
    const all = await createCatalystFinanceStore(app).listTransactions("u1");
    expect(all).toHaveLength(251);
    expect(queries[0]).toContain("LIMIT 0,250");
    expect(queries[1]).toContain("LIMIT 250,250");
  });

  it("insert writes the right columns; update/delete refuse rows the user doesn't own", async () => {
    const mine = fake((q) => (q.includes("user_id = 'u1'") ? [{ transactions: txRow }] : []));
    const s = createCatalystFinanceStore(mine.app);
    const t = await s.insertTransaction({
      userId: "u1",
      createdBy: "manual",
      type: "expense",
      amountPaise: 12345,
      date: "2026-10-24",
      projectId: "5",
      accountId: "6",
      fromAccountId: null,
      toAccountId: null,
      paymentMode: "cash",
      category: "Food",
      party: null,
      source: null,
      note: null,
      eventId: null,
      loanId: null,
      investmentId: null,
    });
    expect(mine.writes[0].row).toMatchObject({
      user_id: "u1",
      amount_paise: 12345,
      tx_date: "2026-10-24",
      payment_mode: "cash",
    });
    expect(t.id).toBe("900");

    await s.softDeleteTransaction("u1", "11", "2026-10-24T10:05:00.000Z");
    expect(mine.writes.at(-1)).toMatchObject({
      op: "update",
      row: { ROWID: "11", deleted_at: "2026-10-24 10:05:00" },
    });

    await expect(s.updateTransaction("u2", "11", { note: "x" })).rejects.toThrow("not found");
    await expect(s.softDeleteTransaction("u2", "11", "2026-10-24T10:05:00.000Z")).rejects.toThrow(
      "not found",
    );
    // user_id can never be changed through an update
    await s.updateTransaction("u1", "11", { note: "hi", userId: "u2" } as never);
    expect(mine.writes.at(-1)!.row).not.toHaveProperty("user_id");
  });
});
