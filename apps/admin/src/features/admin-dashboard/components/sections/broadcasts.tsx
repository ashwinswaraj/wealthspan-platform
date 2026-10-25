import { useRef, useState } from "react";
import type React from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Layers,
  MousePointerClick,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@jobrio/ui/design-system";
import { cn } from "@jobrio/utils/utils";
import { addNotification } from "@jobrio/constants";
import { Card } from "@admin/features/admin-dashboard/components/sections";
import AuditListPage, {
  type AuditListTab,
  type AuditSortOption,
} from "@admin/features/admin-dashboard/components/AuditListPage";
import {
  Stat,
  Tabs,
  Row,
  Badge,
  AEIcon,
  InfoChip,
  ActionBtn,
} from "@admin/features/admin-dashboard/components/sections-shared";

/* ============================================================
 * COMMUNICATION CENTER — 6 modules
 * (Dashboard · Broadcasts · Automated Notifications · Templates ·
 *  Delivery Logs · Analytics)
 * ============================================================ */

type CCKey = "dashboard" | "broadcasts" | "automated" | "templates" | "logs";

const CC_NAV: { key: CCKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "broadcasts", label: "Broadcasts", icon: "campaign" },
  { key: "automated", label: "Automated Notifications", icon: "notifications_active" },
  { key: "templates", label: "Templates", icon: "palette" },
  { key: "logs", label: "Delivery Logs", icon: "outbox" },
];

/* ----- Broadcast data model ----- */

type BCAudience = "all" | "clients" | "professionals" | "admins";
type BCCategory =
  | "Announcement"
  | "Promotion"
  | "Reminder"
  | "Maintenance"
  | "Policy Update"
  | "Marketing"
  | "Emergency";
type BCStatus = "draft" | "scheduled" | "sending" | "sent" | "failed" | "cancelled";
type BCPriority = "low" | "normal" | "high" | "critical";

type BCRow = {
  id: string;
  title: string;
  category: BCCategory;
  audience: string;
  channel: string;
  createdBy: string;
  createdAt: string;
  scheduledAt?: string;
  sentAt?: string;
  status: BCStatus;
  total: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
};

const BC_CATEGORIES: BCCategory[] = [
  "Announcement",
  "Promotion",
  "Reminder",
  "Maintenance",
  "Policy Update",
  "Marketing",
  "Emergency",
];

const INITIAL_BC: BCRow[] = [
  {
    id: "B-211",
    title: "Scheduled maintenance Sat 2AM IST",
    category: "Maintenance",
    audience: "All Users",
    channel: "Email + In-App",
    createdBy: "Aanya M.",
    createdAt: "Today · 10:14",
    sentAt: "Today · 10:14",
    status: "sending",
    total: 12494,
    delivered: 8120,
    failed: 142,
    opened: 4210,
    clicked: 980,
  },
  {
    id: "B-210",
    title: "Festive credits added to wallet",
    category: "Promotion",
    audience: "Clients",
    channel: "Email",
    createdBy: "Rohan K.",
    createdAt: "Today · 09:02",
    sentAt: "Today · 09:02",
    status: "sent",
    total: 8210,
    delivered: 8174,
    failed: 36,
    opened: 4280,
    clicked: 1120,
  },
  {
    id: "B-209",
    title: "New trial flow live for applicants",
    category: "Announcement",
    audience: "Professionals",
    channel: "Push + In-App",
    createdBy: "Aanya M.",
    createdAt: "Yesterday · 18:40",
    sentAt: "Yesterday · 18:40",
    status: "sent",
    total: 4270,
    delivered: 4188,
    failed: 82,
    opened: 2980,
    clicked: 612,
  },
  {
    id: "B-208",
    title: "Updated dispute policy rollout",
    category: "Policy Update",
    audience: "All Users",
    channel: "In-App",
    createdBy: "Vikram R.",
    createdAt: "Yesterday · 12:11",
    scheduledAt: "Tomorrow · 09:00",
    status: "scheduled",
    total: 12494,
    delivered: 0,
    failed: 0,
    opened: 0,
    clicked: 0,
  },
  {
    id: "B-207",
    title: "Internal admin briefing",
    category: "Announcement",
    audience: "Admins",
    channel: "Email",
    createdBy: "Anika S.",
    createdAt: "2d ago",
    status: "draft",
    total: 24,
    delivered: 0,
    failed: 0,
    opened: 0,
    clicked: 0,
  },
  {
    id: "B-206",
    title: "Service price update",
    category: "Policy Update",
    audience: "Professionals",
    channel: "Email",
    createdBy: "Rohan K.",
    createdAt: "3d ago",
    sentAt: "3d ago",
    status: "failed",
    total: 4270,
    delivered: 1020,
    failed: 3250,
    opened: 410,
    clicked: 60,
  },
  {
    id: "B-205",
    title: "Beta program invite",
    category: "Marketing",
    audience: "Clients",
    channel: "Email + Push",
    createdBy: "Aanya M.",
    createdAt: "5d ago",
    status: "cancelled",
    total: 8210,
    delivered: 0,
    failed: 0,
    opened: 0,
    clicked: 0,
  },
];

const bcTone = (s: BCStatus) =>
  s === "draft"
    ? "bg-slate-100 text-slate-700"
    : s === "scheduled"
      ? "bg-amber-50 text-amber-700"
      : s === "sending"
        ? "bg-primary-container/10 text-primary-container"
        : s === "sent"
          ? "bg-emerald-50 text-emerald-700"
          : s === "failed"
            ? "bg-rose-50 text-rose-700"
            : "bg-zinc-100 text-zinc-700";

const bcLabel = (s: BCStatus) =>
  s === "draft"
    ? "Draft"
    : s === "scheduled"
      ? "Scheduled"
      : s === "sending"
        ? "Sending"
        : s === "sent"
          ? "Sent"
          : s === "failed"
            ? "Failed"
            : "Cancelled";

/* ----- Automated notifications data ----- */

type ANCategory =
  "Orders" | "Assignment" | "QA" | "Finance & Escrow" | "Disputes" | "Workforce" | "Security";
type ANChannel = "in_app" | "email" | "sms" | "push";

type ANEvent = {
  id: string;
  event: string;
  category: ANCategory;
  subject: string;
  message: string;
  variables: string[];
  channels: Record<ANChannel, boolean>;
  active: boolean;
  triggers: number;
  lastFired: string;
};

