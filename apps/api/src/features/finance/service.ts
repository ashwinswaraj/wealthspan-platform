import type { FinanceChangeSource, FinanceSummary, FinanceTransaction } from "@wealthspan/types";
import type { PaymentModeId } from "@wealthspan/constants/finance";
import {
  validatePaymentModeForAccount,
  validateTransactionInput,
  type FieldErrors,
  type TransactionInput,
} from "@wealthspan/validation";
import {
  findSameAmountCardExpenses,
  looksLikeCardBillPayment,
  rupeesToPaise,
  summarize,
  type SummaryFilter,
} from "@wealthspan/utils/finance";
import type { FinanceStore, NewTransaction, TransactionListFilter } from "./types";

export class FinanceError extends Error {
  constructor(
    readonly code: "invalid" | "not_found",
    message: string,
    readonly status: number = 400,
    readonly fields?: FieldErrors,
  ) {
    super(message);
  }
}

export interface TransactionResult {
  transaction: FinanceTransaction;
  /** Things worth double-checking; the entry was still saved. */
  warnings: string[];
}

/** Every list/summary reads all of a user's rows, so one account may not grow without bound. */
export const MAX_TRANSACTIONS_PER_USER = 5000;

const IST_OFFSET_MS = 5.5 * 3_600_000;
const FIELDS = [
  "type",
  "amount",
  "date",
  "projectId",
  "accountId",
  "fromAccountId",
  "toAccountId",
  "paymentMode",
  "category",
  "party",
  "source",
  "note",
  "eventId",
  "loanId",
  "investmentId",
] as const;

/** Trim strings, turn "" into null, keep only known fields. */
const clean = (input: TransactionInput): TransactionInput => {
  const out: Record<string, unknown> = {};
  for (const k of FIELDS) {
    const v = (input as Record<string, unknown>)[k];
    out[k] = typeof v === "string" ? v.trim() || null : (v ?? null);
  }
  return out as TransactionInput;
};

const toInput = (t: FinanceTransaction): TransactionInput => ({
  type: t.type,
  amount: t.amountPaise / 100,
  date: t.date,
  projectId: t.projectId,
  accountId: t.accountId,
  fromAccountId: t.fromAccountId,
  toAccountId: t.toAccountId,
  paymentMode: t.paymentMode,
  category: t.category,
  party: t.party,
  source: t.source,
  note: t.note,
  eventId: t.eventId,
  loanId: t.loanId,
  investmentId: t.investmentId,
});

