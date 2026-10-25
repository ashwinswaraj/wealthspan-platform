import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@jobrio/utils/utils";
import { SectionHeader, Card } from "@admin/features/admin-dashboard/components/sections";
import {
  Badge,
  ActionBtn,
  AudTable,
} from "@admin/features/admin-dashboard/components/sections-shared";

/* ============================================================
 * 11B. SECURITY — Platform protection, authentication & threat monitoring
 * ============================================================ */

type SecKey =
  | "dashboard"
  | "auth"
  | "threats"
  | "sessions"
  | "ip"
  | "sensitive"
  | "alerts"
  | "history"
  | "analytics";

const SEC_NAV: { key: SecKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "space_dashboard" },
  { key: "auth", label: "Authentication", icon: "vpn_key" },
  { key: "threats", label: "Threat Monitoring", icon: "gpp_maybe" },
  { key: "sessions", label: "Device & Sessions", icon: "devices" },
  { key: "ip", label: "IP & Access", icon: "public" },
  { key: "sensitive", label: "Sensitive Actions", icon: "lock_person" },
  { key: "alerts", label: "Security Alerts", icon: "notifications_active" },
  { key: "history", label: "Security History", icon: "history" },
  { key: "analytics", label: "Security Analytics", icon: "monitoring" },
];

type SecSession = {
  id: string;
  user: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  login: string;
  last: string;
  status: "Active" | "Idle" | "Suspicious" | "Blocked" | "Trusted";
};
type SecThreat = {
  id: string;
  type: string;
  user: string;
  ip: string;
  count: number;
  risk: "Low" | "Medium" | "High" | "Critical";
  when: string;
};
type SecIP = {
  id: string;
  ip: string;
  scope: "Blocked" | "Allowlisted";
  reason: string;
  addedBy: string;
  when: string;
};
type SecCountry = { code: string; name: string; policy: "Allowed" | "Restricted" };
type SecSensitive = {
  id: string;
  action: string;
  module: string;
  requires: string;
  lastUsed: string;
};
type SecAlert = {
  id: string;
  type: string;
  user: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  when: string;
  status: "Open" | "Acknowledged" | "Resolved";
};
type SecHistoryRow = {
  id: string;
  user: string;
  event: string;
  ip: string;
  device: string;
  when: string;
};

const SEC_SESSIONS: SecSession[] = [
  {
    id: "SS-9001",
    user: "Super Admin",
    device: "MacBook Pro 16",
    browser: "Chrome 128",
    os: "macOS 14.5",
    ip: "10.4.12.1",
    login: "Today · 09:12",
    last: "1m ago",
    status: "Active",
  },
  {
    id: "SS-9002",
    user: "Anika Shah",
    device: "iPad Pro",
    browser: "Safari",
    os: "iPadOS 17.6",
    ip: "10.4.12.9",
    login: "Today · 08:45",
    last: "12m ago",
    status: "Idle",
  },
  {
    id: "SS-9003",
    user: "Riya S.",
    device: "iPhone 15",
    browser: "Safari",
    os: "iOS 17.6",
    ip: "49.207.11.44",
    login: "Today · 07:20",
    last: "3m ago",
    status: "Active",
  },
  {
    id: "SS-9004",
    user: "unknown@—",
    device: "Unknown",
    browser: "curl/8.4",
    os: "Linux",
    ip: "45.83.201.9",
    login: "Today · 03:14",
    last: "6h ago",
    status: "Suspicious",
  },
];

const SEC_THREATS: SecThreat[] = [
  {
    id: "TH-4401",
    type: "Brute Force",
    user: "priya@—",
    ip: "223.45.9.12",
    count: 5,
    risk: "High",
    when: "1h ago",
  },
  {
    id: "TH-4402",
    type: "Credential Stuffing",
    user: "multiple",
    ip: "45.83.201.9",
    count: 128,
    risk: "Critical",
    when: "6h ago",
  },
  {
    id: "TH-4403",
    type: "Impossible Travel",
    user: "vikram@—",
    ip: "182.11.4.7 → 8.8.4.4",
    count: 1,
    risk: "Medium",
    when: "2h ago",
  },
  {
    id: "TH-4404",
    type: "Multi-Device Login",
    user: "riya@—",
    ip: "3 devices",
    count: 3,
    risk: "Low",
    when: "12m ago",
  },
  {
    id: "TH-4405",
    type: "Suspicious Admin Activity",
    user: "sub-admin@—",
    ip: "10.4.12.14",
    count: 1,
    risk: "High",
    when: "3h ago",
  },
];

