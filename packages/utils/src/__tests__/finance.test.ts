import { describe, it, expect } from "vitest";
import {
  rupeesToPaise,
  formatINR,
  summarize,
  accountBalances,
  loanOutstanding,
  countsAsExpense,
  looksLikeCardBillPayment,
  findSameAmountCardExpenses,
} from "../finance";

const base = {
  projectId: "p1",
  accountId: "bank",
  fromAccountId: null,
  toAccountId: null,
  paymentMode: "upi",
  category: "Food & Groceries",
  source: null,
  eventId: null,
  loanId: null,
  deletedAt: null,
  party: null,
  note: null,
} as const;

let n = 0;
const tx = (o: Record<string, unknown>) =>
  ({ ...base, id: `t${++n}`, date: "2026-10-05", ...o }) as never;

describe("money helpers", () => {
  it("converts rupees to paise", () => {
    expect(rupeesToPaise(500)).toBe(50000);
    expect(rupeesToPaise("₹1,200.50")).toBe(120050);
    expect(rupeesToPaise("0.1")).toBe(10);
  });
  it("rejects more than 2 decimals and junk", () => {
    expect(rupeesToPaise("10.555")).toBeNull();
    expect(rupeesToPaise("abc")).toBeNull();
  });
  it("formats with Indian grouping", () => {
    expect(formatINR(13200000)).toBe("₹1,32,000");
    expect(formatINR(120050)).toBe("₹1,200.50");
    expect(formatINR(-5000_00)).toBe("−₹5,000");
    expect(formatINR(0)).toBe("₹0");
  });
});

describe("summarize", () => {
  it("income minus expense, transfers ignored (card bill is not a second expense)", () => {
    const rows = [
      tx({ type: "income", amountPaise: 40000_00, source: "Salary", category: "Salary" }),
      tx({ type: "expense", amountPaise: 5000_00, paymentMode: "credit_card", accountId: "card" }),
      // paying the card bill from the bank = transfer
      tx({ type: "transfer", amountPaise: 5000_00, accountId: null, fromAccountId: "bank", toAccountId: "card", projectId: null, paymentMode: null, category: null }),
    ];
    const s = summarize(rows, []);
    expect(s.incomePaise).toBe(40000_00);
    expect(s.expensePaise).toBe(5000_00); // not 10,000
    expect(s.profitPaise).toBe(35000_00);
  });

  it("ignores soft-deleted rows and filters by project and date", () => {
    const rows = [
      tx({ type: "expense", amountPaise: 100_00 }),
      tx({ type: "expense", amountPaise: 900_00, deletedAt: "2026-10-06T00:00:00Z" }),
      tx({ type: "expense", amountPaise: 300_00, projectId: "p2" }),
      tx({ type: "expense", amountPaise: 700_00, date: "2026-09-30" }),
    ];
    expect(summarize(rows, [], { projectId: "p1", from: "2026-10-01", to: "2026-10-31" }).expensePaise).toBe(100_00);
  });

  it("open event spending is shown separately; concluding it moves the same rows into expense", () => {
    const rows = [
      tx({ type: "expense", amountPaise: 20000_00, eventId: "e1", category: "Shopping" }),
      tx({ type: "expense", amountPaise: 12000_00, eventId: "e1", category: "Dining Out", date: "2026-11-02" }),
      tx({ type: "expense", amountPaise: 500_00 }),
    ];
    const open = summarize(rows, [{ id: "e1", name: "Diwali 2026", status: "open" }]);
    expect(open.expensePaise).toBe(500_00);
    expect(open.openEventsPaise).toBe(32000_00);
    expect(open.byEvent["Diwali 2026"]).toBe(32000_00);

    const done = summarize(rows, [{ id: "e1", name: "Diwali 2026", status: "concluded" }]);
    expect(done.expensePaise).toBe(32500_00); // counted once, no duplicate
    expect(done.openEventsPaise).toBe(0);
    expect(done.byEvent["Diwali 2026"]).toBe(32000_00);
    // on their own dates
    expect(summarize(rows, [{ id: "e1", name: "Diwali 2026", status: "concluded" }], { from: "2026-11-01", to: "2026-11-30" }).expensePaise).toBe(12000_00);
  });

  it("groups income by source", () => {
    const rows = [
      tx({ type: "income", amountPaise: 100_00, source: "Shop sales" }),
      tx({ type: "income", amountPaise: 50_00, source: "Shop sales" }),
      tx({ type: "income", amountPaise: 25_00, source: null }),
    ];
    const s = summarize(rows, []);
    expect(s.bySource).toEqual({ "Shop sales": 150_00, Other: 25_00 });
  });
});

