import { useState } from "react";
import { MessageSquare, Package } from "lucide-react";
import { toast } from "sonner";
import { Button, AuditListPage } from "@jobrio/ui/design-system";
import { Card, StatusBadge } from "@/components/dashboard/shared";
import {
  useOrderRegistry,
  updateOrderInRegistry,
  releaseEscrowForOrder,
  addNotification,
  getAvailableActions,
  CLIENT_ORDER_ACTIONS,
  type Actor,
  type OrderRow,
  type OrderStatus,
} from "@jobrio/constants";

/** Client dashboard actor. Permissions come from the client role defaults. */
const CLIENT_ACTOR: Actor = { role: "client" };

/**
 * Executes a client order action. Which actions exist at all is decided by
 * `getAvailableActions`; this only carries out the effect.
 */
const runClientOrderAction = (
  actionId: string,
  order: OrderRow,
  onNavigate?: (key: "messages") => void,
) => {
  switch (actionId) {
    case "order.approve_delivery": {
      const released = releaseEscrowForOrder(order);
      updateOrderInRegistry(order.id, {
        s: "released",
        resolutionNote: "Client approved delivery and escrow was released.",
      });
      addNotification({
        type: "order",
        title: `Order #${order.id} completed`,
        body: "Delivery approved. Escrow released and payout created for the professional.",
        orderId: order.id,
      });
      if (released)
        toast.success(`Order #${order.id} approved`, {
          description: "Escrow released and payout queued.",
        });
      return;
    }
    case "order.request_revision": {
      const note = window.prompt("What needs to change in this delivery?")?.trim();
      if (!note) return;
      updateOrderInRegistry(order.id, { s: "rework", revisionNote: note });
      addNotification({
        type: "order",
        title: `Revision requested for Order #${order.id}`,
        body: "The order has been returned to the professional for rework.",
        orderId: order.id,
      });
      toast.success(`Revision requested for Order #${order.id}`);
      return;
    }
    case "order.message":
      onNavigate?.("messages");
      return;
    case "order.raise_dispute": {
      const reason = window.prompt("Describe the problem with this order:")?.trim();
      if (!reason) return;
      updateOrderInRegistry(order.id, { s: "disputed", resolutionNote: reason });
      addNotification({
        type: "order",
        title: `Dispute raised on Order #${order.id}`,
        body: "Our dispute team will review the order and get back to you.",
        orderId: order.id,
      });
      toast.success(`Dispute raised on Order #${order.id}`);
      return;
    }
    case "order.cancel": {
      const reason = window.prompt("Why are you cancelling this order?")?.trim();
      if (!reason) return;
      updateOrderInRegistry(order.id, { s: "cancelled", resolutionNote: reason });
      addNotification({
        type: "order",
        title: `Order #${order.id} cancelled`,
        body: "The order was cancelled before any payment was collected.",
        orderId: order.id,
      });
      toast.success(`Order #${order.id} cancelled`);
      return;
    }
    default:
      return;
  }
};

const TABS = [
  { key: "active", label: "Active", icon: "bolt" },
  { key: "wip", label: "Work in progress", icon: "engineering" },
  { key: "completed", label: "Completed", icon: "task_alt" },
  { key: "cancelled", label: "Cancelled", icon: "cancel" },
  { key: "disputes", label: "Disputes", icon: "gavel" },
];

const SORT_OPTIONS = [
  { key: "recent", label: "Recent" },
  { key: "oldest", label: "Oldest" },
  { key: "amount-high", label: "Highest amount" },
  { key: "amount-low", label: "Lowest amount" },
];

// Client tab an order status belongs to.
const TAB_OF: Record<OrderStatus, string> = {
  pending: "active",
  info_requested: "active",
  awaiting_payment: "active",
  payment_received: "active",
  awaiting_approval: "active",
  abandoned: "active",
  assigned: "wip",
  progress: "wip",
  qa: "wip",
  delivered: "wip",
  rework: "wip",
  released: "completed",
  resolved: "completed",
  rejected: "cancelled",
  cancelled: "cancelled",
  disputed: "disputes",
};

