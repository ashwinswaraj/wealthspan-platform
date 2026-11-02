import { useMemo, useState } from "react";
import { useAdminAudit, useAdminHealth } from "../../lib/adminApi";
import type { AdminAuditRow, AdminHealthRow } from "../../lib/types";

const NOT_MONITORED = "Not monitored yet";
const NEUTRAL_TEXT = "text-[#737373] dark:text-[#a3a3a3] font-semibold";
const OK_TEXT = "text-emerald-600 dark:text-emerald-400 font-semibold";

/** Spreadsheet apps run cells that start with = + - @ as formulas; neutralise them. */
const csvCell = (v: string) => {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
};

/** ISO -> "YYYY-MM-DD HH:mm:ss" (UTC), or "—" when it is not a valid date. */
const utcStamp = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toISOString().slice(0, 19).replace("T", " ");
};

const dash = (v: string | null | undefined) => (v && v.trim() ? v : "—");

function downloadCsv(rows: AdminAuditRow[]) {
  const head = ["Timestamp (UTC)", "Actor", "Action", "Details"];
  const lines = [
    head.map(csvCell).join(","),
    ...rows.map((r) =>
      [utcStamp(r.at), r.actor, r.title, r.description]
        .map((c) => csvCell(String(c ?? "")))
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wealthspan-audit-log.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

interface StatCardProps {
  label: string;
  iconWrap: string;
  icon: React.ReactNode;
  value: string;
  unit: string;
  note: string;
  footLabel: string;
  footValue: string;
  footClass: string;
}

function StatCard({
  label,
  iconWrap,
  icon,
  value,
  unit,
  note,
  footLabel,
  footValue,
  footClass,
}: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#212121] border border-[#ebebeb] dark:border-[#2f2f2f] p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-[#737373] dark:text-[#a3a3a3] uppercase tracking-wider font-semibold">
          {label}
        </span>
        <div className={iconWrap}>{icon}</div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#0d0d0d] dark:text-[#ececec]">{value}</span>
          <span className="text-xs text-[#737373] dark:text-[#a3a3a3] uppercase font-semibold">
            {unit}
          </span>
        </div>
        <span className="text-xs text-[#737373] dark:text-[#a3a3a3]">{note}</span>
      </div>
      <div className="mt-4 pt-3 flex items-center justify-between bg-[#f9f9f9] dark:bg-[#171717] border border-[#ebebeb] dark:border-[#2f2f2f] px-3 py-2 rounded-xl text-xs font-medium">
        <span className="text-[#0d0d0d] dark:text-[#ececec]">{footLabel}</span>
        <span className={footClass}>{footValue}</span>
      </div>
    </div>
  );
}

function SecurityStats({
  health,
  audit,
}: {
  health: AdminHealthRow[] | undefined;
  audit: AdminAuditRow[] | undefined;
}) {
  const online = health?.filter((h) => h.ok === true).length;
  const offline = health?.filter((h) => h.ok === false).length;
  const timed = (health ?? []).filter(
    (h): h is AdminHealthRow & { latencyMs: number } => h.latencyMs !== null,
  );
  const avg = timed.length
    ? Math.round(timed.reduce((s, h) => s + h.latencyMs, 0) / timed.length)
    : null;
  const slowest = timed.length ? timed.reduce((a, b) => (b.latencyMs > a.latencyMs ? b : a)) : null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        label="Audit Entries Loaded"
        iconWrap="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
        icon={
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
            className="lucide lucide-shield-check w-4 h-4"
            aria-hidden="true"
          >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        }
        value={audit ? audit.length.toLocaleString("en-IN") : "—"}
        unit="Entries"
        note="Entries returned by the audit log"
        footLabel="Audit log"
        footValue={audit ? "Available" : "Not available yet"}
        footClass={audit ? OK_TEXT : NEUTRAL_TEXT}
      />
      <StatCard
        label="Services Online"
        iconWrap="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center"
        icon={
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
            className="lucide lucide-radio w-4 h-4"
            aria-hidden="true"
          >
            <path d="M16.247 7.761a6 6 0 0 1 0 8.478" />
            <path d="M19.075 4.933a10 10 0 0 1 0 14.134" />
            <path d="M4.925 19.067a10 10 0 0 1 0-14.134" />
            <path d="M7.753 16.239a6 6 0 0 1 0-8.478" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        }
        value={health && health.length ? `${online} / ${health.length}` : "—"}
        unit="Online"
        note="From the latest health check"
        footLabel="Offline"
        footValue={health && health.length ? String(offline) : "—"}
        footClass={offline ? "text-red-600 dark:text-red-400 font-semibold" : NEUTRAL_TEXT}
      />
      <StatCard
        label="Average Latency"
        iconWrap="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center"
        icon={
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
            className="lucide lucide-shield-alert w-4 h-4"
            aria-hidden="true"
          >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        }
        value={avg !== null ? String(avg) : "—"}
        unit="ms"
        note="Mean across services that responded"
        footLabel="Slowest"
        footValue={slowest ? `${slowest.latencyMs} ms` : "—"}
        footClass={NEUTRAL_TEXT}
      />
      <StatCard
        label="Threat Monitoring"
        iconWrap="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center"
        icon={
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
            className="lucide lucide-shield w-4 h-4"
            aria-hidden="true"
          >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </svg>
        }
        value="—"
        unit="Not monitored"
        note="No intrusion, rate-limit or login-block data is collected yet"
        footLabel="Login quarantine"
        footValue={NOT_MONITORED}
        footClass={NEUTRAL_TEXT}
      />
    </div>
  );
}

function HealthCard({ h }: { h: AdminHealthRow }) {
  const state = h.ok === true ? "Online" : h.ok === false ? "Offline" : "Not checked";
  const dot = h.ok === true ? "bg-emerald-500" : h.ok === false ? "bg-red-500" : "bg-neutral-400";
  const bar = h.ok === false ? "bg-red-500" : "bg-emerald-500";
  const width = h.latencyMs === null ? 0 : Math.min(100, Math.max(2, Math.round(h.latencyMs / 10)));
  return (
    <div className="p-4 rounded-xl bg-[#f9f9f9] dark:bg-[#171717] border border-[#ebebeb] dark:border-[#2f2f2f] flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dot}`} />
          <span className="text-sm font-semibold text-[#0d0d0d] dark:text-[#ececec]">
            {dash(h.name)}
          </span>
        </div>
        <span className="text-sm font-bold text-[#0d0d0d] dark:text-[#ececec]">
          {h.latencyMs !== null ? `${h.latencyMs} ms` : "—"}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="w-full bg-[#ebebeb] dark:bg-[#2f2f2f] h-1.5 rounded-full overflow-hidden">
          <div className={`${bar} h-full rounded-full`} style={{ width: `${width}%` }} />
        </div>
        <div className="flex justify-between text-xs text-[#737373] dark:text-[#a3a3a3]">
          <span>{state}</span>
          <span>Bar: latency, 1000 ms = full</span>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  id,
  checked: on,
  onChange,
  color,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  color: string;
}) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        id={id}
        className="sr-only peer"
        type="checkbox"
        checked={on}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className={`w-11 h-6 bg-[#ebebeb] dark:bg-[#2f2f2f] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${color}`}
      />
    </label>
  );
}

