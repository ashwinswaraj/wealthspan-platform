import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@jobrio/utils/utils";
import AuditListPage, {
  AuditListTab,
  AuditSortOption,
} from "@admin/features/admin-dashboard/components/AuditListPage";
import { Card } from "@admin/features/admin-dashboard/components/sections";
import {
  Badge,
  ActionBtn,
  AudTable,
} from "@admin/features/admin-dashboard/components/sections-shared";

/* ============================================================
 * 11. AUDIT & LOGS — Forensic history (read-only)
 * ============================================================ */

/* ---------- Audit domain model ---------- */
type AuditKey =
  "dashboard" | "user" | "system" | "security" | "config" | "comm" | "error" | "archive";

const AUD_NAV: { key: AuditKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "space_dashboard" },
  { key: "user", label: "User Activity Logs", icon: "person" },
  { key: "system", label: "System Activity Logs", icon: "smart_toy" },
  { key: "security", label: "Security Logs", icon: "lock" },
  { key: "config", label: "Configuration Logs", icon: "settings" },
  { key: "comm", label: "Communication Logs", icon: "campaign" },
  { key: "error", label: "Error Logs", icon: "error" },
  { key: "archive", label: "Archive", icon: "inventory_2" },
];

type UserLog = {
  id: string;
  user: string;
  role: string;
  module: string;
  action: string;
  object: string;
  ip: string;
  device: string;
  when: string;
  status: "Success" | "Failed";
};
type SysLog = {
  id: string;
  module: string;
  event: string;
  trigger: string;
  status: "Success" | "Failed" | "Retried";
  ms: number;
  when: string;
};
type SecLog = {
  id: string;
  user: string;
  event: string;
  ip: string;
  device: string;
  browser: string;
  location: string;
  risk: "Low" | "Medium" | "High";
  status: "Success" | "Failed";
  when: string;
};
type CfgLog = {
  id: string;
  area: string;
  config: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  when: string;
  reason: string;
};
type CommLog = {
  id: string;
  type: string;
  channel: string;
  recipient: string;
  status: "Delivered" | "Failed" | "Queued" | "Retried";
  when: string;
};
type ErrLog = {
  id: string;
  module: string;
  type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  description: string;
  ref: string;
  status: "Open" | "Resolved";
  when: string;
};
type ArcRow = { id: string; period: string; records: number; sizeMB: number };

const AUD_USER: UserLog[] = [
  {
    id: "AL-9001",
    user: "Anika Shah",
    role: "Sub Admin",
    module: "Orders Desk",
    action: "Order Approved",
    object: "JR-1042",
    ip: "10.4.12.9",
    device: "Mac · Safari",
    when: "2m ago",
    status: "Success",
  },
  {
    id: "AL-9002",
    user: "Riya S.",
    role: "Client",
    module: "Orders",
    action: "Order Created",
    object: "JR-1051",
    ip: "49.207.11.44",
    device: "iOS · App",
    when: "8m ago",
    status: "Success",
  },
  {
    id: "AL-9003",
    user: "Manish K.",
    role: "Professional",
    module: "Assignments",
    action: "Assignment Accepted",
    object: "AS-2210",
    ip: "182.11.4.7",
    device: "Android · App",
    when: "14m ago",
    status: "Success",
  },
  {
    id: "AL-9004",
    user: "Vikram R.",
    role: "Sub Admin",
    module: "Disputes",
    action: "Case Closed",
    object: "DSP-118",
    ip: "10.4.12.14",
    device: "Win · Chrome",
    when: "1h ago",
    status: "Success",
  },
  {
    id: "AL-9005",
    user: "Priya M.",
    role: "Client",
    module: "Auth",
    action: "Login",
    object: "—",
    ip: "223.45.9.12",
    device: "iOS · Safari",
    when: "1h ago",
    status: "Failed",
  },
  {
    id: "AL-9006",
    user: "Super Admin",
    role: "Super Admin",
    module: "Communication",
    action: "Broadcast Created",
    object: "B-4021",
    ip: "10.4.12.1",
    device: "Mac · Chrome",
    when: "3h ago",
    status: "Success",
  },
];

