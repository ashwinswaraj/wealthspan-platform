import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@jobrio/ui/design-system";
import { cn } from "@jobrio/utils/utils";
import { SectionHeader, Card } from "@admin/features/admin-dashboard/components/sections";
import { AEIcon } from "@admin/features/admin-dashboard/components/sections-shared";

/* ============================================================
 * POLICIES — Business & Legal source of truth
 * ============================================================ */

type PolKey =
  | "dashboard"
  | "platform"
  | "marketplace"
  | "workforce"
  | "client"
  | "security"
  | "versions"
  | "acceptance";

type PolStatus = "Published" | "Draft" | "Archived" | "Pending Update";
type PolGroup = "platform" | "marketplace" | "workforce" | "client" | "security";

interface PolicyRow {
  id: string;
  name: string;
  group: PolGroup;
  version: string;
  status: PolStatus;
  effective: string;
  updatedBy: string;
  audience: string;
  summary: string;
  draft?: string;
}

interface PolVersion {
  id: string;
  policyId: string;
  policyName: string;
  version: string;
  publishedAt: string;
  effective: string;
  status: PolStatus;
  updatedBy: string;
  summary: string;
}

interface PolAcceptLog {
  id: string;
  user: string;
  role: string;
  policyName: string;
  version: string;
  acceptedAt: string;
  ip: string;
  device: string;
  method: string;
}

const POL_NAV: { key: PolKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "platform", label: "Platform Policies", icon: "public" },
  { key: "marketplace", label: "Marketplace Policies", icon: "storefront" },
  { key: "workforce", label: "Workforce Policies", icon: "engineering" },
  { key: "client", label: "Client Policies", icon: "groups" },
  { key: "security", label: "Security & Compliance", icon: "shield" },
  { key: "versions", label: "Policy Versions", icon: "history" },
  { key: "acceptance", label: "Acceptance Logs", icon: "fact_check" },
];

const DRAFT_SAMPLE = (name: string) =>
  `# ${name} — Draft\n\n1. Purpose\nThis policy defines the rules, rights and obligations that govern ${name.toLowerCase()} on the Jobrio platform. It is a legal and business document — not a system configuration.\n\n2. Scope\nApplies to all users of the platform, including clients, professionals, admins and third-party integrations.\n\n3. Key Provisions\n- Users must comply with applicable law.\n- Jobrio may amend this policy with prior notice.\n- Violations may result in warnings, suspension or termination.\n\n4. Effective Date\nThis policy becomes effective on its published Effective Date.\n\n5. Contact\nQuestions may be directed to legal@jobrio.com.`;