const SEC_BLOCKED_IPS: SecIP[] = [
  {
    id: "IP-8801",
    ip: "45.83.201.9",
    scope: "Blocked",
    reason: "Repeated credential stuffing",
    addedBy: "Auto",
    when: "6h ago",
  },
  {
    id: "IP-8802",
    ip: "185.220.100.240",
    scope: "Blocked",
    reason: "Tor exit node",
    addedBy: "Super Admin",
    when: "2d ago",
  },
  {
    id: "IP-8803",
    ip: "10.4.12.0/24",
    scope: "Allowlisted",
    reason: "HQ office",
    addedBy: "Super Admin",
    when: "30d ago",
  },
  {
    id: "IP-8804",
    ip: "49.207.0.0/16",
    scope: "Allowlisted",
    reason: "Trusted ISP range",
    addedBy: "Security",
    when: "60d ago",
  },
];

const SEC_COUNTRIES: SecCountry[] = [
  { code: "IN", name: "India", policy: "Allowed" },
  { code: "US", name: "United States", policy: "Allowed" },
  { code: "GB", name: "United Kingdom", policy: "Allowed" },
  { code: "AE", name: "United Arab Emirates", policy: "Allowed" },
  { code: "RU", name: "Russia", policy: "Restricted" },
  { code: "KP", name: "North Korea", policy: "Restricted" },
];

const SEC_SENSITIVE: SecSensitive[] = [
  {
    id: "SA-01",
    action: "Delete User",
    module: "Users Directory",
    requires: "MFA + Super Admin",
    lastUsed: "4h ago",
  },
  {
    id: "SA-02",
    action: "Change Platform Rules",
    module: "Platform Rules",
    requires: "MFA + Super Admin",
    lastUsed: "2h ago",
  },
  {
    id: "SA-03",
    action: "Change Commission %",
    module: "Finance & Escrow",
    requires: "MFA + Dual Approval",
    lastUsed: "1d ago",
  },
  {
    id: "SA-04",
    action: "Refund Approval",
    module: "Finance & Escrow",
    requires: "MFA",
    lastUsed: "22m ago",
  },
  {
    id: "SA-05",
    action: "Escrow Manual Release",
    module: "Finance & Escrow",
    requires: "MFA + Dual Approval",
    lastUsed: "3d ago",
  },
  {
    id: "SA-06",
    action: "Delete Service",
    module: "Services Desk",
    requires: "MFA + Super Admin",
    lastUsed: "7d ago",
  },
  {
    id: "SA-07",
    action: "Change Role Permissions",
    module: "Access Control",
    requires: "MFA + Super Admin",
    lastUsed: "1d ago",
  },
];

const SEC_ALERTS: SecAlert[] = [
  {
    id: "AL-7701",
    type: "Multiple Failed Logins",
    user: "priya@—",
    severity: "Medium",
    when: "1h ago",
    status: "Open",
  },
  {
    id: "AL-7702",
    type: "New Device Login",
    user: "vikram@—",
    severity: "Low",
    when: "3h ago",
    status: "Acknowledged",
  },
  {
    id: "AL-7703",
    type: "Password Changed",
    user: "anika@—",
    severity: "Low",
    when: "5h ago",
    status: "Resolved",
  },
  {
    id: "AL-7704",
    type: "MFA Disabled",
    user: "sub-admin@—",
    severity: "High",
    when: "6h ago",
    status: "Open",
  },
  {
    id: "AL-7705",
    type: "Admin Permission Changed",
    user: "super-admin@—",
    severity: "High",
    when: "1d ago",
    status: "Resolved",
  },
  {
    id: "AL-7706",
    type: "High Risk Login",
    user: "unknown@—",
    severity: "Critical",
    when: "6h ago",
    status: "Open",
  },
];

