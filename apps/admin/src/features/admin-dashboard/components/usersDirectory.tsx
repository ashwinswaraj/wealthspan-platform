import { useCallback, useEffect, useMemo, useState, ReactNode } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@jobrio/utils/utils";
import {
  allClients,
  professionals,
  getAvailableActions,
  getPrimaryAction,
  executeAccountAction,
  ACCOUNT_ACTIONS,
  type AccountResource,
  type AccountState,
  type Actor,
  type ResolvedAction,
} from "@jobrio/constants";
import { SectionHeader, Card } from "@admin/features/admin-dashboard/components/sections";
import { AuditSearchBar } from "@admin/features/admin-dashboard/components/AuditListPage";
import { ActionBar } from "@admin/features/admin-dashboard/components/ActionBar";

/* ============================================================
 * Types & Mock Data
 * ============================================================ */

/**
 * The directory does not own the account lifecycle — `@jobrio/constants`
 * does. Aliasing (instead of re-declaring the union) means a new state
 * added to the lifecycle is a type error here until it is handled.
 */
type AccountStatus = AccountState;
type UserType = "Client" | "Professional" | "Admin";
type Verification = "Verified" | "Pending" | "Rejected";

interface BaseUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: UserType;
  status: AccountStatus;
  verification: Verification;
  emailVerified: boolean;
  phoneVerified: boolean;
  joined: string;
  lastLogin: string;
  lastActive: string;
  devices: number;
  img?: string;
  reasonHistory: { when: string; action: string; reason: string }[];
}

interface ClientUser extends BaseUser {
  type: "Client";
  clientType: "Individual" | "Company";
  companyName?: string;
  billing: string;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSpend: string;
  refundHistory: string;
  reliability: number;
  disputeHistory: number;
}

interface ProfessionalUser extends BaseUser {
  type: "Professional";
  category: string;
  subcategory: string;
  skills: string[];
  tier: "Standard" | "Premium" | "Elite";
  availability: "Available" | "Busy" | "Toggle OFF";
  toggle: "ON" | "OFF";
  ordersCompleted: number;
  acceptanceRate: number;
  completionRate: number;
  qaPassRate: number;
  reliability: number;
  totalEarnings: string;
  pendingPayouts: string;
  applicationHistory: number;
  trialHistory: number;
  hiringDecision: string;
  inTrial?: boolean;
  trialStage?: "Trial 1" | "Trial 2" | "Trial 3";
}

interface AdminUser extends BaseUser {
  type: "Admin";
  role: "Super Admin" | "Operations" | "Finance" | "Support" | "QA Lead";
  permissionsSource: string;
  actionsCount: number;
}

type DirUser = ClientUser | ProfessionalUser | AdminUser;

/* ------------------------------------------------------------------
 * Directory users are derived from the SAME mock people used on the
 * public landing / directory pages (@jobrio/constants) so that every
 * surface — landing ID cards, Users Directory, Workforce, Order Desk —
 * shows one identical set of users. Admin-only fields (email, phone,
 * KYC, payouts, devices, audit reasons) are filled in deterministically
 * here because the public cards do not carry them.
 * ------------------------------------------------------------------ */

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .trim()
    .split(/\s+/)
    .join(".");

const digits = (id: string) => {
  const n = Number(id.replace(/\D/g, "")) || 0;
  return n;
};