const AUD_SYS: SysLog[] = [
  {
    id: "SE-5501",
    module: "Assignments",
    event: "Pool Created",
    trigger: "Order Approved · JR-1042",
    status: "Success",
    ms: 128,
    when: "2m ago",
  },
  {
    id: "SE-5502",
    module: "Assignments",
    event: "Broadcast to Pool",
    trigger: "Auto",
    status: "Success",
    ms: 92,
    when: "2m ago",
  },
  {
    id: "SE-5503",
    module: "Finance",
    event: "Escrow Released",
    trigger: "QA Passed · JR-1027",
    status: "Success",
    ms: 340,
    when: "22m ago",
  },
  {
    id: "SE-5504",
    module: "Communication",
    event: "Notification Sent",
    trigger: "Assignment Reminder",
    status: "Retried",
    ms: 1180,
    when: "45m ago",
  },
  {
    id: "SE-5505",
    module: "Jobs",
    event: "Nightly Report",
    trigger: "Cron 02:00 IST",
    status: "Success",
    ms: 4820,
    when: "6h ago",
  },
  {
    id: "SE-5506",
    module: "Webhooks",
    event: "stripe.payment_intent.succeeded",
    trigger: "Stripe",
    status: "Success",
    ms: 210,
    when: "9h ago",
  },
];

const AUD_SEC: SecLog[] = [
  {
    id: "SC-3301",
    user: "Super Admin",
    event: "Login Success",
    ip: "10.4.12.1",
    device: "MacBook Pro",
    browser: "Chrome 128",
    location: "Mumbai, IN",
    risk: "Low",
    status: "Success",
    when: "5m ago",
  },
  {
    id: "SC-3302",
    user: "Priya M.",
    event: "Login Failed (bad password)",
    ip: "223.45.9.12",
    device: "iPhone 15",
    browser: "Safari",
    location: "Delhi, IN",
    risk: "Medium",
    status: "Failed",
    when: "1h ago",
  },
  {
    id: "SC-3303",
    user: "Anika Shah",
    event: "MFA Enabled",
    ip: "10.4.12.9",
    device: "MacBook Air",
    browser: "Safari",
    location: "Bengaluru, IN",
    risk: "Low",
    status: "Success",
    when: "3h ago",
  },
  {
    id: "SC-3304",
    user: "unknown@—",
    event: "Account Locked (5 failures)",
    ip: "45.83.201.9",
    device: "Unknown",
    browser: "curl/8.4",
    location: "Unknown",
    risk: "High",
    status: "Failed",
    when: "6h ago",
  },
  {
    id: "SC-3305",
    user: "Vikram R.",
    event: "Password Changed",
    ip: "10.4.12.14",
    device: "Windows 11",
    browser: "Chrome 129",
    location: "Pune, IN",
    risk: "Low",
    status: "Success",
    when: "1d ago",
  },
];

const AUD_CFG: CfgLog[] = [
  {
    id: "CF-2201",
    area: "Platform Rules",
    config: "Escrow Hold Period",
    oldValue: "48h",
    newValue: "72h",
    changedBy: "Super Admin",
    when: "2h ago",
    reason: "Regulatory adjustment",
  },
  {
    id: "CF-2202",
    area: "Policies",
    config: "Refund Policy v1.3 → v1.4",
    oldValue: "v1.3",
    newValue: "v1.4",
    changedBy: "Legal Ops",
    when: "1d ago",
    reason: "Q3 update",
  },
  {
    id: "CF-2203",
    area: "Roles & Permissions",
    config: "Sub Admin · Finance access",
    oldValue: "Read",
    newValue: "Read + Approve",
    changedBy: "Super Admin",
    when: "1d ago",
    reason: "New sub-admin scope",
  },
  {
    id: "CF-2204",
    area: "Service Definitions",
    config: "Logo Design SLA",
    oldValue: "48h",
    newValue: "36h",
    changedBy: "Ops",
    when: "2d ago",
    reason: "Capacity improvement",
  },
  {
    id: "CF-2205",
    area: "Templates",
    config: "Assignment Reminder Template",
    oldValue: "v2",
    newValue: "v3",
    changedBy: "Marketing",
    when: "3d ago",
    reason: "Copy refresh",
  },
  {
    id: "CF-2206",
    area: "Notification Configurations",
    config: "SMS Channel · Order Approved",
    oldValue: "Off",
    newValue: "On",
    changedBy: "Super Admin",
    when: "4d ago",
    reason: "Delivery uplift",
  },
];

