import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@jobrio/utils/utils";
import { SectionHeader, Card } from "@admin/features/admin-dashboard/components/sections";
import { SectionTitle } from "@admin/features/admin-dashboard/components/sections-shared";

/* ============================================================
 * SYSTEM — technical infrastructure & platform operations
 * ============================================================ */

type SysKey =
  | "dashboard"
  | "config"
  | "jobs"
  | "scheduler"
  | "storage"
  | "integrations"
  | "backup"
  | "health"
  | "info";

const SYS_NAV: { key: SysKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "config", label: "System Configuration", icon: "settings" },
  { key: "jobs", label: "Background Jobs", icon: "autorenew" },
  { key: "scheduler", label: "Scheduler", icon: "schedule" },
  { key: "storage", label: "Storage Manager", icon: "database" },
  { key: "integrations", label: "Integrations", icon: "hub" },
  { key: "backup", label: "Backup & Recovery", icon: "cloud_download" },
  { key: "health", label: "System Health", icon: "monitor_heart" },
  { key: "info", label: "System Information", icon: "info" },
];

type SysJobStatus = "Running" | "Waiting" | "Completed" | "Failed";
interface SysJob {
  id: string;
  name: string;
  queue: string;
  status: SysJobStatus;
  runtime: string;
  attempts: number;
  nextRun?: string;
  lastRun: string;
}
const SYS_JOBS: SysJob[] = [
  {
    id: "JOB-8801",
    name: "Assignment Queue Processing",
    queue: "assignments",
    status: "Running",
    runtime: "00:04:12",
    attempts: 1,
    lastRun: "2026-07-04 12:41",
    nextRun: "continuous",
  },
  {
    id: "JOB-8802",
    name: "Notification Queue",
    queue: "notifications",
    status: "Running",
    runtime: "00:02:03",
    attempts: 1,
    lastRun: "2026-07-04 12:43",
    nextRun: "continuous",
  },
  {
    id: "JOB-8803",
    name: "Email Queue",
    queue: "email",
    status: "Waiting",
    runtime: "—",
    attempts: 0,
    lastRun: "2026-07-04 12:30",
    nextRun: "12:45",
  },
  {
    id: "JOB-8804",
    name: "Weekly Report Generation",
    queue: "reports",
    status: "Completed",
    runtime: "00:12:44",
    attempts: 1,
    lastRun: "2026-07-04 08:00",
    nextRun: "2026-07-11 08:00",
  },
  {
    id: "JOB-8805",
    name: "Archive Old Orders",
    queue: "archive",
    status: "Failed",
    runtime: "00:00:21",
    attempts: 3,
    lastRun: "2026-07-04 06:00",
    nextRun: "2026-07-05 06:00",
  },
  {
    id: "JOB-8806",
    name: "Session Cleanup",
    queue: "cleanup",
    status: "Completed",
    runtime: "00:00:41",
    attempts: 1,
    lastRun: "2026-07-04 03:00",
    nextRun: "2026-07-05 03:00",
  },
];

interface SysSchedule {
  id: string;
  name: string;
  type: "Broadcast" | "Assignment" | "Report" | "Cleanup" | "Archive";
  cron: string;
  next: string;
  last: string;
  status: "Active" | "Paused";
}
const SYS_SCHEDULES: SysSchedule[] = [
  {
    id: "SCH-101",
    name: "Scheduled Broadcast — Weekend Push",
    type: "Broadcast",
    cron: "Sat 09:00",
    next: "2026-07-05 09:00",
    last: "2026-06-28 09:00",
    status: "Active",
  },
  {
    id: "SCH-102",
    name: "Scheduled Assignment Rebalance",
    type: "Assignment",
    cron: "Every 6h",
    next: "2026-07-04 18:00",
    last: "2026-07-04 12:00",
    status: "Active",
  },
  {
    id: "SCH-103",
    name: "Daily Ops Report",
    type: "Report",
    cron: "Daily 07:00",
    next: "2026-07-05 07:00",
    last: "2026-07-04 07:00",
    status: "Active",
  },
  {
    id: "SCH-104",
    name: "Weekly Finance Report",
    type: "Report",
    cron: "Mon 08:00",
    next: "2026-07-06 08:00",
    last: "2026-06-29 08:00",
    status: "Active",
  },
  {
    id: "SCH-105",
    name: "Monthly Compliance Report",
    type: "Report",
    cron: "1st 09:00",
    next: "2026-08-01 09:00",
    last: "2026-07-01 09:00",
    status: "Active",
  },
  {
    id: "SCH-106",
    name: "Nightly Session Cleanup",
    type: "Cleanup",
    cron: "Daily 03:00",
    next: "2026-07-05 03:00",
    last: "2026-07-04 03:00",
    status: "Active",
  },
  {
    id: "SCH-107",
    name: "Quarterly Data Archive",
    type: "Archive",
    cron: "1st Jan/Apr/Jul/Oct",
    next: "2026-10-01 02:00",
    last: "2026-07-01 02:00",
    status: "Paused",
  },
];

