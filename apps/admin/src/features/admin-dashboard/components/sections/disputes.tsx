import { useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  Layers,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { cn } from "@jobrio/utils/utils";
import { SectionHeader, Card } from "@admin/features/admin-dashboard/components/sections";
import {
  Stat,
  Tabs,
  Row,
  Badge,
  SectionTitle,
  AEIcon,
  InfoChip,
  ActionBtn,
} from "@admin/features/admin-dashboard/components/sections-shared";
import { SortDropdown } from "@admin/features/admin-dashboard/components/SortDropdown";
import {
  updateOrderInRegistry,
  addNotification,
  getOrderRegistrySnapshot,
} from "@jobrio/constants";

/* ============================================================
 * 9. DISPUTE CENTER
 * ============================================================ */

type DispKey = "active" | "investigation" | "decision" | "escalated" | "history" | "analytics";

const DISP_NAV: { key: DispKey; label: string; icon: string }[] = [
  { key: "active", label: "Active Disputes", icon: "inbox" },
  { key: "investigation", label: "Investigation Workspace", icon: "folder_open" },
  { key: "decision", label: "Decision Center", icon: "gavel" },
  { key: "escalated", label: "Escalated Cases", icon: "warning" },
  { key: "history", label: "Dispute History", icon: "history" },
  { key: "analytics", label: "Dispute Analytics", icon: "monitoring" },
];

/* ---------- Active Disputes ---------- */
type ActiveTab =
  "new" | "under_inv" | "wait_client" | "wait_pro" | "wait_internal" | "ready_decision";

type ActiveRow = {
  id: string;
  orderId: string;
  client: string;
  professional: string;
  service: string;
  raisedBy: "Client" | "Professional";
  raisedDate: string;
  escrowStatus: "Frozen" | "Released" | "Pending";
  deadline: string;
  tab: ActiveTab;
};

const ACTIVE_DISP: ActiveRow[] = [
  {
    id: "DSP-2041",
    orderId: "JR-1051",
    client: "Initech",
    professional: "Aarav K.",
    service: "Logo Design",
    raisedBy: "Client",
    raisedDate: "12 Jun",
    escrowStatus: "Frozen",
    deadline: "in 18h",
    tab: "new",
  },
  {
    id: "DSP-2040",
    orderId: "JR-1049",
    client: "Globex",
    professional: "Riya S.",
    service: "Pitch Deck",
    raisedBy: "Professional",
    raisedDate: "11 Jun",
    escrowStatus: "Frozen",
    deadline: "in 2d",
    tab: "new",
  },
  {
    id: "DSP-2038",
    orderId: "JR-1047",
    client: "Hooli",
    professional: "Manish K.",
    service: "Landing Page",
    raisedBy: "Client",
    raisedDate: "10 Jun",
    escrowStatus: "Frozen",
    deadline: "in 1d 4h",
    tab: "under_inv",
  },
  {
    id: "DSP-2037",
    orderId: "JR-1046",
    client: "Pied Piper",
    professional: "Soha M.",
    service: "Whitepaper",
    raisedBy: "Client",
    raisedDate: "10 Jun",
    escrowStatus: "Frozen",
    deadline: "in 22h",
    tab: "wait_client",
  },
  {
    id: "DSP-2036",
    orderId: "JR-1045",
    client: "Aviato",
    professional: "Vikram R.",
    service: "Promo Video",
    raisedBy: "Professional",
    raisedDate: "09 Jun",
    escrowStatus: "Frozen",
    deadline: "in 14h",
    tab: "wait_pro",
  },
  {
    id: "DSP-2034",
    orderId: "JR-1043",
    client: "Vandelay",
    professional: "Anika S.",
    service: "Brand Identity",
    raisedBy: "Client",
    raisedDate: "08 Jun",
    escrowStatus: "Frozen",
    deadline: "in 6h",
    tab: "wait_internal",
  },
  {
    id: "DSP-2033",
    orderId: "JR-1042",
    client: "Soylent",
    professional: "Karan P.",
    service: "Mobile App QA",
    raisedBy: "Client",
    raisedDate: "07 Jun",
    escrowStatus: "Frozen",
    deadline: "Decision pending",
    tab: "ready_decision",
  },
];

const activeTabTone = (t: ActiveTab) =>
  t === "new"
    ? "bg-primary-container/10 text-primary-container"
    : t === "under_inv"
      ? "bg-violet-50 text-violet-700"
      : t === "wait_client"
        ? "bg-amber-50 text-amber-700"
        : t === "wait_pro"
          ? "bg-amber-50 text-amber-700"
          : t === "wait_internal"
            ? "bg-orange-50 text-orange-700"
            : "bg-emerald-50 text-emerald-700";

const activeTabLabel = (t: ActiveTab) =>
  t === "new"
    ? "New"
    : t === "under_inv"
      ? "Under Investigation"
      : t === "wait_client"
        ? "Waiting · Client"
        : t === "wait_pro"
          ? "Waiting · Professional"
          : t === "wait_internal"
            ? "Waiting · Internal Review"
            : "Ready For Decision";

const ActiveDisputesView = () => {
  const [tab, setTab] = useState<ActiveTab>("new");
  const [rowsState, setRowsState] = useState<ActiveRow[]>(ACTIVE_DISP);
  const rows = rowsState.filter((r) => r.tab === tab);
  const moveTo = (id: string, next: ActiveTab, label: string) => {
    setRowsState((s) => s.map((x) => (x.id === id ? { ...x, tab: next } : x)));
    toast.success(`${id} → ${label}`, { duration: 1800 });
  };
  return (
    <div className="space-y-4">
      <SortDropdown<ActiveTab>
        value={tab}
        onChange={setTab}
        options={[
          {
            key: "new",
            label: "New Disputes",
            count: rowsState.filter((r) => r.tab === "new").length,
          },
          {
            key: "under_inv",
            label: "Under Investigation",
            count: rowsState.filter((r) => r.tab === "under_inv").length,
          },
          {
            key: "wait_client",
            label: "Waiting For Client",
            count: rowsState.filter((r) => r.tab === "wait_client").length,
          },
          {
            key: "wait_pro",
            label: "Waiting For Professional",
            count: rowsState.filter((r) => r.tab === "wait_pro").length,
          },
          {
            key: "wait_internal",
            label: "Waiting For Internal Review",
            count: rowsState.filter((r) => r.tab === "wait_internal").length,
          },
          {
            key: "ready_decision",
            label: "Ready For Decision",
            count: rowsState.filter((r) => r.tab === "ready_decision").length,
          },
        ]}
      />
      {rows.length === 0 && (
        <Card className="!p-6 text-center text-xs text-outline">No disputes in this stage.</Card>
      )}
      {rows.map((r) => (
        <Card key={r.id} className="!p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-extrabold text-on-surface">Dispute #{r.id}</p>
                <Badge tone={activeTabTone(r.tab)}>{activeTabLabel(r.tab)}</Badge>
                <Badge tone="bg-rose-50 text-rose-700">Escrow {r.escrowStatus}</Badge>
              </div>
              <p className="text-xs text-outline mt-0.5">
                Order #{r.orderId} · {r.service}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            <InfoChip k="Client" v={r.client} />
            <InfoChip k="Professional" v={r.professional} />
            <InfoChip k="Raised By" v={r.raisedBy} />
            <InfoChip k="Raised Date" v={r.raisedDate} />
            <InfoChip k="Service" v={r.service} />
            <InfoChip k="Escrow Status" v={r.escrowStatus} tone="text-rose-600" />
            <InfoChip k="Response Deadline" v={r.deadline} tone="text-amber-600" />
            <InfoChip k="Current Status" v={activeTabLabel(r.tab)} />
          </div>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <ActionBtn
              label="Open Case"
              icon="folder_open"
              tone="primary"
              onClick={() => moveTo(r.id, "under_inv", "Under Investigation")}
            />
            <ActionBtn
              label="Request Client Evidence"
              icon="attach_file"
              tone="neutral"
              onClick={() => moveTo(r.id, "wait_client", "Waiting · Client")}
            />
            <ActionBtn
              label="Request Pro Evidence"
              icon="attach_file"
              tone="neutral"
              onClick={() => moveTo(r.id, "wait_pro", "Waiting · Professional")}
            />
            <ActionBtn
              label="Send To Internal Review"
              icon="reviews"
              tone="neutral"
              onClick={() => moveTo(r.id, "wait_internal", "Waiting · Internal")}
            />
            <ActionBtn
              label="Mark Ready For Decision"
              icon="gavel"
              tone="success"
              onClick={() => moveTo(r.id, "ready_decision", "Ready For Decision")}
            />
          </div>
        </Card>
      ))}
    </div>
  );
};

/* ---------- Investigation Workspace ---------- */
type InvCase = {
  id: string;
  orderId: string;
  service: string;
  category: string;
  orderValue: number;
  escrowAmount: number;
  client: { name: string; complaint: string; files: string[] };
  professional: { name: string; response: string; files: string[] };
};

const INV_CASES: InvCase[] = [
  {
    id: "DSP-2038",
    orderId: "JR-1047",
    service: "Landing Page",
    category: "Development",
    orderValue: 9800,
    escrowAmount: 9800,
    client: {
      name: "Hooli",
      complaint:
        "Final landing page did not match the approved Figma. Conversion sections missing and copy is generic.",
      files: ["complaint-screenshot-01.png", "approved-figma-link.txt", "live-page-screenshot.png"],
    },
    professional: {
      name: "Manish K.",
      response:
        "Client approved milestone 2 build. Section removal was per chat instruction on 08 Jun.",
      files: ["delivered-build.zip", "chat-transcript.pdf", "milestone-approval.png"],
    },
  },
];

const InternalRecord = ({ label, items }: { label: string; items: string[] }) => (
  <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low p-3">
    <p className="text-[11px] font-bold uppercase tracking-wider text-outline">{label}</p>
    <ul className="mt-2 space-y-1 text-xs text-on-surface-variant">
      {items.map((i, ix) => (
        <li key={ix}>• {i}</li>
      ))}
    </ul>
  </div>
);

const InvestigationWorkspaceView = () => {
  const c = INV_CASES[0];
  const [note, setNote] = useState("");
  return (
    <div className="space-y-4">
      <Card className="!p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-on-surface">Case #{c.id}</p>
            <p className="text-xs text-outline mt-0.5">
              Order #{c.orderId} · {c.service}
            </p>
          </div>
          <Badge tone="bg-violet-50 text-violet-700">Under Investigation</Badge>
        </div>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
          <InfoChip k="Dispute ID" v={c.id} />
          <InfoChip k="Order ID" v={c.orderId} />
          <InfoChip k="Service" v={c.service} />
          <InfoChip k="Category" v={c.category} />
          <InfoChip k="Order Value" v={`₹${c.orderValue.toLocaleString()}`} />
          <InfoChip
            k="Escrow Amount"
            v={`₹${c.escrowAmount.toLocaleString()}`}
            tone="text-rose-600"
          />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="!p-4">
          <p className="text-sm font-extrabold text-on-surface">
            Client Submission · {c.client.name}
          </p>
          <p className="mt-2 text-xs text-on-surface-variant">{c.client.complaint}</p>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-outline">Files</p>
          <ul className="mt-1 space-y-1 text-xs text-on-surface-variant">
            {c.client.files.map((f) => (
              <li key={f}>📎 {f}</li>
            ))}
          </ul>
        </Card>
        <Card className="!p-4">
          <p className="text-sm font-extrabold text-on-surface">
            Professional Submission · {c.professional.name}
          </p>
          <p className="mt-2 text-xs text-on-surface-variant">{c.professional.response}</p>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-outline">Files</p>
          <ul className="mt-1 space-y-1 text-xs text-on-surface-variant">
            {c.professional.files.map((f) => (
              <li key={f}>📎 {f}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="!p-4">
        <p className="text-sm font-extrabold text-on-surface">
          Internal Records <span className="text-[10px] font-medium text-outline">(read-only)</span>
        </p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
          <InternalRecord
            label="Complete Order Timeline"
            items={["Order received 05 Jun", "Brief shared 05 Jun", "Delivered 10 Jun"]}
          />
          <InternalRecord
            label="Assignment Timeline"
            items={["Assigned to Manish K. 05 Jun", "Reassignment: none"]}
          />
          <InternalRecord
            label="QA History"
            items={["QA pass · 09 Jun", "Minor revision flagged"]}
          />
          <InternalRecord
            label="Delivery History"
            items={["v1 delivered 08 Jun", "v2 delivered 10 Jun"]}
          />
          <InternalRecord
            label="Chat History"
            items={["Approval message · 08 Jun", "Scope change request · 09 Jun"]}
          />
          <InternalRecord
            label="Financial Timeline"
            items={["Escrow held 05 Jun", "Frozen 11 Jun"]}
          />
          <InternalRecord label="Previous Rework History" items={["1 rework completed"]} />
        </div>
      </Card>

      <Card className="!p-4">
        <p className="text-sm font-extrabold text-on-surface">Evidence Panel</p>
        <p className="text-xs text-outline mt-1">
          Supports Images · Videos · Documents · ZIP Files · External Links
        </p>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {["Images", "Videos", "Documents", "ZIP Files", "External Links"].map((t) => (
            <div
              key={t}
              className="rounded-lg border border-dashed border-outline-variant/40 p-3 text-center text-on-surface-variant"
            >
              {t}
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <ActionBtn label="Upload Evidence" icon="upload" tone="neutral" disabled />
        </div>
      </Card>

      <Card className="!p-4">
        <p className="text-sm font-extrabold text-on-surface">
          Private Notes{" "}
          <span className="text-[10px] font-medium text-outline">(dispute team only)</span>
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Add an internal investigation note…"
          className="mt-2 w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30"
        />
        <div className="mt-2 flex justify-end">
          <ActionBtn
            label="Save Note"
            icon="save"
            tone="primary"
            onClick={() => {
              if (note.trim()) {
                toast.success("Note saved");
                setNote("");
              }
            }}
          />
        </div>
      </Card>
    </div>
  );
};

/* ---------- Decision Center ---------- */
type DecisionType = "client" | "pro" | "partial" | "more";

const DecisionCenterView = () => {
  const [decision, setDecision] = useState<DecisionType>("client");
  const [reason, setReason] = useState("");
  const [pct, setPct] = useState("70");
  const [published, setPublished] = useState(false);
  const disputeOrderId = "JR-1042";
  const inputCls =
    "mt-1 w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30";
  const OPTIONS: { key: DecisionType; label: string; desc: string }[] = [
    { key: "client", label: "Client Wins", desc: "Refund will be executed by Finance & Escrow" },
    {
      key: "pro",
      label: "Professional Wins",
      desc: "Escrow released to Professional by Finance & Escrow",
    },
    {
      key: "partial",
      label: "Partial Resolution",
      desc: "Custom split — Finance & Escrow will execute",
    },
    {
      key: "more",
      label: "More Investigation Required",
      desc: "Case returns to Investigation Workspace",
    },
  ];
  return (
    <div className="space-y-4">
      <Card className="!p-4">
        <p className="text-sm font-extrabold text-on-surface">
          Pending Decision · DSP-2033 · Order #{disputeOrderId}
        </p>
        <p className="text-xs text-outline mt-0.5">
          {published
            ? "Decision published — Finance & Escrow notified."
            : "Investigation complete — choose final outcome."}
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-3">
        {OPTIONS.map((o) => {
          const on = decision === o.key;
          return (
            <button
              key={o.key}
              onClick={() => setDecision(o.key)}
              className={cn(
                "text-left rounded-xl border px-4 py-3 transition-colors",
                on
                  ? "border-on-surface bg-surface-container-low"
                  : "border-outline-variant/40 bg-surface hover:border-on-surface/60",
              )}
            >
              <p className="text-sm font-extrabold text-on-surface">{o.label}</p>
              <p className="text-xs text-outline mt-0.5">{o.desc}</p>
            </button>
          );
        })}
      </div>

      {decision === "partial" && (
        <Card className="!p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
            Custom Split (Client %)
          </span>
          <input
            value={pct}
            onChange={(e) => setPct(e.target.value)}
            className={inputCls}
            placeholder="e.g. 70"
          />
          <p className="mt-2 text-xs text-outline">
            Professional share = {Math.max(0, 100 - Number(pct || 0))}%
          </p>
        </Card>
      )}

      <Card className="!p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
          Reason (mandatory)
        </span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="State the reason backing this decision…"
          className={inputCls}
        />
      </Card>

      <Card className="!p-4">
        <p className="text-sm font-extrabold text-on-surface">Decision Summary</p>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
          <InfoChip k="Decision" v={OPTIONS.find((o) => o.key === decision)!.label} />
          <InfoChip
            k="Reason"
            v={reason ? reason.slice(0, 40) + (reason.length > 40 ? "…" : "") : "—"}
          />
          <InfoChip k="Evidence Used" v="3 files attached" />
          <InfoChip k="Reviewer" v="Anika Shah" />
          <InfoChip k="Decision Date" v="Today" />
        </div>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <ActionBtn label="Request Review" icon="rate_review" tone="neutral" disabled />
          <ActionBtn
            label="Publish Decision"
            icon="campaign"
            tone="primary"
            onClick={() => {
              if (!reason.trim()) {
                toast.error("Reason is mandatory");
                return;
              }
              if (decision === "more") {
                toast("Case returned to Investigation Workspace");
                return;
              }

              const clientPct =
                decision === "partial" ? Number(pct || 0) : decision === "client" ? 100 : 0;
              const exists = getOrderRegistrySnapshot().some((o) => o.id === disputeOrderId);

              if (decision === "client") {
                if (exists) {
                  updateOrderInRegistry(disputeOrderId, {
                    s: "cancelled",
                    resolutionNote: reason.trim(),
                    resolvedBy: "Anika Shah",
                    disputeReason: reason.trim(),
                  });
                }
                addNotification({
                  type: "order",
                  title: `Dispute resolved for Order #${disputeOrderId} — refund approved`,
                  body: reason.trim(),
                  orderId: disputeOrderId,
                });
              } else if (decision === "pro") {
                if (exists) {
                  updateOrderInRegistry(disputeOrderId, {
                    s: "released",
                    resolutionNote: reason.trim(),
                    resolvedBy: "Anika Shah",
                  });
                }
                addNotification({
                  type: "order",
                  title: `Dispute resolved for Order #${disputeOrderId} — escrow released to professional`,
                  body: reason.trim(),
                  orderId: disputeOrderId,
                });
              } else if (decision === "partial") {
                if (exists) {
                  updateOrderInRegistry(disputeOrderId, {
                    s: "resolved",
                    resolutionNote: `${reason.trim()} (Client ${clientPct}% / Professional ${100 - clientPct}%)`,
                    resolvedBy: "Anika Shah",
                  });
                }
                addNotification({
                  type: "order",
                  title: `Dispute resolved for Order #${disputeOrderId} — partial split`,
                  body: `${reason.trim()} · You receive ${clientPct}% back.`,
                  orderId: disputeOrderId,
                });
              }

              setPublished(true);
              toast.success("Decision published · Finance & Escrow notified", { duration: 2800 });
            }}
          />
        </div>
      </Card>
    </div>
  );
};

/* ---------- Escalated Cases ---------- */
type EscRow = {
  id: string;
  orderId: string;
  reason: string;
  reviewer: string;
  priority: "High" | "Critical";
  sla: string;
};
const ESC_ROWS: EscRow[] = [
  {
    id: "DSP-2030",
    orderId: "JR-1039",
    reason: "High Order Value",
    reviewer: "Anika Shah",
    priority: "High",
    sla: "in 1d 4h",
  },
  {
    id: "DSP-2029",
    orderId: "JR-1037",
    reason: "Fraud Suspicion",
    reviewer: "Vikram R.",
    priority: "Critical",
    sla: "in 12h",
  },
  {
    id: "DSP-2027",
    orderId: "JR-1035",
    reason: "Legal Complaint",
    reviewer: "Unassigned",
    priority: "Critical",
    sla: "Breached · 2h",
  },
];

const EscalatedCasesView = () => (
  <div className="space-y-3">
    {ESC_ROWS.map((r) => (
      <Card key={r.id} className="!p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-extrabold text-on-surface">Escalation #{r.id}</p>
              <Badge
                tone={
                  r.priority === "Critical"
                    ? "bg-rose-50 text-rose-700"
                    : "bg-amber-50 text-amber-700"
                }
              >
                {r.priority}
              </Badge>
            </div>
            <p className="text-xs text-outline mt-0.5">Order #{r.orderId}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          <InfoChip k="Escalation Reason" v={r.reason} />
          <InfoChip k="Assigned Reviewer" v={r.reviewer} />
          <InfoChip
            k="Priority"
            v={r.priority}
            tone={r.priority === "Critical" ? "text-rose-600" : "text-amber-600"}
          />
          <InfoChip
            k="SLA Timer"
            v={r.sla}
            tone={r.sla.startsWith("Breached") ? "text-rose-600" : "text-amber-600"}
          />
        </div>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <ActionBtn label="Assign Senior Reviewer" icon="person_add" tone="neutral" disabled />
          <ActionBtn label="Continue Investigation" icon="folder_open" tone="primary" disabled />
          <ActionBtn label="Close Escalation" icon="check_circle" tone="success" disabled />
        </div>
      </Card>
    ))}
  </div>
);

/* ---------- Dispute History ---------- */
type DispHistTab = "client_won" | "pro_won" | "partial" | "withdrawn";
type DispHistRow = {
  id: string;
  orderId: string;
  decision: string;
  resolutionTime: string;
  reviewer: string;
  closure: string;
  tab: DispHistTab;
};
const DISP_HIST_ROWS: DispHistRow[] = [
  {
    id: "DSP-2010",
    orderId: "JR-1018",
    decision: "Client Won · Full Refund",
    resolutionTime: "3d 4h",
    reviewer: "Anika Shah",
    closure: "01 Jun",
    tab: "client_won",
  },
  {
    id: "DSP-2009",
    orderId: "JR-1016",
    decision: "Professional Won · Full Release",
    resolutionTime: "2d 6h",
    reviewer: "Vikram R.",
    closure: "31 May",
    tab: "pro_won",
  },
  {
    id: "DSP-2008",
    orderId: "JR-1014",
    decision: "Partial · 60/40",
    resolutionTime: "4d 1h",
    reviewer: "Anika Shah",
    closure: "29 May",
    tab: "partial",
  },
  {
    id: "DSP-2007",
    orderId: "JR-1013",
    decision: "Withdrawn by Client",
    resolutionTime: "12h",
    reviewer: "—",
    closure: "28 May",
    tab: "withdrawn",
  },
];

const DisputeHistoryView = () => {
  const [tab, setTab] = useState<DispHistTab>("client_won");
  const rows = DISP_HIST_ROWS.filter((r) => r.tab === tab);
  return (
    <div className="space-y-4">
      <SortDropdown<DispHistTab>
        value={tab}
        onChange={setTab}
        options={[
          {
            key: "client_won",
            label: "Client Won",
            count: DISP_HIST_ROWS.filter((r) => r.tab === "client_won").length,
          },
          {
            key: "pro_won",
            label: "Professional Won",
            count: DISP_HIST_ROWS.filter((r) => r.tab === "pro_won").length,
          },
          {
            key: "partial",
            label: "Partial Settlement",
            count: DISP_HIST_ROWS.filter((r) => r.tab === "partial").length,
          },
          {
            key: "withdrawn",
            label: "Withdrawn",
            count: DISP_HIST_ROWS.filter((r) => r.tab === "withdrawn").length,
          },
        ]}
      />
      {rows.map((r) => (
        <Card key={r.id} className="!p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-extrabold text-on-surface">Dispute #{r.id}</p>
                <Badge tone="bg-slate-100 text-slate-700">Closed</Badge>
              </div>
              <p className="text-xs text-outline mt-0.5">Order #{r.orderId}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            <InfoChip k="Final Decision" v={r.decision} />
            <InfoChip k="Resolution Time" v={r.resolutionTime} />
            <InfoChip k="Reviewer" v={r.reviewer} />
            <InfoChip k="Closure Date" v={r.closure} />
          </div>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <ActionBtn
              label="View Timeline · Coming Soon"
              icon="timeline"
              tone="neutral"
              disabled
            />
            <ActionBtn
              label="View Evidence · Coming Soon"
              icon="folder_open"
              tone="neutral"
              disabled
            />
            <ActionBtn
              label="View Notes · Coming Soon"
              icon="description"
              tone="neutral"
              disabled
            />
            <ActionBtn
              label="Financial Outcome · Coming Soon"
              icon="account_balance"
              tone="neutral"
              disabled
            />
            <ActionBtn
              label="Related Order · Coming Soon"
              icon="assignment"
              tone="neutral"
              disabled
            />
          </div>
        </Card>
      ))}
    </div>
  );
};

/* ---------- Dispute Analytics ---------- */
const DisputeAnalyticsView = () => (
  <div className="space-y-6">
    <SectionTitle title="Core Metrics" />
    <Row cols={4}>
      <Stat label="Total Disputes" value="312" icon={Gavel} tint="bg-rose-500/10 text-rose-600" />
      <Stat
        label="Active Disputes"
        value="7"
        icon={AlertTriangle}
        tint="bg-amber-500/10 text-amber-600"
      />
      <Stat
        label="Avg Resolution Time"
        value="2d 8h"
        icon={Clock}
        tint="bg-primary-container/10 text-primary-container"
      />
      <Stat
        label="Resolution Success Rate"
        value="92%"
        icon={CheckCircle2}
        tint="bg-emerald-500/10 text-emerald-600"
      />
    </Row>
    <Row cols={2}>
      <Stat
        label="Escalation Rate"
        value="6.4%"
        icon={Activity}
        tint="bg-violet-500/10 text-violet-600"
      />
      <Stat
        label="Withdrawn Rate"
        value="3.1%"
        icon={XCircle}
        tint="bg-slate-500/10 text-slate-600"
      />
    </Row>

    <SectionTitle title="Category Insights" />
    <div className="grid md:grid-cols-2 gap-3">
      <Card className="!p-4">
        <p className="text-sm font-bold mb-2">Most Disputed Services</p>
        <ul className="text-xs text-on-surface-variant space-y-1">
          <li>• Landing Page Development — 38</li>
          <li>• Promo Video Edit — 27</li>
          <li>• Logo Design — 19</li>
        </ul>
      </Card>
      <Card className="!p-4">
        <p className="text-sm font-bold mb-2">Most Disputed Categories</p>
        <ul className="text-xs text-on-surface-variant space-y-1">
          <li>• Development — 41%</li>
          <li>• Video Editing — 28%</li>
          <li>• Design — 19%</li>
        </ul>
      </Card>
      <Card className="!p-4">
        <p className="text-sm font-bold mb-2">Client Complaint Trends</p>
        <ul className="text-xs text-on-surface-variant space-y-1">
          <li>• Quality below expectation — 44%</li>
          <li>• Missed deadline — 22%</li>
          <li>• Scope mismatch — 17%</li>
        </ul>
      </Card>
      <Card className="!p-4">
        <p className="text-sm font-bold mb-2">Professional Complaint Trends</p>
        <ul className="text-xs text-on-surface-variant space-y-1">
          <li>• Unclear brief — 38%</li>
          <li>• Scope creep — 26%</li>
          <li>• Late approvals — 18%</li>
        </ul>
      </Card>
    </div>

    <SectionTitle title="Root Cause Analysis" />
    <Row cols={5}>
      <Stat
        label="Poor Requirement Clarity"
        value="29%"
        icon={FileText}
        tint="bg-amber-500/10 text-amber-600"
      />
      <Stat label="QA Failure" value="18%" icon={ShieldCheck} tint="bg-rose-500/10 text-rose-600" />
      <Stat
        label="Missed Deadline"
        value="22%"
        icon={Clock}
        tint="bg-primary-container/10 text-primary-container"
      />
      <Stat
        label="Scope Disagreement"
        value="17%"
        icon={Layers}
        tint="bg-violet-500/10 text-violet-600"
      />
      <Stat
        label="Communication Failure"
        value="14%"
        icon={Users}
        tint="bg-emerald-500/10 text-emerald-600"
      />
    </Row>

    <SectionTitle title="Performance Insights" />
    <div className="grid md:grid-cols-3 gap-3">
      <Card className="!p-4">
        <p className="text-sm font-bold mb-2">Reviewer Performance</p>
        <ul className="text-xs text-on-surface-variant space-y-1">
          <li>• Anika Shah — 96% upheld</li>
          <li>• Vikram R. — 92% upheld</li>
          <li>• Karan P. — 89% upheld</li>
        </ul>
      </Card>
      <Card className="!p-4">
        <p className="text-sm font-bold mb-2">Resolution Speed</p>
        <ul className="text-xs text-on-surface-variant space-y-1">
          <li>• &lt; 24h — 31%</li>
          <li>• 1–3 days — 48%</li>
          <li>• &gt; 3 days — 21%</li>
        </ul>
      </Card>
      <Card className="!p-4">
        <p className="text-sm font-bold mb-2">Escalation Trends</p>
        <ul className="text-xs text-on-surface-variant space-y-1">
          <li>• High value triggered — 42%</li>
          <li>• Fraud suspicion — 21%</li>
          <li>• Legal complaint — 11%</li>
        </ul>
      </Card>
    </div>
  </div>
);

/* ---------- Main Section ---------- */
export const DisputesSection = () => {
  const [view, setView] = useState<DispKey>("active");
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Dispute Center"
        subtitle="Receive, investigate, decide. Financial execution is handled by Finance & Escrow."
      />

      <Row cols={4}>
        <Stat label="Active Disputes" value="7" icon={Gavel} tint="bg-rose-500/10 text-rose-600" />
        <Stat
          label="Under Investigation"
          value="3"
          icon={FileText}
          tint="bg-violet-500/10 text-violet-600"
        />
        <Stat
          label="Ready For Decision"
          value="2"
          icon={CheckCircle2}
          tint="bg-emerald-500/10 text-emerald-600"
        />
        <Stat
          label="Escalated"
          value="3"
          icon={AlertTriangle}
          tint="bg-amber-500/10 text-amber-600"
        />
      </Row>

      <div className="flex flex-wrap gap-2">
        {DISP_NAV.map((n) => {
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

      {view === "active" && <ActiveDisputesView />}
      {view === "investigation" && <InvestigationWorkspaceView />}
      {view === "decision" && <DecisionCenterView />}
      {view === "escalated" && <EscalatedCasesView />}
      {view === "history" && <DisputeHistoryView />}
      {view === "analytics" && <DisputeAnalyticsView />}
    </div>
  );
};

export default DisputesSection;
