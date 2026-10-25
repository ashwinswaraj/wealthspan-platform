import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@jobrio/utils/utils";
import { SectionHeader, Card } from "@admin/features/admin-dashboard/components/sections";
import {
  Badge,
  Detail,
  AEIcon,
  InfoChip,
  ActionBtn,
} from "@admin/features/admin-dashboard/components/sections-shared";
import { SortDropdown } from "@admin/features/admin-dashboard/components/SortDropdown";
import { updateOrderInRegistry, getOrderRegistrySnapshot } from "@jobrio/constants";

/* ============================================================
 * 7. QA DESK
 * Quality verification, rework, exceptions, history & analytics.
 * Ownership: QA Operations only. Order / Assignment / Escrow /
 * Disputes / Hiring are NOT managed here.
 * ============================================================ */

type QAKey = "pending" | "rework" | "exceptions" | "history";

const QA_NAV: { key: QAKey; label: string; icon: string }[] = [
  { key: "pending", label: "Pending Verification", icon: "inbox" },
  { key: "rework", label: "Rework Tracker", icon: "autorenew" },
  { key: "exceptions", label: "Quality Exceptions", icon: "report" },
  { key: "history", label: "QA History", icon: "history" },
];

/* ---------- Pending Verification ---------- */
type DeadlineStatus = "On Time" | "Delayed";
type Priority = "Normal" | "High Priority" | "Critical";

const PENDING_ROWS: {
  id: string;
  service: string;
  category: string;
  client: string;
  professional: string;
  submitted: string;
  waiting: string;
  deadline: DeadlineStatus;
  priority: Priority;
}[] = [
  {
    id: "JR-1042",
    service: "Logo Design",
    category: "Design",
    client: "Initech",
    professional: "K. Iyer",
    submitted: "12m ago",
    waiting: "12m",
    deadline: "On Time",
    priority: "Normal",
  },
  {
    id: "JR-1039",
    service: "Promo Video Edit",
    category: "Video Editing",
    client: "Globex",
    professional: "A. Bose",
    submitted: "48m ago",
    waiting: "48m",
    deadline: "On Time",
    priority: "High Priority",
  },
  {
    id: "JR-1031",
    service: "Whitepaper Draft",
    category: "Content Writing",
    client: "Hooli",
    professional: "R. Sharma",
    submitted: "2h ago",
    waiting: "2h",
    deadline: "Delayed",
    priority: "Critical",
  },
  {
    id: "JR-1028",
    service: "Pitch Deck",
    category: "Design",
    client: "Pied Piper",
    professional: "M. Kumar",
    submitted: "3h ago",
    waiting: "3h",
    deadline: "On Time",
    priority: "Normal",
  },
];

const deadlineTone = (d: DeadlineStatus) =>
  d === "On Time" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700";
const priorityTone = (p: Priority) =>
  p === "Critical"
    ? "bg-rose-50 text-rose-700"
    : p === "High Priority"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-700";

