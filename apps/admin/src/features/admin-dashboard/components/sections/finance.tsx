import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  ShieldCheck,
  Wallet,
  XCircle,
  X,
} from "lucide-react";
import { cn } from "@jobrio/utils/utils";
import { SectionHeader, Card } from "@admin/features/admin-dashboard/components/sections";
import {
  Stat,
  Tabs,
  Row,
  Badge,
  Detail,
  SectionTitle,
  AEIcon,
  InfoChip,
  ActionBtn,
  WFShell,
} from "@admin/features/admin-dashboard/components/sections-shared";
import { SortDropdown } from "@admin/features/admin-dashboard/components/SortDropdown";
import { Input, Button } from "@jobrio/ui/design-system";
import {
  useOrderRegistry,
  updateOrderInRegistry,
  addNotification,
  getOrderRegistrySnapshot,
  addPayment,
  type OrderRow,
} from "@jobrio/constants";
import {
  useBillRegistry,
  generateInvoiceForBill,
  upsertBillForOrder,
  type BillTab,
  type BillRow,
} from "@admin/features/admin-dashboard/lib/billRegistry";
import {
  useEscrowRegistry,
  usePayoutRegistry,
  useRefundRegistry,
  releaseEscrowToPayout,
  settlePayout,
  holdPayout,
  processRefund,
  approveRefund,
  rejectRefund,
  escrowStateTone,
  payoutTone,
  payoutLabel,
  refundTone,
  refundLabel,
  type EscrowTab,
  type PayoutTab,
  type PayoutRow,
  type RefundTab,
} from "@admin/features/admin-dashboard/lib/opsRegistry";

/* ============================================================
 * 8. FINANCE & ESCROW
 * ============================================================ */

type FinKey =
  "billing" | "escrow" | "payout" | "refund" | "revenue" | "exceptions" | "history" | "analytics";

const FIN_NAV: { key: FinKey; label: string; icon: string }[] = [
  { key: "billing", label: "Billing Center", icon: "receipt_long" },
  { key: "escrow", label: "Escrow Center", icon: "account_balance" },
  { key: "payout", label: "Payout Center", icon: "payments" },
  { key: "refund", label: "Refund Center", icon: "undo" },
  { key: "revenue", label: "Revenue Center", icon: "trending_up" },
  { key: "exceptions", label: "Financial Exceptions", icon: "report" },
  { key: "history", label: "Financial History", icon: "history" },
  { key: "analytics", label: "Finance Analytics", icon: "monitoring" },
];

/* ---------- Billing Center ---------- */
const billStatusTone = (s: BillTab) =>
  s === "pending"
    ? "bg-amber-50 text-amber-700"
    : s === "awaiting"
      ? "bg-primary-container/10 text-primary-container"
      : "bg-emerald-50 text-emerald-700";
const billStatusLabel = (s: BillTab) =>
  s === "pending" ? "Pending Billing" : s === "awaiting" ? "Awaiting Payment" : "Paid";

/** A live order approved from the Order Desk, waiting for Finance to price
 *  it and send the client a bill. Clicking "Create Bill" opens the Bill
 *  Creation screen — generating the invoice there is what flips the order
 *  to "Awaiting Payment" everywhere (Order Desk, Global Search, the
 *  client's Notifications feed) via the shared registry. */
