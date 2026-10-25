import { useState, useEffect } from "react";
import { toast } from "sonner";
import type React from "react";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Gavel,
  Package,
  ShieldCheck,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { Button } from "@jobrio/ui/design-system";
import { cn } from "@jobrio/utils/utils";
import AuditListPage, {
  AuditListTab,
} from "@admin/features/admin-dashboard/components/AuditListPage";
import { SectionHeader, Card } from "@admin/features/admin-dashboard/components/sections";
import {
  Stat,
  Row,
  Badge,
  SectionTitle,
  HealthDot,
  WFShell,
  SDCategory,
  SD_CATEGORIES,
  SDService,
} from "@admin/features/admin-dashboard/components/sections-shared";
import { useServiceRegistry, addServiceToRegistry } from "@jobrio/constants";

/* ============================================================
 * 4. SERVICE MANAGEMENT
 * ============================================================ */

type SVTab = "categories" | "subcategories" | "skills" | "standards";

/* ------------------------------------------------------------------
 * SERVICES DESK — Catalog + Intelligence + Configuration
 * ------------------------------------------------------------------ */
const SDInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={cn(
      "mt-1 w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30",
      props.className,
    )}
  />
);

const SDSelect = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={cn(
      "mt-1 w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30",
      props.className,
    )}
  >
    {children}
  </select>
);

const SDTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={cn(
      "mt-1 w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30",
      props.className,
    )}
  />
);

const SDLabel = ({ children }: { children: ReactNode }) => (
  <span className="text-[10px] font-bold uppercase tracking-wider text-outline">{children}</span>
);

