import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@jobrio/ui/design-system";
import { cn } from "@jobrio/utils/utils";
import AuditListPage, {
  AuditListTab,
  AuditSortOption,
} from "@admin/features/admin-dashboard/components/AuditListPage";
import { Card } from "@admin/features/admin-dashboard/components/sections";
import {
  Badge,
  Detail,
  SectionTitle,
  WFShell,
} from "@admin/features/admin-dashboard/components/sections-shared";

/* ============================================================
 * 2. WORKFORCE CONTROL (lifecycle-based)
 *    Stage 1: Applications  · review incoming
 *    Stage 2: Create & Assign · trial lifecycle
 *    Stage 3: Review & Decide · hiring decisions
 * ============================================================ */

type WFTab = "applications" | "assign" | "decide";

type AppStatus = "new" | "review" | "approved" | "info" | "rejected";

const APPLICATIONS: {
  id: string;
  name: string;
  role: string;
  status: AppStatus;
  when: string;
  category: string;
  skills: string[];
  portfolio: string;
  notes: string;
  trial: "Trial 1" | "Trial 2" | "Trial 3";
}[] = [
  {
    id: "JR-PR-104201",
    name: "Riya Sharma",
    role: "UI/UX Designer",
    status: "new",
    when: "5m ago",
    category: "Design",
    skills: ["Figma", "Webflow"],
    portfolio: "riya.design",
    notes: "Strong product portfolio.",
    trial: "Trial 1",
  },
  {
    id: "JR-PR-104198",
    name: "Aman Gupta",
    role: "Content Writer",
    status: "review",
    when: "2h ago",
    category: "Content",
    skills: ["SEO", "Editing"],
    portfolio: "amanwrites.co",
    notes: "Awaiting sample re-upload.",
    trial: "Trial 2",
  },
  {
    id: "JR-PR-104192",
    name: "Manish Kumar",
    role: "Mobile Developer",
    status: "approved",
    when: "1d ago",
    category: "Development",
    skills: ["Flutter", "Swift"],
    portfolio: "github.com/mk",
    notes: "Approved · push to trial.",
    trial: "Trial 1",
  },
  {
    id: "JR-PR-104188",
    name: "Neha Patel",
    role: "Brand Strategist",
    status: "rejected",
    when: "2d ago",
    category: "Design",
    skills: ["Brand", "Logo"],
    portfolio: "—",
    notes: "Portfolio insufficient.",
    trial: "Trial 2",
  },
  {
    id: "JR-PR-104210",
    name: "Sara Ahmed",
    role: "Illustrator",
    status: "info",
    when: "4h ago",
    category: "Design",
    skills: ["Procreate"],
    portfolio: "sara.art",
    notes: "Requested govt ID re-upload.",
    trial: "Trial 1",
  },
];

type TrialStage = "Trial 1" | "Trial 2" | "Trial 3";
type AssignFilter = "assign" | "assigned";
type AssignedStatus = "Assigned" | "In Progress" | "Submitted" | "Overdue";

const ASSIGN_QUEUE: {
  id: string;
  name: string;
  category: string;
  stage: TrialStage;
  templates: string[];
}[] = [
  {
    id: "JR-PR-104192",
    name: "Manish Kumar",
    category: "Development",
    stage: "Trial 1",
    templates: ["Dev Trial 1A", "Dev Trial 1B"],
  },
  {
    id: "JR-PR-104201",
    name: "Riya Sharma",
    category: "Design",
    stage: "Trial 1",
    templates: ["Design Trial 1A"],
  },
  {
    id: "JR-PR-104176",
    name: "Vikram Joshi",
    category: "Development",
    stage: "Trial 2",
    templates: ["Dev Trial 2A"],
  },
];

const ASSIGNED_TRIALS: {
  id: string;
  name: string;
  trial: TrialStage;
  template: string;
  due: string;
  status: AssignedStatus;
}[] = [
  {
    id: "JR-PR-003011",
    name: "Ishaan Verma",
    trial: "Trial 1",
    template: "Design Trial 1A",
    due: "in 2d",
    status: "In Progress",
  },
  {
    id: "JR-PR-003012",
    name: "Ananya Bose",
    trial: "Trial 2",
    template: "Writing Trial 2B",
    due: "Today",
    status: "Submitted",
  },
  {
    id: "JR-PR-003013",
    name: "Rohan Khanna",
    trial: "Trial 3",
    template: "Video Trial 3A",
    due: "Overdue 1d",
    status: "Overdue",
  },
  {
    id: "JR-PR-104210",
    name: "Sara Ahmed",
    trial: "Trial 1",
    template: "Design Trial 1B",
    due: "in 4d",
    status: "Assigned",
  },
];

type DecideFilter = "new" | "hired" | "rejected" | "waitlist";

