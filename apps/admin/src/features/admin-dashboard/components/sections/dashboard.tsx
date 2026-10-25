import { useState, useMemo, useRef, useEffect } from "react";
import type React from "react";
import {
  Activity,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  Gavel,
  Layers,
  Package,
  ShieldCheck,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { cn } from "@jobrio/utils/utils";
import { toast } from "sonner";
import type { AdminSectionKey } from "@admin/features/admin-dashboard/components/AdminDashboardLayout";
import { SectionHeader, Card } from "@admin/features/admin-dashboard/components/sections";
import {
  Stat,
  Pipe,
  Row,
  Badge,
  SectionTitle,
  HealthDot,
  InfoChip,
} from "@admin/features/admin-dashboard/components/sections-shared";

/* ============================================================
 * 1. DASHBOARD — Platform Command Center
 *    13 focused snapshot blocks. NOT a stats page —
 *    every block is a quick-read summary + CTA to drill in.
 * ============================================================ */

const CTAButton = ({ label, onClick }: { label: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
  >
    {label}
    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
      arrow_forward
    </span>
  </button>
);

const KV = ({
  k,
  v,
  tone = "text-on-surface",
}: {
  k: string;
  v: string | number;
  tone?: string;
}) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-[11px] text-on-surface-variant">{k}</span>
    <span className={cn("text-sm font-extrabold", tone)}>{v}</span>
  </div>
);

/* User Growth chart — two series (Client vs Professional) with Day/Month/Year filter, horizontally scrollable + hover tooltip */
const UserGrowthChart = () => {
  type Range = "day" | "month" | "year";
  const [range, setRange] = useState<Range>("month");
  const [hover, setHover] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Full historical mock data going back from launch.
  const DATA: Record<Range, { label: string; client: number; pro: number }[]> = useMemo(() => {
    // Day: last 90 days (since launch ~3 months back)
    const days: { label: string; client: number; pro: number }[] = [];
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const c = Math.round(20 + (89 - i) * 0.9 + Math.sin(i / 3) * 8 + Math.random() * 6);
      const p = Math.round(10 + (89 - i) * 0.55 + Math.cos(i / 4) * 5 + Math.random() * 4);
      days.push({
        label: `${dayLabels[d.getDay() === 0 ? 6 : d.getDay() - 1]} ${d.getDate()}/${d.getMonth() + 1}`,
        client: c,
        pro: p,
      });
    }
    // Month: last 24 months
    const months: { label: string; client: number; pro: number }[] = [];
    const monLabels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    for (let i = 23; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const c = Math.round(180 + (23 - i) * 32 + Math.sin(i / 2) * 40);
      const p = Math.round(90 + (23 - i) * 19 + Math.cos(i / 2) * 22);
      months.push({
        label: `${monLabels[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
        client: c,
        pro: p,
      });
    }
    // Year: 2019 → current
    const years: { label: string; client: number; pro: number }[] = [];
    const currentY = new Date().getFullYear();
    let cAcc = 600;
    let pAcc = 220;
    for (let y = 2019; y <= currentY; y++) {
      cAcc = Math.round(cAcc * (1.55 + Math.random() * 0.2));
      pAcc = Math.round(pAcc * (1.45 + Math.random() * 0.2));
      years.push({ label: String(y), client: cAcc, pro: pAcc });
    }
    return { day: days, month: months, year: years };
  }, []);

  const rows = DATA[range];
  const max = Math.max(...rows.flatMap((r) => [r.client, r.pro])) || 1;

  // Each point gets a fixed pixel step so SVG scrolls horizontally.
  const STEP = range === "year" ? 92 : range === "month" ? 64 : 44;
  const PADX = 36;
  const PADY = 22;
  const H = 220;
  const innerH = H - PADY * 2;
  const W = Math.max(640, PADX * 2 + STEP * (rows.length - 1));
  const innerW = W - PADX * 2;
  const xAt = (i: number) => PADX + (rows.length === 1 ? innerW / 2 : i * STEP);
  const yAt = (v: number) => PADY + innerH - (v / max) * innerH;
  const pathFor = (key: "client" | "pro") =>
    rows.map((r, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(r[key])}`).join(" ");
  const areaFor = (key: "client" | "pro") =>
    `${pathFor(key)} L ${xAt(rows.length - 1)} ${PADY + innerH} L ${xAt(0)} ${PADY + innerH} Z`;
  const gridY = [0, 0.25, 0.5, 0.75, 1].map((p) => PADY + innerH * p);

  // Scroll to the right edge (latest) on range change.
  useEffect(() => {
    setHover(rows.length - 1);
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, [range, rows.length]);

  const onSvgMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < rows.length; i++) {
      const d = Math.abs(xAt(i) - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    setHover(best);
  };

  const hoverRow = hover != null ? rows[hover] : null;

  return (
    <Card>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Clients
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-violet-500" /> Professionals
          </span>
        </div>
        <div className="inline-flex items-center rounded-full bg-surface-container-low border border-outline-variant/40 p-0.5">
          {(["day", "month", "year"] as Range[]).map((r) => {
            const on = range === r;
            return (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all capitalize",
                  on
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>
      <div ref={scrollRef} className="w-full overflow-x-auto overflow-y-hidden">
        <div style={{ width: W, position: "relative" }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            width={W}
            height={H}
            className="block touch-pan-x"
            onPointerMove={onSvgMove}
            onPointerLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id="ugClient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="ugPro" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
            </defs>
            {gridY.map((y, i) => (
              <line
                key={i}
                x1={PADX}
                x2={W - PADX}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeDasharray="2 4"
              />
            ))}
            <path d={areaFor("client")} fill="url(#ugClient)" />
            <path d={areaFor("pro")} fill="url(#ugPro)" />
            <path
              d={pathFor("client")}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d={pathFor("pro")}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {hover != null && (
              <line
                x1={xAt(hover)}
                x2={xAt(hover)}
                y1={PADY}
                y2={PADY + innerH}
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeDasharray="2 3"
              />
            )}
            {rows.map((r, i) => (
              <g key={i}>
                <circle
                  cx={xAt(i)}
                  cy={yAt(r.client)}
                  r={hover === i ? 5 : 2.5}
                  fill="hsl(var(--primary))"
                />
                <circle cx={xAt(i)} cy={yAt(r.pro)} r={hover === i ? 5 : 2.5} fill="#8b5cf6" />
              </g>
            ))}
            {rows.map((r, i) => {
              // Skip every-other label on dense ranges to avoid overlap.
              const skip = range === "day" ? i % 5 !== 0 : range === "month" ? i % 2 !== 0 : false;
              if (skip) return null;
              return (
                <text
                  key={i}
                  x={xAt(i)}
                  y={H - 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="currentColor"
                  fillOpacity="0.55"
                >
                  {r.label}
                </text>
              );
            })}
          </svg>
          {hoverRow && hover != null && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-outline-variant/40 bg-surface px-2.5 py-1.5 shadow-md text-[11px] font-semibold"
              style={{ left: xAt(hover), top: 4 }}
            >
              <div className="text-on-surface mb-0.5">{hoverRow.label}</div>
              <div className="flex items-center gap-1.5 text-primary">
                <span className="w-2 h-2 rounded-sm bg-primary inline-block" /> Clients ·{" "}
                {hoverRow.client.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 text-violet-600">
                <span className="w-2 h-2 rounded-sm bg-violet-500 inline-block" /> Pros ·{" "}
                {hoverRow.pro.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="mt-2 text-[10px] text-outline">
        Scroll horizontally to view full history · Tap or hover a point for exact values.
      </p>
    </Card>
  );
};

export const DashboardSection = ({
  name,
  onNavigate,
}: {
  name: string;
  onNavigate?: (key: AdminSectionKey) => void;
}) => (
  <div className="space-y-8">
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <SectionHeader
        title={`Welcome, ${name.split(" ")[0]}`}
        subtitle="Real-time condition of the platform — drill into any module from here."
      />
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}
        >
          lock
        </span>
        Dashboard Locked
      </span>
    </div>

    {/* Platform Overview */}
    <div>
      <SectionTitle
        title="Platform Overview"
        hint="Top KPIs across users, accounts, orders, finance & quality"
      />
      <div className="space-y-5">
        {/* Users — 7 items in 2 rows */}
        <div>
          <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">Users</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat
              label="Total Users"
              value="12,487"
              icon={Users}
              tint="bg-primary-container/10 text-primary-container"
            />
            <Stat
              label="Total Clients"
              value="8,210"
              icon={Users}
              tint="bg-primary-container/10 text-primary-container"
            />
            <Stat
              label="Total Professionals"
              value="4,270"
              icon={Briefcase}
              tint="bg-violet-500/10 text-violet-600"
            />
            <Stat
              label="Total Admins"
              value="7"
              icon={ShieldCheck}
              tint="bg-slate-500/10 text-slate-700"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <Stat
              label="Active Professionals"
              value="3,108"
              icon={Activity}
              tint="bg-emerald-500/10 text-emerald-600"
            />
            <Stat
              label="Available Professionals"
              value="942"
              icon={CheckCircle2}
              tint="bg-emerald-500/10 text-emerald-600"
            />
            <Stat
              label="(Pros) In-Trial Phase"
              value="38"
              icon={Clock}
              tint="bg-amber-500/10 text-amber-600"
            />
            <Stat
              label="New This Month"
              value="618"
              icon={Users}
              tint="bg-primary-container/10 text-primary-container"
            />
          </div>
        </div>

        {/* Account Status — between Users and Orders */}
        <div>
          <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">
            Account Status
          </p>
          <Row cols={4}>
            <Stat
              label="Active"
              value="11,842"
              icon={CheckCircle2}
              tint="bg-emerald-500/10 text-emerald-600"
            />
            <Stat
              label="Suspended"
              value="143"
              icon={Clock}
              tint="bg-amber-500/10 text-amber-600"
            />
            <Stat
              label="Blocked"
              value="39"
              icon={AlertTriangle}
              tint="bg-rose-500/10 text-rose-600"
            />
            <Stat
              label="Deleted"
              value="515"
              icon={XCircle}
              tint="bg-slate-500/10 text-slate-600"
            />
          </Row>
        </div>

        <div>
          <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">Orders</p>
          <Row cols={4}>
            <Stat
              label="Active Orders"
              value="328"
              icon={Package}
              tint="bg-primary-container/10 text-primary-container"
            />
            <Stat
              label="Awaiting Payment"
              value="22"
              icon={Clock}
              tint="bg-amber-500/10 text-amber-600"
            />
            <Stat
              label="In Progress"
              value="118"
              icon={Activity}
              tint="bg-primary-container/10 text-primary-container"
            />
            <Stat label="In QA" value="26" icon={Eye} tint="bg-violet-500/10 text-violet-600" />
          </Row>
        </div>
        <div>
          <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">
            Finance
          </p>
          <Row cols={3}>
            <Stat
              label="Escrow Value"
              value="₹78k"
              icon={Wallet}
              tint="bg-primary-container/10 text-primary-container"
            />
            <Stat
              label="Revenue (Month)"
              value="₹184k"
              icon={DollarSign}
              tint="bg-violet-500/10 text-violet-600"
            />
            <Stat
              label="Pending Payouts"
              value="₹22k"
              icon={Clock}
              tint="bg-amber-500/10 text-amber-600"
            />
          </Row>
        </div>
        <div>
          <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">
            Quality
          </p>
          <Row cols={3}>
            <Stat
              label="QA Pending"
              value="26"
              icon={Eye}
              tint="bg-violet-500/10 text-violet-600"
            />
            <Stat
              label="Rework Pending"
              value="9"
              icon={AlertTriangle}
              tint="bg-amber-500/10 text-amber-600"
            />
            <Stat
              label="Open Disputes"
              value="7"
              icon={Gavel}
              tint="bg-rose-500/10 text-rose-600"
            />
          </Row>
        </div>

        {/* User Growth — bottom of Platform Overview */}
        <div>
          <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">
            User Growth · Clients vs Professionals
          </p>
          <UserGrowthChart />
        </div>
      </div>
    </div>

    {/* Workforce Health */}
    <div>
      <SectionTitle title="Workforce Health" hint="Can workforce handle demand?" />
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase">
              Workforce Utilization
            </p>
            <p className="text-3xl font-extrabold text-on-surface mt-2">69.6%</p>
            <div className="mt-3 h-2 rounded-full overflow-hidden bg-slate-200/70 border border-slate-300/50">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: "69.6%" }}
              />
            </div>
            <div className="mt-3">
              <HealthDot status="watch" />
            </div>
          </div>
          <div className="space-y-1">
            <KV k="Active Workforce" v="3,108" />
            <KV k="Available" v="942" tone="text-emerald-600" />
            <KV k="Busy" v="2,166" tone="text-amber-600" />
          </div>
          <div className="space-y-1">
            <KV k="Toggle ON Pros" v="3,108" tone="text-emerald-600" />
            <KV k="Toggle OFF Pros" v="186" tone="text-rose-600" />
            <KV k="Quality Tiers" v="STD · PRM · ELT" />
          </div>
        </div>
        <CTAButton label="Go to Workforce" onClick={() => onNavigate?.("workforce")} />
      </Card>
    </div>

    {/* Service Analytics — between Workforce Health and Demand vs Supply */}
    <div>
      <SectionTitle title="Service Analytics" hint="High-level service metrics" />
      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">
            Overview
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat
              label="Total Services"
              value="42"
              icon={Package}
              tint="bg-primary-container/10 text-primary-container"
            />
            <Stat
              label="Active Services"
              value="37"
              icon={CheckCircle2}
              tint="bg-emerald-500/10 text-emerald-600"
            />
            <Stat
              label="Inactive Services"
              value="5"
              icon={XCircle}
              tint="bg-slate-500/10 text-slate-600"
            />
            <Stat
              label="Categories"
              value="5"
              icon={Layers}
              tint="bg-violet-500/10 text-violet-600"
            />
            <Stat
              label="Subcategories"
              value="18"
              icon={Layers}
              tint="bg-indigo-500/10 text-indigo-600"
            />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">
            Service Health
          </p>
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-[11px] font-semibold text-on-surface-variant uppercase mb-2">
                  Highest Demand
                </p>
                <ul className="space-y-1.5">
                  {[
                    { n: "Website Development", v: 142 },
                    { n: "UI/UX Design", v: 118 },
                    { n: "Social Media Management", v: 96 },
                    { n: "Landing Pages", v: 81 },
                  ].map((r) => (
                    <li key={r.n} className="flex items-center justify-between text-sm">
                      <span className="text-on-surface truncate pr-2">{r.n}</span>
                      <Badge tone="bg-emerald-50 text-emerald-700">{r.v}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-on-surface-variant uppercase mb-2">
                  Lowest Demand
                </p>
                <ul className="space-y-1.5">
                  {[
                    { n: "Cybersecurity Audits", v: 4 },
                    { n: "Data BI Dashboards", v: 6 },
                    { n: "AI/ML Pipelines", v: 8 },
                    { n: "Custom Software", v: 11 },
                  ].map((r) => (
                    <li key={r.n} className="flex items-center justify-between text-sm">
                      <span className="text-on-surface truncate pr-2">{r.n}</span>
                      <Badge tone="bg-slate-100 text-slate-700">{r.v}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-on-surface-variant uppercase mb-2">
                  Capacity Risk
                </p>
                <ul className="space-y-1.5">
                  {[
                    { n: "Mobile App Development", v: "Shortage" },
                    { n: "Video & Motion", v: "Shortage" },
                    { n: "Backend / API", v: "Warning" },
                    { n: "E-Commerce", v: "Warning" },
                  ].map((r) => (
                    <li key={r.n} className="flex items-center justify-between text-sm">
                      <span className="text-on-surface truncate pr-2">{r.n}</span>
                      <Badge
                        tone={
                          r.v === "Shortage"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-amber-50 text-amber-700"
                        }
                      >
                        {r.v}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>

    {/* Demand vs Supply */}
    <div>
      <SectionTitle
        title="Demand vs Supply"
        hint="Most important block — identifies hiring needs"
      />
      <Card className="!p-0 overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2.5 border-b border-surface-container-high text-[10px] font-bold uppercase tracking-wider text-outline">
          <div className="col-span-5">Category</div>
          <div className="col-span-2 text-right">Demand</div>
          <div className="col-span-2 text-right">Supply</div>
          <div className="col-span-3 text-right">Status</div>
        </div>
        <ul className="divide-y divide-surface-container-high/60">
          {[
            { c: "Video Editing", d: 120, s: 105, st: "shortage" as const },
            { c: "Graphic Design", d: 85, s: 110, st: "healthy" as const },
            { c: "Content Writing", d: 96, s: 88, st: "watch" as const },
            { c: "Web Development", d: 64, s: 72, st: "healthy" as const },
            { c: "Mobile Development", d: 41, s: 28, st: "shortage" as const },
            { c: "Brand Strategy", d: 22, s: 31, st: "healthy" as const },
          ].map((r) => (
            <li key={r.c} className="grid grid-cols-12 items-center px-4 py-2.5 text-sm">
              <div className="col-span-5 font-semibold text-on-surface">{r.c}</div>
              <div className="col-span-2 text-right font-bold">{r.d}</div>
              <div className="col-span-2 text-right font-bold">{r.s}</div>
              <div className="col-span-3 flex justify-end">
                <HealthDot status={r.st} />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>

    {/* Hiring Intelligence */}
    <div>
      <SectionTitle title="Hiring Intelligence" />
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-outline mb-2">
              Current Hiring Status
            </p>
            <KV k="Categories Hiring" v="4" tone="text-rose-600" />
            <KV k="Categories Full" v="11" tone="text-emerald-600" />
            <KV k="Categories Overstaffed" v="2" tone="text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-outline mb-2">
              Quick Numbers
            </p>
            <KV k="New Applications" v="18" />
            <KV k="Trial Reviews Pending" v="9" />
            <KV k="Hiring Decisions Pending" v="5" />
          </div>
        </div>
        <CTAButton label="Go to Workforce" onClick={() => onNavigate?.("workforce")} />
      </Card>
    </div>

    {/* Order Pipeline */}
    <div>
      <SectionTitle title="Order Pipeline Snapshot" />
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <Pipe label="Awaiting Review" count={14} tint="bg-amber-50 text-amber-700" />
          <Pipe label="Awaiting Payment" count={22} tint="bg-amber-50 text-amber-700" />
          <Pipe
            label="Ready for Assignment"
            count={9}
            tint="bg-primary-container/10 text-primary-container"
          />
          <Pipe label="Assigned" count={47} tint="bg-primary-container/10 text-primary-container" />
          <Pipe
            label="In Progress"
            count={118}
            tint="bg-primary-container/10 text-primary-container"
          />
          <Pipe label="QA Review" count={26} tint="bg-violet-50 text-violet-700" />
          <Pipe label="Delivered" count={61} tint="bg-emerald-50 text-emerald-700" />
          <Pipe label="Disputed" count={7} tint="bg-rose-50 text-rose-700" />
        </div>
        <CTAButton label="Go to Orders Desk" onClick={() => onNavigate?.("orders")} />
      </Card>
    </div>

    {/* Assignment Health (includes Assignment Engine analytics) */}
    <div>
      <SectionTitle
        title="Assignment Health"
        hint="Engine performance, capacity insights, rejection intelligence & rules snapshot"
      />
      <div className="space-y-4">
        {/* Overview metrics */}
        <Card>
          <p className="text-[11px] font-bold uppercase tracking-wider text-outline mb-3">
            Assignment Overview
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
                Success Rate
              </p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">94.2%</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
                Failure Rate
              </p>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">5.8%</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
                Avg Assignment Time
              </p>
              <p className="text-2xl font-extrabold text-on-surface mt-1">3.4m</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
                Pool Exhaustion Rate
              </p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">4.1%</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
                Capacity Alerts
              </p>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">2</p>
            </div>
          </div>
        </Card>

        {/* Capacity Insights */}
        <Card>
          <p className="text-[11px] font-bold uppercase tracking-wider text-outline mb-3">
            Capacity Insights — Category Wise
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase mb-2">
                High Demand
              </p>
              <ul className="space-y-1.5">
                {[
                  { n: "Video Editing", v: 142 },
                  { n: "UI/UX Design", v: 118 },
                  { n: "Mobile Development", v: 96 },
                ].map((r) => (
                  <li key={r.n} className="flex items-center justify-between text-sm">
                    <span className="text-on-surface truncate pr-2">{r.n}</span>
                    <Badge tone="bg-emerald-50 text-emerald-700">{r.v}</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase mb-2">
                Shortage
              </p>
              <ul className="space-y-1.5">
                {[
                  { n: "Video Editing", v: "Shortage" },
                  { n: "UI/UX Design", v: "Critical" },
                  { n: "SEO", v: "Low" },
                ].map((r) => (
                  <li key={r.n} className="flex items-center justify-between text-sm">
                    <span className="text-on-surface truncate pr-2">{r.n}</span>
                    <Badge tone="bg-rose-50 text-rose-700">{r.v}</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase mb-2">
                Surplus
              </p>
              <ul className="space-y-1.5">
                {[
                  { n: "Graphic Design", v: "+24" },
                  { n: "Brand Strategy", v: "+9" },
                ].map((r) => (
                  <li key={r.n} className="flex items-center justify-between text-sm">
                    <span className="text-on-surface truncate pr-2">{r.n}</span>
                    <Badge tone="bg-slate-100 text-slate-700">{r.v}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Rejection Intelligence */}
        <Card>
          <p className="text-[11px] font-bold uppercase tracking-wider text-outline mb-3">
            Rejection Intelligence
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase mb-2">
                Rejection Reasons
              </p>
              <ul className="space-y-1.5">
                {[
                  { n: "Too Busy", v: "38%" },
                  { n: "Low Budget", v: "22%" },
                  { n: "Skills Don't Match", v: "17%" },
                  { n: "Timeline Too Tight", v: "14%" },
                  { n: "Personal Reason", v: "9%" },
                ].map((r) => (
                  <li key={r.n} className="flex items-center justify-between text-sm">
                    <span className="text-on-surface">{r.n}</span>
                    <Badge tone="bg-amber-50 text-amber-700">{r.v}</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase mb-2">
                Insights
              </p>
              <KV k="Most Common Reason" v="Too Busy" tone="text-amber-600" />
              <KV k="Top Decline Category" v="Video Editing" tone="text-rose-600" />
              <KV k="Avg Response Time" v="2m 18s" />
              <KV k="Acceptance Trend (7d)" v="↑ 4.2%" tone="text-emerald-600" />
            </div>
          </div>
        </Card>

        {/* Assignment Configuration (Read Only) */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-outline">
              Assignment Configuration · Read Only
            </p>
            <Badge tone="bg-slate-100 text-slate-700">Not editable here</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <InfoChip k="Pool Limit" v="15" />
            <InfoChip k="Match Threshold" v="75%" />
            <InfoChip k="Request Timeout" v="5m" />
            <InfoChip k="Pool Expiry Time" v="30m" />
            <InfoChip k="Retry Attempts" v="2" />
          </div>
          <button
            onClick={() => onNavigate?.("rules")}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            Manage Assignment Rules
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              arrow_forward
            </span>
          </button>
        </Card>

        <CTAButton label="Go to Assignment Engine" onClick={() => onNavigate?.("assignments")} />
      </div>
    </div>

    {/* QA Health */}
    <div>
      <SectionTitle title="QA Health" />
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              Pending QA
            </p>
            <p className="text-2xl font-extrabold mt-1">26</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              Rework Queue
            </p>
            <p className="text-2xl font-extrabold mt-1">9</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              Approval Rate
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">87%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              Rejection Rate
            </p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">13%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              Avg QA Time
            </p>
            <p className="text-2xl font-extrabold mt-1">42m</p>
          </div>
        </div>
        <CTAButton label="Go to QA Desk" onClick={() => onNavigate?.("qa")} />
      </Card>
    </div>

    {/* Financial Snapshot */}
    <div>
      <SectionTitle title="Financial Snapshot" />
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              Revenue (Mo)
            </p>
            <p className="text-xl font-extrabold mt-1">₹184k</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">Escrow</p>
            <p className="text-xl font-extrabold mt-1">₹78k</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              Pending Releases
            </p>
            <p className="text-xl font-extrabold text-amber-600 mt-1">₹14k</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              Pending Refunds
            </p>
            <p className="text-xl font-extrabold text-rose-600 mt-1">₹3.4k</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              Pending Payouts
            </p>
            <p className="text-xl font-extrabold text-amber-600 mt-1">₹22k</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">Margin %</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-1">32%</p>
          </div>
        </div>
        <CTAButton label="Go to Finance & Escrow" onClick={() => onNavigate?.("finance")} />
      </Card>
    </div>

    {/* Dispute Snapshot */}
    <div>
      <SectionTitle title="Dispute Snapshot" />
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">Open</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">7</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              Under Review
            </p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">4</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">Escalated</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">2</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              Resolved (Mo)
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">31</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              Avg Resolution
            </p>
            <p className="text-2xl font-extrabold mt-1">1.8d</p>
          </div>
        </div>
        <CTAButton label="Go to Disputes Center" onClick={() => onNavigate?.("disputes")} />
      </Card>
    </div>

    {/* Security Snapshot */}
    <div>
      <SectionTitle title="Security Snapshot" />
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              Suspicious Activities
            </p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">12</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              Blocked Accounts
            </p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">11</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              Failed Logins
            </p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">38</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              High Risk Accounts
            </p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">4</p>
          </div>
        </div>
        <CTAButton label="Go to Security" onClick={() => onNavigate?.("security")} />
      </Card>
    </div>

    {/* System Health */}
    <div>
      <SectionTitle title="System Health" />
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { l: "API Health", v: "Operational", s: "healthy" as const },
            { l: "Queue Health", v: "Operational", s: "healthy" as const },
            { l: "Notification Delivery", v: "98.4%", s: "watch" as const },
            { l: "Payment Gateway", v: "Operational", s: "healthy" as const },
            { l: "Storage Usage", v: "62%", s: "watch" as const },
            { l: "Incident Status", v: "All clear", s: "healthy" as const },
          ].map((r) => (
            <div
              key={r.l}
              className="flex items-center justify-between rounded-xl border border-outline-variant/30 px-3 py-2.5 bg-surface-container-low"
            >
              <div>
                <p className="text-[10px] uppercase tracking-wider text-outline font-bold">{r.l}</p>
                <p className="text-sm font-bold text-on-surface mt-0.5">{r.v}</p>
              </div>
              <HealthDot status={r.s} />
            </div>
          ))}
        </div>
        <CTAButton label="Go to System" onClick={() => onNavigate?.("system")} />
      </Card>
    </div>

    {/* Critical Alerts */}
    <div>
      <SectionTitle title="Critical Alerts" hint="Highest priority — clickable" />
      <Card>
        <ul className="divide-y divide-surface-container-high/60 text-sm">
          {[
            {
              i: "warning",
              t: "Assignment failure rate exceeded threshold (5.8%)",
              tone: "text-rose-600",
            },
            { i: "groups", t: "Video Editing category shortage detected", tone: "text-rose-600" },
            {
              i: "rate_review",
              t: "15 QA reviews pending beyond target SLA",
              tone: "text-amber-600",
            },
            { i: "account_balance", t: "Escrow release backlog detected", tone: "text-amber-600" },
            { i: "credit_card_off", t: "Payment gateway incident detected", tone: "text-rose-600" },
            { i: "shield", t: "New fraud risk account detected", tone: "text-rose-600" },
          ].map((a, i) => (
            <li
              key={i}
              className="flex items-center justify-between py-3 cursor-pointer hover:bg-surface-container-low/40 rounded-lg px-2 -mx-2 transition-colors"
            >
              <span className="inline-flex items-center gap-3">
                <span className={cn("material-symbols-outlined", a.tone)} style={{ fontSize: 18 }}>
                  {a.i}
                </span>
                <span className="text-on-surface">{a.t}</span>
              </span>
              <span className="material-symbols-outlined text-outline" style={{ fontSize: 16 }}>
                arrow_forward
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>

    {/* Quick Actions */}
    <div>
      <SectionTitle title="Quick Actions" hint="Frequently used" />
      <Card>
        <div className="space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold mb-2">
              Create
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Create Admin", key: "access" as AdminSectionKey },
                { label: "Create Service Category", key: "services" as AdminSectionKey },
                { label: "Create Discount Campaign", key: null },
                { label: "Broadcast Notification", key: "notifications" as AdminSectionKey },
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={() =>
                    b.key ? onNavigate?.(b.key) : toast("Discount campaigns coming soon")
                  }
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors"
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold mb-2">
              Review
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Review Applications", key: "workforce" as AdminSectionKey },
                { label: "Review Orders", key: "orders" as AdminSectionKey },
                { label: "Review Disputes", key: "disputes" as AdminSectionKey },
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={() => onNavigate?.(b.key)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-surface border border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold mb-2">
              Configure
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Platform Rules", key: "rules" as AdminSectionKey },
                { label: "Policies", key: "policies" as AdminSectionKey },
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={() => onNavigate?.(b.key)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-surface border border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

export default DashboardSection;