interface SysStorageCat {
  label: string;
  used: number;
  icon: string;
}
const SYS_STORAGE_TOTAL = 2048; // GB
const SYS_STORAGE_USED = 1237;
const SYS_STORAGE_CATS: SysStorageCat[] = [
  { label: "User Uploads", used: 412, icon: "person" },
  { label: "Order Files", used: 268, icon: "inventory_2" },
  { label: "QA Files", used: 143, icon: "verified" },
  { label: "Broadcast Attachments", used: 62, icon: "campaign" },
  { label: "Backups", used: 268, icon: "cloud_download" },
  { label: "Logs", used: 84, icon: "receipt_long" },
];

interface SysIntegration {
  id: string;
  group: "Communication" | "Payments" | "Other";
  name: string;
  provider: string;
  status: "Connected" | "Degraded" | "Disconnected";
  lastSync: string;
  health: number;
}
const SYS_INTEGRATIONS: SysIntegration[] = [
  {
    id: "INT-01",
    group: "Communication",
    name: "Email Provider",
    provider: "Resend",
    status: "Connected",
    lastSync: "2 min ago",
    health: 99,
  },
  {
    id: "INT-02",
    group: "Communication",
    name: "SMS Provider",
    provider: "Twilio",
    status: "Connected",
    lastSync: "5 min ago",
    health: 98,
  },
  {
    id: "INT-03",
    group: "Communication",
    name: "Push Provider",
    provider: "OneSignal",
    status: "Connected",
    lastSync: "1 min ago",
    health: 100,
  },
  {
    id: "INT-04",
    group: "Payments",
    name: "Payment Gateway",
    provider: "Stripe",
    status: "Connected",
    lastSync: "just now",
    health: 100,
  },
  {
    id: "INT-05",
    group: "Payments",
    name: "Escrow Provider",
    provider: "Internal Escrow",
    status: "Connected",
    lastSync: "just now",
    health: 100,
  },
  {
    id: "INT-06",
    group: "Other",
    name: "Maps API",
    provider: "Mapbox",
    status: "Degraded",
    lastSync: "12 min ago",
    health: 74,
  },
  {
    id: "INT-07",
    group: "Other",
    name: "AI Services",
    provider: "Lovable AI Gateway",
    status: "Connected",
    lastSync: "just now",
    health: 99,
  },
  {
    id: "INT-08",
    group: "Other",
    name: "Storage Provider",
    provider: "R2",
    status: "Connected",
    lastSync: "just now",
    health: 100,
  },
];

interface SysBackup {
  id: string;
  date: string;
  type: "Full" | "Incremental";
  size: string;
  status: "Success" | "Failed";
}
const SYS_BACKUPS: SysBackup[] = [
  {
    id: "BKP-2041",
    date: "2026-07-04 02:00",
    type: "Incremental",
    size: "18.4 GB",
    status: "Success",
  },
  {
    id: "BKP-2040",
    date: "2026-07-03 02:00",
    type: "Incremental",
    size: "17.9 GB",
    status: "Success",
  },
  {
    id: "BKP-2039",
    date: "2026-07-02 02:00",
    type: "Incremental",
    size: "18.1 GB",
    status: "Success",
  },
  { id: "BKP-2038", date: "2026-07-01 02:00", type: "Full", size: "184.2 GB", status: "Success" },
  {
    id: "BKP-2037",
    date: "2026-06-30 02:00",
    type: "Incremental",
    size: "17.7 GB",
    status: "Success",
  },
];

const sysStatusTone = (s: string): string => {
  switch (s) {
    case "Running":
    case "Connected":
    case "Success":
    case "Active":
    case "Completed":
    case "Published":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Waiting":
    case "Paused":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Degraded":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Failed":
    case "Disconnected":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-surface text-on-surface-variant border-outline-variant/40";
  }
};

const SysStatusChip = ({ label }: { label: string }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
      sysStatusTone(label),
    )}
  >
    {label}
  </span>
);

