import { describe, expect, it } from "vitest";
import { SHEETS } from "@wealthspan/constants/sheets";
import type { SheetRecord } from "../sheet";
import {
  buildInput,
  cellValue,
  columnTotals,
  filterRecords,
  incomeExpenseNet,
  missingRequired,
  monthOptions,
  monthRange,
  parseCell,
  recordDate,
  recordsToCsv,
  sortRecords,
  todayIST,
} from "../sheet";

const income = SHEETS.income;
const col = (key: string) => income.columns.find((c) => c.key === key)!;

describe("months", () => {
  it("lists All Months then 12 months, newest first", () => {
    const m = monthOptions(new Date("2026-10-31T10:00:00Z"));
    expect(m[0]).toEqual({ value: "all", label: "All Months" });
    expect(m[1]).toEqual({ value: "2026-10", label: "Oct 2026" });
    expect(m[2].label).toBe("Sep 2026");
    expect(m[12]).toEqual({ value: "2025-11", label: "Nov 2025" });
    expect(m).toHaveLength(13);
  });
  it("month range covers the whole month, leap years included", () => {
    expect(monthRange("2026-10")).toEqual({ from: "2026-10-01", to: "2026-10-31" });
    expect(monthRange("2028-02")).toEqual({ from: "2028-02-01", to: "2028-02-29" });
    expect(monthRange("all")).toEqual({});
  });
  it("today is the Indian date", () =>
    expect(todayIST(new Date("2026-10-31T20:00:00Z"))).toBe("2026-11-01"));
  it("files a record under its date, else its start date, else when it was created", () => {
    expect(recordDate({ id: "1", date: "2026-03-04" })).toBe("2026-03-04");
    expect(recordDate({ id: "1", startDate: "2026-05-01" })).toBe("2026-05-01");
    expect(recordDate({ id: "1", createdAt: "2026-06-07T10:00:00" })).toBe("2026-06-07");
  });
});

describe("cells", () => {
  it("shows money in rupees", () => {
    expect(cellValue(col("amount"), { id: "1", amountPaise: 150050 })).toBe(1500.5);
    expect(cellValue(col("amount"), { id: "1", amountPaise: null })).toBeNull();
    expect(cellValue(col("note"), { id: "1", note: "hi" })).toBe("hi");
  });
  it("parses and validates what was typed", () => {
    expect(parseCell(col("amount"), "1,500.50")).toEqual({ ok: true, value: 1500.5 });
    expect(parseCell(col("amount"), "abc").ok).toBe(false);
    expect(parseCell(col("amount"), "-5").ok).toBe(false);
    expect(parseCell(col("amount"), "10.123").ok).toBe(false);
    expect(parseCell(col("amount"), "").ok).toBe(false); // required
    expect(parseCell(col("note"), "  ")).toEqual({ ok: true, value: null });
    expect(parseCell(col("date"), "2026-02-30").ok).toBe(false);
    expect(parseCell(col("date"), "2026-04-01")).toEqual({ ok: true, value: "2026-04-01" });
    expect(parseCell(col("category"), "Salary")).toEqual({ ok: true, value: "Salary" });
    expect(parseCell(col("category"), "Nonsense").ok).toBe(false);
  });
});

describe("new rows", () => {
  it("adds the fixed type and drops empty cells", () => {
    expect(
      buildInput(income, { date: "2026-10-01", amount: 500, note: null, category: "Salary" }),
    ).toEqual({ type: "income", date: "2026-10-01", amount: 500, category: "Salary" });
  });
  it("lists the required columns still empty", () => {
    expect(missingRequired(income, { date: "2026-10-01", amount: 5 })).toEqual([
      "Category",
      "Project",
      "Account",
      "Mode",
    ]);
    expect(missingRequired(income, { date: "2026-10-01", amount: 5 }, ["projectId"])).not.toContain(
      "Project",
    );
  });
});

describe("rows", () => {
  const rows = [
    { id: "1", date: "2026-10-01", amountPaise: 1000, note: "Rent" },
    { id: "2", date: "2026-10-03", amountPaise: 5000, note: "Salary" },
    { id: "3", date: "2026-10-02", amountPaise: null, note: "x" },
  ];
  it("sorts, with empty cells last either way", () => {
    expect(sortRecords(rows, col("amount"), "desc").map((r) => r.id)).toEqual(["2", "1", "3"]);
    expect(sortRecords(rows, col("amount"), "asc").map((r) => r.id)).toEqual(["1", "2", "3"]);
    expect(sortRecords(rows, col("date"), "desc").map((r) => r.id)).toEqual(["2", "3", "1"]);
  });
  it("searches the visible text", () => {
    const label = (c: (typeof income.columns)[number], r: SheetRecord) =>
      String(cellValue(c, r) ?? "");
    expect(filterRecords(rows, income.columns, "sal", label).map((r) => r.id)).toEqual(["2"]);
    expect(filterRecords(rows, income.columns, "", label)).toHaveLength(3);
  });
  it("adds money exactly", () => {
    expect(
      columnTotals(income.columns, [
        { id: "1", amountPaise: 10 },
        { id: "2", amountPaise: 20 },
        { id: "3", amountPaise: 30 },
      ]),
    ).toEqual({ amount: 0.6 });
  });
  it("income, expense and net for the project sheet", () => {
    expect(
      incomeExpenseNet([
        { id: "1", type: "income", amountPaise: 100000 },
        { id: "2", type: "expense", amountPaise: 30050 },
      ]),
    ).toEqual({ income: 1000, expense: 300.5, net: 699.5 });
  });
  it("csv keeps Excel safe and quotes commas", () => {
    const csv = recordsToCsv(
      [col("party"), col("note")],
      [{ id: "1", party: "=HYPERLINK(1)", note: 'a,"b"' }],
      (c, r) => String(r[c.key] ?? ""),
    );
    expect(csv).toBe('﻿From,Note\r\n\'=HYPERLINK(1),"a,""b"""\r\n');
  });
});

describe("sheet definitions", () => {
  it("every select has options and every ref points at a list", () => {
    for (const s of Object.values(SHEETS))
      for (const c of s.columns) {
        if (c.type === "select") expect(c.options?.length, `${s.key}.${c.key}`).toBeGreaterThan(0);
        if (c.type === "ref") expect(c.ref, `${s.key}.${c.key}`).toBeTruthy();
      }
  });
  it("money columns end in the API's <key>Paise naming (no spaces in keys)", () => {
    for (const s of Object.values(SHEETS))
      for (const c of s.columns) expect(c.key).toMatch(/^[a-zA-Z]+$/);
  });
});
