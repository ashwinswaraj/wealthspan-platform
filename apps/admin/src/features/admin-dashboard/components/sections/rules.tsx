import { useState } from "react";
import { CheckCircle2, FileText, Layers, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@jobrio/utils/utils";
import { SectionHeader, Card } from "@admin/features/admin-dashboard/components/sections";
import {
  Stat,
  Row,
  Badge,
  SectionTitle,
  AEIcon,
} from "@admin/features/admin-dashboard/components/sections-shared";

/* ============================================================
 * 10. PLATFORM RULES
 * ============================================================ */

type RuleLock = "system" | "super" | "readonly";
type RuleGroup =
  | "general"
  | "user_access"
  | "workforce"
  | "assignment"
  | "qa"
  | "finance"
  | "dispute"
  | "order"
  | "communication"
  | "security"
  | "automation"
  | "audit"
  | "flags";

type RuleItem = { name: string; value: string; lock: RuleLock; hint?: string };
type RuleGroupDef = {
  key: RuleGroup;
  label: string;
  icon: string;
  subtitle: string;
  items: RuleItem[];
};

const RULE_GROUPS: RuleGroupDef[] = [
  {
    key: "general",
    label: "General Settings",
    icon: "language",
    subtitle: "Platform-wide defaults",
    items: [
      { name: "Platform Timezone", value: "Asia / Kolkata (IST)", lock: "super" },
      { name: "Business Hours", value: "09:00 — 21:00", lock: "super" },
      { name: "Supported Currencies", value: "INR, USD, AED", lock: "super" },
      { name: "Supported Languages", value: "English, Hindi", lock: "super" },
      { name: "Date Format", value: "DD MMM YYYY", lock: "super" },
      { name: "Time Format", value: "12-hour", lock: "super" },
    ],
  },
  {
    key: "user_access",
    label: "User & Access Rules",
    icon: "manage_accounts",
    subtitle: "Auth, sessions & lock policy",
    items: [
      { name: "Password Min Length", value: "10 chars", lock: "super" },
      { name: "Password Complexity", value: "Upper + Lower + Number + Symbol", lock: "super" },
      { name: "Session Timeout", value: "30 minutes idle", lock: "super" },
      {
        name: "MFA Requirement",
        value: "Required for Admins",
        lock: "system",
        hint: "Hard-coded for compliance",
      },
      { name: "Login Restrictions", value: "Max 5 failed attempts / 15 min", lock: "super" },
      { name: "Default Role on Signup", value: "Client", lock: "super" },
      { name: "Account Auto-Lock", value: "After 5 failed attempts", lock: "super" },
    ],
  },
  {
    key: "workforce",
    label: "Workforce Rules",
    icon: "engineering",
    subtitle: "Trials, tiers and capacity",
    items: [
      { name: "Trial Task Limit", value: "3 trial tasks per applicant", lock: "super" },
      { name: "Trial Pass Threshold", value: "QA Score ≥ 80", lock: "super" },
      { name: "Trial Progression", value: "Auto-promote on 3 passes", lock: "super" },
      { name: "Quality Tier Thresholds", value: "Bronze 60 / Silver 75 / Gold 90", lock: "super" },
      { name: "Availability Rule", value: "Online required to receive offers", lock: "system" },
      { name: "Capacity Limit (Pro)", value: "5 active orders", lock: "super" },
      { name: "Workforce Status Rules", value: "Auto-suspend after 3 QA fails", lock: "super" },
    ],
  },
  {
    key: "assignment",
    label: "Assignment Rules",
    icon: "hub",
    subtitle: "Pool, match & retries",
    items: [
      { name: "Pool Limit", value: "12 professionals per pool", lock: "super" },
      { name: "Match Threshold", value: "Skill match ≥ 70%", lock: "super" },
      { name: "Request Timeout", value: "120 seconds per offer", lock: "super" },
      { name: "Pool Expiry", value: "30 minutes", lock: "super" },
      { name: "Retry Attempts", value: "3 rounds before manual", lock: "super" },
      { name: "Sequential Behaviour", value: "Highest-tier first", lock: "super" },
    ],
  },
  {
    key: "qa",
    label: "QA Rules",
    icon: "verified",
    subtitle: "Quality, rework and escalation",
    items: [
      { name: "Rework Limit", value: "Max 2 reworks per order", lock: "super" },
      { name: "QA Deadline", value: "12 hours after submission", lock: "super" },
      { name: "Auto-Fail Trigger", value: "Score < 40", lock: "super" },
      { name: "QA Scoring Bands", value: "Pass 70 / Rework 40 / Fail < 40", lock: "super" },
      { name: "QA Escalation Threshold", value: "3 reworks → Sr. QA", lock: "super" },
    ],
  },
  {
    key: "finance",
    label: "Finance & Escrow Rules",
    icon: "account_balance",
    subtitle: "Money movement policy",
    items: [
      { name: "Escrow Hold Period", value: "Until client approval", lock: "system" },
      { name: "Auto-Release Period", value: "72 hours after delivery", lock: "super" },
      { name: "Refund Approval Threshold", value: "Auto ≤ ₹500, Manual > ₹500", lock: "super" },
      { name: "Platform Commission", value: "18% of order value", lock: "super" },
      { name: "Tax (GST)", value: "18%", lock: "system", hint: "Statutory" },
      { name: "Invoice Numbering", value: "JR-INV-{YYYY}-{seq}", lock: "super" },
    ],
  },
  {
    key: "dispute",
    label: "Dispute Rules",
    icon: "gavel",
    subtitle: "Window, evidence & SLA",
    items: [
      { name: "Max Dispute Window", value: "7 days after delivery", lock: "super" },
      { name: "Evidence Requirement", value: "Min 1 attachment + reason", lock: "super" },
      { name: "Escalation Timing", value: "After 48h with no decision", lock: "super" },
      { name: "Default Resolution SLA", value: "5 business days", lock: "super" },
    ],
  },
  {
    key: "order",
    label: "Order Rules",
    icon: "assignment",
    subtitle: "Order lifecycle defaults",
    items: [
      { name: "Order Numbering", value: "JR-{seq}", lock: "system" },
      { name: "Auto-Cancel (Unpaid)", value: "24 hours", lock: "super" },
      { name: "Client Approval Window", value: "48 hours after delivery", lock: "super" },
      { name: "Rework Limit (Order)", value: "2 reworks", lock: "super" },
      { name: "Archive Timing", value: "90 days after completion", lock: "super" },
    ],
  },
  {
    key: "communication",
    label: "Communication Rules",
    icon: "campaign",
    subtitle: "Channels, retries & quiet hours",
    items: [
      { name: "Default Channels", value: "In-App + Email", lock: "super" },
      { name: "Email Enabled", value: "On", lock: "super" },
      { name: "SMS Enabled", value: "On (transactional only)", lock: "super" },
      { name: "Push Enabled", value: "On", lock: "super" },
      { name: "Retry Policy", value: "3 attempts, 5/15/30 min backoff", lock: "super" },
      { name: "Quiet Hours", value: "22:00 — 07:00 (non-critical)", lock: "super" },
      { name: "Rate Limit (per user)", value: "5 messages / hour", lock: "super" },
    ],
  },
  {
    key: "security",
    label: "Security Rules",
    icon: "shield",
    subtitle: "Hardening & approvals",
    items: [
      { name: "IP Restrictions (Admin)", value: "Allow-list only", lock: "super" },
      { name: "Device Verification", value: "Required on new device", lock: "super" },
      { name: "Audit Logging", value: "All admin actions logged", lock: "system" },
      { name: "API Security", value: "JWT + IP throttle", lock: "system" },
      {
        name: "Sensitive Action Approval",
        value: "Dual-admin for refunds > ₹10,000",
        lock: "super",
      },
    ],
  },
  {
    key: "automation",
    label: "Automation Rules",
    icon: "smart_toy",
    subtitle: "Background jobs & triggers",
    items: [
      { name: "Background Jobs", value: "Active (queue: default)", lock: "system" },
      { name: "Scheduled Automations", value: "Hourly + Daily + Weekly", lock: "super" },
      { name: "Event Triggers", value: "Order, QA, Finance, Dispute", lock: "super" },
      { name: "Auto Reminders", value: "T-24h, T-2h before SLA", lock: "super" },
      { name: "Auto Escalations", value: "On SLA breach", lock: "super" },
    ],
  },
  {
    key: "audit",
    label: "Audit & Change History",
    icon: "fact_check",
    subtitle: "Rule change ledger",
    items: [
      { name: "Change Log Retention", value: "365 days", lock: "system" },
      { name: "Rollback Support", value: "Enabled (last 30 changes)", lock: "super" },
      { name: "Approval for Rollback", value: "Required (Super Admin)", lock: "super" },
    ],
  },
  {
    key: "flags",
    label: "Feature Flags",
    icon: "science",
    subtitle: "Beta, rollout & A/B",
    items: [
      { name: "Beta Features", value: "QA AI Assist · Off", lock: "super" },
      { name: "Gradual Rollout", value: "Communication v2 · 25% users", lock: "super" },
      { name: "A/B Testing", value: "Active: 2 experiments", lock: "super" },
      { name: "Emergency Kill-Switch", value: "Available (Super Admin)", lock: "super" },
    ],
  },
];

const AUDIT_HISTORY = [
  {
    id: "RC-2041",
    admin: "Anika Shah",
    rule: "Auto-Release Period",
    from: "48 hours",
    to: "72 hours",
    group: "Finance & Escrow Rules",
    when: "Today · 10:42",
  },
  {
    id: "RC-2040",
    admin: "Vikram R.",
    rule: "Pool Limit",
    from: "10",
    to: "12",
    group: "Assignment Rules",
    when: "Yesterday · 18:11",
  },
  {
    id: "RC-2039",
    admin: "Aanya M.",
    rule: "Quiet Hours",
    from: "23:00 — 06:00",
    to: "22:00 — 07:00",
    group: "Communication Rules",
    when: "2d ago",
  },
  {
    id: "RC-2038",
    admin: "Rohan K.",
    rule: "Rework Limit",
    from: "1",
    to: "2",
    group: "QA Rules",
    when: "3d ago",
  },
];

const lockTone = (l: RuleLock) =>
  l === "system"
    ? "bg-rose-50 text-rose-700"
    : l === "super"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-slate-100 text-slate-700";

const lockLabel = (l: RuleLock) =>
  l === "system" ? "System Locked" : l === "super" ? "Super Admin Configurable" : "Read Only";

export const RulesSection = () => {
  const [group, setGroup] = useState<RuleGroup>("general");
  const g = RULE_GROUPS.find((x) => x.key === group)!;
  const total = RULE_GROUPS.reduce((s, gr) => s + gr.items.length, 0);
  const sysCount = RULE_GROUPS.flatMap((gr) => gr.items).filter((i) => i.lock === "system").length;
  const superCount = RULE_GROUPS.flatMap((gr) => gr.items).filter((i) => i.lock === "super").length;
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Platform Rules"
        subtitle="Global configurations that govern every workflow on Jobrio."
      />

      <Row cols={4}>
        <Stat
          label="Rule Groups"
          value={String(RULE_GROUPS.length)}
          icon={Layers}
          tint="bg-primary-container/10 text-primary-container"
        />
        <Stat
          label="Total Rules"
          value={String(total)}
          icon={FileText}
          tint="bg-indigo-500/10 text-indigo-600"
        />
        <Stat
          label="System Locked"
          value={String(sysCount)}
          icon={ShieldCheck}
          tint="bg-rose-500/10 text-rose-600"
        />
        <Stat
          label="Super Configurable"
          value={String(superCount)}
          icon={CheckCircle2}
          tint="bg-emerald-500/10 text-emerald-600"
        />
      </Row>

      <div className="flex flex-wrap gap-2">
        {RULE_GROUPS.map((r) => {
          const on = group === r.key;
          return (
            <button
              key={r.key}
              onClick={() => setGroup(r.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap",
                on
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface text-on-surface-variant border-outline-variant/40 hover:border-primary/40",
              )}
            >
              <AEIcon name={r.icon} />
              {r.label}
            </button>
          );
        })}
      </div>

      <Card>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-sm font-extrabold text-on-surface flex items-center gap-2">
              <AEIcon name={g.icon} /> {g.label}
            </p>
            <p className="text-xs text-outline mt-0.5">{g.subtitle}</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
            {g.items.length} rules
          </span>
        </div>
        <ul className="divide-y divide-surface-container-high/60">
          {g.items.map((it) => (
            <li key={it.name} className="py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface">{it.name}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{it.value}</p>
                {it.hint && <p className="text-[10px] text-outline italic mt-0.5">{it.hint}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={lockTone(it.lock)}>{lockLabel(it.lock)}</Badge>
                <button
                  disabled
                  className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full border",
                    it.lock === "super"
                      ? "text-primary border-primary/40 hover:bg-primary/5"
                      : "text-outline border-outline-variant/40 cursor-not-allowed",
                  )}
                >
                  {it.lock === "super" ? "Configure" : it.lock === "system" ? "Locked" : "View"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {group === "audit" && (
        <Card>
          <SectionTitle title="Recent Rule Changes" hint="Who changed what, when" />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-outline">
                <tr className="text-left">
                  <th className="py-2 pr-3">Change ID</th>
                  <th className="py-2 pr-3">Admin</th>
                  <th className="py-2 pr-3">Rule</th>
                  <th className="py-2 pr-3">Group</th>
                  <th className="py-2 pr-3">From</th>
                  <th className="py-2 pr-3">To</th>
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/60">
                {AUDIT_HISTORY.map((h) => (
                  <tr key={h.id}>
                    <td className="py-2 pr-3 font-bold text-on-surface">{h.id}</td>
                    <td className="py-2 pr-3">{h.admin}</td>
                    <td className="py-2 pr-3">{h.rule}</td>
                    <td className="py-2 pr-3 text-outline">{h.group}</td>
                    <td className="py-2 pr-3 text-rose-600">{h.from}</td>
                    <td className="py-2 pr-3 text-emerald-700 font-semibold">{h.to}</td>
                    <td className="py-2 pr-3 text-outline">{h.when}</td>
                    <td className="py-2 pr-3 text-right">
                      <button
                        disabled
                        className="text-[11px] font-bold text-primary hover:underline"
                      >
                        Rollback
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RulesSection;
