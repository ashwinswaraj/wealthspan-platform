import { useState } from "react";
import { cn } from "@jobrio/utils/utils";
import { toast } from "sonner";
import { Button, MessagesInbox, type MessageThread } from "@jobrio/ui/design-system";
import { SectionHeader, Card } from "@/components/dashboard/shared";
import { useOrderRegistry, updateOrderInRegistry, type OrderStatus } from "@jobrio/constants";

/* ----------------------- Helpers ----------------------- */

const Metric = ({
  icon,
  iconCls,
  iconFilled,
  label,
  value,
}: {
  icon: string;
  iconCls: string;
  iconFilled?: boolean;
  label: string;
  value: string;
}) => (
  <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-3xl flex flex-col justify-between min-h-[160px]">
    <div>
      <span
        className={cn("material-symbols-outlined mb-4 block", iconCls)}
        style={iconFilled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {icon}
      </span>
      <p className="text-outline text-sm">{label}</p>
    </div>
    <h2 className="font-headline text-2xl font-extrabold text-on-surface">{value}</h2>
  </div>
);

const Badge = ({ text, cls }: { text: string; cls: string }) => (
  <span
    className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight", cls)}
  >
    {text}
  </span>
);

/* ----------------------- Home ----------------------- */

export const ProHomeSection = ({
  name,
  onNavigate,
}: {
  name: string;
  onNavigate?: (key: "available-jobs" | "my-tasks" | "messages" | "earnings") => void;
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <Metric icon="work_history" iconCls="text-primary-container" label="Active Jobs" value="6" />
      <Metric
        icon="hourglass_top"
        iconCls="text-amber-500"
        iconFilled
        label="Pending Review"
        value="2"
      />
      <Metric
        icon="account_balance_wallet"
        iconCls="text-emerald-500"
        iconFilled
        label="Available Earnings"
        value="₹4,820.50"
      />
      <Metric
        icon="trending_up"
        iconCls="text-primary-container"
        label="Total Earned"
        value="₹32,140.00"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-8 bg-surface-container-low rounded-3xl border border-outline-variant/30 overflow-hidden">
        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
          <h3 className="text-xl font-extrabold font-headline text-slate-900">Recent Activity</h3>
          <button
            type="button"
            onClick={() => onNavigate?.("my-tasks")}
            className="text-sm font-semibold text-primary-container hover:underline"
          >
            View All
          </button>
        </div>
        <div className="divide-y divide-outline-variant/20 px-2">
          {[
            {
              icon: "chat",
              bg: "bg-primary/10 text-primary",
              badge: { text: "New Message", cls: "bg-primary/10 text-primary" },
              meta: "Just now",
              title: "NovaTech Labs sent a message",
              desc: '"Can you share an updated mockup before EOD?"',
              cta: "Reply",
              go: "messages" as const,
            },
            {
              icon: "assignment_turned_in",
              bg: "bg-surface-container text-primary-container",
              badge: { text: "In Progress", cls: "bg-primary-container/10 text-primary-container" },
              meta: "#JB-90210",
              title: "Modern SaaS Platform UI/UX Redesign",
              desc: "Client: NovaTech Labs",
              cta: "Open",
              go: "my-tasks" as const,
            },
            {
              icon: "verified",
              bg: "bg-surface-container text-emerald-600",
              badge: { text: "Approved", cls: "bg-emerald-500/10 text-emerald-600" },
              meta: "#JB-72199",
              title: "Enterprise SEO Audit & Strategy",
              desc: "Released to wallet: ₹1,200.00",
              cta: "View",
              go: "my-tasks" as const,
            },
            {
              icon: "payments",
              bg: "bg-surface-container-low text-primary-container",
              badge: { text: "Invoice Paid", cls: "bg-amber-500/10 text-amber-600" },
              meta: "#INV-2026-118",
              title: "Payout processed to your wallet",
              desc: "Amount: ₹980.00",
              cta: "Receipt",
              go: "earnings" as const,
            },
          ].map((row) => (
            <div
              key={row.title}
              className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:bg-surface-container/40 rounded-2xl transition-colors"
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0",
                  row.bg,
                )}
              >
                <span className="material-symbols-outlined text-3xl">{row.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge text={row.badge.text} cls={row.badge.cls} />
                  <span className="text-xs text-outline">{row.meta}</span>
                </div>
                <h3 className="text-sm font-semibold text-on-surface truncate">{row.title}</h3>
                <p className="text-xs text-outline mt-0.5">{row.desc}</p>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="rounded-full"
                onClick={"go" in row && row.go ? () => onNavigate?.(row.go) : undefined}
              >
                {row.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30">
          <h3 className="font-headline text-lg font-extrabold text-on-surface mb-2">
            Your next assignment
          </h3>
          <p className="text-sm text-outline mb-6">
            Jobrio auto-assigns jobs that match your skills, capacity and rating — no bidding, no
            proposals.
          </p>
          <Button
            variant="primary"
            size="lg"
            block
            className="py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => onNavigate?.("available-jobs")}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              inbox
            </span>
            View Assigned Jobs
          </Button>
        </div>

        <div className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30">
          <h4 className="text-sm font-semibold text-on-surface mb-4">Performance this month</h4>
          <div className="space-y-3 text-sm">
            {[
              { l: "On-time delivery", v: "98%" },
              { l: "Client rating", v: "4.9 / 5" },
              { l: "Response time", v: "< 1h" },
              { l: "Repeat clients", v: "62%" },
            ].map((row) => (
              <div key={row.l} className="flex justify-between">
                <span className="text-outline">{row.l}</span>
                <span className="font-semibold text-on-surface">{row.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30">
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-primary-container shrink-0">
              verified_user
            </span>
            <div>
              <p className="text-sm font-semibold text-on-surface">Verified Professional</p>
              <p className="text-xs text-outline mt-1">
                Your identity and skills are verified — keep delivering quality work to maintain
                your trust score.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ----------------------- Available Jobs ----------------------- */

const JOBS = [
  {
    id: "JB-90315",
    title: "Mobile App Onboarding Redesign",
    client: "FinPay Inc.",
    budget: "₹1,200",
    deadline: "May 22, 2026",
    skills: ["UI/UX", "Figma", "Mobile"],
    matched: 96,
  },
  {
    id: "JB-90316",
    title: "Marketing Site Build (Next.js)",
    client: "BrightWave",
    budget: "₹3,500",
    deadline: "Jun 02, 2026",
    skills: ["Next.js", "Tailwind", "CMS"],
    matched: 88,
  },
  {
    id: "JB-90317",
    title: "Brand Identity Refresh",
    client: "Lumen Studio",
    budget: "₹900",
    deadline: "May 25, 2026",
    skills: ["Branding", "Illustrator"],
    matched: 79,
  },
  {
    id: "JB-90318",
    title: "API Performance Audit",
    client: "ShipDeck",
    budget: "₹2,100",
    deadline: "May 30, 2026",
    skills: ["Node.js", "Postgres", "Profiling"],
    matched: 73,
  },
];

export const AvailableJobsSection = ({ available = true }: { available?: boolean }) => {
  const [jobs, setJobs] = useState(JOBS);

  const accept = (id: string) => {
    setJobs((arr) => arr.filter((j) => j.id !== id));
    toast.success(`Assignment ${id} accepted`, {
      description: "Now visible under My Tasks — work in progress.",
      duration: 2500,
    });
  };
  const decline = (id: string) => {
    setJobs((arr) => arr.filter((j) => j.id !== id));
    toast(`Assignment ${id} declined`, {
      description: "It has been returned to the assignment pool.",
      duration: 2200,
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Assigned Jobs"
        subtitle="Jobs auto-assigned to you by Jobrio. Accept to start, or decline with a reason."
      />
      {!available ? (
        <Card className="flex flex-col items-center text-center gap-2 py-12">
          <span className="material-symbols-outlined text-[32px] text-outline">work_off</span>
          <p className="font-headline font-extrabold text-lg text-on-surface">You're inactive</p>
          <p className="text-sm text-on-surface-variant max-w-md">
            Turn on the Active toggle in the top bar to start receiving job assignment requests.
            While inactive, Jobrio will not send you any new work.
          </p>
        </Card>
      ) : jobs.length === 0 ? (
        <Card className="flex flex-col items-center text-center gap-2 py-12">
          <span className="material-symbols-outlined text-[32px] text-outline">inbox</span>
          <p className="font-headline font-extrabold text-lg text-on-surface">
            No pending assignments
          </p>
          <p className="text-sm text-on-surface-variant max-w-md">
            You're all caught up — new job assignments will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((j) => (
            <Card key={j.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-outline">
                    {j.id} • {j.client}
                  </p>
                  <h3 className="font-headline font-extrabold text-lg text-on-surface mt-1">
                    {j.title}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                  {j.matched}% match
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {j.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-outline">
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">paid</span>
                  <span className="font-semibold text-on-surface">{j.budget}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">event</span>
                  {j.deadline}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1 rounded-full"
                  onClick={() => accept(j.id)}
                >
                  Accept Assignment
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                  onClick={() => decline(j.id)}
                >
                  Decline
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

/* ----------------------- My Tasks ----------------------- */

const STATUS_CLS: Record<string, string> = {
  "in-progress": "bg-primary-container/10 text-primary-container",
  revision: "bg-rose-50 text-rose-700",
  completed: "bg-emerald-50 text-emerald-700",
};

// Map a real order lifecycle status to this widget's display status/progress.
const TASK_VIEW: Partial<Record<OrderStatus, { status: string; progress: number }>> = {
  assigned: { status: "in-progress", progress: 10 },
  progress: { status: "in-progress", progress: 50 },
  qa: { status: "in-progress", progress: 80 },
  rework: { status: "revision", progress: 60 },
  delivered: { status: "completed", progress: 100 },
};

// The forward step "Update" takes for a live assignment — mirrors the real
// order lifecycle (assigned → progress → qa) so it shows up for QA review.
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  assigned: "progress",
  progress: "qa",
  rework: "progress",
};

export const MyTasksSection = () => {
  const orders = useOrderRegistry();
  const tasks = orders
    .filter((o) => !!o.pro && !!TASK_VIEW[o.s])
    .map((o) => ({
      id: o.id,
      title: o.service || o.category || "Assignment",
      client: o.c,
      progress: TASK_VIEW[o.s]!.progress,
      status: TASK_VIEW[o.s]!.status,
      due: o.deadline,
      s: o.s,
    }));

  const advance = (orderId: string, current: OrderStatus) => {
    const next = NEXT_STATUS[current];
    if (!next) {
      toast("Nothing further to update — awaiting QA / client review.");
      return;
    }
    updateOrderInRegistry(orderId, { s: next });
    toast.success(
      next === "qa" ? `#${orderId} submitted for QA review` : `#${orderId} marked In Progress`,
      { duration: 2200 },
    );
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="My Tasks" subtitle="All your active and recent client engagements." />
      <Card className="!p-0 overflow-hidden">
        {tasks.length === 0 ? (
          <p className="text-sm text-on-surface-variant p-8 text-center">
            No active assignments right now.
          </p>
        ) : (
          <div className="divide-y divide-outline-variant/20">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge text={t.status.replace("-", " ")} cls={STATUS_CLS[t.status]} />
                    <span className="text-[11px] text-outline">
                      #{t.id} • {t.client}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-on-surface">{t.title}</p>
                  <div className="mt-3 h-1.5 bg-surface-container rounded-full overflow-hidden max-w-md">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${t.progress}%`,
                        background: "linear-gradient(135deg,#004AC6,#004AC6)",
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-outline mt-1">
                    {t.progress}% • Due {t.due}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="px-4 py-2 rounded-full text-xs font-semibold border border-outline-variant/40 text-outline">
                    Details shown above
                  </span>
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-full"
                    onClick={() => advance(t.id, t.s)}
                  >
                    Update
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

/* ----------------------- Messages ----------------------- */

const PRO_THREADS: MessageThread[] = [
  {
    id: "#JB-90210",
    name: "NovaTech Labs",
    meta: "Client",
    orderTitle: "Modern SaaS Platform UI/UX Redesign",
    last: "Can you share an updated mockup before EOD?",
    time: "2m",
    unread: 2,
    status: "In progress",
    messages: [
      {
        id: "m1",
        from: "them",
        text: "Hey! How is the dashboard screen coming along?",
        time: "09:10",
      },
      {
        id: "m2",
        from: "me",
        text: "Almost done — polishing the empty states now.",
        time: "09:18",
      },
      {
        id: "m3",
        from: "them",
        text: "Can you share an updated mockup before EOD?",
        time: "09:22",
      },
    ],
  },
  {
    id: "#JB-88421",
    name: "ShopWave",
    meta: "Client",
    orderTitle: "E-commerce App Prototyping",
    last: "Loved the prototype, minor tweaks attached.",
    time: "1h",
    unread: 0,
    status: "Revision",
    messages: [
      {
        id: "m1",
        from: "them",
        text: "Loved the prototype, minor tweaks attached.",
        time: "10:35",
        attachment: "feedback-round-1.pdf",
      },
      { id: "m2", from: "me", text: "On it — will push the revision by tomorrow.", time: "10:50" },
    ],
  },
  {
    id: "#JB-72199",
    name: "GrowthKings",
    meta: "Client",
    orderTitle: "Enterprise SEO Audit & Strategy",
    last: "Final report approved — payment released.",
    time: "1d",
    unread: 1,
    status: "Completed",
    messages: [
      {
        id: "m1",
        from: "me",
        text: "Final audit report is uploaded.",
        time: "Yesterday",
        attachment: "seo-audit.pdf",
      },
      {
        id: "m2",
        from: "them",
        text: "Final report approved — payment released.",
        time: "Yesterday",
      },
    ],
  },
];

export const ProMessagesSection = () => (
  <MessagesInbox
    title="Messages"
    description="One chat per job — stay in sync with your clients."
    threads={PRO_THREADS}
    counterpartyLabel="client"
  />
);

/* ----------------------- Earnings ----------------------- */

export const EarningsSection = () => (
  <div className="space-y-6">
    <SectionHeader title="Earnings & Invoices" subtitle="Payouts, escrow, and invoice history." />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <Metric icon="lock" iconCls="text-amber-500" iconFilled label="In Escrow" value="₹2,400.00" />
      <Metric
        icon="account_balance_wallet"
        iconCls="text-emerald-500"
        iconFilled
        label="Available"
        value="₹4,820.50"
      />
      <Metric
        icon="trending_up"
        iconCls="text-primary-container"
        label="Lifetime"
        value="₹32,140.00"
      />
    </div>
    <Card className="!p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
        <h3 className="font-headline font-extrabold text-base text-on-surface">Recent Invoices</h3>
        <button
          className="text-sm font-semibold text-primary-container hover:underline"
          onClick={() => {
            const csv =
              "Invoice,Amount,Status\n" +
              "See invoice history in this dashboard,local-state,available";
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "jobrio-invoices.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export
        </button>
      </div>
      <div className="divide-y divide-outline-variant/20">
        {[
          {
            id: "INV-2026-118",
            client: "GrowthKings",
            amount: "₹980.00",
            status: "Paid",
            date: "May 10",
          },
          {
            id: "INV-2026-110",
            client: "NovaTech Labs",
            amount: "₹2,400.00",
            status: "Escrow",
            date: "May 04",
          },
          {
            id: "INV-2026-099",
            client: "ShopWave",
            amount: "₹1,150.00",
            status: "Pending",
            date: "Apr 28",
          },
        ].map((r) => (
          <div key={r.id} className="px-6 py-4 flex items-center gap-4 text-sm">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-on-surface">{r.id}</p>
              <p className="text-[11px] text-outline">
                {r.client} • {r.date}
              </p>
            </div>
            <span className="font-bold text-on-surface">{r.amount}</span>
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                r.status === "Paid"
                  ? "bg-emerald-50 text-emerald-700"
                  : r.status === "Escrow"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-primary-container/10 text-primary-container",
              )}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

/* ----------------------- Wallet ----------------------- */

export const ProWalletSection = () => {
  const [balance, setBalance] = useState(4820.5);
  const [lastPayout, setLastPayout] = useState("₹980.00 on May 10");

  const withdraw = () => {
    if (balance <= 0) {
      toast.error("No balance available to withdraw");
      return;
    }
    const amount = balance;
    setLastPayout(
      `₹${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} on ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
    );
    setBalance(0);
    toast.success(
      `Withdrawal of ₹${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} initiated`,
      {
        description: "Funds will reach your bank account in 1–2 business days.",
        duration: 2800,
      },
    );
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Wallet" subtitle="Manage payouts and balances." />
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-outline font-bold">
              Available Balance
            </p>
            <p className="font-headline text-4xl font-extrabold text-on-surface mt-1">
              ₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-outline mt-1">Last payout: {lastPayout}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="lg"
              className="px-5 py-3 rounded-xl shadow-lg shadow-primary/20 text-base"
              onClick={withdraw}
            >
              Withdraw
            </Button>
            <Button variant="outline" size="lg" className="px-5 py-3 rounded-xl text-base" disabled>
              Payout Settings
            </Button>
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="font-headline font-extrabold text-base text-on-surface mb-4">
          Recent transactions
        </h3>
        <div className="divide-y divide-outline-variant/20">
          {[
            { l: "Payout to bank ••4421", v: "-₹2,000.00", d: "May 08" },
            { l: "Escrow released — JB-72199", v: "+₹1,200.00", d: "May 06" },
            { l: "Invoice paid — INV-2026-110", v: "+₹2,400.00", d: "May 04" },
          ].map((t) => (
            <div key={t.l} className="py-3 flex items-center justify-between text-sm">
              <div>
                <p className="text-on-surface font-medium">{t.l}</p>
                <p className="text-[11px] text-outline">{t.d}</p>
              </div>
              <span
                className={cn(
                  "font-semibold",
                  t.v.startsWith("-") ? "text-rose-600" : "text-emerald-600",
                )}
              >
                {t.v}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