const SDSegmented = <T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { key: T; label: string }[];
}) => (
  <div className="mt-1 inline-flex items-center rounded-full bg-surface-container-low border border-outline-variant/40 p-0.5">
    {options.map((o) => {
      const on = value === o.key;
      return (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
            on
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

const demandTone = (d: SDService["demand"]) =>
  d === "Growing"
    ? "bg-emerald-50 text-emerald-700"
    : d === "Declining"
      ? "bg-rose-50 text-rose-700"
      : "bg-slate-100 text-slate-700";

const ServiceDetailsOverlay = ({
  s,
  onClose,
  onEdit,
}: {
  s: SDService;
  onClose: () => void;
  onEdit: () => void;
}) => (
  <WFShell
    subtitle={`Service Intelligence · ${s.id}`}
    title={s.name}
    badge={
      <div className="flex items-center gap-2">
        <Badge tone={demandTone(s.demand)}>{s.demand}</Badge>
        <Button
          variant="primary"
          size="lg"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold hover:opacity-90"
          onClick={onEdit}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            edit
          </span>
          Edit Service
        </Button>
      </div>
    }
    onClose={onClose}
  >
    {/* Service Information */}
    <Card>
      <SectionTitle title="Service Information" hint="Identity & description" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <SDLabel>Service ID</SDLabel>
          <p className="font-bold text-on-surface mt-1">{s.id}</p>
        </div>
        <div>
          <SDLabel>Logo</SDLabel>
          <div className="mt-1 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-extrabold">
            {s.name[0]}
          </div>
        </div>
        <div>
          <SDLabel>Service Name</SDLabel>
          <p className="font-bold text-on-surface mt-1">{s.name}</p>
        </div>
        <div>
          <SDLabel>Status</SDLabel>
          <div className="mt-1">
            <Badge
              tone={
                s.status === "Active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-700"
              }
            >
              {s.status}
            </Badge>
          </div>
        </div>
        <div>
          <SDLabel>Category</SDLabel>
          <p className="font-bold text-on-surface mt-1">{s.category}</p>
        </div>
        <div>
          <SDLabel>Subcategory</SDLabel>
          <p className="font-bold text-on-surface mt-1">{s.subcategory}</p>
        </div>
        <div>
          <SDLabel>Visibility</SDLabel>
          <div className="mt-1">
            <Badge tone="bg-primary-container/10 text-primary-container">{s.visibility}</Badge>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <SDLabel>Short Description</SDLabel>
          <p className="text-sm text-on-surface mt-1">{s.shortDesc}</p>
        </div>
        <div>
          <SDLabel>Full Description</SDLabel>
          <p className="text-sm text-on-surface-variant mt-1">{s.fullDesc}</p>
        </div>
      </div>
    </Card>

    {/* Demand Intelligence */}
    <Card>
      <SectionTitle title="Demand Intelligence" hint="Order demand signal" />
      <Row cols={4}>
        <Stat
          label="Total Orders"
          value={String(s.activeOrders * 6)}
          icon={Package}
          tint="bg-primary-container/10 text-primary-container"
        />
        <Stat
          label="Orders This Month"
          value={String(Math.round(s.activeOrders * 0.9))}
          icon={Activity}
          tint="bg-violet-500/10 text-violet-600"
        />
        <Stat
          label="Last 30 Days"
          value={String(Math.round(s.activeOrders * 0.8))}
          icon={Clock}
          tint="bg-amber-500/10 text-amber-600"
        />
        <Stat
          label="Demand Trend"
          value={s.demand}
          icon={Activity}
          tint="bg-emerald-500/10 text-emerald-600"
        />
      </Row>
    </Card>

    {/* Workforce Intelligence */}
    <Card>
      <SectionTitle title="Workforce Intelligence" hint="Pool capacity for this service" />
      <Row cols={4}>
        <Stat
          label="Total Professionals"
          value="184"
          icon={Users}
          tint="bg-primary-container/10 text-primary-container"
        />
        <Stat
          label="Active"
          value="142"
          icon={CheckCircle2}
          tint="bg-emerald-500/10 text-emerald-600"
        />
        <Stat
          label="Available"
          value="38"
          icon={CheckCircle2}
          tint="bg-emerald-500/10 text-emerald-600"
        />
        <Stat label="Busy" value="104" icon={Clock} tint="bg-amber-500/10 text-amber-600" />
      </Row>
      <div className="mt-3">
        <SDLabel>Capacity Status</SDLabel>
        <div className="mt-1">
          <HealthDot status={s.demand === "Growing" ? "watch" : "healthy"} />
        </div>
      </div>
    </Card>

    {/* Order Intelligence */}
    <Card>
      <SectionTitle title="Order Intelligence" hint="Lifecycle stats" />
      <Row cols={3}>
        <Stat
          label="Total Orders"
          value={String(s.activeOrders * 6)}
          icon={Package}
          tint="bg-primary-container/10 text-primary-container"
        />
        <Stat
          label="Completed"
          value={String(s.activeOrders * 5)}
          icon={CheckCircle2}
          tint="bg-emerald-500/10 text-emerald-600"
        />
        <Stat label="Cancelled" value="14" icon={XCircle} tint="bg-slate-500/10 text-slate-600" />
      </Row>
      <Row cols={3} className="mt-3">
        <Stat label="Disputed" value="3" icon={Gavel} tint="bg-rose-500/10 text-rose-600" />
        <Stat
          label="Active"
          value={String(s.activeOrders)}
          icon={Activity}
          tint="bg-primary-container/10 text-primary-container"
        />
        <Stat
          label="Avg Completion"
          value="3.4 d"
          icon={Clock}
          tint="bg-amber-500/10 text-amber-600"
        />
      </Row>
    </Card>

    {/* Quality Intelligence */}
    <Card>
      <SectionTitle title="Quality Intelligence" hint="QA & satisfaction" />
      <Row cols={4}>
        <Stat
          label="QA Approval"
          value="94.2%"
          icon={CheckCircle2}
          tint="bg-emerald-500/10 text-emerald-600"
        />
        <Stat
          label="QA Rejection"
          value="5.8%"
          icon={XCircle}
          tint="bg-rose-500/10 text-rose-600"
        />
        <Stat
          label="Rework Rate"
          value="7.1%"
          icon={AlertTriangle}
          tint="bg-amber-500/10 text-amber-600"
        />
        <Stat
          label="Client CSAT"
          value="4.7 / 5"
          icon={ShieldCheck}
          tint="bg-primary-container/10 text-primary-container"
        />
      </Row>
    </Card>

    {/* Financial Intelligence */}
    <Card>
      <SectionTitle title="Financial Intelligence" hint="Revenue & margin" />
      <Row cols={4}>
        <Stat
          label="Revenue Generated"
          value="₹4.8L"
          icon={DollarSign}
          tint="bg-violet-500/10 text-violet-600"
        />
        <Stat
          label="Revenue (Month)"
          value="₹62k"
          icon={DollarSign}
          tint="bg-violet-500/10 text-violet-600"
        />
        <Stat
          label="Avg Order Value"
          value="₹820"
          icon={Wallet}
          tint="bg-primary-container/10 text-primary-container"
        />
        <Stat
          label="Margin Contribution"
          value="22%"
          icon={Activity}
          tint="bg-emerald-500/10 text-emerald-600"
        />
      </Row>
    </Card>

    {/* Service Health */}
    <Card>
      <SectionTitle title="Service Health" hint="Auto-generated composite scores" />
      <div className="space-y-3">
        {[
          { l: "Demand Score", v: 82 },
          { l: "Quality Score", v: 91 },
          { l: "Capacity Score", v: 68 },
          { l: "Profitability Score", v: 74 },
          { l: "Overall Health Score", v: 79 },
        ].map((m) => (
          <div key={m.l}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-on-surface-variant">{m.l}</span>
              <span className="font-extrabold text-on-surface">{m.v} / 100</span>
            </div>
            <div className="mt-1 h-2 bg-surface-container-low rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full",
                  m.v >= 80 ? "bg-emerald-500" : m.v >= 65 ? "bg-amber-500" : "bg-rose-500",
                )}
                style={{ width: `${m.v}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>

    {/* Activity Timeline */}
    <Card>
      <SectionTitle title="Activity Timeline" hint="Configuration history" />
      <ul className="space-y-3">
        {[
          { t: "Service Created", w: "12 Mar 2024" },
          { t: "Pricing Updated", w: "04 Jun 2024" },
          { t: "New Deliverable Added", w: "22 Aug 2024" },
          { t: "Category Changed", w: "01 Oct 2024" },
          { t: "Policy Updated", w: "18 Jan 2025" },
        ].map((a) => (
          <li key={a.t} className="flex items-start gap-3">
            <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
            <div className="flex-1 flex items-center justify-between">
              <span className="text-sm font-semibold text-on-surface">{a.t}</span>
              <span className="text-[11px] text-outline">{a.w}</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  </WFShell>
);

const ServiceEditOverlay = ({ s, onClose }: { s: SDService; onClose: () => void }) => {
  const [name, setName] = useState(s.name);
  const [shortDesc, setShortDesc] = useState(s.shortDesc);
  const [fullDesc, setFullDesc] = useState(s.fullDesc);
  const [category, setCategory] = useState<SDCategory>(s.category);
  const [subcategory, setSubcategory] = useState(s.subcategory);
  const [status, setStatus] = useState<"Active" | "Inactive">(s.status);
  const subs = SD_CATEGORIES.find((c) => c.name === category)?.subs ?? [];
  return (
    <WFShell subtitle={`Edit Service · ${s.id}`} title={s.name} onClose={onClose}>
      <Card>
        <SectionTitle title="Basic Information" hint="Identity fields" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block md:col-span-2">
            <SDLabel>Service Logo</SDLabel>
            <div className="mt-1 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-extrabold">
                {name[0] ?? "?"}
              </div>
              <button
                type="button"
                disabled
                title="Asset upload is not wired in this build."
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-outline-variant/40 text-outline bg-surface-container cursor-not-allowed"
              >
                Replace
              </button>
            </div>
          </label>
          <label className="block md:col-span-2">
            <SDLabel>Service Name</SDLabel>
            <SDInput value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block md:col-span-2">
            <SDLabel>Short Description</SDLabel>
            <SDInput value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} />
          </label>
          <label className="block md:col-span-2">
            <SDLabel>Full Description</SDLabel>
            <SDTextarea rows={4} value={fullDesc} onChange={(e) => setFullDesc(e.target.value)} />
          </label>
        </div>
      </Card>
      <Card>
        <SectionTitle title="Category Structure" hint="Where this service lives in the catalog" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <SDLabel>Category</SDLabel>
            <SDSelect
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as SDCategory);
                setSubcategory("");
              }}
            >
              {SD_CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </SDSelect>
          </label>
          <label className="block">
            <SDLabel>Subcategory</SDLabel>
            <SDSelect value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
              <option value="">Select subcategory</option>
              {subs.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </SDSelect>
          </label>
        </div>
      </Card>
      <Card>
        <SectionTitle title="Visibility" hint="Operational status" />
        <SDSegmented
          value={status}
          onChange={setStatus}
          options={[
            { key: "Active", label: "Active" },
            { key: "Inactive", label: "Inactive" },
          ]}
        />
        <p className="mt-4 text-xs italic text-outline">
          Pricing, Assignment Rules, QA Rules and SLA are managed in Platform Rules.
        </p>
      </Card>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-bold border border-outline-variant/40 text-on-surface-variant hover:border-on-surface"
        >
          Cancel
        </button>
        <Button
          variant="primary"
          size="lg"
          className="px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90"
          onClick={onClose}
        >
          Save Changes
        </Button>
      </div>
    </WFShell>
  );
};

const ServiceCreateOverlay = ({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: {
    name: string;
    category: SDCategory;
    subcategory: string;
    shortDesc: string;
    fullDesc: string;
    status: "Active" | "Inactive";
    visibility: "Public" | "Hidden";
  }) => void;
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<SDCategory>("Design");
  const [subcategory, setSubcategory] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [visibility, setVisibility] = useState<"Public" | "Hidden">("Public");
  const [error, setError] = useState("");
  const subs = SD_CATEGORIES.find((c) => c.name === category)?.subs ?? [];

  const handleCreate = () => {
    if (!name.trim()) {
      setError("Service name is required.");
      return;
    }
    onCreate({
      name: name.trim(),
      category,
      subcategory: subcategory || subs[0] || "",
      shortDesc: shortDesc.trim(),
      fullDesc: fullDesc.trim(),
      status,
      visibility,
    });
    onClose();
  };
  return (
    <WFShell subtitle="Services Desk" title="Create New Service" onClose={onClose}>
      <Card>
        <SectionTitle title="Basic Information" hint="Identity & taxonomy" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block md:col-span-2">
            <SDLabel>Service Logo</SDLabel>
            <div className="mt-1 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant/40 text-outline flex items-center justify-center text-xs font-bold">
                LOGO
              </div>
              <button
                type="button"
                disabled
                title="Asset upload is not wired in this build."
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-outline-variant/40 text-outline bg-surface-container cursor-not-allowed"
              >
                Upload · Coming Soon
              </button>
            </div>
          </label>
          <label className="block md:col-span-2">
            <SDLabel>Service Name</SDLabel>
            <SDInput
              placeholder="e.g. Landing Page Development"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
            />
            {error && <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p>}
          </label>
          <label className="block">
            <SDLabel>Category</SDLabel>
            <SDSelect
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as SDCategory);
                setSubcategory("");
              }}
            >
              {SD_CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </SDSelect>
          </label>
          <label className="block">
            <SDLabel>Subcategory</SDLabel>
            <SDSelect value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
              <option value="">Select subcategory</option>
              {subs.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </SDSelect>
          </label>
        </div>
      </Card>
      <Card>
        <SectionTitle title="Description" hint="Catalog copy" />
        <div className="space-y-4">
          <label className="block">
            <SDLabel>Short Description</SDLabel>
            <SDInput
              placeholder="One line tagline"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
            />
          </label>
          <label className="block">
            <SDLabel>Full Description</SDLabel>
            <SDTextarea
              rows={5}
              placeholder="What's included, who it's for, outcomes."
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
            />
          </label>
        </div>
      </Card>
      <Card>
        <SectionTitle title="Status" hint="Operational availability" />
        <SDSegmented
          value={status}
          onChange={setStatus}
          options={[
            { key: "Active", label: "Active" },
            { key: "Inactive", label: "Inactive" },
          ]}
        />
      </Card>
      <Card>
        <SectionTitle title="Service Visibility" hint="Where this appears" />
        <SDSegmented
          value={visibility}
          onChange={setVisibility}
          options={[
            { key: "Public", label: "Public" },
            { key: "Hidden", label: "Hidden" },
          ]}
        />
      </Card>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-bold border border-outline-variant/40 text-on-surface-variant hover:border-on-surface"
        >
          Cancel
        </button>
        <Button
          variant="primary"
          size="lg"
          className="px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90"
          onClick={handleCreate}
        >
          Create New Service
        </Button>
      </div>
    </WFShell>
  );
};

interface ServicesSectionProps {
  openServiceId?: string;
}

export const ServicesSection = ({ openServiceId }: ServicesSectionProps = {}) => {
  const [activeCat, setActiveCat] = useState<"All" | SDCategory>("All");
  const [search, setSearch] = useState("");
  const [detailFor, setDetailFor] = useState<SDService | null>(null);
  const [editFor, setEditFor] = useState<SDService | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Live catalog: seed services + anything created from this desk, shared
  // with the landing Services page and Order Create.
  const registry = useServiceRegistry();
  const services: SDService[] = registry.map((s) => ({
    id: s.id,
    name: s.title,
    category: s.category,
    subcategory: s.subcategory,
    status: s.status,
    visibility: s.visibility,
    activeOrders: s.activeOrders,
    demand: s.demand,
    shortDesc: s.shortDesc,
    fullDesc: s.fullDesc,
  }));

  // Deep-link open
  useEffect(() => {
    if (!openServiceId) return;
    const m = services.find((s) => s.id.toLowerCase() === openServiceId.toLowerCase());
    if (m) setDetailFor(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openServiceId]);

  const filtered = services.filter((s) => {
    if (activeCat !== "All" && s.category !== activeCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const hay =
        `${s.name} ${s.category} ${s.subcategory} ${s.shortDesc} ${s.fullDesc}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const tabs: AuditListTab[] = [
    { key: "All", label: "All", icon: "apps" },
    ...SD_CATEGORIES.map((c) => ({ key: c.name, label: c.name, icon: "design_services" })),
  ];

  return (
    <>
      <AuditListPage
        title="Services Desk"
        description="Catalog · Intelligence · Configuration."
        headerAction={
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-on-primary hover:opacity-90"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              add
            </span>
            Create New Service
          </button>
        }
        tabs={tabs}
        activeTab={activeCat}
        onTabChange={(k) => setActiveCat(k as "All" | SDCategory)}
        count={filtered.length}
        search={{
          query: search,
          onSearch: setSearch,
          placeholder: "Search services…",
        }}
        isEmpty={filtered.length === 0}
        emptyMessage="No services match this search."
        hideSortRow={true}
      >
        {/* Service table — action CTA inline on the right (matches Users Directory) */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-container-high text-[10px] uppercase tracking-wider text-outline">
                  <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Service ID</th>
                  <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">
                    Service Name
                  </th>
                  <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Category</th>
                  <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Subcategory</th>
                  <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Status</th>
                  <th className="text-right font-bold px-4 py-2.5 whitespace-nowrap">Active</th>
                  <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Demand</th>
                  <th className="text-right font-bold px-4 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/60">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-container-low/60">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="font-mono text-xs text-on-surface-variant">{s.id}</span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap font-bold text-on-surface">
                      {s.name}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-on-surface-variant">
                      {s.category}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-on-surface-variant">
                      {s.subcategory}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Badge
                        tone={
                          s.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }
                      >
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right font-bold">
                      {s.activeOrders}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Badge tone={demandTone(s.demand)}>{s.demand}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => setDetailFor(s)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-on-primary hover:opacity-90"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                          visibility
                        </span>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </AuditListPage>

      {showCreate && (
        <ServiceCreateOverlay
          onClose={() => setShowCreate(false)}
          onCreate={(input) => addServiceToRegistry(input)}
        />
      )}
      {detailFor && (
        <ServiceDetailsOverlay
          s={detailFor}
          onClose={() => setDetailFor(null)}
          onEdit={() => {
            setEditFor(detailFor);
            setDetailFor(null);
          }}
        />
      )}
      {editFor && <ServiceEditOverlay s={editFor} onClose={() => setEditFor(null)} />}
    </>
  );
};

export default ServicesSection;