const AUD_COMM: CommLog[] = [
  {
    id: "CM-8801",
    type: "Broadcast",
    channel: "Push",
    recipient: "All Clients (1,240)",
    status: "Delivered",
    when: "12m ago",
  },
  {
    id: "CM-8802",
    type: "Notification",
    channel: "Email",
    recipient: "manish@—",
    status: "Delivered",
    when: "18m ago",
  },
  {
    id: "CM-8803",
    type: "Notification",
    channel: "SMS",
    recipient: "+91-98•••2211",
    status: "Failed",
    when: "24m ago",
  },
  {
    id: "CM-8804",
    type: "Notification",
    channel: "In-App",
    recipient: "riya@—",
    status: "Delivered",
    when: "31m ago",
  },
  {
    id: "CM-8805",
    type: "Broadcast",
    channel: "Email",
    recipient: "All Pros (846)",
    status: "Queued",
    when: "42m ago",
  },
  {
    id: "CM-8806",
    type: "Notification",
    channel: "Push",
    recipient: "vikram@—",
    status: "Retried",
    when: "1h ago",
  },
];

const AUD_ERR: ErrLog[] = [
  {
    id: "ER-7701",
    module: "Payments",
    type: "PaymentGatewayTimeout",
    severity: "High",
    description: "Stripe timeout on capture (JR-1051)",
    ref: "STK:cap:12ab",
    status: "Resolved",
    when: "20m ago",
  },
  {
    id: "ER-7702",
    module: "Notifications",
    type: "SMSProviderError",
    severity: "Medium",
    description: "Provider 503 for +91-98•••2211",
    ref: "MSG:err:88",
    status: "Open",
    when: "24m ago",
  },
  {
    id: "ER-7703",
    module: "Assignments",
    type: "PoolBuildFailure",
    severity: "Low",
    description: "Zero eligible pros for niche skill",
    ref: "AS:pool:44",
    status: "Resolved",
    when: "2h ago",
  },
  {
    id: "ER-7704",
    module: "Uploads",
    type: "FileTooLarge",
    severity: "Low",
    description: "Attachment exceeded 25MB",
    ref: "UP:size:9",
    status: "Resolved",
    when: "3h ago",
  },
  {
    id: "ER-7705",
    module: "Database",
    type: "DeadlockDetected",
    severity: "Critical",
    description: "Escrow ledger write conflict",
    ref: "DB:dl:2",
    status: "Resolved",
    when: "5h ago",
  },
];

const AUD_ARC: ArcRow[] = [
  { id: "AR-2506", period: "June 2026", records: 184_231, sizeMB: 92 },
  { id: "AR-2505", period: "May 2026", records: 172_014, sizeMB: 86 },
  { id: "AR-2504", period: "April 2026", records: 168_442, sizeMB: 84 },
  { id: "AR-Q1", period: "Q1 2026", records: 512_887, sizeMB: 258 },
  { id: "AR-2025", period: "Year 2025", records: 2_104_998, sizeMB: 1024 },
];

const riskTone = (r: "Low" | "Medium" | "High" | "Critical") =>
  r === "Critical"
    ? "bg-rose-100 text-rose-800"
    : r === "High"
      ? "bg-rose-50 text-rose-700"
      : r === "Medium"
        ? "bg-amber-50 text-amber-700"
        : "bg-emerald-50 text-emerald-700";