const PendingVerificationView = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [processed, setProcessed] = useState<Record<string, "passed" | "failed">>({});
  const [feedback, setFeedback] = useState("");
  const visibleRows = PENDING_ROWS.filter((r) => !processed[r.id]);
  const order = visibleRows.find((r) => r.id === selected);

  const handlePass = () => {
    if (!order) return;
    if (getOrderRegistrySnapshot().some((o) => o.id === order.id)) {
      updateOrderInRegistry(order.id, { s: "delivered", deliveredAt: new Date().toISOString() });
    }
    setProcessed((p) => ({ ...p, [order.id]: "passed" }));
    toast.success(`#${order.id} passed QA & delivered`, {
      description: "Client can now review the delivery.",
      duration: 2500,
    });
    setSelected(null);
    setFeedback("");
  };

  const handleFail = () => {
    if (!order) return;
    if (getOrderRegistrySnapshot().some((o) => o.id === order.id)) {
      updateOrderInRegistry(order.id, {
        s: "rework",
        revisionNote: feedback.trim() || "QA flagged issues — see internal notes.",
      });
    }
    setProcessed((p) => ({ ...p, [order.id]: "failed" }));
    toast.success(`#${order.id} sent back for rework`, {
      description: "Professional has been notified with your feedback.",
      duration: 2500,
    });
    setSelected(null);
    setFeedback("");
  };

  const handleHold = () => {
    if (!order) return;
    toast(`#${order.id} held for later review`, { duration: 2000 });
    setSelected(null);
  };

  return (
    <div className="space-y-4">
      <Card className="!p-0 overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2.5 border-b border-surface-container-high text-[10px] font-bold uppercase tracking-wider text-outline">
          <div className="col-span-2">Order · Service</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Client</div>
          <div className="col-span-2">Professional</div>
          <div className="col-span-1">Waiting</div>
          <div className="col-span-1">Deadline</div>
          <div className="col-span-2 text-right">Priority · Action</div>
        </div>
        <ul className="divide-y divide-surface-container-high/60">
          {visibleRows.map((r) => (
            <li key={r.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm">
              <div className="col-span-2">
                <p className="font-bold">#{r.id}</p>
                <p className="text-[11px] text-outline truncate">{r.service}</p>
              </div>
              <div className="col-span-2 text-xs text-on-surface-variant">{r.category}</div>
              <div className="col-span-2 text-xs">{r.client}</div>
              <div className="col-span-2 text-xs">{r.professional}</div>
              <div className="col-span-1 text-xs text-outline">{r.waiting}</div>
              <div className="col-span-1">
                <Badge tone={deadlineTone(r.deadline)}>{r.deadline}</Badge>
              </div>
              <div className="col-span-2 flex justify-end items-center gap-2">
                <Badge tone={priorityTone(r.priority)}>{r.priority}</Badge>
                <button
                  type="button"
                  onClick={() => setSelected(r.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold bg-primary text-white hover:bg-primary/90 active:bg-primary/80 transition-colors whitespace-nowrap"
                >
                  View Details
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {order && (
        <div
          className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-surface w-full md:max-w-4xl md:rounded-2xl rounded-none border border-outline-variant/40 shadow-2xl overflow-hidden max-h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 p-4 border-b border-surface-container-high">
              <div>
                <p className="text-sm font-bold">Verification Workspace · #{order.id}</p>
                <p className="text-xs text-outline">
                  {order.service} · {order.category} · {order.client} → {order.professional}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="p-1 rounded-full text-outline hover:text-on-surface hover:bg-surface-container"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-4">
                <Detail k="Order Value" v="₹4,800" />
                <Detail k="Deadline" v="Today 18:00" />
                <Detail k="Submitted" v={order.submitted} />
                <Detail k="Priority" v={order.priority} />
              </div>

              <div className="grid md:grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-outline mb-2">
                    Client Requirements
                  </p>
                  <ul className="text-xs space-y-1 list-disc pl-4 text-on-surface-variant">
                    <li>Instructions & original brief</li>
                    <li>Reference files & attachments</li>
                    <li>Brand guidelines</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-outline mb-2">
                    Professional Submission
                  </p>
                  <ul className="text-xs space-y-1 list-disc pl-4 text-on-surface-variant">
                    <li>Delivered files & source files</li>
                    <li>Preview links</li>
                    <li>Submission notes</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-3 mb-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-outline mb-2">
                  Current QA Configuration{" "}
                  <span className="ml-1 font-normal italic">(Read-only · Platform Rules)</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Resolution Check",
                    "Audio Quality",
                    "Timeline Accuracy",
                    "Branding Compliance",
                    "Source Files",
                    "Grammar",
                    "Requirement Coverage",
                    "Originality",
                  ].map((c) => (
                    <Badge
                      key={c}
                      tone="bg-surface border border-outline-variant/40 text-on-surface-variant"
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-outline mb-1">
                    Internal Notes (QA only)
                  </p>
                  <textarea
                    className="w-full text-xs rounded-lg border border-outline-variant/40 bg-surface p-2 h-20"
                    placeholder="Visible only to QA team..."
                  />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-outline mb-1">
                    Professional Feedback
                  </p>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full text-xs rounded-lg border border-outline-variant/40 bg-surface p-2 h-20"
                    placeholder="Sent to professional with decision..."
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <ActionBtn
                  label="Pass QA & Deliver"
                  icon="check_circle"
                  tone="success"
                  onClick={handlePass}
                />
                <ActionBtn
                  label="Fail QA & Send Back"
                  icon="cancel"
                  tone="danger"
                  onClick={handleFail}
                />
                <ActionBtn
                  label="Hold Review"
                  icon="pause_circle"
                  tone="warn"
                  onClick={handleHold}
                />
                <ActionBtn
                  label="Attach Evidence · Coming Soon"
                  icon="attach_file"
                  tone="neutral"
                />
              </div>
              <p className="mt-3 text-[11px] italic text-outline">
                Every QA action is mirrored into Orders Desk timeline as source of truth.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Rework Tracker ---------- */
const REWORK_ROWS = [
  {
    id: "JR-1019",
    professional: "A. Bose",
    category: "Video Editing",
    reason: "Audio sync off in scene 2",
    count: 1,
    deadline: "Today 22:00",
    timer: "5h left",
  },
  {
    id: "JR-1014",
    professional: "R. Sharma",
    category: "Content Writing",
    reason: "Missed key requirements",
    count: 2,
    deadline: "Tomorrow 12:00",
    timer: "19h left",
  },
  {
    id: "JR-1009",
    professional: "M. Kumar",
    category: "Design",
    reason: "Wrong export format",
    count: 1,
    deadline: "Today 18:00",
    timer: "1h left",
  },
];

const ReworkProgressOverlay = ({
  row,
  onClose,
}: {
  row: (typeof REWORK_ROWS)[number];
  onClose: () => void;
}) => (
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
          <p className="text-sm font-bold">Rework Progress · #{row.id}</p>
          <p className="text-xs text-outline mt-0.5">
            {row.professional} · {row.category}
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
          <Detail k="Rework #" v={String(row.count)} />
          <Detail k="Deadline" v={row.deadline} />
          <Detail k="Timer" v={row.timer} />
          <Detail k="Status" v={row.count >= 2 ? "At Risk" : "On Track"} />
        </div>
        <Card>
          <p className="text-sm font-bold mb-2">QA Rejection Reason</p>
          <p className="text-xs text-on-surface-variant">{row.reason}</p>
        </Card>
        <Card>
          <p className="text-sm font-bold mb-2">Timeline</p>
          <ul className="space-y-2 text-xs">
            <li className="flex gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
              <span className="text-outline w-24">Sent</span>
              <span>Rework request sent to {row.professional}</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span className="text-outline w-24">In Progress</span>
              <span>Professional acknowledged · working on fix</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-outline shrink-0" />
              <span className="text-outline w-24">Awaiting</span>
              <span>Resubmission expected by {row.deadline}</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  </div>
);

const RewordTrackerView = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = REWORK_ROWS.find((r) => r.id === openId) || null;
  return (
    <div className="space-y-4">
      <Card className="!p-0 overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2.5 border-b border-surface-container-high text-[10px] font-bold uppercase tracking-wider text-outline">
          <div className="col-span-2">Order</div>
          <div className="col-span-2">Professional</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">QA Rejection Reason</div>
          <div className="col-span-1 text-right">Count</div>
          <div className="col-span-1 text-right">Deadline</div>
          <div className="col-span-2 text-right">Action</div>
        </div>
        <ul className="divide-y divide-surface-container-high/60">
          {REWORK_ROWS.map((r) => (
            <li key={r.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm">
              <div className="col-span-2 font-bold">#{r.id}</div>
              <div className="col-span-2 text-xs">{r.professional}</div>
              <div className="col-span-2 text-xs text-on-surface-variant">{r.category}</div>
              <div className="col-span-2 text-xs text-outline truncate">{r.reason}</div>
              <div className="col-span-1 text-right">
                <Badge
                  tone={r.count >= 2 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}
                >
                  #{r.count}
                </Badge>
              </div>
              <div className="col-span-1 text-right text-xs">
                <p className="font-semibold">{r.deadline}</p>
                <p className="text-outline">{r.timer}</p>
              </div>
              <div className="col-span-2 flex justify-end">
                <ActionBtn
                  label="View Progress"
                  icon="visibility"
                  tone="primary"
                  onClick={() => setOpenId(r.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <p className="text-[11px] italic text-outline">
        Internal phase. Not visible to client. On resubmission → Pending Verification. Repeated
        failures or missed deadlines auto-escalate to Quality Exceptions.
      </p>
      {open && <ReworkProgressOverlay row={open} onClose={() => setOpenId(null)} />}
    </div>
  );
};

/* ---------- Quality Exceptions ---------- */
type ExSeverity = "Medium" | "High" | "Critical";
const EXCEPTION_ROWS: {
  id: string;
  professional: string;
  category: string;
  type: string;
  trigger: string;
  severity: ExSeverity;
}[] = [
  {
    id: "JR-0994",
    professional: "Anon. Pro",
    category: "Design",
    type: "Suspected Plagiarism",
    trigger: "22m ago",
    severity: "Critical",
  },
  {
    id: "JR-0987",
    professional: "R. Sharma",
    category: "Content Writing",
    type: "Repeated QA Failures",
    trigger: "1h ago",
    severity: "High",
  },
  {
    id: "JR-0981",
    professional: "A. Bose",
    category: "Video Editing",
    type: "Rework Deadline Breach",
    trigger: "3h ago",
    severity: "Medium",
  },
  {
    id: "JR-0975",
    professional: "M. Kumar",
    category: "Design",
    type: "Professional Abandoned Rework",
    trigger: "5h ago",
    severity: "High",
  },
];
const severityTone = (s: ExSeverity) =>
  s === "Critical"
    ? "bg-rose-50 text-rose-700"
    : s === "High"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-700";

const QualityExceptionsView = () => {
  const [rows, setRows] = useState(EXCEPTION_ROWS);
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  const visible = rows.filter((r) => !resolved[r.id]);

  return (
    <div className="space-y-3">
      {visible.map((r) => (
        <Card key={r.id} className="!p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-extrabold text-on-surface">Order #{r.id}</p>
                <Badge tone={severityTone(r.severity)}>{r.severity}</Badge>
              </div>
              <p className="text-xs text-outline mt-0.5">
                {r.type} · {r.category}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            <InfoChip k="Professional" v={r.professional} />
            <InfoChip k="Category" v={r.category} />
            <InfoChip k="Exception Type" v={r.type} />
            <InfoChip k="Triggered" v={r.trigger} tone="text-amber-600" />
          </div>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <ActionBtn label="Timeline" icon="timeline" tone="neutral" />
            <ActionBtn
              label="Hold"
              icon="pause_circle"
              tone="warn"
              onClick={() => {
                toast(`#${r.id} held pending review`, { duration: 2000 });
              }}
            />
            <ActionBtn
              label="Mark Critical"
              icon="priority_high"
              tone="danger"
              onClick={() => {
                setRows((arr) =>
                  arr.map((x) => (x.id === r.id ? { ...x, severity: "Critical" } : x)),
                );
                toast.success(`#${r.id} marked Critical`, { duration: 2000 });
              }}
            />
            <ActionBtn
              label="Escalate"
              icon="campaign"
              tone="primary"
              onClick={() => {
                setResolved((m) => ({ ...m, [r.id]: true }));
                toast.success(`#${r.id} escalated to senior QA`, { duration: 2200 });
              }}
            />
          </div>
        </Card>
      ))}
      {visible.length === 0 && (
        <p className="text-sm text-on-surface-variant p-8 text-center">No open exceptions.</p>
      )}
      <p className="text-[11px] italic text-outline mt-2">
        QA Desk does not replace professionals directly. Escalation routes to Assignment Engine —
        ownership separation maintained.
      </p>
    </div>
  );
};

/* ---------- QA History ---------- */
type FinalStatus = "Passed First Time" | "Passed After Rework" | "Escalated" | "Failed";
type HistFilter = "all" | "first" | "rework" | "escalated" | "failed";
const HISTORY_QA_ROWS: {
  id: string;
  service: string;
  category: string;
  professional: string;
  reviewer: string;
  reviewedAt: string;
  reworks: number;
  status: FinalStatus;
}[] = [
  {
    id: "JR-0921",
    service: "Logo Design",
    category: "Design",
    professional: "K. Iyer",
    reviewer: "QA · N. Patel",
    reviewedAt: "Yesterday",
    reworks: 0,
    status: "Passed First Time",
  },
  {
    id: "JR-0918",
    service: "Promo Edit",
    category: "Video Editing",
    professional: "A. Bose",
    reviewer: "QA · K. Iyer",
    reviewedAt: "Yesterday",
    reworks: 2,
    status: "Passed After Rework",
  },
  {
    id: "JR-0904",
    service: "Whitepaper",
    category: "Content Writing",
    professional: "R. Sharma",
    reviewer: "QA · N. Patel",
    reviewedAt: "2d ago",
    reworks: 3,
    status: "Escalated",
  },
  {
    id: "JR-0890",
    service: "Pitch Deck",
    category: "Design",
    professional: "M. Kumar",
    reviewer: "QA · K. Iyer",
    reviewedAt: "3d ago",
    reworks: 1,
    status: "Failed",
  },
];
const statusTone = (s: FinalStatus) =>
  s === "Passed First Time"
    ? "bg-emerald-50 text-emerald-700"
    : s === "Passed After Rework"
      ? "bg-primary-container/10 text-primary-container"
      : s === "Escalated"
        ? "bg-amber-50 text-amber-700"
        : "bg-rose-50 text-rose-700";

type QAHistoryRow = (typeof HISTORY_QA_ROWS)[number];

const QAHistoryDetailOverlay = ({ row, onClose }: { row: QAHistoryRow; onClose: () => void }) => (
  <div
    className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-6"
    onClick={onClose}
  >
    <div
      className="bg-surface w-full md:max-w-3xl md:rounded-2xl rounded-none border border-outline-variant/40 shadow-2xl overflow-hidden max-h-full flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3 p-4 border-b border-surface-container-high">
        <div>
          <p className="text-sm font-extrabold text-on-surface">QA Detail · Order #{row.id}</p>
          <p className="text-xs text-outline mt-0.5">
            {row.service} · {row.category}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={statusTone(row.status)}>{row.status}</Badge>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-outline hover:text-on-surface hover:bg-surface-container"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <Detail k="Professional" v={row.professional} />
          <Detail k="QA Reviewer" v={row.reviewer} />
          <Detail k="Reviewed" v={row.reviewedAt} />
          <Detail k="Reworks" v={String(row.reworks)} />
        </div>
        <Card>
          <p className="text-sm font-bold mb-2">Internal QA Notes</p>
          <p className="text-xs text-on-surface-variant">
            Submission reviewed against client brief and quality config.{" "}
            {row.reworks > 0
              ? `Returned ${row.reworks} time(s) before final decision.`
              : "Cleared on first review."}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-bold mb-2">Professional Feedback Sent</p>
          <p className="text-xs text-on-surface-variant">
            Decision and reasoning shared with the professional through Orders Desk timeline.
          </p>
        </Card>
        <Card>
          <p className="text-sm font-bold mb-2">Review Timeline</p>
          <ul className="space-y-2 text-xs">
            <li className="flex gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
              <span className="text-outline w-24">Submitted</span>
              <span>Professional submitted deliverables</span>
            </li>
            {row.reworks > 0 && (
              <li className="flex gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="text-outline w-24">Rework</span>
                <span>{row.reworks} rework cycle(s) completed</span>
              </li>
            )}
            <li className="flex gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              <span className="text-outline w-24">Final</span>
              <span>
                {row.status} by {row.reviewer} · {row.reviewedAt}
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  </div>
);

const QAHistoryView = () => {
  const [filter, setFilter] = useState<HistFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const rows = HISTORY_QA_ROWS.filter((r) => {
    if (filter === "all") return true;
    if (filter === "first") return r.status === "Passed First Time";
    if (filter === "rework") return r.status === "Passed After Rework";
    if (filter === "escalated") return r.status === "Escalated";
    return r.status === "Failed";
  });
  const open = HISTORY_QA_ROWS.find((r) => r.id === openId) || null;
  return (
    <div className="space-y-3">
      <SortDropdown<HistFilter>
        value={filter}
        onChange={setFilter}
        options={[
          { key: "all", label: "All", count: HISTORY_QA_ROWS.length },
          {
            key: "first",
            label: "Passed First Time",
            count: HISTORY_QA_ROWS.filter((r) => r.status === "Passed First Time").length,
          },
          {
            key: "rework",
            label: "Passed After Rework",
            count: HISTORY_QA_ROWS.filter((r) => r.status === "Passed After Rework").length,
          },
          {
            key: "escalated",
            label: "Escalated",
            count: HISTORY_QA_ROWS.filter((r) => r.status === "Escalated").length,
          },
          {
            key: "failed",
            label: "Failed",
            count: HISTORY_QA_ROWS.filter((r) => r.status === "Failed").length,
          },
        ]}
      />
      {rows.map((r) => (
        <Card key={r.id} className="!p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-extrabold text-on-surface">Order #{r.id}</p>
                <Badge tone={statusTone(r.status)}>{r.status}</Badge>
              </div>
              <p className="text-xs text-outline mt-0.5">
                {r.service} · {r.category}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            <InfoChip k="Professional" v={r.professional} />
            <InfoChip k="QA Reviewer" v={r.reviewer} />
            <InfoChip k="Reviewed" v={r.reviewedAt} />
            <InfoChip k="Reworks" v={String(r.reworks)} />
          </div>
          <div className="mt-3 flex justify-end">
            <ActionBtn
              label="View Details"
              icon="visibility"
              tone="primary"
              onClick={() => setOpenId(r.id)}
            />
          </div>
        </Card>
      ))}
      <p className="text-[11px] italic text-outline">
        Permanent QA archive. Detail view exposes review history, internal notes, professional
        feedback, attachments and full timeline.
      </p>
      {open && <QAHistoryDetailOverlay row={open} onClose={() => setOpenId(null)} />}
    </div>
  );
};
/* ---------- Main Section ---------- */
export const QASection = () => {
  const [view, setView] = useState<QAKey>("pending");
  return (
    <div className="space-y-6">
      <SectionHeader
        title="QA Desk"
        subtitle="Quality verification, rework, exceptions & analytics. Quality Operations only."
      />

      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-2">
        {QA_NAV.map((n) => {
          const on = view === n.key;
          return (
            <button
              key={n.key}
              onClick={() => setView(n.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
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

      {view === "pending" && <PendingVerificationView />}
      {view === "rework" && <RewordTrackerView />}
      {view === "exceptions" && <QualityExceptionsView />}
      {view === "history" && <QAHistoryView />}
    </div>
  );
};

export default QASection;