export const createFinanceService = ({
  store,
  now = () => new Date(),
}: {
  store: FinanceStore;
  now?: () => Date;
}) => {
  const today = () => new Date(now().getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
  const nowIso = () => now().toISOString();

  const fail = (fields: FieldErrors): never => {
    throw new FinanceError("invalid", Object.values(fields)[0] ?? "Invalid entry.", 400, fields);
  };

  /** Every id in the entry must exist AND belong to this user. */
  const checkReferences = async (userId: string, i: TransactionInput) => {
    const e: FieldErrors = {};
    if (i.type === "transfer") {
      const from = await store.getAccount(userId, i.fromAccountId!);
      const to = await store.getAccount(userId, i.toAccountId!);
      if (!from) e.fromAccountId = "That account was not found.";
      if (!to) e.toAccountId = "That account was not found.";
      if (i.investmentId && !(await store.getInvestment(userId, i.investmentId)))
        e.investmentId = "That investment was not found.";
    } else {
      const project = await store.getProject(userId, i.projectId!);
      if (!project) e.projectId = "That project was not found.";
      const account = await store.getAccount(userId, i.accountId!);
      if (!account) e.accountId = "That account was not found.";
      else {
        const msg = validatePaymentModeForAccount(i.paymentMode as PaymentModeId, account.kind);
        if (msg) e.paymentMode = msg;
      }
      if (i.eventId) {
        const ev = await store.getEvent(userId, i.eventId);
        if (!ev) e.eventId = "That event was not found.";
        else if (project && ev.projectId !== project.id)
          e.eventId = "That event belongs to a different project.";
      }
      if (i.loanId) {
        const loan = await store.getLoan(userId, i.loanId);
        if (!loan) e.loanId = "That loan was not found.";
        else if (project && loan.projectId !== project.id)
          e.loanId = "That loan belongs to a different project.";
      }
    }
    if (Object.keys(e).length) fail(e);
  };

  const validate = async (userId: string, input: TransactionInput) => {
    const errors = validateTransactionInput(input, { today: today() });
    if (Object.keys(errors).length) fail(errors);
    await checkReferences(userId, input);
  };

  const toRow = (
    userId: string,
    i: TransactionInput,
    source: FinanceChangeSource,
  ): NewTransaction => ({
    userId,
    createdBy: source,
    type: i.type as NewTransaction["type"],
    amountPaise: rupeesToPaise(i.amount as number | string) as number,
    date: i.date as string,
    projectId: i.projectId ?? null,
    accountId: i.accountId ?? null,
    fromAccountId: i.fromAccountId ?? null,
    toAccountId: i.toAccountId ?? null,
    paymentMode: (i.paymentMode as NewTransaction["paymentMode"]) ?? null,
    category: i.category ?? null,
    party: i.party ?? null,
    source: i.source ?? null,
    note: i.note ?? null,
    eventId: i.eventId ?? null,
    loanId: i.loanId ?? null,
    investmentId: i.investmentId ?? null,
  });

  const warningsFor = async (userId: string, row: NewTransaction): Promise<string[]> => {
    const w: string[] = [];
    if (row.type === "expense" && looksLikeCardBillPayment(row.party, row.note, row.category)) {
      w.push(
        "This looks like a credit card bill payment. Paying a card bill is a transfer from your bank, not an expense, otherwise the spending is counted twice.",
      );
      const existing = await store.listTransactions(userId);
      if (findSameAmountCardExpenses(row, existing).length)
        w.push("You already have credit card spending of exactly this amount in the last 45 days.");
    }
    return w;
  };

  return {
    async createTransaction(
      userId: string,
      raw: TransactionInput,
      source: FinanceChangeSource = "manual",
    ): Promise<TransactionResult> {
      const input = clean(raw);
      await validate(userId, input);
      if (
        store.countTransactions &&
        (await store.countTransactions(userId)) >= MAX_TRANSACTIONS_PER_USER
      )
        throw new FinanceError(
          "invalid",
          `You have reached the limit of ${MAX_TRANSACTIONS_PER_USER} entries. Export and delete old ones to add more.`,
          429,
        );
      const row = toRow(userId, input, source);
      const warnings = await warningsFor(userId, row);
      const transaction = await store.insertTransaction(row);
      await store.insertAudit({
        userId,
        actor: source,
        action: "create_transaction",
        entity: "transaction",
        entityId: transaction.id,
        before: null,
        after: transaction,
        createdAt: nowIso(),
        undoneAt: null,
      });
      return { transaction, warnings };
    },

    async updateTransaction(
      userId: string,
      id: string,
      patch: TransactionInput,
      source: FinanceChangeSource = "manual",
    ): Promise<TransactionResult> {
      const before = await store.getTransaction(userId, id);
      if (!before) throw new FinanceError("not_found", "Transaction not found.", 404);
      const input = clean({ ...toInput(before), ...removeUndefined(patch) });
      await validate(userId, input);
      const row = toRow(userId, input, before.createdBy);
      const warnings = await warningsFor(userId, row);
      const { userId: _u, createdBy: _c, ...changes } = row;
      const transaction = await store.updateTransaction(userId, id, changes);
      await store.insertAudit({
        userId,
        actor: source,
        action: "update_transaction",
        entity: "transaction",
        entityId: id,
        before,
        after: transaction,
        createdAt: nowIso(),
        undoneAt: null,
      });
      return { transaction, warnings };
    },

    /** Soft delete: hidden now, recoverable for 30 days. */
    async deleteTransaction(
      userId: string,
      id: string,
      source: FinanceChangeSource = "manual",
    ): Promise<void> {
      const before = await store.getTransaction(userId, id);
      if (!before) throw new FinanceError("not_found", "Transaction not found.", 404);
      await store.softDeleteTransaction(userId, id, nowIso());
      await store.insertAudit({
        userId,
        actor: source,
        action: "delete_transaction",
        entity: "transaction",
        entityId: id,
        before,
        after: null,
        createdAt: nowIso(),
        undoneAt: null,
      });
    },

    async listTransactions(userId: string, f: TransactionListFilter = {}) {
      const limit = Math.min(Math.max(f.limit ?? 50, 1), 200);
      const offset = Math.max(f.offset ?? 0, 0);
      const all = (await store.listTransactions(userId))
        .filter((t) => (!f.from || t.date >= f.from) && (!f.to || t.date <= f.to))
        .filter((t) => !f.projectId || t.projectId === f.projectId)
        .filter((t) => !f.type || t.type === f.type)
        .filter(
          (t) =>
            !f.accountId || [t.accountId, t.fromAccountId, t.toAccountId].includes(f.accountId),
        )
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
      return { total: all.length, items: all.slice(offset, offset + limit) };
    },

    async getSummary(userId: string, filter: SummaryFilter = {}): Promise<FinanceSummary> {
      const [txs, events] = await Promise.all([
        store.listTransactions(userId),
        store.listEvents(userId),
      ]);
      return summarize(txs, events, filter);
    },
  };
};

const removeUndefined = <T extends object>(o: T): Partial<T> =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;

export type FinanceService = ReturnType<typeof createFinanceService>;
