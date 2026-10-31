/**
 * CatalogStore on Catalyst Data Store. Same safety rules as the finance store:
 * every query carries `user_id = '…'` and `deleted_at IS NULL`, ids are digits only.
 */
import type { CatalystLike } from "../finance/catalyst-store";
import type { CatalogEntity, CatalogStore } from "./types";

type Kind = "str" | "int" | "reqstr";
/** [camelCase field, column, kind] */
const SPEC: Record<CatalogEntity, { table: string; fields: [string, string, Kind][] }> = {
  projects: {
    table: "projects",
    fields: [
      ["name", "name", "reqstr"],
      ["kind", "kind", "reqstr"],
      ["archivedAt", "archived_at", "str"],
    ],
  },
  accounts: {
    table: "accounts",
    fields: [
      ["name", "name", "reqstr"],
      ["kind", "kind", "reqstr"],
      ["openingBalancePaise", "opening_balance_paise", "int"],
      ["creditLimitPaise", "credit_limit_paise", "int"],
      ["defaultProjectId", "default_project_id", "str"],
      ["archivedAt", "archived_at", "str"],
    ],
  },
  events: {
    table: "events",
    fields: [
      ["projectId", "project_id", "reqstr"],
      ["name", "name", "reqstr"],
      ["budgetPaise", "budget_paise", "int"],
      ["startDate", "start_date", "str"],
      ["endDate", "end_date", "str"],
      ["status", "status", "reqstr"],
      ["concludedAt", "concluded_at", "str"],
    ],
  },
  loans: {
    table: "loans",
    fields: [
      ["projectId", "project_id", "reqstr"],
      ["lender", "lender", "reqstr"],
      ["principalPaise", "principal_paise", "int"],
      ["interestRatePct", "interest_rate_pct", "int"],
      ["emiPaise", "emi_paise", "int"],
      ["emiDayOfMonth", "emi_day_of_month", "int"],
      ["startDate", "start_date", "str"],
      ["tenureMonths", "tenure_months", "int"],
      ["status", "status", "reqstr"],
    ],
  },
  investments: {
    table: "investments",
    fields: [
      ["projectId", "project_id", "reqstr"],
      ["name", "name", "reqstr"],
      ["kind", "kind", "reqstr"],
      ["currentValuePaise", "current_value_paise", "int"],
      ["folioNo", "folio_no", "str"],
    ],
  },
};

type Row = Record<string, unknown>;
const PAGE = 250;
const esc = (s: string) => String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
const id = (v: string): string => {
  if (!/^\d{1,20}$/.test(String(v))) throw new Error("bad id");
  return String(v);
};
const nul = (v: unknown) => (v === undefined || v === null || v === "" || v === "null" ? null : v);
const ts = (v: unknown): string => String(nul(v) ?? "").replace(" ", "T");

export const createCatalystCatalogStore = (app: CatalystLike): CatalogStore => {
  const run = async (q: string, table: string): Promise<Row[]> =>
    (await app.zcql().executeZCQLQuery(q)).map((r) => r[table] ?? Object.values(r)[0]);

  const toRecord = (entity: CatalogEntity, r: Row): never => {
    const out: Row = {
      id: String(r.ROWID),
      userId: String(r.user_id),
      createdAt: ts(r.CREATEDTIME),
      updatedAt: ts(r.MODIFIEDTIME),
      deletedAt: nul(r.deleted_at) === null ? null : String(r.deleted_at),
      createdBy: String(nul(r.created_by) ?? "manual"),
    };
    for (const [f, col, kind] of SPEC[entity].fields) {
      const v = nul(r[col]);
      out[f] =
        v === null ? (kind === "reqstr" ? "" : null) : kind === "int" ? Number(v) : String(v);
    }
    // columns that are never empty in practice
    if (entity === "accounts" && out.openingBalancePaise === null) out.openingBalancePaise = 0;
    if (entity === "loans" && out.principalPaise === null) out.principalPaise = 0;
    return out as never;
  };

  const toColumns = (entity: CatalogEntity, rec: Row): Row => {
    const cols: Row = {};
    for (const [f, col] of SPEC[entity].fields) if (f in rec) cols[col] = rec[f] ?? null;
    return cols;
  };

  const getOne = async (entity: CatalogEntity, userId: string, rowId: string) => {
    const t = SPEC[entity].table;
    const rows = await run(
      `SELECT * FROM ${t} WHERE ROWID = ${id(rowId)} AND user_id = '${esc(userId)}' AND deleted_at IS NULL LIMIT 0,1`,
      t,
    );
    return rows[0] ? toRecord(entity, rows[0]) : null;
  };

  return {
    async list(entity, userId) {
      const t = SPEC[entity].table;
      const out: Row[] = [];
      for (let offset = 0; ; offset += PAGE) {
        const rows = await run(
          `SELECT * FROM ${t} WHERE user_id = '${esc(userId)}' AND deleted_at IS NULL ORDER BY ROWID LIMIT ${offset},${PAGE}`,
          t,
        );
        out.push(...rows);
        if (rows.length < PAGE) break;
      }
      return out.map((r) => toRecord(entity, r)) as never;
    },
    get: (entity, userId, rowId) => getOne(entity, userId, rowId) as never,
    async insert(entity, row) {
      const saved = await app
        .datastore()
        .table(SPEC[entity].table)
        .insertRow({
          user_id: (row as Row).userId,
          created_by: (row as Row).createdBy,
          ...toColumns(entity, row as Row),
        });
      return toRecord(entity, saved);
    },
    async update(entity, userId, rowId, patch) {
      const current = await getOne(entity, userId, rowId);
      if (!current) throw new Error("not found");
      await app
        .datastore()
        .table(SPEC[entity].table)
        .updateRow({ ROWID: id(rowId), ...toColumns(entity, patch as Row) });
      return { ...(current as Row), ...(patch as Row) } as never;
    },
    async softDelete(entity, userId, rowId, deletedAtIso) {
      if (!(await getOne(entity, userId, rowId))) throw new Error("not found");
      await app
        .datastore()
        .table(SPEC[entity].table)
        .updateRow({ ROWID: id(rowId), deleted_at: deletedAtIso.slice(0, 19).replace("T", " ") });
    },
  };
};