const PendingOrderBillCard = ({
  order,
  highlighted,
  onCreateBill,
}: {
  order: OrderRow;
  highlighted?: boolean;
  onCreateBill: (order: OrderRow) => void;
}) => {
  return (
    <Card
      id={`bill-order-${order.id}`}
      className={cn("!p-4", highlighted && "ring-2 ring-primary/50")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-extrabold text-on-surface">Order #{order.id}</p>
            <Badge tone="bg-amber-50 text-amber-700">Approved — Pending Billing</Badge>
          </div>
          <p className="text-xs text-outline mt-0.5">
            {order.c} · {order.service}
          </p>
        </div>
        <ActionBtn
          label="Create Bill"
          icon="receipt"
          tone="primary"
          onClick={() => onCreateBill(order)}
        />
      </div>
    </Card>
  );
};

/** Full-screen Bill Creation screen — opened deliberately from "Create
 *  Bill" / "Generate Invoice", instead of generating instantly inline. The
 *  admin reviews/edits the amount, confirms, and only then does the bill
 *  get created and sent (and the row moves out of Pending Billing). */
const BillCreationOverlay = ({
  target,
  onClose,
}: {
  target: { kind: "order"; order: OrderRow } | { kind: "bill"; bill: BillRow };
  onClose: () => void;
}) => {
  const seedValue = target.kind === "bill" ? target.bill.value : undefined;
  const seedTax = target.kind === "bill" ? target.bill.tax : undefined;
  const seedDiscount = target.kind === "bill" ? target.bill.discount : 0;

  const [value, setValue] = useState(seedValue !== undefined ? String(seedValue) : "");
  const [tax, setTax] = useState(seedTax !== undefined ? String(seedTax) : "");
  const [discount, setDiscount] = useState(seedDiscount !== undefined ? String(seedDiscount) : "");
  const [error, setError] = useState("");

  const id = target.kind === "order" ? target.order.id : target.bill.id;
  const client = target.kind === "order" ? target.order.c : target.bill.client;
  const service = target.kind === "order" ? target.order.service : target.bill.service;

  const valueNum = Number(value) || 0;
  const taxNum = Number(tax) || 0;
  const discountNum = Number(discount) || 0;
  const finalBill = Math.max(0, valueNum + taxNum - discountNum);

  const handleConfirm = () => {
    if (valueNum <= 0) {
      setError("Enter the order value to generate a bill.");
      return;
    }

    if (target.kind === "order") {
      const now = new Date();
      const invoiceNo = `INV-${id.replace(/[^0-9A-Za-z]/g, "")}`;
      const invoiceDate = now.toISOString().slice(0, 10);
      const paymentDue = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      upsertBillForOrder({
        id,
        client,
        service,
        value: valueNum,
        tax: taxNum,
        discount: discountNum,
        status: "awaiting",
        invoiceNo,
        invoiceDate,
        paymentDue,
      });
      updateOrderInRegistry(id, {
        s: "awaiting_payment",
        a: `₹${finalBill.toLocaleString()}`,
        amountNum: finalBill,
        invoiceNo,
        invoiceDate,
        paymentDue,
      });
      addNotification({
        type: "invoice",
        title: `Invoice ${invoiceNo} sent for Order #${id}`,
        body: `Your bill of ₹${finalBill.toLocaleString()} is ready — please complete payment by ${paymentDue}.`,
        clientId: target.order.clientId,
        orderId: id,
      });
      toast.success(`Invoice sent for #${id}`, {
        description: `${invoiceNo} · ₹${finalBill.toLocaleString()} — order moved to Awaiting Payment.`,
        duration: 2800,
      });
    } else {
      const updated = generateInvoiceForBill(id, {
        value: valueNum,
        tax: taxNum,
        discount: discountNum,
      });
      if (updated) {
        toast.success(`Invoice generated for #${id}`, {
          description: `${updated.invoiceNo} · ₹${finalBill.toLocaleString()} — moved to Awaiting Payment.`,
          duration: 2800,
        });
      }
    }
    onClose();
  };

  return (
    <WFShell
      title={`Create Bill · #${id}`}
      subtitle="Bill Creation"
      badge={<Badge tone="bg-amber-50 text-amber-700">Pending Billing</Badge>}
      onClose={onClose}
    >
      <Card>
        <SectionTitle title="Order Summary" hint="Client & service being billed" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <Detail k="Order ID" v={`#${id}`} />
          <Detail k="Client" v={client} />
          <Detail k="Service" v={service} />
        </div>
      </Card>

      <Card>
        <SectionTitle title="Invoice Amount" hint="Review and adjust before sending" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="block">
            <span className="text-[11px] font-bold uppercase text-outline">Order Value (₹)</span>
            <Input
              type="number"
              min={0}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError("");
              }}
              placeholder="0"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase text-outline">Tax (₹)</span>
            <Input
              type="number"
              min={0}
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              placeholder="0"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase text-outline">Discount (₹)</span>
            <Input
              type="number"
              min={0}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0"
            />
          </label>
          <InfoChip k="Final Bill" v={`₹${finalBill.toLocaleString()}`} tone="text-emerald-600" />
        </div>
        {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
      </Card>

      <div className="flex flex-wrap justify-end gap-2 pt-1">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low border border-outline-variant/40 text-on-surface"
        >
          Cancel
        </button>
        <ActionBtn
          label="Create & Send Invoice"
          icon="receipt"
          tone="primary"
          onClick={handleConfirm}
        />
      </div>
    </WFShell>
  );
};