const phoneFor = (id: string) => {
  const n = digits(id);
  return `+91 9${String(8000000000 + (n % 1000000000)).slice(1)}`.replace(
    /^(\+91 \d{5})(\d{5})$/,
    "$1 $2",
  );
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const joinedISO = (joinedDate: string) => {
  const [mon, year] = joinedDate.split(" ");
  const mi = Math.max(0, MONTHS.indexOf(mon));
  return `${year}-${String(mi + 1).padStart(2, "0")}-12`;
};

const RECENCY = ["Now", "12m ago", "2h ago", "5h ago", "1d ago", "3d ago", "12d ago"];

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const numeric = (value: string) => Number(value.replace(/[^\d]/g, "")) || 0;

const CLIENTS: ClientUser[] = allClients.map((c, i) => {
  const n = digits(c.id);
  const suspended = c.status === "INACTIVE" && i % 4 === 3;
  const status: AccountStatus = suspended
    ? "Suspended"
    : c.status === "INACTIVE"
      ? "Active"
      : "Active";
  const domain = c.companyName ? `${slug(c.companyName).replace(/\./g, "")}.com` : "gmail.com";
  return {
    id: c.id,
    name: c.name,
    img: c.img,
    email: `${slug(c.name)}@${domain}`,
    phone: phoneFor(c.id),
    type: "Client",
    status,
    verification: c.badges.includes("Verified") ? "Verified" : "Pending",
    emailVerified: true,
    phoneVerified: c.trustScore > 92,
    joined: joinedISO(c.joinedDate),
    lastLogin: RECENCY[n % RECENCY.length],
    lastActive: RECENCY[(n + 1) % RECENCY.length],
    devices: 1 + (n % 4),
    clientType: c.clientType,
    ...(c.companyName ? { companyName: c.companyName } : {}),
    billing:
      c.clientType === "Company"
        ? `GST · ${String(22 + (n % 8))}ABCDE${String(1000 + (n % 9000))}F1Z5`
        : `UPI · ${slug(c.name).split(".")[0]}@upi`,
    totalOrders: c.totalOrders,
    activeOrders: c.activeOrders,
    completedOrders: c.completedOrders,
    cancelledOrders: Math.max(0, c.totalOrders - c.activeOrders - c.completedOrders),
    totalSpend: money(numeric(c.avgOrderValue) * c.completedOrders),
    refundHistory:
      c.disputeRate > 0
        ? `${money(numeric(c.avgOrderValue) * c.disputeRate)} · ${c.disputeRate} refund${c.disputeRate > 1 ? "s" : ""}`
        : "—",
    reliability: c.trustScore,
    disputeHistory: c.disputeRate,
    reasonHistory: suspended
      ? [{ when: "2026-02-14", action: "Suspended", reason: "Repeated payment failures" }]
      : [],
  };
});

const PRO_CATEGORY_LABEL: Record<string, string> = {
  ENGINEERING: "Development",
  DESIGN: "Design",
  MARKETING: "Marketing",
  CONTENT: "Writing",
  DATA: "Development",
  PRODUCT: "Design",
  SECURITY: "Development",
  VIDEO: "Video Editing",
};

const PROS: ProfessionalUser[] = professionals.map((p, i) => {
  const n = digits(p.id);
  const inTrial = p.tier === "Standard" && i % 5 === 4;
  const availability: ProfessionalUser["availability"] =
    p.status === "BUSY" ? "Busy" : p.status === "OFFLINE" ? "Toggle OFF" : "Available";
  const earnings = p.ordersCompleted * (2200 + (n % 1800));
  return {
    id: p.id,
    name: p.name,
    img: p.img,
    email: `${slug(p.name)}@jobrio.pro`,
    phone: phoneFor(p.id),
    type: "Professional",
    status: "Active",
    verification: p.badges.some((b) => b.includes("Verified")) ? "Verified" : "Pending",
    emailVerified: true,
    phoneVerified: p.qualityScore > 90,
    joined: `${p.joinedYear}-${String(1 + (n % 12)).padStart(2, "0")}-${String(1 + (n % 27)).padStart(2, "0")}`,
    lastLogin: RECENCY[n % RECENCY.length],
    lastActive: RECENCY[(n + 2) % RECENCY.length],
    devices: 1 + (n % 3),
    category:
      PRO_CATEGORY_LABEL[p.category] ?? p.category.charAt(0) + p.category.slice(1).toLowerCase(),
    subcategory: p.role,
    skills: p.secondarySkills,
    tier: p.tier,
    availability,
    toggle: availability === "Toggle OFF" ? "OFF" : "ON",
    ordersCompleted: p.ordersCompleted,
    acceptanceRate: p.acceptanceRate,
    completionRate: p.onTimeRate,
    qaPassRate: p.qualityScore,
    reliability: Math.round((p.acceptanceRate + p.onTimeRate) / 2),
    totalEarnings: money(earnings),
    pendingPayouts: money(Math.round(earnings * 0.04)),
    applicationHistory: 1,
    trialHistory: 3,
    hiringDecision: inTrial
      ? "In trial"
      : `Hired · ${p.joinedYear}-${String(1 + (n % 12)).padStart(2, "0")}-28`,
    ...(inTrial
      ? { inTrial: true, trialStage: (["Trial 1", "Trial 2", "Trial 3"] as const)[n % 3] }
      : {}),
    reasonHistory: [],
  };
});

const ADMINS: AdminUser[] = [
  {
    id: "JR-AD-009001",
    name: "Aarav Mehta",
    email: "owner@jobrio.com",
    phone: "+91 98000 00001",
    type: "Admin",
    status: "Active",
    verification: "Verified",
    emailVerified: true,
    phoneVerified: true,
    joined: "2023-08-01",
    lastLogin: "Now",
    lastActive: "Now",
    devices: 2,
    role: "Super Admin",
    permissionsSource: "Founder",
    actionsCount: 4218,
    reasonHistory: [],
  },
  {
    id: "JR-AD-009012",
    name: "Aman Verma",
    email: "aman.v@jobrio.com",
    phone: "+91 98112 00012",
    type: "Admin",
    status: "Active",
    verification: "Verified",
    emailVerified: true,
    phoneVerified: true,
    joined: "2024-01-15",
    lastLogin: "30m ago",
    lastActive: "30m ago",
    devices: 1,
    role: "Operations",
    permissionsSource: "Super Admin",
    actionsCount: 1842,
    reasonHistory: [],
  },
  {
    id: "JR-AD-009015",
    name: "Pooja Rao",
    email: "pooja.r@jobrio.com",
    phone: "+91 98221 00015",
    type: "Admin",
    status: "Suspended",
    verification: "Verified",
    emailVerified: true,
    phoneVerified: true,
    joined: "2024-03-20",
    lastLogin: "12d ago",
    lastActive: "12d ago",
    devices: 1,
    role: "Finance",
    permissionsSource: "Super Admin",
    actionsCount: 612,
    reasonHistory: [
      { when: "2025-05-22", action: "Suspended", reason: "Pending compliance review" },
    ],
  },
  {
    id: "JR-AD-009018",
    name: "Tara Nair",
    email: "tara.n@jobrio.com",
    phone: "+91 98330 00018",
    type: "Admin",
    status: "Active",
    verification: "Verified",
    emailVerified: true,
    phoneVerified: true,
    joined: "2024-05-09",
    lastLogin: "2h ago",
    lastActive: "2h ago",
    devices: 2,
    role: "Support",
    permissionsSource: "Super Admin",
    actionsCount: 2104,
    reasonHistory: [],
  },
  {
    id: "JR-AD-009021",
    name: "Kabir Singh",
    email: "kabir.s@jobrio.com",
    phone: "+91 98444 00021",
    type: "Admin",
    status: "Active",
    verification: "Verified",
    emailVerified: true,
    phoneVerified: true,
    joined: "2024-07-12",
    lastLogin: "1h ago",
    lastActive: "1h ago",
    devices: 1,
    role: "QA Lead",
    permissionsSource: "Super Admin",
    actionsCount: 1380,
    reasonHistory: [],
  },
];

const ALL_USERS: DirUser[] = [...CLIENTS, ...PROS, ...ADMINS];

export const DIR_ALL_USERS = ALL_USERS;
export type DirectoryUser = DirUser;

/* ============================================================
 * Atoms
 * ============================================================ */

const STATUS_TONE: Record<AccountStatus | "Trial", string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Suspended: "bg-amber-50 text-amber-700",
  Blocked: "bg-rose-50 text-rose-700",
  Deleted: "bg-slate-100 text-slate-600",
  Trial: "bg-violet-50 text-violet-700",
};

