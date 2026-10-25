import { useState } from "react";
import { CreditCard, Download, Lock, QrCode } from "lucide-react";
import { toast } from "sonner";
import { AuditListPage, Button } from "@jobrio/ui/design-system";
import { Card, StatusBadge } from "@/components/dashboard/shared";
import { useOrderRegistry, updateOrderInRegistry, addPayment } from "@jobrio/constants";

const TABS = [
  { key: "pending", label: "Pending", icon: "pending" },
  { key: "paid", label: "Paid", icon: "task_alt" },
];

const SORT_OPTIONS = [
  { key: "active", label: "Active orders" },
  { key: "completed", label: "Completed" },
  { key: "disputed", label: "Disputed" },
];
type InvoiceRow = {
  id: string;
  orderId: string;
  order: string;
  date: string;
  method: string;
  amt: string;
  status: "paid" | "pending";
};

export const InvoicesSection = () => {
  const [tab, setTab] = useState("pending");
  const [sort, setSort] = useState("active");
  const [query, setQuery] = useState("");
  const [scanInvoice, setScanInvoice] = useState<InvoiceRow | null>(null);
  const orders = useOrderRegistry();

  // Only orders that have actually been billed (an invoice exists) show up
  // here — generated from the Finance & Escrow → Billing Center flow.
  const invoiced = orders
    .filter((o) => !!o.invoiceNo)
    .map((o) => ({
      id: o.invoiceNo as string,
      orderId: o.id,
      order: `#${o.id}`,
      date: o.invoiceDate ?? "—",
      method: o.s === "awaiting_payment" ? "—" : "UPI",
      amt: o.a,
      status: (o.s === "awaiting_payment" ? "pending" : "paid") as "paid" | "pending",
    }));

  const rows = invoiced
    .filter((r) => r.status === (tab === "paid" ? "paid" : "pending"))
    .filter((r) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.order.toLowerCase().includes(q) ||
        r.method.toLowerCase().includes(q)
      );
    });

  const downloadInvoice = (row: InvoiceRow) => {
    const csv = [
      ["Invoice", "Order", "Date", "Payment method", "Amount", "Status"],
      [row.id, row.order, row.date, row.method, row.amt, row.status],
    ]
      .map((line) => line.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${row.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const payBill = (orderId: string, invoiceId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.s !== "awaiting_payment") return;
    const paymentId = `PAY-${Date.now()}`;
    const now = new Date().toISOString();
    const reference = `UPI-${Date.now()}`;
    addPayment({
      id: paymentId,
      orderId,
      invoiceNo: invoiceId,
      amount: order.amountNum,
      method: "UPI",
      status: "verified",
      reference,
      createdAt: now,
      verifiedAt: now,
    });
    // updateOrderInRegistry is the single workflow trigger. It records the
    // payment link and immediately runs escrow funding + assignment.
    updateOrderInRegistry(orderId, {
      s: "payment_received",
      paymentId,
      paymentMethod: "UPI",
      paymentReference: reference,
    });
    toast.success(`Payment received for ${invoiceId}`, {
      description: `Order #${orderId} is now funded and the Assignment Engine has started.`,
      duration: 2800,
    });
  };

  return (
    <AuditListPage
      title="Invoices & Payments"
      description="Manage bills, payments and invoices."
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      sortOptions={SORT_OPTIONS}
      sortValue={sort}
      onSortChange={setSort}
      count={rows.length}
      isEmpty={rows.length === 0}
      emptyMessage="No invoices found."
      search={{
        query,
        onSearch: setQuery,
        placeholder: "Search by Invoice ID · Order ID · Payment method…",
      }}
    >
      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-surface-container-high/60">
          {rows.map((r) => (
            <div key={r.id} className="p-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[180px]">
                <div className="text-sm font-bold text-on-background">{r.id}</div>
                <div className="text-xs text-on-surface-variant">
                  {r.order} · {r.date} · {r.method}
                </div>
              </div>
              <div className="text-sm font-bold text-on-background">{r.amt}</div>
              <StatusBadge status={r.status} />
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => downloadInvoice(r)}
                >
                  <Download size={14} /> Invoice
                </Button>
                {r.status === "pending" ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => setScanInvoice(r)}
                    >
                      <QrCode size={14} /> Scan
                    </Button>
                    <Button
                      variant="cta"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => payBill(r.orderId, r.id)}
                    >
                      <CreditCard size={14} /> Pay bill
                    </Button>
                  </>
                ) : (
                  <span className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold inline-flex items-center gap-1.5">
                    <Lock size={14} /> Locked
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
      {scanInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setScanInvoice(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl border border-outline-variant/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold">Payment details</h3>
                <p className="text-xs text-outline">
                  {scanInvoice.id} · {scanInvoice.order}
                </p>
              </div>
              <button className="text-sm text-outline" onClick={() => setScanInvoice(null)}>
                Close
              </button>
            </div>
            <div className="rounded-xl bg-surface-container-low p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span>Amount</span>
                <strong>{scanInvoice.amt}</strong>
              </div>
              <div className="flex justify-between">
                <span>Invoice date</span>
                <span>{scanInvoice.date}</span>
              </div>
              <p className="pt-2 text-xs text-outline">
                A live payment gateway/QR is not configured in this frontend build. Use “Pay bill”
                for the local state-machine demo.
              </p>
            </div>
          </div>
        </div>
      )}
    </AuditListPage>
  );
};
