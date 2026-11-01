/**
 * Pure helpers behind the Excel-style sheets (no React, no network), so the rules are unit-tested.
 * A sheet row is the API record as it comes back (money as `<key>Paise`); cells are shown in rupees.
 */
import type { SheetColumn, SheetDef } from "@wealthspan/constants/sheets";

export type SheetRecord = Record<string, unknown> & { id: string };
export type CellValue = string | number | null;

const IST_OFFSET_MS = 5.5 * 3_600_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RUPEES = 1_000_000_000;

/** A real calendar date: 2026-02-30 is refused (it would otherwise roll over into March). */
export const isRealDate = (s: string): boolean => {
  if (!DATE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

export const todayIST = (now: Date = new Date()): string =>
  new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

export interface MonthOption {
  /** "2026-10", or "all". */
  value: string;
  label: string;
}

/** "All Months" plus the current month and the 11 before it. */
export const monthOptions = (now: Date = new Date()): MonthOption[] => {
  const [y, m] = todayIST(now).split("-").map(Number);
  const out: MonthOption[] = [{ value: "all", label: "All Months" }];
  for (let i = 0; i < 12; i++) {
    const idx = m - 1 - i;
    const yy = y + Math.floor(idx / 12);
    const mm = ((idx % 12) + 12) % 12;
    out.push({ value: `${yy}-${String(mm + 1).padStart(2, "0")}`, label: `${MONTHS[mm]} ${yy}` });
  }
  return out;
};

export const monthRange = (month: string): { from?: string; to?: string } => {
  const m = /^(\d{4})-(\d{2})$/.exec(month);
  if (!m) return {};
  const last = new Date(Date.UTC(Number(m[1]), Number(m[2]), 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, "0")}` };
};

/** The date a record is filed under for the month filter. */
export const recordDate = (r: SheetRecord): string => {
  for (const k of ["date", "startDate"]) {
    const v = r[k];
    if (typeof v === "string" && DATE.test(v)) return v;
  }
  return String(r.createdAt ?? "").slice(0, 10);
};

/** What a cell holds: money in rupees, everything else as stored. */
export const cellValue = (col: SheetColumn, r: SheetRecord): CellValue => {
  if (col.type === "money") {
    const p = r[`${col.key}Paise`];
    return p === null || p === undefined || p === "" ? null : Number(p) / 100;
  }
  const v = r[col.key];
  return v === null || v === undefined || v === "" ? null : typeof v === "number" ? v : String(v);
};

export type Parsed = { ok: true; value: CellValue } | { ok: false; error: string };

/** Turns what was typed into the value to send to the API. Empty means "no value" (null). */
export const parseCell = (col: SheetColumn, raw: string): Parsed => {
  const s = raw.trim();
  if (s === "")
    return col.required
      ? { ok: false, error: `${col.label} is required.` }
      : { ok: true, value: null };
  switch (col.type) {
    case "money": {
      const n = Number(s.replace(/,/g, ""));
      if (!Number.isFinite(n)) return { ok: false, error: `${col.label} must be a number.` };
      if (n < 0) return { ok: false, error: `${col.label} cannot be negative.` };
      if (n > MAX_RUPEES) return { ok: false, error: `${col.label} looks too large.` };
      if (Math.abs(n * 100 - Math.round(n * 100)) > 1e-6)
        return { ok: false, error: `${col.label} can have at most 2 decimals.` };
      return { ok: true, value: n };
    }
    case "number": {
      const n = Number(s);
      return Number.isFinite(n)
        ? { ok: true, value: n }
        : { ok: false, error: `${col.label} must be a number.` };
    }
    case "date":
      return isRealDate(s)
        ? { ok: true, value: s }
        : { ok: false, error: `${col.label} must look like 2026-04-01.` };
    case "select":
      return col.options?.some((o) => o.value === s)
        ? { ok: true, value: s }
        : { ok: false, error: `Choose a valid ${col.label}.` };
    default:
      return { ok: true, value: s };
  }
};

/** The body for a new row: typed values plus the sheet's fixed values (e.g. type = income). */
export const buildInput = (
  def: SheetDef,
  values: Record<string, CellValue>,
  extra: Record<string, string> = {},
): Record<string, unknown> => {
  const body: Record<string, unknown> = { ...def.fixed, ...extra };
  for (const c of def.columns) {
    const v = values[c.key];
    if (v !== null && v !== undefined && v !== "") body[c.key] = v;
  }
  return body;
};

/** Labels of required columns that are still empty (they are ready to save when this is empty). */
export const missingRequired = (
  def: SheetDef,
  values: Record<string, CellValue>,
  skip: readonly string[] = [],
): string[] =>
  def.columns
    .filter(
      (c) =>
        c.required &&
        !skip.includes(c.key) &&
        (values[c.key] === null || values[c.key] === undefined || values[c.key] === ""),
    )
    .map((c) => c.label);

export const sortRecords = (
  rows: SheetRecord[],
  col: SheetColumn | undefined,
  dir: "asc" | "desc",
): SheetRecord[] => {
  const k = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = col ? cellValue(col, a) : null;
    const y = col ? cellValue(col, b) : null;
    if (x === y) return Number(b.id) - Number(a.id) || 0;
    if (x === null) return 1; // empty cells always last
    if (y === null) return -1;
    if (typeof x === "number" && typeof y === "number") return (x - y) * k;
    return String(x).localeCompare(String(y)) * k;
  });
};

/** Search over what the user sees (`label` turns a cell into its visible text, e.g. a project id into its name). */
export const filterRecords = (
  rows: SheetRecord[],
  cols: readonly SheetColumn[],
  q: string,
  label: (c: SheetColumn, r: SheetRecord) => string,
): SheetRecord[] => {
  const needle = q.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter((r) => cols.some((c) => label(c, r).toLowerCase().includes(needle)));
};

/** Column totals in paise-exact rupees. */
export const columnTotals = (
  cols: readonly SheetColumn[],
  rows: SheetRecord[],
): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const c of cols) {
    if (c.type !== "money" || !c.sum) continue;
    const paise = rows.reduce((s, r) => s + Number(r[`${c.key}Paise`] ?? 0), 0);
    out[c.key] = paise / 100;
  }
  return out;
};

/** Income, expense and what is left, for a sheet that mixes both (the project sheet). */
export const incomeExpenseNet = (
  rows: SheetRecord[],
): { income: number; expense: number; net: number } => {
  let income = 0;
  let expense = 0;
  for (const r of rows) {
    const p = Number(r.amountPaise ?? 0);
    if (r.type === "income") income += p;
    else if (r.type === "expense") expense += p;
  }
  return { income: income / 100, expense: expense / 100, net: (income - expense) / 100 };
};

const csvCell = (v: string) => {
  const s = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v; // a typed "=1+1" must not become a formula in Excel
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV that Excel opens correctly (BOM for ₹ and Hindi). `label` gives the visible text of a cell. */
export const recordsToCsv = (
  cols: readonly SheetColumn[],
  rows: SheetRecord[],
  label: (c: SheetColumn, r: SheetRecord) => string,
): string =>
  "﻿" +
  [
    cols.map((c) => csvCell(c.label)).join(","),
    ...rows.map((r) => cols.map((c) => csvCell(label(c, r))).join(",")),
  ].join("\r\n") +
  "\r\n";
