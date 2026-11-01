import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { SHEETS } from "@jobrio/constants/sheets";
import { buildSheetXlsx, sheetFileName } from "../../../src/features/files";

const load = async (buf: Buffer) => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as never);
  return wb.worksheets[0];
};

describe("sheet xlsx", () => {
  const rows = [
    {
      id: "1",
      date: "2026-10-02",
      amountPaise: 150050,
      category: "Salary",
      party: "=HYPERLINK(1)",
      projectId: "p1",
      accountId: "a1",
      paymentMode: "upi",
      note: null,
    },
    {
      id: "2",
      date: "2026-10-03",
      amountPaise: 50000,
      category: "Business Sales",
      party: "Raju",
      projectId: "p1",
      accountId: "a1",
      paymentMode: "cash",
      note: "x",
    },
  ];
  it("has the same columns as the app, names instead of ids, and a SUM row", async () => {
    const ws = await load(
      await buildSheetXlsx(SHEETS.income, rows, {
        projects: { p1: "Shop" },
        accounts: { a1: "HDFC" },
      }),
    );
    const header = ws.getRow(1).values as unknown[];
    expect(header.slice(1)).toEqual(SHEETS.income.columns.map((c) => c.label));
    expect(ws.getRow(2).getCell(2).value).toBe(1500.5);
    expect(ws.getRow(2).getCell(6).value).toBe("Shop");
    expect(ws.getRow(2).getCell(9).value).toBeNull();
    expect(ws.getRow(2).getCell(7).value).toBe("HDFC");
    const total = ws.getRow(4).getCell(2).value as { formula: string; result: number };
    expect(total.formula).toBe("SUM(B2:B3)");
    expect(total.result).toBe(2000.5);
  });
  it("neutralises formulas typed by users", async () => {
    const ws = await load(await buildSheetXlsx(SHEETS.income, rows, {}));
    expect(String(ws.getRow(2).getCell(5).value)).toBe("'=HYPERLINK(1)");
  });
  it("gives choice columns real Excel dropdowns", async () => {
    const ws = await load(await buildSheetXlsx(SHEETS.income, rows, {}));
    expect(ws.getCell("C2").dataValidation.type).toBe("list");
  });
  it("works with no rows (just the header)", async () => {
    const ws = await load(await buildSheetXlsx(SHEETS["debt-loan"], [], {}));
    expect(ws.getRow(1).getCell(1).value).toBe("Lender");
    expect(ws.getRow(2).getCell(1).value).toBeNull(); // no total row when there is nothing to add up
  });
  it("names the file by sheet and month", () => {
    expect(sheetFileName(SHEETS.income, "2026-10")).toBe("wealthspan-income-2026-10.xlsx");
    expect(sheetFileName(SHEETS.income, "../x")).toBe("wealthspan-income-all.xlsx");
  });
});
