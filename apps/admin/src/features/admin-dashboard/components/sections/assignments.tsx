import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@jobrio/utils/utils";
import AuditListPage, {
  AuditListTab,
  AuditSortOption,
} from "@admin/features/admin-dashboard/components/AuditListPage";
import { Card } from "@admin/features/admin-dashboard/components/sections";
import {
  Badge,
  AEIcon,
  InfoChip,
  ActionBtn,
} from "@admin/features/admin-dashboard/components/sections-shared";
import { updateOrderInRegistry, getOrderRegistrySnapshot, professionals } from "@jobrio/constants";
import { requestRefund } from "@admin/features/admin-dashboard/lib/opsRegistry";

/* ============================================================
 * 6. ASSIGNMENT MANAGEMENT
 * ============================================================ */

/* ============================================================
 * 6. ASSIGNMENT ENGINE
 * Trigger · Monitor · Recovery · History
 * Manual assignment NOT allowed. Rules editable elsewhere.
 * ============================================================ */

type AEKey = "queue" | "live" | "abandoned" | "failed" | "history";
type QueueTab = "ready" | "scheduled";
type LiveTab = "active" | "held";

const AE_NAV: { key: AEKey; label: string; icon: string }[] = [
  { key: "queue", label: "Assignment Queue", icon: "inbox" },
  { key: "live", label: "Live Pools", icon: "waves" },
  { key: "abandoned", label: "Abandoned Orders", icon: "running_with_errors" },
  { key: "failed", label: "Failed Pools & Exceptions", icon: "report" },
  { key: "history", label: "Assignment History", icon: "history" },
];

/* ---------- Queue: Ready For Assignment ---------- */
const READY_ROWS = [
  {
    id: "JR-1042",
    service: "Logo Design",
    category: "Design",
    escrow: "₹480",
    received: "2m ago",
    readiness: "Ready",
    capacity: "Healthy",
    demand: "High",
    supply: "Healthy",
  },
  {
    id: "JR-1043",
    service: "Article Writing",
    category: "Writing",
    escrow: "₹240",
    received: "6m ago",
    readiness: "Ready",
    capacity: "Watch",
    demand: "Medium",
    supply: "Watch",
  },
  {
    id: "JR-1044",
    service: "Mobile App Build",
    category: "Development",
    escrow: "₹3,200",
    received: "14m ago",
    readiness: "Ready",
    capacity: "Shortage",
    demand: "High",
    supply: "Shortage",
  },
  {
    id: "JR-1045",
    service: "Explainer Video",
    category: "Video Editing",
    escrow: "₹1,150",
    received: "21m ago",
    readiness: "Ready",
    capacity: "Shortage",
    demand: "High",
    supply: "Shortage",
  },
];