const audStatusTone = (s: string) =>
  s === "Delivered" || s === "Success" || s === "Resolved"
    ? "bg-emerald-50 text-emerald-700"
    : s === "Failed"
      ? "bg-rose-50 text-rose-700"
      : s === "Retried" || s === "Queued"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-700";

export const AuditSection = () => {
  const [view, setView] = useState<AuditKey>("dashboard");
  const [query, setQuery] = useState("");
  const [sortByTab, setSortByTab] = useState<Record<AuditKey, string>>({
    dashboard: "all",
    user: "all",
    system: "all",
    security: "all",
    config: "all",
    comm: "all",
    error: "all",
    archive: "all",
  });
  const [advOpen, setAdvOpen] = useState(false);
  const [advDateRange, setAdvDateRange] = useState("7d");
  const [advModule, setAdvModule] = useState("all");
  const [advEventType, setAdvEventType] = useState("all");
  const [advSeverity, setAdvSeverity] = useState("all");
  const [advStatus, setAdvStatus] = useState("all");
  const [advTimeline, setAdvTimeline] = useState(false);

  const filter = sortByTab[view];
  const setFilter = (k: string) => setSortByTab((s) => ({ ...s, [view]: k }));

  const q = query.trim().toLowerCase();
  const matches = (o: object) => !q || JSON.stringify(o).toLowerCase().includes(q);

  const filteredUser = AUD_USER.filter(
    (r) =>
      (filter === "all" ||
        (filter === "success" && r.status === "Success") ||
        (filter === "failed" && r.status === "Failed") ||
        (filter === "admin" && r.role.includes("Admin")) ||
        (filter === "client" && r.role === "Client") ||
        (filter === "pro" && r.role === "Professional")) &&
      matches(r),
  );
  const filteredSys = AUD_SYS.filter(
    (r) =>
      (filter === "all" ||
        (filter === "success" && r.status === "Success") ||
        (filter === "failed" && r.status === "Failed") ||
        (filter === "retried" && r.status === "Retried")) &&
      matches(r),
  );
  const filteredSec = AUD_SEC.filter(
    (r) =>
      (filter === "all" ||
        (filter === "success" && r.status === "Success") ||
        (filter === "failed" && r.status === "Failed") ||
        filter === r.risk.toLowerCase()) &&
      matches(r),
  );
  const filteredCfg = AUD_CFG.filter(
    (r) => (filter === "all" || r.area.toLowerCase().includes(filter)) && matches(r),
  );
  const filteredComm = AUD_COMM.filter(
    (r) =>
      (filter === "all" ||
        (filter === "delivered" && r.status === "Delivered") ||
        (filter === "failed" && r.status === "Failed") ||
        (filter === "queued" && r.status === "Queued") ||
        (filter === "retried" && r.status === "Retried")) &&
      matches(r),
  );
  const filteredErr = AUD_ERR.filter(
    (r) =>
      (filter === "all" ||
        filter === r.severity.toLowerCase() ||
        (filter === "open" && r.status === "Open") ||
        (filter === "resolved" && r.status === "Resolved")) &&
      matches(r),
  );
  const filteredArc = AUD_ARC.filter(
    (r) =>
      (filter === "all" ||
        (filter === "monthly" && !r.period.startsWith("Q") && !r.period.startsWith("Year")) ||
        (filter === "quarterly" && r.period.startsWith("Q")) ||
        (filter === "yearly" && r.period.startsWith("Year"))) &&
      matches(r),
  );

  // Sort/filter options per primary tab — merged in from the former secondary
  // filter-chip row. Dashboard intentionally has none.
  const SORT_OPTIONS_BY_TAB: Partial<Record<AuditKey, AuditSortOption[]>> = {
    user: [
      { key: "all", label: "All" },
      { key: "admin", label: "Admins" },
      { key: "client", label: "Clients" },
      { key: "pro", label: "Professionals" },
      { key: "success", label: "Success" },
      { key: "failed", label: "Failed" },
    ],
    system: [
      { key: "all", label: "All" },
      { key: "success", label: "Success" },
      { key: "retried", label: "Retried" },
      { key: "failed", label: "Failed" },
    ],
    security: [
      { key: "all", label: "All" },
      { key: "success", label: "Success" },
      { key: "failed", label: "Failed" },
      { key: "low", label: "Low Risk" },
      { key: "medium", label: "Medium Risk" },
      { key: "high", label: "High Risk" },
    ],
    config: [
      { key: "all", label: "All Areas" },
      { key: "platform rules", label: "Platform Rules" },
      { key: "policies", label: "Policies" },
      { key: "roles", label: "Roles & Permissions" },
      { key: "service", label: "Service Definitions" },
      { key: "templates", label: "Templates" },
      { key: "notification", label: "Notification Configs" },
    ],
    comm: [
      { key: "all", label: "All" },
      { key: "delivered", label: "Delivered" },
      { key: "failed", label: "Failed" },
      { key: "queued", label: "Queued" },
      { key: "retried", label: "Retried" },
    ],
    error: [
      { key: "all", label: "All" },
      { key: "open", label: "Open" },
      { key: "resolved", label: "Resolved" },
      { key: "low", label: "Low" },
      { key: "medium", label: "Medium" },
      { key: "high", label: "High" },
      { key: "critical", label: "Critical" },
    ],
    archive: [
      { key: "all", label: "All" },
      { key: "monthly", label: "Monthly" },
      { key: "quarterly", label: "Quarterly" },
      { key: "yearly", label: "Yearly" },
    ],
  };

  const COUNT_BY_TAB: Record<AuditKey, number> = {
    dashboard: 0,
    user: filteredUser.length,
    system: filteredSys.length,
    security: filteredSec.length,
    config: filteredCfg.length,
    comm: filteredComm.length,
    error: filteredErr.length,
    archive: filteredArc.length,
  };

  const tabs: AuditListTab[] = AUD_NAV;

  return (
    <AuditListPage
      title="Audit & Logs"
      description="Forensic history across every module — searchable, filterable, read-only."
      tabs={tabs}
      activeTab={view}
      onTabChange={(k) => setView(k as AuditKey)}
      sortOptions={SORT_OPTIONS_BY_TAB[view]}
      sortValue={filter}
      onSortChange={setFilter}
      count={COUNT_BY_TAB[view]}
      search={
        view === "archive"
          ? {
              query,
              onSearch: setQuery,
              placeholder:
                "Search by User · Order ID · Assignment ID · Payment ID · Broadcast ID · Log ID · IP · Module…",
              investigateActive: advOpen,
              onInvestigateToggle: () => setAdvOpen((v) => !v),
              timelineActive: advTimeline,
              onTimelineToggle: () => setAdvTimeline((v) => !v),
            }
          : undefined
      }
    >
      {view === "archive" && (advOpen || advTimeline) && (
        <div className="space-y-3 mb-3">
          {advOpen && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-1">
              {[
                {
                  label: "Date Range",
                  value: advDateRange,
                  setter: setAdvDateRange,
                  options: [
                    { k: "24h", l: "Last 24h" },
                    { k: "7d", l: "Last 7 days" },
                    { k: "30d", l: "Last 30 days" },
                    { k: "90d", l: "Last 90 days" },
                    { k: "all", l: "All Time" },
                  ],
                },
                {
                  label: "Module",
                  value: advModule,
                  setter: setAdvModule,
                  options: [
                    { k: "all", l: "All Modules" },
                    { k: "orders", l: "Orders" },
                    { k: "assignments", l: "Assignments" },
                    { k: "finance", l: "Finance" },
                    { k: "security", l: "Security" },
                    { k: "config", l: "Configuration" },
                    { k: "comm", l: "Communication" },
                  ],
                },
                {
                  label: "Event Type",
                  value: advEventType,
                  setter: setAdvEventType,
                  options: [
                    { k: "all", l: "All Events" },
                    { k: "user", l: "User Activity" },
                    { k: "system", l: "System" },
                    { k: "security", l: "Security" },
                    { k: "config", l: "Config Change" },
                    { k: "comm", l: "Communication" },
                    { k: "error", l: "Error" },
                  ],
                },
                {
                  label: "Severity",
                  value: advSeverity,
                  setter: setAdvSeverity,
                  options: [
                    { k: "all", l: "All" },
                    { k: "low", l: "Low" },
                    { k: "medium", l: "Medium" },
                    { k: "high", l: "High" },
                    { k: "critical", l: "Critical" },
                  ],
                },
                {
                  label: "Status",
                  value: advStatus,
                  setter: setAdvStatus,
                  options: [
                    { k: "all", l: "All" },
                    { k: "success", l: "Success" },
                    { k: "failed", l: "Failed" },
                    { k: "open", l: "Open" },
                    { k: "resolved", l: "Resolved" },
                  ],
                },
              ].map((f) => (
                <label key={f.label} className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">
                    {f.label}
                  </span>
                  <select
                    value={f.value}
                    onChange={(e) => f.setter(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/40 rounded-lg px-2 py-1.5 text-xs font-semibold text-on-surface focus:outline-none focus:border-on-surface"
                  >
                    {f.options.map((o) => (
                      <option key={o.k} value={o.k}>
                        {o.l}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}

          {advTimeline && (
            <div className="pt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-outline mb-2">
                Investigation Timeline
              </p>
              <ol className="relative border-l-2 border-outline-variant/40 ml-2 space-y-2">
                {[
                  { t: "09:00", e: "Login", who: "Riya S." },
                  { t: "09:03", e: "Order Created · JR-1051", who: "Riya S." },
                  { t: "09:05", e: "Payment Received · PAY-3390", who: "System" },
                  { t: "09:06", e: "Assignment Started · AS-771", who: "System" },
                  { t: "09:12", e: "Assignment Accepted", who: "Anika Shah" },
                  { t: "09:20", e: "Work Started", who: "Anika Shah" },
                ].map((s, i) => (
                  <li key={i} className="pl-4 relative">
                    <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-surface" />
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-on-surface">{s.t}</span>
                      <span className="text-on-surface">{s.e}</span>
                      <span className="text-outline">· {s.who}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {view === "dashboard" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            {[
              { l: "Total Records", v: "2.94M", tone: "text-on-surface" },
              { l: "Users Today", v: "18,204", tone: "text-primary-container" },
              { l: "System Today", v: "42,118", tone: "text-indigo-600" },
              { l: "Security Events", v: "312", tone: "text-amber-600" },
              { l: "Config Changes", v: "6", tone: "text-emerald-600" },
              { l: "Failed Events", v: "94", tone: "text-rose-600" },
              { l: "Critical Alerts", v: "2", tone: "text-rose-700" },
            ].map((s) => (
              <Card key={s.l}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  {s.l}
                </p>
                <p className={cn("text-xl font-extrabold mt-1", s.tone)}>{s.v}</p>
              </Card>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <p className="text-sm font-extrabold text-on-surface mb-2">Latest User Actions</p>
              <ul className="divide-y divide-surface-container-high/60">
                {AUD_USER.slice(0, 4).map((r) => (
                  <li key={r.id} className="py-2 flex items-center justify-between text-xs">
                    <span className="truncate">
                      <span className="font-bold">{r.user}</span> · {r.action}
                    </span>
                    <span className="text-outline shrink-0">{r.when}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <p className="text-sm font-extrabold text-on-surface mb-2">Latest System Events</p>
              <ul className="divide-y divide-surface-container-high/60">
                {AUD_SYS.slice(0, 4).map((r) => (
                  <li key={r.id} className="py-2 flex items-center justify-between text-xs">
                    <span className="truncate">
                      {r.module} · {r.event}
                    </span>
                    <span className="text-outline shrink-0">{r.when}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <p className="text-sm font-extrabold text-on-surface mb-2">Latest Security Events</p>
              <ul className="divide-y divide-surface-container-high/60">
                {AUD_SEC.slice(0, 4).map((r) => (
                  <li key={r.id} className="py-2 flex items-center justify-between text-xs">
                    <span className="truncate">
                      <span className="font-bold">{r.user}</span> · {r.event}
                    </span>
                    <Badge tone={riskTone(r.risk)}>{r.risk}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <p className="text-sm font-extrabold text-on-surface mb-2">Latest Admin Actions</p>
              <ul className="divide-y divide-surface-container-high/60">
                {AUD_USER.filter((r) => r.role.includes("Admin"))
                  .slice(0, 4)
                  .map((r) => (
                    <li key={r.id} className="py-2 flex items-center justify-between text-xs">
                      <span className="truncate">
                        <span className="font-bold">{r.user}</span> · {r.action} · {r.object}
                      </span>
                      <span className="text-outline shrink-0">{r.when}</span>
                    </li>
                  ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {view === "user" && (
        <AudTable
          head={[
            "Log ID",
            "User",
            "Role",
            "Module",
            "Action",
            "Object",
            "IP",
            "Device",
            "When",
            "Status",
          ]}
          body={filteredUser.map((r) => (
            <tr key={r.id} className="hover:bg-surface-container-low/60">
              <td className="px-3 py-2 font-mono text-[11px]">{r.id}</td>
              <td className="px-3 py-2 font-semibold">{r.user}</td>
              <td className="px-3 py-2">{r.role}</td>
              <td className="px-3 py-2">{r.module}</td>
              <td className="px-3 py-2">{r.action}</td>
              <td className="px-3 py-2 font-mono text-[11px]">{r.object}</td>
              <td className="px-3 py-2 font-mono text-[11px]">{r.ip}</td>
              <td className="px-3 py-2">{r.device}</td>
              <td className="px-3 py-2 text-outline">{r.when}</td>
              <td className="px-3 py-2">
                <Badge tone={audStatusTone(r.status)}>{r.status}</Badge>
              </td>
            </tr>
          ))}
        />
      )}

      {view === "system" && (
        <AudTable
          head={["Event ID", "Module", "Event", "Trigger", "Status", "Exec Time", "When"]}
          body={filteredSys.map((r) => (
            <tr key={r.id} className="hover:bg-surface-container-low/60">
              <td className="px-3 py-2 font-mono text-[11px]">{r.id}</td>
              <td className="px-3 py-2 font-semibold">{r.module}</td>
              <td className="px-3 py-2">{r.event}</td>
              <td className="px-3 py-2 text-on-surface-variant">{r.trigger}</td>
              <td className="px-3 py-2">
                <Badge tone={audStatusTone(r.status)}>{r.status}</Badge>
              </td>
              <td className="px-3 py-2 font-mono text-[11px]">{r.ms}ms</td>
              <td className="px-3 py-2 text-outline">{r.when}</td>
            </tr>
          ))}
        />
      )}

      {view === "security" && (
        <AudTable
          head={["User", "Event", "IP", "Device", "Browser", "Location", "Risk", "Status", "When"]}
          body={filteredSec.map((r) => (
            <tr key={r.id} className="hover:bg-surface-container-low/60">
              <td className="px-3 py-2 font-semibold">{r.user}</td>
              <td className="px-3 py-2">{r.event}</td>
              <td className="px-3 py-2 font-mono text-[11px]">{r.ip}</td>
              <td className="px-3 py-2">{r.device}</td>
              <td className="px-3 py-2">{r.browser}</td>
              <td className="px-3 py-2">{r.location}</td>
              <td className="px-3 py-2">
                <Badge tone={riskTone(r.risk)}>{r.risk}</Badge>
              </td>
              <td className="px-3 py-2">
                <Badge tone={audStatusTone(r.status)}>{r.status}</Badge>
              </td>
              <td className="px-3 py-2 text-outline">{r.when}</td>
            </tr>
          ))}
        />
      )}

      {view === "config" && (
        <AudTable
          head={["Area", "Configuration", "Old Value", "New Value", "Changed By", "When", "Reason"]}
          body={filteredCfg.map((r) => (
            <tr key={r.id} className="hover:bg-surface-container-low/60">
              <td className="px-3 py-2 font-semibold">{r.area}</td>
              <td className="px-3 py-2">{r.config}</td>
              <td className="px-3 py-2 text-rose-600 font-mono text-[11px]">{r.oldValue}</td>
              <td className="px-3 py-2 text-emerald-600 font-mono text-[11px]">{r.newValue}</td>
              <td className="px-3 py-2">{r.changedBy}</td>
              <td className="px-3 py-2 text-outline">{r.when}</td>
              <td className="px-3 py-2 text-on-surface-variant">{r.reason}</td>
            </tr>
          ))}
        />
      )}

      {view === "comm" && (
        <AudTable
          head={["Comm ID", "Type", "Channel", "Recipient", "Status", "When"]}
          body={filteredComm.map((r) => (
            <tr key={r.id} className="hover:bg-surface-container-low/60">
              <td className="px-3 py-2 font-mono text-[11px]">{r.id}</td>
              <td className="px-3 py-2 font-semibold">{r.type}</td>
              <td className="px-3 py-2">{r.channel}</td>
              <td className="px-3 py-2">{r.recipient}</td>
              <td className="px-3 py-2">
                <Badge tone={audStatusTone(r.status)}>{r.status}</Badge>
              </td>
              <td className="px-3 py-2 text-outline">{r.when}</td>
            </tr>
          ))}
        />
      )}

      {view === "error" && (
        <AudTable
          head={[
            "Error ID",
            "Module",
            "Type",
            "Severity",
            "Description",
            "Stack Ref",
            "Status",
            "When",
          ]}
          body={filteredErr.map((r) => (
            <tr key={r.id} className="hover:bg-surface-container-low/60">
              <td className="px-3 py-2 font-mono text-[11px]">{r.id}</td>
              <td className="px-3 py-2 font-semibold">{r.module}</td>
              <td className="px-3 py-2">{r.type}</td>
              <td className="px-3 py-2">
                <Badge tone={riskTone(r.severity)}>{r.severity}</Badge>
              </td>
              <td className="px-3 py-2 text-on-surface-variant">{r.description}</td>
              <td className="px-3 py-2 font-mono text-[11px] text-outline">{r.ref}</td>
              <td className="px-3 py-2">
                <Badge tone={audStatusTone(r.status)}>{r.status}</Badge>
              </td>
              <td className="px-3 py-2 text-outline">{r.when}</td>
            </tr>
          ))}
        />
      )}

      {view === "archive" && (
        <div className="space-y-3">
          <AudTable
            head={["Archive ID", "Period", "Records", "Size", "Actions"]}
            body={filteredArc.map((r) => (
              <tr key={r.id} className="hover:bg-surface-container-low/60">
                <td className="px-3 py-2 font-mono text-[11px]">{r.id}</td>
                <td className="px-3 py-2 font-semibold">{r.period}</td>
                <td className="px-3 py-2">{r.records.toLocaleString()}</td>
                <td className="px-3 py-2">{r.sizeMB} MB</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <ActionBtn label="View" icon="visibility" tone="neutral" />
                    <ActionBtn label="Export · Coming Soon" icon="download" tone="neutral" />
                    <ActionBtn label="Restore · Backend Required" icon="restore" tone="neutral" />
                  </div>
                </td>
              </tr>
            ))}
          />
          <p className="text-[11px] text-outline">
            Archived records are tamper-resistant. Restoration is subject to retention policy.
          </p>
        </div>
      )}
    </AuditListPage>
  );
};

export default AuditSection;
