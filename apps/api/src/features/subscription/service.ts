/**
 * Plans, the free trial, and manual UPI payment approval.
 *
 * A UTR the user types in is NOT proof of payment — anyone can invent 12 digits.
 * So a submission only ever becomes `pending`; access starts when the owner
 * approves it after checking the bank statement. Each UTR can be used once.
 */
import {
  PLANS,
  SubscriptionError,
  type PaymentSubmission,
  type PlanId,
  type Subscription,
  type SubscriptionStore,
} from "./types";

const DATE = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (isoDate: string, days: number) => {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return DATE(d);
};
const UTR = /^\d{12}$/;

/** Short code the user writes in the UPI remark, so the owner can match a bank-statement line to an account. */
export const paymentReference = (userId: string) => `WSP-${String(userId).slice(-5)}`;

export interface Entitlement {
  plan: "free" | PlanId;
  active: boolean;
  endsOn: string | null;
  daysLeft: number;
  trialUsed: boolean;
}

export const createSubscriptionService = (deps: {
  store: SubscriptionStore;
  now?: () => Date;
  adminIds?: string[];
}) => {
  const { store } = deps;
  const now = () => deps.now?.() ?? new Date();
  const today = () => DATE(now());
  const isAdmin = (id: string) => (deps.adminIds ?? []).includes(id);

  const entitlementOf = (subs: Subscription[]): Entitlement => {
    const t = today();
    const live = subs
      .filter((s) => s.startsOn <= t && s.endsOn >= t)
      .sort((a, b) => b.endsOn.localeCompare(a.endsOn))[0];
    const trialUsed = subs.some((s) => s.plan === "trial");
    if (!live) return { plan: "free", active: false, endsOn: null, daysLeft: 0, trialUsed };
    const daysLeft =
      Math.round(
        (Date.parse(`${live.endsOn}T00:00:00Z`) - Date.parse(`${t}T00:00:00Z`)) / 86400000,
      ) + 1;
    return { plan: live.plan, active: true, endsOn: live.endsOn, daysLeft, trialUsed };
  };

  /** New access starts after whatever the user already has, so renewing early loses no days. */
  const startFor = (subs: Subscription[]) => {
    const latest = subs
      .map((s) => s.endsOn)
      .sort()
      .pop();
    return latest && latest >= today() ? addDays(latest, 1) : today();
  };

  return {
    async getEntitlement(userId: string) {
      return entitlementOf(await store.listSubscriptions(userId));
    },

    async startTrial(userId: string): Promise<Subscription> {
      const subs = await store.listSubscriptions(userId);
      if (subs.some((s) => s.plan === "trial"))
        throw new SubscriptionError("conflict", "Free trial already used.", 409);
      const startsOn = startFor(subs);
      try {
        return await store.insertSubscription({
          userId,
          plan: "trial",
          startsOn,
          endsOn: addDays(startsOn, PLANS.trial.days - 1),
          paymentId: null,
          subKey: `trial:${userId}`,
          createdAt: now().toISOString(),
        });
      } catch (e) {
        // A parallel request won the race and the unique sub_key rejected this one.
        if ((await store.listSubscriptions(userId)).some((x) => x.plan === "trial"))
          throw new SubscriptionError("conflict", "Free trial already used.", 409);
        throw e;
      }
    },

    async submitPayment(
      userId: string,
      input: { plan?: string; utr?: string; amountRupees?: number },
    ): Promise<PaymentSubmission> {
      const plan = input.plan as PlanId;
      if (plan !== "pro_monthly" && plan !== "pro_annual")
        throw new SubscriptionError("validation", "Choose a paid plan.");
      const utr = String(input.utr ?? "").replace(/\s+/g, "");
      if (!UTR.test(utr))
        throw new SubscriptionError("validation", "UTR must be exactly 12 digits.");
      const expected = PLANS[plan].pricePaise;
      if (Math.round(Number(input.amountRupees) * 100) !== expected) {
        throw new SubscriptionError(
          "validation",
          `Amount must be ₹${expected / 100} for this plan.`,
        );
      }
      if (await store.findPaymentByUtr(utr))
        throw new SubscriptionError("conflict", "This UTR was already submitted.", 409);
      const mine = await store.listPayments(userId);
      if (mine.filter((p) => p.status === "pending").length >= 3)
        throw new SubscriptionError(
          "conflict",
          "You already have payments waiting for review.",
          429,
        );
      return store.insertPayment({
        userId,
        plan,
        amountPaise: expected,
        utr,
        status: "pending",
        note: null,
        createdAt: now().toISOString(),
        reviewedAt: null,
        reviewedBy: null,
      });
    },

    async listMyPayments(userId: string) {
      return (await store.listPayments(userId)).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
    },

    async listPending(adminId: string) {
      if (!isAdmin(adminId)) throw new SubscriptionError("forbidden", "Admins only.", 403);
      return store.listPendingPayments();
    },

    async review(
      adminId: string,
      paymentId: string,
      decision: "approve" | "reject",
      note?: string,
    ) {
      if (!isAdmin(adminId)) throw new SubscriptionError("forbidden", "Admins only.", 403);
      const p = await store.getPayment(paymentId);
      if (!p) throw new SubscriptionError("not_found", "Payment not found.", 404);
      if (p.status !== "pending") throw new SubscriptionError("conflict", "Already reviewed.", 409);
      const reviewed = {
        reviewedAt: now().toISOString(),
        reviewedBy: adminId,
        note: note?.slice(0, 200) ?? null,
      };
      if (decision === "reject")
        return {
          payment: await store.updatePayment(p.id, { status: "rejected", ...reviewed }),
          subscription: null,
        };
      const subs = await store.listSubscriptions(p.userId);
      const startsOn = startFor(subs);
      let subscription: Subscription;
      try {
        subscription = await store.insertSubscription({
          userId: p.userId,
          plan: p.plan,
          startsOn,
          endsOn: addDays(startsOn, PLANS[p.plan].days - 1),
          paymentId: p.id,
          subKey: `pay:${p.id}`,
          createdAt: now().toISOString(),
        });
      } catch (e) {
        // Two reviews of the same payment at once: the unique sub_key lets only one through.
        if ((await store.getPayment(paymentId))?.status !== "pending")
          throw new SubscriptionError("conflict", "Already reviewed.", 409);
        const dup = (await store.listSubscriptions(p.userId)).some((x) => x.paymentId === p.id);
        if (dup) throw new SubscriptionError("conflict", "Already reviewed.", 409);
        throw e;
      }
      return {
        payment: await store.updatePayment(p.id, { status: "approved", ...reviewed }),
        subscription,
      };
    },
  };
};

export type SubscriptionService = ReturnType<typeof createSubscriptionService>;
