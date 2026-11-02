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

/** Everything the admin console reads. Cross-user on purpose: only ever reachable behind the admin check. */
export interface AdminStore {
  listUsers(): Promise<AdminUserRecord[]>;
  countRows(table: "projects" | "transactions"): Promise<number>;
  listAllPayments(status?: PaymentStatus): Promise<PaymentSubmission[]>;
  listAllSubscriptions(): Promise<Subscription[]>;
  recentTransactions(limit: number): Promise<AdminTxRecord[]>;
  recentAudit(limit: number): Promise<AdminAuditRecord[]>;
}
