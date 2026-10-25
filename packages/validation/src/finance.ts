/**
 * Wealthspan finance validation.
 *
 * Same style as the rest of this package: plain functions, no schema
 * library. Field-level validators return an error string or null;
 * `validate*Input` functions return a `{ field: message }` map that is
 * empty when the input is valid. The API and the app MUST both use these,
 * so a record the app accepts is never rejected by the server (or the
 * chatbot) for a different reason.
 *
 * `amount` inputs are RUPEES typed by a person (number or "1,200.50");
 * conversion to integer paise happens in @jobrio/utils.
 */

import {
  ACCOUNT_KINDS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  INVESTMENT_KINDS,
  PAYMENT_MODE_ACCOUNT_KINDS,
  PAYMENT_MODE_IDS,
  PROJECT_KINDS,
  TRANSACTION_TYPES,
  type AccountKind,
  type PaymentModeId,
} from "@jobrio/constants/finance";

export type FieldErrors = Record<string, string>;

/** ₹100 crore — a sanity ceiling that catches typos like an extra zero or two. */
export const MAX_AMOUNT_RUPEES = 1_000_000_000;

const isBlank = (v: unknown) => v === undefined || v === null || (typeof v === "string" && !v.trim());

/* ------------------------------------------------------------------ *
 * Field validators
 * ------------------------------------------------------------------ */

/** Rupees as typed: 500, "500", "1,200.50", "₹ 3000". */
export const parseRupees = (value: unknown): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[₹,\s]/g, "");
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
};

export const validateAmountRupees = (value: unknown, label = "Amount"): string | null => {
  if (isBlank(value)) return `${label} is required.`;
  const n = parseRupees(value);
  if (n === null) return `${label} must be a number.`;
  if (n <= 0) return `${label} must be greater than 0.`;
  if (n > MAX_AMOUNT_RUPEES) return `${label} looks too large. Please check the zeros.`;
  if (Math.round(n * 100) / 100 !== n) return `${label} can have at most 2 decimal places.`;
  return null;
};

/** `YYYY-MM-DD`, a real calendar date. */
export const isValidIsoDate = (value: unknown): boolean => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

export const validateDate = (value: unknown, today?: string, label = "Date"): string | null => {
  if (isBlank(value)) return `${label} is required.`;
  if (!isValidIsoDate(value)) return `${label} must be a valid date (YYYY-MM-DD).`;
  if (today && isValidIsoDate(today) && daysBetween(today, value as string) > 366)
    return `${label} is more than a year in the future.`;
  return null;
};

export const validatePaymentMode = (value: unknown, label = "Payment mode"): string | null => {
  if (isBlank(value)) return `${label} is required.`;
  if (!PAYMENT_MODE_IDS.includes(value as PaymentModeId)) return `Please choose a valid ${label.toLowerCase()}.`;
  return null;
};

/** Cash must be paid from a cash account, credit card from a card, and so on. */
export const validatePaymentModeForAccount = (
  mode: PaymentModeId,
  accountKind: AccountKind,
): string | null =>
  PAYMENT_MODE_ACCOUNT_KINDS[mode].includes(accountKind)
    ? null
    : `A ${accountKind.replace("_", " ")} account can't be used with this payment mode.`;

const maxLen = (v: unknown, max: number, label: string): string | null =>
  typeof v === "string" && v.trim().length > max ? `${label} must be at most ${max} characters.` : null;

/* ------------------------------------------------------------------ *
 * Transactions
 * ------------------------------------------------------------------ */

export interface TransactionInput {
  type?: string;
  amount?: number | string;
  date?: string;
  projectId?: string | null;
  accountId?: string | null;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  paymentMode?: string | null;
  category?: string | null;
  party?: string | null;
  source?: string | null;
  note?: string | null;
  eventId?: string | null;
  loanId?: string | null;
  investmentId?: string | null;
}

export interface ValidateTransactionOptions {
  /** Today's date (YYYY-MM-DD) for the "too far in the future" check. */
  today?: string;
}