const REVIEW_QUEUE: {
  id: string;
  name: string;
  trial: TrialStage;
  template: string;
  submittedOn: string;
  score?: number;
  qaNotes?: string;
  decision: DecideFilter;
}[] = [
  {
    id: "JR-PR-003012",
    name: "Ananya Bose",
    trial: "Trial 2",
    template: "Writing Trial 2B",
    submittedOn: "Today",
    score: undefined,
    qaNotes: undefined,
    decision: "new",
  },
  {
    id: "JR-PR-104192",
    name: "Manish Kumar",
    trial: "Trial 1",
    template: "Dev Trial 1A",
    submittedOn: "Yesterday",
    score: 88,
    qaNotes: "Strong code quality.",
    decision: "new",
  },
  {
    id: "JR-PR-104201",
    name: "Riya Sharma",
    trial: "Trial 3",
    template: "Design Trial 3B",
    submittedOn: "2d ago",
    score: 91,
    qaNotes: "Ready for hiring decision.",
    decision: "new",
  },
  {
    id: "JR-PR-002210",
    name: "Aman Gupta (prev)",
    trial: "Trial 3",
    template: "Writing Trial 3A",
    submittedOn: "5d ago",
    score: 84,
    qaNotes: "Hired Tier: Premium.",
    decision: "hired",
  },
  {
    id: "JR-PR-104188",
    name: "Neha Patel",
    trial: "Trial 2",
    template: "Design Trial 2A",
    submittedOn: "6d ago",
    score: 52,
    qaNotes: "Did not meet bar.",
    decision: "rejected",
  },
  {
    id: "JR-PR-104215",
    name: "Karthik Iyer",
    trial: "Trial 3",
    template: "Design Trial 3A",
    submittedOn: "3d ago",
    score: 74,
    qaNotes: "Solid, but no current need — waitlisted.",
    decision: "waitlist",
  },
];

const STAGE_TINT: Record<TrialStage, string> = {
  "Trial 1": "bg-primary-container/10 text-primary-container",
  "Trial 2": "bg-violet-50 text-violet-700",
  "Trial 3": "bg-amber-50 text-amber-700",
};

const ASSIGNED_TONE: Record<AssignedStatus, string> = {
  Assigned: "bg-primary-container/10 text-primary-container",
  "In Progress": "bg-amber-50 text-amber-700",
  Submitted: "bg-violet-50 text-violet-700",
  Overdue: "bg-rose-50 text-rose-700",
};

/* ---------- Workforce overlays (Application / Assign / Review+Snapshot) ---------- */

const Pill2 = ({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) => {
  const c =
    tone === "good"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "warn"
        ? "bg-amber-50 text-amber-700"
        : tone === "bad"
          ? "bg-rose-50 text-rose-700"
          : "bg-slate-100 text-slate-700";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
        c,
      )}
    >
      {label}
    </span>
  );
};

const ApplicationDetailPanel = ({
  a,
  onClose,
  onDecision,
  onProceedToAssign,
}: {
  a: (typeof APPLICATIONS)[number];
  onClose: () => void;
  onDecision: (id: string, status: AppStatus) => void;
  onProceedToAssign: () => void;
}) => (
  <WFShell
    subtitle={`Application Review · ${a.id}`}
    title={a.name}
    badge={
      <Badge
        tone={
          a.status === "approved"
            ? "bg-emerald-50 text-emerald-700"
            : a.status === "rejected"
              ? "bg-rose-50 text-rose-700"
              : a.status === "info"
                ? "bg-amber-50 text-amber-700"
                : "bg-primary-container/10 text-primary-container"
        }
      >
        {a.status}
      </Badge>
    }
    onClose={onClose}
  >
    <Card>
      <SectionTitle title="Applicant Identity" hint="From signup flow — must match legally" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Detail k="Full Name" v={a.name} />
        <Detail k="DOB" v="1998-07-22" />
        <Detail k="Age" v="26 yrs" />
        <Detail k="Gender" v="Female" />
        <Detail k="Email" v={`${a.name.split(" ")[0].toLowerCase()}@jobrio.pro`} />
        <Detail k="Phone" v="+91 98xxx xxxx" />
        <Detail k="Country" v="India" />
        <Detail k="City" v="Mumbai" />
      </div>
    </Card>

    <Card>
      <SectionTitle title="Legal & Verification" hint="ID-matched, 18+ enforced" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Detail k="Email Verified" v="Yes" />
        <Detail k="Phone Verified" v="Yes" />
        <Detail k="Govt. ID" v="Aadhaar · ****-1142" />
        <Detail k="Name on ID" v={a.name} />
        <Detail k="DOB on ID" v="1998-07-22" />
        <Detail k="18+" v="Yes" />
        <Detail k="Match Status" v="All fields match" />
        <Detail k="Risk Flags" v="None" />
      </div>
    </Card>

    <Card>
      <SectionTitle title="Application Details" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Detail k="Applied Role" v={a.role} />
        <Detail k="Category" v={a.category} />
        <Detail k="Sub-category" v={a.skills[0] ?? "—"} />
        <Detail k="Skills" v={a.skills.join(", ")} />
        <Detail k="Experience" v="3 yrs" />
        <Detail k="Application Attempt" v="#1" />
        <Detail k="Applied On" v={a.when} />
        <Detail k="Portfolio" v={a.portfolio} />
      </div>
    </Card>

    <Card>
      <SectionTitle title="Portfolio Review" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Detail k="Samples" v="6" />
        <Detail k="Quality" v="Above bar" />
        <Detail k="Relevance" v="Strong" />
        <Detail k="Plagiarism" v="Clean" />
      </div>
      <p className="text-xs text-on-surface-variant mt-3">
        <span className="font-bold text-on-surface">Notes: </span>
        {a.notes}
      </p>
    </Card>

    <Card>
      <SectionTitle
        title="Decision"
        hint={
          a.status === "approved"
            ? "Application already approved — proceed to trial creation"
            : "Review now and record action"
        }
      />
      <div className="flex flex-wrap gap-2">
        {a.status === "approved" ? (
          <Button
            variant="primary"
            size="lg"
            className="px-3.5 py-1.5 rounded-full text-xs font-bold hover:opacity-90"
            onClick={onProceedToAssign}
          >
            Proceed to Create &amp; Assign Trial
          </Button>
        ) : (
          <>
            <button
              onClick={() => onDecision(a.id, "approved")}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white"
            >
              Approve Application
            </button>
            <button
              onClick={() => onDecision(a.id, "rejected")}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
            >
              Reject Application
            </button>
            <button
              onClick={() => onDecision(a.id, "info")}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
            >
              Request More Information
            </button>
          </>
        )}
      </div>
    </Card>
  </WFShell>
);