const INITIAL_POLICIES: PolicyRow[] = [
  {
    id: "POL-TOS",
    name: "Terms of Service",
    group: "platform",
    version: "v4.2",
    status: "Published",
    effective: "2026-01-15",
    updatedBy: "Legal Team",
    audience: "All Users",
    summary: "Master contract between Jobrio and every user of the platform.",
    draft: DRAFT_SAMPLE("Terms of Service"),
  },
  {
    id: "POL-PRV",
    name: "Privacy Policy",
    group: "platform",
    version: "v3.8",
    status: "Published",
    effective: "2026-01-15",
    updatedBy: "Legal Team",
    audience: "All Users",
    summary: "How Jobrio collects, uses, stores and shares personal data.",
    draft: DRAFT_SAMPLE("Privacy Policy"),
  },
  {
    id: "POL-AUP",
    name: "Acceptable Use Policy",
    group: "platform",
    version: "v2.1",
    status: "Published",
    effective: "2025-11-01",
    updatedBy: "Compliance",
    audience: "All Users",
    summary: "Prohibited behaviour, misuse, spam, fraud and platform abuse.",
    draft: DRAFT_SAMPLE("Acceptable Use Policy"),
  },
  {
    id: "POL-CG",
    name: "Community Guidelines",
    group: "platform",
    version: "v1.9",
    status: "Pending Update",
    effective: "2025-08-01",
    updatedBy: "Trust & Safety",
    audience: "All Users",
    summary: "Behavioural standards, respectful communication and moderation rules.",
    draft: DRAFT_SAMPLE("Community Guidelines"),
  },

  {
    id: "POL-ORD",
    name: "Order Policy",
    group: "marketplace",
    version: "v3.0",
    status: "Published",
    effective: "2026-02-01",
    updatedBy: "Ops",
    audience: "Clients + Professionals",
    summary: "Rules governing order creation, approval, delivery and closure.",
    draft: DRAFT_SAMPLE("Order Policy"),
  },
  {
    id: "POL-ASN",
    name: "Assignment Policy",
    group: "marketplace",
    version: "v2.4",
    status: "Published",
    effective: "2026-02-01",
    updatedBy: "Ops",
    audience: "Professionals",
    summary: "How work is broadcast, accepted and assigned.",
    draft: DRAFT_SAMPLE("Assignment Policy"),
  },
  {
    id: "POL-QA",
    name: "QA Policy",
    group: "marketplace",
    version: "v2.0",
    status: "Published",
    effective: "2026-01-10",
    updatedBy: "QA Lead",
    audience: "Professionals + QA",
    summary: "Quality bar, review criteria and escalation ladder.",
    draft: DRAFT_SAMPLE("QA Policy"),
  },
  {
    id: "POL-RWK",
    name: "Rework Policy",
    group: "marketplace",
    version: "v1.6",
    status: "Published",
    effective: "2026-01-10",
    updatedBy: "QA Lead",
    audience: "Professionals",
    summary: "Rules on rework cycles, limits and compensation.",
    draft: DRAFT_SAMPLE("Rework Policy"),
  },
  {
    id: "POL-DIS",
    name: "Dispute Resolution Policy",
    group: "marketplace",
    version: "v2.7",
    status: "Published",
    effective: "2025-12-20",
    updatedBy: "Legal Team",
    audience: "All Users",
    summary: "How disputes are opened, investigated, decided and appealed.",
    draft: DRAFT_SAMPLE("Dispute Resolution Policy"),
  },
  {
    id: "POL-REF",
    name: "Refund Policy",
    group: "marketplace",
    version: "v3.1",
    status: "Published",
    effective: "2025-12-20",
    updatedBy: "Finance",
    audience: "Clients",
    summary: "Refund eligibility, timelines and payment reversal rules.",
    draft: DRAFT_SAMPLE("Refund Policy"),
  },
  {
    id: "POL-ESC",
    name: "Escrow Policy",
    group: "marketplace",
    version: "v2.2",
    status: "Published",
    effective: "2025-12-20",
    updatedBy: "Finance",
    audience: "All Users",
    summary: "How funds are held, released and disputed via escrow.",
    draft: DRAFT_SAMPLE("Escrow Policy"),
  },
  {
    id: "POL-CNL",
    name: "Cancellation Policy",
    group: "marketplace",
    version: "v1.4",
    status: "Draft",
    effective: "—",
    updatedBy: "Ops",
    audience: "All Users",
    summary: "Cancellation windows, fees and obligations.",
    draft: DRAFT_SAMPLE("Cancellation Policy"),
  },

  {
    id: "POL-COC",
    name: "Professional Code of Conduct",
    group: "workforce",
    version: "v3.3",
    status: "Published",
    effective: "2026-01-15",
    updatedBy: "HR",
    audience: "Professionals",
    summary: "Behavioural, ethical and professional standards.",
    draft: DRAFT_SAMPLE("Professional Code of Conduct"),
  },
  {
    id: "POL-TRL",
    name: "Trial Policy",
    group: "workforce",
    version: "v2.0",
    status: "Published",
    effective: "2025-11-15",
    updatedBy: "Talent Ops",
    audience: "Trial Professionals",
    summary: "Trial evaluation, tasks and progression rules.",
    draft: DRAFT_SAMPLE("Trial Policy"),
  },
  {
    id: "POL-QS",
    name: "Quality Standards",
    group: "workforce",
    version: "v2.8",
    status: "Published",
    effective: "2026-01-10",
    updatedBy: "QA Lead",
    audience: "Professionals",
    summary: "Minimum acceptable quality standards for delivered work.",
    draft: DRAFT_SAMPLE("Quality Standards"),
  },
  {
    id: "POL-PRF",
    name: "Performance Policy",
    group: "workforce",
    version: "v1.5",
    status: "Pending Update",
    effective: "2025-09-01",
    updatedBy: "HR",
    audience: "Professionals",
    summary: "Continuous performance evaluation and tiering.",
    draft: DRAFT_SAMPLE("Performance Policy"),
  },
  {
    id: "POL-SUS",
    name: "Suspension Policy",
    group: "workforce",
    version: "v2.1",
    status: "Published",
    effective: "2025-10-15",
    updatedBy: "Trust & Safety",
    audience: "Professionals + Clients",
    summary: "Grounds and process for temporary and permanent suspension.",
    draft: DRAFT_SAMPLE("Suspension Policy"),
  },

  {
    id: "POL-CR",
    name: "Client Responsibilities",
    group: "client",
    version: "v1.8",
    status: "Published",
    effective: "2025-12-01",
    updatedBy: "Ops",
    audience: "Clients",
    summary: "Obligations, briefs, feedback and cooperation duties.",
    draft: DRAFT_SAMPLE("Client Responsibilities"),
  },
  {
    id: "POL-PAY",
    name: "Payment Policy",
    group: "client",
    version: "v2.5",
    status: "Published",
    effective: "2025-12-01",
    updatedBy: "Finance",
    audience: "Clients",
    summary: "Payment methods, invoicing and late payment consequences.",
    draft: DRAFT_SAMPLE("Payment Policy"),
  },
  {
    id: "POL-COM",
    name: "Communication Policy",
    group: "client",
    version: "v1.2",
    status: "Draft",
    effective: "—",
    updatedBy: "Ops",
    audience: "All Users",
    summary: "Acceptable communication channels, tone and response times.",
    draft: DRAFT_SAMPLE("Communication Policy"),
  },
  {
    id: "POL-REV",
    name: "Revision Policy",
    group: "client",
    version: "v1.6",
    status: "Published",
    effective: "2025-12-01",
    updatedBy: "Ops",
    audience: "Clients",
    summary: "Revision windows, scope of changes and paid revisions.",
    draft: DRAFT_SAMPLE("Revision Policy"),
  },

  {
    id: "POL-DP",
    name: "Data Protection",
    group: "security",
    version: "v4.0",
    status: "Published",
    effective: "2026-01-15",
    updatedBy: "Security",
    audience: "All Users",
    summary: "Data retention, encryption and cross-border transfer rules.",
    draft: DRAFT_SAMPLE("Data Protection"),
  },
  {
    id: "POL-AS",
    name: "Account Security",
    group: "security",
    version: "v2.9",
    status: "Published",
    effective: "2025-11-01",
    updatedBy: "Security",
    audience: "All Users",
    summary: "Password, MFA and session security requirements.",
    draft: DRAFT_SAMPLE("Account Security"),
  },
  {
    id: "POL-KYC",
    name: "KYC / Verification",
    group: "security",
    version: "v3.4",
    status: "Published",
    effective: "2025-11-01",
    updatedBy: "Compliance",
    audience: "All Users",
    summary: "Identity verification, document requirements and re-KYC triggers.",
    draft: DRAFT_SAMPLE("KYC / Verification"),
  },
  {
    id: "POL-CD",
    name: "Compliance Documents",
    group: "security",
    version: "v1.7",
    status: "Archived",
    effective: "2024-08-01",
    updatedBy: "Compliance",
    audience: "Internal",
    summary: "SOC2, ISO 27001 and regulatory attestation index.",
    draft: DRAFT_SAMPLE("Compliance Documents"),
  },
];

