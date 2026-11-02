/**
 * SubscriptionStore on Catalyst Data Store: tables `subscriptions` and `payment_submissions`.
 * Same rules as the finance store: ids digits-only, strings escaped, every user-scoped read filters by user_id.
 * `payment_submissions.utr` is UNIQUE in the table, so a duplicate UTR fails even if two requests race.
 */
import type { CatalystLike } from "../finance/catalyst-store";
import type { PlanConfig, PlanSettingsStore } from "./plans";
import type {
  PaymentStatus,
  PaymentSubmission,
  PlanId,
  Subscription,
  SubscriptionStore,
} from "./types";

type Row = Record<string, unknown>;
const PAGE = 250;
const esc = (s: string) => String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
const rid = (v: string) => {
  if (!/^\d{1,20}$/.test(String(v))) throw new Error("bad id");
  return String(v);
};
const nul = (v: unknown) => (v === undefined || v === null || v === "" || v === "null" ? null : v);
const str = (v: unknown): string | null => (nul(v) === null ? null : String(v));
const ts = (v: unknown) => String(nul(v) ?? "").replace(" ", "T");

export const rowToSubscription = (r: Row): Subscription => ({
  id: String(r.ROWID),
  userId: String(r.user_id),
  plan: r.plan as PlanId,
  startsOn: String(r.starts_on),
  endsOn: String(r.ends_on),
  paymentId: str(r.payment_id),
  createdAt: ts(r.CREATEDTIME),
});

export const rowToPayment = (r: Row): PaymentSubmission => ({
  id: String(r.ROWID),
  userId: String(r.user_id),
  plan: r.plan as PlanId,
  amountPaise: Number(r.amount_paise),
  utr: String(r.utr),
  status: r.status as PaymentStatus,
  note: str(r.note),
  createdAt: ts(r.CREATEDTIME),
  reviewedAt: str(r.reviewed_at),
  reviewedBy: str(r.reviewed_by),
});

export const createCatalystSubscriptionStore = (
  app: CatalystLike,
): SubscriptionStore &
  PlanSettingsStore & {
    listAllPayments(status?: PaymentStatus): Promise<PaymentSubmission[]>;
    listAllSubscriptions(): Promise<Subscription[]>;
  } => {
  const query = async (q: string, table: string): Promise<Row[]> =>
    (await app.zcql().executeZCQLQuery(q)).map((r) => r[table] ?? Object.values(r)[0]);
  const queryAll = async (table: string, where: string): Promise<Row[]> => {
    const out: Row[] = [];
    for (let offset = 0; ; offset += PAGE) {
      const rows = await query(
        `SELECT * FROM ${table} WHERE ${where} ORDER BY ROWID DESC LIMIT ${offset},${PAGE}`,
        table,
      );
      out.push(...rows);
      if (rows.length < PAGE) return out;
    }
  };

  return {
    async listPlanSettings() {
      const rows = await queryAll("plan_settings", "ROWID > 0");
      const out: Partial<Record<PlanId, PlanConfig>> = {};
      for (const r of rows)
        out[String(r.plan_id) as PlanId] = {
          label: String(r.label),
          pricePaise: Number(r.price_paise),
          days: Number(r.days),
        };
      return out;
    },
    async savePlanSetting(planId, config, updatedBy) {
      const existing = await query(
        `SELECT ROWID FROM plan_settings WHERE plan_id = '${esc(planId)}' LIMIT 0,1`,
        "plan_settings",
      );
      const cols = {
        label: config.label,
        price_paise: config.pricePaise,
        days: config.days,
        updated_by: updatedBy,
      };
      const table = app.datastore().table("plan_settings");
      if (existing[0]) await table.updateRow({ ROWID: rid(String(existing[0].ROWID)), ...cols });
      else await table.insertRow({ plan_id: planId, ...cols });
    },
    async listSubscriptions(userId) {
      return (await queryAll("subscriptions", `user_id = '${esc(userId)}'`)).map(rowToSubscription);
    },
    async insertSubscription(s) {
      const saved = await app
        .datastore()
        .table("subscriptions")
        .insertRow({
          user_id: s.userId,
          plan: s.plan,
          starts_on: s.startsOn,
          ends_on: s.endsOn,
          payment_id: s.paymentId,
          ...(s.subKey ? { sub_key: s.subKey } : {}),
        });
      return rowToSubscription(saved);
    },
    async listPayments(userId) {
      return (await queryAll("payment_submissions", `user_id = '${esc(userId)}'`)).map(
        rowToPayment,
      );
    },
    async getPayment(paymentId) {
      const rows = await query(
        `SELECT * FROM payment_submissions WHERE ROWID = ${rid(paymentId)} LIMIT 0,1`,
        "payment_submissions",
      );
      return rows[0] ? rowToPayment(rows[0]) : null;
    },
    async findPaymentByUtr(utr) {
      const rows = await query(
        `SELECT * FROM payment_submissions WHERE utr = '${esc(utr)}' LIMIT 0,1`,
        "payment_submissions",
      );
      return rows[0] ? rowToPayment(rows[0]) : null;
    },
    async insertPayment(p) {
      const saved = await app.datastore().table("payment_submissions").insertRow({
        user_id: p.userId,
        plan: p.plan,
        amount_paise: p.amountPaise,
        utr: p.utr,
        status: p.status,
        note: p.note,
        reviewed_at: p.reviewedAt,
        reviewed_by: p.reviewedBy,
      });
      return rowToPayment(saved);
    },
    async updatePayment(paymentId, patch) {
      const current = await this.getPayment(paymentId);
      if (!current) throw new Error("not found");
      const cols: Row = { ROWID: rid(paymentId) };
      if (patch.status) cols.status = patch.status;
      if ("note" in patch) cols.note = patch.note ?? null;
      if ("reviewedAt" in patch) cols.reviewed_at = patch.reviewedAt ?? null;
      if ("reviewedBy" in patch) cols.reviewed_by = patch.reviewedBy ?? null;
      await app.datastore().table("payment_submissions").updateRow(cols);
      return { ...current, ...patch };
    },
    async listPendingPayments() {
      return (await queryAll("payment_submissions", "status = 'pending'")).map(rowToPayment);
    },
    async listAllPayments(status) {
      return (
        await queryAll("payment_submissions", status ? `status = '${esc(status)}'` : "ROWID > 0")
      ).map(rowToPayment);
    },
    async listAllSubscriptions() {
      return (await queryAll("subscriptions", "ROWID > 0")).map(rowToSubscription);
    },
  };
};