const AssignDetailPanel = ({
  c,
  onClose,
  onAssign,
}: {
  c: (typeof ASSIGN_QUEUE)[number];
  onClose: () => void;
  onAssign: (id: string, due: string, template: string, instructions: string) => void;
}) => {
  const [template, setTemplate] = useState(c.templates[0] ?? "");
  const [due, setDue] = useState("");
  const [instructions, setInstructions] = useState("");
  return (
    <WFShell
      subtitle={`Create & Assign · ${c.id}`}
      title={`${c.name} · ${c.stage}`}
      badge={<Badge tone={STAGE_TINT[c.stage]}>{c.stage}</Badge>}
      onClose={onClose}
    >
      {/* TOP — candidate / application details */}
      <Card>
        <SectionTitle title="Candidate Snapshot" hint="Help craft the best trial" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Detail k="Name" v={c.name} />
          <Detail k="User ID" v={c.id} />
          <Detail k="Category" v={c.category} />
          <Detail k="Sub-category" v={c.templates[0]?.split(" · ")[0] ?? c.category} />
          <Detail k="Trial Attempt" v={c.stage} />
          <Detail k="Application #" v="1" />
          <Detail k="Skills" v="Figma, Webflow" />
          <Detail k="Experience" v="3 yrs" />
        </div>
      </Card>

      {/* BOTTOM — creation panel (same for every candidate) */}
      <Card>
        <SectionTitle title="Trial Creation Panel" hint="Templates · Draft · Create · Assign" />
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-outline mb-2">
              Saved Templates · Library
            </p>
            <div className="max-h-40 overflow-y-auto rounded-xl border border-outline-variant/30 p-2 bg-surface-container-low/40">
              <div className="flex flex-wrap gap-1.5">
                {[
                  ...c.templates,
                  "Design Trial 1A · Logo Brief",
                  "Design Trial 1B · Social Pack",
                  "Design Trial 2A · Landing Page",
                  "Design Trial 2B · Brand Identity",
                  "Design Trial 3A · Full Product Screen",
                  "Writing Trial 1A · Blog 600w",
                  "Writing Trial 2A · SEO Long-form",
                  "Writing Trial 3A · Case Study",
                  "Dev Trial 1A · UI Component",
                  "Dev Trial 2A · API Endpoint",
                  "Dev Trial 3A · Full Mini-App",
                  "Video Trial 1A · 30s Reel",
                  "Video Trial 2A · YT Edit 3min",
                  "Video Trial 3A · Brand Spot 60s",
                  "QA Trial · Bug Report Drill",
                ].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors",
                      template === t
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:border-primary/40",
                    )}
                  >
                    {t}
                  </button>
                ))}
                <button
                  type="button"
                  disabled
                  title="Template composer is not wired in this build."
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-dashed border-outline-variant/60 text-outline bg-surface-container cursor-not-allowed"
                >
                  + New Template · Coming Soon
                </button>
                <button
                  type="button"
                  disabled
                  title="Saved drafts are not wired in this build."
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-outline-variant/40 text-outline bg-surface-container cursor-not-allowed"
                >
                  Saved Drafts · Coming Soon
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                Due Date
              </span>
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                Selected Template
              </span>
              <input
                value={template}
                readOnly
                className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
              Instructions to Candidate
            </span>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm"
              placeholder="Brief, deliverables, evaluation criteria…"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              disabled
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-surface-container-low border border-outline-variant/40 text-outline/60 cursor-not-allowed"
            >
              Save Draft · Coming Soon
            </button>
            <button
              disabled
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-surface-container-low border border-outline-variant/40 text-outline/60 cursor-not-allowed"
            >
              Save as Template · Coming Soon
            </button>
            <Button
              variant="primary"
              size="lg"
              className="ml-auto px-4 py-2 rounded-full text-xs font-extrabold hover:opacity-90"
              onClick={() => {
                if (!due) {
                  toast.error("Pick a due date before assigning.");
                  return;
                }
                onAssign(c.id, due, template, instructions);
              }}
            >
              Assign Now
            </Button>
          </div>
        </div>
      </Card>
    </WFShell>
  );
};

