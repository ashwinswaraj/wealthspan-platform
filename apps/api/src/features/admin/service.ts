/**
 * Read models for the admin console. Pure logic over an AdminStore so it can be tested without Catalyst.
 * Admin rights are decided by e-mail (ADMIN_EMAILS) at the edge; this service trusts that check.
 */
import { PLANS, type PaymentStatus, type PlanId, type Subscription } from "../subscription";
import type { AdminStore } from "./types";

export type PlanTier = "Free" | "Go" | "Pro";
const DAY = 86_400_000;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-10-31" -> "31 Oct 2026" (fixed format; locale data varies between runtimes). */
const dmy = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]} ${MONTHS[Number(m[2]) - 1] ?? ""} ${m[1]}` : "";
};

/** The free trial is the "Go" tier in the app's wording; paid plans are "Pro". */
const tierOf = (plan: PlanId): PlanTier => (plan === "trial" ? "Go" : "Pro");

export const createAdminService = (deps: { store: AdminStore; adminEmails: string[]; now?: () => Date }) => {
  const { store } = deps;
  const now = () => deps.now?.() ?? new Date();
  const today = () => now().toISOString().slice(0, 10);
  const admins = new Set(deps.adminEmails.map((e) => e.trim().toLowerCase()).filter(Boolean));
  const isAdminEmail = (email: string | null | undefined) => !!email && admins.has(email.trim().toLowerCase());

  const liveSub = (subs: Subscription[]) => {
    const t = today();
    return subs.filter((s) => s.startsOn <= t && s.endsOn >= t).sort((a, b) => b.endsOn.localeCompare(a.endsOn))[0] ?? null;
  };
  const byUser = (subs: Subscription[]) => {
    const m = new Map<string, Subscription[]>();
    for (const s of subs) m.set(s.userId, [...(m.get(s.userId) ?? []), s]);
    return m;
  };

  return {
    isAdminEmail,

    async overview() {
      const [users, subs, payments, projects, transactions] = await Promise.all([
        store.listUsers(), store.listAllSubscriptions(), store.listAllPayments("pending"),
        store.countRows("projects"), store.countRows("transactions"),
      ]);
      const per = byUser(subs);
      const usersByPlan = { free: 0, go: 0, pro: 0 };
      let mrrPaise = 0;
      for (const u of users) {
        const live = liveSub(per.get(u.id) ?? []);
        if (!live) usersByPlan.free += 1;
        else if (live.plan === "trial") usersByPlan.go += 1;
        else {
          usersByPlan.pro += 1;
          const p = PLANS[live.plan];
          mrrPaise += Math.round((p.pricePaise * 30) / p.days);
        }
      }
      const t0 = Date.parse(`${today()}T00:00:00Z`);
      const usersTrend = Array.from({ length: 30 }, (_, i) => {
        const day = new Date(t0 - (29 - i) * DAY).toISOString().slice(0, 10);
        return users.filter((u) => u.createdAt.slice(0, 10) === day).length;
      });
      return { users: users.length, usersByPlan, projects, transactions, mrrPaise, pendingPayments: payments.length, usersTrend };
    },

    async users() {
      const [users, subs] = await Promise.all([store.listUsers(), store.listAllSubscriptions()]);
      const per = byUser(subs);
      return users.map((u) => {
        const live = liveSub(per.get(u.id) ?? []);
        const isSuper = isAdminEmail(u.email);
        return {
          id: u.id,
          name: u.name || u.email,
          email: u.email,
          code: `WSP-${u.id.slice(-5)}`,
          role: isSuper ? "Super Administrator" : "Standard User",
          plan: (live ? tierOf(live.plan) : "Free") as PlanTier,
          planValidity: live ? dmy(live.endsOn) : "Lifetime Free Tier",
          activeSince: dmy(u.createdAt),
          status: (u.active ? "Active" : "Suspended") as "Active" | "Suspended",
          isSuperAdmin: isSuper,
        };
      });
    },

    async payments(status?: PaymentStatus) {
      const [rows, users] = await Promise.all([store.listAllPayments(status), store.listUsers()]);
      const email = new Map(users.map((u) => [u.id, u.email]));
      return rows
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((p) => ({
          id: p.id,
          utr: p.utr,
          userEmail: email.get(p.userId) ?? p.userId,
          plan: PLANS[p.plan]?.label ?? p.plan,
          amountPaise: p.amountPaise,
          orderId: `ORD-${p.id.slice(-6)}`,
          createdAt: p.createdAt,
          status: p.status,
        }));
    },

    async ledger(limit = 100) {
      const rows = await store.recentTransactions(limit);
      return rows.map((t) => ({
        id: t.id,
        project: t.projectName ?? "—",
        category: t.category ?? (t.type ? t.type[0].toUpperCase() + t.type.slice(1) : "—"),
        counterparty: t.party ?? "—",
        amountPaise: t.amountPaise,
        mode: t.paymentMode ? t.paymentMode.replace(/_/g, " ").toUpperCase() : "—",
        // Wealthspan records money that already moved; there is no pending/in-transit state.
        status: "Cleared" as const,
        createdAt: t.createdAt,
      }));
    },

    async audit(limit = 100) {
      const rows = await store.recentAudit(limit);
      return rows.map((a) => ({
        id: a.id,
        title: a.action.replace(/_/g, " "),
        description: [a.entity, a.entityId].filter(Boolean).join(" "),
        actor: a.actor,
        at: a.createdAt,
      }));
    },
  };
};

export type AdminService = ReturnType<typeof createAdminService>;
