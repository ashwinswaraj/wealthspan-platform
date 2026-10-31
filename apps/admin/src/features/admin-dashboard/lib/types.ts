/**
 * Data contract between the admin screens and the Catalyst `admin` API (`/server/finance/admin/*`).
 * Every field is optional-by-design: when the API has no value (or is not deployed yet) the screen shows "—",
 * never an invented number. Money is integer paise (format with `formatINR` from @jobrio/utils/finance).
 */
export type PlanTier = "Free" | "Go" | "Pro";

export interface AdminOverview {
  users: number | null;
  usersByPlan: { free: number; go: number; pro: number } | null;
  projects: number | null;
  transactions: number | null;
  /** Sum of the last 30 days' monthly-equivalent approved subscriptions, in paise. */
  mrrPaise: number | null;
  pendingPayments: number | null;
  /** Daily new users for the last 30 days (sparkline). */
  usersTrend: number[];
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  /** Short public code, e.g. WSP-94021. */
  code: string;
  role: string;
  plan: PlanTier;
  planValidity: string; // "15 Jan 2026" | "Lifetime Free Tier"
  activeSince: string; // "15 Jan 2025"
  status: "Active" | "Flagged" | "Suspended";
  isSuperAdmin: boolean;
}

export type PaymentStatusLabel = "pending" | "approved" | "rejected";

export interface AdminPaymentRow {
  id: string;
  utr: string;
  userEmail: string;
  /** Code the user writes in the UPI remark (WSP-xxxxx): match it on the bank statement before approving. */
  reference?: string;
  plan: string; // "Pro — annual"
  amountPaise: number;
  orderId: string;
  createdAt: string; // ISO
  status: PaymentStatusLabel;
}

export interface AdminLedgerRow {
  id: string;
  project: string;
  category: string;
  counterparty: string;
  amountPaise: number;
  mode: string;
  status: "Cleared" | "Pending Review" | "In Transit";
  createdAt: string; // ISO
}

export interface AdminAuditRow {
  id: string;
  title: string;
  description: string;
  actor: string;
  at: string; // ISO
}

export interface AdminHealthRow {
  name: string; // "Core API (finance)"
  ok: boolean | null; // null = not checked
  latencyMs: number | null;
}
