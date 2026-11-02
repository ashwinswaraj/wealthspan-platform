/**
 * AdminStore on Catalyst. Cross-user reads (the admin console shows everyone's totals), so this must only be
 * constructed behind the admin check in the function entry.
 *
 * Unverified until first real run: the field names `getAllUsers()` returns (user_id, email_id, first_name,
 * last_name, status, created_time) and whether it is paged. Defensive on purpose; fix against real output.
 */
import type { CatalystLike } from "../finance/catalyst-store";
import { createCatalystSubscriptionStore } from "../subscription";
import type {
  AdminAuditRecord,
  AdminStore,
  AdminTxRecord,
  AdminUserRecord,
  Broadcast,
  BroadcastAudience,
  BroadcastSeverity,
} from "./types";

type Row = Record<string, unknown>;
const nul = (v: unknown) => (v === undefined || v === null || v === "" || v === "null" ? null : v);
const str = (v: unknown): string | null => (nul(v) === null ? null : String(v));
const ts = (v: unknown) => String(nul(v) ?? "").replace(" ", "T");
const PAGE = 250;

export interface CatalystAdminApp extends CatalystLike {
  userManagement(): { getAllUsers(): Promise<Array<Record<string, unknown>>> };
}

const rowToBroadcast = (r: Row): Broadcast => ({
  id: String(r.ROWID),
  title: String(r.title ?? ""),
  body: String(r.body ?? ""),
  audience: String(r.audience ?? "ALL") as BroadcastAudience,
  severity: String(r.severity ?? "INFO") as BroadcastSeverity,
  createdBy: String(r.created_by ?? ""),
  createdAt: ts(r.CREATEDTIME),
});

export const createCatalystAdminStore = (app: CatalystAdminApp): AdminStore => {
  const subs = createCatalystSubscriptionStore(app);
  const query = async (q: string, table: string): Promise<Row[]> =>
    (await app.zcql().executeZCQLQuery(q)).map((r) => r[table] ?? Object.values(r)[0]);

  return {
    async listUsers() {
      const raw = (await app.userManagement().getAllUsers()) ?? [];
      return raw
        .map((u): AdminUserRecord => {
          const first = str(u.first_name) ?? "";
          const last = str(u.last_name) ?? "";
          return {
            id: String(u.user_id ?? u.userId ?? ""),
            email: String(u.email_id ?? u.email ?? ""),
            name: `${first} ${last}`.trim(),
            createdAt: ts(u.created_time ?? u.createdTime ?? ""),
            active: String(u.status ?? "ACTIVE").toUpperCase() === "ACTIVE",
          };
        })
        .filter((u) => u.id);
    },
    async countRows(table) {
      const where =
        table === "transactions" || table === "projects" ? "deleted_at IS NULL" : "ROWID > 0";
      const rows = await app
        .zcql()
        .executeZCQLQuery(`SELECT COUNT(ROWID) FROM ${table} WHERE ${where}`);
      const first = rows[0]?.[table] ?? Object.values(rows[0] ?? {})[0] ?? {};
      const v = Object.values(first as Row)[0];
      return Number(v ?? 0);
    },
    listAllPayments: (status) => subs.listAllPayments(status),
    listAllSubscriptions: () => subs.listAllSubscriptions(),
    async recentTransactions(limit) {
      const n = Math.max(1, Math.min(PAGE, Math.floor(limit)));
      const rows = await query(
        `SELECT * FROM transactions WHERE deleted_at IS NULL ORDER BY ROWID DESC LIMIT 0,${n}`,
        "transactions",
      );
      const ids = [
        ...new Set(
          rows
            .map((r) => str(r.project_id))
            .filter((v): v is string => !!v && /^\d{1,20}$/.test(v)),
        ),
      ];
      const names = new Map<string, string>();
      if (ids.length) {
        const ps = await query(
          `SELECT ROWID, name FROM projects WHERE ROWID IN (${ids.join(",")}) LIMIT 0,${PAGE}`,
          "projects",
        );
        for (const p of ps) names.set(String(p.ROWID), String(p.name));
      }
      return rows.map((r): AdminTxRecord => ({
        id: String(r.ROWID),
        type: String(r.type ?? ""),
        category: null, // never read: admins don't see user-typed text
        party: null,
        paymentMode: str(r.payment_mode),
        amountPaise: Number(r.amount_paise ?? 0),
        projectName: names.get(String(r.project_id)) ?? null,
        createdAt: ts(r.CREATEDTIME),
      }));
    },
    async recentAudit(limit) {
      const n = Math.max(1, Math.min(PAGE, Math.floor(limit)));
      const rows = await query(
        `SELECT * FROM audit_log ORDER BY ROWID DESC LIMIT 0,${n}`,
        "audit_log",
      );
      return rows.map((r): AdminAuditRecord => ({
        id: String(r.ROWID),
        action: String(r.action ?? ""),
        entity: String(r.entity ?? ""),
        entityId: str(r.entity_id),
        actor: String(r.actor ?? ""),
        createdAt: ts(r.CREATEDTIME),
      }));
    },
    async insertAudit(row) {
      // audit_log columns: user_id, actor (<=16), action, entity, entity_id (bigint, required), after_json.
      await app
        .datastore()
        .table("audit_log")
        .insertRow({
          user_id: row.actor,
          actor: "admin",
          action: row.action,
          entity: row.entity,
          entity_id: /^\d{1,18}$/.test(String(row.entityId)) ? row.entityId : "0",
          after_json: row.detail ?? null,
        });
    },
    async listBroadcasts(limit) {
      const n = Math.max(1, Math.min(PAGE, Math.floor(limit)));
      const rows = await query(
        `SELECT * FROM broadcasts ORDER BY ROWID DESC LIMIT 0,${n}`,
        "broadcasts",
      );
      return rows.map(rowToBroadcast);
    },
    async insertBroadcast(b) {
      const saved = await app.datastore().table("broadcasts").insertRow({
        title: b.title,
        body: b.body,
        audience: b.audience,
        severity: b.severity,
        created_by: b.createdBy,
      });
      return rowToBroadcast(saved);
    },
  };
};
