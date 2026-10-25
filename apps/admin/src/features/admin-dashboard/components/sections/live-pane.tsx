import { useEffect, useMemo, useState } from "react";
import { XCircle } from "lucide-react";
import { cn } from "@jobrio/utils/utils";

type QueueKey = "approval" | "execution" | "review" | "risk" | "alerts";

type WorkItem = {
  id: string;
  queue: QueueKey;
  kind: string;
  title: string;
  body: string;
  actions: string[]; // Close is always added
  createdAt: number;
};

const now = Date.now();
const SEED_LIVE: WorkItem[] = [
  {
    id: "W1",
    queue: "approval",
    kind: "Professional Application",
    title: "New Professional Application",
    body: "Riya S. — UI/UX, 5 yrs exp.",
    actions: ["Review", "Approve", "Reject", "Request Info"],
    createdAt: now - 30 * 1000,
  },
  {
    id: "W2",
    queue: "approval",
    kind: "Final Hiring Decision",
    title: "Final Hiring Decision Pending",
    body: "Manish K. completed all trials.",
    actions: ["Hire", "Reject"],
    createdAt: now - 3 * 60 * 1000,
  },
  {
    id: "W3",
    queue: "approval",
    kind: "New Order",
    title: "New Order #JR-1042",
    body: "Acme Co. — Logo Design — ₹480",
    actions: ["Review", "Accept", "Reject"],
    createdAt: now - 6 * 60 * 1000,
  },
  {
    id: "W4",
    queue: "execution",
    kind: "Trial Setup",
    title: "Trial Setup Required",
    body: "Applicant: Neha P. — Content Writer",
    actions: ["Create Trial", "Assign Trial"],
    createdAt: now - 8 * 60 * 1000,
  },
  {
    id: "W5",
    queue: "execution",
    kind: "Payment Received",
    title: "Payment Received",
    body: "Order #JR-1041 — ₹1,200 settled",
    actions: ["Trigger Assignment", "Hold"],
    createdAt: now - 11 * 60 * 1000,
  },
  {
    id: "W6",
    queue: "execution",
    kind: "Assignment Failure",
    title: "Assignment Failure",
    body: "Pool exhausted for Order #JR-1037",
    actions: ["Review", "Retry", "Escalate"],
    createdAt: now - 14 * 60 * 1000,
  },
  {
    id: "W7",
    queue: "review",
    kind: "Trial Submitted",
    title: "Trial Submitted",
    body: "Aman G. — Trial 2 of 3",
    actions: ["Review", "Approve", "Rework", "Reject"],
    createdAt: now - 17 * 60 * 1000,
  },
  {
    id: "W8",
    queue: "review",
    kind: "QA Pending",
    title: "QA Pending",
    body: "Order #JR-1029 — awaiting review",
    actions: ["Review", "Approve", "Rework"],
    createdAt: now - 19 * 60 * 1000,
  },
  {
    id: "W9",
    queue: "risk",
    kind: "Dispute Raised",
    title: "Dispute Raised #DSP-118",
    body: "Order #JR-1031 — quality complaint",
    actions: ["Review", "Refund", "Reject", "Escalate"],
    createdAt: now - 22 * 60 * 1000,
  },
  {
    id: "W10",
    queue: "risk",
    kind: "Escrow Release",
    title: "Escrow Release Pending",
    body: "Order #JR-1027 — ₹640 held 7d",
    actions: ["Release", "Hold"],
    createdAt: now - 25 * 60 * 1000,
  },
  {
    id: "W11",
    queue: "alerts",
    kind: "Workforce Shortage",
    title: "Workforce Shortage",
    body: "Elite tier · Content category < 3 pros",
    actions: ["Open"],
    createdAt: now - 4 * 60 * 1000,
  },
  {
    id: "W12",
    queue: "alerts",
    kind: "Payment Failure",
    title: "Payment Failure",
    body: "Card declined on Order #JR-1043",
    actions: ["Open"],
    createdAt: now - 9 * 60 * 1000,
  },
];

const QUEUE_META: Record<QueueKey, { label: string; icon: string; tint: string }> = {
  approval: {
    label: "Approval Queue",
    icon: "approval",
    tint: "text-primary-container bg-primary-container/10",
  },
  execution: {
    label: "Execution Queue",
    icon: "play_circle",
    tint: "text-emerald-600 bg-emerald-500/10",
  },
  review: { label: "Review Queue", icon: "rate_review", tint: "text-violet-600 bg-violet-500/10" },
  risk: { label: "Risk Queue", icon: "report", tint: "text-rose-600 bg-rose-500/10" },
  alerts: {
    label: "Alerts Queue",
    icon: "notifications_active",
    tint: "text-amber-600 bg-amber-500/10",
  },
};

const formatRelative = (createdAt: number, tick: number) => {
  const diff = Math.max(0, tick - createdAt);
  const s = Math.floor(diff / 1000);
  if (s < 10) return "Just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
};

export const LivePane = () => {
  const [items, setItems] = useState(SEED_LIVE);
  const [tick, setTick] = useState(Date.now());
  const [activeQ, setActiveQ] = useState<QueueKey | "all">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const close = (id: string) => setItems((arr) => arr.filter((i) => i.id !== id));

  const counts = useMemo(() => {
    const c: Record<QueueKey, number> = {
      approval: 0,
      execution: 0,
      review: 0,
      risk: 0,
      alerts: 0,
    };
    items.forEach((i) => c[i.queue]++);
    return c;
  }, [items]);

  const visible = activeQ === "all" ? items : items.filter((i) => i.queue === activeQ);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveQ("all")}
          className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            activeQ === "all"
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface border-outline-variant/40 text-on-surface-variant",
          )}
        >
          All · {items.length}
        </button>
        {(Object.keys(QUEUE_META) as QueueKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setActiveQ(k)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              activeQ === k
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface border-outline-variant/40 text-on-surface-variant",
            )}
          >
            {QUEUE_META[k].label.split(" ")[0]} · {counts[k]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-10 text-on-surface-variant text-xs">
          <span
            className="material-symbols-outlined block mb-2 opacity-40"
            style={{ fontSize: 32 }}
          >
            inbox
          </span>
          All caught up — workspace clear.
        </div>
      ) : (
        visible.map((it) => {
          const M = QUEUE_META[it.queue];
          return (
            <div
              key={it.id}
              className="bg-surface-container-low rounded-3xl border border-outline-variant/30 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                    M.tint,
                  )}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
                  >
                    {M.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
                    {it.kind}
                  </p>
                  <p className="text-xs font-bold text-on-surface truncate">{it.title}</p>
                  <p className="text-[11px] text-on-surface-variant leading-snug mt-0.5">
                    {it.body}
                  </p>
                  {mounted && (
                    <p className="text-[10px] text-outline mt-1">
                      {formatRelative(it.createdAt, tick)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {it.actions.map((a, i) => (
                  <button
                    key={a}
                    onClick={() => {
                      /* surface-only mock */
                    }}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
                      i === 0
                        ? "bg-primary text-on-primary shadow-sm hover:opacity-90"
                        : "bg-surface-container-low border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container",
                    )}
                  >
                    {a}
                  </button>
                ))}
                <button
                  onClick={() => close(it.id)}
                  title="Close removes this from workspace view only. Full record remains in Screen 1."
                  className="ml-auto px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-container-low border border-outline-variant/40 text-on-surface-variant hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition inline-flex items-center gap-1"
                >
                  <XCircle size={12} /> Close
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default LivePane;