/* Hiring Snapshot — workforce demand vs supply decision canvas */
const HiringSnapshot = ({ r }: { r: (typeof REVIEW_QUEUE)[number] }) => (
  <div className="space-y-4">
    <Card>
      <SectionTitle title="Applicant Context" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Detail k="Applicant" v={r.name} />
        <Detail k="Applicant ID" v={r.id} />
        <Detail k="Application Date" v="2025-04-15" />
        <Detail k="Applied Category" v="Design" />
        <Detail k="Sub-category" v="UI/UX" />
        <Detail k="Skills" v="Figma, Webflow" />
        <Detail k="Experience" v="Intermediate" />
        <Detail k="Portfolio" v="Yes" />
      </div>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <SectionTitle title="Demand Snapshot" hint="Current month" />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Detail k="Orders Received" v="412" />
          <Detail k="Orders Approved" v="368" />
          <Detail k="Orders Completed" v="298" />
          <Detail k="Orders Cancelled" v="14" />
          <Detail k="Demand Growth" v="+18%" />
          <Detail k="Stable Indicator" v="Yes" />
        </div>
        <div className="mt-3">
          <Pill2 tone="good" label="🟢 Growing" />
        </div>
      </Card>

      <Card>
        <SectionTitle title="Supply Snapshot" hint="Workforce availability" />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Detail k="Total Professionals" v="4,270" />
          <Detail k="Active" v="3,108" />
          <Detail k="Available" v="942" />
          <Detail k="Busy" v="2,166" />
          <Detail k="Toggle OFF" v="184" />
          <Detail k="Available %" v="30%" />
        </div>
        <div className="mt-3">
          <Pill2 tone="warn" label="🟡 Limited" />
        </div>
      </Card>

      <Card>
        <SectionTitle title="Capacity Snapshot" />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Detail k="Capacity (max)" v="520 orders" />
          <Detail k="Used %" v="78%" />
          <Detail k="Remaining %" v="22%" />
          <Detail k="Trend" v="Increasing" />
        </div>
        <div className="mt-3">
          <Pill2 tone="warn" label="🟡 Near Limit" />
        </div>
      </Card>

      <Card>
        <SectionTitle title="Assignment Health" hint="Last 30 days" />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Detail k="Success Rate" v="92%" />
          <Detail k="Failure Rate" v="8%" />
          <Detail k="Avg Assign Time" v="3m 12s" />
          <Detail k="Unassigned" v="18" />
          <Detail k="Delayed" v="6" />
          <Detail k="No-Pro Events" v="3" />
        </div>
        <div className="mt-3">
          <Pill2 tone="good" label="🟢 Healthy" />
        </div>
      </Card>
    </div>

    <Card>
      <SectionTitle title="Quality Distribution" hint="Workforce by tier" />
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl border border-outline-variant/30 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Standard</p>
          <p className="text-on-surface font-bold">Total: 2,180</p>
          <p className="text-on-surface-variant text-xs">Active: 1,612</p>
        </div>
        <div className="rounded-xl border border-outline-variant/30 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Premium</p>
          <p className="text-on-surface font-bold">Total: 1,420</p>
          <p className="text-on-surface-variant text-xs">Active: 1,068</p>
        </div>
        <div className="rounded-xl border border-outline-variant/30 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Elite</p>
          <p className="text-on-surface font-bold">Total: 670</p>
          <p className="text-on-surface-variant text-xs">Active: 428</p>
        </div>
      </div>
      <div className="mt-3">
        <Pill2 tone="warn" label="Elite Tier Shortage Detected" />
      </div>
    </Card>

    <Card>
      <SectionTitle title="Category Health" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        <Detail k="Completion" v="94%" />
        <Detail k="Cancellation" v="3.4%" />
        <Detail k="QA Rejection" v="6%" />
        <Detail k="Rework" v="4%" />
        <Detail k="CSAT" v="4.6/5" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm font-extrabold">Score: 78</span>
        <Pill2 tone="good" label="Healthy" />
      </div>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <SectionTitle title="Shortage Detection" />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Detail k="Workforce Shortage" v="No" />
          <Detail k="Quality Shortage" v="Yes (Elite)" />
          <Detail k="Capacity Shortage" v="No" />
          <Detail k="Availability Shortage" v="Yes" />
          <Detail k="Assignment Risk" v="Low" />
        </div>
      </Card>
      <Card>
        <SectionTitle title="Forecast Snapshot" />
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Detail k="Next 30d Orders" v="450" />
          <Detail k="Next 60d Orders" v="980" />
          <Detail k="Next 90d Orders" v="1,540" />
        </div>
        <div className="mt-3">
          <Pill2 tone="warn" label="🟡 Prepare Hiring" />
        </div>
      </Card>
    </div>

    <Card>
      <SectionTitle title="Recommendation Engine" />
      <div className="flex items-center gap-3 flex-wrap">
        <span className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold">
          System Recommendation: HIRE
        </span>
        <span className="text-xs text-on-surface-variant">
          Demand increasing · Available pros low · Elite shortage detected.
        </span>
      </div>
    </Card>

    <Card>
      <SectionTitle title="Workforce Impact (if hired)" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        <Detail k="New Total" v="4,271" />
        <Detail k="New Available" v="943" />
        <Detail k="New Capacity" v="522" />
        <Detail k="New Utilization" v="77.5%" />
        <Detail k="New Quality Mix" v="S/P/E +1 Elite" />
      </div>
    </Card>

    <Card>
      <SectionTitle title="Final Decision" />
      <div className="flex flex-wrap gap-3 items-center">
        <Pill2 tone="warn" label="Category: Watchlist" />
        <Pill2 tone="bad" label="Hiring Priority: High" />
        <Pill2 tone="good" label="✅ Hire Recommended" />
      </div>
    </Card>
  </div>
);