const INITIAL_AN: ANEvent[] = [
  {
    id: "EV-01",
    event: "Order Approved",
    category: "Orders",
    subject: "Your order {{Order ID}} is approved",
    message: "Hi {{User Name}}, your order {{Order ID}} for {{Service Name}} has been approved.",
    variables: ["User Name", "Order ID", "Service Name"],
    channels: { in_app: true, email: true, sms: false, push: true },
    active: true,
    triggers: 1284,
    lastFired: "2m ago",
  },
  {
    id: "EV-02",
    event: "Invoice Generated",
    category: "Orders",
    subject: "Invoice {{Invoice Number}} generated",
    message: "Invoice {{Invoice Number}} of ₹{{Amount}} for {{Order ID}} is ready.",
    variables: ["Invoice Number", "Order ID", "Amount"],
    channels: { in_app: true, email: true, sms: false, push: false },
    active: true,
    triggers: 1102,
    lastFired: "5m ago",
  },
  {
    id: "EV-03",
    event: "Payment Received",
    category: "Finance & Escrow",
    subject: "Payment received for {{Order ID}}",
    message: "We received your payment of ₹{{Amount}} for {{Order ID}}.",
    variables: ["User Name", "Order ID", "Amount"],
    channels: { in_app: true, email: true, sms: true, push: true },
    active: true,
    triggers: 980,
    lastFired: "8m ago",
  },
  {
    id: "EV-04",
    event: "Assignment Started",
    category: "Assignment",
    subject: "Assignment started — {{Order ID}}",
    message: "Assignment for {{Order ID}} has started broadcasting to professionals.",
    variables: ["Order ID"],
    channels: { in_app: true, email: false, sms: false, push: false },
    active: true,
    triggers: 870,
    lastFired: "12m ago",
  },
  {
    id: "EV-05",
    event: "Assignment Accepted",
    category: "Assignment",
    subject: "{{Professional Name}} accepted your order",
    message: "{{Professional Name}} accepted {{Order ID}}. Work will begin shortly.",
    variables: ["Professional Name", "Order ID", "Client Name"],
    channels: { in_app: true, email: true, sms: false, push: true },
    active: true,
    triggers: 812,
    lastFired: "20m ago",
  },
  {
    id: "EV-06",
    event: "Work Started",
    category: "Assignment",
    subject: "Work started on {{Order ID}}",
    message: "{{Professional Name}} has started work on {{Order ID}}.",
    variables: ["Professional Name", "Order ID"],
    channels: { in_app: true, email: false, sms: false, push: true },
    active: true,
    triggers: 730,
    lastFired: "32m ago",
  },
  {
    id: "EV-07",
    event: "QA Passed",
    category: "QA",
    subject: "QA passed for {{Order ID}}",
    message: "Your delivery for {{Order ID}} has passed QA.",
    variables: ["Order ID"],
    channels: { in_app: true, email: true, sms: false, push: true },
    active: true,
    triggers: 612,
    lastFired: "48m ago",
  },
  {
    id: "EV-08",
    event: "QA Failed",
    category: "QA",
    subject: "QA review needed for {{Order ID}}",
    message: "Your delivery for {{Order ID}} needs rework.",
    variables: ["Order ID"],
    channels: { in_app: true, email: true, sms: false, push: false },
    active: true,
    triggers: 142,
    lastFired: "1h ago",
  },
  {
    id: "EV-09",
    event: "Order Delivered",
    category: "Orders",
    subject: "Order {{Order ID}} delivered",
    message: "Hi {{Client Name}}, your order {{Order ID}} is delivered.",
    variables: ["Client Name", "Order ID"],
    channels: { in_app: true, email: true, sms: true, push: true },
    active: true,
    triggers: 590,
    lastFired: "1h ago",
  },
  {
    id: "EV-10",
    event: "Escrow Released",
    category: "Finance & Escrow",
    subject: "Escrow released for {{Order ID}}",
    message: "Funds of ₹{{Amount}} released to {{Professional Name}} for {{Order ID}}.",
    variables: ["Professional Name", "Order ID", "Amount"],
    channels: { in_app: true, email: true, sms: false, push: false },
    active: true,
    triggers: 487,
    lastFired: "2h ago",
  },
  {
    id: "EV-11",
    event: "Refund Initiated",
    category: "Finance & Escrow",
    subject: "Refund initiated for {{Order ID}}",
    message: "Refund of ₹{{Amount}} initiated for {{Order ID}}.",
    variables: ["Order ID", "Amount"],
    channels: { in_app: true, email: true, sms: true, push: false },
    active: true,
    triggers: 64,
    lastFired: "3h ago",
  },
  {
    id: "EV-12",
    event: "Dispute Opened",
    category: "Disputes",
    subject: "Dispute opened on {{Order ID}}",
    message: "A dispute has been opened on {{Order ID}}. Our team will review shortly.",
    variables: ["Order ID"],
    channels: { in_app: true, email: true, sms: false, push: true },
    active: true,
    triggers: 38,
    lastFired: "4h ago",
  },
  {
    id: "EV-13",
    event: "Password Changed",
    category: "Security",
    subject: "Your password was changed",
    message: "Hi {{User Name}}, your password was changed.",
    variables: ["User Name"],
    channels: { in_app: true, email: true, sms: true, push: false },
    active: true,
    triggers: 210,
    lastFired: "5h ago",
  },
  {
    id: "EV-14",
    event: "Login Alert",
    category: "Security",
    subject: "New sign-in to your account",
    message: "Hi {{User Name}}, a new sign-in was detected.",
    variables: ["User Name"],
    channels: { in_app: false, email: true, sms: false, push: true },
    active: true,
    triggers: 1820,
    lastFired: "Just now",
  },
  {
    id: "EV-15",
    event: "Professional Onboarded",
    category: "Workforce",
    subject: "Welcome to Jobrio, {{Professional Name}}",
    message: "Welcome {{Professional Name}}! Your profile is live.",
    variables: ["Professional Name"],
    channels: { in_app: true, email: true, sms: false, push: false },
    active: true,
    triggers: 96,
    lastFired: "1d ago",
  },
];

const AN_CATEGORIES: ANCategory[] = [
  "Orders",
  "Assignment",
  "QA",
  "Finance & Escrow",
  "Disputes",
  "Workforce",
  "Security",
];

/* ----- Templates ----- */

type TplRow = {
  id: string;
  name: string;
  category: string;
  title: string;
  message: string;
  archived?: boolean;
};

const TEMPLATE_CATEGORIES = [
  "Welcome",
  "Announcement",
  "Marketing",
  "Maintenance",
  "Hiring",
  "Assignment",
  "QA",
  "Orders",
  "Finance & Escrow",
  "Disputes",
  "Policy",
  "Security",
];

const INITIAL_TPL: TplRow[] = [
  {
    id: "TPL-01",
    name: "Welcome Email",
    category: "Welcome",
    title: "Welcome to Jobrio, {{User Name}}",
    message: "Hi {{User Name}}, glad to have you on board.",
  },
  {
    id: "TPL-02",
    name: "Order Approved",
    category: "Orders",
    title: "Your order {{Order ID}} is approved",
    message: "Hi {{User Name}}, your order has been approved.",
  },
  {
    id: "TPL-03",
    name: "Payment Received",
    category: "Finance & Escrow",
    title: "Payment received for {{Order ID}}",
    message: "Payment of ₹{{Amount}} received.",
  },
  {
    id: "TPL-04",
    name: "QA Passed",
    category: "QA",
    title: "QA passed for {{Order ID}}",
    message: "Your delivery has passed QA.",
  },
  {
    id: "TPL-05",
    name: "Dispute Opened",
    category: "Disputes",
    title: "Dispute opened on {{Order ID}}",
    message: "A dispute has been opened.",
  },
  {
    id: "TPL-06",
    name: "Escrow Released",
    category: "Finance & Escrow",
    title: "Escrow released for {{Order ID}}",
    message: "Funds released to professional.",
  },
  {
    id: "TPL-07",
    name: "Marketing — Festival",
    category: "Marketing",
    title: "Festive offers inside",
    message: "Exclusive offers this week.",
  },
  {
    id: "TPL-08",
    name: "Maintenance Notice",
    category: "Maintenance",
    title: "Scheduled downtime",
    message: "Platform will be down for maintenance.",
  },
  {
    id: "TPL-09",
    name: "Policy Update",
    category: "Policy",
    title: "Updated platform policies",
    message: "Our policies have been updated.",
  },
];

/* ----- Delivery logs ----- */

type LogChannel = "Email" | "SMS" | "Push" | "In-App";
type LogStatus = "Queued" | "Sent" | "Delivered" | "Failed" | "Read" | "Clicked";
type LogRow = {
  id: string;
  recipient: string;
  source: string; // broadcast id or event
  channel: LogChannel;
  status: LogStatus;
  deliveredAt: string;
  openedAt?: string;
  clickedAt?: string;
  failureReason?: string;
  retries: number;
  lastRetry?: string;
};

const FAIL_REASONS = [
  "Invalid Email",
  "Invalid Phone",
  "Push Disabled",
  "Delivery Timeout",
  "Server Failure",
];