const SysStatCard = ({
  label,
  value,
  hint,
  icon,
  tone = "text-on-surface",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: string;
  tone?: string;
}) => (
  <Card className="!p-4">
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-outline font-semibold">{label}</p>
        <p className={cn("text-2xl font-extrabold mt-1", tone)}>{value}</p>
        {hint && <p className="text-[11px] text-outline mt-1">{hint}</p>}
      </div>
      <span className="material-symbols-outlined text-primary" style={{ fontSize: 22 }}>
        {icon}
      </span>
    </div>
  </Card>
);

const SysBar = ({
  label,
  value,
  max = 100,
  tone = "bg-primary",
}: {
  label: string;
  value: number;
  max?: number;
  tone?: string;
}) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-semibold text-on-surface">
        <span>{label}</span>
        <span className="text-outline">{pct}%</span>
      </div>
      <div className="h-2 mt-1 rounded-full bg-outline-variant/30 overflow-hidden">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const SysConfigView = () => {
  const [maintenance, setMaintenance] = useState(false);
  const KVRow = ({ k, v }: { k: string; v: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-outline-variant/30 last:border-0">
      <span className="text-xs text-outline font-medium">{k}</span>
      <span className="text-xs font-bold text-on-surface">{v}</span>
    </div>
  );
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="!p-4">
        <SectionTitle title="General Settings" hint="Platform-wide defaults" />
        <KVRow k="Platform Name" v="Jobrio" />
        <KVRow k="Platform URL" v="https://jobrio.com" />
        <KVRow k="Default Timezone" v="Asia/Kolkata (IST · UTC+5:30)" />
        <KVRow k="Default Currency" v="INR (₹)" />
        <KVRow k="Default Language" v="English (India)" />
        <KVRow k="Date Format" v="DD MMM YYYY" />
        <KVRow k="Time Format" v="12-hour" />
      </Card>
      <Card className="!p-4">
        <SectionTitle title="Localization" hint="Regional & format preferences" />
        <KVRow k="Supported Locales" v="en-IN, en-US, hi-IN" />
        <KVRow k="Number Format" v="1,23,456.78 (Indian grouping)" />
        <KVRow k="First Day of Week" v="Monday" />
        <KVRow k="Weekend" v="Saturday, Sunday" />
      </Card>
      <Card className="!p-4">
        <SectionTitle title="Time & Date" hint="Platform clocks" />
        <KVRow k="Platform Server Time" v="2026-07-04 12:44 IST" />
        <KVRow k="UTC Offset" v="+05:30" />
        <KVRow k="NTP Source" v="pool.ntp.org (synced)" />
        <KVRow k="Clock Drift" v="0.4 ms" />
      </Card>
      <Card className="!p-4">
        <div className="flex items-center justify-between mb-3">
          <SectionTitle title="Maintenance Mode" hint="Global read-only toggle" />
        </div>
        <div className="rounded-xl border border-outline-variant/40 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-on-surface">Maintenance Mode</p>
              <p className="text-[11px] text-outline">
                When enabled, platform enters read-only mode.
              </p>
            </div>
            <button
              onClick={() => {
                setMaintenance((v) => !v);
                toast.success(`Maintenance ${!maintenance ? "enabled" : "disabled"}`);
              }}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                maintenance ? "bg-primary" : "bg-outline-variant/60",
              )}
              aria-pressed={maintenance}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  maintenance ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
          <div className="mt-3">
            <label className="text-[11px] text-outline font-semibold">Maintenance Message</label>
            <textarea
              rows={2}
              defaultValue="Jobrio is undergoing scheduled maintenance. We'll be back shortly."
              className="mt-1 w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-xs text-on-surface"
            />
          </div>
          <div className="mt-2">
            <label className="text-[11px] text-outline font-semibold">Estimated End Time</label>
            <input
              type="datetime-local"
              defaultValue="2026-07-04T14:00"
              className="mt-1 w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-xs text-on-surface"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

