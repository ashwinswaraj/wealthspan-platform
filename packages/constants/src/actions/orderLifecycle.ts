/* ------------------------------------------------------------------
 * Order lifecycle transition map.
 *
 * Derived from the states already declared in `orders.ts` (OrderStatus)
 * and from the transitions the Order Desk / Finance & Escrow / client
 * dashboard actually perform today. Nothing new was invented: every edge
 * below corresponds to an existing `updateOrderInRegistry` call or the
 * automatic `onPaymentReceived` workflow.
 * ------------------------------------------------------------------ */

import type { OrderStatus } from "../orders";

export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["awaiting_payment", "info_requested", "rejected", "cancelled"],
  info_requested: ["pending", "rejected", "cancelled"],
  awaiting_payment: ["payment_received", "cancelled"],
  payment_received: ["assigned", "cancelled", "disputed"],
  assigned: ["progress", "abandoned", "cancelled", "disputed"],
  progress: ["qa", "abandoned", "disputed", "cancelled"],
  abandoned: ["assigned", "cancelled", "disputed"],
  qa: ["delivered", "rework", "disputed"],
  delivered: ["awaiting_approval", "released", "rework", "disputed"],
  awaiting_approval: ["released", "rework", "disputed"],
  rework: ["qa", "progress", "disputed", "cancelled"],
  disputed: ["resolved", "cancelled", "released"],
  // Settled states. The only edges out are the finance-exception paths
  // Finance & Escrow already performs today: holding funds on a settled
  // order (→ disputed) and processing an approved refund (→ cancelled).
  released: ["disputed", "cancelled"],
  resolved: ["disputed", "cancelled"],
  // Truly closed — nothing reopens these.
  cancelled: [],
  rejected: [],
};

export const isValidOrderTransition = (from: OrderStatus, to: OrderStatus) =>
  ORDER_TRANSITIONS[from]?.includes(to) ?? false;

/** Settled or closed: no further work happens on the order itself. */
export const SETTLED_ORDER_STATUSES: readonly OrderStatus[] = [
  "released",
  "resolved",
  "cancelled",
  "rejected",
];

export const isTerminalOrderStatus = (status: OrderStatus) =>
  SETTLED_ORDER_STATUSES.includes(status);