const displayStatus = (u: DirUser): AccountStatus | "Trial" =>
  u.type === "Professional" && (u as ProfessionalUser).inTrial ? "Trial" : u.status;

/**
 * The minimal shape the action resolver needs. Keeping it narrow means the
 * same rules apply whether the caller is this table, the profile drawer, a
 * mobile card or a future surface.
 */
const toAccountResource = (u: DirUser): AccountResource => ({
  id: u.id,
  status: u.status,
  type: u.type,
});

const TYPE_TONE: Record<UserType, string> = {
  Client: "bg-primary-container/10 text-primary-container",
  Professional: "bg-violet-50 text-violet-700",
  Admin: "bg-slate-100 text-slate-700",
};

// Tier tones reserved for future per-row tier badge rendering.
// Keep colocated with the other tone maps so it remains discoverable.
const _TIER_TONE: Record<ProfessionalUser["tier"], string> = {
  Standard: "bg-slate-100 text-slate-700",
  Premium: "bg-primary-container/10 text-primary-container",
  Elite: "bg-amber-50 text-amber-700",
};
void _TIER_TONE;

const Badge = ({ tone, children }: { tone: string; children: ReactNode }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
      tone,
    )}
  >
    {children}
  </span>
);

const SectionTitle = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="flex items-end justify-between gap-3 mb-3">
    <h3 className="text-sm font-extrabold uppercase tracking-widest text-on-surface">{title}</h3>
    {hint && <span className="text-[10px] text-outline">{hint}</span>}
  </div>
);

const KV = ({
  k,
  v,
  tone = "text-on-surface",
}: {
  k: string;
  v: string | number;
  tone?: string;
}) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-[11px] text-on-surface-variant">{k}</span>
    <span className={cn("text-sm font-extrabold", tone)}>{v}</span>
  </div>
);

const Avatar = ({ name }: { name: string }) => (
  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
    {name
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)}
  </div>
);

