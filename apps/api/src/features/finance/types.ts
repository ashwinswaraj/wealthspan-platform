import type {
  FinanceAccount,
  FinanceAuditEntry,
  FinanceEvent,
  FinanceInvestment,
  FinanceLoan,
  FinanceProject,
  FinanceTransaction,
} from "@wealthspan/types";

/** A transaction row before the database gives it an id and timestamps. */
export type NewTransaction = Omit<
  FinanceTransaction,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;

/**
 * Everything the finance service needs from the database. Every method takes
 * the userId and must only ever return that user's rows. The Catalyst Data
 * Store implementation lives in apps/api/catalyst; tests use an in-memory one.
 */
export interface FinanceStore {
  getProject(userId: string, id: string): Promise<FinanceProject | null>;
  getAccount(userId: string, id: string): Promise<FinanceAccount | null>;
  getEvent(userId: string, id: string): Promise<FinanceEvent | null>;
  getLoan(userId: string, id: string): Promise<FinanceLoan | null>;
  getInvestment(userId: string, id: string): Promise<FinanceInvestment | null>;
  /** Live (not soft-deleted) rows only. */
  listTransactions(userId: string): Promise<FinanceTransaction[]>;
  listEvents(userId: string): Promise<FinanceEvent[]>;
  /** Optional fast count of live rows (used for the per-user entry cap). */
  countTransactions?(userId: string): Promise<number>;
  getTransaction(userId: string, id: string): Promise<FinanceTransaction | null>;
  insertTransaction(row: NewTransaction): Promise<FinanceTransaction>;
  updateTransaction(
    userId: string,
    id: string,
    patch: Partial<NewTransaction>,
  ): Promise<FinanceTransaction>;
  softDeleteTransaction(userId: string, id: string, deletedAtIso: string): Promise<void>;
  insertAudit(entry: Omit<FinanceAuditEntry, "id">): Promise<void>;
}

export interface TransactionListFilter {
  from?: string;
  to?: string;
  projectId?: string;
  accountId?: string;
  type?: "income" | "expense" | "transfer";
  limit?: number;
  offset?: number;
}
