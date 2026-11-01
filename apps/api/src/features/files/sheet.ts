/**
 * A real .xlsx of one dashboard sheet: the same columns the user sees in the app (from @jobrio/constants/sheets),
 * dropdown lists on the choice columns, a frozen bold header, filters, and a SUM row for money columns.
 */
import ExcelJS from "exceljs";
import type { SheetDef, SheetRef } from "@jobrio/constants/sheets";
import { cellValue, type SheetRecord } from "@jobrio/utils/sheet";
import { safeText } from "./report";

export type RefNames = Partial<Record<SheetRef, Record<string, string>>>;

const colLetter = (n: number) => {
  let s = "";
  for (let i = n; i > 0; i = Math.floor((i - 1) / 26))
    s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
  return s;
};

export const sheetFileName = (def: SheetDef, month: string) =>
  `wealthspan-${def.key}-${/^\d{4}-\d{2}$/.test(month) ? month : "all"}.xlsx`;

export async function buildSheetXlsx(
  def: SheetDef,
  rows: SheetRecord[],
  names: RefNames,
  title = def.title,
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Wealthspan";
  const ws = wb.addWorksheet(
    safeText(title)
      .replace(/[\\/?*[\]:]/g, " ")
      .slice(0, 31) || "Sheet",
    { views: [{ state: "frozen", ySplit: 1 }] },
  );
  ws.columns = def.columns.map((c) => ({
    header: c.label,
    key: c.key,
    width: Math.max(10, Math.round(c.width / 7)),
  }));
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };

  for (const r of rows) {
    ws.addRow(
      Object.fromEntries(
        def.columns.map((c) => {
          const v = cellValue(c, r);
          if (v === null) return [c.key, null];
          if (c.type === "ref") return [c.key, safeText(names[c.ref!]?.[String(v)] ?? String(v))];
          if (c.type === "select")
            return [c.key, safeText(c.options?.find((o) => o.value === v)?.label ?? String(v))];
          return [c.key, typeof v === "string" ? safeText(v) : v];
        }),
      ),
    );
  }

  const last = rows.length + 1;
  const sums = def.columns.map((c, i) => ({ c, i })).filter(({ c }) => c.type === "money" && c.sum);
  const hasTotal = sums.length > 0 && rows.length > 0;
  if (hasTotal) {
    const total = ws.addRow({});
    total.getCell(1).value = "Total";
    total.font = { bold: true };
    for (const { c, i } of sums) {
      const L = colLetter(i + 1);
      const result = rows.reduce((sum, r) => sum + Number(r[`${c.key}Paise`] ?? 0), 0) / 100;
      total.getCell(i + 1).value = { formula: `SUM(${L}2:${L}${last})`, result };
      total.getCell(i + 1).numFmt = "#,##0.00";
    }
  }

  def.columns.forEach((c, i) => {
    const column = ws.getColumn(i + 1);
    if (c.type === "money") column.numFmt = "#,##0.00";
    // Real Excel dropdowns on choice columns: the rows that exist, and 200 more below for new entries.
    if (c.type === "select" && c.options?.length) {
      const list = `"${c.options.map((o) => o.label.replace(/[",]/g, " ")).join(",")}"`;
      if (list.length > 255) return;
      const firstFree = last + (hasTotal ? 2 : 1);
      const rowsWithList = [
        ...Array.from({ length: last - 1 }, (_, k) => k + 2),
        ...Array.from({ length: 200 }, (_, k) => firstFree + k),
      ];
      for (const row of rowsWithList)
        ws.getCell(row, i + 1).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [list],
        };
    }
  });
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: def.columns.length } };
  return Buffer.from(await wb.xlsx.writeBuffer());
}