const BillingCenterView = ({ highlightOrderId }: { highlightOrderId?: string }) => {
  const [tab, setTab] = useState<BillTab>("pending");
  const orders = useOrderRegistry();
  const approvedOrders = orders.filter((o) => o.s === "pending" && o.approvedForBilling);
  const billRows = useBillRegistry();
  const rows = billRows.filter((r) => r.status === tab);
  const [billTarget, setBillTarget] = useState<
    { kind: "order"; order: OrderRow } | { kind: "bill"; bill: BillRow } | null
  >(null);

  useEffect(() => {
    if (!highlightOrderId) return;
    setTab("pending");
    const el = document.getElementById(`bill-order-${highlightOrderId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightOrderId]);

  return (
    <div className="space-y-4">
      <SortDropdown<BillTab>
        value={tab}
        onChange={setTab}
        options={[
          {
            key: "pending",
            label: "Pending Billing",
            count: billRows.filter((r) => r.status === "pending").length + approvedOrders.length,
          },
          {
            key: "awaiting",
            label: "Awaiting Payment",
            count: billRows.filter((r) => r.status === "awaiting").length,
          },
          {
            key: "paid",
            label: "Paid",
            count: billRows.filter((r) => r.status === "paid").length,
          },
        ]}
      />
      {tab === "pending" &&
        approvedOrders.map((o) => (
          <PendingOrderBillCard
            key={o.id}
            order={o}
            highlighted={o.id === highlightOrderId}
            onCreateBill={(order) => setBillTarget({ kind: "order", order })}
          />
        ))}
      {rows.map((r) => {
        const finalBill = r.value + r.tax - r.discount;
        return (
          <Card key={r.id} className="!p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-extrabold text-on-surface">Order #{r.id}</p>
                  <Badge tone={billStatusTone(r.status)}>{billStatusLabel(r.status)}</Badge>
                </div>
                <p className="text-xs text-outline mt-0.5">
                  {r.client} · {r.service}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              <InfoChip k="Order Value" v={`₹${r.value.toLocaleString()}`} />
              <InfoChip k="Taxes" v={`₹${r.tax.toLocaleString()}`} />
              <InfoChip k="Discounts" v={`₹${r.discount.toLocaleString()}`} />
              <InfoChip
                k="Final Bill"
                v={`₹${finalBill.toLocaleString()}`}
                tone="text-emerald-600"
              />
            </div>
            {r.status === "awaiting" && r.invoiceNo && (
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                <InfoChip k="Invoice No." v={r.invoiceNo} />
                <InfoChip k="Invoice Date" v={r.invoiceDate ?? "—"} />
                <InfoChip k="Payment Due" v={r.paymentDue ?? "—"} />
              </div>
            )}
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              {r.status === "pending" && (
                <ActionBtn
                  label="Generate Invoice"
                  icon="receipt"
                  tone="primary"
                  onClick={() => setBillTarget({ kind: "bill", bill: r })}
                />
              )}
              {r.status === "awaiting" && (
                <>
                  <ActionBtn label="Edit Invoice · Coming Soon" icon="edit" tone="neutral" />
                  <ActionBtn label="Resend Invoice · Backend Required" icon="send" tone="neutral" />
                  <ActionBtn
                    label="Mark Offline Payment"
                    icon="check_circle"
                    tone="success"
                    onClick={() => {
                      const order = getOrderRegistrySnapshot().find((o) => o.id === r.id);
                      if (!order) return;
                      const now = new Date().toISOString();
                      const reference = `OFF-${Date.now()}`;
                      const paymentId = `PAY-${Date.now()}`;
                      addPayment({
                        id: paymentId,
                        orderId: order.id,
                        invoiceNo: order.invoiceNo ?? `INV-${order.id}`,
                        amount: order.amountNum,
                        method: "Offline",
                        status: "verified",
                        reference,
                        createdAt: now,
                        verifiedAt: now,
                      });
                      updateOrderInRegistry(order.id, {
                        s: "payment_received",
                        paymentId,
                        paymentMethod: "Offline",
                        paymentReference: reference,
                      });
                      toast.success(`Payment received for #${r.id}`, {
                        description:
                          "Assignment Engine started automatically from the payment event.",
                        duration: 2500,
                      });
                    }}
                  />
                </>
              )}
              {r.status === "paid" && (
                <ActionBtn label="View Invoice" icon="visibility" tone="neutral" />
              )}
            </div>
          </Card>
        );
      })}
      {billTarget && (
        <BillCreationOverlay target={billTarget} onClose={() => setBillTarget(null)} />
      )}
    </div>
  );
};

/* ---------- Escrow Center ---------- */

/* ---------- Escrow Center ---------- */