const INITIAL_POL_VERSIONS: PolVersion[] = [
  {
    id: "PV-401",
    policyId: "POL-TOS",
    policyName: "Terms of Service",
    version: "v4.2",
    publishedAt: "2026-01-10",
    effective: "2026-01-15",
    status: "Published",
    updatedBy: "Legal Team",
    summary: "Added AI-generated content clause; clarified jurisdiction.",
  },
  {
    id: "PV-400",
    policyId: "POL-TOS",
    policyName: "Terms of Service",
    version: "v4.1",
    publishedAt: "2025-08-02",
    effective: "2025-08-15",
    status: "Archived",
    updatedBy: "Legal Team",
    summary: "Escrow references updated; refund timelines clarified.",
  },
  {
    id: "PV-380",
    policyId: "POL-PRV",
    policyName: "Privacy Policy",
    version: "v3.8",
    publishedAt: "2026-01-10",
    effective: "2026-01-15",
    status: "Published",
    updatedBy: "Legal Team",
    summary: "Added DPDP Act references; new data-subject rights section.",
  },
  {
    id: "PV-370",
    policyId: "POL-DIS",
    policyName: "Dispute Resolution Policy",
    version: "v2.7",
    publishedAt: "2025-12-15",
    effective: "2025-12-20",
    status: "Published",
    updatedBy: "Legal Team",
    summary: "Introduced 3-tier escalation and 72-hour decision SLA.",
  },
  {
    id: "PV-360",
    policyId: "POL-REF",
    policyName: "Refund Policy",
    version: "v3.1",
    publishedAt: "2025-12-15",
    effective: "2025-12-20",
    status: "Published",
    updatedBy: "Finance",
    summary: "Refund window extended to 14 days for eligible orders.",
  },
];

