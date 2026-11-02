/**
 * Read models for the admin console. Pure logic over an AdminStore so it can be tested without Catalyst.
 * Admin rights are decided by e-mail (ADMIN_EMAILS) at the edge; this service trusts that check.
 */
import {
  SubscriptionError,
  isPlanId,
  loadPlans,
  paymentReference,
  validatePlanInput,
  type PaymentStatus,
  type PlanId,
  type PlanSettingsStore,
  type Subscription,
} from "../subscription";
import {
  BROADCAST_AUDIENCES,
  BROADCAST_SEVERITIES,
  type AdminStore,
  type Broadcast,
  type BroadcastAudience,
} from "./types";

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

export const createAdminService = (deps: {
  store: AdminStore;
  /** Where admin-edited plan prices live; without it plans stay at the built-in prices. */
  plans?: PlanSettingsStore;
  adminEmails: string[];
  adminUserIds?: string[];
  now?: () => Date;
}) => {
  const { store } = deps;
  const now = () => deps.now?.() ?? new Date();
  const today = () => now().toISOString().slice(0, 10);
  const admins = new Set(deps.adminEmails.map((e) => e.trim().toLowerCase()).filter(Boolean));
  const isAdminEmail = (email: string | null | undefined) =>
    !!email && admins.has(email.trim().toLowerCase());
  /**
   * When ADMIN_USER_IDS is set, an admin needs BOTH a listed e-mail AND a listed Catalyst user id, so
   * signing up with someone else's e-mail address is not enough. With it empty only the e-mail counts
   * (bootstrap: read your id from GET /admin/me, then pin it).
   */
  const pinned = new Set((deps.adminUserIds ?? []).map((i) => i.trim()).filter(Boolean));
  const isAdmin = (who: { email?: string | null; userId?: string | null }) =>
    isAdminEmail(who.email) &&
    (pinned.size === 0 || (!!who.userId && pinned.has(String(who.userId))));
  const isPinned = () => pinned.size > 0;
  /** The audit trail must never block the change itself. */
  const audit = async (row: Parameters<AdminStore["insertAudit"]>[0]) => {
    try {
      await store.insertAudit(row);
    } catch (e) {
      console.error(
        "audit write failed:",
        String((e as { message?: string })?.message ?? "").slice(0, 200),
      );
    }
  };

  const liveSub = (subs: Subscription[]) => {
    const t = today();
    return (
      subs
        .filter((s) => s.startsOn <= t && s.endsOn >= t)
        .sort((a, b) => b.endsOn.localeCompare(a.endsOn))[0] ?? null
    );
  };
  const byUser = (subs: Subscription[]) => {
    const m = new Map<string, Subscription[]>();
    for (const s of subs) m.set(s.userId, [...(m.get(s.userId) ?? []), s]);
    return m;
  };

  return {
    isAdminEmail,
    isAdmin,
    isPinned,

    async overview() {
      const [users, subs, payments, projects, transactions, plansNow] = await Promise.all([
        store.listUsers(),
        store.listAllSubscriptions(),
        store.listAllPayments("pending"),
        store.countRows("projects"),
        store.countRows("transactions"),
        loadPlans(deps.plans),
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
          const p = plansNow[live.plan];
          mrrPaise += Math.round((p.pricePaise * 30) / p.days);
        }
      }
      const t0 = Date.parse(`${today()}T00:00:00Z`);
      const usersTrend = Array.from({ length: 30 }, (_, i) => {
        const day = new Date(t0 - (29 - i) * DAY).toISOString().slice(0, 10);
        return users.filter((u) => u.createdAt.slice(0, 10) === day).length;
      });
      return {
        users: users.length,
        usersByPlan,
        projects,
        transactions,
        mrrPaise,
        pendingPayments: payments.length,
        usersTrend,
      };
    },

    async users() {
      const [users, subs] = await Promise.all([store.listUsers(), store.listAllSubscriptions()]);
      const per = byUser(subs);
      return users.map((u) => {
        const live = liveSub(per.get(u.id) ?? []);
        const isSuper = isAdmin({ email: u.email, userId: u.id });
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
      const [rows, users, plansNow] = await Promise.all([
        store.listAllPayments(status),
        store.listUsers(),
        loadPlans(deps.plans),
      ]);
      const email = new Map(users.map((u) => [u.id, u.email]));
      return rows
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((p) => ({
          id: p.id,
          utr: p.utr,
          userEmail: email.get(p.userId) ?? p.userId,
          /** Matches the reference the user writes in the UPI remark. */
          reference: paymentReference(p.userId),
          plan: plansNow[p.plan]?.label ?? p.plan,
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
        // Privacy: the console never shows what a user typed (names, categories, notes), only the type and amount.
        category: t.type ? t.type[0].toUpperCase() + t.type.slice(1) : "—",
        counterparty: "Hidden",
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

    /* ---- plans the admin can edit ---- */
    async plans() {
      return loadPlans(deps.plans);
    },

    async savePlan(
      adminId: string,
      planId: string,
      input: { label?: unknown; priceRupees?: unknown; days?: unknown },
    ) {
      if (!deps.plans) throw new SubscriptionError("validation", "Plan editing is not available.");
      if (!isPlanId(planId)) throw new SubscriptionError("not_found", "Unknown plan.", 404);
      const config = validatePlanInput(planId, input);
      await deps.plans.savePlanSetting(planId, config, adminId);
      await audit({
        action: "plan_updated",
        entity: "plan",
        entityId: null,
        actor: adminId,
        detail: JSON.stringify({ planId, ...config }),
      });
      return { planId, ...config };
    },

    /* ---- broadcasts: admin sends, users read the ones for their tier ---- */
    async broadcasts(limit = 20) {
      return store.listBroadcasts(limit);
    },

    async sendBroadcast(
      adminId: string,
      input: { title?: unknown; body?: unknown; audience?: unknown; severity?: unknown },
    ): Promise<Broadcast> {
      const title = String(input.title ?? "").trim();
      const body = String(input.body ?? "").trim();
      if (title.length < 2 || title.length > 80)
        throw new SubscriptionError("validation", "Title must be 2 to 80 characters.");
      if (body.length < 2 || body.length > 600)
        throw new SubscriptionError("validation", "Message must be 2 to 600 characters.");
      const audience = BROADCAST_AUDIENCES.find((a) => a === input.audience);
      const severity = BROADCAST_SEVERITIES.find((s) => s === input.severity);
      if (!audience || !severity)
        throw new SubscriptionError("validation", "Choose an audience and a severity.");
      const saved = await store.insertBroadcast({
        title,
        body,
        audience,
        severity,
        createdBy: adminId,
      });
      await audit({
        action: "broadcast_sent",
        entity: "broadcast",
        entityId: saved.id,
        actor: adminId,
      });
      return saved;
    },

    /** What a signed-in user sees: broadcasts for everyone plus the ones for their own tier. */
    async broadcastsFor(tier: Exclude<BroadcastAudience, "ALL">, limit = 5) {
      const rows = await store.listBroadcasts(50);
      return rows.filter((b) => b.audience === "ALL" || b.audience === tier).slice(0, limit);
    },
  };
};

export type AdminService = ReturnType<typeof createAdminService>;