const EscrowCenterView = () => {
  const rows = useEscrowRegistry();
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Escrow Center"
        subtitle="Funds received from clients and held until delivery approval."
      />
      <div className="grid gap-3">
        {rows.map((row) => (
          <Card key={row.id} className="!p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-extrabold text-on-surface">
                    {row.id} · Order #{row.orderId}
                  </p>
                  <Badge tone={escrowStateTone(row.state)}>{row.state}</Badge>
                </div>
                <p className="text-xs text-outline mt-0.5">
                  {row.client} · {row.professional ?? "Unassigned"}
                </p>
              </div>
            </div>
            <div className="mt-3 text-sm font-bold text-on-surface">
              ₹{row.amount.toLocaleString()}
            </div>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              {(row.state === "Funded" || row.state === "Release Pending") && (
                <ActionBtn
                  label="Release Escrow"
                  icon="payments"
                  tone="primary"
                  onClick={() => {
                    releaseEscrowToPayout(row.id);
                    toast.success(`${row.id} released`, {
                      description: "Payout has been created for the professional.",
                    });
                  }}
                />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ---------- Payout Center ---------- */

const PayoutDetailOverlay = ({ row, onClose }: { row: PayoutRow; onClose: () => void }) => {
  const net = row.gross - row.fee;
  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-surface w-full md:max-w-2xl md:rounded-2xl rounded-none border border-outline-variant/40 shadow-2xl overflow-hidden max-h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-4 border-b border-surface-container-high">
          <div>
            <p className="text-sm font-bold">Payout Detail · {row.id}</p>
            <p className="text-xs text-outline mt-0.5">
              {row.professional} · Order #{row.orderId}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-outline hover:text-on-surface hover:bg-surface-container"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <Detail k="Professional" v={row.professional} />
            <Detail k="Order" v={`#${row.orderId}`} />
            <Detail k="Escrow Ref" v={row.escrowId} />
            <Detail k="Status" v={payoutLabel(row.status)} />
          </div>
          <Card>
            <p className="text-sm font-bold mb-2">Fee Breakdown</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <InfoChip k="Gross" v={`₹${row.gross.toLocaleString()}`} />
              <InfoChip k="Platform Fee" v={`₹${row.fee.toLocaleString()}`} tone="text-rose-600" />
              <InfoChip k="Net Payout" v={`₹${net.toLocaleString()}`} tone="text-emerald-600" />
            </div>
          </Card>
          <Card>
            <p className="text-sm font-bold mb-2">Payout Timeline</p>
            <ul className="space-y-2 text-xs">
              <li className="flex gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="text-outline w-24">Released</span>
                <span>Escrow released · {row.releaseDate}</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="text-outline w-24">Initiated</span>
                <span>Payout initiated to bank account</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-outline w-24">
                  {row.status === "completed" ? "Settled" : "Pending"}
                </span>
                <span>Tx Ref {row.txRef ?? "—"}</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

const PayoutCenterView = () => {
  const [tab, setTab] = useState<PayoutTab>("pending");
  const [openId, setOpenId] = useState<string | null>(null);
  const PAYOUT_ROWS = usePayoutRegistry();
  const open = PAYOUT_ROWS.find((r) => r.id === openId) || null;
  const rows = PAYOUT_ROWS.filter((r) => r.status === tab);
  return (
    <div className="space-y-4">
      <SortDropdown<PayoutTab>
        value={tab}
        onChange={setTab}
        options={[
          {
            key: "pending",
            label: "Pending Payouts",
            count: PAYOUT_ROWS.filter((r) => r.status === "pending").length,
          },
          {
            key: "processing",
            label: "Processing",
            count: PAYOUT_ROWS.filter((r) => r.status === "processing").length,
          },
          {
            key: "completed",
            label: "Completed",
            count: PAYOUT_ROWS.filter((r) => r.status === "completed").length,
          },
          {
            key: "failed",
            label: "Failed",
            count: PAYOUT_ROWS.filter((r) => r.status === "failed").length,
          },
        ]}
      />
      {rows.map((r) => {
        const net = r.gross - r.fee;
        return (
          <Card key={r.id} className="!p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-extrabold text-on-surface">{r.professional}</p>
                  <Badge tone={payoutTone(r.status)}>{payoutLabel(r.status)}</Badge>
                </div>
                <p className="text-xs text-outline mt-0.5">
                  {r.id} · Order #{r.orderId}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              <InfoChip k="Gross" v={`₹${r.gross.toLocaleString()}`} />
              <InfoChip k="Platform Fee" v={`₹${r.fee.toLocaleString()}`} tone="text-rose-600" />
              <InfoChip k="Net Payout" v={`₹${net.toLocaleString()}`} tone="text-emerald-600" />
              <InfoChip k="Release Date" v={r.releaseDate} />
            </div>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              {r.status === "pending" && (
                <ActionBtn
                  label="Process Payout"
                  icon="payments"
                  tone="primary"
                  onClick={() => {
                    settlePayout(r.id);
                    toast.success(`Payout ${r.id} completed`, {
                      description: `₹${net.toLocaleString()} settled to ${r.professional}.`,
                      duration: 2500,
                    });
                  }}
                />
              )}
              {r.status === "failed" && (
                <ActionBtn
                  label="Retry Payout"
                  icon="autorenew"
                  tone="warn"
                  onClick={() => {
                    settlePayout(r.id);
                    toast.success(`${r.id} retried and settled`, { duration: 2500 });
                  }}
                />
              )}
              {(r.status === "pending" || r.status === "processing") && (
                <ActionBtn
                  label="Hold Payout"
                  icon="pause_circle"
                  tone="neutral"
                  onClick={() => {
                    holdPayout(r.id);
                    toast(`${r.id} held for review`);
                  }}
                />
              )}
              <ActionBtn
                label="View Details"
                icon="visibility"
                tone="neutral"
                onClick={() => setOpenId(r.id)}
              />
            </div>
          </Card>
        );
      })}
      {open && <PayoutDetailOverlay row={open} onClose={() => setOpenId(null)} />}
    </div>
  );
};

/* ---------- Refund Center ---------- */

const RefundCenterView = () => {
  const [tab, setTab] = useState<RefundTab>("requests");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const REFUND_ROWS = useRefundRegistry();
  const rows = REFUND_ROWS.filter((r) => r.status === tab);
  return (
    <div className="space-y-4">
      <SortDropdown<RefundTab>
        value={tab}
        onChange={setTab}
        options={[
          {
            key: "requests",
            label: "Refund Requests",
            count: REFUND_ROWS.filter((r) => r.status === "requests").length,
          },
          {
            key: "review",
            label: "Under Review",
            count: REFUND_ROWS.filter((r) => r.status === "review").length,
          },
          {
            key: "approved",
            label: "Approved",
            count: REFUND_ROWS.filter((r) => r.status === "approved").length,
          },
          {
            key: "completed",
            label: "Completed",
            count: REFUND_ROWS.filter((r) => r.status === "completed").length,
          },
          {
            key: "rejected",
            label: "Rejected",
            count: REFUND_ROWS.filter((r) => r.status === "rejected").length,
          },
        ]}
      />
      {rows.map((r) => {
        const rejecting = rejectingId === r.id;
        return (
          <Card key={r.id} className="!p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-extrabold text-on-surface">{r.id}</p>
                  <Badge tone={refundTone(r.status)}>{refundLabel(r.status)}</Badge>
                  <Badge tone="bg-slate-100 text-slate-700">{r.source}</Badge>
                </div>
                <p className="text-xs text-outline mt-0.5">
                  Order #{r.orderId} · {r.client}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              <InfoChip
                k="Refund Amount"
                v={`₹${r.amount.toLocaleString()}`}
                tone="text-rose-600"
              />
              <InfoChip k="Reason" v={r.reason} />
              <InfoChip k="Source Module" v={r.source} />
              <InfoChip k="Status" v={refundLabel(r.status)} />
            </div>
            {r.status === "rejected" && r.rejectionReason && (
              <p className="mt-2 text-xs text-outline italic">
                Rejection note: {r.rejectionReason}
              </p>
            )}
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              {(r.status === "requests" || r.status === "review") && (
                <>
                  <ActionBtn
                    label="Approve Refund"
                    icon="check_circle"
                    tone="success"
                    onClick={() => {
                      approveRefund(r.id);
                      toast.success(`${r.id} approved`, { duration: 2200 });
                    }}
                  />
                  <ActionBtn
                    label="Reject Refund"
                    icon="cancel"
                    tone="danger"
                    onClick={() => {
                      setRejectingId(rejecting ? null : r.id);
                      setRejectReason("");
                    }}
                  />
                </>
              )}
              {r.status === "approved" && (
                <ActionBtn
                  label="Process Refund"
                  icon="payments"
                  tone="primary"
                  onClick={() => {
                    processRefund(r.id);
                    toast.success(`${r.id} refunded`, {
                      description: `Order #${r.orderId} marked Cancelled & Refunded.`,
                      duration: 2800,
                    });
                  }}
                />
              )}
              <ActionBtn label="View Details" icon="visibility" tone="neutral" />
            </div>
            {rejecting && (
              <div className="mt-3 pt-3 border-t border-outline-variant/40">
                <span className="text-[11px] font-bold uppercase text-outline">
                  Rejection Reason (required)
                </span>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={2}
                  placeholder="Explain why this refund request is being rejected — the client will see this."
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    className="px-4 py-2 rounded-full text-xs font-bold"
                    onClick={() => {
                      if (!rejectReason.trim()) {
                        toast.error("A reason is required to reject this refund.");
                        return;
                      }
                      rejectRefund(r.id, rejectReason.trim());
                      toast.success(`${r.id} rejected`, {
                        description: "The client has been notified with your reason.",
                        duration: 2500,
                      });
                      setRejectingId(null);
                      setRejectReason("");
                    }}
                  >
                    Confirm Rejection
                  </Button>
                  <button
                    onClick={() => setRejectingId(null)}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low border border-outline-variant/40 text-on-surface"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

/* ---------- Revenue Center ---------- */
type RevTime = "daily" | "weekly" | "monthly" | "yearly";
const RevenueCenterView = () => {
  const [t, setT] = useState<RevTime>("monthly");
  return (
    <div className="space-y-5">
      <Row cols={4}>
        <Stat
          label="Gross Revenue"
          value="₹6.84L"
          icon={DollarSign}
          tint="bg-violet-500/10 text-violet-600"
        />
        <Stat
          label="Platform Fees"
          value="₹1.02L"
          icon={Wallet}
          tint="bg-primary-container/10 text-primary-container"
        />
        <Stat
          label="Net Revenue"
          value="₹5.82L"
          icon={CheckCircle2}
          tint="bg-emerald-500/10 text-emerald-600"
        />
        <Stat
          label="Escrow Volume"
          value="₹3.91L"
          icon={ShieldCheck}
          tint="bg-amber-500/10 text-amber-600"
        />
      </Row>
      <Row cols={3}>
        <Stat
          label="Refund Volume"
          value="₹38k"
          icon={XCircle}
          tint="bg-rose-500/10 text-rose-600"
        />
        <Stat
          label="Monthly Revenue"
          value="₹1.64L"
          icon={Activity}
          tint="bg-primary-container/10 text-primary-container"
        />
        <Stat
          label="Annual Revenue"
          value="₹19.4L"
          icon={Layers}
          tint="bg-violet-500/10 text-violet-600"
        />
      </Row>

      <Card>
        <SectionTitle title="Service-wise Revenue" hint="Top performing services" />
        <ul className="divide-y divide-surface-container-high/60 text-sm">
          {[
            { s: "Logo Design", v: "₹1.42L" },
            { s: "Explainer Video", v: "₹1.18L" },
            { s: "Landing Page", v: "₹98k" },
            { s: "Whitepaper", v: "₹76k" },
          ].map((x) => (
            <li key={x.s} className="py-2.5 flex items-center justify-between">
              <span>{x.s}</span>
              <Badge tone="bg-emerald-50 text-emerald-700">{x.v}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionTitle title="Category-wise Revenue" hint="By service category" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <InfoChip k="Design" v="₹2.41L" tone="text-emerald-600" />
          <InfoChip k="Video Editing" v="₹1.62L" tone="text-emerald-600" />
          <InfoChip k="Content Writing" v="₹1.08L" tone="text-emerald-600" />
          <InfoChip k="Marketing" v="₹74k" tone="text-emerald-600" />
        </div>
      </Card>

      <Card>
        <SectionTitle title="Time-wise Revenue" hint="Aggregate trends" />
        <Tabs<RevTime>
          value={t}
          onChange={setT}
          tabs={[
            { key: "daily", label: "Daily" },
            { key: "weekly", label: "Weekly" },
            { key: "monthly", label: "Monthly" },
            { key: "yearly", label: "Yearly" },
          ]}
        />
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          <InfoChip k="Period" v={t.charAt(0).toUpperCase() + t.slice(1)} />
          <InfoChip
            k="Gross"
            v={
              t === "daily" ? "₹22k" : t === "weekly" ? "₹1.4L" : t === "monthly" ? "₹6.1L" : "₹74L"
            }
          />
          <InfoChip
            k="Net"
            v={
              t === "daily" ? "₹18k" : t === "weekly" ? "₹1.2L" : t === "monthly" ? "₹5.2L" : "₹63L"
            }
            tone="text-emerald-600"
          />
          <InfoChip
            k="Growth"
            v={
              t === "daily"
                ? "+4.2%"
                : t === "weekly"
                  ? "+6.8%"
                  : t === "monthly"
                    ? "+11.2%"
                    : "+18.4%"
            }
            tone="text-emerald-600"
          />
        </div>
      </Card>
    </div>
  );
};

/* ---------- Financial Exceptions ---------- */
type ExType =
  | "Payment Failure"
  | "Duplicate Payment"
  | "Escrow Mismatch"
  | "Payout Failure"
  | "Refund Failure"
  | "Fraud Alert";
type FinExSeverity = "Medium" | "High" | "Critical";
type FinExRow = {
  id: string;
  type: ExType;
  orderId: string;
  party: string;
  amount: number;
  trigger: string;
  severity: FinExSeverity;
};
const FIN_EX_ROWS: FinExRow[] = [
  {
    id: "FX-501",
    type: "Payment Failure",
    orderId: "JR-1051",
    party: "Initech",
    amount: 5664,
    trigger: "12m ago",
    severity: "High",
  },
  {
    id: "FX-502",
    type: "Duplicate Payment",
    orderId: "JR-1048",
    party: "Globex",
    amount: 12500,
    trigger: "42m ago",
    severity: "Medium",
  },
  {
    id: "FX-503",
    type: "Escrow Mismatch",
    orderId: "JR-1041",
    party: "Hooli",
    amount: 200,
    trigger: "1h ago",
    severity: "Medium",
  },
  {
    id: "FX-504",
    type: "Payout Failure",
    orderId: "JR-1014",
    party: "N. Patel",
    amount: 4080,
    trigger: "2h ago",
    severity: "High",
  },
  {
    id: "FX-505",
    type: "Refund Failure",
    orderId: "JR-1024",
    party: "Aviato",
    amount: 5400,
    trigger: "3h ago",
    severity: "High",
  },
  {
    id: "FX-506",
    type: "Fraud Alert",
    orderId: "JR-1019",
    party: "Unknown",
    amount: 9512,
    trigger: "5h ago",
    severity: "Critical",
  },
];
const finExTone = (s: FinExSeverity) =>
  s === "Critical"
    ? "bg-rose-50 text-rose-700"
    : s === "High"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-700";

const FinancialExceptionsView = () => {
  const [rows, setRows] = useState(FIN_EX_ROWS);
  const [resolvedIds, setResolvedIds] = useState<Record<string, boolean>>({});
  const visible = rows.filter((r) => !resolvedIds[r.id]);

  return (
    <div className="space-y-3">
      {visible.map((r) => (
        <Card key={r.id} className="!p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-extrabold text-on-surface">{r.id}</p>
                <Badge tone={finExTone(r.severity)}>{r.severity}</Badge>
                <Badge tone="bg-slate-100 text-slate-700">{r.type}</Badge>
              </div>
              <p className="text-xs text-outline mt-0.5">
                Order #{r.orderId} · {r.party}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            <InfoChip k="Exception" v={r.type} />
            <InfoChip k="Amount" v={`₹${r.amount.toLocaleString()}`} tone="text-rose-600" />
            <InfoChip k="Party" v={r.party} />
            <InfoChip k="Triggered" v={r.trigger} tone="text-amber-600" />
          </div>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <ActionBtn label="Investigate" icon="search" tone="neutral" />
            <ActionBtn
              label="Hold Funds"
              icon="pause_circle"
              tone="warn"
              onClick={() => {
                if (getOrderRegistrySnapshot().some((o) => o.id === r.orderId)) {
                  updateOrderInRegistry(r.orderId, { s: "disputed" });
                }
                toast.success(`Funds held for ${r.id}`, { duration: 2200 });
              }}
            />
            <ActionBtn
              label="Escalate"
              icon="forward"
              tone="danger"
              onClick={() => {
                addNotification({
                  type: "order",
                  title: `${r.id} escalated to Finance Ops lead`,
                  body: `Financial exception for Order #${r.orderId} requires senior review.`,
                  orderId: r.orderId,
                });
                toast.success(`${r.id} escalation recorded`, { duration: 2200 });
              }}
            />
            <ActionBtn
              label="Resolve"
              icon="check_circle"
              tone="success"
              onClick={() => {
                setResolvedIds((m) => ({ ...m, [r.id]: true }));
                toast.success(`${r.id} resolved`, { duration: 2000 });
              }}
            />
          </div>
        </Card>
      ))}
      {visible.length === 0 && (
        <p className="text-sm text-on-surface-variant p-8 text-center">No open exceptions.</p>
      )}
    </div>
  );
};

/* ---------- Financial History ---------- */
type HistTab = "billing" | "escrow" | "payout" | "refund" | "revenue";
type HistRow = {
  id: string;
  event: string;
  tx: string;
  user: string;
  orderId: string;
  when: string;
};
const HIST_DATA: Record<HistTab, HistRow[]> = {
  billing: [
    {
      id: "INV-2031",
      event: "Invoice generated",
      tx: "TX-99812",
      user: "Aviato",
      orderId: "JR-1031",
      when: "10 Jun",
    },
    {
      id: "INV-2028",
      event: "Invoice paid",
      tx: "TX-99780",
      user: "Vandelay",
      orderId: "JR-1028",
      when: "06 Jun",
    },
  ],
  escrow: [
    {
      id: "ESC-2031",
      event: "Escrow funded",
      tx: "TX-99812",
      user: "Aviato",
      orderId: "JR-1031",
      when: "10 Jun",
    },
    {
      id: "ESC-2028",
      event: "Escrow released",
      tx: "TX-99780",
      user: "Vandelay",
      orderId: "JR-1028",
      when: "14 Jun",
    },
  ],
  payout: [
    {
      id: "PO-3061",
      event: "Payout completed",
      tx: "TX-99780",
      user: "M. Kumar",
      orderId: "JR-1019",
      when: "13 Jun",
    },
    {
      id: "PO-3055",
      event: "Payout failed",
      tx: "TX-99765",
      user: "N. Patel",
      orderId: "JR-1014",
      when: "12 Jun",
    },
  ],
  refund: [
    {
      id: "RF-904",
      event: "Refund processed",
      tx: "TX-99720",
      user: "Pied Piper",
      orderId: "JR-1039",
      when: "08 Jun",
    },
  ],
  revenue: [
    {
      id: "REV-MAY",
      event: "May 2026 revenue snapshot",
      tx: "—",
      user: "Platform",
      orderId: "—",
      when: "31 May",
    },
    {
      id: "REV-APR",
      event: "Apr 2026 revenue snapshot",
      tx: "—",
      user: "Platform",
      orderId: "—",
      when: "30 Apr",
    },
  ],
};

const FinancialHistoryView = () => {
  const [tab, setTab] = useState<HistTab>("billing");
  const [openId, setOpenId] = useState<string | null>(null);
  const open = HIST_DATA[tab].find((r) => r.id === openId) || null;
  return (
    <div className="space-y-4">
      <SortDropdown<HistTab>
        value={tab}
        onChange={(k) => {
          setTab(k);
          setOpenId(null);
        }}
        options={[
          { key: "billing", label: "Billing History", count: HIST_DATA.billing.length },
          { key: "escrow", label: "Escrow History", count: HIST_DATA.escrow.length },
          { key: "payout", label: "Payout History", count: HIST_DATA.payout.length },
          { key: "refund", label: "Refund History", count: HIST_DATA.refund.length },
          { key: "revenue", label: "Revenue History", count: HIST_DATA.revenue.length },
        ]}
      />
      {HIST_DATA[tab].map((r) => (
        <Card key={r.id} className="!p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-on-surface">{r.id}</p>
              <p className="text-xs text-outline mt-0.5">{r.event}</p>
            </div>
            <ActionBtn
              label="View Details"
              icon="visibility"
              tone="neutral"
              onClick={() => setOpenId(r.id)}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            <InfoChip k="Transaction" v={r.tx} />
            <InfoChip k="User" v={r.user} />
            <InfoChip k="Related Order" v={r.orderId === "—" ? "—" : `#${r.orderId}`} />
            <InfoChip k="When" v={r.when} />
          </div>
        </Card>
      ))}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-6"
          onClick={() => setOpenId(null)}
        >
          <div
            className="bg-surface w-full md:max-w-2xl md:rounded-2xl rounded-none border border-outline-variant/40 shadow-2xl overflow-hidden max-h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 p-4 border-b border-surface-container-high">
              <div>
                <p className="text-sm font-bold">{open.id}</p>
                <p className="text-xs text-outline mt-0.5">{open.event}</p>
              </div>
              <button
                onClick={() => setOpenId(null)}
                aria-label="Close"
                className="p-1 rounded-full text-outline hover:text-on-surface hover:bg-surface-container"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <Detail k="Transaction ID" v={open.tx} />
                <Detail k="User Reference" v={open.user} />
                <Detail k="Related Order" v={open.orderId === "—" ? "—" : `#${open.orderId}`} />
                <Detail k="Date" v={open.when} />
              </div>
              <Card>
                <p className="text-sm font-bold mb-2">Timeline</p>
                <ul className="space-y-2 text-xs">
                  <li className="flex gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="text-outline w-24">Initiated</span>
                    <span>Event initiated on {open.when}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-outline w-24">Recorded</span>
                    <span>Permanent audit entry created</span>
                  </li>
                </ul>
              </Card>
              <Card>
                <p className="text-sm font-bold mb-2">Financial Events</p>
                <ul className="text-xs list-disc pl-4 text-on-surface-variant space-y-1">
                  <li>{open.event}</li>
                  <li>
                    Linked to{" "}
                    {open.orderId === "—" ? "platform-level snapshot" : `order #${open.orderId}`}
                  </li>
                  <li>Transaction reference {open.tx}</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Finance Analytics ---------- */
const FinanceAnalyticsView = () => (
  <div className="space-y-5">
    <SectionTitle title="Billing Metrics" />
    <Row cols={3}>
      <Stat
        label="Invoice Conversion Rate"
        value="92.4%"
        icon={CheckCircle2}
        tint="bg-emerald-500/10 text-emerald-600"
      />
      <Stat
        label="Payment Success Rate"
        value="96.1%"
        icon={ShieldCheck}
        tint="bg-primary-container/10 text-primary-container"
      />
      <Stat
        label="Avg Payment Time"
        value="1.4d"
        icon={Clock}
        tint="bg-amber-500/10 text-amber-600"
      />
    </Row>

    <SectionTitle title="Escrow Metrics" />
    <Row cols={3}>
      <Stat
        label="Active Escrow Value"
        value="₹3.91L"
        icon={Wallet}
        tint="bg-primary-container/10 text-primary-container"
      />
      <Stat
        label="Avg Holding Time"
        value="3.2d"
        icon={Clock}
        tint="bg-amber-500/10 text-amber-600"
      />
      <Stat
        label="Avg Release Time"
        value="1.1d"
        icon={Activity}
        tint="bg-emerald-500/10 text-emerald-600"
      />
    </Row>

    <SectionTitle title="Payout Metrics" />
    <Row cols={2}>
      <Stat
        label="Avg Payout Time"
        value="42m"
        icon={Clock}
        tint="bg-primary-container/10 text-primary-container"
      />
      <Stat
        label="Failed Payout Rate"
        value="2.1%"
        icon={XCircle}
        tint="bg-rose-500/10 text-rose-600"
      />
    </Row>

    <SectionTitle title="Refund Metrics" />
    <Row cols={3}>
      <Stat label="Refund Rate" value="3.4%" icon={XCircle} tint="bg-rose-500/10 text-rose-600" />
      <Stat
        label="Top Reason"
        value="Quality"
        icon={AlertTriangle}
        tint="bg-amber-500/10 text-amber-600"
      />
      <Stat
        label="Top Category"
        value="Video"
        icon={Layers}
        tint="bg-primary-container/10 text-primary-container"
      />
    </Row>
    <Card>
      <p className="text-sm font-bold mb-2">Category-wise Refunds</p>
      <ul className="text-xs space-y-1.5 text-on-surface-variant">
        <li className="flex justify-between">
          <span>Video Editing</span>
          <Badge tone="bg-rose-50 text-rose-700">4.8%</Badge>
        </li>
        <li className="flex justify-between">
          <span>Content Writing</span>
          <Badge tone="bg-amber-50 text-amber-700">3.1%</Badge>
        </li>
        <li className="flex justify-between">
          <span>Design</span>
          <Badge tone="bg-emerald-50 text-emerald-700">1.6%</Badge>
        </li>
      </ul>
    </Card>

    <SectionTitle title="Revenue Metrics" />
    <Row cols={3}>
      <Stat
        label="Revenue Growth"
        value="+11.2%"
        icon={Activity}
        tint="bg-emerald-500/10 text-emerald-600"
      />
      <Stat
        label="Margin Trend"
        value="↑ 1.4%"
        icon={DollarSign}
        tint="bg-violet-500/10 text-violet-600"
      />
      <Stat
        label="Top Service"
        value="Logo Design"
        icon={Briefcase}
        tint="bg-primary-container/10 text-primary-container"
      />
    </Row>
  </div>
);

/* ---------- Main Section ---------- */
export const FinanceSection = ({
  pendingBillOrderId,
  onConsumePendingBillOrderId,
}: {
  pendingBillOrderId?: string;
  onConsumePendingBillOrderId?: () => void;
} = {}) => {
  const [view, setView] = useState<FinKey>("billing");

  // Arrived here via Order Desk → "Approve Order": jump straight to the
  // Billing Center so the admin can price and send the invoice. Clear the
  // highlight shortly after so it doesn't linger once acknowledged.
  useEffect(() => {
    if (!pendingBillOrderId) return;
    setView("billing");
    const t = setTimeout(() => onConsumePendingBillOrderId?.(), 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBillOrderId]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Finance & Escrow"
        subtitle="Billing, escrow, payouts, refunds, revenue, exceptions, history & analytics. Finance Operations only."
      />

      <Row cols={4}>
        <Stat
          label="Gross Revenue"
          value="₹6.84L"
          icon={DollarSign}
          tint="bg-violet-500/10 text-violet-600"
        />
        <Stat
          label="Escrow Balance"
          value="₹3.91L"
          icon={Wallet}
          tint="bg-primary-container/10 text-primary-container"
        />
        <Stat
          label="Pending Payouts"
          value="₹22k"
          icon={Clock}
          tint="bg-amber-500/10 text-amber-600"
        />
        <Stat label="Refunds" value="₹38k" icon={XCircle} tint="bg-rose-500/10 text-rose-600" />
      </Row>

      <div className="flex flex-wrap gap-2">
        {FIN_NAV.map((n) => {
          const on = view === n.key;
          return (
            <button
              key={n.key}
              onClick={() => setView(n.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap",
                on
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface text-on-surface-variant border-outline-variant/40 hover:border-primary/40",
              )}
            >
              <AEIcon name={n.icon} />
              {n.label}
            </button>
          );
        })}
      </div>

      {view === "billing" && <BillingCenterView highlightOrderId={pendingBillOrderId} />}
      {view === "escrow" && <EscrowCenterView />}
      {view === "payout" && <PayoutCenterView />}
      {view === "refund" && <RefundCenterView />}
      {view === "revenue" && <RevenueCenterView />}
      {view === "exceptions" && <FinancialExceptionsView />}
      {view === "history" && <FinancialHistoryView />}
      {view === "analytics" && <FinanceAnalyticsView />}
    </div>
  );
};

export default FinanceSection;
