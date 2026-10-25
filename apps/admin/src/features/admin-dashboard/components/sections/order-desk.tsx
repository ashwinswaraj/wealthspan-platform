import { useState, useEffect, useMemo } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { addPayment } from "@jobrio/constants";
import { Button, Textarea } from "@jobrio/ui/design-system";
import { cn } from "@jobrio/utils/utils";
import AuditListPage, {
  AuditListTab,
  AuditSortOption,
} from "@admin/features/admin-dashboard/components/AuditListPage";
import { Card } from "@admin/features/admin-dashboard/components/sections";
import {
  Row,
  Badge,
  Detail,
  SectionTitle,
  ActionBtn,
  WFShell,
  OrderStatus,
  OrderRow,
} from "@admin/features/admin-dashboard/components/sections-shared";
import {
  useOrderRegistry,
  updateOrderInRegistry,
  addNotification,
  professionals,
  getPrimaryAction,
  ADMIN_ORDER_ACTIONS,
  type Actor,
} from "@jobrio/constants";

/* ============================================================
 * 5. ORDER MANAGEMENT
 * ============================================================ */

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending Review",
  info_requested: "Awaiting Client Info",
  rejected: "Rejected",
  awaiting_payment: "Awaiting Payment",
  payment_received: "Payment Received",
  assigned: "Assigned",
  progress: "In Progress",
  abandoned: "Abandoned",
  qa: "In QA",
  delivered: "Delivered",
  awaiting_approval: "Awaiting Client Approval",
  rework: "In Rework",
  disputed: "Disputed",
  released: "Escrow Released",
  cancelled: "Cancelled & Refunded",
  resolved: "Resolved Dispute",
};

const ACTIVE_STATUSES: OrderStatus[] = [
  "pending",
  "info_requested",
  "awaiting_payment",
  "payment_received",
  "assigned",
  "progress",
  "abandoned",
  "qa",
  "delivered",
  "awaiting_approval",
  "rework",
  "disputed",
];
const ARCHIVED_STATUSES: OrderStatus[] = ["released", "cancelled", "resolved", "rejected"];

const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  info_requested: "bg-amber-50 text-amber-700",
  rejected: "bg-rose-50 text-rose-700",
  awaiting_payment: "bg-orange-50 text-orange-700",
  payment_received: "bg-primary-container/10 text-primary-container",
  assigned: "bg-indigo-50 text-indigo-700",
  progress: "bg-sky-50 text-sky-700",
  abandoned: "bg-rose-50 text-rose-700",
  qa: "bg-violet-50 text-violet-700",
  delivered: "bg-teal-50 text-teal-700",
  awaiting_approval: "bg-cyan-50 text-cyan-700",
  rework: "bg-amber-50 text-amber-700",
  disputed: "bg-rose-50 text-rose-700",
  released: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-700",
  resolved: "bg-slate-100 text-slate-700",
};

/* ---- Detail overlay ---- */