const CTA = ({
  label,
  onClick,
  tone = "primary",
  icon,
}: {
  label: string;
  onClick?: () => void;
  tone?: "primary" | "neutral" | "warning" | "danger" | "success";
  icon?: string;
}) => {
  const tones = {
    primary: "bg-primary text-on-primary hover:opacity-90",
    neutral:
      "bg-surface-container-low border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container",
    warning: "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
    danger: "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
  } as const;
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors",
        tones[tone],
      )}
    >
      {icon && (
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
          {icon}
        </span>
      )}
      {label}
    </button>
  );
};

const Pill = ({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap inline-flex items-center gap-2",
      active
        ? "bg-primary text-on-primary border-primary shadow-sm"
        : "bg-surface text-on-surface-variant border-outline-variant/40 hover:border-primary/40",
    )}
  >
    {label}
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-full text-[10px]",
        active ? "bg-white/20" : "bg-surface-container-low text-outline",
      )}
    >
      {count}
    </span>
  </button>
);

/* ============================================================
 * Profile Detail (overlay) — full profile + management actions
 * ============================================================ */

const UniversalBlock = ({ u }: { u: DirUser }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    <div>
      <SectionTitle title="Identity" />
      <KV k="User ID" v={u.id} />
      <KV k="Account Type" v={u.type} />
      <KV k="Join Date" v={u.joined} />
    </div>
    <div>
      <SectionTitle title="Verification" />
      <KV
        k="Email"
        v={u.emailVerified ? "Verified" : "Pending"}
        tone={u.emailVerified ? "text-emerald-600" : "text-amber-600"}
      />
      <KV
        k="Phone"
        v={u.phoneVerified ? "Verified" : "Pending"}
        tone={u.phoneVerified ? "text-emerald-600" : "text-amber-600"}
      />
      <KV
        k="Identity"
        v={u.verification}
        tone={
          u.verification === "Verified"
            ? "text-emerald-600"
            : u.verification === "Pending"
              ? "text-amber-600"
              : "text-rose-600"
        }
      />
    </div>
    <div>
      <SectionTitle title="Account Activity" />
      <KV k="Last Login" v={u.lastLogin} />
      <KV k="Last Active" v={u.lastActive} />
      <KV k="Device Count" v={u.devices} />
    </div>
  </div>
);

const ClientBlock = ({ u }: { u: ClientUser }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div>
        <SectionTitle title="Business Information" />
        <KV k="Type" v={u.clientType} />
        <KV k="Company" v={u.companyName ?? "—"} />
        <KV k="Billing" v={u.billing} />
      </div>
      <div>
        <SectionTitle title="Order History" />
        <KV k="Total Orders" v={u.totalOrders} />
        <KV k="Active" v={u.activeOrders} tone="text-primary-container" />
        <KV k="Completed" v={u.completedOrders} tone="text-emerald-600" />
        <KV k="Cancelled" v={u.cancelledOrders} tone="text-rose-600" />
      </div>
      <div>
        <SectionTitle title="Financial Summary" />
        <KV k="Total Spend" v={u.totalSpend} />
        <KV k="Refund History" v={u.refundHistory} />
        <KV
          k="Reliability"
          v={`${u.reliability}/100`}
          tone={
            u.reliability >= 80
              ? "text-emerald-600"
              : u.reliability >= 50
                ? "text-amber-600"
                : "text-rose-600"
          }
        />
        <KV
          k="Disputes"
          v={u.disputeHistory}
          tone={u.disputeHistory === 0 ? "text-emerald-600" : "text-rose-600"}
        />
      </div>
    </div>
  </>
);

const ProBlock = ({ u }: { u: ProfessionalUser }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div>
        <SectionTitle title="Workforce Information" />
        <KV k="Category" v={u.category} />
        <KV k="Subcategory" v={u.subcategory} />
        <KV k="Skills" v={u.skills.join(", ")} />
      </div>
      <div>
        <SectionTitle title="Workforce Status" />
        <KV
          k="Availability"
          v={u.availability}
          tone={
            u.availability === "Available"
              ? "text-emerald-600"
              : u.availability === "Busy"
                ? "text-amber-600"
                : "text-rose-600"
          }
        />
        <KV
          k="Toggle"
          v={u.toggle}
          tone={u.toggle === "ON" ? "text-emerald-600" : "text-rose-600"}
        />
        <KV k="Quality Tier" v={u.tier} />
      </div>
      <div>
        <SectionTitle title="Performance" />
        <KV k="Orders Completed" v={u.ordersCompleted} />
        <KV k="Acceptance" v={`${u.acceptanceRate}%`} />
        <KV k="Completion" v={`${u.completionRate}%`} />
        <KV k="QA Pass" v={`${u.qaPassRate}%`} />
        <KV
          k="Reliability"
          v={`${u.reliability}/100`}
          tone={
            u.reliability >= 80
              ? "text-emerald-600"
              : u.reliability >= 50
                ? "text-amber-600"
                : "text-rose-600"
          }
        />
      </div>
    </div>
    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <SectionTitle title="Earnings" hint="Admin view" />
        <KV k="Total Earnings" v={u.totalEarnings} />
        <KV k="Pending Payouts" v={u.pendingPayouts} tone="text-amber-600" />
      </div>
      <div>
        <SectionTitle title="Hiring Information" hint="Read-only · links to Workforce" />
        <KV k="Application History" v={u.applicationHistory} />
        <KV k="Trial History" v={u.trialHistory} />
        <KV k="Hiring Decision" v={u.hiringDecision} />
      </div>
    </div>
  </>
);

