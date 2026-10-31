/**
 * FinanceStore on top of Catalyst Data Store (ZCQL for reads, table API for writes).
 *
 * Rules this file enforces for EVERY query:
 *  - the user's id is in the WHERE clause (no query ever reads another user's rows)
 *  - ids coming from outside must be digits only (`id()`), strings are escaped (`esc()`)
 *  - soft-deleted rows are hidden (`deleted_at IS NULL`)
 *
 * Unverified until the first real run on Catalyst: how bigint ids and NULLs
 * come back from the SDK, and the row cap per ZCQL query (we page by 250 to be safe).
 */
import type {
  FinanceAccount,
  FinanceAuditEntry,
  FinanceEvent,
  FinanceInvestment,
  FinanceLoan,
  FinanceProject,
  FinanceTransaction,
} from "@jobrio/types";
import type { FinanceStore, NewTransaction } from "./types";

export interface CatalystLike {
  zcql(): {
    executeZCQLQuery(query: string): Promise<Array<Record<string, Record<string, unknown>>>>;
  };
  datastore(): {
    table(name: string): {
      insertRow(row: Record<string, unknown>): Promise<Record<string, unknown>>;
      updateRow(row: Record<string, unknown>): Promise<Record<string, unknown>>;
    };
  };
}

const PAGE = 250;

const esc = (s: string) => String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
const id = (v: string): string => {
  if (!/^\d{1,20}$/.test(String(v))) throw new Error("bad id");
  return String(v);
};

type Row = Record<string, unknown>;
const nul = (v: unknown) => (v === undefined || v === null || v === "" || v === "null" ? null : v);
const str = (v: unknown): string | null => (nul(v) === null ? null : String(v));
const num = (v: unknown): number | null => (nul(v) === null ? null : Number(v));
/** Catalyst gives "2026-10-24 13:05:00"; keep it sortable and ISO-like. */
const ts = (v: unknown): string => String(nul(v) ?? "").replace(" ", "T");

const base = (r: Row) => ({
  id: String(r.ROWID),
  userId: String(r.user_id),
  createdAt: ts(r.CREATEDTIME),
  updatedAt: ts(r.MODIFIEDTIME),
  deletedAt: str(r.deleted_at),
  createdBy: (str(r.created_by) ?? "manual") as FinanceTransaction["createdBy"],
});

export const rowToTransaction = (r: Row): FinanceTransaction => ({
  ...base(r),
  type: r.type as FinanceTransaction["type"],
  amountPaise: Number(r.amount_paise),
  date: String(r.tx_date),
  projectId: str(r.project_id),
  accountId: str(r.account_id),
  fromAccountId: str(r.from_account_id),
  toAccountId: str(r.to_account_id),
  paymentMode: str(r.payment_mode) as FinanceTransaction["paymentMode"],
  category: str(r.category),
  party: str(r.party),
  source: str(r.source),
  note: str(r.note),
  eventId: str(r.event_id),
  loanId: str(r.loan_id),
  investmentId: str(r.investment_id),
});

const transactionToColumns = (t: Partial<NewTransaction>): Row => {
  const m: Array<[keyof NewTransaction, string]> = [
    ["type", "type"],
    ["amountPaise", "amount_paise"],
    ["date", "tx_date"],
    ["projectId", "project_id"],
    ["accountId", "account_id"],
    ["fromAccountId", "from_account_id"],
    ["toAccountId", "to_account_id"],
    ["paymentMode", "payment_mode"],
    ["category", "category"],
    ["party", "party"],
    ["source", "source"],
    ["note", "note"],
    ["eventId", "event_id"],
    ["loanId", "loan_id"],
    ["investmentId", "investment_id"],
    ["userId", "user_id"],
    ["createdBy", "created_by"],
  ];
  const out: Row = {};
  for (const [k, col] of m) if (k in t) out[col] = t[k] ?? null;
  return out;
};

