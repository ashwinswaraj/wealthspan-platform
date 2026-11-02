import { useState } from "react";
import { formatINR } from "@wealthspan/utils/finance";
import { useAdminHealth, useAdminLedger, useAdminOverview } from "../../lib/adminApi";
import type { AdminHealthRow, AdminLedgerRow } from "../../lib/types";

const num = (n: number | null | undefined) =>
  typeof n === "number" ? n.toLocaleString("en-IN") : "—";
const money = (p: number | null | undefined) => (typeof p === "number" ? formatINR(p) : "—");
const RANGES = [7, 14, 21, 30] as const;

/** Sparkline paths on the original 160x40 canvas; a flat line when there is nothing to plot. */
function sparkPaths(series: number[]) {
  const pts = series.filter((v) => Number.isFinite(v));
  if (pts.length < 2 || Math.max(...pts) === Math.min(...pts)) {
    const line = "M0 32 L 160 32";
    return { line, area: `${line} L 160 40 L 0 40 Z` };
  }
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const step = 160 / (pts.length - 1);
  const line = pts
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${(36 - ((v - min) / (max - min)) * 32).toFixed(1)}`,
    )
    .join(" ");
  return { line, area: `${line} L 160 40 L 0 40 Z` };
}

function Spark({ series }: { series: number[] }) {
  const { line, area } = sparkPaths(series);
  return (
    <svg
      className="w-full h-12 text-primary"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 160 40"
    >
      <path d={line} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d={area} fill="currentColor" fillOpacity="0.04" />
    </svg>
  );
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const dayLabel = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/** Ledger entries per calendar day for the last `days` days (oldest first). */
function entriesPerDay(rows: AdminLedgerRow[], days: number) {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const t = new Date(r.createdAt);
    if (!Number.isNaN(t.getTime())) counts.set(dayKey(t), (counts.get(dayKey(t)) ?? 0) + 1);
  }
  const out: { date: Date; count: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    out.push({ date: d, count: counts.get(dayKey(d)) ?? 0 });
  }
  return out;
}

function downloadJson(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function healthText(h: AdminHealthRow) {
  if (h.ok === null) return "—";
  if (!h.ok) return "Offline";
  return h.latencyMs === null ? "Online" : `Online (${h.latencyMs}ms)`;
}

export function DashboardSection({ onManageUsers }: { onManageUsers?: () => void } = {}) {
  const overview = useAdminOverview();
  const health = useAdminHealth();
  const ledger = useAdminLedger();
  const [range, setRange] = useState<(typeof RANGES)[number]>(7);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const note = (k: string, v: string) => setNotes((n) => ({ ...n, [k]: v }));

  const o = overview.data;
  const checks = health.data ?? [];
  const okCount = checks.filter((c) => c.ok === true).length;
  const lat = checks.map((c) => c.latencyMs).filter((v): v is number => typeof v === "number");
  const avgLat = lat.length ? Math.round(lat.reduce((a, b) => a + b, 0) / lat.length) : null;
  const trend = o?.usersTrend ?? [];
  const trendSum = trend.length ? trend.reduce((a, b) => a + b, 0) : null;
  const paid = o?.usersByPlan ? o.usersByPlan.go + o.usersByPlan.pro : null;

  const rows = ledger.data ?? [];
  const days = entriesPerDay(rows, range);
  const maxCount = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((a, d) => a + d.count, 0);
  const labelIdx = [0, 1, 2, 3, 4].map((i) => Math.round((i * (days.length - 1)) / 4));
  const recent = [...rows]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const syncing = overview.isFetching || health.isFetching || ledger.isFetching;
  const syncLabel = overview.isError
    ? "Data unavailable"
    : syncing
      ? "Syncing…"
      : overview.data
        ? "Data loaded"
        : "Waiting for data";

  return (
    <>
      <div
        id="admin-overview-view"
        className="w-full px-4 sm:px-8 pt-1 sm:pt-2 pb-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-gray-950 dark:text-white">
              System Control Matrix
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-7 py-3 sm:px-8 sm:py-3.5 bg-white dark:bg-[#1e222b] text-gray-900 dark:text-white border border-gray-200/90 dark:border-neutral-700/80 text-[14px] sm:text-[15.5px] font-semibold rounded-full shadow-md flex items-center gap-2.5 select-none transition-all duration-150">
              <span
                className={`w-2.5 h-2.5 rounded-full ${overview.isError ? "bg-red-500" : "bg-emerald-500 animate-pulse"} shrink-0`}
              />
              <span className="tracking-tight font-semibold">{syncLabel}</span>
            </div>
            <button
              id="refreshDataBtn"
              type="button"
              disabled={syncing}
              onClick={() => {
                void overview.refetch();
                void health.refetch();
                void ledger.refetch();
              }}
              className="px-7 py-3 sm:px-8 sm:py-3.5 bg-black dark:bg-white text-white dark:text-black text-[14px] sm:text-[15.5px] font-semibold rounded-full shadow-lg active:scale-95 hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all duration-150 cursor-pointer disabled:opacity-50 flex items-center gap-2.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-refresh-cw w-4 h-4"
                aria-hidden="true"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              <span>Sync Snapshot</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between h-44 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                  Total Active Users
                </span>
                <span className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1 font-semibold">
                  {num(o?.users)}
                </span>
              </div>
            </div>
            <div className="pt-2">
              <Spark series={trend} />
              <div className="flex items-center justify-between text-secondary pt-2">
                <span className="font-label-sm text-label-sm">New users (30d)</span>
                <span className="font-label-sm text-label-sm font-medium text-primary">
                  {num(trendSum)}
                </span>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between h-44 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                  Monthly Run-Rate (MRR)
                </span>
                <span className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1 font-semibold">
                  {money(o?.mrrPaise)}
                </span>
              </div>
            </div>
            <div className="pt-2">
              <Spark series={[]} />
              <div className="flex items-center justify-between text-secondary pt-2">
                <span className="font-label-sm text-label-sm">Approved, last 30 days</span>
                <span className="font-label-sm text-label-sm font-medium text-primary">
                  {num(paid)} paid users
                </span>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between h-44 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                  Projects
                </span>
                <span className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1 font-semibold">
                  {num(o?.projects)}
                </span>
              </div>
            </div>
            <div className="pt-2">
              <Spark series={[]} />
              <div className="flex items-center justify-between text-secondary pt-2">
                <span className="font-label-sm text-label-sm">Transactions</span>
                <span className="font-label-sm text-label-sm font-medium text-primary">
                  {num(o?.transactions)}
                </span>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between h-44 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                  Pending payments
                </span>
                <span className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1 font-semibold">
                  {num(o?.pendingPayments)}
                </span>
              </div>
              {typeof o?.pendingPayments === "number" && (
                <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-medium">
                  {o?.pendingPayments ? "Needs review" : "All clear"}
                </span>
              )}
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: checks.length ? `${(okCount / checks.length) * 100}%` : "0%" }}
                />
              </div>
              <div className="flex items-center justify-between text-secondary pt-1">
                <span className="font-label-sm text-label-sm">
                  Services online: {checks.length ? `${okCount}/${checks.length}` : "—"}
                </span>
                <span className="font-label-sm text-label-sm font-medium text-primary">
                  Latency {avgLat === null ? "—" : `${avgLat}ms`}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="font-headline-md text-headline-md text-primary font-semibold">
                    Ledger Activity
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                    {ledger.isError ? "—" : `${num(total)} entries`}
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-secondary">
                  Ledger entries recorded per day
                </span>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl self-start sm:self-auto">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={
                      r === range
                        ? "px-3 py-1 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer text-on-primary bg-primary shadow-sm font-medium"
                        : "px-3 py-1 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer text-secondary hover:text-on-surface"
                    }
                  >
                    {r}d
                  </button>
                ))}
              </div>
            </div>
            <div className="py-4">
              {rows.length === 0 ? (
                <div className="h-36 w-full flex items-center justify-center px-2 text-secondary font-body-sm text-body-sm">
                  {ledger.isLoading
                    ? "Loading…"
                    : ledger.isError
                      ? "Activity unavailable"
                      : "No activity yet"}
                </div>
              ) : (
                <>
                  <div className="h-36 w-full flex items-end justify-between gap-1.5 px-2">
                    {days.map((d, i) => (
                      <div
                        key={dayKey(d.date)}
                        title={`${dayLabel(d.date)}: ${d.count}`}
                        className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                      >
                        <div
                          className={
                            i === days.length - 1
                              ? "w-full rounded-t transition-colors bg-primary shadow-sm scale-y-[1.02] origin-bottom"
                              : "w-full rounded-t transition-colors bg-surface-container-high hover:bg-primary/60"
                          }
                          style={{ height: `${Math.max(2, (d.count / maxCount) * 100)}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-secondary font-label-sm text-label-sm pt-2 px-1">
                    {labelIdx.map((idx, i) => (
                      <span
                        key={i}
                        className={
                          i === 4
                            ? "text-primary font-semibold"
                            : i === 0
                              ? undefined
                              : "hidden sm:inline"
                        }
                      >
                        {i === 4 ? "Today" : dayLabel(days[idx].date)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-center justify-between text-xs">
                    <span className="text-on-surface font-medium">
                      Today:{" "}
                      <strong className="text-primary">
                        {days[days.length - 1].count} entries
                      </strong>
                    </span>
                    <span className="text-secondary">
                      Last {range} days: <span className="font-semibold text-primary">{total}</span>
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="pt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between pb-1">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                  Recent Ledger Entries
                </span>
                <span className="font-label-sm text-label-sm text-secondary">Latest 3</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" id="transactionStream">
                {recent.length === 0 && (
                  <div className="sm:col-span-3 p-3 rounded-xl bg-surface-container-low text-secondary font-body-sm text-body-sm">
                    No activity yet
                  </div>
                )}
                {recent.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-surface-container-low flex flex-col justify-between h-24"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-secondary truncate">
                        {r.category || r.project || r.id}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                        {r.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                        {money(r.amountPaise)}
                      </span>
                      <p className="font-body-sm text-body-sm text-secondary truncate">
                        {r.counterparty || r.project || "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#2f2f2f] border border-[#ebebeb] dark:border-[#383838] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-[#0d0d0d] dark:text-[#ececec] font-semibold">
                  Administrative Directives
                </h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-sliders-vertical w-4 h-4 text-[#737373] dark:text-[#b4b4b4]"
                  aria-hidden="true"
                >
                  <path d="M10 8h4" />
                  <path d="M12 21v-9" />
                  <path d="M12 8V3" />
                  <path d="M17 16h4" />
                  <path d="M19 12V3" />
                  <path d="M19 21v-5" />
                  <path d="M3 14h4" />
                  <path d="M5 10V3" />
                  <path d="M5 21v-7" />
                </svg>
              </div>
              <div className="space-y-3 font-body-sm text-xs">
                <button
                  id="execAuditBtn"
                  type="button"
                  onClick={() => note("audit", "Not available yet")}
                  className="w-full py-1 border-b border-[#ebebeb] dark:border-[#383838] transition-colors flex items-center justify-between cursor-pointer text-left hover:opacity-80 active:opacity-70"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-shield-check w-4 h-4 text-emerald-500 shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span className="text-[#0d0d0d] dark:text-[#ececec]">
                      Execute Perimeter Audit
                    </span>
                  </div>
                  <span className="font-label-sm text-[11px] text-[#737373] dark:text-[#b4b4b4]">
                    {notes.audit ?? "Run"}
                  </span>
                </button>
                <button
                  id="exportTelemetryBtn"
                  type="button"
                  onClick={() => {
                    if (!o) return note("export", "Nothing loaded");
                    downloadJson("wealthspan-overview.json", o);
                    note("export", "Downloaded");
                  }}
                  className="w-full py-1 border-b border-[#ebebeb] dark:border-[#383838] transition-colors flex items-center justify-between cursor-pointer text-left hover:opacity-80 active:opacity-70"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-download w-4 h-4 text-blue-500 shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M12 15V3" />
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <path d="m7 10 5 5 5-5" />
                    </svg>
                    <span className="text-[#0d0d0d] dark:text-[#ececec]">
                      Export Telemetry (JSON)
                    </span>
                  </div>
                  <span className="font-label-sm text-[11px] text-[#737373] dark:text-[#b4b4b4]">
                    {notes.export ?? "Download"}
                  </span>
                </button>
                <button
                  id="flushBufferBtn"
                  type="button"
                  onClick={() => note("flush", "Not available yet")}
                  className="w-full py-1 transition-colors flex items-center justify-between cursor-pointer text-left hover:opacity-80 active:opacity-70"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-zap w-4 h-4 text-amber-500 shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                    </svg>
                    <span className="text-[#0d0d0d] dark:text-[#ececec]">Flush Memory Buffer</span>
                  </div>
                  <span className="font-label-sm text-[11px] text-[#737373] dark:text-[#b4b4b4]">
                    {notes.flush ?? "Clear"}
                  </span>
                </button>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-[#2f2f2f] border border-[#ebebeb] dark:border-[#383838] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-[#0d0d0d] dark:text-[#ececec] font-semibold">
                  Gateway Verification Posture
                </h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-shield w-4 h-4 text-emerald-500"
                  aria-hidden="true"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                </svg>
              </div>
              <div className="space-y-3 font-body-sm text-xs">
                {checks.length === 0 && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#737373] dark:text-[#b4b4b4]">
                      {health.isError
                        ? "Health checks unavailable"
                        : health.isLoading
                          ? "Checking…"
                          : "No checks reported"}
                    </span>
                    <span className="font-medium text-[#0d0d0d] dark:text-[#ececec]">—</span>
                  </div>
                )}
                {checks.map((c, i) => (
                  <div
                    key={c.name}
                    className={`flex items-center justify-between py-1${i < checks.length - 1 ? " border-b border-[#ebebeb] dark:border-[#383838]" : ""}`}
                  >
                    <span className="text-[#737373] dark:text-[#b4b4b4]">{c.name}</span>
                    <span
                      className={`font-medium ${c.ok ? "text-emerald-600 dark:text-emerald-400" : "text-[#0d0d0d] dark:text-[#ececec]"}`}
                    >
                      {healthText(c)}
                    </span>
                  </div>
                ))}
              </div>
              <button
                id="manageUserDirectoryBtn"
                type="button"
                onClick={onManageUsers}
                className="w-full py-3.5 px-8 bg-black dark:bg-white text-white dark:text-black text-[15px] sm:text-[15.5px] font-semibold rounded-full shadow-lg active:scale-95 hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-users w-4.5 h-4.5 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                <span>Manage User Directory</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
