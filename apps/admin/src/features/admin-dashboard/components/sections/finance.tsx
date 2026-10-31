import { useMemo, useState } from "react";
import { formatINR } from "@jobrio/utils/finance";
import { useAdminLedger } from "../../lib/adminApi";
import type { AdminLedgerRow } from "../../lib/types";

type LedgerStatus = AdminLedgerRow["status"];

const STATUS_OPTIONS: LedgerStatus[] = ["Cleared", "Pending Review", "In Transit"];

const STATUS_PILL: Record<LedgerStatus, string> = {
  Cleared:
    "px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  "Pending Review":
    "px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  "In Transit":
    "px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
};

const dash = (v: string | null | undefined) => (v && v.trim() ? v : "—");

/** Spreadsheet apps run cells that start with = + - @ as formulas; neutralise them. */
const csvCell = (v: string) => {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
};

function downloadCsv(rows: AdminLedgerRow[]) {
  const head = ["Transaction ID", "Project", "Category", "Counterparty", "Amount (INR)", "Rail", "Status", "Created at"];
  const lines = [
    head.map(csvCell).join(","),
    ...rows.map((r) =>
      [r.id, r.project, r.category, r.counterparty, (r.amountPaise / 100).toFixed(2), r.mode, r.status, r.createdAt]
        .map((c) => csvCell(String(c ?? "")))
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wealthspan-ledger.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const sumPaise = (rows: AdminLedgerRow[]) => rows.reduce((s, r) => s + r.amountPaise, 0);

interface StatCardProps {
  label: string;
  value: string;
  note: string;
  dot: string;
  iconWrap: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, note, dot, iconWrap, icon }: StatCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#212121] border border-[#ebebeb] dark:border-[#2f2f2f] shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between text-[#737373] dark:text-[#a3a3a3] mb-3">
        <span className="text-xs uppercase tracking-wider font-semibold">{label}</span>
        <div className={iconWrap}>{icon}</div>
      </div>
      <div>
        <span className="text-2xl font-bold text-[#0d0d0d] dark:text-[#ececec]">{value}</span>
        <div className="flex items-center gap-1.5 mt-2">
          <span className={dot} />
          <span className="text-xs text-[#737373] dark:text-[#a3a3a3]">{note}</span>
        </div>
      </div>
    </div>
  );
}

const entries = (n: number, suffix: string) =>
  `${n.toLocaleString("en-IN")} ${n === 1 ? "entry" : "entries"}${suffix}`;

function FinanceStats({ rows, ready }: { rows: AdminLedgerRow[]; ready: boolean }) {
  const cleared = rows.filter((r) => r.status === "Cleared");
  const pending = rows.filter((r) => r.status === "Pending Review");
  const transit = rows.filter((r) => r.status === "In Transit");
  const money = (list: AdminLedgerRow[]) => (ready ? formatINR(sumPaise(list)) : "—");
  const note = (list: AdminLedgerRow[], suffix: string) => (ready ? entries(list.length, suffix) : "Not available yet");
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        label="Total Principal (Loaded)"
        value={money(rows)}
        note={note(rows, " in the ledger")}
        dot="w-1.5 h-1.5 rounded-full bg-emerald-500"
        iconWrap="w-8 h-8 rounded-xl bg-[#f9f9f9] dark:bg-[#171717] border border-[#ebebeb] dark:border-[#2f2f2f] flex items-center justify-center text-[#0d0d0d] dark:text-[#ececec]"
        icon={(
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-landmark w-4 h-4" aria-hidden="true">
                  <path d="M10 18v-7" />
                  <path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z" />
                  <path d="M14 18v-7" />
                  <path d="M18 18v-7" />
                  <path d="M3 22h18" />
                  <path d="M6 18v-7" />
                </svg>
        )}
      />
      <StatCard
        label="Cleared Amount"
        value={money(cleared)}
        note={note(cleared, " cleared")}
        dot="w-1.5 h-1.5 rounded-full bg-emerald-500"
        iconWrap="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
        icon={(
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up w-4 h-4" aria-hidden="true">
                  <path d="M16 7h6v6" />
                  <path d="m22 7-8.5 8.5-5-5L2 17" />
                </svg>
        )}
      />
      <StatCard
        label="Pending Review"
        value={money(pending)}
        note={note(pending, " awaiting review")}
        dot="w-1.5 h-1.5 rounded-full bg-amber-500"
        iconWrap="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center"
        icon={(
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock w-4 h-4" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
        )}
      />
      <StatCard
        label="In Transit"
        value={money(transit)}
        note={note(transit, " in transit")}
        dot="w-1.5 h-1.5 rounded-full bg-purple-500"
        iconWrap="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center"
        icon={(
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-coins w-4 h-4" aria-hidden="true">
                  <path d="M13.744 17.736a6 6 0 1 1-7.48-7.48" />
                  <path d="M15 6h1v4" />
                  <path d="m6.134 14.768.866-.5 2 3.464" />
                  <circle cx="16" cy="8" r="6" />
                </svg>
        )}
      />
    </div>
  );
}

