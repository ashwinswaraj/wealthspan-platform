/**
 * Wealthspan finance calculations — pure functions, no I/O.
 *
 * The app, the API and the chatbot all call these, so a number shown on a
 * screen, in a file, or spoken by the chatbot always comes from the same
 * code. The chatbot never does the arithmetic itself.
 *
 * Money is integer paise. Dates are `YYYY-MM-DD`.
 */

import type {
  FinanceAccount,
  FinanceEvent,
  FinanceLoan,
  FinanceSummary,
  FinanceTransaction,
} from "@wealthspan/types";

/* ------------------------------------------------------------------ *
 * Money helpers
 * ------------------------------------------------------------------ */

/** "1,200.50" / "₹500" / 500 → 120050 paise. Returns null if not a valid amount. */
export const rupeesToPaise = (value: number | string): number | null => {
  const n = typeof value === "number" ? value : Number(String(value).replace(/[₹,\s]/g, ""));
  if (!Number.isFinite(n)) return null;
  const paise = Math.round(n * 100);
  // Reject more than 2 decimal places instead of silently rounding.
  return Math.abs(paise / 100 - n) < 1e-9 ? paise : null;
};

export const paiseToRupees = (paise: number): number => paise / 100;

/** 13200050 → "₹1,32,000.50"; whole rupees drop the ".00". Indian digit grouping. */
export const formatINR = (paise: number): string => {
  const neg = paise < 0;
  const abs = Math.abs(paise);
  const rupees = Math.floor(abs / 100);
  const p = abs % 100;
  const body = rupees.toLocaleString("en-IN");
  return `${neg ? "−" : ""}₹${body}${p ? `.${String(p).padStart(2, "0")}` : ""}`;
};

/* ------------------------------------------------------------------ *
 * What counts toward the numbers
 * ------------------------------------------------------------------ */

type Tx = Pick<
  FinanceTransaction,
  | "id"
  | "type"
  | "amountPaise"
  | "date"
  | "projectId"
  | "accountId"
  | "fromAccountId"
  | "toAccountId"
  | "paymentMode"
  | "category"
  | "source"
  | "eventId"
  | "loanId"
  | "deletedAt"
  | "party"
  | "note"
>;

const live = <T extends { deletedAt: string | null }>(rows: readonly T[]) =>
  rows.filter((r) => !r.deletedAt);

/**
 * An expense counts toward profit unless it belongs to an event that is
 * still open. When the event is concluded the SAME rows start counting — no
 * new row is created, so nothing is counted twice.
 */
export const countsAsExpense = (
  tx: Pick<FinanceTransaction, "type" | "eventId">,
  eventsById: ReadonlyMap<string, Pick<FinanceEvent, "status">>,
): boolean => {
  if (tx.type !== "expense") return false;
  if (!tx.eventId) return true;
  return eventsById.get(tx.eventId)?.status === "concluded";
};

export interface SummaryFilter {
  /** Inclusive, YYYY-MM-DD. */
  from?: string;
  to?: string;
  projectId?: string;
}

const inRange = (date: string, f: SummaryFilter) =>
  (!f.from || date >= f.from) && (!f.to || date <= f.to);

const add = (rec: Record<string, number>, key: string, n: number) => {
  rec[key] = (rec[key] ?? 0) + n;
};

/** Income, expense and profit for a period / project. Transfers are ignored. */
export const summarize = (
  transactions: readonly Tx[],
  events: readonly Pick<FinanceEvent, "id" | "name" | "status">[],
  filter: SummaryFilter = {},
): FinanceSummary => {
  const eventsById = new Map(events.map((e) => [e.id, e]));
  const out: FinanceSummary = {
    incomePaise: 0,
    expensePaise: 0,
    profitPaise: 0,
    openEventsPaise: 0,
    byCategory: {},
    byPaymentMode: {},
    bySource: {},
    byEvent: {},
  };

  for (const tx of live(transactions)) {
    if (tx.type === "transfer") continue;
    if (!inRange(tx.date, filter)) continue;
    if (filter.projectId && tx.projectId !== filter.projectId) continue;

    if (tx.type === "income") {
      out.incomePaise += tx.amountPaise;
      add(out.bySource, tx.source ?? "Other", tx.amountPaise);
      if (tx.paymentMode) add(out.byPaymentMode, `in:${tx.paymentMode}`, tx.amountPaise);
      continue;
    }

    // expense
    if (tx.eventId) {
      const ev = eventsById.get(tx.eventId);
      add(out.byEvent, ev?.name ?? tx.eventId, tx.amountPaise);
    }
    if (countsAsExpense(tx, eventsById)) {
      out.expensePaise += tx.amountPaise;
      add(out.byCategory, tx.category ?? "Other", tx.amountPaise);
      if (tx.paymentMode) add(out.byPaymentMode, `out:${tx.paymentMode}`, tx.amountPaise);
    } else {
      out.openEventsPaise += tx.amountPaise;
    }
  }

  out.profitPaise = out.incomePaise - out.expensePaise;
  return out;
};