export const createCatalystFinanceStore = (app: CatalystLike): FinanceStore => {
  const query = async (q: string, table: string): Promise<Row[]> =>
    (await app.zcql().executeZCQLQuery(q)).map((r) => r[table] ?? Object.values(r)[0]);

  /** Reads every page so a row cap per query can never silently hide data. */
  const queryAll = async (
    select: string,
    table: string,
    where: string,
    order = "",
  ): Promise<Row[]> => {
    const out: Row[] = [];
    for (let offset = 0; ; offset += PAGE) {
      const rows = await query(
        `${select} FROM ${table} WHERE ${where} ${order} LIMIT ${offset},${PAGE}`,
        table,
      );
      out.push(...rows);
      if (rows.length < PAGE) return out;
    }
  };

  const getOne = async <T>(
    table: string,
    userId: string,
    rowId: string,
    map: (r: Row) => T,
  ): Promise<T | null> => {
    const rows = await query(
      `SELECT * FROM ${table} WHERE ROWID = ${id(rowId)} AND user_id = '${esc(userId)}' AND deleted_at IS NULL LIMIT 0,1`,
      table,
    );
    return rows[0] ? map(rows[0]) : null;
  };

  const archived = (r: Row) => str(r.archived_at);

  return {
    getProject: (u, i) =>
      getOne<FinanceProject>("projects", u, i, (r) => ({
        ...base(r),
        name: String(r.name),
        kind: r.kind as FinanceProject["kind"],
        archivedAt: archived(r),
      })),
    getAccount: (u, i) =>
      getOne<FinanceAccount>("accounts", u, i, (r) => ({
        ...base(r),
        name: String(r.name),
        kind: r.kind as FinanceAccount["kind"],
        openingBalancePaise: Number(r.opening_balance_paise ?? 0),
        creditLimitPaise: num(r.credit_limit_paise),
        defaultProjectId: str(r.default_project_id),
        archivedAt: archived(r),
      })),
    getEvent: (u, i) =>
      getOne<FinanceEvent>("events", u, i, (r) => ({
        ...base(r),
        projectId: String(r.project_id),
        name: String(r.name),
        budgetPaise: num(r.budget_paise),
        startDate: str(r.start_date),
        endDate: str(r.end_date),
        status: r.status as FinanceEvent["status"],
        concludedAt: str(r.concluded_at),
      })),
    getLoan: (u, i) =>
      getOne<FinanceLoan>("loans", u, i, (r) => ({
        ...base(r),
        projectId: String(r.project_id),
        lender: String(r.lender),
        principalPaise: Number(r.principal_paise),
        interestRatePct: num(r.interest_rate_pct),
        emiPaise: num(r.emi_paise),
        emiDayOfMonth: num(r.emi_day_of_month),
        startDate: str(r.start_date),
        tenureMonths: num(r.tenure_months),
        status: r.status as FinanceLoan["status"],
      })),
    getInvestment: (u, i) =>
      getOne<FinanceInvestment>("investments", u, i, (r) => ({
        ...base(r),
        projectId: String(r.project_id),
        name: String(r.name),
        kind: r.kind as FinanceInvestment["kind"],
        currentValuePaise: num(r.current_value_paise),
        folioNo: str(r.folio_no),
      })),

    async listTransactions(userId) {
      const rows = await queryAll(
        "SELECT *",
        "transactions",
        `user_id = '${esc(userId)}' AND deleted_at IS NULL`,
        "ORDER BY ROWID",
      );
      return rows.map(rowToTransaction);
    },
    async listEvents(userId) {
      const rows = await queryAll(
        "SELECT *",
        "events",
        `user_id = '${esc(userId)}' AND deleted_at IS NULL`,
        "ORDER BY ROWID",
      );
      return rows.map((r) => ({
        ...base(r),
        projectId: String(r.project_id),
        name: String(r.name),
        budgetPaise: num(r.budget_paise),
        startDate: str(r.start_date),
        endDate: str(r.end_date),
        status: r.status as FinanceEvent["status"],
        concludedAt: str(r.concluded_at),
      }));
    },
    getTransaction: (u, i) => getOne("transactions", u, i, rowToTransaction),
    async countTransactions(userId) {
      const rows = await app
        .zcql()
        .executeZCQLQuery(
          `SELECT COUNT(ROWID) FROM transactions WHERE user_id = '${esc(userId)}' AND deleted_at IS NULL`,
        );
      const first = rows[0]?.transactions ?? Object.values(rows[0] ?? {})[0] ?? {};
      const n = Number(Object.values(first as Record<string, unknown>)[0]);
      // If the SDK ever answers in a shape we don't expect, fall back to counting (slow but correct).
      return Number.isFinite(n)
        ? n
        : (
            await queryAll(
              "SELECT ROWID",
              "transactions",
              `user_id = '${esc(userId)}' AND deleted_at IS NULL`,
            )
          ).length;
    },

    async insertTransaction(row) {
      const saved = await app
        .datastore()
        .table("transactions")
        .insertRow(transactionToColumns(row));
      return rowToTransaction(saved);
    },
    async updateTransaction(userId, rowId, patch) {
      // Ownership was checked by the service (getTransaction); check again here so this
      // method is safe on its own.
      const current = await getOne("transactions", userId, rowId, rowToTransaction);
      if (!current) throw new Error("not found");
      const { userId: _u, createdBy: _c, ...allowed } = patch;
      await app
        .datastore()
        .table("transactions")
        .updateRow({ ROWID: id(rowId), ...transactionToColumns(allowed) });
      return { ...current, ...patch } as FinanceTransaction;
    },
    async softDeleteTransaction(userId, rowId, deletedAtIso) {
      const current = await getOne("transactions", userId, rowId, rowToTransaction);
      if (!current) throw new Error("not found");
      await app
        .datastore()
        .table("transactions")
        .updateRow({
          ROWID: id(rowId),
          deleted_at: deletedAtIso.slice(0, 19).replace("T", " "),
        });
    },
    async insertAudit(e: Omit<FinanceAuditEntry, "id">) {
      await app
        .datastore()
        .table("audit_log")
        .insertRow({
          user_id: e.userId,
          actor: e.actor,
          action: e.action,
          entity: e.entity,
          entity_id: e.entityId,
          // the column holds 10,000 characters; cut long payloads rather than failing the user's request
          before_json: JSON.stringify(e.before ?? null).slice(0, 9500),
          after_json: JSON.stringify(e.after ?? null).slice(0, 9500),
        });
    },
  };
};
