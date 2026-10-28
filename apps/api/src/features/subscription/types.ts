export const PLAN_IDS = ["trial", "pro_monthly", "pro_annual"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

/** Prices in paise. Change here only. */
export const PLANS: Record<PlanId, { label: string; pricePaise: number; days: number }> = {
  trial: { label: "1 month free trial", pricePaise: 0, days: 30 },
  pro_monthly: { label: "Pro — monthly", pricePaise: 19900, days: 30 },
  pro_annual: { label: "Pro — annual", pricePaise: 199900, days: 365 },
};

export type PaymentStatus = "pending" | "approved" | "rejected";

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanId;
  startsOn: string; // YYYY-MM-DD
  endsOn: string; // YYYY-MM-DD, last day with access
  paymentId: string | null;
  createdAt: string;
}

export interface PaymentSubmission {
  id: string;
  userId: string;
  plan: PlanId;
  amountPaise: number;
  /** 12-digit UPI reference the user typed in after paying. */
  utr: string;
  status: PaymentStatus;
  note: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

export interface SubscriptionStore {
  listSubscriptions(userId: string): Promise<Subscription[]>;
  insertSubscription(s: Omit<Subscription, "id">): Promise<Subscription>;
  listPayments(userId: string): Promise<PaymentSubmission[]>;
  getPayment(id: string): Promise<PaymentSubmission | null>;
  findPaymentByUtr(utr: string): Promise<PaymentSubmission | null>;
  insertPayment(p: Omit<PaymentSubmission, "id">): Promise<PaymentSubmission>;
  updatePayment(id: string, patch: Partial<PaymentSubmission>): Promise<PaymentSubmission>;
  listPendingPayments(): Promise<PaymentSubmission[]>;
}

export class SubscriptionError extends Error {
  constructor(public code: "validation" | "conflict" | "not_found" | "forbidden", message: string, public status = 400) {
    super(message);
  }
}