const INITIAL_POL_LOGS: PolAcceptLog[] = [
  {
    id: "AL-9021",
    user: "Aarav Sharma",
    role: "Client",
    policyName: "Terms of Service",
    version: "v4.2",
    acceptedAt: "2026-06-28 10:14",
    ip: "103.21.88.14",
    device: "iPhone 15 · Safari",
    method: "Signup",
  },
  {
    id: "AL-9020",
    user: "Riya Patel",
    role: "Professional",
    policyName: "Professional Code of Conduct",
    version: "v3.3",
    acceptedAt: "2026-06-28 09:58",
    ip: "49.36.11.207",
    device: "MacBook · Chrome",
    method: "Onboarding",
  },
  {
    id: "AL-9019",
    user: "Kabir Nair",
    role: "Client",
    policyName: "Privacy Policy",
    version: "v3.8",
    acceptedAt: "2026-06-28 09:41",
    ip: "27.62.4.19",
    device: "Android · Chrome",
    method: "In-app prompt",
  },
  {
    id: "AL-9018",
    user: "Anaya Rao",
    role: "Professional",
    policyName: "Trial Policy",
    version: "v2.0",
    acceptedAt: "2026-06-28 09:22",
    ip: "182.68.4.51",
    device: "Windows · Edge",
    method: "Trial start",
  },
  {
    id: "AL-9017",
    user: "Ishaan Verma",
    role: "Client",
    policyName: "Refund Policy",
    version: "v3.1",
    acceptedAt: "2026-06-27 22:03",
    ip: "115.240.9.87",
    device: "iPhone 14 · Safari",
    method: "Checkout",
  },
  {
    id: "AL-9016",
    user: "Meera Iyer",
    role: "Professional",
    policyName: "Dispute Resolution Policy",
    version: "v2.7",
    acceptedAt: "2026-06-27 20:45",
    ip: "203.192.14.5",
    device: "Android · Chrome",
    method: "Dispute open",
  },
];

const polStatusTone = (s: PolStatus): string =>
  s === "Published"
    ? "bg-emerald-500/10 text-emerald-700"
    : s === "Draft"
      ? "bg-amber-500/10 text-amber-700"
      : s === "Pending Update"
        ? "bg-primary-container/10 text-primary-container"
        : "bg-outline/10 text-outline";

const PolBadge = ({ s }: { s: PolStatus }) => (
  <span
    className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold",
      polStatusTone(s),
    )}
  >
    {s}
  </span>
);