function LedgerRow({ r }: { r: AdminLedgerRow }) {
  return (
    <tr className="hover:bg-[#f9f9f9] dark:hover:bg-[#262626] transition-colors">
      <td className="py-3.5 px-4 font-mono font-semibold text-[#0d0d0d] dark:text-[#ececec]">{r.id}</td>
      <td className="py-3.5 px-4">
        <div className="flex flex-col">
          <span className="font-semibold text-[#0d0d0d] dark:text-[#ececec]">{dash(r.project)}</span>
          <span className="text-[11px] text-[#737373] dark:text-[#a3a3a3]">{dash(r.category)}</span>
        </div>
      </td>
      <td className="py-3.5 px-4 text-[#737373] dark:text-[#a3a3a3]">{dash(r.counterparty)}</td>
      <td className="py-3.5 px-4 font-bold text-[#0d0d0d] dark:text-[#ececec] font-mono">{formatINR(r.amountPaise)}</td>
      <td className="py-3.5 px-4 text-[#737373] dark:text-[#a3a3a3]">{dash(r.mode)}</td>
      <td className="py-3.5 px-4">
        <span className={STATUS_PILL[r.status] ?? STATUS_PILL["Pending Review"]}>{r.status}</span>
      </td>
    </tr>
  );
}

export function FinanceSection() {
  const ledger = useAdminLedger();
  const rows = useMemo(() => ledger.data ?? [], [ledger.data]);
  const ready = ledger.isSuccess;

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const categories = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category).filter(Boolean))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (category === "ALL" || r.category === category) &&
        (status === "ALL" || r.status === status) &&
        (!q || [r.id, r.project, r.category, r.counterparty].some((v) => (v ?? "").toLowerCase().includes(q))),
    );
  }, [rows, query, category, status]);

  const emptyText = ledger.isLoading
    ? "Loading ledger…"
    : ledger.isError
      ? "Ledger is not available yet."
      : rows.length === 0
        ? "No ledger entries yet."
        : "No entries match these filters.";

  return (
    <>
    <div className="flex flex-col w-full min-h-full bg-white dark:bg-[#16191f] pb-16 text-[#0d0d0d] dark:text-[#ececec]">
      <div className="px-6 sm:px-8 pt-1 sm:pt-2 pb-6 flex flex-col gap-6 border-b border-[#ebebeb] dark:border-[#2f2f2f] bg-white dark:bg-[#16191f]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center flex-wrap gap-3.5">
            <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-gray-950 dark:text-white">
              Financial Ledger & Capital Flows
            </h1>
            <span className="px-3.5 py-1.5 rounded-full bg-[#f4f4f4] dark:bg-[#212121] border border-[#ebebeb] dark:border-[#383838] text-neutral-800 dark:text-neutral-200 text-xs sm:text-[13px] font-semibold shadow-2xs">
              {ready ? `${rows.length.toLocaleString("en-IN")} entries loaded` : "—"}
            </span>
          </div>
          <div className="flex items-center flex-wrap gap-3">
            <button
              type="button"
              onClick={() => downloadCsv(filtered)}
              disabled={filtered.length === 0}
              className="px-7 py-3 sm:px-8 sm:py-3.5 bg-white dark:bg-[#1e222b] text-gray-900 dark:text-white border border-gray-200/90 dark:border-neutral-700/80 text-[14px] sm:text-[15.5px] font-semibold rounded-full shadow-md hover:bg-neutral-50 dark:hover:bg-[#262b37] transition-all duration-150 cursor-pointer active:scale-95 flex items-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download w-4 h-4 stroke-[2.2]" aria-hidden="true">
                <path d="M12 15V3" />
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m7 10 5 5 5-5" />
              </svg>
              <span>Export Audit Report</span>
            </button>
          </div>
        </div>
      </div>
      <div className="px-6 sm:px-8 py-8 flex flex-col gap-8 max-w-7xl w-full">
        <FinanceStats rows={rows} ready={ready} />
        <div className="rounded-2xl bg-white dark:bg-[#212121] border border-[#ebebeb] dark:border-[#2f2f2f] shadow-xs p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-6">
              <div className="relative w-full">
                {!query && (
                  <label htmlFor="ledger-search-input" className="absolute pointer-events-none transition-all duration-200 ease-out z-10 select-none left-11 top-1/2 -translate-y-1/2 px-0 text-sm font-normal text-[#737373] dark:text-[#b4b4b4] bg-transparent">
                    Search Transaction ID, Project Name, Entity...
                  </label>
                )}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737373] dark:text-[#b4b4b4] pointer-events-none z-10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search w-4 h-4" aria-hidden="true">
                    <path d="m21 21-4.34-4.34" />
                    <circle cx="11" cy="11" r="8" />
                  </svg>
                </div>
                <input id="ledger-search-input" placeholder="" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full h-12 bg-white dark:bg-[#212121] rounded-2xl pl-11 pr-5 text-[#0d0d0d] dark:text-[#ececec] text-sm font-normal focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed border border-[#ebebeb] dark:border-[#383838]" type="text" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <div className="relative w-full">
                <label htmlFor="ledger-category-filter" className="-top-2.5 left-4 px-1.5 text-xs font-semibold bg-white dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] rounded-sm absolute pointer-events-none transition-all duration-200 ease-out z-10 select-none">
                  Category
                </label>
                <select id="ledger-category-filter" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-12 bg-white dark:bg-[#212121] rounded-2xl px-4 pr-11 text-[#0d0d0d] dark:text-[#ececec] text-sm font-normal focus:outline-none transition-all duration-200 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border border-[#ebebeb] dark:border-[#383838]">
                  <option value="ALL">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#737373] dark:text-[#b4b4b4]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-4 h-4" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="sm:col-span-3">
              <div className="relative w-full">
                <label htmlFor="ledger-status-filter" className="-top-2.5 left-4 px-1.5 text-xs font-semibold bg-white dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] rounded-sm absolute pointer-events-none transition-all duration-200 ease-out z-10 select-none">
                  Clearance Status
                </label>
                <select id="ledger-status-filter" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full h-12 bg-white dark:bg-[#212121] rounded-2xl px-4 pr-11 text-[#0d0d0d] dark:text-[#ececec] text-sm font-normal focus:outline-none transition-all duration-200 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border border-[#ebebeb] dark:border-[#383838]">
                  <option value="ALL">Status: All</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#737373] dark:text-[#b4b4b4]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-4 h-4" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#ebebeb] dark:border-[#2f2f2f]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f9f9f9] dark:bg-[#171717] text-[#737373] dark:text-[#a3a3a3] border-b border-[#ebebeb] dark:border-[#2f2f2f] text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Txn Identifier</th>
                  <th className="py-3 px-4 font-semibold">Project & Category</th>
                  <th className="py-3 px-4 font-semibold">Counterparty Entity</th>
                  <th className="py-3 px-4 font-semibold">Principal Amount</th>
                  <th className="py-3 px-4 font-semibold">Rail</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebebeb] dark:divide-[#2f2f2f] text-xs text-[#0d0d0d] dark:text-[#ececec]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 px-4 text-center text-[#737373] dark:text-[#a3a3a3]">
                      {emptyText}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => <LedgerRow key={r.id} r={r} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
