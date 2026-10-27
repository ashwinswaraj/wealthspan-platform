/**
 * Turns a user's transactions + summary into one plain "report" object.
 * CSV / Excel / Word / PDF writers all take this same object, so the four
 * files always show the same numbers.
 */
import type { FinanceSummary, FinanceTransaction } from "@jobrio/types";

export const FILE_FORMATS = ["csv", "xlsx", "docx", "pdf"] as const;
export type FileFormat = (typeof FILE_FORMATS)[number];

export const FILE_MIME: Record<FileFormat, string> = {
  csv: "text/csv; charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
};

/** Names for ids, so the file shows "Shop" instead of "6430800…". Missing ids fall back to the id. */
export interface NameLookup {
  projects?: Record<string, string>;
  accounts?: Record<string, string>;
  events?: Record<string, string>;
}

export interface ReportRow {
  date: string;
  type: string;
  /** Rupees (not paise), 2 decimals. */
  amount: number;
  project: string;
  account: string;
  paymentMode: string;
  category: string;
  party: string;
  note: string;
}

export interface Report {
  title: string;
  period: string;
  generatedOn: string;
  /** Label + rupees, in the order they appear in the files. */
  totals: { label: string; amount: number }[];
  breakdowns: { title: string; lines: { label: string; amount: number }[] }[];
  rows: ReportRow[];
  columns: { key: keyof ReportRow; header: string }[];
}

export const REPORT_COLUMNS: Report["columns"] = [
  { key: "date", header: "Date" },
  { key: "type", header: "Type" },
  { key: "amount", header: "Amount (₹)" },
  { key: "project", header: "Project" },
  { key: "account", header: "Account" },
  { key: "paymentMode", header: "Payment mode" },
  { key: "category", header: "Category" },
  { key: "party", header: "Party" },
  { key: "note", header: "Note" },
];

const rupees = (paise: number) => Math.round(paise) / 100;
const pretty = (s: string | null) => (s ? s.replace(/_/g, " ") : "");

export interface BuildReportInput {
  transactions: FinanceTransaction[];
  summary: FinanceSummary;
  from?: string;
  to?: string;
  names?: NameLookup;
  /** ISO date, injectable for tests. */
  today?: string;
}

export function buildReport(input: BuildReportInput): Report {
  const n = input.names ?? {};
  const name = (map: Record<string, string> | undefined, id: string | null) => (id ? (map?.[id] ?? id) : "");
  const s = input.summary;

  const rows: ReportRow[] = [...input.transactions]
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
    .map((t) => ({
      date: t.date,
      type: t.type,
      amount: rupees(t.amountPaise),
      project: name(n.projects, t.projectId),
      account:
        t.type === "transfer"
          ? `${name(n.accounts, t.fromAccountId)} → ${name(n.accounts, t.toAccountId)}`
          : name(n.accounts, t.accountId),
      paymentMode: pretty(t.paymentMode),
      category: pretty(t.category),
      party: t.party ?? "",
      note: t.note ?? "",
    }));

  const lines = (rec: Record<string, number>, map?: Record<string, string>) =>
    Object.entries(rec)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => ({ label: pretty(map?.[k] ?? k), amount: rupees(v) }));

  const breakdowns = [
    { title: "Expense by category", lines: lines(s.byCategory) },
    { title: "By payment mode", lines: lines(s.byPaymentMode) },
    { title: "Income by source", lines: lines(s.bySource) },
    { title: "Events", lines: lines(s.byEvent, n.events) },
  ].filter((b) => b.lines.length > 0);

  return {
    title: "Wealthspan — Transactions report",
    period: input.from || input.to ? `${input.from ?? "start"} to ${input.to ?? "today"}` : "All time",
    generatedOn: input.today ?? new Date().toISOString().slice(0, 10),
    totals: [
      { label: "Income", amount: rupees(s.incomePaise) },
      { label: "Expense", amount: rupees(s.expensePaise) },
      { label: "Profit", amount: rupees(s.profitPaise) },
      { label: "Open-event spending (not in profit)", amount: rupees(s.openEventsPaise) },
    ],
    breakdowns,
    rows,
    columns: REPORT_COLUMNS,
  };
}

/** Indian-style number, e.g. 1,23,456.50 */
export const inr = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });

/**
 * Spreadsheet programs run text that starts with = + - @ as a formula. Notes and
 * party names are typed by users (or the chatbot), so neutralise them.
 */
export const safeText = (v: string) => (/^[=+\-@\t\r]/.test(v) ? `'${v}` : v);

export function fileName(format: FileFormat, r: Report): string {
  const tag = r.period === "All time" ? "all" : r.period.replace(/ to /g, "_to_").replace(/[^0-9a-z_-]/gi, "");
  return `wealthspan-transactions-${tag}.${format}`;
}