const INITIAL_LOGS: LogRow[] = [
  {
    id: "LOG-9001",
    recipient: "amit@gmail.com",
    source: "B-211",
    channel: "Email",
    status: "Delivered",
    deliveredAt: "10:14",
    openedAt: "10:16",
    retries: 0,
  },
  {
    id: "LOG-9002",
    recipient: "priya@yahoo.com",
    source: "B-211",
    channel: "Email",
    status: "Failed",
    deliveredAt: "10:14",
    failureReason: "Invalid Email",
    retries: 2,
    lastRetry: "10:18",
  },
  {
    id: "LOG-9003",
    recipient: "Push · device-x281",
    source: "EV-05",
    channel: "Push",
    status: "Clicked",
    deliveredAt: "09:31",
    openedAt: "09:32",
    clickedAt: "09:33",
    retries: 0,
  },
  {
    id: "LOG-9004",
    recipient: "+91 99**** 8821",
    source: "EV-13",
    channel: "SMS",
    status: "Sent",
    deliveredAt: "09:12",
    retries: 0,
  },
  {
    id: "LOG-9005",
    recipient: "In-App · user 4129",
    source: "EV-01",
    channel: "In-App",
    status: "Read",
    deliveredAt: "08:54",
    openedAt: "08:55",
    retries: 0,
  },
  {
    id: "LOG-9006",
    recipient: "rakesh@outlook.com",
    source: "B-210",
    channel: "Email",
    status: "Delivered",
    deliveredAt: "Yesterday",
    openedAt: "Yesterday",
    retries: 0,
  },
  {
    id: "LOG-9007",
    recipient: "Push · device-a991",
    source: "EV-04",
    channel: "Push",
    status: "Failed",
    deliveredAt: "Yesterday",
    failureReason: "Push Disabled",
    retries: 1,
    lastRetry: "Yesterday",
  },
  {
    id: "LOG-9008",
    recipient: "neha@gmail.com",
    source: "B-206",
    channel: "Email",
    status: "Failed",
    deliveredAt: "3d ago",
    failureReason: "Server Failure",
    retries: 3,
    lastRetry: "3d ago",
  },
  {
    id: "LOG-9009",
    recipient: "+91 88**** 1190",
    source: "EV-11",
    channel: "SMS",
    status: "Delivered",
    deliveredAt: "3d ago",
    retries: 0,
  },
  {
    id: "LOG-9010",
    recipient: "In-App · user 5512",
    source: "EV-07",
    channel: "In-App",
    status: "Clicked",
    deliveredAt: "1h ago",
    openedAt: "1h ago",
    clickedAt: "1h ago",
    retries: 0,
  },
  {
    id: "LOG-9011",
    recipient: "kunal@gmail.com",
    source: "B-209",
    channel: "Email",
    status: "Queued",
    deliveredAt: "—",
    retries: 0,
  },
  {
    id: "LOG-9012",
    recipient: "asha@hotmail.com",
    source: "B-210",
    channel: "Email",
    status: "Read",
    deliveredAt: "Yesterday",
    openedAt: "Yesterday",
    retries: 0,
  },
];

const logTone = (s: LogStatus) =>
  s === "Queued"
    ? "bg-slate-100 text-slate-700"
    : s === "Sent"
      ? "bg-primary-container/10 text-primary-container"
      : s === "Delivered"
        ? "bg-emerald-50 text-emerald-700"
        : s === "Read"
          ? "bg-violet-50 text-violet-700"
          : s === "Clicked"
            ? "bg-indigo-50 text-indigo-700"
            : "bg-rose-50 text-rose-700";

/* ============================================================
 * 1. DASHBOARD VIEW
 * ============================================================ */