export const validateTransactionInput = (
  input: TransactionInput,
  opts: ValidateTransactionOptions = {},
): FieldErrors => {
  const e: FieldErrors = {};
  const set = (field: string, msg: string | null) => {
    if (msg && !e[field]) e[field] = msg;
  };

  if (isBlank(input.type)) set("type", "Type is required.");
  else if (!TRANSACTION_TYPES.includes(input.type as (typeof TRANSACTION_TYPES)[number]))
    set("type", "Type must be income, expense or transfer.");

  set("amount", validateAmountRupees(input.amount));
  set("date", validateDate(input.date, opts.today));
  set("party", maxLen(input.party, 120, "Name"));
  set("note", maxLen(input.note, 500, "Note"));

  const type = input.type;

  if (type === "income" || type === "expense") {
    if (isBlank(input.projectId)) set("projectId", "Project is required.");
    if (isBlank(input.accountId)) set("accountId", "Account is required.");
    set("paymentMode", validatePaymentMode(input.paymentMode));
    if (isBlank(input.category)) set("category", "Category is required.");
    if (!isBlank(input.fromAccountId) || !isBlank(input.toAccountId))
      set("fromAccountId", "From/To accounts are only for transfers.");
    if (!isBlank(input.investmentId))
      set("investmentId", "Only a transfer can be linked to an investment.");

    if (type === "income") {
      if (!isBlank(input.eventId)) set("eventId", "Income cannot belong to an event.");
      if (!isBlank(input.loanId)) set("loanId", "Income cannot be a loan payment.");
    } else if (!isBlank(input.source)) {
      set("source", "Income source is only for income.");
    }
  } else if (type === "transfer") {
    if (isBlank(input.fromAccountId)) set("fromAccountId", "From account is required.");
    if (isBlank(input.toAccountId)) set("toAccountId", "To account is required.");
    if (!isBlank(input.fromAccountId) && input.fromAccountId === input.toAccountId)
      set("toAccountId", "From and To accounts must be different.");
    if (!isBlank(input.accountId)) set("accountId", "A transfer uses From and To accounts.");
    if (!isBlank(input.projectId)) set("projectId", "A transfer does not belong to a project.");
    if (!isBlank(input.category)) set("category", "A transfer has no category.");
    if (!isBlank(input.eventId)) set("eventId", "A transfer cannot belong to an event.");
    if (!isBlank(input.loanId)) set("loanId", "Record loan payments as an expense linked to the loan.");
    if (!isBlank(input.source)) set("source", "Income source is only for income.");
  }

  return e;
};

/* ------------------------------------------------------------------ *
 * Projects, accounts, loans, investments, events
 * ------------------------------------------------------------------ */

const validateName = (v: unknown, label: string): string | null => {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return `${label} is required.`;
  if (s.length < 2) return `${label} must be at least 2 characters.`;
  if (s.length > 60) return `${label} must be at most 60 characters.`;
  return null;
};

export const validateProjectInput = (input: { name?: string; kind?: string }): FieldErrors => {
  const e: FieldErrors = {};
  const n = validateName(input.name, "Project name");
  if (n) e.name = n;
  if (isBlank(input.kind)) e.kind = "Project type is required.";
  else if (!PROJECT_KINDS.includes(input.kind as (typeof PROJECT_KINDS)[number]))
    e.kind = "Project type must be personal or business.";
  return e;
};