const ReviewDetailPanel = ({
  r,
  onClose,
  onDecision,
  onAdvanceTrial,
}: {
  r: (typeof REVIEW_QUEUE)[number];
  onClose: () => void;
  onDecision: (id: string, decision: DecideFilter) => void;
  onAdvanceTrial: (id: string, action: "advance" | "rework" | "reject") => void;
}) => {
  const trials = [
    {
      trial: "Trial 1" as TrialStage,
      template: "Foundation Trial",
      score: 86,
      qa: "Strong fundamentals.",
      submitted: "2025-04-18",
      decided: "Approved · 2025-04-20",
    },
    {
      trial: "Trial 2" as TrialStage,
      template: "Intermediate Trial",
      score: 89,
      qa: "Good execution.",
      submitted: "2025-04-26",
      decided: "Approved · 2025-04-28",
    },
    {
      trial: "Trial 3" as TrialStage,
      template: r.template,
      score: r.score ?? 91,
      qa: r.qaNotes ?? "Ready for hiring decision.",
      submitted: r.submittedOn,
      decided:
        r.decision === "hired" ? "Hired" : r.decision === "rejected" ? "Rejected" : "Pending",
    },
  ];
  return (
    <WFShell
      subtitle={`Review & Decide · ${r.id}`}
      title={`${r.name} · ${r.trial}`}
      badge={<Badge tone={STAGE_TINT[r.trial]}>{r.trial}</Badge>}
      onClose={onClose}
    >
      <Card>
        <SectionTitle title="Profile" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Detail k="Name" v={r.name} />
          <Detail k="User ID" v={r.id} />
          <Detail k="Current Stage" v={r.trial} />
          <Detail k="Status" v={r.decision} />
        </div>
      </Card>

      <Card>
        <SectionTitle title="Trial Performance · Full Details" hint="All three trials" />
        <div className="space-y-3">
          {trials.map((t) => (
            <div key={t.trial} className="rounded-xl border border-outline-variant/30 p-3">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
                    {t.trial}
                  </p>
                  <p className="text-sm font-extrabold text-on-surface">{t.template}</p>
                </div>
                <Badge tone={STAGE_TINT[t.trial]}>{t.trial}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <Detail k="Score" v={String(t.score)} />
                <Detail k="QA Notes" v={t.qa} />
                <Detail k="Submitted" v={t.submitted} />
                <Detail k="Decision" v={t.decided} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {r.trial === "Trial 3" ? (
        <>
          <div>
            <SectionTitle
              title="Hiring Snapshot"
              hint="Workforce demand vs supply decision canvas — final trial only"
            />
            <HiringSnapshot r={r} />
          </div>

          <Card>
            <SectionTitle title="Hiring Decision" hint="Final trial — hire, reject, or waitlist" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onDecision(r.id, "hired")}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white"
              >
                Hire to Workforce
              </button>
              <button
                onClick={() => onDecision(r.id, "rejected")}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
              >
                Reject Candidate
              </button>
              <button
                onClick={() => onDecision(r.id, "waitlist")}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
              >
                Place on Waitlist
              </button>
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <SectionTitle
            title="Trial Review Decision"
            hint={`${r.trial} · approve to advance, request rework, or reject`}
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onAdvanceTrial(r.id, "advance")}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white"
            >
              Approve for Next Trial
            </button>
            <button
              onClick={() => onAdvanceTrial(r.id, "rework")}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
            >
              Request Rework / Feedback
            </button>
            <button
              onClick={() => onAdvanceTrial(r.id, "reject")}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
            >
              Reject Candidate
            </button>
          </div>
          <p className="text-[11px] text-outline mt-3">
            Hiring Snapshot &amp; final hiring controls appear only on{" "}
            <span className="font-bold text-on-surface">Trial 3</span>.
          </p>
        </Card>
      )}
    </WFShell>
  );
};

export const WorkforceSection = () => {
  const [tab, setTab] = useState<WFTab>("applications");
  const [apps, setApps] = useState(APPLICATIONS);
  const [reviews, setReviews] = useState(REVIEW_QUEUE);
  const [appFilter, setAppFilter] = useState<"all" | AppStatus>("new");
  const [assignFilter, setAssignFilter] = useState<AssignFilter>("assign");
  const [decideFilter, setDecideFilter] = useState<DecideFilter>("new");
  const [openApp, setOpenApp] = useState<string | null>(null);
  const [openAssign, setOpenAssign] = useState<string | null>(null);
  const [openReview, setOpenReview] = useState<string | null>(null);
  const [openAssigned, setOpenAssigned] = useState<(typeof ASSIGNED_TRIALS)[number] | null>(null);

  const decideApplication = (id: string, status: AppStatus) => {
    setApps((arr) => arr.map((a) => (a.id === id ? { ...a, status } : a)));
    setOpenApp(null);
    toast.success(
      status === "approved"
        ? `Application ${id} approved`
        : status === "rejected"
          ? `Application ${id} rejected`
          : `More information requested for ${id}`,
      { duration: 2200 },
    );
  };

  const decideReview = (id: string, decision: DecideFilter) => {
    setReviews((arr) => arr.map((r) => (r.id === id ? { ...r, decision } : r)));
    setOpenReview(null);
    toast.success(
      decision === "hired"
        ? `${id} hired to workforce`
        : decision === "rejected"
          ? `${id} rejected`
          : `${id} placed on waitlist`,
      { duration: 2200 },
    );
  };

  const NEXT_TRIAL: Record<TrialStage, TrialStage> = {
    "Trial 1": "Trial 2",
    "Trial 2": "Trial 3",
    "Trial 3": "Trial 3",
  };

  const advanceTrial = (id: string, action: "advance" | "rework" | "reject") => {
    if (action === "reject") {
      setReviews((arr) => arr.map((r) => (r.id === id ? { ...r, decision: "rejected" } : r)));
      toast.success(`${id} rejected`, { duration: 2200 });
      setOpenReview(null);
      return;
    }
    if (action === "rework") {
      toast.success(`Rework requested for ${id}`, {
        description: "Candidate has been notified with feedback.",
        duration: 2200,
      });
      setOpenReview(null);
      return;
    }
    setReviews((arr) => arr.map((r) => (r.id === id ? { ...r, trial: NEXT_TRIAL[r.trial] } : r)));
    toast.success(`${id} advanced to next trial`, { duration: 2200 });
    setOpenReview(null);
  };

  const appCounts = useMemo(
    () => ({
      all: apps.length,
      new: apps.filter((a) => a.status === "new").length,
      approved: apps.filter((a) => a.status === "approved").length,
      info: apps.filter((a) => a.status === "info").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
      review: apps.filter((a) => a.status === "review").length,
    }),
    [apps],
  );

  const visibleApps = appFilter === "all" ? apps : apps.filter((a) => a.status === appFilter);
  const opened = apps.find((a) => a.id === openApp);
  const openedAssign = ASSIGN_QUEUE.find((c) => c.id === openAssign);
  const openedReview = reviews.find((r) => r.id === openReview);
  const visibleReviews = reviews.filter((r) => r.decision === decideFilter);

  const tabs: AuditListTab[] = [
    { key: "applications", label: "Applications", icon: "assignment_ind" },
    { key: "assign", label: "Create & Assign", icon: "group_add" },
    { key: "decide", label: "Review & Decide", icon: "fact_check" },
  ];

  const SORT_OPTIONS_BY_TAB: Record<WFTab, AuditSortOption[]> = {
    applications: [
      { key: "all", label: "All" },
      { key: "new", label: "New" },
      { key: "approved", label: "Approved" },
      { key: "info", label: "Request More Info" },
      { key: "rejected", label: "Rejected" },
    ],
    assign: [
      { key: "assign", label: "Assign Now" },
      { key: "assigned", label: "Assigned" },
    ],
    decide: [
      { key: "new", label: "New Review Request" },
      { key: "hired", label: "Hired" },
      { key: "rejected", label: "Rejected" },
      { key: "waitlist", label: "Waitlist" },
    ],
  };

  const sortValueByTab: Record<WFTab, string> = {
    applications: appFilter,
    assign: assignFilter,
    decide: decideFilter,
  };

  const countByTab: Record<WFTab, number> = {
    applications: visibleApps.length,
    assign: assignFilter === "assign" ? ASSIGN_QUEUE.length : ASSIGNED_TRIALS.length,
    decide: visibleReviews.length,
  };

  return (
    <AuditListPage
      title="Workforce Control"
      description="Lifecycle-based hiring — Applications → Create & Assign → Review & Decide."
      tabs={tabs}
      activeTab={tab}
      onTabChange={(k) => setTab(k as WFTab)}
      sortOptions={SORT_OPTIONS_BY_TAB[tab]}
      sortValue={sortValueByTab[tab]}
      onSortChange={(k) => {
        if (tab === "applications") setAppFilter(k as "all" | AppStatus);
        else if (tab === "assign") setAssignFilter(k as AssignFilter);
        else setDecideFilter(k as DecideFilter);
      }}
      count={countByTab[tab]}
    >
      {/* STAGE 1 — Applications */}
      {tab === "applications" && (
        <div className="space-y-4">
          <Card className="!p-0 overflow-hidden">
            <ul className="divide-y divide-surface-container-high/60">
              {visibleApps.map((a) => {
                const ctaLabel =
                  a.status === "new"
                    ? "Review Now"
                    : a.status === "review"
                      ? "Review now"
                      : a.status === "approved"
                        ? "View Details"
                        : a.status === "info"
                          ? "View Details"
                          : "View Details";
                const ctaTone =
                  a.status === "new" || a.status === "review"
                    ? "bg-primary text-on-primary hover:opacity-90"
                    : "bg-surface-container-low border border-outline-variant/40 text-on-surface hover:bg-surface-container";
                return (
                  <li key={a.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center font-bold text-xs">
                      {a.name
                        .split(" ")
                        .map((s) => s[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{a.name}</p>
                      <p className="text-[11px] text-outline font-mono truncate">
                        {a.id} · {a.role} · {a.when}
                      </p>
                    </div>
                    <Badge tone={STAGE_TINT[a.trial]}>{a.trial}</Badge>
                    <Badge
                      tone={
                        a.status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : a.status === "rejected"
                            ? "bg-rose-50 text-rose-700"
                            : a.status === "info"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-primary-container/10 text-primary-container"
                      }
                    >
                      {a.status}
                    </Badge>
                    <button
                      onClick={() => setOpenApp(a.id)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors",
                        ctaTone,
                      )}
                    >
                      {ctaLabel}
                    </button>
                  </li>
                );
              })}
              {visibleApps.length === 0 && (
                <li className="px-4 py-10 text-center text-xs text-on-surface-variant">
                  No applications in this bucket.
                </li>
              )}
            </ul>
          </Card>
        </div>
      )}

      {/* STAGE 2 — Create & Assign */}
      {tab === "assign" && (
        <div className="space-y-4">
          {assignFilter === "assign" && (
            <div className="space-y-3">
              {ASSIGN_QUEUE.map((c) => (
                <Card key={c.id}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center font-bold text-xs">
                      {c.name
                        .split(" ")
                        .map((s) => s[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold text-on-surface truncate">{c.name}</p>
                      <p className="text-[11px] text-outline font-mono truncate">
                        {c.id} · {c.category}
                      </p>
                    </div>
                    <Badge tone={STAGE_TINT[c.stage]}>{c.stage}</Badge>
                    <button
                      onClick={() => setOpenAssign(c.id)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-on-primary hover:opacity-90 whitespace-nowrap"
                    >
                      Create &amp; Assign Now
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {assignFilter === "assigned" && (
            <Card className="!p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-container-high text-[10px] uppercase tracking-wider text-outline">
                      <th className="text-left font-bold px-4 py-2.5">Candidate</th>
                      <th className="text-left font-bold px-4 py-2.5">Trial</th>
                      <th className="text-left font-bold px-4 py-2.5">Template</th>
                      <th className="text-left font-bold px-4 py-2.5">Due</th>
                      <th className="text-left font-bold px-4 py-2.5">Status</th>
                      <th className="text-right font-bold px-4 py-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/60">
                    {ASSIGNED_TRIALS.map((r) => {
                      const action =
                        r.status === "In Progress"
                          ? {
                              label: "Track Now",
                              tone: "bg-primary text-on-primary hover:opacity-90",
                            }
                          : r.status === "Submitted"
                            ? {
                                label: "Review Now",
                                tone: "bg-primary text-on-primary hover:opacity-90",
                              }
                            : r.status === "Overdue"
                              ? {
                                  label: "Track Now",
                                  tone: "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100",
                                }
                              : {
                                  label: "View Details",
                                  tone: "bg-surface-container-low border border-outline-variant/40 text-on-surface hover:bg-surface-container",
                                };
                      return (
                        <tr key={r.id + r.trial} className="hover:bg-surface-container-low/60">
                          <td className="px-4 py-2.5">
                            <p className="font-bold text-on-surface text-sm">{r.name}</p>
                            <p className="text-[11px] text-outline font-mono">{r.id}</p>
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge tone={STAGE_TINT[r.trial]}>{r.trial}</Badge>
                          </td>
                          <td className="px-4 py-2.5 text-xs">{r.template}</td>
                          <td className="px-4 py-2.5 text-xs text-on-surface-variant">{r.due}</td>
                          <td className="px-4 py-2.5">
                            <Badge tone={ASSIGNED_TONE[r.status]}>{r.status}</Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => setOpenAssigned(r)}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors",
                                action.tone,
                              )}
                            >
                              {action.label}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* STAGE 3 — Review & Decide */}
      {tab === "decide" && (
        <div className="space-y-4">
          <Card className="!p-0 overflow-hidden">
            <ul className="divide-y divide-surface-container-high/60">
              {visibleReviews.map((r) => {
                const isReviewable = r.decision === "new";
                const ctaLabel = isReviewable
                  ? r.trial === "Trial 3"
                    ? "Review & Decide"
                    : "Review Trial"
                  : "View Details";
                const ctaTone = isReviewable
                  ? "bg-primary text-on-primary hover:opacity-90"
                  : "bg-surface-container-low border border-outline-variant/40 text-on-surface hover:bg-surface-container";
                return (
                  <li key={r.id + r.trial} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center font-bold text-xs">
                      {r.name
                        .split(" ")
                        .map((s) => s[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{r.name}</p>
                      <p className="text-[11px] text-outline font-mono truncate">
                        {r.id} · {r.template} · submitted {r.submittedOn}
                      </p>
                    </div>
                    <Badge tone={STAGE_TINT[r.trial]}>{r.trial}</Badge>
                    {typeof r.score === "number" && (
                      <span
                        className={cn(
                          "text-xs font-extrabold",
                          r.score >= 80
                            ? "text-emerald-600"
                            : r.score >= 60
                              ? "text-amber-600"
                              : "text-rose-600",
                        )}
                      >
                        Score {r.score}
                      </span>
                    )}
                    <button
                      onClick={() => setOpenReview(r.id)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors",
                        ctaTone,
                      )}
                    >
                      {ctaLabel}
                    </button>
                  </li>
                );
              })}
              {visibleReviews.length === 0 && (
                <li className="px-4 py-10 text-center text-xs text-on-surface-variant">
                  Nothing here.
                </li>
              )}
            </ul>
          </Card>
        </div>
      )}

      {opened && (
        <ApplicationDetailPanel
          a={opened}
          onClose={() => setOpenApp(null)}
          onDecision={decideApplication}
          onProceedToAssign={() => {
            setOpenApp(null);
            setTab("assign");
            toast.success(`Moved ${opened.name} to Create & Assign Trial`, { duration: 2200 });
          }}
        />
      )}
      {openedAssign && (
        <AssignDetailPanel
          c={openedAssign}
          onClose={() => setOpenAssign(null)}
          onAssign={(id, due) => {
            setOpenAssign(null);
            toast.success(`Trial task assigned to ${openedAssign.name}`, {
              description: `Due ${due}`,
              duration: 2500,
            });
          }}
        />
      )}
      {openedReview && (
        <ReviewDetailPanel
          r={openedReview}
          onClose={() => setOpenReview(null)}
          onDecision={decideReview}
          onAdvanceTrial={advanceTrial}
        />
      )}
      {openAssigned && (
        <WFShell
          subtitle={`Assigned Trial · ${openAssigned.id}`}
          title={`${openAssigned.name} · ${openAssigned.trial}`}
          badge={<Badge tone={ASSIGNED_TONE[openAssigned.status]}>{openAssigned.status}</Badge>}
          onClose={() => setOpenAssigned(null)}
        >
          <Card>
            <SectionTitle title="Assignment Snapshot" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Detail k="Candidate" v={openAssigned.name} />
              <Detail k="User ID" v={openAssigned.id} />
              <Detail k="Trial" v={openAssigned.trial} />
              <Detail k="Template" v={openAssigned.template} />
              <Detail k="Due Date" v={openAssigned.due} />
              <Detail k="Status" v={openAssigned.status} />
            </div>
          </Card>
          <Card>
            <SectionTitle title="Tracking" hint="Live progress" />
            <p className="text-sm text-on-surface-variant">
              Monitor submission, review the deliverable when received, and act on overdue trials
              from here.
            </p>
          </Card>
          <div className="flex flex-wrap gap-2">
            {openAssigned.status === "Overdue" ? (
              <Button
                variant="outline"
                size="lg"
                className="px-3.5 py-1.5 rounded-full text-xs font-bold"
                disabled
                title="Outbound reminder delivery requires the backend notification service."
              >
                Send Reminder · Backend Required
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                className="px-3.5 py-1.5 rounded-full text-xs font-bold"
                disabled
                title="Detailed submission/progress view is not wired in this build."
              >
                {openAssigned.status === "Submitted"
                  ? "Review Submission · Coming Soon"
                  : "Track Progress · Coming Soon"}
              </Button>
            )}
            <button
              type="button"
              disabled
              title="Direct candidate messaging is intentionally unavailable before assignment."
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-surface-container text-outline border border-outline-variant/40 cursor-not-allowed opacity-70"
            >
              Message Candidate · Unavailable
            </button>
          </div>
        </WFShell>
      )}
    </AuditListPage>
  );
};

export default WorkforceSection;