/* ---------- Schedule Picker Overlay ---------- */
const TimeDropdown = ({
  value,
  onChange,
  fieldCls,
}: {
  value: string;
  onChange: (v: string) => void;
  fieldCls: string;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [h, m] = value ? value.split(":") : ["10", "00"];
  const initHour = Number(h || "10");
  const initMinute = Number(m || "0");
  const [mode, setMode] = useState<"hour" | "minute">("hour");
  const [hour24, setHour24] = useState<number>(initHour);
  const [minute, setMinute] = useState<number>(initMinute);

  useEffect(() => {
    if (!open) return;
    setHour24(initHour);
    setMinute(initMinute);
    setMode("hour");
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const display = `${pad(hour24)}:${pad(minute)}`;
  const isPM = hour24 >= 12;
  const hour12 = ((hour24 + 11) % 12) + 1;

  const commit = (hh: number, mm: number) => {
    setHour24(hh);
    setMinute(mm);
    onChange(`${pad(hh)}:${pad(mm)}`);
  };

  const setHour12 = (h12: number) => {
    const hh = isPM ? (h12 % 12) + 12 : h12 % 12;
    commit(hh, minute);
    setMode("minute");
  };
  const setAmPm = (pm: boolean) => {
    const hh = pm ? (hour24 % 12) + 12 : hour24 % 12;
    commit(hh, minute);
  };

  // Clock face geometry
  const size = 240;
  const center = size / 2;
  const radius = 92;
  const hourPositions = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1; // 1..12
    const angle = (num * 30 - 90) * (Math.PI / 180);
    return { num, x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius };
  });
  const minutePositions = Array.from({ length: 12 }, (_, i) => {
    const num = i * 5; // 0,5,..,55
    const angle = (num * 6 - 90) * (Math.PI / 180);
    return { num, x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius };
  });
  const selectedAngle =
    mode === "hour" ? (hour12 * 30 - 90) * (Math.PI / 180) : (minute * 6 - 90) * (Math.PI / 180);
  const handX = center + Math.cos(selectedAngle) * radius;
  const handY = center + Math.sin(selectedAngle) * radius;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(fieldCls, "flex items-center justify-between text-left")}
      >
        <span>{display}</span>
        <span className="material-symbols-outlined text-outline" style={{ fontSize: 16 }}>
          schedule
        </span>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-[300px] rounded-2xl bg-surface border border-outline-variant/40 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Blue header */}
            <div className="bg-primary-container text-white px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                Select time
              </p>
              <div className="mt-2 flex items-end justify-between">
                <div className="flex items-baseline">
                  <button
                    type="button"
                    onClick={() => setMode("hour")}
                    className={cn(
                      "text-5xl font-extrabold leading-none tabular-nums",
                      mode === "hour" ? "text-white" : "text-white/70",
                    )}
                  >
                    {pad(hour12)}
                  </button>
                  <span className="text-5xl font-extrabold leading-none mx-1 text-white">:</span>
                  <button
                    type="button"
                    onClick={() => setMode("minute")}
                    className={cn(
                      "text-5xl font-extrabold leading-none tabular-nums",
                      mode === "minute" ? "text-white" : "text-white/70",
                    )}
                  >
                    {pad(minute)}
                  </button>
                </div>
                <div className="flex flex-col text-[11px] font-bold leading-tight">
                  <button
                    type="button"
                    onClick={() => setAmPm(false)}
                    className={cn(!isPM ? "text-white" : "text-white/70")}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmPm(true)}
                    className={cn("mt-1", isPM ? "text-white" : "text-white/70")}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* White body — clock face */}
            <div className="px-4 pt-4 pb-2 bg-white flex items-center justify-center">
              <svg width={size} height={size} className="select-none">
                <circle cx={center} cy={center} r={size / 2 - 4} fill="#F3F4F6" />
                {/* Hand */}
                <line
                  x1={center}
                  y1={center}
                  x2={handX}
                  y2={handY}
                  stroke="#004AC6"
                  strokeWidth={2}
                />
                <circle cx={center} cy={center} r={4} fill="#004AC6" />
                <circle cx={handX} cy={handY} r={18} fill="#004AC6" />

                {(mode === "hour" ? hourPositions : minutePositions).map((p) => {
                  const selected = mode === "hour" ? p.num === hour12 : p.num === minute;
                  return (
                    <g
                      key={p.num}
                      onClick={() => (mode === "hour" ? setHour12(p.num) : commit(hour24, p.num))}
                      className="cursor-pointer"
                    >
                      <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
                      <text
                        x={p.x}
                        y={p.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={mode === "minute" && p.num % 5 !== 0 ? 10 : 13}
                        fontWeight={700}
                        fill={selected ? "#FFFFFF" : "#0F172A"}
                      >
                        {mode === "minute" ? pad(p.num) : p.num}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex justify-between items-center px-3 py-2 border-t border-outline-variant/40 bg-white">
              <button
                type="button"
                onClick={() => setMode(mode === "hour" ? "minute" : "hour")}
                className="px-2 py-1 text-[11px] font-bold text-primary-container hover:bg-primary-container/10 rounded"
              >
                {mode === "hour" ? "Set minutes →" : "← Set hours"}
              </button>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-1 text-xs font-bold text-on-surface hover:bg-surface-container-low rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-1 text-xs font-bold text-white bg-primary-container hover:bg-primary-container rounded"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SchedulePickerOverlay = ({
  title,
  orderId,
  initial,
  onCancel,
  onConfirm,
}: {
  title: string;
  orderId: string;
  initial?: string;
  onCancel: () => void;
  onConfirm: (value: string) => void;
}) => {
  // value held as ISO "YYYY-MM-DDTHH:mm"
  const initDate = initial ? new Date(initial) : undefined;
  const pad = (n: number) => String(n).padStart(2, "0");
  const [dateStr, setDateStr] = useState<string>(
    initDate
      ? `${initDate.getFullYear()}-${pad(initDate.getMonth() + 1)}-${pad(initDate.getDate())}`
      : "",
  );
  const [time, setTime] = useState<string>(
    initDate ? `${pad(initDate.getHours())}:${pad(initDate.getMinutes())}` : "10:00",
  );

  const combined = (): string => {
    if (!dateStr || !time) return "";
    return `${dateStr}T${time}`;
  };

  const fieldCls =
    "mt-1 w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-stretch md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-6"
      onClick={onCancel}
    >
      <div
        className="bg-surface w-full md:max-w-md md:rounded-2xl rounded-none border border-outline-variant/40 shadow-2xl overflow-hidden max-h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-4 border-b border-surface-container-high">
          <div>
            <p className="text-sm font-extrabold text-on-surface">{title}</p>
            <p className="text-xs text-outline mt-0.5">Order #{orderId}</p>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="p-1 rounded-full text-outline hover:text-on-surface hover:bg-surface-container"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
              Date
            </span>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className={fieldCls}
            />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
              Time
            </span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={fieldCls}
            />
          </div>

          <p className="text-[11px] text-outline italic">
            Assignment will trigger automatically at the selected date &amp; time.
          </p>
        </div>
        <div className="flex justify-end gap-2 p-3 border-t border-surface-container-high">
          <ActionBtn label="Cancel" icon="close" tone="neutral" onClick={onCancel} />
          <ActionBtn
            label="Confirm Schedule"
            icon="event_available"
            tone="primary"
            onClick={() => {
              const value = combined();
              if (!value) {
                toast.error("Please select a date and time");
                return;
              }
              onConfirm(value);
            }}
          />
        </div>
      </div>
    </div>
  );
};

const formatScheduled = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
};

type ReadyRow = (typeof READY_ROWS)[number];

const pad2 = (n: number) => String(n).padStart(2, "0");

const clockLabel = (d: Date) => {
  const ap = d.getHours() >= 12 ? "PM" : "AM";
  const h12 = ((d.getHours() + 11) % 12) + 1;
  return `${pad2(h12)}:${pad2(d.getMinutes())} ${ap}`;
};

const countdownLabel = (iso?: string) => {
  if (!iso) return "—";
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "due now";
  const mins = Math.floor(diff / 60000);
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  if (d > 0) return `in ${d}d ${h}h`;
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
};

/** Builds a Live Pool entry for an order that just entered assignment. */
const buildPool = (
  row: { id: string; service: string; category: string },
  proName?: string,
): LivePoolState => {
  const matching = professionals.filter((p) =>
    p.category.toLowerCase().includes(row.category.toLowerCase().slice(0, 4)),
  );
  const base = (matching.length ? matching : professionals).slice(0, 5);
  const ordered = proName
    ? [...base.filter((p) => p.name === proName), ...base.filter((p) => p.name !== proName)]
    : base;
  const current = proName ?? ordered[0]?.name ?? "Unassigned";
  const sent = clockLabel(new Date());
  return {
    orderId: row.id,
    service: row.service,
    category: row.category,
    status: "Active — Awaiting Response",
    matchesFound: (matching.length ? matching : professionals).length,
    poolLimit: Math.max(ordered.length, 1),
    included: ordered.length,
    excluded: Math.max((matching.length ? matching : professionals).length - ordered.length, 0),
    current,
    requestSent: sent,
    remaining: "05:00",
    ranks: ordered.map((p, i) => ({
      r: i + 1,
      n: p.name,
      score: p.qualityScore,
      tier: p.qualityScore >= 92 ? "Elite" : p.qualityScore >= 85 ? "Premium" : "Standard",
      avail: p.status === "ACTIVE" || p.status === "IDLE" ? "Available" : "Busy",
      cap: p.status === "ACTIVE" || p.status === "IDLE" ? "OK" : "Full",
      rel: Math.round(p.onTimeRate * 100),
      state: i === 0 ? "Pending" : "Queued",
    })),
    timeline: [
      { t: sent, e: `Pool created · ${ordered.length} included` },
      { t: sent, e: `Request Sent → ${current}` },
    ],
  };
};

const ReadyForAssignment = ({
  rows,
  onAssign,
  onSchedule,
}: {
  rows: ReadyRow[];
  onAssign: (row: ReadyRow, proName: string) => void;
  onSchedule: (row: ReadyRow, when: string) => void;
}) => {
  const [pickerFor, setPickerFor] = useState<string | null>(null);

  const pickerRow = rows.find((r) => r.id === pickerFor) || null;

  return (
    <div className="space-y-3">
      {rows.length === 0 && (
        <p className="text-sm text-on-surface-variant p-8 text-center">
          No orders waiting for assignment.
        </p>
      )}
      {rows.map((r) => {
        const matchingPros = professionals
          .filter((p) => p.category.toLowerCase().includes(r.category.toLowerCase().slice(0, 4)))
          .slice(0, 6);
        const candidates = matchingPros.length ? matchingPros : professionals.slice(0, 6);
        return (
          <Card key={r.id} className="!p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-extrabold text-on-surface">Order #{r.id}</p>
                  <Badge tone="bg-emerald-50 text-emerald-700">Payment Escrowed</Badge>
                  <Badge tone="bg-primary-container/10 text-primary-container">{r.readiness}</Badge>
                </div>
                <p className="text-xs text-outline mt-0.5">
                  {r.service} · {r.category} · received {r.received}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
              <InfoChip k="Escrow" v={r.escrow} />
              <InfoChip k="Category" v={r.category} />
              <InfoChip
                k="Capacity"
                v={r.capacity}
                tone={
                  r.capacity === "Healthy"
                    ? "text-emerald-600"
                    : r.capacity === "Watch"
                      ? "text-amber-600"
                      : "text-rose-600"
                }
              />
              <InfoChip k="Demand" v={r.demand} />
              <InfoChip
                k="Supply"
                v={r.supply}
                tone={
                  r.supply === "Healthy"
                    ? "text-emerald-600"
                    : r.supply === "Watch"
                      ? "text-amber-600"
                      : "text-rose-600"
                }
              />
            </div>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <ActionBtn
                label="Schedule Assignment"
                icon="schedule"
                tone="neutral"
                onClick={() => setPickerFor(r.id)}
              />
              <ActionBtn
                label="Assign Now"
                icon="bolt"
                tone="primary"
                onClick={() => onAssign(r, candidates[0]?.name ?? "Unassigned")}
              />
            </div>
          </Card>
        );
      })}
      {pickerRow && (
        <SchedulePickerOverlay
          title="Schedule Assignment"
          orderId={pickerRow.id}
          onCancel={() => setPickerFor(null)}
          onConfirm={(value) => {
            onSchedule(pickerRow, value);
            setPickerFor(null);
          }}
        />
      )}
    </div>
  );
};

/* ---------- Queue: Scheduled Assignments ---------- */
type ScheduledRow = {
  id: string;
  service?: string;
  category: string;
  date: string;
  time: string;
  countdown: string;
  status: string;
  when?: string;
};

const SCHEDULED_ROWS: ScheduledRow[] = [
  {
    id: "JR-1031",
    category: "Design",
    date: "Today",
    time: "21:00",
    countdown: "in 6h 12m",
    status: "Scheduled",
  },
  {
    id: "JR-1029",
    category: "Writing",
    date: "Tomorrow",
    time: "10:00",
    countdown: "in 19h 30m",
    status: "Scheduled",
  },
  {
    id: "JR-1027",
    category: "Video Editing",
    date: "21 Jun",
    time: "08:30",
    countdown: "in 2d 1h",
    status: "Scheduled",
  },
];

const ScheduledAssignments = ({
  rows,
  onLaunch,
  onReschedule,
}: {
  rows: ScheduledRow[];
  onLaunch: (row: ScheduledRow) => void;
  onReschedule: (row: ScheduledRow, when: string) => void;
}) => {
  const [editFor, setEditFor] = useState<string | null>(null);
  const editRow = rows.find((r) => r.id === editFor) || null;
  return (
    <div className="space-y-3">
      {rows.length === 0 && (
        <p className="text-sm text-on-surface-variant p-8 text-center">
          No scheduled assignments right now.
        </p>
      )}
      {rows.map((r) => {
        const displayDate = r.when ? formatScheduled(r.when) : `${r.date} · ${r.time}`;
        const countdown = r.when ? countdownLabel(r.when) : r.countdown;
        return (
          <Card key={r.id} className="!p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-extrabold text-on-surface">Order #{r.id}</p>
                  <Badge tone="bg-violet-50 text-violet-700">{r.status}</Badge>
                </div>
                <p className="text-xs text-outline mt-0.5">
                  {r.service ? `${r.service} · ` : ""}
                  {r.category}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              <InfoChip k="Scheduled" v={displayDate} />
              <InfoChip k="Countdown" v={countdown} tone="text-amber-600" />
              <InfoChip k="Assignment Status" v={r.status} />
              <InfoChip k="Category" v={r.category} />
            </div>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <ActionBtn
                label="Edit Schedule"
                icon="edit_calendar"
                tone="neutral"
                onClick={() => setEditFor(r.id)}
              />
              <ActionBtn
                label="Launch Now"
                icon="rocket_launch"
                tone="primary"
                onClick={() => onLaunch(r)}
              />
            </div>
          </Card>
        );
      })}
      {editRow && (
        <SchedulePickerOverlay
          title="Edit Schedule"
          orderId={editRow.id}
          initial={editRow.when}
          onCancel={() => setEditFor(null)}
          onConfirm={(value) => {
            onReschedule(editRow, value);
            setEditFor(null);
          }}
        />
      )}
    </div>
  );
};

const AssignmentQueueView = ({
  tab,
  readyRows,
  scheduledRows,
  onAssign,
  onSchedule,
  onLaunch,
  onReschedule,
}: {
  tab: QueueTab;
  readyRows: ReadyRow[];
  scheduledRows: ScheduledRow[];
  onAssign: (row: ReadyRow, proName: string) => void;
  onSchedule: (row: ReadyRow, when: string) => void;
  onLaunch: (row: ScheduledRow) => void;
  onReschedule: (row: ScheduledRow, when: string) => void;
}) => (
  <div className="space-y-5">
    {tab === "ready" ? (
      <ReadyForAssignment rows={readyRows} onAssign={onAssign} onSchedule={onSchedule} />
    ) : (
      <ScheduledAssignments rows={scheduledRows} onLaunch={onLaunch} onReschedule={onReschedule} />
    )}
  </div>
);

/* ---------- Live Pools ---------- */
type LivePool = (typeof LIVE_POOLS)[number];
type LivePoolState = Omit<LivePool, "status"> & { status: string };

const LIVE_POOLS = [
  {
    orderId: "JR-1041",
    service: "Landing Page Design",
    category: "Design",
    status: "Active — Awaiting Response",
    matchesFound: 42,
    poolLimit: 15,
    included: 15,
    excluded: 27,
    current: "Professional B",
    requestSent: "02:06 PM",
    remaining: "03:42",
    ranks: [
      {
        r: 1,
        n: "Professional A",
        score: 96,
        tier: "Elite",
        avail: "Available",
        cap: "OK",
        rel: 99,
        state: "Rejected",
      },
      {
        r: 2,
        n: "Professional B",
        score: 94,
        tier: "Elite",
        avail: "Available",
        cap: "OK",
        rel: 97,
        state: "Pending",
      },
      {
        r: 3,
        n: "Professional C",
        score: 91,
        tier: "Premium",
        avail: "Available",
        cap: "OK",
        rel: 95,
        state: "Queued",
      },
      {
        r: 4,
        n: "Professional D",
        score: 88,
        tier: "Premium",
        avail: "Busy",
        cap: "Full",
        rel: 92,
        state: "Queued",
      },
      {
        r: 5,
        n: "Professional E",
        score: 85,
        tier: "Standard",
        avail: "Available",
        cap: "OK",
        rel: 90,
        state: "Queued",
      },
    ],
    timeline: [
      { t: "02:01 PM", e: "Request Sent → Professional A" },
      { t: "02:06 PM", e: "Rejected — Professional A" },
      { t: "02:06 PM", e: "Request Sent → Professional B" },
    ],
  },
  {
    orderId: "JR-1048",
    service: "Explainer Video Edit",
    category: "Video Editing",
    status: "Active — Awaiting Response",
    matchesFound: 28,
    poolLimit: 12,
    included: 12,
    excluded: 16,
    current: "Professional Q",
    requestSent: "02:12 PM",
    remaining: "04:58",
    ranks: [
      {
        r: 1,
        n: "Professional P",
        score: 93,
        tier: "Elite",
        avail: "Busy",
        cap: "Full",
        rel: 96,
        state: "Skipped",
      },
      {
        r: 2,
        n: "Professional Q",
        score: 90,
        tier: "Premium",
        avail: "Available",
        cap: "OK",
        rel: 94,
        state: "Pending",
      },
      {
        r: 3,
        n: "Professional R",
        score: 87,
        tier: "Premium",
        avail: "Available",
        cap: "OK",
        rel: 92,
        state: "Queued",
      },
    ],
    timeline: [
      { t: "02:08 PM", e: "Pool created · 12 included" },
      { t: "02:10 PM", e: "Skipped — Professional P (Full)" },
      { t: "02:12 PM", e: "Request Sent → Professional Q" },
    ],
  },
  {
    orderId: "JR-1052",
    service: "SEO Audit Report",
    category: "Marketing",
    status: "Active — Awaiting Response",
    matchesFound: 19,
    poolLimit: 10,
    included: 10,
    excluded: 9,
    current: "Professional X",
    requestSent: "02:15 PM",
    remaining: "06:11",
    ranks: [
      {
        r: 1,
        n: "Professional X",
        score: 89,
        tier: "Premium",
        avail: "Available",
        cap: "OK",
        rel: 93,
        state: "Pending",
      },
      {
        r: 2,
        n: "Professional Y",
        score: 86,
        tier: "Standard",
        avail: "Available",
        cap: "OK",
        rel: 91,
        state: "Queued",
      },
    ],
    timeline: [
      { t: "02:14 PM", e: "Pool created · 10 included" },
      { t: "02:15 PM", e: "Request Sent → Professional X" },
    ],
  },
];

const stateTone = (s: string) =>
  s === "Pending"
    ? "bg-amber-50 text-amber-700"
    : s === "Accepted"
      ? "bg-emerald-50 text-emerald-700"
      : s === "Rejected"
        ? "bg-rose-50 text-rose-700"
        : s === "Expired"
          ? "bg-rose-50 text-rose-700"
          : s === "Skipped"
            ? "bg-slate-100 text-slate-700"
            : "bg-surface-container-low text-on-surface-variant";

const LivePoolDetailOverlay = ({
  pool,
  onClose,
  onAction,
}: {
  pool: LivePoolState;
  onClose: () => void;
  onAction: (action: "skip" | "pause" | "resume" | "stop" | "start") => void;
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-surface w-full md:max-w-4xl md:rounded-2xl rounded-none border border-outline-variant/40 shadow-2xl overflow-hidden max-h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-4 border-b border-surface-container-high">
          <div>
            <p className="text-sm font-extrabold text-on-surface">
              Order #{pool.orderId} · {pool.service}
            </p>
            <p className="text-xs text-outline mt-0.5">{pool.category}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="bg-primary-container/10 text-primary-container">{pool.status}</Badge>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1 rounded-full text-outline hover:text-on-surface hover:bg-surface-container"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="p-4 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <InfoChip k="Matches Found" v={String(pool.matchesFound)} />
            <InfoChip k="Pool Limit" v={String(pool.poolLimit)} />
            <InfoChip k="Included" v={String(pool.included)} tone="text-emerald-600" />
            <InfoChip k="Excluded" v={String(pool.excluded)} tone="text-rose-600" />
            <InfoChip k="Current" v={pool.current} tone="text-primary" />
          </div>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-extrabold">Current Request</p>
              <Badge tone="bg-amber-50 text-amber-700">Awaiting Response</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <InfoChip k="Current Professional" v={pool.current} />
              <InfoChip k="Request Sent" v={pool.requestSent} />
              <InfoChip k="Time Remaining" v={pool.remaining} tone="text-amber-600" />
              <InfoChip k="State" v="Pending" tone="text-amber-600" />
            </div>
          </Card>

          <Card className="!p-0 overflow-hidden">
            <p className="text-sm font-extrabold px-4 pt-4">Ranking Board</p>
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-12 px-4 py-2.5 mt-3 border-t border-b border-surface-container-high text-[10px] font-bold uppercase tracking-wider text-outline">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-3">Professional</div>
                  <div className="col-span-1 text-right">Score</div>
                  <div className="col-span-2">Tier</div>
                  <div className="col-span-2">Availability</div>
                  <div className="col-span-1 text-right">Rel.</div>
                  <div className="col-span-2 text-right">State</div>
                </div>
                <ul className="divide-y divide-surface-container-high/60">
                  {pool.ranks.map((r) => (
                    <li key={r.r} className="grid grid-cols-12 items-center px-4 py-2.5 text-sm">
                      <div className="col-span-1 font-bold">#{r.r}</div>
                      <div className="col-span-3 font-semibold text-on-surface">{r.n}</div>
                      <div className="col-span-1 text-right font-bold">{r.score}</div>
                      <div className="col-span-2">
                        <Badge tone="bg-violet-50 text-violet-700">{r.tier}</Badge>
                      </div>
                      <div className="col-span-2 text-xs text-on-surface-variant">
                        {r.avail} · {r.cap}
                      </div>
                      <div className="col-span-1 text-right font-bold">{r.rel}</div>
                      <div className="col-span-2 flex justify-end">
                        <Badge tone={stateTone(r.state)}>{r.state}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-sm font-extrabold mb-3">Pool Timeline</p>
            <ul className="space-y-2">
              {pool.timeline.map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="text-xs text-outline w-20 shrink-0">{t.t}</span>
                  <span className="text-on-surface">{t.e}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="flex flex-wrap justify-end gap-2 p-3 border-t border-surface-container-high">
          <>
            <ActionBtn
              label="Skip Current Professional"
              icon="skip_next"
              tone="neutral"
              onClick={() => onAction("skip")}
            />
            {pool.status === "Paused" ? (
              <ActionBtn
                label="Resume Pool"
                icon="play_arrow"
                tone="success"
                onClick={() => onAction("resume")}
              />
            ) : (
              <ActionBtn
                label="Pause Pool"
                icon="pause"
                tone="warn"
                onClick={() => onAction("pause")}
              />
            )}
          </>
        </div>
      </div>
    </div>
  );
};

const LivePoolsView = ({
  pools,
  setPools,
}: {
  pools: LivePoolState[];
  setPools: React.Dispatch<React.SetStateAction<LivePoolState[]>>;
}) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = pools.find((p) => p.orderId === openId) || null;

  const handleAction = (action: "skip" | "pause" | "resume" | "stop" | "start") => {
    if (!openId) return;
    if (action === "stop") {
      setPools((arr) =>
        arr.map((p) => (p.orderId === openId ? { ...p, status: "Force Stopped" } : p)),
      );
      toast.success(`Pool for #${openId} force-stopped`, { duration: 2200 });
      return;
    }
    if (action === "start") {
      setPools((arr) => arr.map((p) => (p.orderId === openId ? { ...p, status: "Active" } : p)));
      toast.success(`Pool for #${openId} force-started`, { duration: 2200 });
      return;
    }
    setPools((arr) =>
      arr.map((p) =>
        p.orderId === openId
          ? {
              ...p,
              status: action === "pause" ? "Paused" : action === "resume" ? "Active" : p.status,
            }
          : p,
      ),
    );
    toast.success(
      action === "skip"
        ? `Skipped ${open?.current} — moving to next candidate`
        : action === "pause"
          ? `Pool for #${openId} paused`
          : `Pool for #${openId} resumed`,
      { duration: 2200 },
    );
  };

  return (
    <div className="space-y-3">
      <Card className="!p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AEIcon name="waves" className="text-primary" />
            <p className="text-sm font-extrabold text-on-surface">Live Pools</p>
            <Badge tone="bg-primary-container/10 text-primary-container">
              {pools.length} active
            </Badge>
          </div>
          <p className="text-[11px] text-outline">
            Tap a pool to open full ranking, timeline & controls.
          </p>
        </div>
      </Card>
      {pools.map((p) => (
        <Card key={p.orderId} className="!p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-extrabold text-on-surface">Order #{p.orderId}</p>
                <Badge tone="bg-primary-container/10 text-primary-container">{p.status}</Badge>
              </div>
              <p className="text-xs text-outline mt-0.5">
                {p.service} · {p.category} · Current → {p.current}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
            <InfoChip k="Matches" v={String(p.matchesFound)} />
            <InfoChip k="Pool" v={`${p.included}/${p.poolLimit}`} />
            <InfoChip k="Excluded" v={String(p.excluded)} tone="text-rose-600" />
            <InfoChip k="Request Sent" v={p.requestSent} />
            <InfoChip k="Time Left" v={p.remaining} tone="text-amber-600" />
          </div>
          <div className="mt-3 flex justify-end">
            <ActionBtn
              label="View Pool Details"
              icon="visibility"
              tone="primary"
              onClick={() => setOpenId(p.orderId)}
            />
          </div>
        </Card>
      ))}
      {open && (
        <LivePoolDetailOverlay
          pool={open}
          onClose={() => setOpenId(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
};

/* ---------- Failed Pools & Exceptions ---------- */
const FAILED_ROWS = [
  {
    id: "JR-1037",
    category: "Video Editing",
    failureType: "Pool Exhausted",
    reason: "All 15 pool members declined or timed out",
    matches: 24,
    declines: 11,
    timeouts: 4,
    duration: "18m 42s",
    poolExpiry: "30m",
  },
  {
    id: "JR-1030",
    category: "Cybersecurity",
    failureType: "No Match Found",
    reason: "0 professionals cleared match threshold",
    matches: 0,
    declines: 0,
    timeouts: 0,
    duration: "1m 02s",
    poolExpiry: "30m",
  },
  {
    id: "JR-1025",
    category: "Mobile Development",
    failureType: "Capacity Shortage",
    reason: "Matches found but all professionals Busy / Full",
    matches: 9,
    declines: 0,
    timeouts: 0,
    duration: "0m 48s",
    poolExpiry: "30m",
  },
  {
    id: "JR-1019",
    category: "Writing",
    failureType: "Assignment Timeout",
    reason: "Pool expiry elapsed before any acceptance",
    matches: 18,
    declines: 6,
    timeouts: 9,
    duration: "30m 00s",
    poolExpiry: "30m",
  },
];

const failureTone = (t: string) =>
  t === "Pool Exhausted"
    ? "bg-rose-50 text-rose-700"
    : t === "No Match Found"
      ? "bg-slate-100 text-slate-700"
      : t === "Capacity Shortage"
        ? "bg-amber-50 text-amber-700"
        : "bg-rose-50 text-rose-700";

type FailedRow = (typeof FAILED_ROWS)[number] & { updated?: boolean; expanded?: boolean };

const FailureDetailOverlay = ({
  row,
  onClose,
  onAction,
}: {
  row: FailedRow;
  onClose: () => void;
  onAction: (action: "retry" | "expand" | "escalate" | "hold" | "refund") => void;
}) => (
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
          <p className="text-sm font-extrabold text-on-surface">
            Order #{row.id} · Failure Details
          </p>
          <p className="text-xs text-outline mt-0.5">
            {row.category} · {row.reason}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={failureTone(row.failureType)}>{row.failureType}</Badge>
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <InfoChip k="Matches Found" v={String(row.matches)} />
          <InfoChip k="Declines" v={String(row.declines)} tone="text-rose-600" />
          <InfoChip k="Timeouts" v={String(row.timeouts)} tone="text-amber-600" />
          <InfoChip k="Assignment Duration" v={row.duration} />
          <InfoChip k="Pool Expiry Time" v={row.poolExpiry} tone="text-primary" />
        </div>
        {!row.updated && (
          <Card>
            <p className="text-sm font-bold mb-3">Recovery Actions</p>
            <div className="flex flex-wrap gap-2">
              <ActionBtn
                label="Retry Assignment"
                icon="refresh"
                tone="primary"
                onClick={() => onAction("retry")}
              />
              {!row.expanded && (
                <ActionBtn
                  label="Expand Pool & Retry"
                  icon="open_in_full"
                  tone="neutral"
                  onClick={() => onAction("expand")}
                />
              )}
              <ActionBtn
                label="Escalate Hiring Need"
                icon="campaign"
                tone="warn"
                onClick={() => onAction("escalate")}
              />
              <ActionBtn
                label="Hold Assignment"
                icon="pause"
                tone="neutral"
                onClick={() => onAction("hold")}
              />
              <ActionBtn
                label="Refund Recommendation"
                icon="account_balance_wallet"
                tone="danger"
                onClick={() => onAction("refund")}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  </div>
);

const FailedPoolsView = ({
  setPools,
}: {
  setPools: React.Dispatch<React.SetStateAction<LivePoolState[]>>;
}) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [rows, setRows] = useState<FailedRow[]>(FAILED_ROWS);
  const open = rows.find((r) => r.id === openId) || null;

  const handleAction = (action: "retry" | "expand" | "escalate" | "hold" | "refund") => {
    if (!open) return;

    if (action === "retry") {
      setPools((p) => [
        {
          orderId: open.id,
          service: open.category,
          category: open.category,
          status: "Active — Awaiting Response",
          matchesFound: open.matches,
          poolLimit: open.matches,
          included: open.matches,
          excluded: 0,
          current: "Pending",
          requestSent: new Date().toLocaleTimeString(),
          remaining: "30m",
          ranks: [],
          timeline: [{ t: new Date().toLocaleTimeString(), e: "Assignment retried" }],
        },
        ...p,
      ]);
      setRows((arr) => arr.map((r) => (r.id === open.id ? { ...r, updated: true } : r)));
      toast.success(`Assignment retried for #${open.id}`, { duration: 2200 });
      setOpenId(null);
      return;
    }
    if (action === "expand") {
      setPools((p) => [
        {
          orderId: open.id,
          service: open.category,
          category: open.category,
          status: "Active — Awaiting Response",
          matchesFound: open.matches + 10,
          poolLimit: open.matches + 10,
          included: open.matches + 10,
          excluded: 0,
          current: "Pending",
          requestSent: new Date().toLocaleTimeString(),
          remaining: "30m",
          ranks: [],
          timeline: [{ t: new Date().toLocaleTimeString(), e: "Pool expanded & retried" }],
        },
        ...p,
      ]);
      setRows((arr) => arr.map((r) => (r.id === open.id ? { ...r, updated: true, expanded: true } : r)));
      toast.success(`Pool expanded & retried for #${open.id}`, { duration: 2200 });
      setOpenId(null);
      return;
    }
    if (action === "refund") {
      const reason = window.prompt("Enter reason for refund recommendation:");
      if (!reason) return;

      if (getOrderRegistrySnapshot().some((o) => o.id === open.id)) {
        updateOrderInRegistry(open.id, { s: "cancelled" });
      }
      requestRefund(open.id, reason, "Assignment Failure");

      toast.success(`Refund recommended for #${open.id}`, {
        description: "Sent to Finance & Escrow Refund Center.",
        duration: 2500,
      });
      setRows((arr) => arr.filter((r) => r.id !== open.id));
      setOpenId(null);
      return;
    }
    if (action === "hold") {
      setPools((p) => [
        {
          orderId: open.id,
          service: open.category,
          category: open.category,
          status: "Held",
          matchesFound: open.matches,
          poolLimit: open.matches,
          included: open.matches,
          excluded: 0,
          current: "Pending",
          requestSent: new Date().toLocaleTimeString(),
          remaining: "N/A",
          ranks: [],
          timeline: [{ t: new Date().toLocaleTimeString(), e: "Assignment held" }],
        },
        ...p,
      ]);
      setRows((arr) => arr.map((r) => (r.id === open.id ? { ...r, updated: true } : r)));
      toast.success(`Assignment held for #${open.id}`, { duration: 2200 });
      setOpenId(null);
      return;
    }
    if (action === "escalate") {
      toast.success(`Hiring need escalated for #${open.id}`, { duration: 2200 });
    }
  };

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <Card key={r.id} className="!p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-extrabold text-on-surface">Order #{r.id}</p>
                {r.updated ? (
                  <Badge tone="bg-slate-100 text-slate-700">Updated</Badge>
                ) : (
                  <Badge tone={failureTone(r.failureType)}>{r.failureType}</Badge>
                )}
              </div>
              <p className="text-xs text-outline mt-0.5">
                {r.category} · {r.reason}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
            <InfoChip k="Matches Found" v={String(r.matches)} />
            <InfoChip k="Declines" v={String(r.declines)} tone="text-rose-600" />
            <InfoChip k="Timeouts" v={String(r.timeouts)} tone="text-amber-600" />
            <InfoChip k="Assignment Duration" v={r.duration} />
            <InfoChip k="Pool Expiry Time" v={r.poolExpiry} tone="text-primary" />
          </div>
          <div className="mt-3 flex justify-end">
            <ActionBtn
              label="View Failure Details"
              icon="visibility"
              tone="primary"
              onClick={() => setOpenId(r.id)}
            />
          </div>
        </Card>
      ))}
      {rows.length === 0 && (
        <p className="text-sm text-on-surface-variant p-8 text-center">
          No failed pools right now.
        </p>
      )}
      {open && (
        <FailureDetailOverlay row={open} onClose={() => setOpenId(null)} onAction={handleAction} />
      )}
    </div>
  );
};

/* ---------- Abandoned Orders ---------- */
const ABANDONED_ROWS = [
  {
    id: "JR-2041",
    service: "Logo Design",
    category: "Design",
    abandonedAt: "2026-06-18 09:42",
    lastPro: "Ravi K.",
    attempts: 3,
    poolSize: 18,
    idleFor: "2h 14m",
    reason: "Professional unresponsive after acceptance",
  },
  {
    id: "JR-2039",
    service: "Article Writing",
    category: "Writing",
    abandonedAt: "2026-06-18 07:10",
    lastPro: "Suresh M.",
    attempts: 2,
    poolSize: 22,
    idleFor: "4h 30m",
    reason: "Dropped mid-progress, no status update",
  },
  {
    id: "JR-2036",
    service: "Explainer Video",
    category: "Video Editing",
    abandonedAt: "2026-06-17 22:05",
    lastPro: "Anita S.",
    attempts: 4,
    poolSize: 12,
    idleFor: "10h 02m",
    reason: "Multiple missed deadlines, silent timeout",
  },
];

type AbandonedRow = (typeof ABANDONED_ROWS)[number] & { updated?: boolean; expanded?: boolean };

const AbandonedDetailOverlay = ({
  row,
  onClose,
  onAction,
}: {
  row: AbandonedRow;
  onClose: () => void;
  onAction: (action: "repool" | "expand" | "penalize" | "hold" | "refund") => void;
}) => (
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
          <p className="text-sm font-extrabold text-on-surface">
            Order #{row.id} · {row.service}
          </p>
          <p className="text-xs text-outline mt-0.5">
            {row.category} · {row.reason}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="bg-rose-50 text-rose-700">Abandoned</Badge>
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <InfoChip k="Last Professional" v={row.lastPro} />
          <InfoChip k="Attempts" v={String(row.attempts)} tone="text-amber-600" />
          <InfoChip k="Pool Size" v={String(row.poolSize)} />
          <InfoChip k="Idle For" v={row.idleFor} tone="text-rose-600" />
          <InfoChip k="Abandoned At" v={row.abandonedAt} />
        </div>
        {!row.updated && (
          <Card>
            <p className="text-sm font-bold mb-3">Recovery Actions</p>
            <div className="flex flex-wrap gap-2">
              <ActionBtn
                label="Re-Pool & Reassign"
                icon="refresh"
                tone="primary"
                onClick={() => onAction("repool")}
              />
              {!row.expanded && (
                <ActionBtn
                  label="Expand Pool"
                  icon="open_in_full"
                  tone="neutral"
                  onClick={() => onAction("expand")}
                />
              )}
              <ActionBtn
                label="Penalize Professional"
                icon="gavel"
                tone="warn"
                onClick={() => onAction("penalize")}
              />
              <ActionBtn
                label="Hold Order"
                icon="pause"
                tone="neutral"
                onClick={() => onAction("hold")}
              />
              <ActionBtn
                label="Refund Client"
                icon="account_balance_wallet"
                tone="danger"
                onClick={() => onAction("refund")}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  </div>
);

const AbandonedOrdersView = ({
  setPools,
}: {
  setPools: React.Dispatch<React.SetStateAction<LivePoolState[]>>;
}) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [rows, setRows] = useState<AbandonedRow[]>(ABANDONED_ROWS);
  const open = rows.find((r) => r.id === openId) || null;

  const handleAction = (action: "repool" | "expand" | "penalize" | "hold" | "refund") => {
    if (!open) return;

    if (action === "repool") {
      setPools((p) => [
        {
          orderId: open.id,
          service: open.service,
          category: open.category,
          status: "Active — Awaiting Response",
          matchesFound: open.poolSize,
          poolLimit: open.poolSize,
          included: open.poolSize,
          excluded: 0,
          current: "Pending",
          requestSent: new Date().toLocaleTimeString(),
          remaining: "30m",
          ranks: [],
          timeline: [{ t: new Date().toLocaleTimeString(), e: "Re-pooled for reassignment" }],
        },
        ...p,
      ]);
      setRows((arr) => arr.map((r) => (r.id === open.id ? { ...r, updated: true } : r)));
      toast.success(`#${open.id} re-pooled for reassignment`, { duration: 2200 });
      setOpenId(null);
      return;
    }
    if (action === "expand") {
      setRows((arr) =>
        arr.map((r) => (r.id === open.id ? { ...r, poolSize: r.poolSize + 10, expanded: true } : r)),
      );
      toast.success(`Pool expanded for #${open.id}`, { duration: 2200 });
      return;
    }
    if (action === "refund") {
      const reason = window.prompt("Enter reason for refund recommendation:");
      if (!reason) return;

      if (getOrderRegistrySnapshot().some((o) => o.id === open.id)) {
        updateOrderInRegistry(open.id, { s: "cancelled" });
      }
      requestRefund(open.id, reason, "Assignment Failure");

      toast.success(`Refund recommended for #${open.id}`, {
        description: "Sent to Finance & Escrow Refund Center.",
        duration: 2500,
      });
      setRows((arr) => arr.filter((r) => r.id !== open.id));
      setOpenId(null);
      return;
    }
    if (action === "hold") {
      setPools((p) => [
        {
          orderId: open.id,
          service: open.service,
          category: open.category,
          status: "Held",
          matchesFound: open.poolSize,
          poolLimit: open.poolSize,
          included: open.poolSize,
          excluded: 0,
          current: "Pending",
          requestSent: new Date().toLocaleTimeString(),
          remaining: "N/A",
          ranks: [],
          timeline: [{ t: new Date().toLocaleTimeString(), e: "Order held" }],
        },
        ...p,
      ]);
      setRows((arr) => arr.map((r) => (r.id === open.id ? { ...r, updated: true } : r)));
      toast.success(`Order #${open.id} held`, { duration: 2200 });
      setOpenId(null);
      return;
    }
    if (action === "penalize") {
      toast.success(`Professional penalized for #${open.id}`, { duration: 2200 });
    }
  };

  return (
    <div className="space-y-3">
      <Card className="!p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AEIcon name="running_with_errors" className="text-rose-600" />
            <p className="text-sm font-extrabold text-on-surface">Abandoned Orders</p>
            <Badge tone="bg-rose-50 text-rose-700">{rows.length} open</Badge>
          </div>
          <p className="text-[11px] text-outline">
            Orders dropped or stalled after assignment — needs re-pool or recovery.
          </p>
        </div>
      </Card>
      {rows.map((r) => (
        <Card key={r.id} className="!p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-extrabold text-on-surface">Order #{r.id}</p>
                {r.updated ? (
                  <Badge tone="bg-slate-100 text-slate-700">Updated</Badge>
                ) : (
                  <Badge tone="bg-rose-50 text-rose-700">Abandoned</Badge>
                )}
              </div>
              <p className="text-xs text-outline mt-0.5">
                {r.service} · {r.category} · {r.reason}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
            <InfoChip k="Last Professional" v={r.lastPro} />
            <InfoChip k="Attempts" v={String(r.attempts)} tone="text-amber-600" />
            <InfoChip k="Pool Size" v={String(r.poolSize)} />
            <InfoChip k="Idle For" v={r.idleFor} tone="text-rose-600" />
            <InfoChip k="Abandoned At" v={r.abandonedAt} />
          </div>
          <div className="mt-3 flex justify-end">
            <ActionBtn
              label="View Order Details"
              icon="visibility"
              tone="primary"
              onClick={() => setOpenId(r.id)}
            />
          </div>
        </Card>
      ))}
      {rows.length === 0 && (
        <p className="text-sm text-on-surface-variant p-8 text-center">
          No abandoned orders right now.
        </p>
      )}
      {open && (
        <AbandonedDetailOverlay
          row={open}
          onClose={() => setOpenId(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
};

/* ---------- Assignment History ---------- */
type HistoryFilter = "all" | "assigned" | "failed" | "retried" | "refunded";

const HISTORY_ROWS = [
  {
    id: "JR-1018",
    service: "Logo Design",
    category: "Design",
    time: "Jun 18, 04:12 PM",
    matches: 24,
    pool: 15,
    declines: 2,
    timeouts: 1,
    result: "Assigned" as const,
    source: "Assign Now",
  },
  {
    id: "JR-1017",
    service: "Article Writing",
    category: "Writing",
    time: "Jun 18, 02:48 PM",
    matches: 31,
    pool: 15,
    declines: 4,
    timeouts: 2,
    result: "Assigned" as const,
    source: "Scheduled Assignment",
  },
  {
    id: "JR-1016",
    service: "Explainer Video",
    category: "Video Editing",
    time: "Jun 18, 12:11 PM",
    matches: 24,
    pool: 15,
    declines: 11,
    timeouts: 4,
    result: "Failed" as const,
    source: "Assign Now",
  },
  {
    id: "JR-1015",
    service: "App Build",
    category: "Development",
    time: "Jun 18, 10:02 AM",
    matches: 18,
    pool: 30,
    declines: 6,
    timeouts: 1,
    result: "Retried" as const,
    source: "Expand Pool & Retry",
  },
  {
    id: "JR-1014",
    service: "Security Audit",
    category: "Cybersecurity",
    time: "Jun 17, 06:30 PM",
    matches: 0,
    pool: 0,
    declines: 0,
    timeouts: 0,
    result: "Refunded" as const,
    source: "System Auto-Trigger",
  },
];

const resultTone = (r: string) =>
  r === "Assigned"
    ? "bg-emerald-50 text-emerald-700"
    : r === "Failed"
      ? "bg-rose-50 text-rose-700"
      : r === "Retried"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-700";

const AssignmentHistoryView = ({ filter }: { filter: HistoryFilter }) => {
  const rows = HISTORY_ROWS.filter((r) =>
    filter === "all" ? true : r.result.toLowerCase() === filter,
  );
  return (
    <div className="space-y-4">
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-12 px-4 py-2.5 border-b border-surface-container-high text-[10px] font-bold uppercase tracking-wider text-outline">
              <div className="col-span-2">Order</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-1 text-right">Matches</div>
              <div className="col-span-1 text-right">Pool</div>
              <div className="col-span-2">Source</div>
              <div className="col-span-2 text-right">Result · Action</div>
            </div>
            <ul className="divide-y divide-surface-container-high/60">
              {rows.map((r) => (
                <li key={r.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm">
                  <div className="col-span-2">
                    <p className="font-bold">#{r.id}</p>
                    <p className="text-[11px] text-outline truncate">{r.service}</p>
                  </div>
                  <div className="col-span-2 text-xs text-on-surface-variant">{r.category}</div>
                  <div className="col-span-2 text-xs text-outline">{r.time}</div>
                  <div className="col-span-1 text-right font-bold">{r.matches}</div>
                  <div className="col-span-1 text-right font-bold">{r.pool}</div>
                  <div className="col-span-2">
                    <Badge tone="bg-primary-container/10 text-primary-container">{r.source}</Badge>
                  </div>
                  <div className="col-span-2 flex justify-end items-center gap-2">
                    <Badge tone={resultTone(r.result)}>{r.result}</Badge>
                    <button
                      type="button"
                      disabled
                      title="Assignment details are not wired in this build."
                      aria-label="View details (coming soon)"
                      className="p-1.5 rounded-full text-outline opacity-60 cursor-not-allowed"
                    >
                      <AEIcon name="visibility" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

/* ---------- Main Section ---------- */
export const AssignmentsSection = () => {
  const [view, setView] = useState<AEKey>("queue");
  const [queueTab, setQueueTab] = useState<QueueTab>("ready");
  const [liveTab, setLiveTab] = useState<LiveTab>("active");
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");

  const [readyRows, setReadyRows] = useState<ReadyRow[]>(READY_ROWS);
  const [scheduledRows, setScheduledRows] = useState<ScheduledRow[]>(SCHEDULED_ROWS);
  const [pools, setPools] = useState<LivePoolState[]>(LIVE_POOLS);

  /** Moves an order into Live Pools (from Assign Now or a due schedule). */
  const startPool = (row: { id: string; service?: string; category: string }, proName?: string) => {
    const pool = buildPool(
      { id: row.id, service: row.service ?? "Order", category: row.category },
      proName,
    );
    setPools((arr) => (arr.some((p) => p.orderId === row.id) ? arr : [pool, ...arr]));
    if (getOrderRegistrySnapshot().some((o) => o.id === row.id)) {
      const pro = professionals.find((p) => p.name === (proName ?? pool.current));
      updateOrderInRegistry(row.id, {
        s: "assigned",
        pro: pool.current,
        proEmail: pro ? `${pro.name.toLowerCase().replace(/\s+/g, ".")}@jobrio.pro` : undefined,
      });
    }
    return pool;
  };

  const handleAssign = (row: ReadyRow, proName: string) => {
    setReadyRows((arr) => arr.filter((r) => r.id !== row.id));
    startPool(row, proName);
    toast.success(`Order #${row.id} assigned to ${proName}`, {
      description: "Moved to Live Pools.",
      duration: 2400,
    });
  };

  const handleSchedule = (row: ReadyRow, when: string) => {
    setReadyRows((arr) => arr.filter((r) => r.id !== row.id));
    const d = new Date(when);
    setScheduledRows((arr) => [
      {
        id: row.id,
        service: row.service,
        category: row.category,
        date: d.toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
        time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
        countdown: countdownLabel(when),
        status: "Scheduled",
        when,
      },
      ...arr.filter((r) => r.id !== row.id),
    ]);
    toast.success(`Order #${row.id} scheduled for ${formatScheduled(when)}`, {
      description: "Moved to Scheduled Assignments.",
      duration: 2400,
    });
  };

  const handleLaunch = (row: ScheduledRow) => {
    setScheduledRows((arr) => arr.filter((r) => r.id !== row.id));
    startPool(row);
    toast.success(`Order #${row.id} launched`, {
      description: "Moved to Live Pools.",
      duration: 2400,
    });
  };

  const handleReschedule = (row: ScheduledRow, when: string) => {
    const d = new Date(when);
    setScheduledRows((arr) =>
      arr.map((r) =>
        r.id === row.id
          ? {
              ...r,
              when,
              date: d.toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
              time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
              countdown: countdownLabel(when),
            }
          : r,
      ),
    );
    toast.success(`Schedule for #${row.id} updated to ${formatScheduled(when)}`, {
      duration: 2200,
    });
  };

  // Scheduled assignments auto-launch into Live Pools at their scheduled time.
  useEffect(() => {
    const tick = () => {
      const due = scheduledRows.filter((r) => r.when && new Date(r.when).getTime() <= Date.now());
      if (!due.length) {
        // keep countdowns fresh
        setScheduledRows((arr) =>
          arr.map((r) => (r.when ? { ...r, countdown: countdownLabel(r.when) } : r)),
        );
        return;
      }
      setScheduledRows((arr) => arr.filter((r) => !due.some((d) => d.id === r.id)));
      due.forEach((r) => {
        startPool(r);
        toast.success(`Order #${r.id} auto-launched`, {
          description: "Scheduled time reached — moved to Live Pools.",
          duration: 2600,
        });
      });
    };
    const id = setInterval(tick, 15_000);
    tick();
    return () => clearInterval(id);
  }, [scheduledRows]);

  const tabs: AuditListTab[] = AE_NAV;

  const SORT_OPTIONS_BY_TAB: Partial<Record<AEKey, AuditSortOption[]>> = {
    queue: [
      { key: "ready", label: "Ready For Assignment" },
      { key: "scheduled", label: "Scheduled Assignments" },
    ],
    live: [
      { key: "active", label: "Active Pools" },
      { key: "held", label: "Held Orders" },
    ],
    history: [
      { key: "all", label: "All" },
      { key: "assigned", label: "Assigned" },
      { key: "failed", label: "Failed" },
      { key: "retried", label: "Retried" },
      { key: "refunded", label: "Refunded" },
    ],
  };

  const sortValueByTab: Partial<Record<AEKey, string>> = {
    queue: queueTab,
    live: liveTab,
    history: historyFilter,
  };

  const filteredPools = pools.filter((p) =>
    liveTab === "held" ? p.status === "Held" : p.status !== "Held"
  );

  const countByTab: Record<AEKey, number> = {
    queue: queueTab === "ready" ? readyRows.length : scheduledRows.length,
    live: filteredPools.length,
    abandoned: ABANDONED_ROWS.length,
    failed: FAILED_ROWS.length,
    history:
      historyFilter === "all"
        ? HISTORY_ROWS.length
        : HISTORY_ROWS.filter((r) => r.result.toLowerCase() === historyFilter).length,
  };

  return (
    <AuditListPage
      title="Assignment Engine"
      description="Trigger · Monitor · Recovery · History. Manual assignment is disabled."
      tabs={tabs}
      activeTab={view}
      onTabChange={(k) => setView(k as AEKey)}
      sortOptions={SORT_OPTIONS_BY_TAB[view]}
      sortValue={sortValueByTab[view]}
      onSortChange={(k) => {
        if (view === "queue") setQueueTab(k as QueueTab);
        else if (view === "live") setLiveTab(k as LiveTab);
        else if (view === "history") setHistoryFilter(k as HistoryFilter);
      }}
      count={countByTab[view]}
    >
      {view === "queue" && (
        <AssignmentQueueView
          tab={queueTab}
          readyRows={readyRows}
          scheduledRows={scheduledRows}
          onAssign={handleAssign}
          onSchedule={handleSchedule}
          onLaunch={handleLaunch}
          onReschedule={handleReschedule}
        />
      )}
      {view === "live" && <LivePoolsView pools={filteredPools} setPools={setPools} />}
      {view === "abandoned" && <AbandonedOrdersView setPools={setPools} />}
      {view === "failed" && <FailedPoolsView setPools={setPools} />}
      {view === "history" && <AssignmentHistoryView filter={historyFilter} />}
    </AuditListPage>
  );
};

export default AssignmentsSection;