const SEC_HISTORY: SecHistoryRow[] = [
  {
    id: "SH-1",
    user: "Super Admin",
    event: "Login",
    ip: "10.4.12.1",
    device: "MacBook Pro",
    when: "Today · 09:12",
  },
  {
    id: "SH-2",
    user: "Anika Shah",
    event: "MFA Enabled",
    ip: "10.4.12.9",
    device: "MacBook Air",
    when: "Today · 08:45",
  },
  {
    id: "SH-3",
    user: "Riya S.",
    event: "Password Changed",
    ip: "49.207.11.44",
    device: "iPhone 15",
    when: "Yesterday",
  },
  {
    id: "SH-4",
    user: "Vikram R.",
    event: "Logout",
    ip: "10.4.12.14",
    device: "Windows 11",
    when: "Yesterday",
  },
  {
    id: "SH-5",
    user: "priya@—",
    event: "Login Failed",
    ip: "223.45.9.12",
    device: "iPhone 15",
    when: "1h ago",
  },
  {
    id: "SH-6",
    user: "unknown@—",
    event: "IP Blocked",
    ip: "45.83.201.9",
    device: "Unknown",
    when: "6h ago",
  },
];

const secRiskTone = (r: "Low" | "Medium" | "High" | "Critical") =>
  r === "Critical"
    ? "bg-rose-100 text-rose-800"
    : r === "High"
      ? "bg-rose-50 text-rose-700"
      : r === "Medium"
        ? "bg-amber-50 text-amber-700"
        : "bg-emerald-50 text-emerald-700";

const secStatusTone = (s: string) =>
  s === "Active" || s === "Resolved" || s === "Allowed" || s === "Allowlisted"
    ? "bg-emerald-50 text-emerald-700"
    : s === "Suspicious" || s === "Blocked" || s === "Restricted" || s === "Open"
      ? "bg-rose-50 text-rose-700"
      : s === "Idle" || s === "Acknowledged"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-700";

