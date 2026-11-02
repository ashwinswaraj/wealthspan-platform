import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AdminAuditRow,
  AdminHealthRow,
  AdminLedgerRow,
  AdminOverview,
  AdminPaymentRow,
  AdminUserRow,
} from "./types";

/**
 * Admin API client. The admin app is served from the same Catalyst domain as the functions, so the browser
 * session cookie authenticates every call; the server decides who is an admin (never the client).
 * Base defaults to "/server" (override with VITE_API_BASE).
 */
const base = () => String(import.meta.env.VITE_API_BASE ?? "/server").replace(/\/$/, "");

export class AdminApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${base()}/finance/admin${path}`, {
    method: init.method ?? "GET",
    credentials: "include",
    headers: {
      "X-Requested-With": "wealthspan",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) {
    let message = `Admin API ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string };
      if (typeof body.message === "string" && body.message) message = body.message;
    } catch {
      /* keep the generic message */
    }
    throw new AdminApiError(res.status, message);
  }
  return (await res.json()) as T;
}

/** Who is signed in, and are they an admin? Drives the sign-in gate. */
export const useAdminSession = () =>
  useQuery({
    queryKey: ["admin", "me"],
    retry: false,
    queryFn: () => call<{ email: string; name: string; isAdmin: boolean }>("/me"),
  });

export const useAdminOverview = () =>
  useQuery({
    queryKey: ["admin", "overview"],
    retry: false,
    queryFn: () => call<AdminOverview>("/overview"),
  });

export const useAdminUsers = () =>
  useQuery({
    queryKey: ["admin", "users"],
    retry: false,
    queryFn: () => call<{ users: AdminUserRow[] }>("/users").then((r) => r.users),
  });

export const useAdminPayments = (status: "all" | "pending" | "approved" | "rejected") =>
  useQuery({
    queryKey: ["admin", "payments", status],
    retry: false,
    queryFn: () =>
      call<{ payments: AdminPaymentRow[] }>(`/payments?status=${status}`).then((r) => r.payments),
  });

export const useReviewPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; decision: "approve" | "reject"; note?: string }) =>
      call(`/payments/${v.id}/${v.decision}`, { method: "POST", body: { note: v.note ?? null } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "payments"] });
      qc.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });
};

export const useAdminLedger = () =>
  useQuery({
    queryKey: ["admin", "ledger"],
    retry: false,
    queryFn: () => call<{ rows: AdminLedgerRow[] }>("/ledger").then((r) => r.rows),
  });

export const useAdminAudit = () =>
  useQuery({
    queryKey: ["admin", "audit"],
    retry: false,
    queryFn: () => call<{ rows: AdminAuditRow[] }>("/audit").then((r) => r.rows),
  });

export const useAdminHealth = () =>
  useQuery({
    queryKey: ["admin", "health"],
    retry: false,
    refetchInterval: 30_000,
    queryFn: () => call<{ checks: AdminHealthRow[] }>("/health").then((r) => r.checks),
  });

export interface AdminPlan {
  label: string;
  pricePaise: number;
  days: number;
}
export type AdminPlanId = "trial" | "pro_monthly" | "pro_annual";

export const useAdminPlans = () =>
  useQuery({
    queryKey: ["admin", "plans"],
    retry: false,
    queryFn: () => call<{ plans: Record<AdminPlanId, AdminPlan> }>("/plans").then((r) => r.plans),
  });

export const useSavePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: AdminPlanId; label: string; priceRupees: number; days: number }) =>
      call(`/plans/${v.id}`, {
        method: "PUT",
        body: { label: v.label, priceRupees: v.priceRupees, days: v.days },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "plans"] });
      qc.invalidateQueries({ queryKey: ["admin", "payments"] });
      qc.invalidateQueries({ queryKey: ["admin", "overview"] });
      qc.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });
};

export interface AdminBroadcast {
  id: string;
  title: string;
  body: string;
  audience: "ALL" | "FREE" | "GO" | "PRO";
  severity: "INFO" | "WARNING" | "CRITICAL";
  createdAt: string;
}

export const useAdminBroadcasts = () =>
  useQuery({
    queryKey: ["admin", "broadcasts"],
    retry: false,
    queryFn: () => call<{ broadcasts: AdminBroadcast[] }>("/broadcasts").then((r) => r.broadcasts),
  });

export const useSendBroadcast = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { title: string; body: string; audience: string; severity: string }) =>
      call<AdminBroadcast>("/broadcasts", { method: "POST", body: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "broadcasts"] });
      qc.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });
};