describe("countsAsExpense", () => {
  it("only expenses count; open-event expenses do not", () => {
    const events = new Map([["e1", { status: "open" as const }]]);
    expect(countsAsExpense({ type: "income", eventId: null }, events)).toBe(false);
    expect(countsAsExpense({ type: "expense", eventId: null }, events)).toBe(true);
    expect(countsAsExpense({ type: "expense", eventId: "e1" }, events)).toBe(false);
  });
});

describe("accountBalances", () => {
  const accounts = [
    { id: "bank", openingBalancePaise: 10000_00, deletedAt: null },
    { id: "card", openingBalancePaise: 0, deletedAt: null },
    { id: "cash", openingBalancePaise: 500_00, deletedAt: null },
  ];
  it("credit card goes negative on spend and returns to zero when the bill is paid", () => {
    const rows = [
      tx({ type: "expense", amountPaise: 5000_00, accountId: "card", paymentMode: "credit_card" }),
    ];
    expect(accountBalances(accounts, rows).card).toBe(-5000_00);
    rows.push(tx({ type: "transfer", amountPaise: 5000_00, accountId: null, fromAccountId: "bank", toAccountId: "card" }));
    const b = accountBalances(accounts, rows);
    expect(b.card).toBe(0);
    expect(b.bank).toBe(5000_00);
  });
  it("income adds, open-event expenses still reduce the balance, deleted rows ignored", () => {
    const rows = [
      tx({ type: "income", amountPaise: 2000_00, accountId: "bank" }),
      tx({ type: "expense", amountPaise: 300_00, accountId: "cash", eventId: "e1", paymentMode: "cash" }),
      tx({ type: "expense", amountPaise: 999_00, accountId: "cash", deletedAt: "2026-10-07T00:00:00Z" }),
    ];
    const b = accountBalances(accounts, rows);
    expect(b.bank).toBe(12000_00);
    expect(b.cash).toBe(200_00);
  });
  it("respects the upTo date", () => {
    const rows = [tx({ type: "income", amountPaise: 100_00, accountId: "bank", date: "2026-11-01" })];
    expect(accountBalances(accounts, rows, "2026-10-31").bank).toBe(10000_00);
  });
});

describe("loanOutstanding", () => {
  it("subtracts linked EMIs and never goes below zero", () => {
    const loan = { id: "l1", principalPaise: 50000_00 };
    const rows = [
      tx({ type: "expense", amountPaise: 3000_00, loanId: "l1" }),
      tx({ type: "expense", amountPaise: 3000_00, loanId: "l1" }),
      tx({ type: "expense", amountPaise: 3000_00, loanId: "other" }),
      tx({ type: "expense", amountPaise: 3000_00, loanId: "l1", deletedAt: "2026-10-01T00:00:00Z" }),
    ];
    expect(loanOutstanding(loan, rows)).toBe(44000_00);
    expect(loanOutstanding({ id: "l1", principalPaise: 100_00 }, rows)).toBe(0);
  });
});

describe("double-counting guards", () => {
  it("spots card-bill wording", () => {
    expect(looksLikeCardBillPayment("HDFC credit card bill")).toBe(true);
    expect(looksLikeCardBillPayment(null, "CC payment")).toBe(true);
    expect(looksLikeCardBillPayment("Monthly groceries")).toBe(false);
  });
  it("finds a same-amount credit-card expense within the window", () => {
    const rows = [
      tx({ type: "expense", amountPaise: 5000_00, paymentMode: "credit_card", date: "2026-10-03" }),
      tx({ type: "expense", amountPaise: 5000_00, paymentMode: "upi", date: "2026-10-03" }),
      tx({ type: "expense", amountPaise: 5000_00, paymentMode: "credit_card", date: "2026-05-01" }),
    ];
    expect(findSameAmountCardExpenses({ amountPaise: 5000_00, date: "2026-10-20" }, rows)).toHaveLength(1);
  });
});
