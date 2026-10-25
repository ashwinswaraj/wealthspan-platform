import { professionals } from "./professionals";
import { addNotification } from "./notificationRegistry";
import { recordAuditEvent } from "./auditRegistry";
import type { OrderRow } from "./orders";

/**
 * Local-first workflow adapter.
 *
 * All writes are persisted in localStorage today. The public functions are
 * intentionally isolated so the same domain operations can later be replaced
 * by server actions/API calls without changing dashboard components.
 */
const ESCROW_ADDED_KEY = "jobrio.admin.escrow.overrides.added";

const proEmail = (name: string) =>
  `${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "")}@jobrio.pro`;

const writeEscrow = (order: OrderRow) => {
  if (typeof window === "undefined") return undefined;
  try {
    const current = JSON.parse(window.localStorage.getItem(ESCROW_ADDED_KEY) || "[]") as Array<
      Record<string, unknown>
    >;
    const existing = current.find((row) => row.orderId === order.id);
    if (existing) return String(existing.id);
    const id = `ESC-${Date.now()}`;
    current.unshift({
      id,
      orderId: order.id,
      client: order.c,
      professional: order.pro,
      amount: order.amountNum,
      state: "Funded",
      depositDate: new Date().toISOString().slice(0, 10),
      releaseEligibility: "On client approval",
      tab: "active",
    });
    window.localStorage.setItem(ESCROW_ADDED_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent("jobrio:finance-changed"));
    return id;
  } catch {
    return undefined;
  }
};

/** Runs immediately after an order reaches Payment Received. */
export const onPaymentReceived = (order: OrderRow) => {
  const escrowId = order.escrowId || writeEscrow(order);
  const patch: Partial<OrderRow> = {};
  if (escrowId && order.escrowId !== escrowId) patch.escrowId = escrowId;

  // Idempotent: if an assignment already exists, never reassign the order.
  if (order.pro) return patch;

  const pool = professionals
    .filter((candidate) => candidate.status === "ACTIVE" || candidate.status === "IDLE")
    .sort(
      (a, b) =>
        b.qualityScore * b.acceptanceRate * b.onTimeRate -
        a.qualityScore * a.acceptanceRate * a.onTimeRate,
    );
  const selected = pool[0];
  if (!selected) return patch;

  const assignmentId = `ASG-${Date.now()}`;
  patch.s = "assigned";
  patch.pro = selected.name;
  patch.proEmail = proEmail(selected.name);
  patch.poolSize = pool.length;
  patch.assignmentId = assignmentId;
  patch.assignmentMethod = "auto-ranked-pool";
  patch.assignedAt = new Date().toISOString();

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      "jobrio.assignments.last",
      JSON.stringify({
        id: assignmentId,
        orderId: order.id,
        professional: selected.name,
        poolSize: pool.length,
        createdAt: new Date().toISOString(),
      }),
    );
    window.dispatchEvent(new CustomEvent("jobrio:assignment-changed"));
  }
  recordAuditEvent({
    entity: "assignment",
    entityId: assignmentId,
    action: "auto_assigned",
    actor: "system",
    metadata: { orderId: order.id, professional: selected.name, poolSize: pool.length },
  });
  addNotification({
    type: "order",
    title: `Order #${order.id} assigned`,
    body: `Jobrio matched ${selected.name} from ${pool.length} eligible professionals after payment confirmation.`,
    orderId: order.id,
  });
  return patch;
};

export const releaseEscrowForOrder = (order: OrderRow) => {
  if (typeof window === "undefined") return false;
  try {
    const escrowRows = JSON.parse(window.localStorage.getItem(ESCROW_ADDED_KEY) || "[]") as Array<
      Record<string, unknown>
    >;
    const escrow = escrowRows.find((row) => row.orderId === order.id);
    if (!escrow || escrow.state === "Released") return false;
    escrow.state = "Released";
    escrow.tab = "released";
    escrow.releaseEligibility = "Released";
    escrow.releaseDate = new Date().toISOString().slice(0, 10);
    window.localStorage.setItem(ESCROW_ADDED_KEY, JSON.stringify(escrowRows));

    const gross = Number(escrow.amount ?? order.amountNum);
    const fee = Math.round(gross * 0.15);
    const payoutKey = "jobrio.admin.payout.overrides.added";
    const payouts = JSON.parse(window.localStorage.getItem(payoutKey) || "[]") as Array<
      Record<string, unknown>
    >;
    if (!payouts.some((row) => row.orderId === order.id)) {
      payouts.unshift({
        id: `PO-${Date.now()}`,
        professional: order.pro ?? "Unassigned",
        orderId: order.id,
        gross,
        fee,
        releaseDate: new Date().toISOString().slice(0, 10),
        status: "pending",
        escrowId: String(escrow.id),
      });
      window.localStorage.setItem(payoutKey, JSON.stringify(payouts));
    }
    window.dispatchEvent(new CustomEvent("jobrio:finance-changed"));
    recordAuditEvent({
      entity: "escrow",
      entityId: String(escrow.id),
      action: "released_by_client_approval",
      actor: "client",
      metadata: { orderId: order.id, amount: gross },
    });
    return true;
  } catch {
    return false;
  }
};
