import { useMemo, useState } from "react";
import { SHEETS, type SheetKey } from "@wealthspan/constants/sheets";
import {
  columnTotals,
  incomeExpenseNet,
  monthOptions,
  todayIST,
  type CellValue,
} from "@wealthspan/utils/sheet";
import { apiUrl } from "@/services/api";
import type { LedgerSectionKey } from "@/features/wealthspan-shell/lib/sections";
import type { Project } from "@/features/projects";
import { useRefs, useSheetMutations, useSheetRows } from "../hooks/useSheet";
import { SheetGrid } from "./SheetGrid";

export type SheetTarget =
  | { kind: "section"; key: LedgerSectionKey }
  | { kind: "project"; project: Project }
  | { kind: "accounts" };

const rupees = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

/** One dashboard screen (Income, Expense, Debt, Savings, Festivals, a project, Accounts): header, month filter, the Excel-style sheet. */
export function SheetScreen({
  target,
  activeProject,
  onBack,
  onOpenAccounts,
}: {
  target: SheetTarget;
  activeProject: Project | null;
  onBack: () => void;
  onOpenAccounts: () => void;
}) {
  const sheetKey: SheetKey =
    target.kind === "section" ? target.key : target.kind === "project" ? "project" : "accounts";
  const def = SHEETS[sheetKey];
  const scope =
    target.kind === "project" ? target.project : target.kind === "section" ? activeProject : null;
  const title = target.kind === "project" ? target.project.name : def.title;
  const subtitle = target.kind === "project" ? "Wealthspan · Project" : def.subtitle;

  const [month, setMonth] = useState("all");
  const [monthOpen, setMonthOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  const months = useMemo(() => monthOptions(), []);
  const monthLabel = months.find((m) => m.value === month)?.label ?? "All Months";
  const refs = useRefs(def);
  const data = useSheetRows({ def, month, projectId: scope?.id ?? null });
  const { update, create, remove } = useSheetMutations(def);
  const rows = data.data?.rows ?? [];

  const hidden = scope && def.columns.some((c) => c.key === "projectId") ? ["projectId"] : [];
  const extra = scope ? { projectId: scope.id } : undefined;
  const firstAccount = refs.options.accounts[0]?.value ?? null;
  const defaults: Record<string, CellValue> = {
    ...(def.columns.some((c) => c.key === "date") ? { date: todayIST() } : {}),
    ...(firstAccount && def.columns.some((c) => c.key === "accountId")
      ? { accountId: firstAccount }
      : {}),
  };
  const needsAccount =
    def.columns.some((c) => c.key === "accountId") &&
    refs.ready &&
    refs.options.accounts.length === 0;

  const showEmpty =
    !data.isLoading && !data.isError && refs.ready && rows.length === 0 && !recording;
  const noun = ledgerNoun(def.title);
  const totals = columnTotals(def.columns, rows);
  const net = sheetKey === "project" ? incomeExpenseNet(rows) : null;
  const downloadUrl = apiUrl(
    "files",
    `/sheet?${new URLSearchParams({ sheet: sheetKey, month, ...(scope ? { projectId: scope.id } : {}) })}`,
  );

  const pill =
    "relative z-30 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#ebebeb] shadow-sm hover:bg-gray-100 active:bg-gray-200 focus:bg-gray-100 focus:outline-none active:scale-95 transition-all duration-150 text-xs font-semibold text-gray-800 hover:text-black cursor-pointer";
  const round =
    "w-11 h-11 flex items-center justify-center rounded-full bg-white border border-[#ebebeb] shadow-sm hover:bg-gray-100 active:bg-gray-200 focus:outline-none active:scale-95 transition-all duration-150 text-gray-700 hover:text-black cursor-pointer shrink-0";

  return (
    <div
      className="fixed inset-0 z-50 bg-[#f9f9f9] flex justify-center items-start overflow-hidden antialiased"
      id="projectDashboardWrapper"
    >
      <main
        className="w-full max-w-[500px] h-[100dvh] bg-[#f9f9f9] flex flex-col justify-between overflow-hidden relative"
        data-purpose="mobile-viewport-container"
      >
        <header
          className="w-full pt-2 sm:pt-3 px-5 sm:px-6 pb-2 flex items-center justify-between z-30 shrink-0 sticky top-0 relative"
          data-purpose="top-navigation-bar"
        >
          <div className="relative z-20 flex items-center gap-3 min-w-0">
            <button
              aria-label="Go Back"
              className={round}
              id="projectDashboardBackBtn"
              type="button"
              onClick={onBack}
            >
              <svg
                className="w-5 h-5 stroke-[2.25]"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="flex flex-col text-left min-w-0">
              <h1 className="text-lg font-bold text-gray-950 tracking-tight leading-snug truncate">
                {title}
              </h1>
              <p className="text-xs font-medium text-gray-500">{subtitle}</p>
            </div>
          </div>
          <div className="relative z-20 flex items-center gap-2">
            <button
              aria-label="Overview Analytics"
              aria-expanded={infoOpen}
              className={round}
              type="button"
              onClick={() => setInfoOpen((o) => !o)}
            >
              <svg
                className="w-4 h-4 stroke-[2.25]"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
          <section
            className="w-full px-5 sm:px-6 pt-3.5 pb-3 flex items-center justify-between gap-3 shrink-0 relative z-40"
            data-purpose="date-filter-container"
          >
            {showEmpty ? (
              <span />
            ) : (
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rows"
                aria-label="Search rows"
                className="min-w-0 flex-1 h-9 px-4 rounded-full bg-white border border-[#ebebeb] shadow-sm text-xs font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:border-gray-400"
              />
            )}
            <div className="relative">
              <button
                className={pill}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={monthOpen}
                onClick={() => setMonthOpen((o) => !o)}
              >
                <span>{monthLabel}</span>
                <svg
                  className="w-3.5 h-3.5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="7" x2="17" y1="12" y2="12" />
                  <line x1="10" x2="14" y1="18" y2="18" />
                </svg>
              </button>
              {monthOpen ? (
                <ul
                  role="listbox"
                  aria-label="Month"
                  className="absolute right-0 mt-2 w-44 max-h-64 overflow-auto no-scrollbar rounded-2xl bg-white border border-[#ebebeb] shadow-lg py-1.5 z-50"
                >
                  {months.map((m) => (
                    <li key={m.value} role="option" aria-selected={m.value === month}>
                      <button
                        type="button"
                        onClick={() => {
                          setMonth(m.value);
                          setMonthOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-gray-100 ${m.value === month ? "text-black" : "text-gray-600"}`}
                      >
                        {m.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>

          {infoOpen ? (
            <section
              className="mx-5 sm:mx-6 mb-3 rounded-2xl bg-white border border-[#ebebeb] shadow-sm p-4 text-xs text-gray-700"
              aria-label="Overview"
            >
              <p className="font-semibold text-gray-950 mb-2">
                {monthLabel} · {rows.length} {rows.length === 1 ? "row" : "rows"}
              </p>
              {net ? (
                <dl className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <dt className="text-gray-500">Income</dt>
                    <dd className="font-bold text-gray-950">{rupees(net.income)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Expense</dt>
                    <dd className="font-bold text-gray-950">{rupees(net.expense)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Left</dt>
                    <dd className="font-bold text-gray-950">{rupees(net.net)}</dd>
                  </div>
                </dl>
              ) : Object.keys(totals).length ? (
                <dl className="flex flex-col gap-1">
                  {def.columns
                    .filter((c) => totals[c.key] !== undefined)
                    .map((c) => (
                      <div key={c.key} className="flex justify-between">
                        <dt>{c.label.replace(" (₹)", "")}</dt>
                        <dd className="font-bold text-gray-950">{rupees(totals[c.key])}</dd>
                      </div>
                    ))}
                </dl>
              ) : (
                <p className="text-gray-500">Nothing to add up here yet.</p>
              )}
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                <a
                  href={downloadUrl}
                  className="px-3.5 py-2 rounded-full bg-black text-white font-semibold"
                  download
                >
                  Download Excel (.xlsx)
                </a>
                {target.kind !== "accounts" ? (
                  <button
                    type="button"
                    onClick={onOpenAccounts}
                    className="px-3.5 py-2 rounded-full bg-gray-100 text-gray-900 font-semibold cursor-pointer"
                  >
                    Accounts sheet
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="mx-5 sm:mx-6 mb-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-2.5 text-xs font-medium text-red-700"
            >
              {error}
            </p>
          ) : null}
          {needsAccount && !showEmpty ? (
            <p className="mx-5 sm:mx-6 mb-3 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-2.5 text-xs text-amber-900">
              Add an account first (Cash, Bank, Card or Wallet) so entries know where the money
              moved.{" "}
              <button
                type="button"
                className="underline font-semibold cursor-pointer"
                onClick={onOpenAccounts}
              >
                Open Accounts sheet
              </button>
            </p>
          ) : null}

          {showEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center px-8 pb-0 pt-4 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <svg
                  className="w-9 h-9 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="8" x2="16" y1="13" y2="13" />
                  <line x1="8" x2="16" y1="17" y2="17" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-950 tracking-tight mb-2">No Records</h2>
              <p className="text-[13px] text-gray-600 leading-relaxed max-w-[250px] mb-7">
                No {noun} details found for <b className="text-gray-950">{monthLabel}</b>. Start by
                recording a detailed entry in the table ledger.
              </p>
              <button
                type="button"
                onClick={() => setRecording(true)}
                className="w-full max-w-[320px] h-12 rounded-full bg-black text-white text-[13px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition cursor-pointer"
              >
                <span className="text-lg leading-none">+</span> Record {noun} entry
              </button>
              <button
                type="button"
                onClick={() => setMonthOpen(true)}
                className="mt-5 text-[13px] font-semibold text-gray-600 hover:text-black cursor-pointer"
              >
                Select another month
              </button>
            </div>
          ) : data.isLoading || !refs.ready ? (
            <p className="text-center text-xs text-gray-500 py-16">Loading your sheet…</p>
          ) : data.isError ? (
            <p className="text-center text-xs text-gray-600 py-16 px-6">
              Could not load this sheet.{" "}
              <button
                className="underline font-semibold cursor-pointer"
                onClick={() => data.refetch()}
              >
                Try again
              </button>
            </p>
          ) : (
            <SheetGrid
              key={`${sheetKey}:${scope?.id ?? ""}`}
              def={def}
              rows={rows}
              refs={refs}
              search={search}
              defaults={defaults}
              extra={extra}
              hidden={hidden}
              truncated={data.data?.truncated}
              onError={setError}
              onUpdate={async (id, key, value) =>
                void (await update.mutateAsync({ id, key, value }))
              }
              onCreate={async (body) => void (await create.mutateAsync(body))}
              onDelete={async (id) => void (await remove.mutateAsync(id))}
            />
          )}
          <div className="h-6 shrink-0" />
        </div>
      </main>
    </div>
  );
}

/** How the empty state names a section ("No savings & investment details found…"), as in the original design. */
function ledgerNoun(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("debt") || t.includes("loan") || t.includes("emi")) return "debt / EMI";
  if (t.includes("saving") || t.includes("invest")) return "savings & investment";
  if (t.includes("festival") || t.includes("function")) return "festival / function";
  return t;
}