const AdminBlock = ({ u }: { u: AdminUser }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    <div>
      <SectionTitle title="Role" />
      <KV k="Assigned Role" v={u.role} />
      <KV k="Permissions Source" v={u.permissionsSource} />
    </div>
    <div>
      <SectionTitle title="Activity" />
      <KV k="Last Login" v={u.lastLogin} />
      <KV k="Actions Count" v={u.actionsCount.toLocaleString()} />
    </div>
    <div>
      <SectionTitle title="Audit" hint="Link to logs" />
      <CTA label="Open Audit Logs" tone="neutral" icon="fact_check" />
    </div>
  </div>
);

/* Audit & Log + Trial Performance — inner detail panels */

const AUDIT_LOG_BY_USER: Record<
  string,
  { when: string; actor: string; action: string; detail: string }[]
> = {
  default: [
    {
      when: "2025-06-09 14:22",
      actor: "System",
      action: "Login",
      detail: "Web · Chrome · IP 49.36.x.x · Mumbai",
    },
    {
      when: "2025-06-08 09:11",
      actor: "JR-AD-009012",
      action: "Profile Updated",
      detail: "Phone number changed",
    },
    {
      when: "2025-06-05 17:48",
      actor: "System",
      action: "Email Verified",
      detail: "Confirmation link clicked",
    },
    {
      when: "2025-05-30 10:02",
      actor: "JR-AD-009001",
      action: "Note Added",
      detail: "Marked low-risk after KYC review",
    },
    {
      when: "2025-05-22 21:34",
      actor: "System",
      action: "Password Reset",
      detail: "Self-initiated",
    },
  ],
};

const TRIAL_PERFORMANCE_TEMPLATE = (u: ProfessionalUser) => [
  {
    trial: "Trial 1",
    template: "Foundation · " + u.category,
    status: u.trialHistory >= 1 ? "Approved" : "Not Started",
    score: u.trialHistory >= 1 ? 86 : null,
    qa: "Strong fundamentals.",
    submittedOn: "2025-04-18",
    decidedOn: "2025-04-20",
  },
  {
    trial: "Trial 2",
    template: "Intermediate · " + u.subcategory,
    status: u.trialHistory >= 2 ? "Approved" : "Not Started",
    score: u.trialHistory >= 2 ? 89 : null,
    qa: "Good execution & turnaround.",
    submittedOn: "2025-04-26",
    decidedOn: "2025-04-28",
  },
  {
    trial: "Trial 3",
    template: "Final · Brief Project",
    status: u.trialHistory >= 3 ? "Approved" : u.inTrial ? "In Progress" : "Not Started",
    score: u.trialHistory >= 3 ? 92 : null,
    qa: u.trialHistory >= 3 ? "Hireable. Tier: " + u.tier : "—",
    submittedOn: u.trialHistory >= 3 ? "2025-05-02" : "—",
    decidedOn: u.trialHistory >= 3 ? "2025-05-04" : "—",
  },
];