const SysJobsView = () => {
  const [tab, setTab] = useState<SysJobStatus | "All">("All");
  const tabs: (SysJobStatus | "All")[] = ["All", "Running", "Waiting", "Completed", "Failed"];
  const rows = SYS_JOBS.filter((j) => tab === "All" || j.status === tab);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const on = tab === t;
          const count =
            t === "All" ? SYS_JOBS.length : SYS_JOBS.filter((j) => j.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1 rounded-full text-[11px] font-semibold border",
                on
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface text-on-surface-variant border-outline-variant/40 hover:border-primary/40",
              )}
            >
              {t} <span className="opacity-70">· {count}</span>
            </button>
          );
        })}
      </div>
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-surface-variant/40 text-outline">
              <tr className="text-left">
                <th className="px-3 py-2 font-semibold">Job</th>
                <th className="px-3 py-2 font-semibold">Queue</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Runtime</th>
                <th className="px-3 py-2 font-semibold">Attempts</th>
                <th className="px-3 py-2 font-semibold">Last Run</th>
                <th className="px-3 py-2 font-semibold">Next Run</th>
                <th className="px-3 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((j) => (
                <tr key={j.id} className="border-t border-outline-variant/30">
                  <td className="px-3 py-2">
                    <p className="font-bold text-on-surface">{j.name}</p>
                    <p className="text-[10px] text-outline">{j.id}</p>
                  </td>
                  <td className="px-3 py-2 text-on-surface-variant">{j.queue}</td>
                  <td className="px-3 py-2">
                    <SysStatusChip label={j.status} />
                  </td>
                  <td className="px-3 py-2 text-on-surface-variant">{j.runtime}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{j.attempts}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{j.lastRun}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{j.nextRun ?? "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <span className="text-[11px] font-bold text-outline/60">
                      Retry · Backend required
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const SysSchedulerView = () => {
  const [tab, setTab] = useState<"Active" | "Upcoming" | "Recurring">("Active");
  const tabs: ("Active" | "Upcoming" | "Recurring")[] = ["Active", "Upcoming", "Recurring"];
  const rows = SYS_SCHEDULES.filter((s) => {
    if (tab === "Active") return s.status === "Active";
    if (tab === "Upcoming") return new Date(s.next).getTime() > Date.now();
    return (
      s.cron.toLowerCase().includes("every") ||
      s.cron.toLowerCase().includes("daily") ||
      s.cron.toLowerCase().includes("mon") ||
      s.cron.toLowerCase().includes("sat") ||
      s.cron.startsWith("1st")
    );
  });
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const on = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1 rounded-full text-[11px] font-semibold border",
                on
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface text-on-surface-variant border-outline-variant/40 hover:border-primary/40",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-surface-variant/40 text-outline">
              <tr className="text-left">
                <th className="px-3 py-2 font-semibold">Schedule</th>
                <th className="px-3 py-2 font-semibold">Type</th>
                <th className="px-3 py-2 font-semibold">Cron / Cadence</th>
                <th className="px-3 py-2 font-semibold">Next</th>
                <th className="px-3 py-2 font-semibold">Last</th>
                <th className="px-3 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t border-outline-variant/30">
                  <td className="px-3 py-2">
                    <p className="font-bold text-on-surface">{s.name}</p>
                    <p className="text-[10px] text-outline">{s.id}</p>
                  </td>
                  <td className="px-3 py-2 text-on-surface-variant">{s.type}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{s.cron}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{s.next}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{s.last}</td>
                  <td className="px-3 py-2">
                    <SysStatusChip label={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const SysStorageView = () => {
  const usedPct = Math.round((SYS_STORAGE_USED / SYS_STORAGE_TOTAL) * 100);
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        <SysStatCard label="Total Storage" value={`${SYS_STORAGE_TOTAL} GB`} icon="database" />
        <SysStatCard
          label="Used Storage"
          value={`${SYS_STORAGE_USED} GB`}
          hint={`${usedPct}% utilised`}
          icon="hard_drive"
        />
        <SysStatCard
          label="Available"
          value={`${SYS_STORAGE_TOTAL - SYS_STORAGE_USED} GB`}
          icon="check_circle"
          tone="text-emerald-600"
        />
      </div>
      <Card className="!p-4">
        <SectionTitle title="Utilisation by Category" hint="GB per bucket" />
        <div className="space-y-3">
          {SYS_STORAGE_CATS.map((c) => (
            <div key={c.label}>
              <div className="flex items-center justify-between text-[11px] font-semibold text-on-surface">
                <span className="inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>
                    {c.icon}
                  </span>
                  {c.label}
                </span>
                <span className="text-outline">{c.used} GB</span>
              </div>
              <div className="h-2 mt-1 rounded-full bg-outline-variant/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.round((c.used / SYS_STORAGE_TOTAL) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const SysIntegrationsView = () => {
  const groups: SysIntegration["group"][] = ["Communication", "Payments", "Other"];
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <Card key={g} className="!p-4">
          <SectionTitle title={g} hint="Connected external services" />
          <div className="grid md:grid-cols-2 gap-3">
            {SYS_INTEGRATIONS.filter((i) => i.group === g).map((i) => (
              <div key={i.id} className="rounded-xl border border-outline-variant/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{i.name}</p>
                    <p className="text-[11px] text-outline">
                      {i.provider} · {i.id}
                    </p>
                  </div>
                  <SysStatusChip label={i.status} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-outline">Last Sync </span>
                    <span className="font-semibold text-on-surface">{i.lastSync}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-outline">API Health </span>
                    <span className="font-semibold text-on-surface">{i.health}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

const SysBackupView = () => {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-3">
        <SysStatCard
          label="Last Backup"
          value="Today 02:00"
          hint="Incremental · 18.4 GB"
          icon="cloud_done"
          tone="text-emerald-600"
        />
        <SysStatCard
          label="Next Scheduled"
          value="Tomorrow 02:00"
          hint="Incremental"
          icon="schedule"
        />
        <SysStatCard
          label="Backup Size"
          value="184 GB"
          hint="Latest full · Jul 01"
          icon="database"
        />
        <SysStatCard
          label="Backup Status"
          value="Healthy"
          icon="check_circle"
          tone="text-emerald-600"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          disabled
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-on-primary hover:opacity-90"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            cloud_upload
          </span>
          Backup Now
        </button>
        <button
          disabled
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border bg-surface text-on-surface-variant border-outline-variant/40 hover:border-primary/40"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            restore
          </span>
          Restore Backup
        </button>
        <button
          disabled
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border bg-surface text-on-surface-variant border-outline-variant/40 hover:border-primary/40"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            download
          </span>
          Download Metadata
        </button>
      </div>
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-surface-variant/40 text-outline">
              <tr className="text-left">
                <th className="px-3 py-2 font-semibold">Backup</th>
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Type</th>
                <th className="px-3 py-2 font-semibold">Size</th>
                <th className="px-3 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {SYS_BACKUPS.map((b) => (
                <tr key={b.id} className="border-t border-outline-variant/30">
                  <td className="px-3 py-2 font-bold text-on-surface">{b.id}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{b.date}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{b.type}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{b.size}</td>
                  <td className="px-3 py-2">
                    <SysStatusChip label={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const SysHealthView = () => {
  const alerts = [
    {
      level: "warn",
      label: "Mapbox API degraded",
      detail: "Elevated latency detected · 12 min ago",
      icon: "warning",
    },
    {
      level: "info",
      label: "Archive job retry scheduled",
      detail: "JOB-8805 will retry in 06:00",
      icon: "info",
    },
  ];
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-3">
        <SysStatCard label="CPU Usage" value="42%" hint="8 cores" icon="memory" />
        <SysStatCard label="Memory Usage" value="61%" hint="19.5 / 32 GB" icon="developer_board" />
        <SysStatCard label="Storage Usage" value="60%" hint="1.2 / 2 TB" icon="database" />
        <SysStatCard
          label="Queue Health"
          value="Healthy"
          icon="autorenew"
          tone="text-emerald-600"
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="!p-4">
          <SectionTitle title="Live Metrics" hint="Rolling 5-minute averages" />
          <div className="space-y-3">
            <SysBar label="CPU Usage" value={42} />
            <SysBar label="Memory Usage" value={61} />
            <SysBar label="Storage Usage" value={60} />
            <SysBar label="Queue Health" value={94} tone="bg-emerald-500" />
            <SysBar label="Database Health" value={97} tone="bg-emerald-500" />
            <SysBar label="API Health" value={92} tone="bg-emerald-500" />
            <SysBar label="Background Jobs Health" value={81} tone="bg-amber-500" />
          </div>
        </Card>
        <Card className="!p-4">
          <SectionTitle title="Active Alerts" hint="Requires attention" />
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <div
                key={i}
                className="rounded-xl border border-outline-variant/40 p-3 flex items-start gap-2"
              >
                <span
                  className={cn(
                    "material-symbols-outlined",
                    a.level === "warn" ? "text-amber-600" : "text-primary",
                  )}
                  style={{ fontSize: 20 }}
                >
                  {a.icon}
                </span>
                <div>
                  <p className="text-xs font-bold text-on-surface">{a.label}</p>
                  <p className="text-[11px] text-outline">{a.detail}</p>
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-outline-variant/40 p-3">
              <p className="text-[11px] text-outline font-semibold">Monitored Alert Types</p>
              <p className="text-xs text-on-surface mt-1">
                High CPU · Low Storage · Queue Delay · Failed Jobs · API Failure
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const SysInfoView = () => {
  const KVRow = ({ k, v }: { k: string; v: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-outline-variant/30 last:border-0">
      <span className="text-xs text-outline font-medium">{k}</span>
      <span className="text-xs font-bold text-on-surface">{v}</span>
    </div>
  );
  return (
    <Card className="!p-4">
      <SectionTitle title="System Information" hint="Read-only" />
      <KVRow k="Platform Version" v="Jobrio v3.4.2" />
      <KVRow k="Build Version" v="build-20260704.1" />
      <KVRow k="Release Date" v="2026-07-01" />
      <KVRow k="Environment" v="Production" />
      <KVRow k="Database Version" v="PostgreSQL 16.3" />
      <KVRow k="API Version" v="v3 (2026-06-15)" />
    </Card>
  );
};

const SysDashboardView = () => (
  <div className="space-y-4">
    <div className="grid md:grid-cols-4 gap-3">
      <SysStatCard
        label="Platform Status"
        value="Operational"
        icon="check_circle"
        tone="text-emerald-600"
      />
      <SysStatCard label="Server Health" value="98%" hint="All nodes healthy" icon="dns" />
      <SysStatCard
        label="Active Jobs"
        value={SYS_JOBS.filter((j) => j.status === "Running").length}
        hint={`${SYS_JOBS.filter((j) => j.status === "Waiting").length} waiting`}
        icon="autorenew"
      />
      <SysStatCard
        label="Failed Jobs"
        value={SYS_JOBS.filter((j) => j.status === "Failed").length}
        icon="error"
        tone="text-rose-600"
      />
    </div>
    <div className="grid md:grid-cols-4 gap-3">
      <SysStatCard
        label="Storage Usage"
        value={`${Math.round((SYS_STORAGE_USED / SYS_STORAGE_TOTAL) * 100)}%`}
        hint={`${SYS_STORAGE_USED} / ${SYS_STORAGE_TOTAL} GB`}
        icon="database"
      />
      <SysStatCard
        label="Backup Status"
        value="Healthy"
        hint="Last: Today 02:00"
        icon="cloud_done"
        tone="text-emerald-600"
      />
      <SysStatCard
        label="Integrations"
        value={`${SYS_INTEGRATIONS.filter((i) => i.status === "Connected").length}/${SYS_INTEGRATIONS.length}`}
        hint="1 degraded"
        icon="hub"
      />
      <SysStatCard label="System Version" value="v3.4.2" hint="build-20260704.1" icon="info" />
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="!p-4">
        <SectionTitle title="Background Jobs Snapshot" />
        <div className="space-y-2">
          {SYS_JOBS.slice(0, 4).map((j) => (
            <div key={j.id} className="flex items-center justify-between text-xs">
              <span className="font-semibold text-on-surface">{j.name}</span>
              <SysStatusChip label={j.status} />
            </div>
          ))}
        </div>
      </Card>
      <Card className="!p-4">
        <SectionTitle title="Integrations Snapshot" />
        <div className="space-y-2">
          {SYS_INTEGRATIONS.slice(0, 5).map((i) => (
            <div key={i.id} className="flex items-center justify-between text-xs">
              <span className="font-semibold text-on-surface">
                {i.name} <span className="text-outline font-normal">· {i.provider}</span>
              </span>
              <SysStatusChip label={i.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

export const SystemSection = () => {
  const [view, setView] = useState<SysKey>("dashboard");
  return (
    <div className="space-y-6">
      <SectionHeader
        title="System"
        subtitle="Platform infrastructure & technical operations — configuration, background jobs, scheduler, storage, integrations, backups and health."
      />
      <div className="flex flex-wrap gap-2">
        {SYS_NAV.map((n) => {
          const on = view === n.key;
          return (
            <button
              key={n.key}
              onClick={() => setView(n.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap",
                on
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface text-on-surface-variant border-outline-variant/40 hover:border-primary/40",
              )}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                {n.icon}
              </span>
              {n.label}
            </button>
          );
        })}
      </div>
      {view === "dashboard" && <SysDashboardView />}
      {view === "config" && <SysConfigView />}
      {view === "jobs" && <SysJobsView />}
      {view === "scheduler" && <SysSchedulerView />}
      {view === "storage" && <SysStorageView />}
      {view === "integrations" && <SysIntegrationsView />}
      {view === "backup" && <SysBackupView />}
      {view === "health" && <SysHealthView />}
      {view === "info" && <SysInfoView />}
    </div>
  );
};

export default SystemSection;
