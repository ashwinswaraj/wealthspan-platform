/**
 * Wealthspan finance domain — shared constants.
 *
 * Single source of truth for the fixed lists the app, the API and the
 * chatbot all rely on. See docs/Database/41_Wealthspan_Data_Model.md.
 *
 * Money is always stored as integer paise (₹1 = 100 paise), never floats.
 */

/* ------------------------------------------------------------------ *
 * Transaction types
 * ------------------------------------------------------------------ */

/**
 * income   — money came in (counts toward profit)
 * expense  — money went out (counts toward profit, unless it belongs to an
 *            OPEN event — see FINANCE_EVENT_STATUSES)
 * transfer — the user's own money moved between two of their accounts
 *            (card bill payment, cash deposit, putting money in an
 *            investment). NEVER counts as income or expense.
 */
export const TRANSACTION_TYPES = ["income", "expense", "transfer"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

/* ------------------------------------------------------------------ *
 * Payment modes (fixed list — the user must pick one for income/expense)
 * ------------------------------------------------------------------ */

export const PAYMENT_MODES = [
  { id: "cash", label: "Cash" },
  { id: "upi", label: "UPI" },
  { id: "debit_card", label: "Debit card" },
  { id: "credit_card", label: "Credit card" },
  { id: "bank_transfer", label: "Bank transfer (NEFT / IMPS / RTGS)" },
  { id: "cheque", label: "Cheque" },
  { id: "wallet", label: "Wallet" },
] as const;

export type PaymentModeId = (typeof PAYMENT_MODES)[number]["id"];

export const PAYMENT_MODE_IDS = PAYMENT_MODES.map((m) => m.id) as readonly PaymentModeId[];

/* ------------------------------------------------------------------ *
 * Accounts (where the money sits) and projects (what it belongs to)
 * ------------------------------------------------------------------ */

/**
 * credit_card is a liability: spending makes its balance go negative, and
 * paying the bill (a transfer from a bank account) brings it back to zero.
 */
export const ACCOUNT_KINDS = ["cash", "bank", "credit_card", "wallet"] as const;
export type AccountKind = (typeof ACCOUNT_KINDS)[number];

/** Which account kinds can legitimately be used with each payment mode. */
export const PAYMENT_MODE_ACCOUNT_KINDS: Record<PaymentModeId, readonly AccountKind[]> = {
  cash: ["cash"],
  upi: ["bank", "wallet"],
  debit_card: ["bank"],
  credit_card: ["credit_card"],
  bank_transfer: ["bank"],
  cheque: ["bank"],
  wallet: ["wallet"],
};

/**
 * A project is a "money space" with its own profit and loss: Personal, or
 * one per business / per income source that has its own costs.
 */
export const PROJECT_KINDS = ["personal", "business"] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];

/* ------------------------------------------------------------------ *
 * Default categories (users can add their own later)
 * ------------------------------------------------------------------ */

export const EXPENSE_CATEGORIES = [
  "Food & Groceries",
  "Rent & Housing",
  "Utilities & Bills",
  "Travel & Fuel",
  "Medical & Health",
  "Shopping",
  "Dining Out",
  "Office & Operations",
  "Stock & Inventory",
  "Salaries & Wages",
  "Loan EMI",
  "Other",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Business Sales",
  "Freelance & Services",
  "Rent Received",
  "Interest & Dividends",
  "Other",
] as const;

/* ------------------------------------------------------------------ *
 * Events (festivals & functions), loans, investments
 * ------------------------------------------------------------------ */

/**
 * open      — spending is tracked per event but is NOT yet in the Expense
 *             totals (shown as a separate "open events" line).
 * concluded — the same transactions now count as normal Expense, on their
 *             own dates. Nothing is duplicated.
 */
export const FINANCE_EVENT_STATUSES = ["open", "concluded"] as const;
export type FinanceEventStatus = (typeof FINANCE_EVENT_STATUSES)[number];

export const LOAN_STATUSES = ["active", "closed"] as const;
export type LoanStatus = (typeof LOAN_STATUSES)[number];

export const INVESTMENT_KINDS = [
  "fixed_deposit",
  "recurring_deposit",
  "sip",
  "mutual_fund",
  "stocks",
  "gold",
  "ppf_epf_nps",
  "real_estate",
  "other",
] as const;
export type InvestmentKind = (typeof INVESTMENT_KINDS)[number];

/* ------------------------------------------------------------------ *
 * Who made a change (used by the audit log)
 * ------------------------------------------------------------------ */

export const CHANGE_SOURCES = ["manual", "chatbot", "system"] as const;
export type ChangeSource = (typeof CHANGE_SOURCES)[number];

/* ------------------------------------------------------------------ *
 * Chatbot tool policy
 *
 * The chatbot never touches the database directly. It can only call the
 * tools below, and the server decides — from this table — whether the user
 * must confirm first. The user's identity always comes from the login
 * token, never from anything the model says.
 *
 *   none    — runs immediately (read-only, or creates a file only)
 *   undo    — runs immediately and shows an "Undo" option
 *   confirm — shows what will change and waits for the user to confirm
 * ------------------------------------------------------------------ */

export type ConfirmationLevel = "none" | "undo" | "confirm";

export const CHATBOT_TOOL_POLICY = {
  // read
  search_transactions: "none",
  get_summary: "none",
  list_projects: "none",
  list_accounts: "none",
  list_loans: "none",
  list_investments: "none",
  list_events: "none",
  generate_file: "none",
  // add
  create_transaction: "undo",
  create_project: "undo",
  create_account: "undo",
  create_loan: "undo",
  create_investment: "undo",
  create_event: "undo",
  // change
  update_transaction: "confirm",
  update_project: "confirm",
  update_account: "confirm",
  update_loan: "confirm",
  update_investment: "confirm",
  update_event: "confirm",
  conclude_event: "confirm",
  reopen_event: "confirm",
  // remove (always a soft delete, recoverable for 30 days)
  delete_transaction: "confirm",
  delete_project: "confirm",
  delete_account: "confirm",
  delete_loan: "confirm",
  delete_investment: "confirm",
  delete_event: "confirm",
} as const satisfies Record<string, ConfirmationLevel>;

export type ChatbotToolName = keyof typeof CHATBOT_TOOL_POLICY;

/** Changing or adding more than this many rows in one go always needs a confirmation. */
export const CHATBOT_BULK_CONFIRM_THRESHOLD = 3;

/** How long a soft-deleted record stays recoverable. */
export const SOFT_DELETE_RETENTION_DAYS = 30;

/**
 * Whether a tool call needs the user's confirmation before it runs.
 * `affectedRows` is how many records the call would add/change/delete.
 */
export function confirmationFor(tool: ChatbotToolName, affectedRows = 1): ConfirmationLevel {
  const base: ConfirmationLevel = CHATBOT_TOOL_POLICY[tool];
  if (base === "none") return "none";
  if (affectedRows > CHATBOT_BULK_CONFIRM_THRESHOLD) return "confirm";
  return base;
}
