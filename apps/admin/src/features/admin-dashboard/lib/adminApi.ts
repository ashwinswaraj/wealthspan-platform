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
    headers: init.body ? { "Content-Type": "application/json" } : undefined,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) throw new AdminApiError(res.status, `Admin API ${res.status}`);
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
  useQuery({ queryKey: ["admin", "overview"], retry: false, queryFn: () => call<AdminOverview>("/overview") });

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