const PolCategoryList = ({
  group,
  policies,
  onView,
  onEdit,
}: {
  group: PolGroup;
  policies: PolicyRow[];
  onView: (p: PolicyRow) => void;
  onEdit: (p: PolicyRow) => void;
}) => {
  const rows = policies.filter((p) => p.group === group);
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-outline border-b border-outline-variant/40">
              <th className="py-2 pr-3">Policy</th>
              <th className="py-2 pr-3">Version</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Effective</th>
              <th className="py-2 pr-3">Audience</th>
              <th className="py-2 pr-3">Updated By</th>
              <th className="py-2 pr-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.id}
                className="border-b border-outline-variant/20 hover:bg-surface-container-low/60"
              >
                <td className="py-3 pr-3">
                  <p className="font-semibold text-on-surface">{p.name}</p>
                  <p className="text-[11px] text-outline">{p.summary}</p>
                </td>
                <td className="py-3 pr-3 font-mono text-xs">{p.version}</td>
                <td className="py-3 pr-3">
                  <PolBadge s={p.status} />
                </td>
                <td className="py-3 pr-3 text-xs">{p.effective}</td>
                <td className="py-3 pr-3 text-xs">{p.audience}</td>
                <td className="py-3 pr-3 text-xs">{p.updatedBy}</td>
                <td className="py-3 pr-3">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => onView(p)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-outline-variant/40 text-on-surface-variant hover:border-on-surface whitespace-nowrap"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(p)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary text-on-primary hover:opacity-90 whitespace-nowrap"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-outline text-xs">
                  No policies in this category yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const PolicyDetailOverlay = ({
  p,
  onClose,
  onEdit,
}: {
  p: PolicyRow;
  onClose: () => void;
  onEdit: () => void;
}) => (
  <div
    className="fixed inset-0 z-[70] flex items-stretch md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-6"
    onClick={onClose}
  >
    <div
      className="bg-surface w-full md:max-w-3xl md:rounded-2xl rounded-none border border-outline-variant/40 shadow-2xl overflow-y-auto max-h-full"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              {p.id} · {p.version}
            </p>
            <h3 className="text-xl font-extrabold text-on-surface">{p.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <PolBadge s={p.status} />
              <span className="text-[11px] text-outline">
                Effective {p.effective} · {p.audience}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-full text-outline hover:text-on-surface hover:bg-surface-container-low"
          >
            <X size={16} />
          </button>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">
            Summary
          </p>
          <p className="text-sm text-on-surface-variant">{p.summary}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">
            Draft Content
          </p>
          <pre className="whitespace-pre-wrap text-[12px] leading-relaxed bg-surface-container-low border border-outline-variant/40 rounded-lg p-3 text-on-surface font-sans">
            {p.draft || DRAFT_SAMPLE(p.name)}
          </pre>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-bold border border-outline-variant/40 text-on-surface-variant hover:border-on-surface"
          >
            Close
          </button>
          <Button
            variant="primary"
            size="lg"
            className="px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90"
            onClick={onEdit}
          >
            Edit Policy
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const PolicyEditor = ({
  initial,
  onCancel,
  onSave,
}: {
  initial?: PolicyRow;
  onCancel: () => void;
  onSave: (p: PolicyRow, action: "draft" | "publish") => void;
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [name, setName] = useState(initial?.name || "");
  const [summary, setSummary] = useState(initial?.summary || "");
  const [id, setId] = useState(initial?.id || `POL-${Math.floor(Math.random() * 900) + 100}`);
  const [group, setGroup] = useState<PolGroup>(initial?.group || "platform");
  const [content, setContent] = useState(
    initial?.draft || DRAFT_SAMPLE(initial?.name || "New Policy"),
  );
  const [effective, setEffective] = useState(
    initial?.effective && initial.effective !== "—" ? initial.effective : "",
  );
  const [audience, setAudience] = useState(initial?.audience || "All Users");
  const [version, setVersion] = useState(initial?.version || "v1.0");

  const fieldCls =
    "mt-1 w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30";

  const build = (status: PolStatus): PolicyRow => ({
    id,
    name: name || "Untitled Policy",
    group,
    version,
    status,
    effective: effective || "—",
    updatedBy: "You",
    audience,
    summary: summary || "—",
    draft: content,
  });

  const StepDots = () => (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className="flex items-center gap-1.5">
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
              step === n
                ? "bg-primary text-on-primary"
                : step > n
                  ? "bg-emerald-500 text-white"
                  : "bg-surface-container-low text-outline border border-outline-variant/40",
            )}
          >
            {step > n ? "✓" : n}
          </div>
          {n < 6 && (
            <div
              className={cn("w-4 h-0.5", step > n ? "bg-emerald-500" : "bg-outline-variant/40")}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[70] flex items-stretch md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-6"
      onClick={onCancel}
    >
      <div
        className="bg-surface w-full md:max-w-3xl md:rounded-2xl rounded-none border border-outline-variant/40 shadow-2xl overflow-y-auto max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <StepDots />
            <button
              onClick={onCancel}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center rounded-full text-outline hover:text-on-surface hover:bg-surface-container-low"
            >
              <X size={16} />
            </button>
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <h3 className="text-lg font-extrabold text-on-surface">Basic Information</h3>
              <label className="block text-xs font-bold text-outline">
                Policy ID
                <input value={id} onChange={(e) => setId(e.target.value)} className={fieldCls} />
              </label>
              <label className="block text-xs font-bold text-outline">
                Policy Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Refund Policy"
                  className={fieldCls}
                />
              </label>
              <label className="block text-xs font-bold text-outline">
                Summary
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  placeholder="One-line description shown in the policy list."
                  className={fieldCls}
                />
              </label>
              <label className="block text-xs font-bold text-outline">
                Version
                <input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className={fieldCls}
                />
              </label>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-lg font-extrabold text-on-surface">Category</h3>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { k: "platform", l: "Platform" },
                    { k: "marketplace", l: "Marketplace" },
                    { k: "workforce", l: "Workforce" },
                    { k: "client", l: "Client" },
                    { k: "security", l: "Security & Compliance" },
                  ] as { k: PolGroup; l: string }[]
                ).map((g) => (
                  <button
                    key={g.k}
                    onClick={() => setGroup(g.k)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-semibold border text-left",
                      group === g.k
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-outline-variant/40 text-on-surface-variant hover:border-on-surface",
                    )}
                  >
                    {g.l}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <h3 className="text-lg font-extrabold text-on-surface">Policy Content</h3>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                className={cn(fieldCls, "font-mono text-[12px] leading-relaxed")}
              />
              <p className="text-[11px] text-outline">
                Draft content — supports plain text / markdown. Persisted with every version.
              </p>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-3">
              <h3 className="text-lg font-extrabold text-on-surface">Effective Date</h3>
              <input
                type="date"
                value={effective}
                onChange={(e) => setEffective(e.target.value)}
                className={fieldCls}
              />
              <p className="text-[11px] text-outline">
                This policy takes legal effect on the chosen date.
              </p>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-3">
              <h3 className="text-lg font-extrabold text-on-surface">Audience</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "All Users",
                  "Clients",
                  "Professionals",
                  "Admins",
                  "Trial Professionals",
                  "Internal",
                ].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAudience(a)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-semibold border",
                      audience === a
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-outline-variant/40 text-on-surface-variant hover:border-on-surface",
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 6 && (
            <div className="space-y-3">
              <h3 className="text-lg font-extrabold text-on-surface">Preview & Publish</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-outline font-bold uppercase tracking-widest text-[10px]">
                    Policy
                  </p>
                  <p>{name || "—"}</p>
                </div>
                <div>
                  <p className="text-outline font-bold uppercase tracking-widest text-[10px]">
                    Version
                  </p>
                  <p>{version}</p>
                </div>
                <div>
                  <p className="text-outline font-bold uppercase tracking-widest text-[10px]">
                    Category
                  </p>
                  <p className="capitalize">{group}</p>
                </div>
                <div>
                  <p className="text-outline font-bold uppercase tracking-widest text-[10px]">
                    Audience
                  </p>
                  <p>{audience}</p>
                </div>
                <div>
                  <p className="text-outline font-bold uppercase tracking-widest text-[10px]">
                    Effective
                  </p>
                  <p>{effective || "—"}</p>
                </div>
                <div>
                  <p className="text-outline font-bold uppercase tracking-widest text-[10px]">
                    Status
                  </p>
                  <p>Draft → Publish</p>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-[12px] leading-relaxed bg-surface-container-low border border-outline-variant/40 rounded-lg p-3 text-on-surface font-sans max-h-64 overflow-y-auto">
                {content}
              </pre>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              disabled={step === 1}
              onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4 | 5) : s))}
              className="px-4 py-2 rounded-lg text-sm font-bold border border-outline-variant/40 text-on-surface-variant disabled:opacity-40 hover:border-on-surface"
            >
              Back
            </button>
            <div className="flex gap-2">
              {step === 6 ? (
                <>
                  <button
                    onClick={() => {
                      onSave(build("Draft"), "draft");
                      toast.success("Draft saved");
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-bold border border-outline-variant/40 text-on-surface-variant hover:border-on-surface"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={() => {
                      if (!name.trim()) {
                        toast.error("Missing policy name");
                        return;
                      }
                      if (!effective) {
                        toast.error("Pick an effective date");
                        return;
                      }
                      onSave(build("Published"), "publish");
                      toast.success("Policy published");
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-on-primary hover:opacity-90"
                  >
                    Publish
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setStep((s) => (s + 1) as 2 | 3 | 4 | 5 | 6)}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-on-primary hover:opacity-90"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PoliciesSection = () => {
  const [view, setView] = useState<PolKey>("dashboard");
  const [policies, setPolicies] = useState<PolicyRow[]>(INITIAL_POLICIES);
  const [versions, setVersions] = useState<PolVersion[]>(INITIAL_POL_VERSIONS);
  const [logs] = useState<PolAcceptLog[]>(INITIAL_POL_LOGS);
  const [detail, setDetail] = useState<PolicyRow | null>(null);
  const [editing, setEditing] = useState<PolicyRow | null>(null);
  const [creating, setCreating] = useState(false);

  const totals = useMemo(() => {
    const total = policies.length;
    const active = policies.filter((p) => p.status === "Published").length;
    const drafts = policies.filter((p) => p.status === "Draft").length;
    const archived = policies.filter((p) => p.status === "Archived").length;
    const pending = policies.filter((p) => p.status === "Pending Update").length;
    const latest = [...versions].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))[0];
    return { total, active, drafts, archived, pending, latest };
  }, [policies, versions]);

  const savePolicy = (p: PolicyRow, action: "draft" | "publish") => {
    setPolicies((rows) => {
      const idx = rows.findIndex((r) => r.id === p.id);
      if (idx === -1) return [p, ...rows];
      const next = [...rows];
      next[idx] = p;
      return next;
    });
    if (action === "publish") {
      setVersions((v) => [
        {
          id: `PV-${Math.floor(Math.random() * 900) + 500}`,
          policyId: p.id,
          policyName: p.name,
          version: p.version,
          publishedAt: new Date().toISOString().slice(0, 10),
          effective: p.effective,
          status: "Published",
          updatedBy: "You",
          summary: p.summary,
        },
        ...v,
      ]);
    }
    setEditing(null);
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-row-reverse items-start justify-between gap-3 flex-wrap">
        <SectionHeader
          title="Policies"
          subtitle="Single source of truth for legal, business and operational guidelines. Versioned. Auditable."
        />
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-on-primary hover:opacity-90"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            add
          </span>
          Create Policy
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {POL_NAV.map((n) => {
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

      {view === "dashboard" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { l: "Total Policies", v: totals.total, tone: "text-on-surface" },
              { l: "Active", v: totals.active, tone: "text-emerald-600" },
              { l: "Drafts", v: totals.drafts, tone: "text-amber-600" },
              { l: "Archived", v: totals.archived, tone: "text-outline" },
              { l: "Pending Updates", v: totals.pending, tone: "text-primary-container" },
              {
                l: "Latest Version",
                v: totals.latest
                  ? `${totals.latest.policyName.split(" ")[0]} ${totals.latest.version}`
                  : "—",
                tone: "text-primary",
              },
            ].map((s) => (
              <Card key={s.l}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  {s.l}
                </p>
                <p className={cn("text-2xl font-extrabold mt-1", s.tone)}>{s.v}</p>
              </Card>
            ))}
          </div>
          <Card>
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">
              Recently Published
            </p>
            <div className="divide-y divide-outline-variant/30">
              {versions.slice(0, 5).map((v) => (
                <div key={v.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-on-surface">
                      {v.policyName} ·{" "}
                      <span className="font-mono text-xs text-outline">{v.version}</span>
                    </p>
                    <p className="text-[11px] text-outline">{v.summary}</p>
                  </div>
                  <span className="text-[11px] text-outline">Eff. {v.effective}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {view === "platform" && (
        <PolCategoryList
          group="platform"
          policies={policies}
          onView={setDetail}
          onEdit={setEditing}
        />
      )}
      {view === "marketplace" && (
        <PolCategoryList
          group="marketplace"
          policies={policies}
          onView={setDetail}
          onEdit={setEditing}
        />
      )}
      {view === "workforce" && (
        <PolCategoryList
          group="workforce"
          policies={policies}
          onView={setDetail}
          onEdit={setEditing}
        />
      )}
      {view === "client" && (
        <PolCategoryList
          group="client"
          policies={policies}
          onView={setDetail}
          onEdit={setEditing}
        />
      )}
      {view === "security" && (
        <PolCategoryList
          group="security"
          policies={policies}
          onView={setDetail}
          onEdit={setEditing}
        />
      )}

      {view === "versions" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-outline border-b border-outline-variant/40">
                  <th className="py-2 pr-3">Policy</th>
                  <th className="py-2 pr-3">Version</th>
                  <th className="py-2 pr-3">Published</th>
                  <th className="py-2 pr-3">Effective</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Updated By</th>
                  <th className="py-2 pr-3">Change Summary</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-outline-variant/20 hover:bg-surface-container-low/60"
                  >
                    <td className="py-3 pr-3 font-semibold">{v.policyName}</td>
                    <td className="py-3 pr-3 font-mono text-xs">{v.version}</td>
                    <td className="py-3 pr-3 text-xs">{v.publishedAt}</td>
                    <td className="py-3 pr-3 text-xs">{v.effective}</td>
                    <td className="py-3 pr-3">
                      <PolBadge s={v.status} />
                    </td>
                    <td className="py-3 pr-3 text-xs">{v.updatedBy}</td>
                    <td className="py-3 pr-3 text-xs text-on-surface-variant">{v.summary}</td>
                    <td className="py-3 pr-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => {
                            const p = policies.find((x) => x.id === v.policyId);
                            if (p) setDetail(p);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-outline-variant/40 text-on-surface-variant hover:border-on-surface whitespace-nowrap"
                        >
                          View
                        </button>
                        <button
                          disabled
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-outline-variant/40 text-on-surface-variant hover:border-on-surface whitespace-nowrap"
                        >
                          Compare
                        </button>
                        <button
                          onClick={() => {
                            setPolicies((arr) =>
                              arr.map((p) =>
                                p.id === v.policyId
                                  ? { ...p, version: v.version, status: "Published" as PolStatus }
                                  : p,
                              ),
                            );
                            setVersions((arr) =>
                              arr.map((vv) =>
                                vv.policyId !== v.policyId
                                  ? vv
                                  : {
                                      ...vv,
                                      status:
                                        vv.id === v.id ? "Published" : ("Archived" as PolStatus),
                                    },
                              ),
                            );
                            toast.success(`Restored ${v.policyName} ${v.version}`, {
                              description: "This version is now the active published policy.",
                              duration: 2500,
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary text-on-primary hover:opacity-90 whitespace-nowrap"
                        >
                          Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {view === "acceptance" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-outline border-b border-outline-variant/40">
                  <th className="py-2 pr-3">User</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Policy</th>
                  <th className="py-2 pr-3">Version</th>
                  <th className="py-2 pr-3">Accepted At</th>
                  <th className="py-2 pr-3">IP</th>
                  <th className="py-2 pr-3">Device</th>
                  <th className="py-2 pr-3">Method</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-outline-variant/20 hover:bg-surface-container-low/60"
                  >
                    <td className="py-3 pr-3 font-semibold">{l.user}</td>
                    <td className="py-3 pr-3 text-xs">{l.role}</td>
                    <td className="py-3 pr-3 text-xs">{l.policyName}</td>
                    <td className="py-3 pr-3 font-mono text-xs">{l.version}</td>
                    <td className="py-3 pr-3 text-xs">{l.acceptedAt}</td>
                    <td className="py-3 pr-3 font-mono text-[11px]">{l.ip}</td>
                    <td className="py-3 pr-3 text-xs">{l.device}</td>
                    <td className="py-3 pr-3 text-xs">{l.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {detail && (
        <PolicyDetailOverlay
          p={detail}
          onClose={() => setDetail(null)}
          onEdit={() => {
            setEditing(detail);
            setDetail(null);
          }}
        />
      )}
      {(editing || creating) && (
        <PolicyEditor
          initial={editing || undefined}
          onCancel={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={savePolicy}
        />
      )}
    </div>
  );
};

export default PoliciesSection;