export const validateAccountInput = (input: {
  name?: string;
  kind?: string;
  openingBalance?: number | string;
  creditLimit?: number | string | null;
}): FieldErrors => {
  const e: FieldErrors = {};
  const n = validateName(input.name, "Account name");
  if (n) e.name = n;
  if (isBlank(input.kind)) e.kind = "Account type is required.";
  else if (!ACCOUNT_KINDS.includes(input.kind as AccountKind))
    e.kind = "Account type must be cash, bank, credit card or wallet.";
  if (!isBlank(input.openingBalance)) {
    const v = parseRupees(input.openingBalance);
    if (v === null) e.openingBalance = "Opening balance must be a number.";
    else if (v > MAX_AMOUNT_RUPEES) e.openingBalance = "Opening balance looks too large.";
    else if (Math.round(v * 100) / 100 !== v) e.openingBalance = "Opening balance can have at most 2 decimal places.";
  }
  if (!isBlank(input.creditLimit)) {
    if (input.kind !== "credit_card") e.creditLimit = "Credit limit is only for credit cards.";
    else {
      const err = validateAmountRupees(input.creditLimit, "Credit limit");
      if (err) e.creditLimit = err;
    }
  }
  return e;
};

export const validateLoanInput = (input: {
  lender?: string;
  principal?: number | string;
  interestRatePct?: number | string | null;
  emi?: number | string | null;
  emiDayOfMonth?: number | string | null;
  tenureMonths?: number | string | null;
  projectId?: string | null;
}): FieldErrors => {
  const e: FieldErrors = {};
  if (isBlank(input.projectId)) e.projectId = "Project is required.";
  const l = validateName(input.lender, "Lender");
  if (l) e.lender = l;
  const p = validateAmountRupees(input.principal, "Loan amount");
  if (p) e.principal = p;
  if (!isBlank(input.emi)) {
    const err = validateAmountRupees(input.emi, "EMI");
    if (err) e.emi = err;
  }
  if (!isBlank(input.interestRatePct)) {
    const r = Number(input.interestRatePct);
    if (!Number.isFinite(r) || r < 0 || r > 100) e.interestRatePct = "Interest rate must be between 0 and 100.";
  }
  if (!isBlank(input.emiDayOfMonth)) {
    const d = Number(input.emiDayOfMonth);
    if (!Number.isInteger(d) || d < 1 || d > 31) e.emiDayOfMonth = "EMI day must be between 1 and 31.";
  }
  if (!isBlank(input.tenureMonths)) {
    const t = Number(input.tenureMonths);
    if (!Number.isInteger(t) || t < 1 || t > 600) e.tenureMonths = "Tenure must be between 1 and 600 months.";
  }
  return e;
};

export const validateInvestmentInput = (input: {
  name?: string;
  kind?: string;
  currentValue?: number | string | null;
  projectId?: string | null;
}): FieldErrors => {
  const e: FieldErrors = {};
  if (isBlank(input.projectId)) e.projectId = "Project is required.";
  const n = validateName(input.name, "Investment name");
  if (n) e.name = n;
  if (isBlank(input.kind)) e.kind = "Investment type is required.";
  else if (!INVESTMENT_KINDS.includes(input.kind as (typeof INVESTMENT_KINDS)[number]))
    e.kind = "Please choose a valid investment type.";
  if (!isBlank(input.currentValue)) {
    const err = validateAmountRupees(input.currentValue, "Current value");
    if (err) e.currentValue = err;
  }
  return e;
};

export const validateEventInput = (input: {
  name?: string;
  budget?: number | string | null;
  startDate?: string | null;
  endDate?: string | null;
  projectId?: string | null;
}): FieldErrors => {
  const e: FieldErrors = {};
  if (isBlank(input.projectId)) e.projectId = "Project is required.";
  const n = validateName(input.name, "Event name");
  if (n) e.name = n;
  if (!isBlank(input.budget)) {
    const err = validateAmountRupees(input.budget, "Budget");
    if (err) e.budget = err;
  }
  if (!isBlank(input.startDate) && !isValidIsoDate(input.startDate)) e.startDate = "Start date must be a valid date.";
  if (!isBlank(input.endDate) && !isValidIsoDate(input.endDate)) e.endDate = "End date must be a valid date.";
  if (!e.startDate && !e.endDate && input.startDate && input.endDate && input.endDate < input.startDate)
    e.endDate = "End date can't be before the start date.";
  return e;
};

/** Convenience: the category lists the forms should offer by default. */
export const defaultCategoriesFor = (type: "income" | "expense"): readonly string[] =>
  type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
