/**
 * Wealthspan finance domain — shared types (frontend / backend contract).
 *
 * All money fields are integer paise (₹1 = 100 paise). All dates are
 * `YYYY-MM-DD` strings (local calendar date); timestamps are ISO strings.
 *
 * NOTE: the types below describe the data model in
 * docs/Database/41_Wealthspan_Data_Model.md. They intentionally do not
 * mention any database product.
 */

export type FinanceTransactionType = "income" | "expense" | "transfer";
export type FinancePaymentMode =
  "cash" | "upi" | "debit_card" | "credit_card" | "bank_transfer" | "cheque" | "wallet";
export type FinanceAccountKind = "cash" | "bank" | "credit_card" | "wallet";
export type FinanceProjectKind = "personal" | "business";
export type FinanceEventStatusType = "open" | "concluded";
export type FinanceLoanStatusType = "active" | "closed";
export type FinanceChangeSource = "manual" | "chatbot" | "system";

interface FinanceRecordBase {
  id: string;
  /** Owner. Always taken from the login token on the server. */
  userId: string;
  createdAt: string;
  updatedAt: string;
  /** Set when soft-deleted; the record is hidden but recoverable for 30 days. */
  deletedAt: string | null;
  createdBy: FinanceChangeSource;
}

/** A "money space" with its own profit and loss (Personal, or one per business). */
export interface FinanceProject extends FinanceRecordBase {
  name: string;
  kind: FinanceProjectKind;
  archivedAt: string | null;
}

/** Where money sits: a cash pouch, a bank account, a credit card or a wallet. */
export interface FinanceAccount extends FinanceRecordBase {
  name: string;
  kind: FinanceAccountKind;
  /** Balance on the day the user started using Wealthspan. */
  openingBalancePaise: number;
  /** Credit cards only. */
  creditLimitPaise: number | null;
  /** Business accounts can default new entries to a project. */
  defaultProjectId: string | null;
  archivedAt: string | null;
}

/**
 * One money movement.
 *
 * income / expense: `projectId`, `accountId`, `paymentMode`, `category` set.
 * transfer: `fromAccountId` + `toAccountId` set; no project, category or mode.
 */
export interface FinanceTransaction extends FinanceRecordBase {
  type: FinanceTransactionType;
  amountPaise: number;
  date: string;
  projectId: string | null;
  accountId: string | null;
  fromAccountId: string | null;
  toAccountId: string | null;
  paymentMode: FinancePaymentMode | null;
  category: string | null;
  /** Who was paid / who paid. */
  party: string | null;
  /** Income only: which income source ("Salary — ABC Ltd", "Shop sales"). */
  source: string | null;
  note: string | null;
  /** Expense only: belongs to a festival / function. */
  eventId: string | null;
  /** Expense only: this is an EMI / repayment for a loan. */
  loanId: string | null;
  /** Transfer only: money put into an investment. */
  investmentId: string | null;
}

export interface FinanceLoan extends FinanceRecordBase {
  projectId: string;
  lender: string;
  principalPaise: number;
  interestRatePct: number | null;
  emiPaise: number | null;
  /** 1–31 */
  emiDayOfMonth: number | null;
  startDate: string | null;
  tenureMonths: number | null;
  status: FinanceLoanStatusType;
}

export interface FinanceInvestment extends FinanceRecordBase {
  projectId: string;
  name: string;
  kind:
    | "fixed_deposit"
    | "recurring_deposit"
    | "sip"
    | "mutual_fund"
    | "stocks"
    | "gold"
    | "ppf_epf_nps"
    | "real_estate"
    | "other";
  /** Latest value the user entered; Wealthspan does not fetch market prices. */
  currentValuePaise: number | null;
  folioNo: string | null;
}

/** A festival or function whose spending is tracked separately until concluded. */
export interface FinanceEvent extends FinanceRecordBase {
  projectId: string;
  name: string;
  budgetPaise: number | null;
  startDate: string | null;
  endDate: string | null;
  status: FinanceEventStatusType;
  concludedAt: string | null;
}

/** Every change made through the chatbot (and manual edits) is recorded here. */
export interface FinanceAuditEntry {
  id: string;
  userId: string;
  actor: FinanceChangeSource;
  /** Chatbot tool name or API action. */
  action: string;
  entity: "transaction" | "project" | "account" | "loan" | "investment" | "event";
  entityId: string;
  before: unknown;
  after: unknown;
  createdAt: string;
  undoneAt: string | null;
}

/** What the server returns when a chatbot tool needs the user's go-ahead. */
export interface ChatbotPendingConfirmation {
  confirmationId: string;
  tool: string;
  /** Plain-language description: "Delete ₹500 'chai' (3 Oct, Kirana Shop)". */
  summary: string;
  affectedRows: number;
  /** For edits: the fields that will change. */
  changes?: Array<{ field: string; from: unknown; to: unknown }>;
  expiresAt: string;
}

/* ------------------------------------------------------------------ *
 * Report shapes
 * ------------------------------------------------------------------ */

export interface FinanceSummary {
  incomePaise: number;
  /** Expense that counts toward profit (excludes OPEN events). */
  expensePaise: number;
  profitPaise: number;
  /** Spending on events that are still open — shown on its own line. */
  openEventsPaise: number;
  byCategory: Record<string, number>;
  byPaymentMode: Record<string, number>;
  bySource: Record<string, number>;
  byEvent: Record<string, number>;
}
