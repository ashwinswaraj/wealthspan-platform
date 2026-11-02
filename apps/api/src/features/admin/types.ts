import type { PaymentStatus, PaymentSubmission, Subscription } from "../subscription";

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  createdAt: string; // ISO-like
  active: boolean;
}

export interface AdminTxRecord {
  id: string;
  type: string;
  category: string | null;
  party: string | null;
  paymentMode: string | null;
  amountPaise: number;
  projectName: string | null;
  createdAt: string;
}

export interface AdminAuditRecord {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  actor: string;
  createdAt: string;
}

export const BROADCAST_AUDIENCES = ["ALL", "FREE", "GO", "PRO"] as const;
export const BROADCAST_SEVERITIES = ["INFO", "WARNING", "CRITICAL"] as const;
export type BroadcastAudience = (typeof BROADCAST_AUDIENCES)[number];
export type BroadcastSeverity = (typeof BROADCAST_SEVERITIES)[number];

export interface Broadcast {
  id: string;
  title: string;
  body: string;
  audience: BroadcastAudience;
  severity: BroadcastSeverity;
  createdBy: string;
  createdAt: string;
}

/** Everything the admin console reads. Cross-user on purpose: only ever reachable behind the admin check. */
export interface AdminStore {
  listUsers(): Promise<AdminUserRecord[]>;
  countRows(table: "projects" | "transactions"): Promise<number>;
  listAllPayments(status?: PaymentStatus): Promise<PaymentSubmission[]>;
  listAllSubscriptions(): Promise<Subscription[]>;
  recentTransactions(limit: number): Promise<AdminTxRecord[]>;
  recentAudit(limit: number): Promise<AdminAuditRecord[]>;
  insertAudit(row: {
    action: string;
    entity: string;
    entityId: string | null;
    actor: string;
    /** Free text kept in `after_json`, e.g. the plan id. */
    detail?: string;
  }): Promise<void>;
  listBroadcasts(limit: number): Promise<Broadcast[]>;
  insertBroadcast(b: Omit<Broadcast, "id" | "createdAt">): Promise<Broadcast>;
}