type SwitchKey = "lock" | "maint" | "twofa" | "whitelist";

function ControlDeck() {
  const [sw, setSw] = useState<Record<SwitchKey, boolean>>({
    lock: false,
    maint: false,
    twofa: false,
    whitelist: false,
  });
  const set = (k: SwitchKey) => (v: boolean) => setSw((s) => ({ ...s, [k]: v }));
  const row =
    "p-3.5 rounded-xl bg-[#f9f9f9] dark:bg-[#171717] border border-[#ebebeb] dark:border-[#2f2f2f] flex items-center justify-between gap-4";
  const t = "text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec]";
  const d = "text-[11px] text-[#737373] dark:text-[#a3a3a3]";
  return (
    <div className="rounded-2xl bg-white dark:bg-[#212121] border border-[#ebebeb] dark:border-[#2f2f2f] p-6 shadow-xs flex flex-col justify-between gap-6">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#ebebeb] dark:border-[#2f2f2f]">
          <div className="flex flex-col">
            <span className="text-xs text-[#737373] dark:text-[#a3a3a3] uppercase tracking-wider font-semibold">
              Super Administrator
            </span>
            <h2 className="text-lg font-bold text-[#0d0d0d] dark:text-[#ececec]">
              Safety Control Deck
            </h2>
          </div>
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
            className="lucide lucide-sliders-vertical w-5 h-5 text-[#737373] dark:text-[#a3a3a3]"
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
        <p className="text-xs text-[#737373] dark:text-[#a3a3a3] my-4">
          Switches are not connected yet. They only change on this page and do not affect the
          platform.
        </p>
        <div className="flex flex-col gap-3">
          <div className={row}>
            <div className="flex flex-col">
              <span className={t}>Emergency Platform Lock</span>
              <span className={d}>Suspends all financial withdrawals</span>
            </div>
            <Toggle
              id="switchLock"
              checked={sw.lock}
              onChange={set("lock")}
              color="peer-checked:bg-red-600"
            />
          </div>
          <div className="p-3.5 rounded-xl bg-[#f9f9f9] dark:bg-[#171717] border border-[#ebebeb] dark:border-[#2f2f2f] flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className={t}>Maintenance Mode</span>
                <span className={d}>Displays broadcast banner to standard users</span>
              </div>
              <Toggle
                id="switchMaint"
                checked={sw.maint}
                onChange={set("maint")}
                color="peer-checked:bg-[#0d0d0d] dark:peer-checked:bg-white"
              />
            </div>
          </div>
          <div className={row}>
            <div className="flex flex-col">
              <span className={t}>Mandatory 2FA</span>
              <span className={d}>Require a second factor for all accounts</span>
            </div>
            <Toggle
              id="switch2fa"
              checked={sw.twofa}
              onChange={set("twofa")}
              color="peer-checked:bg-emerald-600"
            />
          </div>
          <div className={row}>
            <div className="flex flex-col">
              <span className={t}>Strict Admin IP Whitelist</span>
              <span className={d}>Reject admin access from unlisted IPs</span>
            </div>
            <Toggle
              id="switchWhitelist"
              checked={sw.whitelist}
              onChange={set("whitelist")}
              color="peer-checked:bg-emerald-600"
            />
          </div>
        </div>
      </div>
      <div className="p-3.5 rounded-xl bg-[#f9f9f9] dark:bg-[#171717] border border-[#ebebeb] dark:border-[#2f2f2f] text-[#0d0d0d] dark:text-[#ececec] flex items-center justify-between">
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
            className="lucide lucide-circle-check w-4 h-4 text-neutral-400"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span className="text-xs font-semibold">Switches are not connected yet</span>
        </div>
        <span className="text-xs text-[#737373] dark:text-[#a3a3a3] font-mono">Local only</span>
      </div>
    </div>
  );
}