const AuditLogPanel = ({ u, onClose }: { u: DirUser; onClose: () => void }) => {
  const rows = AUDIT_LOG_BY_USER[u.id] ?? AUDIT_LOG_BY_USER.default;
  return (
    <div className="fixed inset-0 z-[60] flex items-stretch md:items-center justify-center p-0 md:p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full md:max-w-3xl bg-surface rounded-none md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-screen md:max-h-[85vh]">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-container-high">
          <div className="w-9 h-9 rounded-lg bg-primary-container/10 text-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              fact_check
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
              Audit &amp; Log
            </p>
            <p className="text-base font-extrabold text-on-surface truncate">
              {u.name} · <span className="font-mono text-xs">{u.id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container-low"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <Card className="!p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-container-high text-[10px] uppercase tracking-wider text-outline">
                  <th className="text-left font-bold px-4 py-2.5">When</th>
                  <th className="text-left font-bold px-4 py-2.5">Actor</th>
                  <th className="text-left font-bold px-4 py-2.5">Action</th>
                  <th className="text-left font-bold px-4 py-2.5">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/60">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-surface-container-low/60">
                    <td className="px-4 py-2.5 text-xs text-outline whitespace-nowrap">{r.when}</td>
                    <td className="px-4 py-2.5 text-xs font-mono">{r.actor}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold">{r.action}</td>
                    <td className="px-4 py-2.5 text-xs text-on-surface-variant">{r.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
};

const TrialPerformancePanel = ({ u, onClose }: { u: ProfessionalUser; onClose: () => void }) => {
  const trials = TRIAL_PERFORMANCE_TEMPLATE(u);
  return (
    <div className="fixed inset-0 z-[60] flex items-stretch md:items-center justify-center p-0 md:p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full md:max-w-4xl bg-surface rounded-none md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-screen md:max-h-[90vh]">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-container-high">
          <div className="w-9 h-9 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              workspace_premium
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
              Trial Performance · Full Details
            </p>
            <p className="text-base font-extrabold text-on-surface truncate">
              {u.name} · <span className="font-mono text-xs">{u.id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container-low"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <Card>
            <SectionTitle title="Snapshot" hint="Read-only · view source from Workforce Control" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KV k="Applications" v={u.applicationHistory} />
              <KV k="Trial History" v={u.trialHistory} />
              <KV k="Final Decision" v={u.hiringDecision} />
              <KV k="Quality Tier" v={u.tier} />
            </div>
          </Card>
          {trials.map((t) => (
            <Card key={t.trial}>
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
                    {t.trial}
                  </p>
                  <p className="text-base font-extrabold text-on-surface">{t.template}</p>
                </div>
                <Badge
                  tone={
                    t.status === "Approved"
                      ? "bg-emerald-50 text-emerald-700"
                      : t.status === "In Progress"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                  }
                >
                  {t.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <KV
                  k="Score"
                  v={t.score ?? "—"}
                  tone={
                    typeof t.score === "number" && t.score >= 80
                      ? "text-emerald-600"
                      : "text-on-surface"
                  }
                />
                <KV k="Submitted" v={t.submittedOn} />
                <KV k="Decided" v={t.decidedOn} />
                <KV k="QA Notes" v={t.qa} />
              </div>
            </Card>
          ))}
          <p className="text-[11px] text-outline text-center">
            All hiring & trial controls live in{" "}
            <span className="font-bold text-on-surface">Workforce Control</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

const ProfileDetail = ({
  u,
  actor,
  onClose,
  onRunAction,
}: {
  u: DirUser;
  actor: Actor;
  onClose: () => void;
  onRunAction: (action: ResolvedAction<AccountState, AccountResource>, reason?: string) => void;
}) => {
  const [showAudit, setShowAudit] = useState(false);
  const [showTrial, setShowTrial] = useState(false);
  // Same resolver the table row uses — one state cannot yield two answers.
  const actions = useMemo(
    () =>
      getAvailableActions({
        definitions: ACCOUNT_ACTIONS,
        state: u.status,
        resource: toAccountResource(u),
        actor,
      }),
    [u, actor],
  );
  return (
    <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center p-0 md:p-6">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full md:max-w-4xl bg-surface rounded-none md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-screen md:max-h-[90vh]">
        <div className="flex items-start gap-4 px-5 py-4 border-b border-surface-container-high">
          <Avatar name={u.name} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
              {u.type} · {u.id}
            </p>
            <p className="text-lg font-extrabold text-on-surface truncate">{u.name}</p>
            <p className="text-xs text-on-surface-variant truncate">
              {u.email} · {u.phone}
            </p>
          </div>
          <div className="flex gap-1.5 flex-wrap shrink-0">
            <Badge tone={TYPE_TONE[u.type]}>{u.type}</Badge>
            <Badge tone={STATUS_TONE[displayStatus(u)]}>{displayStatus(u)}</Badge>
          </div>
          <button
            onClick={onClose}
            className="ml-2 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container-low"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <Card>
            <UniversalBlock u={u} />
          </Card>
          {u.type === "Client" && (
            <Card>
              <ClientBlock u={u as ClientUser} />
            </Card>
          )}
          {u.type === "Professional" && (
            <Card>
              <ProBlock u={u as ProfessionalUser} />
            </Card>
          )}
          {u.type === "Admin" && (
            <Card>
              <AdminBlock u={u as AdminUser} />
            </Card>
          )}

          {u.reasonHistory.length > 0 && (
            <Card>
              <SectionTitle title="Status / Reason History" />
              <ul className="divide-y divide-surface-container-high/60">
                {u.reasonHistory.map((r, i) => (
                  <li key={i} className="py-2 text-xs flex justify-between">
                    <span className="text-on-surface font-semibold">
                      {r.action} — {r.reason}
                    </span>
                    <span className="text-outline">{r.when}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Record & Audit panels — present in every role */}
          <Card>
            <SectionTitle title="Records" hint="Read-only view from this directory" />
            <div className="flex flex-wrap gap-2">
              <CTA
                label="Audit & Log"
                tone="neutral"
                icon="fact_check"
                onClick={() => setShowAudit(true)}
              />
              {u.type === "Professional" && (
                <CTA
                  label="Trial Performance"
                  tone="neutral"
                  icon="workspace_premium"
                  onClick={() => setShowTrial(true)}
                />
              )}
            </div>
          </Card>

          {/*
           * Account Actions are resolved from the account's current state,
           * the acting admin's permissions and the account-type business
           * rules — never rendered as a fixed list. A Suspended account
           * therefore offers "Reactivate" and not "Suspend", and vice versa.
           */}
          {u.type !== "Professional" && (
            <Card>
              <SectionTitle title="Account Actions" hint={`Valid while ${u.status}`} />
              <ActionBar
                actions={actions}
                onRun={(action, reason) => onRunAction(action, reason)}
                emptyMessage={`No account action is available while this account is "${u.status}".`}
              />
            </Card>
          )}
          {u.type === "Professional" && (
            <Card>
              <SectionTitle
                title="Account Controls"
                hint="Professionals are managed from Workforce Control"
              />
              <p className="text-xs text-on-surface-variant">
                All hiring, trial, suspension & tier controls for professionals live in the{" "}
                <span className="font-bold text-on-surface">Workforce Control</span> module. This
                directory only records and exposes audit history.
              </p>
            </Card>
          )}
        </div>
      </div>
      {showAudit && <AuditLogPanel u={u} onClose={() => setShowAudit(false)} />}
      {showTrial && u.type === "Professional" && (
        <TrialPerformancePanel u={u as ProfessionalUser} onClose={() => setShowTrial(false)} />
      )}
    </div>
  );
};

/* ============================================================
 * Main Section
 * ============================================================ */

type FilterKey = "all" | "client" | "professional" | "intrial" | "admin";

interface Props {
  externalQuery?: string;
  openUserId?: string;
  /** Acting admin. Drives which actions are permitted at all. */
  role?: "super" | "sub";
}

export const UsersDirectorySection = ({
  externalQuery = "",
  openUserId,
  role = "super",
}: Props) => {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [openUser, setOpenUser] = useState<DirUser | null>(null);
  const [allUsersState, setAllUsersState] = useState<DirUser[]>(ALL_USERS);
  const [localQuery, setLocalQuery] = useState("");

  const actor = useMemo<Actor>(() => ({ role, id: `admin:${role}` }), [role]);

  const q = localQuery || externalQuery;

  useEffect(() => {
    if (!openUserId) return;
    const m = allUsersState.find((u) => u.id.toLowerCase() === openUserId.toLowerCase());
    if (m) setOpenUser(m);
  }, [openUserId, allUsersState]);

  const clientUsers = useMemo(
    () => allUsersState.filter((u) => u.type === "Client") as ClientUser[],
    [allUsersState],
  );
  const proUsers = useMemo(
    () => allUsersState.filter((u) => u.type === "Professional") as ProfessionalUser[],
    [allUsersState],
  );
  const adminUsers = useMemo(
    () => allUsersState.filter((u) => u.type === "Admin") as AdminUser[],
    [allUsersState],
  );

  const inTrialPros = useMemo(() => proUsers.filter((p) => p.inTrial), [proUsers]);
  const activePros = useMemo(() => proUsers.filter((p) => !p.inTrial), [proUsers]);

  const counts = useMemo(
    () => ({
      all: allUsersState.length,
      client: clientUsers.length,
      professional: activePros.length,
      intrial: inTrialPros.length,
      admin: adminUsers.length,
    }),
    [
      allUsersState.length,
      clientUsers.length,
      activePros.length,
      inTrialPros.length,
      adminUsers.length,
    ],
  );

  const baseRows: DirUser[] = useMemo(() => {
    if (filter === "client") return clientUsers;
    if (filter === "professional") return activePros;
    if (filter === "intrial") return inTrialPros;
    if (filter === "admin") return adminUsers;
    return allUsersState;
  }, [filter, clientUsers, activePros, inTrialPros, adminUsers, allUsersState]);

  const filtered = useMemo(() => {
    if (!q.trim()) return baseRows;
    const needle = q.toLowerCase();
    return baseRows.filter((u) =>
      [u.id, u.name, u.email, u.phone, u.type, u.status].join(" ").toLowerCase().includes(needle),
    );
  }, [baseRows, q]);

  /**
   * Every account mutation goes through `executeAccountAction`, which
   * re-checks state, permission, business rule, required reason and the
   * lifecycle transition *after* the click — and writes the audit event.
   *
   * `expectedStatus` is the status the drawer was rendered from. If another
   * admin changed the account in the meantime the request is rejected as
   * stale, nothing is mutated, and the drawer is reconciled to the current
   * record so the CTAs re-resolve.
   */
  const handleRunAction = useCallback(
    (
      userId: string,
      expectedStatus: AccountStatus,
      action: ResolvedAction<AccountState, AccountResource>,
      reason?: string,
    ) => {
      const current = allUsersState.find((u) => u.id === userId);
      if (!current) return;

      const result = executeAccountAction({
        actionId: action.id,
        account: toAccountResource(current),
        expectedStatus,
        actor,
        ...(reason !== undefined ? { reason } : {}),
        actorId: actor.id ?? actor.role,
      });

      if (!result.ok) {
        toast.error("Action not applied", { description: result.reason });
        // Reconcile the open drawer with the record as it actually is, so
        // the CTAs re-resolve from the real state instead of the stale one.
        setOpenUser((open) => (open && open.id === userId ? { ...current } : open));
        return;
      }

      if (!result.changed) {
        // Non-transition action (e.g. Reset Password) — audited, no state move.
        toast.success(`${result.label} — ${current.name}`);
        return;
      }

      const when = new Date().toISOString().slice(0, 10);
      const updated: DirUser = {
        ...current,
        status: result.status,
        reasonHistory: [
          { when, action: result.label, reason: reason?.trim() || "—" },
          ...current.reasonHistory,
        ],
      };
      setAllUsersState((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setOpenUser((open) => (open && open.id === userId ? updated : open));
      toast.success(`${result.label} — ${current.name}`, {
        description: `Status is now "${result.status}".`,
      });
    },
    [actor, allUsersState],
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <SectionHeader
          title="Users Directory"
          subtitle="Central database of every identity, account, profile, status, access & history."
        />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary-container/10 text-primary-container border border-primary-container/30">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}
          >
            database
          </span>
          Source of Truth
        </span>
      </div>

      <div className="w-full">
        <AuditSearchBar search={{ query: localQuery, onSearch: setLocalQuery }} />
      </div>

      {/* Filter tabs — five (incl. In-Trial Phase for pros) */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <Pill
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
          count={counts.all}
        />
        <Pill
          active={filter === "client"}
          onClick={() => setFilter("client")}
          label="Client"
          count={counts.client}
        />
        <Pill
          active={filter === "professional"}
          onClick={() => setFilter("professional")}
          label="Professionals"
          count={counts.professional}
        />
        <Pill
          active={filter === "intrial"}
          onClick={() => setFilter("intrial")}
          label="(Pros) In-Trial Phase"
          count={counts.intrial}
        />
        <Pill
          active={filter === "admin"}
          onClick={() => setFilter("admin")}
          label="Admin"
          count={counts.admin}
        />
      </div>

      {/* Unified table — identical structure across all tabs */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-container-high text-[10px] uppercase tracking-wider text-outline">
                <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">User ID</th>
                <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Name</th>
                <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Email</th>
                <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Phone</th>
                <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Type</th>
                <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Status</th>
                <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Verification</th>
                <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Registered</th>
                <th className="text-right font-bold px-4 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container-low/60">
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="font-mono text-xs">{u.id}</span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} />
                      <span className="font-bold text-on-surface">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-on-surface-variant">
                    {u.email}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-on-surface-variant">
                    {u.phone}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <Badge tone={TYPE_TONE[u.type]}>{u.type}</Badge>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <Badge tone={STATUS_TONE[displayStatus(u)]}>{displayStatus(u)}</Badge>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-xs font-semibold">
                    {u.verification}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-xs text-outline">{u.joined}</td>
                  <td className="px-4 py-2.5 text-right">
                    {/*
                     * Row CTA is the most relevant valid next action for this
                     * account's state (e.g. "Review Account" while Suspended),
                     * falling back to plain navigation when the state offers
                     * no action. Resolved from the same rules as the drawer.
                     */}
                    {(() => {
                      const primary = getPrimaryAction({
                        definitions: ACCOUNT_ACTIONS,
                        state: u.status,
                        resource: toAccountResource(u),
                        actor,
                      });
                      return (
                        <CTA
                          label={primary?.label ?? "View Profile"}
                          tone="primary"
                          icon={primary?.icon ?? "visibility"}
                          onClick={() => setOpenUser(u)}
                        />
                      );
                    })()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-xs text-on-surface-variant"
                  >
                    No users match this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {openUser && (
        <ProfileDetail
          u={openUser}
          actor={actor}
          onClose={() => setOpenUser(null)}
          onRunAction={(action, reason) =>
            handleRunAction(openUser.id, openUser.status, action, reason)
          }
        />
      )}
    </div>
  );
};

export default UsersDirectorySection;