const OrderDetailsOverlay = ({
  o,
  onClose,
  onApprove,
}: {
  o: OrderRow;
  onClose: () => void;
  onApprove: (orderId: string) => void;
}) => {
  const isArchived = ARCHIVED_STATUSES.includes(o.s);
  const [decisionMode, setDecisionMode] = useState<"none" | "reject" | "info">("none");
  const [reasonText, setReasonText] = useState("");
  const [decisionError, setDecisionError] = useState("");

  const resetDecision = () => {
    setDecisionMode("none");
    setReasonText("");
    setDecisionError("");
  };

  const handleApprove = () => {
    updateOrderInRegistry(o.id, {
      approvedForBilling: true,
      approvedAt: new Date().toISOString(),
      approvedBy: "Admin",
    });
    toast.success(`Order #${o.id} approved`, {
      description: "Sent to Finance & Escrow for billing.",
      duration: 2500,
    });
    onApprove(o.id);
  };

  const handleConfirmReject = () => {
    if (!reasonText.trim()) {
      setDecisionError("A reason is required to reject this order.");
      return;
    }
    updateOrderInRegistry(o.id, {
      s: "rejected",
      rejectionReason: reasonText.trim(),
      rejectedAt: new Date().toISOString(),
      rejectedBy: "Admin",
    });
    addNotification({
      type: "order",
      title: `Order #${o.id} was declined`,
      body: reasonText.trim(),
      clientId: o.clientId,
      orderId: o.id,
    });
    toast.success(`Order #${o.id} rejected`, {
      description: "The client has been notified with your reason.",
      duration: 2500,
    });
    resetDecision();
    onClose();
  };

  const handleConfirmInfo = () => {
    if (!reasonText.trim()) {
      setDecisionError("Let the client know what information is needed.");
      return;
    }
    updateOrderInRegistry(o.id, {
      s: "info_requested",
      infoRequestNote: reasonText.trim(),
      infoRequestedAt: new Date().toISOString(),
      infoRequestedBy: "Admin",
    });
    addNotification({
      type: "order",
      title: `More information needed for Order #${o.id}`,
      body: reasonText.trim(),
      clientId: o.clientId,
      orderId: o.id,
    });
    toast.success(`Information requested for #${o.id}`, {
      description: "The client has been notified.",
      duration: 2500,
    });
    resetDecision();
    onClose();
  };

  return (
    <WFShell
      subtitle={`${isArchived ? "Archived Order" : "Active Order"} · ${STATUS_LABEL[o.s]}`}
      title={`#${o.id} · ${o.service}`}
      badge={<Badge tone={ORDER_STATUS_TONE[o.s]}>{STATUS_LABEL[o.s]}</Badge>}
      onClose={onClose}
    >
      {/* Identity / Snapshot — always */}
      <Card>
        <SectionTitle title="Order Snapshot" hint="Identity, client, value, deadline" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Detail k="Order ID" v={`#${o.id}`} />
          <Detail k="Service" v={o.service} />
          <Detail k="Category" v={o.category} />
          <Detail k="Order Value" v={o.a} />
          <Detail k="Client" v={o.c} />
          <Detail k="Client Email" v={o.clientEmail} />
          <Detail k="Requested Deadline" v={o.deadline} />
          <Detail k="Created" v={o.createdAt} />
          {o.pro && <Detail k="Professional" v={o.pro} />}
          {o.proEmail && <Detail k="Pro Email" v={o.proEmail} />}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Client Requirements" hint="Description & uploaded files" />
        <p className="text-sm text-on-surface-variant leading-relaxed">{o.description}</p>
        {o.files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {o.files.map((f) => (
              <Badge
                key={f}
                tone="bg-surface-container-low border border-outline-variant/40 text-on-surface-variant"
              >
                {f}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* 1. Pending Review — Order Review Canvas */}
      {o.s === "pending" && (
        <>
          {/* Client Snapshot */}
          <Card>
            <SectionTitle title="Client Snapshot" hint="Is client healthy or risky" />
            <Row cols={4}>
              <Detail k="Total Orders" v="34" />
              <Detail k="Completed" v="29" />
              <Detail k="Cancelled" v="2" />
              <Detail k="Disputed" v="1" />
              <Detail k="Active Orders" v="2" />
              <Detail k="Total Spend" v="₹1,84,200" />
              <Detail k="Refund History" v="₹3,400" />
              <Detail k="Chargebacks" v="0" />
            </Row>
            <Row cols={4}>
              <Detail k="Reliability Score" v="8.7 / 10" />
              <Detail k="Avg Approval Time" v="6h 12m" />
              <Detail k="Avg Revisions" v="1.2" />
              <Detail k="Dispute Frequency" v="2.9%" />
            </Row>
          </Card>

          {/* Service Snapshot */}
          <Card>
            <SectionTitle title="Service Snapshot" hint="Service operational health" />
            <Row cols={4}>
              <Detail k="Service Status" v="Active" />
              <Detail k="Orders This Month" v="142" />
              <Detail k="Orders This Week" v="38" />
              <Detail k="Currently Active" v="21" />
              <Detail k="Avg Delivery Time" v="22h" />
              <Detail k="Avg Reworks" v="0.8" />
              <Detail k="QA Pass Rate" v="92%" />
              <Detail k="Dispute Rate" v="3.1%" />
            </Row>
          </Card>

          {/* Workforce Snapshot */}
          <Card>
            <SectionTitle title="Workforce Snapshot" hint="Manpower availability for this order" />
            <Row cols={4}>
              <Detail k="Total Eligible" v="42" />
              <Detail k="Available" v="18" />
              <Detail k="Busy" v="19" />
              <Detail k="Unavailable" v="5" />
              <Detail k="Standard" v="22" />
              <Detail k="Premium" v="14" />
              <Detail k="Elite" v="6" />
              <Detail k="Capacity Remaining" v="42%" />
            </Row>
            <div className="mt-2">
              <Badge tone="bg-emerald-50 text-emerald-700">🟢 Healthy</Badge>
            </div>
          </Card>

          {/* Demand vs Supply */}
          <Card>
            <SectionTitle title="Demand vs Supply" hint="Category-specific health" />
            <Row cols={4}>
              <Detail k="Current Demand" v="120" />
              <Detail k="Current Supply" v="105" />
              <Detail k="Gap" v="-15" />
              <Detail k="Status" v="Shortage" />
            </Row>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="bg-amber-50 text-amber-700">🟡 Watch</Badge>
              <span className="text-[11px] text-outline">
                Accepting this order tightens supply but stays deliverable.
              </span>
            </div>
          </Card>

          {/* Delivery Feasibility */}
          <Card>
            <SectionTitle title="Delivery Feasibility" hint="Can we hit the deadline" />
            <Row cols={4}>
              <Detail k="Requested Deadline" v={o.deadline} />
              <Detail k="Category Avg Delivery" v="24h" />
              <Detail k="Current Capacity" v="42%" />
              <Detail k="Delivery Confidence" v="94%" />
            </Row>
            <div className="mt-2">
              <Badge tone="bg-emerald-50 text-emerald-700">🟢 High Confidence</Badge>
            </div>
          </Card>

          {/* Quality Snapshot */}
          <Card>
            <SectionTitle title="Quality Snapshot" hint="Category quality metrics" />
            <Row cols={4}>
              <Detail k="QA Pass Rate" v="91%" />
              <Detail k="Rework Rate" v="8%" />
              <Detail k="Avg QA Time" v="38m" />
              <Detail k="Quality Risk" v="Low" />
            </Row>
          </Card>

          {/* Risk Analysis */}
          <Card>
            <SectionTitle title="Risk Analysis" hint="System-generated risk signals" />
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge tone="bg-slate-100 text-slate-700">Capacity Shortage · Low</Badge>
              <Badge tone="bg-slate-100 text-slate-700">Aggressive Deadline · Low</Badge>
              <Badge tone="bg-slate-100 text-slate-700">Revision Risk · Low</Badge>
              <Badge tone="bg-slate-100 text-slate-700">Dispute Risk · Low</Badge>
              <Badge tone="bg-slate-100 text-slate-700">Client Reliability · Healthy</Badge>
              <Badge tone="bg-slate-100 text-slate-700">Service Complexity · Standard</Badge>
              <Badge tone="bg-slate-100 text-slate-700">Order Volume · Normal</Badge>
            </div>
            <Row cols={2}>
              <Detail k="Risk Score" v="22 / 100" />
              <Detail k="Status" v="Low Risk" />
            </Row>
          </Card>

          {/* System Recommendation */}
          <Card>
            <SectionTitle title="System Recommendation" hint="Final AI / system advice" />
            <div className="mb-3">
              <Badge tone="bg-emerald-50 text-emerald-700">✅ Approve Order</Badge>
            </div>
            <ul className="text-sm text-on-surface-variant list-disc pl-5 space-y-1">
              <li>Workforce Available</li>
              <li>Capacity Healthy</li>
              <li>Client Reliable</li>
              <li>Delivery Confidence High</li>
              <li>Risk Low</li>
            </ul>
          </Card>

          {/* Review Actions */}
          <Card>
            <SectionTitle title="Review Actions" hint="Final decision panel" />
            <p className="text-xs text-outline mb-3">
              Approve → Sent to Finance &amp; Escrow for billing · Request Information → Awaiting
              Client Response · Reject → Order Closed (reason required)
            </p>
            <div className="flex flex-wrap gap-2">
              <ActionBtn
                label="Approve Order"
                icon="check_circle"
                tone="success"
                onClick={handleApprove}
              />
              <ActionBtn
                label="Request More Information"
                icon="help"
                tone="warn"
                onClick={() => {
                  setDecisionMode(decisionMode === "info" ? "none" : "info");
                  setReasonText("");
                  setDecisionError("");
                }}
              />
              <ActionBtn
                label="Reject Order"
                icon="cancel"
                tone="danger"
                onClick={() => {
                  setDecisionMode(decisionMode === "reject" ? "none" : "reject");
                  setReasonText("");
                  setDecisionError("");
                }}
              />
            </div>

            {decisionMode !== "none" && (
              <div className="mt-4 pt-4 border-t border-outline-variant/40">
                <p className="text-xs font-bold uppercase text-outline mb-2">
                  {decisionMode === "reject" ? "Rejection Reason" : "What information is needed?"}
                </p>
                <Textarea
                  rows={3}
                  value={reasonText}
                  onChange={(e) => {
                    setReasonText(e.target.value);
                    if (decisionError) setDecisionError("");
                  }}
                  placeholder={
                    decisionMode === "reject"
                      ? "Explain why this order is being rejected — the client will see this."
                      : "e.g. Please clarify the exact brand colors and share your logo files."
                  }
                />
                {decisionError && (
                  <p className="mt-1 text-xs font-semibold text-rose-600">{decisionError}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    className="px-4 py-2 rounded-full text-xs font-bold"
                    onClick={decisionMode === "reject" ? handleConfirmReject : handleConfirmInfo}
                  >
                    {decisionMode === "reject" ? "Confirm Rejection" : "Send Request to Client"}
                  </Button>
                  <button
                    onClick={resetDecision}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low border border-outline-variant/40 text-on-surface"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {/* 1b. Awaiting Client Info */}
      {o.s === "info_requested" && (
        <>
          <Card>
            <SectionTitle title="Awaiting Client Response" hint="More information requested" />
            <p className="text-sm text-on-surface-variant leading-relaxed">{o.infoRequestNote}</p>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Detail k="Requested By" v={o.infoRequestedBy ?? "—"} />
              <Detail
                k="Requested On"
                v={o.infoRequestedAt ? new Date(o.infoRequestedAt).toLocaleString() : "—"}
              />
            </div>
          </Card>
        </>
      )}

      {/* 1c. Rejected */}
      {o.s === "rejected" && (
        <>
          <Card>
            <SectionTitle title="Rejection Record" hint="Order closed without acceptance" />
            <p className="text-sm text-on-surface-variant leading-relaxed">{o.rejectionReason}</p>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Detail k="Rejected By" v={o.rejectedBy ?? "—"} />
              <Detail
                k="Rejected On"
                v={o.rejectedAt ? new Date(o.rejectedAt).toLocaleString() : "—"}
              />
            </div>
          </Card>
        </>
      )}

      {/* 2. Awaiting Payment */}
      {o.s === "awaiting_payment" && (
        <>
          <Card>
            <SectionTitle title="Invoice" hint="Bill issued — awaiting escrow" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Detail k="Invoice No." v={o.invoiceNo ?? "—"} />
              <Detail k="Invoice Amount" v={o.a} />
              <Detail k="Bill Issue Date" v={o.invoiceDate ?? "—"} />
              <Detail k="Payment Due" v={o.paymentDue ?? "—"} />
              <Detail k="Invoice PDF" v="invoice.pdf" />
            </div>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="lg"
              className="px-4 py-2 rounded-full text-xs font-bold"
              onClick={() =>
                toast.success(`Reminder sent to ${o.c}`, {
                  description: `Payment due ${o.paymentDue ?? "soon"}.`,
                  duration: 2200,
                })
              }
            >
              Send Reminder
            </Button>
            <button
              onClick={() => {
                const method = window.prompt(
                  "Payment method (UPI / Card / Bank Transfer / Offline)",
                  "Offline",
                );
                if (!method) return;
                const reference = window.prompt(
                  "Payment reference / transaction ID",
                  `OFF-${Date.now()}`,
                );
                if (!reference) return;
                const normalized = method.trim().toLowerCase();
                const paymentMethod = normalized.includes("card")
                  ? "Card"
                  : normalized.includes("bank")
                    ? "Bank Transfer"
                    : normalized.includes("upi")
                      ? "UPI"
                      : "Offline";
                addPayment({
                  id: `PAY-${Date.now()}`,
                  orderId: o.id,
                  invoiceNo: o.invoiceNo ?? `INV-${o.id.replace(/[^0-9A-Za-z]/g, "")}`,
                  amount: o.amountNum,
                  method: paymentMethod,
                  status: "verified",
                  reference: reference.trim(),
                  createdAt: new Date().toISOString(),
                  verifiedAt: new Date().toISOString(),
                });
                updateOrderInRegistry(o.id, { s: "payment_received" });
                toast.success(`Order #${o.id} marked Payment Received`, {
                  description: `${paymentMethod} · ${reference} · ₹${o.amountNum.toLocaleString()}`,
                  duration: 2500,
                });
              }}
              className="px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low border border-outline-variant/40 text-on-surface"
            >
              Mark as Paid Manually
            </button>
          </div>
        </>
      )}

      {/* 3. Payment Received */}
      {o.s === "payment_received" && (
        <>
          <Card>
            <SectionTitle title="Assignment Readiness" hint="Escrow confirmed · ready for engine" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Detail k="Escrow" v="Confirmed" />
              <Detail k="Engine" v="Ready" />
              <Detail k="Pool Snapshot" v={`${o.poolSize ?? 0} pros available`} />
              <Detail k="Recommendation" v="Auto-assign" />
            </div>
            <pre className="mt-3 text-[11px] bg-surface-container-low rounded-lg p-3 text-on-surface-variant overflow-x-auto">{`Payment Received
   ↓
Assignment Engine
   ↓
Pool Creation
   ↓
Professional Matching
   ↓
Auto Assignment
   ↓
Assigned`}</pre>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="lg"
              className="px-4 py-2 rounded-full text-xs font-bold"
              onClick={() => {
                const pool = professionals
                  .filter(
                    (candidate) => candidate.status === "ACTIVE" || candidate.status === "IDLE",
                  )
                  .sort(
                    (a, b) =>
                      b.qualityScore * b.acceptanceRate * b.onTimeRate -
                      a.qualityScore * a.acceptanceRate * a.onTimeRate,
                  );
                const pro = pool[0];
                if (!pro) {
                  toast.error(`No eligible professional is available for #${o.id}`);
                  return;
                }
                updateOrderInRegistry(o.id, {
                  s: "assigned",
                  pro: pro.name,
                  proEmail: `${pro.name.toLowerCase().replace(/\s+/g, ".")}@jobrio.pro`,
                  poolSize: pool.length,
                  assignmentMethod: "auto-ranked-pool",
                });
                toast.success(`Assignment Engine matched #${o.id}`, {
                  description: `${pro.name} selected from a ranked eligible pool.`,
                  duration: 2500,
                });
              }}
            >
              Run Assignment Engine
            </Button>
            <span className="px-4 py-2 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Hold Order · Exception workflow
            </span>
          </div>
        </>
      )}

      {/* 4. Assigned — Clarity */}
      {o.s === "assigned" && (
        <>
          <Card>
            <SectionTitle
              title="Requirement Clarity Phase"
              hint="Client & professional align before execution"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Detail k="Clarity Status" v="Waiting For Client" />
              <Detail k="SLA Countdown" v="22h remaining" />
              <Detail k="Clarity Timer" v="02h 14m elapsed" />
              <Detail k="Readiness" v="Not yet" />
            </div>
          </Card>
          <Row cols={2}>
            <Card>
              <p className="text-xs font-bold uppercase text-outline mb-2">Client Side</p>
              <ul className="text-sm space-y-1 text-on-surface-variant list-disc pl-4">
                <li>Requirements shared</li>
                <li>Instructions attached</li>
                <li>Attachments uploaded</li>
              </ul>
            </Card>
            <Card>
              <p className="text-xs font-bold uppercase text-outline mb-2">Professional Side</p>
              <ul className="text-sm space-y-1 text-on-surface-variant list-disc pl-4">
                <li>Questions raised</li>
                <li>Clarifications pending</li>
                <li>Notes drafted</li>
              </ul>
            </Card>
          </Row>
          <Card>
            <SectionTitle
              title="Communication"
              hint="Full chat & requirement discussion timeline"
            />
            <p className="text-sm text-on-surface-variant">
              Last message 12m ago — professional asked for asset pack.
            </p>
          </Card>
        </>
      )}

      {/* 5. In Progress */}
      {o.s === "progress" && (
        <>
          <Card>
            <SectionTitle title="Work Status" hint="Active execution" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Detail k="Started At" v={o.startedAt ?? "—"} />
              <Detail k="Due Date" v={o.deadline} />
              <Detail k="Remaining" v={o.remaining ?? "—"} />
              <Detail k="Last Update" v={o.lastUpdate ?? "—"} />
              <Detail k="Current Status" v="Active" />
              <Detail k="Latest Activity" v="Draft submitted" />
              <Detail k="SLA Timer" v="On track" />
              <Detail k="Delay Alerts" v="None" />
            </div>
          </Card>
          <Card>
            <SectionTitle title="Submission History" hint="Drafts, progress updates, work logs" />
            <ul className="text-sm divide-y divide-surface-container-high/60">
              <li className="py-2 flex justify-between">
                <span>Draft v2</span>
                <span className="text-outline text-xs">2h ago</span>
              </li>
              <li className="py-2 flex justify-between">
                <span>Progress note — 60%</span>
                <span className="text-outline text-xs">1d ago</span>
              </li>
              <li className="py-2 flex justify-between">
                <span>Draft v1</span>
                <span className="text-outline text-xs">2d ago</span>
              </li>
            </ul>
          </Card>
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 rounded-full text-xs font-semibold border border-outline-variant/40 text-outline">
              Live progress · shown in record
            </span>
            <button
              onClick={() => {
                addNotification({
                  type: "order",
                  title: `Progress check for Order #${o.id}`,
                  body: "Your professional has been reminded to keep this order on schedule.",
                  clientId: o.clientId,
                  orderId: o.id,
                });
                toast.success(`Warning alert sent for #${o.id}`, { duration: 2200 });
              }}
              className="px-4 py-2 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
            >
              Send Warning Alert
            </button>
            <button
              onClick={() => {
                addNotification({
                  type: "order",
                  title: `Order #${o.id} delay escalated`,
                  body: "Our operations team is following up with your professional to keep this order on track.",
                  clientId: o.clientId,
                  orderId: o.id,
                });
                toast.success(`Delay escalated for #${o.id}`, { duration: 2200 });
              }}
              className="px-4 py-2 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
            >
              Escalate Delay
            </button>
          </div>
        </>
      )}

      {/* 6. In QA */}
      {o.s === "qa" && (
        <>
          <Card>
            <SectionTitle
              title="Quality Check Gate"
              hint="Internal QA review before client delivery"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Detail k="Submitted Files" v={`${o.files.length} files`} />
              <Detail k="Submitted Links" v="—" />
              <Detail k="QA Checklist" v="8 / 12 passed" />
              <Detail k="Reviewer" v="QA · K. Iyer" />
            </div>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="lg"
              className="px-4 py-2 rounded-full text-xs font-bold"
              onClick={() => {
                updateOrderInRegistry(o.id, {
                  s: "delivered",
                  deliveredAt: new Date().toISOString(),
                });
                toast.success(`Order #${o.id} passed QA & delivered`, { duration: 2500 });
              }}
            >
              Pass QA & Deliver
            </Button>
            <button
              onClick={() => {
                updateOrderInRegistry(o.id, {
                  s: "rework",
                  revisionNote: "QA flagged issues — see internal notes.",
                });
                toast.success(`Order #${o.id} sent back for rework`, { duration: 2500 });
              }}
              className="px-4 py-2 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
            >
              Fail QA & Send Back
            </button>
          </div>
        </>
      )}

      {/* 7. Delivered */}
      {o.s === "delivered" && (
        <>
          <Card>
            <SectionTitle title="Delivery" hint="Final deliverables sent to client" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Detail k="Delivered At" v={o.deliveredAt ?? "—"} />
              <Detail k="Delivered Files" v={`${o.files.length} files`} />
              <Detail k="Client Notified" v="Yes" />
              <Detail k="Review Window" v={`Auto-approve on ${o.reviewDeadline ?? "—"}`} />
            </div>
          </Card>
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 rounded-full text-xs font-semibold border border-outline-variant/40 text-outline">
              Review window · {o.reviewDeadline ?? "not set"}
            </span>
          </div>
        </>
      )}

      {/* 8. Awaiting Client Approval */}
      {o.s === "awaiting_approval" && (
        <>
          <Card>
            <SectionTitle title="Client Review" hint="Waiting for client decision" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Detail k="Waiting For" v="Client Response" />
              <Detail k="Review Deadline" v={o.reviewDeadline ?? "—"} />
              <Detail k="Review Status" v="Not yet opened" />
              <Detail k="Delivered At" v={o.deliveredAt ?? "—"} />
            </div>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="lg"
              className="px-4 py-2 rounded-full text-xs font-bold"
              onClick={() => {
                addNotification({
                  type: "order",
                  title: `Reminder: Order #${o.id} awaits your review`,
                  body: "Please review your delivery and approve or request a revision.",
                  clientId: o.clientId,
                  orderId: o.id,
                });
                toast.success(`Reminder sent to ${o.c}`, { duration: 2200 });
              }}
            >
              Send Reminder
            </Button>
            <button
              disabled
              className="px-4 py-2 rounded-full text-xs font-bold bg-surface-container-low border border-outline-variant/40 text-on-surface"
            >
              Extend Review Time
            </button>
          </div>
        </>
      )}

      {/* 9. Rework */}
      {o.s === "rework" && (
        <>
          <Card>
            <SectionTitle title="Revision Requested" hint="Client requested changes" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Detail k="Rework Deadline" v={o.deadline} />
              <Detail k="Revision Round" v="R1" />
              <Detail k="Revisions Used" v="1 / 2" />
              <Detail k="Status" v="With Professional" />
            </div>
            <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
              <span className="font-bold text-on-surface">Client feedback:</span> {o.revisionNote}
            </p>
          </Card>
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 rounded-full text-xs font-semibold border border-outline-variant/40 text-outline">
              Rework deadline · {o.deadline}
            </span>
            <span className="px-4 py-2 rounded-full text-xs font-semibold border border-outline-variant/40 text-outline">
              Communication · Jobrio-audited
            </span>
            <span className="px-4 py-2 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Deadline tracking · active
            </span>
          </div>
        </>
      )}

      {/* 10. Disputed */}
      {o.s === "disputed" && (
        <>
          <Card>
            <SectionTitle title="Dispute" hint="Escrow frozen — admin acts as judge" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Detail k="Escrow" v="Frozen" />
              <Detail k="Filed By" v="Client" />
              <Detail k="Order Value" v={o.a} />
              <Detail k="Opened" v={o.when} />
            </div>
            <p className="mt-3 text-sm text-on-surface-variant">
              <span className="font-bold text-on-surface">Reason:</span> {o.disputeReason}
            </p>
          </Card>
          <Row cols={2}>
            <Card>
              <p className="text-xs font-bold uppercase text-outline mb-2">Client Arguments</p>
              <p className="text-sm text-on-surface-variant">
                Deliverables don't match the agreed scope; requesting refund.
              </p>
            </Card>
            <Card>
              <p className="text-xs font-bold uppercase text-outline mb-2">
                Professional Arguments
              </p>
              <p className="text-sm text-on-surface-variant">
                Scope completed per brief; requesting payment release.
              </p>
            </Card>
          </Row>
          <Card>
            <SectionTitle title="Evidence & History" hint="Chat, QA records, order history" />
            <div className="flex flex-wrap gap-2 text-xs">
              {["Chat History", "Submitted Evidence", "QA Records", "Order History"].map((s) => (
                <Badge
                  key={s}
                  tone="bg-surface-container-low border border-outline-variant/40 text-on-surface-variant"
                >
                  {s}
                </Badge>
              ))}
            </div>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="lg"
              className="px-4 py-2 rounded-full text-xs font-bold"
              onClick={() => {
                updateOrderInRegistry(o.id, {
                  s: "cancelled",
                  resolutionNote: "Dispute resolved in client's favor — full refund issued.",
                  resolvedBy: "Admin",
                });
                addNotification({
                  type: "order",
                  title: `Dispute resolved for Order #${o.id} — refund approved`,
                  body: "Your refund has been approved and will be processed shortly.",
                  clientId: o.clientId,
                  orderId: o.id,
                });
                toast.success(`Refunded to client for #${o.id}`, { duration: 2500 });
              }}
            >
              Refund to Client
            </Button>
            <button
              onClick={() => {
                updateOrderInRegistry(o.id, {
                  s: "released",
                  resolutionNote: "Dispute resolved in professional's favor — escrow released.",
                  resolvedBy: "Admin",
                });
                addNotification({
                  type: "order",
                  title: `Dispute resolved for Order #${o.id} — escrow released`,
                  body: "The order has been marked complete and payment released to the professional.",
                  clientId: o.clientId,
                  orderId: o.id,
                });
                toast.success(`Escrow released for #${o.id}`, { duration: 2500 });
              }}
              className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              Release to Professional
            </button>
            <button
              onClick={() => {
                updateOrderInRegistry(o.id, {
                  s: "resolved",
                  resolutionNote: "Dispute resolved with a 50/50 split settlement.",
                  resolvedBy: "Admin",
                });
                addNotification({
                  type: "order",
                  title: `Dispute resolved for Order #${o.id} — split settlement`,
                  body: "A 50/50 split settlement has been applied to this order.",
                  clientId: o.clientId,
                  orderId: o.id,
                });
                toast.success(`Split settlement applied for #${o.id}`, { duration: 2500 });
              }}
              className="px-4 py-2 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200"
            >
              Split Settlement
            </button>
            <button
              disabled
              className="px-4 py-2 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
            >
              Escalate Review
            </button>
          </div>
        </>
      )}

      {/* 11. Escrow Released */}
      {o.s === "released" && (
        <>
          <Card>
            <SectionTitle title="Settlement Summary" hint="Order officially complete" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Detail k="Order Value" v={o.a} />
              <Detail k="Professional Payout" v={o.payoutAmount ?? "—"} />
              <Detail k="Platform Fee" v={o.platformFee ?? "—"} />
              <Detail k="Released On" v={o.deliveredAt ?? "—"} />
              <Detail k="Final Invoice" v={o.invoiceNo ?? "INV-final"} />
            </div>
          </Card>
        </>
      )}

      {/* 12. Cancelled & Refunded */}
      {o.s === "cancelled" && (
        <>
          <Card>
            <SectionTitle title="Cancellation" hint="Closed without work" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Detail k="Cancellation Reason" v={o.description} />
              <Detail k="Refund Amount" v={o.refundAmount ?? "—"} />
              <Detail k="Refund Status" v="Completed" />
              <Detail k="Refund Timeline" v="Same day" />
            </div>
          </Card>
        </>
      )}

      {/* 13. Resolved Disputes */}
      {o.s === "resolved" && (
        <>
          <Card>
            <SectionTitle title="Resolution Record" hint="Permanent audit & compliance entry" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Detail k="Final Decision" v="Split Settlement" />
              <Detail k="Refund to Client" v={o.refundAmount ?? "—"} />
              <Detail k="Payout to Pro" v={o.payoutAmount ?? "—"} />
              <Detail k="Resolved By" v={o.resolvedBy ?? "—"} />
              <Detail k="Original Reason" v={o.disputeReason ?? "—"} />
            </div>
            <p className="mt-3 text-sm text-on-surface-variant">
              <span className="font-bold text-on-surface">Resolution Notes:</span>{" "}
              {o.resolutionNote}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {["Evidence History", "Settlement Details", "Resolution Timeline", "Audit Trail"].map(
                (s) => (
                  <Badge
                    key={s}
                    tone="bg-surface-container-low border border-outline-variant/40 text-on-surface-variant"
                  >
                    {s}
                  </Badge>
                ),
              )}
            </div>
          </Card>
        </>
      )}
    </WFShell>
  );
};

/* ---- Section ---- */

export const OrdersSection = ({
  highlightOrderId,
  onApproveOrder,
  role = "super",
}: {
  highlightOrderId?: string;
  onApproveOrder?: (orderId: string) => void;
  role?: "super" | "sub";
} = {}) => {
  const [folder, setFolder] = useState<"active" | "archived">("active");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const actor = useMemo<Actor>(() => ({ role, id: `admin:${role}` }), [role]);

  // Live order book — includes every order a client has submitted from
  // Order Create (always starts at "Pending Review"), kept in sync with
  // the shared order registry.
  const ORDERS = useOrderRegistry();

  const folderStatuses = folder === "active" ? ACTIVE_STATUSES : ARCHIVED_STATUSES;
  useEffect(() => {
    setStatus("all");
  }, [folder]);

  const list = useMemo(() => {
    const inFolder = ORDERS.filter((o) => folderStatuses.includes(o.s));
    return status === "all" ? inFolder : inFolder.filter((o) => o.s === status);
  }, [status, folderStatuses, ORDERS]);

  useEffect(() => {
    if (!highlightOrderId) return;
    const target = ORDERS.find((o) => o.id === highlightOrderId);
    if (!target) return;
    setFolder(ARCHIVED_STATUSES.includes(target.s) ? "archived" : "active");
    setStatus("all");
    setOpenId(highlightOrderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightOrderId]);

  const open = openId ? (ORDERS.find((o) => o.id === openId) ?? null) : null;

  const activeCount = ORDERS.filter((o) => ACTIVE_STATUSES.includes(o.s)).length;
  const archivedCount = ORDERS.filter((o) => ARCHIVED_STATUSES.includes(o.s)).length;

  const tabs: AuditListTab[] = [
    { key: "active", label: "Active Orders", icon: "pending_actions" },
    { key: "archived", label: "Archived", icon: "inventory_2" },
  ];

  const sortOptions: AuditSortOption[] = [
    { key: "all", label: "All" },
    ...folderStatuses.map((k) => ({ key: k, label: STATUS_LABEL[k] })),
  ];

  return (
    <AuditListPage
      title="Order Desk"
      description="Master record of every order — Active workflow & Archived history."
      tabs={tabs}
      activeTab={folder}
      onTabChange={(k) => setFolder(k as "active" | "archived")}
      sortOptions={sortOptions}
      sortValue={status}
      onSortChange={(k) => setStatus(k as OrderStatus | "all")}
      count={folder === "active" ? activeCount : archivedCount}
      isEmpty={list.length === 0}
      emptyMessage="No orders in this status."
    >
      <Card className="!p-0 overflow-hidden">
        <ul className="divide-y divide-surface-container-high/60">
          {list.map((o) => (
            <li
              key={o.id}
              id={`order-row-${o.id}`}
              className={cn(
                "px-4 py-3 flex items-center gap-3 transition-colors",
                highlightOrderId === o.id && "bg-primary/5 ring-1 ring-primary/30",
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-on-surface truncate">
                  #{o.id} · {o.service}
                </p>
                <p className="text-xs text-outline mt-0.5 truncate">
                  {o.c} · {o.category} · {o.when}
                </p>
              </div>
              <span className="text-sm font-bold text-on-surface hidden sm:inline">{o.a}</span>
              <Badge tone={ORDER_STATUS_TONE[o.s]}>{STATUS_LABEL[o.s]}</Badge>
              <button
                onClick={() => setOpenId(o.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-on-primary hover:opacity-90"
              >
                <Eye size={14} />
                {getPrimaryAction({
                  definitions: ADMIN_ORDER_ACTIONS,
                  state: o.s,
                  resource: o,
                  actor,
                })?.label ?? "View Details"}
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {open && (
        <OrderDetailsOverlay
          o={open}
          onClose={() => setOpenId(null)}
          onApprove={(orderId) => {
            setOpenId(null);
            onApproveOrder?.(orderId);
          }}
        />
      )}
    </AuditListPage>
  );
};

export default OrdersSection;