function AuditRow({ r }: { r: AdminAuditRow }) {
  return (
    <tr className="hover:bg-[#f9f9f9] dark:hover:bg-[#262626] transition-colors">
      <td className="py-4 px-6 text-[#737373] dark:text-[#a3a3a3] font-mono">{utcStamp(r.at)}</td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] bg-black text-white dark:bg-white dark:text-black">
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
              className="lucide lucide-user w-3.5 h-3.5"
              aria-hidden="true"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[#0d0d0d] dark:text-[#ececec]">
              {dash(r.actor)}
            </span>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className="px-2.5 py-1 rounded-full bg-[#f9f9f9] dark:bg-[#171717] border border-[#ebebeb] dark:border-[#2f2f2f] text-[#0d0d0d] dark:text-[#ececec] font-semibold text-[11px]">
          {dash(r.title)}
        </span>
      </td>
      <td className="py-4 px-6 text-[#737373] dark:text-[#a3a3a3]">{dash(r.description)}</td>
    </tr>
  );
}

function AuditTrail({
  audit,
  loading,
  failed,
}: {
  audit: AdminAuditRow[] | undefined;
  loading: boolean;
  failed: boolean;
}) {
  const [actor, setActor] = useState("ALL");
  const rows = useMemo(() => audit ?? [], [audit]);
  const actors = useMemo(
    () => Array.from(new Set(rows.map((r) => r.actor).filter(Boolean))).sort(),
    [rows],
  );
  const filtered = useMemo(
    () => (actor === "ALL" ? rows : rows.filter((r) => r.actor === actor)),
    [rows, actor],
  );
  const emptyText = loading
    ? "Loading audit log…"
    : failed
      ? "Audit log is not available yet."
      : rows.length === 0
        ? "No audit entries yet."
        : "No entries for this actor.";
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-[#737373] dark:text-[#a3a3a3] uppercase tracking-wider font-semibold">
            Audit Log
          </span>
          <h2 className="text-lg font-bold text-[#0d0d0d] dark:text-[#ececec]">
            Audit Trail & Access Logs
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-52">
            <div className="relative w-full">
              <label
                htmlFor="actorFilter"
                className="-top-2.5 left-4 px-1.5 text-xs font-semibold bg-white dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] rounded-sm absolute pointer-events-none transition-all duration-200 ease-out z-10 select-none"
              >
                Filter by Actor
              </label>
              <select
                id="actorFilter"
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                className="w-full h-12 bg-white dark:bg-[#212121] rounded-2xl px-4 pr-11 text-[#0d0d0d] dark:text-[#ececec] text-sm font-normal focus:outline-none transition-all duration-200 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border border-[#ebebeb] dark:border-[#383838]"
              >
                <option value="ALL">All Actors</option>
                {actors.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#737373] dark:text-[#b4b4b4]">
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
                  className="lucide lucide-chevron-down w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
          <button
            id="exportCsvBtn"
            type="button"
            onClick={() => downloadCsv(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 h-14 px-5 rounded-[24px] bg-white dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] border border-[#ebebeb] dark:border-[#2f2f2f] hover:bg-[#f4f4f4] dark:hover:bg-[#2a2a2a] transition-colors shadow-xs text-xs font-semibold cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
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
              className="lucide lucide-download w-3.5 h-3.5"
              aria-hidden="true"
            >
              <path d="M12 15V3" />
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="m7 10 5 5 5-5" />
            </svg>
            <span>Export Audit Log (CSV)</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-[#212121] border border-[#ebebeb] dark:border-[#2f2f2f] shadow-xs">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#f9f9f9] dark:bg-[#171717] text-[#737373] dark:text-[#a3a3a3] border-b border-[#ebebeb] dark:border-[#2f2f2f] text-xs uppercase tracking-wider">
              <th className="py-3.5 px-6 font-semibold">Timestamp (UTC)</th>
              <th className="py-3.5 px-6 font-semibold">Actor</th>
              <th className="py-3.5 px-6 font-semibold">Action Event</th>
              <th className="py-3.5 px-6 font-semibold">Details</th>
            </tr>
          </thead>
          <tbody
            className="text-xs text-[#0d0d0d] dark:text-[#ececec] divide-y divide-[#ebebeb] dark:divide-[#2f2f2f]"
            id="logTableBody"
          >
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-10 px-6 text-center text-[#737373] dark:text-[#a3a3a3]"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              filtered.map((r) => <AuditRow key={r.id} r={r} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SecuritySection() {
  const health = useAdminHealth();
  const audit = useAdminAudit();
  const checks = health.data;
  const timed = (checks ?? []).filter(
    (h): h is AdminHealthRow & { latencyMs: number } => h.latencyMs !== null,
  );
  const slowest = timed.length ? Math.max(...timed.map((h) => h.latencyMs)) : null;
  const healthEmpty = health.isLoading
    ? "Loading health checks…"
    : health.isError
      ? "Health checks are not available yet."
      : "No services are being checked yet.";
  const syncing = health.isFetching || audit.isFetching;

  return (
    <>
      <div className="flex flex-col w-full min-h-full bg-white dark:bg-[#16191f] pb-16 text-[#0d0d0d] dark:text-[#ececec]">
        <div className="px-6 sm:px-8 pt-1 sm:pt-2 pb-6 flex flex-col gap-6 border-b border-[#ebebeb] dark:border-[#2f2f2f] bg-white dark:bg-[#16191f]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-gray-950 dark:text-white">
                Security, Audit & System Health
              </h1>
            </div>
            <div className="flex items-center flex-wrap gap-3">
              <div className="px-7 py-3 sm:px-8 sm:py-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 text-[14px] sm:text-[15.5px] font-semibold rounded-full shadow-md flex items-center gap-2.5 select-none transition-all duration-150">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="tracking-tight font-semibold">Health checks every 30s</span>
              </div>
              <button
                id="refreshMetricsBtn"
                type="button"
                disabled={syncing}
                onClick={() => {
                  void health.refetch();
                  void audit.refetch();
                }}
                className="px-7 py-3 sm:px-8 sm:py-3.5 bg-white dark:bg-[#1e222b] text-gray-900 dark:text-white border border-gray-200/90 dark:border-neutral-700/80 text-[14px] sm:text-[15.5px] font-semibold rounded-full shadow-md hover:bg-neutral-50 dark:hover:bg-[#262b37] transition-all duration-150 cursor-pointer active:scale-95 flex items-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
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
                  className="lucide lucide-refresh-cw w-4 h-4 stroke-[2.2]"
                  aria-hidden="true"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
                <span>Refresh</span>
              </button>
              <button
                id="btnMasterIsolation"
                type="button"
                disabled
                title="Not connected yet"
                className="px-7 py-3 sm:px-8 sm:py-3.5 bg-red-600 hover:bg-red-700 text-white text-[14px] sm:text-[15.5px] font-semibold rounded-full shadow-lg active:scale-95 transition-all duration-150 cursor-pointer flex items-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
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
                  className="lucide lucide-lock w-4 h-4 stroke-[2.2]"
                  aria-hidden="true"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Master Isolation</span>
              </button>
            </div>
          </div>
        </div>
        <div className="px-6 sm:px-8 py-8 flex flex-col gap-8 max-w-7xl w-full">
          <SecurityStats health={checks} audit={audit.data} />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 rounded-2xl bg-white dark:bg-[#212121] border border-[#ebebeb] dark:border-[#2f2f2f] p-6 shadow-xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#ebebeb] dark:border-[#2f2f2f]">
                <div className="flex flex-col">
                  <span className="text-xs text-[#737373] dark:text-[#a3a3a3] uppercase tracking-wider font-semibold">
                    Infrastructure Telemetry
                  </span>
                  <h2 className="text-lg font-bold text-[#0d0d0d] dark:text-[#ececec]">
                    Microservice Health & Latency
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#f9f9f9] dark:bg-[#171717] border border-[#ebebeb] dark:border-[#2f2f2f] text-xs text-[#737373] dark:text-[#a3a3a3] font-semibold">
                    Slowest: {slowest !== null ? `${slowest} ms` : "—"}
                  </span>
                </div>
              </div>
              {checks && checks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {checks.map((h) => (
                    <HealthCard key={h.name} h={h} />
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#f9f9f9] dark:bg-[#171717] border border-[#ebebeb] dark:border-[#2f2f2f] text-xs text-center text-[#737373] dark:text-[#a3a3a3]">
                  {healthEmpty}
                </div>
              )}
              <div className="p-4 rounded-xl bg-[#f9f9f9] dark:bg-[#171717] border border-[#ebebeb] dark:border-[#2f2f2f] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#212121] border border-[#ebebeb] dark:border-[#2f2f2f] flex items-center justify-center text-[#0d0d0d] dark:text-[#ececec]">
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
                      className="lucide lucide-terminal w-5 h-5 text-neutral-400"
                      aria-hidden="true"
                    >
                      <path d="M12 19h8" />
                      <path d="m4 17 6-6-6-6" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec]">
                      Vulnerability Scanning
                    </span>
                    <span className="text-xs text-[#737373] dark:text-[#a3a3a3]">
                      {NOT_MONITORED}. No scanner is connected to this panel.
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <ControlDeck />
          </div>
          <AuditTrail audit={audit.data} loading={audit.isLoading} failed={audit.isError} />
        </div>
      </div>
    </>
  );
}
