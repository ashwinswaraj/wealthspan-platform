import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import type { FinanceSummary, FinanceTransaction } from "@jobrio/types";
import { buildReport, FILE_FORMATS, renderFile } from "../../../src/features/files";

const tx = (o: Partial<FinanceTransaction>): FinanceTransaction =>
  ({
    id: "1",
    userId: "u",
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
    deletedAt: null,
    type: "expense",
    amountPaise: 123450,
    date: "2026-10-02",
    projectId: "p1",
    accountId: "a1",
    fromAccountId: null,
    toAccountId: null,
    paymentMode: "upi",
    category: "food",
    party: 'Raju, "Tea" stall',
    source: null,
    note: '=HYPERLINK("http://x")',
    eventId: null,
    loanId: null,
    investmentId: null,
    ...o,
  }) as FinanceTransaction;

const summary: FinanceSummary = {
  incomePaise: 500000,
  expensePaise: 123450,
  profitPaise: 376550,
  openEventsPaise: 0,
  byCategory: { food: 123450 },
  byPaymentMode: { upi: 123450 },
  bySource: { Salary: 500000 },
  byEvent: {},
};

const report = buildReport({
  transactions: [
    tx({}),
    tx({
      id: "2",
      type: "transfer",
      paymentMode: null,
      category: null,
      projectId: null,
      accountId: null,
      fromAccountId: "a1",
      toAccountId: "a2",
      date: "2026-10-01",
      note: null,
      party: null,
    }),
  ],
  summary,
  names: { projects: { p1: "Shop" }, accounts: { a1: "HDFC", a2: "Cash" } },
  today: "2026-10-27",
});

describe("report", () => {
  it("converts paise to rupees, resolves names, sorts by date", () => {
    expect(report.rows.map((r) => r.date)).toEqual(["2026-10-01", "2026-10-02"]);
    expect(report.rows[0].account).toBe("HDFC → Cash");
    expect(report.rows[1]).toMatchObject({
      amount: 1234.5,
      project: "Shop",
      account: "HDFC",
      paymentMode: "upi",
    });
    expect(report.totals.find((t) => t.label === "Profit")!.amount).toBe(3765.5);
  });
});

describe("files", () => {
  it("csv: escapes quotes, blocks formulas, has BOM", async () => {
    const { body, mime, fileName } = await renderFile("csv", report);
    const text = body.toString("utf8");
    expect(text.charCodeAt(0)).toBe(0xfeff);
    expect(text).toContain('"Raju, ""Tea"" stall"');
    expect(text).toContain(`"'=HYPERLINK(""http://x"")"`);
    expect(text).not.toMatch(/,=HYPERLINK/);
    expect(mime).toContain("text/csv");
    expect(fileName).toBe("wealthspan-transactions-all.csv");
  });
  it("xlsx: opens, has both sheets, formula text neutralised", async () => {
    const { body } = await renderFile("xlsx", report);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(body as unknown as ArrayBuffer);
    expect(wb.worksheets.map((w) => w.name)).toEqual(["Summary", "Transactions"]);
    const ws = wb.getWorksheet("Transactions")!;
    expect(ws.rowCount).toBe(3);
    expect(String(ws.getCell("I3").value)).toBe('\'=HYPERLINK("http://x")');
    expect(ws.getCell("C3").value).toBe(1234.5);
  });
  it("docx and pdf are real files", async () => {
    const d = await renderFile("docx", report);
    expect(d.body.subarray(0, 2).toString()).toBe("PK");
    const p = await renderFile("pdf", report);
    expect(p.body.subarray(0, 5).toString()).toBe("%PDF-");
    expect(p.body.length).toBeGreaterThan(1000);
  });
  it("empty report still renders in every format", async () => {
    const empty = buildReport({
      transactions: [],
      summary: { ...summary, byCategory: {}, byPaymentMode: {}, bySource: {} },
      from: "2026-01-01",
      to: "2026-01-31",
    });
    for (const f of FILE_FORMATS)
      expect((await renderFile(f, empty)).body.length).toBeGreaterThan(50);
    expect(empty.period).toBe("2026-01-01 to 2026-01-31");
  });
});