export const SecuritySection = () => {
  const [view, setView] = useState<SecKey>("dashboard");
  const [sessions, setSessions] = useState(SEC_SESSIONS);
  const [blockedIps, setBlockedIps] = useState(SEC_BLOCKED_IPS);
  const [alerts, setAlerts] = useState(SEC_ALERTS);

  const endSession = (id: string) => {
    setSessions((arr) => arr.filter((s) => s.id !== id));
    toast.success(`Session ${id} ended`, { duration: 2000 });
  };
  const forceLogout = (id: string) => {
    setSessions((arr) => arr.filter((s) => s.id !== id));
    toast.success(`Force logout issued for ${id}`, { duration: 2000 });
  };
  const blockSession = (id: string) => {
    setSessions((arr) => arr.map((s) => (s.id === id ? { ...s, status: "Blocked" } : s)));
    toast.success(`Session ${id} blocked`, { duration: 2000 });
  };
  const trustSession = (id: string) => {
    setSessions((arr) => arr.map((s) => (s.id === id ? { ...s, status: "Trusted" } : s)));
    toast.success(`Device marked trusted`, { duration: 2000 });
  };
  const removeBlockedIp = (id: string) => {
    setBlockedIps((arr) => arr.filter((r) => r.id !== id));
    toast.success(`Rule removed`, { duration: 2000 });
  };
  const ackAlert = (id: string) => {
    setAlerts((arr) => arr.map((a) => (a.id === id ? { ...a, status: "Acknowledged" } : a)));
    toast.success(`Alert ${id} acknowledged`, { duration: 2000 });
  };
  const resolveAlert = (id: string) => {
    setAlerts((arr) => arr.map((a) => (a.id === id ? { ...a, status: "Resolved" } : a)));
    toast.success(`Alert ${id} resolved`, { duration: 2000 });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Security"
        subtitle="Platform protection, authentication, threat monitoring & security operations. Independent of user, role & audit modules."
      />

      <div className="flex flex-wrap gap-2">
        {SEC_NAV.map((n) => {
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

      {view === "dashboard" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { l: "Security Score", v: "92 / 100", tone: "text-emerald-600" },
              {
                l: "Active Sessions",
                v: SEC_SESSIONS.filter((s) => s.status === "Active").length,
                tone: "text-primary-container",
              },
              { l: "Failed Logins Today", v: 14, tone: "text-rose-600" },
              { l: "Locked Accounts", v: 2, tone: "text-amber-600" },
              { l: "Suspicious Activity", v: SEC_THREATS.length, tone: "text-rose-600" },
              {
                l: "Critical Alerts",
                v: SEC_ALERTS.filter((a) => a.severity === "Critical").length,
                tone: "text-rose-700",
              },
              { l: "MFA Adoption", v: "78%", tone: "text-primary" },
              { l: "Password Expiry", v: 5, tone: "text-amber-600" },
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
              <p className="text-sm font-extrabold text-on-surface mb-3">Security Health</p>
              <div className="space-y-2">
                {[
                  { l: "Authentication Health", v: 96 },
                  { l: "Session Health", v: 88 },
                  { l: "Device Health", v: 91 },
                  { l: "Password Health", v: 82 },
                ].map((h) => (
                  <div key={h.l}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="text-on-surface-variant">{h.l}</span>
                      <span className="font-bold text-on-surface">{h.v}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${h.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <p className="text-sm font-extrabold text-on-surface mb-3">Latest Threats</p>
              <ul className="divide-y divide-surface-container-high/60">
                {SEC_THREATS.slice(0, 5).map((t) => (
                  <li key={t.id} className="py-2 flex items-center justify-between text-xs">
                    <span className="truncate">
                      <span className="font-bold">{t.type}</span> · {t.user}
                    </span>
                    <Badge tone={secRiskTone(t.risk)}>{t.risk}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {view === "auth" && (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              l: "Login Security",
              desc: "Rate-limit login attempts, block after failures, require CAPTCHA on risk.",
              chips: ["5 attempts / 15m", "CAPTCHA on risk", "Auto-lock 30m"],
            },
            {
              l: "Password Policies",
              desc: "Length, complexity, rotation and breach checks.",
              chips: ["Min 12 chars", "Rotate 90d", "Breach-check on"],
            },
            {
              l: "Multi-Factor Authentication",
              desc: "TOTP, backup codes and recovery contacts.",
              chips: ["78% adoption", "TOTP", "Backup codes"],
            },
            {
              l: "Session Management",
              desc: "Idle timeout, absolute timeout and remember-device.",
              chips: ["Idle 30m", "Absolute 12h", "Remember 30d"],
            },
          ].map((s) => (
            <Card key={s.l}>
              <p className="text-sm font-extrabold text-on-surface">{s.l}</p>
              <p className="text-xs text-on-surface-variant mt-1">{s.desc}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.chips.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex justify-end">
                <ActionBtn label="Configure" icon="settings" tone="neutral" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {view === "threats" && (
        <AudTable
          head={[
            "Threat ID",
            "Type",
            "User / Source",
            "IP / Path",
            "Count",
            "Risk",
            "When",
            "Action",
          ]}
          body={SEC_THREATS.map((t) => (
            <tr key={t.id} className="hover:bg-surface-container-low/60">
              <td className="px-3 py-2 font-mono text-[11px]">{t.id}</td>
              <td className="px-3 py-2 font-semibold">{t.type}</td>
              <td className="px-3 py-2">{t.user}</td>
              <td className="px-3 py-2 font-mono text-[11px]">{t.ip}</td>
              <td className="px-3 py-2">{t.count}</td>
              <td className="px-3 py-2">
                <Badge tone={secRiskTone(t.risk)}>{t.risk}</Badge>
              </td>
              <td className="px-3 py-2 text-outline">{t.when}</td>
              <td className="px-3 py-2">
                <div className="flex gap-1.5">
                  <ActionBtn label="Investigate" icon="search" tone="neutral" />
                  <ActionBtn
                    label="Block"
                    icon="block"
                    tone="neutral"
                    onClick={() => {
                      setBlockedIps((arr) => [
                        {
                          id: `IP-${Math.floor(Math.random() * 900) + 100}`,
                          ip: t.ip,
                          scope: "Blocked",
                          reason: `Threat ${t.id} · ${t.type}`,
                          addedBy: "Admin",
                          when: "Just now",
                        },
                        ...arr,
                      ]);
                      toast.success(`${t.ip} blocked`, { duration: 2000 });
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        />
      )}

      {view === "sessions" && (
        <AudTable
          head={[
            "User",
            "Device",
            "Browser",
            "OS",
            "IP",
            "Login",
            "Last Activity",
            "Status",
            "Action",
          ]}
          body={sessions.map((s) => (
            <tr key={s.id} className="hover:bg-surface-container-low/60">
              <td className="px-3 py-2 font-semibold">{s.user}</td>
              <td className="px-3 py-2">{s.device}</td>
              <td className="px-3 py-2">{s.browser}</td>
              <td className="px-3 py-2">{s.os}</td>
              <td className="px-3 py-2 font-mono text-[11px]">{s.ip}</td>
              <td className="px-3 py-2 text-outline">{s.login}</td>
              <td className="px-3 py-2 text-outline">{s.last}</td>
              <td className="px-3 py-2">
                <Badge tone={secStatusTone(s.status)}>{s.status}</Badge>
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1.5">
                  <ActionBtn
                    label="End"
                    icon="logout"
                    tone="neutral"
                    onClick={() => endSession(s.id)}
                  />
                  <ActionBtn
                    label="Force Logout"
                    icon="power_settings_new"
                    tone="neutral"
                    onClick={() => forceLogout(s.id)}
                  />
                  <ActionBtn
                    label="Block"
                    icon="block"
                    tone="neutral"
                    onClick={() => blockSession(s.id)}
                  />
                  <ActionBtn
                    label="Trust"
                    icon="verified_user"
                    tone="neutral"
                    onClick={() => trustSession(s.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        />
      )}

      {view === "ip" && (
        <div className="space-y-4">
          <AudTable
            head={["IP / Range", "Scope", "Reason", "Added By", "When", "Action"]}
            body={blockedIps.map((r) => (
              <tr key={r.id} className="hover:bg-surface-container-low/60">
                <td className="px-3 py-2 font-mono text-[11px]">{r.ip}</td>
                <td className="px-3 py-2">
                  <Badge tone={secStatusTone(r.scope)}>{r.scope}</Badge>
                </td>
                <td className="px-3 py-2">{r.reason}</td>
                <td className="px-3 py-2">{r.addedBy}</td>
                <td className="px-3 py-2 text-outline">{r.when}</td>
                <td className="px-3 py-2">
                  <ActionBtn
                    label="Remove"
                    icon="delete"
                    tone="neutral"
                    onClick={() => removeBlockedIp(r.id)}
                  />
                </td>
              </tr>
            ))}
          />
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <p className="text-sm font-extrabold text-on-surface mb-2">Country Restrictions</p>
              <div className="divide-y divide-surface-container-high/60">
                {SEC_COUNTRIES.map((c) => (
                  <div key={c.code} className="py-2 flex items-center justify-between text-xs">
                    <span>
                      <span className="font-mono text-[11px] text-outline mr-2">{c.code}</span>
                      {c.name}
                    </span>
                    <Badge tone={secStatusTone(c.policy)}>{c.policy}</Badge>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <p className="text-sm font-extrabold text-on-surface mb-2">Rate Limits</p>
              <ul className="text-xs space-y-2">
                <li className="flex justify-between">
                  <span className="text-on-surface-variant">Login (per IP)</span>
                  <span className="font-bold">5 / 15m</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-on-surface-variant">API (per token)</span>
                  <span className="font-bold">600 / min</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-on-surface-variant">OTP send</span>
                  <span className="font-bold">3 / 10m</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-on-surface-variant">Password reset</span>
                  <span className="font-bold">3 / hour</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {view === "sensitive" && (
        <AudTable
          head={["Action", "Module", "Requires", "Last Used", "Action"]}
          body={SEC_SENSITIVE.map((r) => (
            <tr key={r.id} className="hover:bg-surface-container-low/60">
              <td className="px-3 py-2 font-semibold">{r.action}</td>
              <td className="px-3 py-2">{r.module}</td>
              <td className="px-3 py-2">
                <Badge tone="bg-primary/10 text-primary">{r.requires}</Badge>
              </td>
              <td className="px-3 py-2 text-outline">{r.lastUsed}</td>
              <td className="px-3 py-2">
                <ActionBtn label="Configure" icon="settings" tone="neutral" />
              </td>
            </tr>
          ))}
        />
      )}

      {view === "alerts" && (
        <AudTable
          head={["Alert ID", "Type", "User", "Severity", "When", "Status", "Action"]}
          body={alerts.map((a) => (
            <tr key={a.id} className="hover:bg-surface-container-low/60">
              <td className="px-3 py-2 font-mono text-[11px]">{a.id}</td>
              <td className="px-3 py-2 font-semibold">{a.type}</td>
              <td className="px-3 py-2">{a.user}</td>
              <td className="px-3 py-2">
                <Badge tone={secRiskTone(a.severity)}>{a.severity}</Badge>
              </td>
              <td className="px-3 py-2 text-outline">{a.when}</td>
              <td className="px-3 py-2">
                <Badge tone={secStatusTone(a.status)}>{a.status}</Badge>
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-1.5">
                  <ActionBtn
                    label="Ack"
                    icon="check"
                    tone="neutral"
                    onClick={() => ackAlert(a.id)}
                  />
                  <ActionBtn
                    label="Resolve"
                    icon="task_alt"
                    tone="neutral"
                    onClick={() => resolveAlert(a.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        />
      )}

      {view === "history" && (
        <AudTable
          head={["User", "Event", "IP", "Device", "When"]}
          body={SEC_HISTORY.map((r) => (
            <tr key={r.id} className="hover:bg-surface-container-low/60">
              <td className="px-3 py-2 font-semibold">{r.user}</td>
              <td className="px-3 py-2">{r.event}</td>
              <td className="px-3 py-2 font-mono text-[11px]">{r.ip}</td>
              <td className="px-3 py-2">{r.device}</td>
              <td className="px-3 py-2 text-outline">{r.when}</td>
            </tr>
          ))}
        />
      )}

      {view === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { l: "Login Success Rate", v: "97.4%", tone: "text-emerald-600" },
              { l: "Login Failure Rate", v: "2.6%", tone: "text-rose-600" },
              { l: "MFA Usage", v: "78%", tone: "text-primary" },
              { l: "Active Devices", v: "1,842", tone: "text-primary-container" },
              { l: "Failed Login Trend (7d)", v: "▲ 12%", tone: "text-amber-600" },
              { l: "Risk Trend", v: "▼ 4%", tone: "text-emerald-600" },
              { l: "Threat Categories", v: 5, tone: "text-indigo-600" },
              { l: "Incidents (30d)", v: 3, tone: "text-rose-600" },
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
              <p className="text-sm font-extrabold text-on-surface mb-2">Incident Center</p>
              <p className="text-xs text-on-surface-variant mb-2">
                Investigation queue for detected incidents.
              </p>
              <ul className="divide-y divide-surface-container-high/60 text-xs">
                <li className="py-2 flex justify-between">
                  <span>Account Takeover · vikram@—</span>
                  <Badge tone={secRiskTone("High")}>High</Badge>
                </li>
                <li className="py-2 flex justify-between">
                  <span>Credential Leak · batch-2026-07</span>
                  <Badge tone={secRiskTone("Critical")}>Critical</Badge>
                </li>
                <li className="py-2 flex justify-between">
                  <span>Brute Force · priya@—</span>
                  <Badge tone={secRiskTone("Medium")}>Medium</Badge>
                </li>
              </ul>
            </Card>
            <Card>
              <p className="text-sm font-extrabold text-on-surface mb-2">Recovery Center</p>
              <p className="text-xs text-on-surface-variant mb-2">
                Fast actions if an account is compromised.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <ActionBtn
                  label="Force Logout All"
                  icon="power_settings_new"
                  tone="neutral"
                  disabled
                />
                <ActionBtn label="Reset MFA" icon="restart_alt" tone="neutral" disabled />
                <ActionBtn label="Reset Password" icon="password" tone="neutral" disabled />
                <ActionBtn label="Unlock Account" icon="lock_open" tone="neutral" disabled />
                <ActionBtn label="Revoke Tokens" icon="key_off" tone="neutral" disabled />
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySection;