/* ------------------------------------------------------------------ *
 * Balances, loans
 * ------------------------------------------------------------------ */

/**
 * Balance per account.
 *   opening + income in − expense out − transfers out + transfers in.
 * Credit cards go negative when spent on (the dues); paying the bill is a
 * transfer from a bank account, which brings the card back to zero.
 * Open-event expenses DO reduce balances — the money has really gone.
 */
export const accountBalances = (
  accounts: readonly Pick<FinanceAccount, "id" | "openingBalancePaise" | "deletedAt">[],
  transactions: readonly Tx[],
  upTo?: string,
): Record<string, number> => {
  const bal: Record<string, number> = {};
  for (const a of live(accounts)) bal[a.id] = a.openingBalancePaise;
  for (const tx of live(transactions)) {
    if (upTo && tx.date > upTo) continue;
    if (tx.type === "income" && tx.accountId && tx.accountId in bal)
      bal[tx.accountId] += tx.amountPaise;
    else if (tx.type === "expense" && tx.accountId && tx.accountId in bal)
      bal[tx.accountId] -= tx.amountPaise;
    else if (tx.type === "transfer") {
      if (tx.fromAccountId && tx.fromAccountId in bal) bal[tx.fromAccountId] -= tx.amountPaise;
      if (tx.toAccountId && tx.toAccountId in bal) bal[tx.toAccountId] += tx.amountPaise;
    }
  }
  return bal;
};

/**
 * Phase 1: outstanding = loan amount − every EMI / repayment linked to it.
 * (Interest is not split from principal yet.) Never below zero.
 */
export const loanOutstanding = (
  loan: Pick<FinanceLoan, "id" | "principalPaise">,
  transactions: readonly Pick<
    FinanceTransaction,
    "type" | "loanId" | "amountPaise" | "deletedAt"
  >[],
): number => {
  const paid = live(transactions)
    .filter((t) => t.type === "expense" && t.loanId === loan.id)
    .reduce((s, t) => s + t.amountPaise, 0);
  return Math.max(0, loan.principalPaise - paid);
};

/* ------------------------------------------------------------------ *
 * Double-counting guards (used while entering data by hand)
 * ------------------------------------------------------------------ */

const CARD_BILL_WORDS =
  /(credit\s*card|card\s*(bill|payment|due|dues|outstanding)|cc\s*(bill|payment)|\bcard\s*pay)/i;

/** "HDFC credit card bill" typed as an expense is almost certainly a transfer. */
export const looksLikeCardBillPayment = (...texts: Array<string | null | undefined>): boolean =>
  texts.some((t) => !!t && CARD_BILL_WORDS.test(t));

const dayDiff = (a: string, b: string) =>
  Math.abs(Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000));

/**
 * Credit-card expenses with exactly the same amount within `windowDays`.
 * Used to warn: "this looks like a card bill you already counted as spending".
 */
export const findSameAmountCardExpenses = (
  candidate: Pick<FinanceTransaction, "amountPaise" | "date">,
  existing: readonly Tx[],
  windowDays = 45,
): Tx[] =>
  live(existing).filter(
    (t) =>
      t.type === "expense" &&
      t.paymentMode === "credit_card" &&
      t.amountPaise === candidate.amountPaise &&
      dayDiff(t.date, candidate.date) <= windowDays,
  );