// Badge tone reused from StatusBadge's fixed palette, with the real
// lifecycle label shown as an override.
const BADGE_OF: Record<
  OrderStatus,
  { tone: "paid" | "pending" | "active" | "completed" | "disputed" | "cancelled"; label: string }
> = {
  pending: { tone: "pending", label: "Pending Review" },
  info_requested: { tone: "pending", label: "Awaiting Your Info" },
  awaiting_payment: { tone: "pending", label: "Awaiting Payment" },
  payment_received: { tone: "active", label: "Payment Received" },
  assigned: { tone: "active", label: "Assigned" },
  progress: { tone: "active", label: "In Progress" },
  abandoned: { tone: "disputed", label: "Abandoned" },
  qa: { tone: "active", label: "In Quality Review" },
  delivered: { tone: "active", label: "Delivered — Review Now" },
  awaiting_approval: { tone: "active", label: "Awaiting Your Approval" },
  rework: { tone: "pending", label: "In Rework" },
  disputed: { tone: "disputed", label: "Disputed" },
  released: { tone: "completed", label: "Completed" },
  cancelled: { tone: "cancelled", label: "Cancelled" },
  rejected: { tone: "cancelled", label: "Rejected" },
  resolved: { tone: "completed", label: "Resolved" },
};

export const OrdersSection = ({ onNavigate }: { onNavigate?: (key: "messages") => void } = {}) => {
  const [tab, setTab] = useState("active");
  const [sort, setSort] = useState("recent");
  const [query, setQuery] = useState("");
  const allOrders = useOrderRegistry();

  let orders = allOrders
    .filter((o) => TAB_OF[o.s] === tab)
    .map((o) => ({
      id: `#${o.id}`,
      title: o.service || o.category || "Order",
      pro: o.pro ?? "Unassigned",
      badge: BADGE_OF[o.s],
      amount: o.a,
    }))
    .filter((o) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        o.pro.toLowerCase().includes(q)
      );
    });

  if (sort === "amount-high" || sort === "amount-low") {
    const num = (s: string) => Number(s.replace(/[^0-9.]/g, "")) || 0;
    orders = [...orders].sort((a, b) =>
      sort === "amount-high" ? num(b.amount) - num(a.amount) : num(a.amount) - num(b.amount),
    );
  } else if (sort === "oldest") {
    orders = [...orders].reverse();
  }

  return (
    <AuditListPage
      title="My orders"
      description="Track everything in one place."
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      sortOptions={SORT_OPTIONS}
      sortValue={sort}
      onSortChange={setSort}
      count={orders.length}
      isEmpty={orders.length === 0}
      emptyMessage="No orders found."
      search={{
        query,
        onSearch: setQuery,
        placeholder: "Search by Order ID · Service · Professional…",
      }}
    >
      <div className="grid gap-3">
        {orders.map((o) => (
          <Card key={o.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Package size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-on-background truncate">{o.title}</span>
                  <StatusBadge status={o.badge.tone} label={o.badge.label} />
                </div>
                <div className="text-xs text-on-surface-variant mt-0.5">
                  {o.id} · Assigned to {o.pro}
                </div>
              </div>
              <div className="text-sm font-bold text-on-background hidden sm:block">{o.amount}</div>
              {(() => {
                const full = allOrders.find((x) => `#${x.id}` === o.id);
                if (!full) return null;
                const actions = getAvailableActions({
                  definitions: CLIENT_ORDER_ACTIONS,
                  state: full.s,
                  resource: full,
                  actor: CLIENT_ACTOR,
                });
                if (actions.length === 0) return null;
                return (
                  <div className="flex flex-wrap gap-2 justify-end">
                    {actions.map((action) => (
                      <Button
                        key={action.id}
                        variant={action.group === "primary" ? "secondary" : "outline"}
                        size="sm"
                        disabled={action.disabled}
                        title={action.disabledReason}
                        onClick={() => runClientOrderAction(action.id, full, onNavigate)}
                      >
                        {action.id === "order.message" && <MessageSquare size={14} />}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                );
              })()}
            </div>
          </Card>
        ))}
      </div>
    </AuditListPage>
  );
};