const CCDashboardView = ({
  rows,
  events,
  templates,
  logs,
  onJump,
}: {
  rows: BCRow[];
  events: ANEvent[];
  templates: TplRow[];
  logs: LogRow[];
  onJump: (k: CCKey) => void;
}) => {
  const totalBC = rows.length;
  const totalAN = events.reduce((s, e) => s + e.triggers, 0);
  const sentToday = rows.filter((r) => r.createdAt.startsWith("Today")).length;
  const scheduled = rows.filter((r) => r.status === "scheduled").length;
  const drafts = rows.filter((r) => r.status === "draft").length;
  const failed = logs.filter((l) => l.status === "Failed").length;
  const delivered = logs.filter((l) => ["Delivered", "Read", "Clicked"].includes(l.status)).length;
  const opened = logs.filter((l) => l.openedAt).length;
  const clicked = logs.filter((l) => l.clickedAt).length;
  const tpl = templates.filter((t) => !t.archived).length;
  const total = Math.max(1, logs.length);
  const dRate = Math.round((delivered / total) * 100);
  const oRate = Math.round((opened / total) * 100);
  const cRate = Math.round((clicked / total) * 100);
  const recent = rows.slice(0, 4);
  return (
    <div className="space-y-4">
      <Row cols={4}>
        <Stat
          label="Total Broadcasts"
          value={String(totalBC)}
          icon={FileText}
          tint="bg-primary-container/10 text-primary-container"
        />
        <Stat
          label="Automated Notifications"
          value={totalAN.toLocaleString()}
          icon={Bell}
          tint="bg-violet-500/10 text-violet-600"
        />
        <Stat
          label="Sent Today"
          value={String(sentToday)}
          icon={Send}
          tint="bg-emerald-500/10 text-emerald-600"
        />
        <Stat
          label="Scheduled"
          value={String(scheduled)}
          icon={Clock}
          tint="bg-amber-500/10 text-amber-600"
        />
      </Row>
      <Row cols={4}>
        <Stat
          label="Drafts"
          value={String(drafts)}
          icon={FileText}
          tint="bg-slate-500/10 text-slate-600"
        />
        <Stat
          label="Failed Deliveries"
          value={String(failed)}
          icon={AlertTriangle}
          tint="bg-rose-500/10 text-rose-600"
        />
        <Stat
          label="Delivery Rate"
          value={`${dRate}%`}
          icon={CheckCircle2}
          tint="bg-emerald-500/10 text-emerald-600"
        />
        <Stat
          label="Active Templates"
          value={String(tpl)}
          icon={Layers}
          tint="bg-indigo-500/10 text-indigo-600"
        />
      </Row>
      <Row cols={3}>
        <Stat
          label="Open Rate"
          value={`${oRate}%`}
          icon={Eye}
          tint="bg-violet-500/10 text-violet-600"
        />
        <Stat
          label="Click Rate"
          value={`${cRate}%`}
          icon={MousePointerClick}
          tint="bg-indigo-500/10 text-indigo-600"
        />
        <Stat
          label="Delivery Success"
          value={`${dRate}%`}
          icon={CheckCircle2}
          tint="bg-emerald-500/10 text-emerald-600"
        />
      </Row>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="!p-4">
          <p className="text-sm font-extrabold text-on-surface">Communication Insights</p>
          <ul className="mt-3 space-y-1.5 text-xs text-on-surface-variant">
            <li>
              • Most Used Channel — <span className="font-bold text-on-surface">Email</span>
            </li>
            <li>
              • Most Active Audience — <span className="font-bold text-on-surface">Clients</span>
            </li>
            <li>
              • Highest Open Rate —{" "}
              <span className="font-bold text-on-surface">In-App ({oRate}%)</span>
            </li>
            <li>
              • Delivery Success Rate — <span className="font-bold text-on-surface">{dRate}%</span>
            </li>
            <li>
              • Recent Failures — <span className="font-bold text-rose-600">{failed}</span>
            </li>
          </ul>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold text-on-surface">Recent Broadcast Activity</p>
            <button
              onClick={() => onJump("broadcasts")}
              className="text-[11px] font-bold text-primary hover:underline"
            >
              View all →
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface truncate">{r.title}</p>
                  <p className="text-outline">
                    {r.id} · {r.audience} · {r.createdAt}
                  </p>
                </div>
                <Badge tone={bcTone(r.status)}>{bcLabel(r.status)}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

/* ============================================================
 * 2. BROADCASTS VIEW (list + create flow)
 * ============================================================ */

type BCFilter = "all" | "draft" | "scheduled" | "sent";

const BroadcastsListView = ({
  rows,
  onCreate,
  setRows,
  f,
}: {
  rows: BCRow[];
  onCreate: () => void;
  setRows: React.Dispatch<React.SetStateAction<BCRow[]>>;
  f: BCFilter;
}) => {
  const list = rows.filter((r) => {
    if (f === "all") return true;
    if (f === "sent") return r.status === "sent" || r.status === "sending";
    return r.status === f;
  });
  const cancel = (id: string) =>
    setRows((s) => s.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r)));
  const duplicate = (id: string) => {
    const orig = rows.find((r) => r.id === id);
    if (!orig) return;
    const copy: BCRow = {
      ...orig,
      id: `B-${Math.floor(Math.random() * 900) + 300}`,
      status: "draft",
      delivered: 0,
      failed: 0,
      opened: 0,
      clicked: 0,
      createdAt: "Just now",
      sentAt: undefined,
      scheduledAt: undefined,
    };
    setRows((s) => [copy, ...s]);
    toast.success(`Duplicated as ${copy.id}`);
  };
  const remove = (id: string) => {
    setRows((s) => s.filter((r) => r.id !== id));
    toast.success("Draft deleted");
  };
  return (
    <div className="space-y-4">
      {list.map((r) => (
        <Card key={r.id} className="!p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-extrabold text-on-surface">{r.id}</p>
                <Badge tone={bcTone(r.status)}>{bcLabel(r.status)}</Badge>
                <Badge tone="bg-indigo-50 text-indigo-700">{r.category}</Badge>
              </div>
              <p className="text-xs text-on-surface mt-0.5 font-semibold">{r.title}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            <InfoChip k="Audience" v={r.audience} />
            <InfoChip k="Channels" v={r.channel} />
            <InfoChip k="Created By" v={r.createdBy} />
            <InfoChip k="Created" v={r.createdAt} />
            {r.scheduledAt && <InfoChip k="Scheduled" v={r.scheduledAt} />}
            {r.sentAt && <InfoChip k="Sent" v={r.sentAt} />}
          </div>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <ActionBtn label="View" icon="visibility" tone="neutral" />
            {(r.status === "draft" || r.status === "scheduled") && (
              <ActionBtn label="Edit · Coming Soon" icon="edit" tone="neutral" />
            )}
            <ActionBtn
              label="Duplicate"
              icon="content_copy"
              tone="neutral"
              onClick={() => duplicate(r.id)}
            />
            {r.status === "scheduled" && (
              <ActionBtn
                label="Cancel Schedule"
                icon="event_busy"
                tone="neutral"
                onClick={() => cancel(r.id)}
              />
            )}
            {r.status === "draft" && (
              <ActionBtn
                label="Delete Draft"
                icon="delete"
                tone="neutral"
                onClick={() => remove(r.id)}
              />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

const CreateBroadcastView = ({
  onCancel,
  onCreated,
  templates,
}: {
  onCancel: () => void;
  onCreated: (row: BCRow) => void;
  templates: TplRow[];
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  // Step 1
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<BCCategory>("Announcement");
  const [notes, setNotes] = useState("");
  // Step 2
  const [audience, setAudience] = useState<BCAudience>("all");
  const [advClient, setAdvClient] = useState<string[]>([]);
  const [advPro, setAdvPro] = useState<string[]>([]);
  const [advAdmin, setAdvAdmin] = useState<string[]>([]);
  const [customIds, setCustomIds] = useState("");
  // Step 3
  const [subject, setSubject] = useState("");
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [cta, setCta] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const attachmentRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const pickAttachment = (accept: string) => {
    if (!attachmentRef.current) return;
    attachmentRef.current.accept = accept;
    attachmentRef.current.click();
  };
  const [tplId, setTplId] = useState("");
  // Step 4
  const [channels, setChannels] = useState<Record<ANChannel, boolean>>({
    in_app: true,
    email: false,
    push: false,
    sms: false,
  });
  const [priority, setPriority] = useState<BCPriority>("normal");
  // Step 5
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile" | "email" | "notif">(
    "mobile",
  );
  const [whenMode, setWhenMode] = useState<"now" | "schedule">("now");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");

  const fieldCls =
    "mt-1 w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30";

  const audienceLabel =
    audience === "all"
      ? "All Users"
      : audience === "clients"
        ? "Clients"
        : audience === "professionals"
          ? "Professionals"
          : "Admins";
  const chanList: { key: ANChannel; label: string }[] = [
    { key: "in_app", label: "In-App" },
    { key: "email", label: "Email" },
    { key: "sms", label: "SMS" },
    { key: "push", label: "Push Notification" },
  ];
  const channelLabel =
    Object.entries(channels)
      .filter(([, on]) => on)
      .map(([k]) =>
        k === "in_app" ? "In-App" : k === "email" ? "Email" : k === "push" ? "Push" : "SMS",
      )
      .join(" + ") || "—";

  const applyTemplate = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setTplId(id);
    setSubject(t.title);
    setBody(t.message);
    setHeading(t.title);
    toast.success(`Template applied: ${t.name}`);
  };

  const buildRow = (status: BCStatus): BCRow => ({
    id: `B-${Math.floor(Math.random() * 900) + 300}`,
    title: title || "Untitled Broadcast",
    category,
    audience: audienceLabel,
    channel: channelLabel,
    createdBy: "You",
    createdAt: "Just now",
    scheduledAt: status === "scheduled" ? `${date || "—"} · ${time}` : undefined,
    sentAt: status === "sending" || status === "sent" ? "Just now" : undefined,
    status,
    total:
      audience === "admins"
        ? 24
        : audience === "clients"
          ? 8210
          : audience === "professionals"
            ? 4270
            : 12494,
    delivered: 0,
    failed: 0,
    opened: 0,
    clicked: 0,
  });

  const validate = (): string | null => {
    if (!title.trim()) return "Missing Title";
    if (!subject.trim()) return "Missing Subject";
    if (!body.trim()) return "Empty Message";
    if (ctaUrl && !/^https?:\/\/|^\//.test(ctaUrl)) return "Invalid Links";
    if (!Object.values(channels).some(Boolean)) return "No delivery channel selected";
    return null;
  };

  const finalize = (status: BCStatus) => {
    if (status !== "draft") {
      const err = validate();
      if (err) {
        toast.error(err);
        return;
      }
      if (status === "scheduled" && !date) {
        toast.error("Pick a schedule date");
        return;
      }
    }
    onCreated(buildRow(status));

    // "Send Now" — actually deliver an in-app notification into the real
    // client/professional Notifications feed for the selected audience.
    if (status === "sending" && (audience === "all" || audience === "clients")) {
      addNotification({
        type: "system",
        title: heading.trim() || title.trim(),
        body: body.trim(),
      });
    }

    toast.success(
      status === "draft"
        ? "Draft saved"
        : status === "scheduled"
          ? "Broadcast scheduled"
          : "Broadcast queued for delivery",
    );
  };

  const StepHeader = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="flex items-center gap-1.5">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                step === n
                  ? "bg-primary text-on-primary"
                  : step > n
                    ? "bg-emerald-500 text-white"
                    : "bg-surface-container-low text-outline border border-outline-variant/40",
              )}
            >
              {step > n ? "✓" : n}
            </div>
            {n < 5 && (
              <div
                className={cn("w-6 h-0.5", step > n ? "bg-emerald-500" : "bg-outline-variant/40")}
              />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={onCancel}
        aria-label="Close"
        className="w-8 h-8 flex items-center justify-center rounded-full text-outline hover:text-on-surface hover:bg-surface-container-low"
      >
        <X size={16} />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <StepHeader />

      {step === 1 && (
        <Card className="!p-4 space-y-3">
          <p className="text-sm font-extrabold text-on-surface">Step 1 · Basic Information</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                Broadcast Title
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Festive credits live"
                className={fieldCls}
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                Category
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BCCategory)}
                className={fieldCls}
              >
                {BC_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                Internal Notes
              </span>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Visible only to admins"
                className={fieldCls}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <ActionBtn
              label="Next: Audience"
              icon="arrow_forward"
              tone="primary"
              onClick={() => setStep(2)}
            />
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="!p-4 space-y-4">
          <p className="text-sm font-extrabold text-on-surface">Step 2 · Audience Selection</p>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
              User Types
            </span>
            <div className="mt-2">
              <Tabs<BCAudience>
                value={audience}
                onChange={setAudience}
                tabs={[
                  { key: "all", label: "All Users" },
                  { key: "clients", label: "Clients" },
                  { key: "professionals", label: "Professionals" },
                  { key: "admins", label: "Admins" },
                ]}
              />
            </div>
          </div>

          {(audience === "all" || audience === "clients") && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-outline">
                Client Filters
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Active", "Premium", "New"].map((t) => {
                  const on = advClient.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setAdvClient((s) => (on ? s.filter((x) => x !== t) : [...s, t]))
                      }
                      className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-semibold border",
                        on
                          ? "bg-primary text-on-primary border-primary"
                          : "bg-surface text-on-surface-variant border-outline-variant/40",
                      )}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(audience === "all" || audience === "professionals") && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-outline">
                Professional Filters
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  "Available",
                  "Busy",
                  "Standard Tier",
                  "Premium Tier",
                  "Elite Tier",
                  "Categories",
                  "Skills",
                ].map((t) => {
                  const on = advPro.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAdvPro((s) => (on ? s.filter((x) => x !== t) : [...s, t]))}
                      className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-semibold border",
                        on
                          ? "bg-primary text-on-primary border-primary"
                          : "bg-surface text-on-surface-variant border-outline-variant/40",
                      )}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(audience === "all" || audience === "admins") && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-outline">
                Admin Roles
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Operations", "QA", "Finance & Escrow", "Assignment", "Support"].map((t) => {
                  const on = advAdmin.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setAdvAdmin((s) => (on ? s.filter((x) => x !== t) : [...s, t]))
                      }
                      className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-semibold border",
                        on
                          ? "bg-primary text-on-primary border-primary"
                          : "bg-surface text-on-surface-variant border-outline-variant/40",
                      )}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
              Custom Audience (User IDs · Emails · Phones, comma separated)
            </span>
            <textarea
              rows={2}
              value={customIds}
              onChange={(e) => setCustomIds(e.target.value)}
              placeholder="u_12, amit@gmail.com, +91 99...."
              className={fieldCls}
            />
          </div>

          <div className="flex justify-between">
            <ActionBtn label="Back" icon="arrow_back" tone="neutral" onClick={() => setStep(1)} />
            <ActionBtn
              label="Next: Message"
              icon="arrow_forward"
              tone="primary"
              onClick={() => setStep(3)}
            />
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="!p-4 space-y-3">
          <p className="text-sm font-extrabold text-on-surface">Step 3 · Message Composer</p>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
              Start From Template (optional)
            </span>
            <select
              value={tplId}
              onChange={(e) => applyTemplate(e.target.value)}
              className={fieldCls}
            >
              <option value="">— None —</option>
              {templates
                .filter((t) => !t.archived)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} · {t.category}
                  </option>
                ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                Subject
              </span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line"
                className={fieldCls}
              />
            </div>
            <div className="md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                Heading
              </span>
              <input
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="In-app heading"
                className={fieldCls}
              />
            </div>
            <div className="md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                Message
              </span>
              <textarea
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Compose the message…"
                className={fieldCls}
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                CTA Button
              </span>
              <input
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                placeholder="e.g. View Wallet"
                className={fieldCls}
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                CTA Link
              </span>
              <input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://… or /path"
                className={fieldCls}
              />
            </div>
          </div>
          <input
            ref={attachmentRef}
            type="file"
            className="hidden"
            onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
          />
          {attachment && (
            <div className="mb-2 flex items-center justify-between rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-xs">
              <span className="truncate">Attached: {attachment.name}</span>
              <button
                type="button"
                className="text-outline hover:text-on-surface"
                onClick={() => {
                  setAttachment(null);
                  if (attachmentRef.current) attachmentRef.current.value = "";
                }}
              >
                Remove
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <ActionBtn
              label="Attach Image"
              icon="image"
              tone="neutral"
              onClick={() => pickAttachment("image/*")}
            />
            <ActionBtn
              label="Attach PDF"
              icon="picture_as_pdf"
              tone="neutral"
              onClick={() => pickAttachment("application/pdf")}
            />
            <ActionBtn
              label="Attach Document"
              icon="description"
              tone="neutral"
              onClick={() =>
                pickAttachment(
                  ".doc,.docx,.txt,.rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain",
                )
              }
            />
            <ActionBtn
              label="Attach Video"
              icon="movie"
              tone="neutral"
              onClick={() => pickAttachment("video/*")}
            />
            <ActionBtn
              label="Add Link"
              icon="link"
              tone="neutral"
              onClick={() => {
                const url = window.prompt("Enter URL");
                if (url) setCtaUrl(url);
              }}
            />
          </div>
          <div className="flex justify-between">
            <ActionBtn label="Back" icon="arrow_back" tone="neutral" onClick={() => setStep(2)} />
            <ActionBtn
              label="Next: Channels"
              icon="arrow_forward"
              tone="primary"
              onClick={() => setStep(4)}
            />
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card className="!p-4 space-y-4">
          <p className="text-sm font-extrabold text-on-surface">Step 4 · Delivery Channels</p>
          <div className="flex flex-wrap gap-2">
            {chanList.map((c) => {
              const on = channels[c.key];
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setChannels((s) => ({ ...s, [c.key]: !s[c.key] }))}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                    on
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface text-on-surface-variant border-outline-variant/40 hover:border-primary/40",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
              Priority
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["low", "normal", "high", "critical"] as BCPriority[]).map((p) => {
                const on = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[11px] font-semibold border capitalize",
                      on
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-surface text-on-surface-variant border-outline-variant/40",
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between">
            <ActionBtn label="Back" icon="arrow_back" tone="neutral" onClick={() => setStep(3)} />
            <ActionBtn
              label="Next: Preview"
              icon="arrow_forward"
              tone="primary"
              onClick={() => setStep(5)}
            />
          </div>
        </Card>
      )}

      {step === 5 && (
        <>
          <Card className="!p-4 space-y-3">
            <p className="text-sm font-extrabold text-on-surface">
              Step 5 · Preview &amp; Validation
            </p>
            <div className="flex flex-wrap gap-2">
              {(["desktop", "mobile", "email", "notif"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPreviewMode(m)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-semibold border capitalize",
                    previewMode === m
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface text-on-surface-variant border-outline-variant/40",
                  )}
                >
                  {m === "notif" ? "Notification" : m}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
                {audienceLabel} · {channelLabel} · {category}
              </p>
              <p className="mt-1 text-sm font-extrabold text-on-surface">
                {subject || "Subject preview"}
              </p>
              <p className="mt-1 text-xs text-on-surface-variant whitespace-pre-wrap">
                {body || "Message preview will appear here."}
              </p>
              {cta && (
                <Button
                  variant="primary"
                  size="lg"
                  className="mt-3 px-3.5 py-1.5 rounded-full text-xs font-bold"
                >
                  {cta}
                </Button>
              )}
            </div>
            {(() => {
              const issues: string[] = [];
              if (!subject.trim()) issues.push("Missing Subject");
              if (!body.trim()) issues.push("Empty Message");
              if (ctaUrl && !/^https?:\/\/|^\//.test(ctaUrl)) issues.push("Invalid Links");
              if (!Object.values(channels).some(Boolean)) issues.push("Invalid Audience / Channel");
              return issues.length > 0 ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <p className="text-[11px] font-bold uppercase text-rose-700">Validation</p>
                  <ul className="mt-1 text-xs text-rose-700 list-disc pl-4">
                    {issues.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 font-semibold">
                  All checks passed.
                </div>
              );
            })()}
          </Card>

          <Card className="!p-4">
            <p className="text-sm font-extrabold text-on-surface">Scheduling</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["now", "schedule"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setWhenMode(m)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                    whenMode === m
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface text-on-surface-variant border-outline-variant/40 hover:border-primary/40",
                  )}
                >
                  {m === "now" ? "Send Now" : "Schedule"}
                </button>
              ))}
            </div>
            {whenMode === "schedule" && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                    Date
                  </span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={fieldCls}
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                    Time
                  </span>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={fieldCls}
                  />
                </div>
              </div>
            )}
            <div className="mt-4 flex flex-wrap justify-between gap-2">
              <ActionBtn label="Back" icon="arrow_back" tone="neutral" onClick={() => setStep(4)} />
              <div className="flex gap-2">
                <ActionBtn
                  label="Save Draft"
                  icon="save"
                  tone="neutral"
                  onClick={() => finalize("draft")}
                />
                {whenMode === "schedule" ? (
                  <ActionBtn
                    label="Schedule"
                    icon="event_available"
                    tone="primary"
                    onClick={() => finalize("scheduled")}
                  />
                ) : (
                  <ActionBtn
                    label="Send Now"
                    icon="send"
                    tone="primary"
                    onClick={() => finalize("sending")}
                  />
                )}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

/* ============================================================
 * 3. AUTOMATED NOTIFICATIONS VIEW
 * ============================================================ */

const AutomatedNotificationsView = ({
  events,
  setEvents,
  logs,
  cat,
}: {
  events: ANEvent[];
  setEvents: React.Dispatch<React.SetStateAction<ANEvent[]>>;
  logs: LogRow[];
  cat: ANCategory | "All";
}) => {
  const [editing, setEditing] = useState<string | null>(null);
  const list = events.filter((e) => cat === "All" || e.category === cat);
  const toggleActive = (id: string) =>
    setEvents((s) => s.map((e) => (e.id === id ? { ...e, active: !e.active } : e)));
  const toggleChan = (id: string, c: ANChannel) =>
    setEvents((s) =>
      s.map((e) => (e.id === id ? { ...e, channels: { ...e.channels, [c]: !e.channels[c] } } : e)),
    );
  const updateField = (id: string, key: "subject" | "message", v: string) =>
    setEvents((s) => s.map((e) => (e.id === id ? { ...e, [key]: v } : e)));

  const fieldCls =
    "mt-1 w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30";

  return (
    <div className="space-y-4">
      <Card className="!p-4">
        <p className="text-sm font-extrabold text-on-surface">Event-Driven Notification Engine</p>
        <p className="text-xs text-outline mt-1">
          System events trigger notifications automatically. No manual sending.
        </p>
      </Card>


      <div className="space-y-3">
        {list.map((e) => {
          const open = editing === e.id;
          return (
            <Card key={e.id} className="!p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-extrabold text-on-surface">{e.event}</p>
                    <Badge tone="bg-indigo-50 text-indigo-700">{e.category}</Badge>
                    <Badge
                      tone={
                        e.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"
                      }
                    >
                      {e.active ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-outline mt-0.5">
                    {e.id} · Triggers: {e.triggers.toLocaleString()} · Last fired {e.lastFired}
                  </p>
                </div>
                <div className="flex gap-2">
                  <ActionBtn
                    label={e.active ? "Disable" : "Enable"}
                    icon={e.active ? "pause" : "play_arrow"}
                    tone="neutral"
                    onClick={() => toggleActive(e.id)}
                  />
                  <ActionBtn
                    label={open ? "Close" : "Edit Template"}
                    icon={open ? "close" : "edit"}
                    tone="primary"
                    onClick={() => setEditing(open ? null : e.id)}
                  />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low p-3">
                  <p className="text-[10px] font-bold uppercase text-outline">Subject</p>
                  <p className="text-xs text-on-surface mt-1">{e.subject}</p>
                  <p className="text-[10px] font-bold uppercase text-outline mt-2">Message</p>
                  <p className="text-xs text-on-surface-variant mt-1">{e.message}</p>
                </div>
                <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low p-3">
                  <p className="text-[10px] font-bold uppercase text-outline">Channels</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["in_app", "email", "sms", "push"] as ANChannel[]).map((c) => {
                      const on = e.channels[c];
                      const label =
                        c === "in_app"
                          ? "In-App"
                          : c === "email"
                            ? "Email"
                            : c === "sms"
                              ? "SMS"
                              : "Push";
                      return (
                        <button
                          key={c}
                          onClick={() => toggleChan(e.id, c)}
                          className={cn(
                            "px-3 py-1 rounded-full text-[11px] font-semibold border",
                            on
                              ? "bg-primary text-on-primary border-primary"
                              : "bg-surface text-on-surface-variant border-outline-variant/40",
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] font-bold uppercase text-outline mt-3">
                    Dynamic Variables
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {e.variables.map((v) => (
                      <code
                        key={v}
                        className="px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 rounded"
                      >{`{{${v}}}`}</code>
                    ))}
                  </div>
                </div>
              </div>
              {open && (
                <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                      Edit Subject
                    </span>
                    <input
                      value={e.subject}
                      onChange={(ev) => updateField(e.id, "subject", ev.target.value)}
                      className={fieldCls}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                      Edit Message
                    </span>
                    <textarea
                      rows={3}
                      value={e.message}
                      onChange={(ev) => updateField(e.id, "message", ev.target.value)}
                      className={fieldCls}
                    />
                  </div>
                  <div className="flex justify-end">
                    <ActionBtn
                      label="Save Template"
                      icon="save"
                      tone="primary"
                      onClick={() => {
                        setEditing(null);
                        toast.success("Template saved");
                      }}
                    />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/40">
          <p className="text-sm font-extrabold text-on-surface">Notification History</p>
          <p className="text-[11px] text-outline">Recent automated dispatches.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-surface-container-low text-outline">
              <tr>
                <th className="text-left px-3 py-2 font-bold">Event</th>
                <th className="text-left px-3 py-2 font-bold">User</th>
                <th className="text-left px-3 py-2 font-bold">Channel</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                <th className="text-left px-3 py-2 font-bold">When</th>
                <th className="text-right px-3 py-2 font-bold">Retry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {logs
                .filter((l) => l.source.startsWith("EV"))
                .map((l) => (
                  <tr key={l.id}>
                    <td className="px-3 py-2 font-bold text-on-surface">{l.source}</td>
                    <td className="px-3 py-2 text-on-surface">{l.recipient}</td>
                    <td className="px-3 py-2 text-on-surface-variant">{l.channel}</td>
                    <td className="px-3 py-2">
                      <Badge tone={logTone(l.status)}>{l.status}</Badge>
                    </td>
                    <td className="px-3 py-2 text-on-surface-variant">{l.deliveredAt}</td>
                    <td className="px-3 py-2 text-right text-on-surface-variant">{l.retries}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

/* ============================================================
 * 4. TEMPLATES VIEW
 * ============================================================ */

const TemplatesView = ({
  list,
  setList,
  cat,
}: {
  list: TplRow[];
  setList: React.Dispatch<React.SetStateAction<TplRow[]>>;
  cat: string;
}) => {
  const filtered = list.filter((t) => (cat === "All" || t.category === cat) && !t.archived);
  const archive = (id: string) => {
    setList((s) => s.map((t) => (t.id === id ? { ...t, archived: true } : t)));
    toast.success("Template archived");
  };
  const duplicate = (id: string) => {
    const o = list.find((t) => t.id === id);
    if (!o) return;
    const c: TplRow = {
      ...o,
      id: `TPL-${Math.floor(Math.random() * 90) + 10}`,
      name: `${o.name} (Copy)`,
    };
    setList((s) => [c, ...s]);
    toast.success("Template duplicated");
  };
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((t) => (
          <Card key={t.id} className="!p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-on-surface">{t.name}</p>
                <p className="text-[11px] text-outline mt-0.5">
                  {t.id} · {t.category}
                </p>
              </div>
              <Badge tone="bg-primary-container/10 text-primary-container">Template</Badge>
            </div>
            <div className="mt-3 rounded-lg border border-outline-variant/40 bg-surface-container-low p-3">
              <p className="text-xs font-bold text-on-surface">{t.title}</p>
              <p className="mt-1 text-xs text-on-surface-variant">{t.message}</p>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <ActionBtn label="Edit · Coming Soon" icon="edit" tone="neutral" />
              <ActionBtn
                label="Duplicate"
                icon="content_copy"
                tone="neutral"
                onClick={() => duplicate(t.id)}
              />
              <ActionBtn
                label="Archive"
                icon="archive"
                tone="neutral"
                onClick={() => archive(t.id)}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
 * 5. DELIVERY LOGS VIEW
 * ============================================================ */

const DeliveryLogsView = ({
  logs,
  chan,
  stat,
  search,
}: {
  logs: LogRow[];
  chan: LogChannel | "All";
  stat: LogStatus | "All";
  search: string;
}) => {
  const list = logs.filter(
    (l) =>
      (chan === "All" || l.channel === chan) &&
      (stat === "All" || l.status === stat) &&
      (search === "" ||
        l.recipient.toLowerCase().includes(search.toLowerCase()) ||
        l.source.toLowerCase().includes(search.toLowerCase())),
  );
  return (
    <div className="space-y-4">
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-surface-container-low text-outline">
              <tr>
                <th className="text-left px-3 py-2 font-bold">Log ID</th>
                <th className="text-left px-3 py-2 font-bold">Recipient</th>
                <th className="text-left px-3 py-2 font-bold">Source</th>
                <th className="text-left px-3 py-2 font-bold">Channel</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                <th className="text-left px-3 py-2 font-bold">Delivered</th>
                <th className="text-left px-3 py-2 font-bold">Opened</th>
                <th className="text-left px-3 py-2 font-bold">Clicked</th>
                <th className="text-left px-3 py-2 font-bold">Failure</th>
                <th className="text-right px-3 py-2 font-bold">Retries</th>
                <th className="text-left px-3 py-2 font-bold">Last Retry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {list.map((l) => (
                <tr key={l.id}>
                  <td className="px-3 py-2 font-bold text-on-surface">{l.id}</td>
                  <td className="px-3 py-2 text-on-surface">{l.recipient}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{l.source}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{l.channel}</td>
                  <td className="px-3 py-2">
                    <Badge tone={logTone(l.status)}>{l.status}</Badge>
                  </td>
                  <td className="px-3 py-2 text-on-surface-variant">{l.deliveredAt}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{l.openedAt || "—"}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{l.clickedAt || "—"}</td>
                  <td className="px-3 py-2 text-rose-600">{l.failureReason || "—"}</td>
                  <td className="px-3 py-2 text-right font-semibold">{l.retries}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{l.lastRetry || "—"}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-6 text-center text-outline">
                    No logs match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="!p-4">
        <p className="text-sm font-extrabold text-on-surface">Failure Reasons (reference)</p>
        <ul className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-on-surface-variant">
          {FAIL_REASONS.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

/* ============================================================
 * 6. ANALYTICS VIEW
 * ============================================================ */

const CCAnalyticsView = ({
  rows,
  events,
  logs,
}: {
  rows: BCRow[];
  events: ANEvent[];
  logs: LogRow[];
}) => {
  const total = rows.length;
  const delivered = rows.reduce((s, r) => s + r.delivered, 0);
  const failed = rows.reduce((s, r) => s + r.failed, 0);
  const opened = rows.reduce((s, r) => s + r.opened, 0);
  const clicked = rows.reduce((s, r) => s + r.clicked, 0);
  const dRate = delivered ? Math.round((delivered / (delivered + failed)) * 100) : 0;
  const oRate = delivered ? Math.round((opened / delivered) * 100) : 0;
  const cRate = opened ? Math.round((clicked / opened) * 100) : 0;
  const anTotal = events.reduce((s, e) => s + e.triggers, 0);
  const anFailed = logs.filter((l) => l.source.startsWith("EV") && l.status === "Failed").length;
  const anSuccess = anTotal ? Math.round(((anTotal - anFailed) / anTotal) * 100) : 100;
  const channelStats: Record<LogChannel, { d: number; t: number }> = {
    Email: { d: 0, t: 0 },
    SMS: { d: 0, t: 0 },
    Push: { d: 0, t: 0 },
    "In-App": { d: 0, t: 0 },
  };
  logs.forEach((l) => {
    channelStats[l.channel].t += 1;
    if (["Delivered", "Read", "Clicked"].includes(l.status)) channelStats[l.channel].d += 1;
  });
  const topEvents = [...events].sort((a, b) => b.triggers - a.triggers).slice(0, 5);
  return (
    <div className="space-y-4">
      <Row cols={4}>
        <Stat
          label="Broadcasts Sent"
          value={String(total)}
          icon={FileText}
          tint="bg-primary-container/10 text-primary-container"
        />
        <Stat
          label="Delivery Rate"
          value={`${dRate}%`}
          icon={CheckCircle2}
          tint="bg-emerald-500/10 text-emerald-600"
        />
        <Stat
          label="Open Rate"
          value={`${oRate}%`}
          icon={Eye}
          tint="bg-violet-500/10 text-violet-600"
        />
        <Stat
          label="CTR"
          value={`${cRate}%`}
          icon={MousePointerClick}
          tint="bg-indigo-500/10 text-indigo-600"
        />
      </Row>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="!p-4">
          <p className="text-sm font-extrabold text-on-surface">Automated Notification Analytics</p>
          <ul className="mt-3 space-y-1.5 text-xs text-on-surface-variant">
            <li>
              • Notification Success Rate —{" "}
              <span className="font-bold text-emerald-600">{anSuccess}%</span>
            </li>
            <li>
              • Failed Notifications — <span className="font-bold text-rose-600">{anFailed}</span>
            </li>
            <li>
              • Avg Delivery Time — <span className="font-bold text-on-surface">1m 04s</span>
            </li>
            <li>• Most Triggered Events:</li>
            {topEvents.map((e) => (
              <li key={e.id} className="ml-3">
                — {e.event} <span className="text-outline">({e.triggers.toLocaleString()})</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="!p-4">
          <p className="text-sm font-extrabold text-on-surface">Audience Analytics</p>
          <ul className="mt-3 space-y-1.5 text-xs text-on-surface-variant">
            <li>
              • Client Engagement — <span className="font-bold text-on-surface">58%</span>
            </li>
            <li>
              • Professional Engagement — <span className="font-bold text-on-surface">71%</span>
            </li>
            <li>
              • Admin Engagement — <span className="font-bold text-on-surface">92%</span>
            </li>
          </ul>
        </Card>

        <Card className="!p-4">
          <p className="text-sm font-extrabold text-on-surface">Channel Analytics</p>
          <ul className="mt-3 space-y-1.5 text-xs text-on-surface-variant">
            {(Object.keys(channelStats) as LogChannel[]).map((c) => {
              const { d, t } = channelStats[c];
              const pct = t ? Math.round((d / t) * 100) : 0;
              return (
                <li key={c}>
                  • {c} — <span className="font-bold text-on-surface">{pct}% delivered</span> ({d}/
                  {t})
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="!p-4">
          <p className="text-sm font-extrabold text-on-surface">Time Analytics</p>
          <ul className="mt-3 space-y-1.5 text-xs text-on-surface-variant">
            <li>
              • Best Sending Time —{" "}
              <span className="font-bold text-on-surface">10:00 – 11:00 IST</span>
            </li>
            <li>
              • Peak Engagement Hours —{" "}
              <span className="font-bold text-on-surface">19:00 – 21:00 IST</span>
            </li>
            <li>
              • Highest Open Time — <span className="font-bold text-on-surface">20:30 IST</span>
            </li>
          </ul>
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/40">
          <p className="text-sm font-extrabold text-on-surface">Campaign Comparison</p>
          <p className="text-[11px] text-outline">
            Compare multiple broadcasts across opens, clicks, delivery and engagement.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-surface-container-low text-outline">
              <tr>
                <th className="text-left px-3 py-2 font-bold">Broadcast</th>
                <th className="text-right px-3 py-2 font-bold">Delivered</th>
                <th className="text-right px-3 py-2 font-bold">Opens</th>
                <th className="text-right px-3 py-2 font-bold">Clicks</th>
                <th className="text-right px-3 py-2 font-bold">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {rows
                .filter((r) => r.status === "sent" || r.status === "sending")
                .map((r) => {
                  const eng = r.delivered
                    ? Math.round(((r.opened + r.clicked) / r.delivered) * 100)
                    : 0;
                  return (
                    <tr key={r.id}>
                      <td className="px-3 py-2 font-bold text-on-surface">
                        {r.id} · {r.title}
                      </td>
                      <td className="px-3 py-2 text-right text-emerald-600 font-semibold">
                        {r.delivered.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-on-surface">
                        {r.opened.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-on-surface">
                        {r.clicked.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-indigo-600">{eng}%</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

/* ============================================================
 * COMMUNICATION CENTER — section shell
 * ============================================================ */

export const BroadcastsSection = () => {
  const [view, setView] = useState<CCKey>("dashboard");
  const [rows, setRows] = useState<BCRow[]>(INITIAL_BC);
  const [events, setEvents] = useState<ANEvent[]>(INITIAL_AN);
  const [templates, setTemplates] = useState<TplRow[]>(INITIAL_TPL);
  const [logs] = useState<LogRow[]>(INITIAL_LOGS);
  const [creating, setCreating] = useState(false);

  /* Sub-filters of every module, lifted here so they render inside the
     shared "Sort" control of the list-page shell (same UI as Order Desk). */
  const [bcFilter, setBcFilter] = useState<BCFilter>("all");
  const [anCat, setAnCat] = useState<ANCategory | "All">("All");
  const [tplCat, setTplCat] = useState<string>("All");
  const [logChan, setLogChan] = useState<LogChannel | "All">("All");
  const [logStat, setLogStat] = useState<LogStatus | "All">("All");
  const [logSearch, setLogSearch] = useState("");
  const [logSortKey, setLogSortKey] = useState("chan:All");

  const tabs: AuditListTab[] = CC_NAV.map((n) => ({
    key: n.key,
    label: n.label,
    icon: n.icon,
  }));

  const bcCount = (k: BCFilter) =>
    rows.filter((r) =>
      k === "all"
        ? true
        : k === "sent"
          ? r.status === "sent" || r.status === "sending"
          : r.status === k,
    ).length;

  const anList = events.filter((e) => anCat === "All" || e.category === anCat);
  const tplList = templates.filter(
    (t) => (tplCat === "All" || t.category === tplCat) && !t.archived,
  );
  const logList = logs.filter(
    (l) =>
      (logChan === "All" || l.channel === logChan) &&
      (logStat === "All" || l.status === logStat) &&
      (logSearch === "" ||
        l.recipient.toLowerCase().includes(logSearch.toLowerCase()) ||
        l.source.toLowerCase().includes(logSearch.toLowerCase())),
  );

  const LOG_CHANNELS: (LogChannel | "All")[] = ["All", "Email", "SMS", "Push", "In-App"];
  const LOG_STATUSES: (LogStatus | "All")[] = [
    "All",
    "Queued",
    "Sent",
    "Delivered",
    "Read",
    "Clicked",
    "Failed",
  ];

  let sortOptions: AuditSortOption[] | undefined;
  let sortValue: string | undefined;
  let onSortChange: ((key: string) => void) | undefined;
  let count = 0;

  if (view === "broadcasts") {
    sortOptions = [
      { key: "all", label: "All" },
      { key: "draft", label: "Drafts" },
      { key: "scheduled", label: "Scheduled" },
      { key: "sent", label: "Sent" },
    ];
    sortValue = bcFilter;
    onSortChange = (k) => setBcFilter(k as BCFilter);
    count = bcCount(bcFilter);
  } else if (view === "automated") {
    sortOptions = (["All", ...AN_CATEGORIES] as (ANCategory | "All")[]).map((c) => ({
      key: c,
      label: c,
    }));
    sortValue = anCat;
    onSortChange = (k) => setAnCat(k as ANCategory | "All");
    count = anList.length;
  } else if (view === "templates") {
    sortOptions = ["All", ...TEMPLATE_CATEGORIES].map((c) => ({ key: c, label: c }));
    sortValue = tplCat;
    onSortChange = (k) => setTplCat(k);
    count = tplList.length;
  } else if (view === "logs") {
    sortOptions = [
      ...LOG_CHANNELS.map((c) => ({ key: `chan:${c}`, label: `Channel · ${c}` })),
      ...LOG_STATUSES.map((s) => ({ key: `stat:${s}`, label: `Status · ${s}` })),
    ];
    sortValue = logSortKey;
    onSortChange = (k) => {
      setLogSortKey(k);
      const [dim, val] = k.split(":");
      if (dim === "chan") setLogChan(val as LogChannel | "All");
      else setLogStat(val as LogStatus | "All");
    };
    count = logList.length;
  }

  const headerAction = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => setCreating(true)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap",
          view === "templates"
            ? "bg-surface text-on-surface-variant border-outline-variant/40 hover:border-primary/40"
            : "bg-primary text-on-primary border-primary font-bold hover:opacity-90",
        )}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          add
        </span>
        Create Broadcast
      </button>
      {view === "templates" && (
        <button
          type="button"
          onClick={() => {
            const c: TplRow = {
              id: `TPL-${Math.floor(Math.random() * 90) + 10}`,
              name: "New Template",
              category: "Announcement",
              title: "Title",
              message: "Message",
            };
            setTemplates((s) => [c, ...s]);
            toast.success("Template created");
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-on-primary hover:opacity-90 whitespace-nowrap"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            add
          </span>
          Create Template
        </button>
      )}
    </div>
  );

  return (
    <>
      <AuditListPage
        title="Communication Center"
        description="Centralised hub for manual broadcasts, automated notifications, templates, delivery logs and analytics."
        headerAction={headerAction}
        tabs={tabs}
        activeTab={view}
        onTabChange={(k) => setView(k as CCKey)}
        sortOptions={sortOptions}
        sortValue={sortValue}
        onSortChange={onSortChange}
        count={count}
        hideSortRow={view === "dashboard"}
        search={
          view === "logs"
            ? {
                query: logSearch,
                onSearch: setLogSearch,
                placeholder: "Search recipient or source…",
              }
            : undefined
        }
        isEmpty={view === "broadcasts" && bcCount(bcFilter) === 0}
        emptyMessage="No broadcasts in this state."
      >
        {view === "dashboard" && (
          <div className="space-y-6">
            <CCDashboardView
              rows={rows}
              events={events}
              templates={templates}
              logs={logs}
              onJump={setView}
            />
            <CCAnalyticsView rows={rows} events={events} logs={logs} />
          </div>
        )}
        {view === "broadcasts" && (
          <BroadcastsListView
            rows={rows}
            setRows={setRows}
            onCreate={() => setCreating(true)}
            f={bcFilter}
          />
        )}
        {view === "automated" && (
          <AutomatedNotificationsView
            events={events}
            setEvents={setEvents}
            logs={logs}
            cat={anCat}
          />
        )}
        {view === "templates" && (
          <TemplatesView list={templates} setList={setTemplates} cat={tplCat} />
        )}
        {view === "logs" && (
          <DeliveryLogsView logs={logs} chan={logChan} stat={logStat} search={logSearch} />
        )}
      </AuditListPage>


      {creating && (
        <div
          className="fixed inset-0 z-[70] flex items-stretch md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-6"
          onClick={() => setCreating(false)}
        >
          <div
            className="bg-surface w-full md:max-w-3xl md:rounded-2xl rounded-none border border-outline-variant/40 shadow-2xl overflow-y-auto max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 md:p-6">
              <CreateBroadcastView
                templates={templates}
                onCancel={() => setCreating(false)}
                onCreated={(row) => {
                  setRows((s) => [row, ...s]);
                  setCreating(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BroadcastsSection;
