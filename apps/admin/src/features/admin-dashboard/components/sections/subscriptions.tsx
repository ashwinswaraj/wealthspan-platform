import { useMemo, useState } from "react";
import { formatINR, paiseToRupees, rupeesToPaise } from "@wealthspan/utils/finance";
import { useAdminOverview, useAdminPayments, useReviewPayment } from "../../lib/adminApi";
import type { AdminPaymentRow, PaymentStatusLabel } from "../../lib/types";

/** Mirrors PLANS in apps/api/src/features/subscription/types.ts (prices in paise). Change there first. */
const PLANS = {
  pro_monthly: { label: "Pro — monthly", pricePaise: 19900, days: 30 },
  pro_annual: { label: "Pro — annual", pricePaise: 199900, days: 365 },
} as const;
type PlanKey = keyof typeof PLANS;
const PLAN_KEYS = Object.keys(PLANS) as PlanKey[];

const PLAN_META: Record<PlanKey, { tab: string; unit: string; color: string; tint: string; glow: string; short: string }> = {
  pro_monthly: {
    tab: "Monthly",
    unit: "/month",
    color: "rgb(29, 109, 229)",
    tint: "rgba(29, 109, 229, 0.094)",
    glow: "radial-gradient(circle at right top, rgba(29, 109, 229, 0.18) 0%, rgba(29, 109, 229, 0.07) 40%, transparent 70%)",
    short: "rgba(29, 109, 229, 0.125)",
  },
  pro_annual: {
    tab: "Annual",
    unit: "/year",
    color: "rgb(16, 185, 129)",
    tint: "rgba(16, 185, 129, 0.094)",
    glow: "radial-gradient(circle at right top, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0.07) 40%, transparent 70%)",
    short: "rgba(16, 185, 129, 0.125)",
  },
};

const SAVE_NOTICE = "Plan prices are set in the API for now";
const FILTERS = ["all", "pending", "approved", "rejected"] as const;
type Filter = (typeof FILTERS)[number];

const upiId = () => {
  const v = import.meta.env.VITE_UPI_ID as string | undefined;
  return v && v.trim() ? v.trim() : "—";
};

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const matches = (p: AdminPaymentRow, q: string) =>
  !q || [p.utr, p.userEmail, p.orderId].some((f) => (f ?? "").toLowerCase().includes(q));

const STATUS_TONE: Record<PaymentStatusLabel, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
};

const FLOAT_LABEL =
  "absolute pointer-events-none transition-all duration-200 ease-out z-10 select-none -top-2.5 left-4 px-1.5 text-xs font-semibold bg-white dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] rounded-sm";
const FIELD =
  "w-full h-12 bg-white dark:bg-[#212121] rounded-2xl px-4 text-[#0d0d0d] dark:text-[#ececec] text-sm font-normal focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed border border-[#0d0d0d]/40 dark:border-[#ececec]/40";
const FIELD_PREFIXED = FIELD.replace("px-4", "pl-11 pr-5");

function SearchBox({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative w-full">
      {!value && (
        <label htmlFor={id} className="absolute pointer-events-none transition-all duration-200 ease-out z-10 select-none left-11 top-1/2 -translate-y-1/2 px-0 text-sm font-normal text-[#737373] dark:text-[#b4b4b4] bg-transparent">
          {label}
        </label>
      )}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737373] dark:text-[#b4b4b4] pointer-events-none z-10 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search w-4 h-4" aria-hidden="true">
          <path d="m21 21-4.34-4.34" />
          <circle cx="11" cy="11" r="8" />
        </svg>
      </div>
      <input id={id} placeholder="" className="w-full h-12 bg-white dark:bg-[#212121] rounded-2xl pl-11 pr-5 text-[#0d0d0d] dark:text-[#ececec] text-sm font-normal focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed border border-[#ebebeb] dark:border-[#383838]" type="text" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function PlanSummaryCard({ planKey }: { planKey: PlanKey }) {
  const m = PLAN_META[planKey];
  const p = PLANS[planKey];
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#212121] border border-[#ebebeb] dark:border-[#383838] shadow-xs flex items-center justify-between">
      <div className="min-w-0 pr-2">
        <div className="text-xs text-[#737373] dark:text-[#b4b4b4] font-medium">Plan {PLAN_KEYS.indexOf(planKey) + 1}: {m.tab}</div>
        <div className="text-base font-bold text-[#0d0d0d] dark:text-[#ececec] mt-0.5 truncate">Wealthspan {p.label} ({formatINR(p.pricePaise)})</div>
        <div className="text-xs font-medium mt-0.5 truncate" style={{ color: m.color }}>Tab: Pro • Active in App</div>
      </div>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0" style={{ backgroundColor: m.short, color: m.color }}>PRO</div>
    </div>
  );
}

function PlanCard({ planKey, onEdit, onDelete }: { planKey: PlanKey; onEdit: () => void; onDelete: () => void }) {
  const m = PLAN_META[planKey];
  const p = PLANS[planKey];
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] border border-[#e5e7eb] dark:border-[#2f2f2f] p-6 sm:p-7 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
      <div className="absolute top-0 right-0 w-44 h-44 pointer-events-none rounded-bl-full transition-opacity opacity-75 dark:opacity-40" style={{ background: m.glow }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-[13px] font-bold uppercase tracking-wider inline-flex items-center shadow-xs" style={{ backgroundColor: m.tint, color: m.color }}>
            Pro • {m.tab}
          </span>
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={onEdit} className="px-7 py-3 sm:px-8 sm:py-3.5 rounded-full bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black text-[14px] sm:text-[15.5px] font-semibold transition-all duration-150 cursor-pointer shadow-lg active:scale-95 flex items-center justify-center">
              Edit Plan
            </button>
            <button type="button" title="Delete Plan" onClick={onDelete} className="w-12 h-12 rounded-full border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 dark:text-rose-400 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <h3 className="text-2xl sm:text-[28px] font-extrabold text-[#111827] dark:text-white tracking-tight mt-5">Wealthspan {p.label}</h3>
        <p className="text-sm sm:text-[14.5px] text-[#6b7280] dark:text-[#9ca3af] font-normal mt-1 leading-relaxed">Access for {p.days} days per approved payment</p>
        <div className="mt-5 flex items-baseline gap-1">
          <span className="text-3xl sm:text-[36px] font-black text-[#111827] dark:text-white tracking-tight">{formatINR(p.pricePaise)}</span>
          <span className="text-xs sm:text-sm font-normal text-[#6b7280] dark:text-[#9ca3af] ml-1">{m.unit}</span>
        </div>
      </div>
      <div className="relative z-10 mt-6 pt-5 border-t border-[#f3f4f6] dark:border-[#262626]">
        <div className="text-[11.5px] sm:text-xs font-bold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af] mb-3.5">PLAN DETAILS:</div>
        <ul className="space-y-3">
          {[`${p.days} days of access`, "Activated after UTR approval"].map((t) => (
            <li key={t} className="flex items-center gap-2.5 text-[13.5px] sm:text-[14px] text-[#1f2937] dark:text-[#e5e7eb] font-normal">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
              <span className="truncate">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function EditPlanModal({ initial, onClose }: { initial: PlanKey | null; onClose: () => void }) {
  const creating = initial === null;
  const [tab, setTab] = useState<1 | 2>(1);
  const [planKey, setPlanKey] = useState<PlanKey>(initial ?? "pro_monthly");
  const seed = (k: PlanKey | null) => ({
    name: k ? PLANS[k].label : "",
    price: k ? String(paiseToRupees(PLANS[k].pricePaise)) : "",
    days: k ? String(PLANS[k].days) : "",
  });
  const [draft, setDraft] = useState(seed(initial));
  const [notice, setNotice] = useState(false);
  const m = PLAN_META[planKey];

  const pick = (k: PlanKey) => {
    setPlanKey(k);
    setDraft(seed(k));
    setNotice(false);
  };
  const set = (k: keyof typeof draft) => (e: React.ChangeEvent<HTMLInputElement>) => setDraft((d) => ({ ...d, [k]: e.target.value }));
  const paise = rupeesToPaise(draft.price);
  const tabBase = "flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer";
  const tabOn = "border-black dark:border-white text-black dark:text-white bg-neutral-50 dark:bg-[#252525]";
  const tabOff = "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#1a1a1a] rounded-[28px] border border-[#ebebeb] dark:border-[#383838] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#ebebeb] dark:border-[#383838] flex items-center justify-between bg-white dark:bg-[#212121]">
          <h3 className="text-xl sm:text-[22px] font-bold tracking-tight text-gray-950 dark:text-white">Upgrade Plans Management</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="w-10 h-10 rounded-full border border-[#ebebeb] dark:border-[#2f2f2f] shadow-sm flex items-center justify-center text-gray-700 dark:text-[#ececec] hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2f2f2f] active:bg-gray-200 dark:active:bg-[#383838] focus:outline-none active:scale-95 transition-all duration-150 cursor-pointer bg-white dark:bg-[#212121]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex border-b border-[#ebebeb] dark:border-[#383838] bg-white dark:bg-[#1a1a1a]">
          <button type="button" onClick={() => setTab(1)} className={`${tabBase} ${tab === 1 ? tabOn : tabOff}`}>
            {creating ? "1. New Plan" : `1. Select Plan to Edit (${m.tab.toUpperCase()})`}
          </button>
          <button type="button" onClick={() => setTab(2)} className={`${tabBase} ${tab === 2 ? tabOn : tabOff}`}>2. Features Matrix (All Tiers)</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {tab === 2 ? (
            <p className="text-sm text-[#737373] dark:text-[#b4b4b4]">Not available yet — the API does not define a feature matrix.</p>
          ) : (
            <div className="space-y-6">
              {!creating && (
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-sm font-bold text-[#0d0d0d] dark:text-white">Select Plan to Edit:</h4>
                  <div className="inline-flex p-1 bg-neutral-100 dark:bg-[#252525] rounded-xl border border-[#ebebeb] dark:border-[#383838] flex-wrap gap-1">
                    {PLAN_KEYS.map((k) => (
                      <button key={k} type="button" onClick={() => pick(k)} className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${k === planKey ? "text-white shadow-xs" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"}`} style={k === planKey ? { backgroundColor: PLAN_META[k].color } : undefined}>
                        Wealthspan {PLANS[k].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="relative w-full">
                    <label htmlFor="edit-plan-name" className={FLOAT_LABEL}>Plan Full Name</label>
                    <input id="edit-plan-name" placeholder="" className={FIELD} type="text" value={draft.name} onChange={set("name")} />
                  </div>
                </div>
                <div>
                  <div className="relative w-full">
                    <label htmlFor="edit-plan-id" className={FLOAT_LABEL}>Plan ID</label>
                    <input id="edit-plan-id" placeholder="" className={FIELD} type="text" value={creating ? "" : planKey} readOnly />
                  </div>
                </div>
                <div>
                  <div className="relative w-full">
                    <label htmlFor="edit-plan-price-numeric" className={FLOAT_LABEL}>Price (₹)</label>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737373] dark:text-[#b4b4b4] pointer-events-none z-10 flex items-center justify-center">
                      <span className="font-bold text-xs">₹</span>
                    </div>
                    <input id="edit-plan-price-numeric" placeholder="" className={FIELD_PREFIXED} type="number" value={draft.price} onChange={set("price")} />
                  </div>
                </div>
                <div>
                  <div className="relative w-full">
                    <label htmlFor="edit-plan-price-formatted" className={FLOAT_LABEL}>Price Display</label>
                    <input id="edit-plan-price-formatted" placeholder="" className={FIELD} type="text" value={paise === null ? "—" : formatINR(paise)} readOnly />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="relative w-full">
                    <label htmlFor="edit-plan-days" className={FLOAT_LABEL}>Access Duration (days)</label>
                    <input id="edit-plan-days" placeholder="" className={FIELD} type="number" value={draft.days} onChange={set("days")} />
                  </div>
                </div>
              </div>
            </div>
          )}
          {notice && <p role="status" className="text-xs font-medium text-amber-600 dark:text-amber-400">{SAVE_NOTICE}.</p>}
        </div>
        <div className="px-6 py-4 border-t border-[#ebebeb] dark:border-[#383838] bg-white dark:bg-[#212121] flex flex-wrap items-center justify-end gap-3.5">
          <button type="button" onClick={onClose} className="px-7 py-3 sm:px-8 sm:py-3.5 bg-white dark:bg-[#1e222b] text-gray-900 dark:text-white border border-gray-200/90 dark:border-neutral-700/80 text-[14px] sm:text-[15.5px] font-semibold rounded-full shadow-md active:scale-95 hover:bg-gray-50 dark:hover:bg-[#252a36] flex items-center gap-2.5 transition-all duration-150 cursor-pointer">
            Cancel
          </button>
          <button type="button" onClick={() => setNotice(true)} className="px-7 py-3 sm:px-8 sm:py-3.5 bg-black dark:bg-white text-white dark:text-black text-[14px] sm:text-[15.5px] font-semibold rounded-full shadow-lg active:scale-95 hover:bg-neutral-900 dark:hover:bg-neutral-100 flex items-center gap-2.5 transition-all duration-150 cursor-pointer disabled:opacity-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Save & Push to App</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const PILL_ON = "bg-black dark:bg-white text-white dark:text-black font-semibold shadow-xs";
const PILL_OFF = "bg-[#f0f2f5] dark:bg-[#202531] border border-[#d8dce4] dark:border-[#2e3646] text-[#1c2027] dark:text-[#f0f2f5] hover:bg-[#e4e7ec] dark:hover:bg-[#293040]";

function ReviewButtons({ row }: { row: AdminPaymentRow }) {
  const review = useReviewPayment();
  const busy = review.isPending && review.variables?.id === row.id;
  if (row.status !== "pending") return <span className="text-xs text-[#737373] dark:text-[#b4b4b4]">—</span>;
  const base = "px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center justify-end gap-2">
        <button type="button" disabled={busy} onClick={() => review.mutate({ id: row.id, decision: "approve" })} className={`${base} bg-black dark:bg-white text-white dark:text-black shadow-xs`}>Approve</button>
        <button type="button" disabled={busy} onClick={() => review.mutate({ id: row.id, decision: "reject" })} className={`${base} border border-rose-200 dark:border-rose-900/50 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40`}>Reject</button>
      </div>
      {review.isError && review.variables?.id === row.id && (
        <span role="alert" className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Could not update this payment. Try again.</span>
      )}
    </div>
  );
}

function UpiQueue() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const payments = useAdminPayments(filter);
  const overview = useAdminOverview();
  const pending = overview.data?.pendingPayments ?? null;
  const q = query.trim().toLowerCase();
  const rows = useMemo(() => (payments.data ?? []).filter((p) => matches(p, q)), [payments.data, q]);
  const emptyText = payments.isPending ? "Loading payments…" : payments.isError ? "Could not load payments." : "No payment records found matching the filter.";

  return (
    <section className="bg-white dark:bg-[#2f2f2f] rounded-2xl border border-[#ebebeb] dark:border-[#383838] shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-[#ebebeb] dark:border-[#383838] bg-[#f9f9f9] dark:bg-[#212121] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-[#0d0d0d] dark:text-[#ececec]">UPI Verification Queue (UTR Approvals)</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${pending ? STATUS_TONE.pending : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"}`}>
              {pending === null ? "—" : pending === 0 ? "Queue Clear" : `${pending} pending`}
            </span>
          </div>
          <p className="text-xs text-[#737373] dark:text-[#b4b4b4] mt-0.5 flex items-center gap-2">
            <span>Direct UPI collection to destination:</span>
            <span className="font-mono font-bold text-[#0d0d0d] dark:text-[#ececec] bg-[#f9f9f9] dark:bg-[#212121] px-2 py-0.5 rounded border border-[#ebebeb] dark:border-[#383838]">{upiId()}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {FILTERS.map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-xs font-semibold capitalize shrink-0 transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-2 active:scale-95 shadow-xs ${f === filter ? PILL_ON : PILL_OFF}`}>
                <span>{f}</span>
              </button>
            ))}
          </div>
          <div className="w-56">
            <SearchBox id="upi-payments-search" label="Search UTR / Email" value={query} onChange={setQuery} />
          </div>
          <button type="button" onClick={() => void payments.refetch()} className="h-12 px-4 rounded-2xl bg-[#f9f9f9] hover:bg-[#ebebeb] dark:bg-[#212121] dark:hover:bg-[#383838] text-[#0d0d0d] dark:text-[#ececec] border border-[#ebebeb] dark:border-[#383838] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95" title="Refresh verification list">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-refresh-cw w-3.5 h-3.5 ${payments.isFetching ? "animate-spin" : ""}`} aria-hidden="true">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#ebebeb] dark:border-[#383838] bg-[#f9f9f9] dark:bg-[#212121] text-xs font-bold text-[#737373] dark:text-[#b4b4b4] uppercase tracking-wider">
              <th className="py-3.5 px-6">12-Digit UTR / Ref No.</th>
              <th className="py-3.5 px-4">User Email / Account</th>
              <th className="py-3.5 px-4">Plan Tier</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Order ID & Date</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-6 text-right">Approval Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebebeb] dark:divide-[#383838] text-sm">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-[#737373] dark:text-[#b4b4b4]">{emptyText}</td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="hover:bg-[#f9f9f9]/70 dark:hover:bg-[#383838]/40 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-semibold text-xs text-[#0d0d0d] dark:text-[#ececec]">{p.utr || "—"}</td>
                  <td className="py-3.5 px-4 text-[#0d0d0d] dark:text-[#ececec]">{p.userEmail || "—"}{p.reference ? <span className="block font-mono text-[11px] text-[#737373] dark:text-[#b4b4b4]">{p.reference}</span> : null}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex px-4 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap shadow-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">{p.plan || "—"}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#0d0d0d] dark:text-[#ececec]">{formatINR(p.amountPaise)}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-xs text-[#0d0d0d] dark:text-[#ececec]">{p.orderId || "—"}</div>
                    <div className="text-xs text-[#737373] dark:text-[#b4b4b4]">{fmtDate(p.createdAt)}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${STATUS_TONE[p.status] ?? ""}`}>{p.status}</span>
                  </td>
                  <td className="py-3.5 px-6 text-right"><ReviewButtons row={p} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Approved payments are the real "invoices": one row per approved UTR. */
function ApprovedPayments() {
  const [query, setQuery] = useState("");
  const approved = useAdminPayments("approved");
  const q = query.trim().toLowerCase();
  const rows = useMemo(() => (approved.data ?? []).filter((p) => matches(p, q)), [approved.data, q]);
  const emptyText = approved.isPending ? "Loading payments…" : approved.isError ? "Could not load payments." : "No approved payments yet.";

  return (
    <section className="bg-white dark:bg-[#2f2f2f] rounded-2xl border border-[#ebebeb] dark:border-[#383838] shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-[#ebebeb] dark:border-[#383838] bg-[#f9f9f9] dark:bg-[#212121] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#0d0d0d] dark:text-[#ececec]">Pro Subscriber Payments</h2>
          <p className="text-xs text-[#737373] dark:text-[#b4b4b4] mt-0.5">Approved UPI payments that activated a Pro subscription.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-72">
            <SearchBox id="invoices-table-search" label="Search Payments & Emails" value={query} onChange={setQuery} />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#ebebeb] dark:border-[#383838] bg-[#f9f9f9] dark:bg-[#212121] text-xs font-bold text-[#737373] dark:text-[#b4b4b4] uppercase tracking-wider">
              <th className="py-3.5 px-6">Order ID</th>
              <th className="py-3.5 px-4">Subscriber</th>
              <th className="py-3.5 px-4">Plan Tier</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Payment Rail</th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebebeb] dark:divide-[#383838] text-sm">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-[#737373] dark:text-[#b4b4b4]">{emptyText}</td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="hover:bg-[#f9f9f9]/70 dark:hover:bg-[#383838]/40 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-semibold text-xs text-[#0d0d0d] dark:text-[#ececec]">{p.orderId || "—"}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#0d0d0d] dark:text-[#ececec]">{p.userEmail || "—"}</div>
                    <div className="text-xs text-[#737373] dark:text-[#b4b4b4]">UTR {p.utr || "—"} • {p.reference ? `${p.reference} • ` : ""}{fmtDate(p.createdAt)}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex px-6 py-2 sm:px-7 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] font-semibold whitespace-nowrap shadow-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">{p.plan || "—"}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#0d0d0d] dark:text-[#ececec]">{formatINR(p.amountPaise)}</td>
                  <td className="py-3.5 px-4 text-xs font-medium text-[#737373] dark:text-[#b4b4b4]">UPI (manual)</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">Approved</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function SubscriptionsSection() {
  const overview = useAdminOverview();
  // undefined = closed, null = "create new", PlanKey = edit that plan
  const [modal, setModal] = useState<PlanKey | null | undefined>(undefined);
  const [notice, setNotice] = useState(false);
  const pending = overview.data?.pendingPayments;

  return (
    <>
      <div className="flex flex-col w-full min-h-full bg-white dark:bg-[#16191f] pb-16 text-[#0d0d0d] dark:text-[#ececec]">
        <div className="px-6 sm:px-8 pt-1 sm:pt-2 pb-6 flex flex-col gap-6 border-b border-[#ebebeb] dark:border-[#2f2f2f] bg-white dark:bg-[#16191f]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-gray-950 dark:text-white">Upgrade Plans Management</h1>
            </div>
            <button id="btn-create-new-plan" type="button" onClick={() => setModal(null)} className="px-7 py-3 sm:px-8 sm:py-3.5 bg-black dark:bg-white text-white dark:text-black text-[14px] sm:text-[15.5px] font-semibold rounded-full shadow-lg active:scale-95 hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all duration-150 cursor-pointer flex items-center gap-2.5">
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create New Plan</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {PLAN_KEYS.map((k) => (
              <PlanSummaryCard key={k} planKey={k} />
            ))}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#212121] border border-[#ebebeb] dark:border-[#383838] shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs text-[#737373] dark:text-[#b4b4b4] font-medium">Payments to Review</div>
                <div className="text-base font-bold text-[#0d0d0d] dark:text-[#ececec] mt-0.5">{typeof pending === "number" ? `${pending} Pending` : "—"}</div>
                <div className="text-xs text-[#737373] dark:text-[#b4b4b4] font-medium mt-0.5">UPI UTR approvals</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">⚡</div>
            </div>
          </div>
        </div>
        <div className="px-6 sm:px-8 py-8 flex flex-col gap-8">
          {notice && <p role="status" className="text-xs font-medium text-amber-600 dark:text-amber-400">{SAVE_NOTICE}.</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLAN_KEYS.map((k) => (
              <PlanCard key={k} planKey={k} onEdit={() => setModal(k)} onDelete={() => setNotice(true)} />
            ))}
            <div role="button" tabIndex={0} onClick={() => setModal(null)} onKeyDown={(e) => e.key === "Enter" && setModal(null)} className="rounded-[32px] border-2 border-dashed border-[#d8dce4] dark:border-[#383838] hover:border-black dark:hover:border-white p-8 flex flex-col items-center justify-center text-center gap-3.5 cursor-pointer transition-all bg-neutral-50/50 hover:bg-neutral-50 dark:bg-[#212121]/30 dark:hover:bg-[#212121] group min-h-[300px]">
              <div className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <div className="text-base font-bold text-[#0d0d0d] dark:text-white">Create New Plan</div>
                <p className="text-xs text-[#737373] dark:text-[#b4b4b4] mt-1 max-w-[200px]">Add custom tier with unique pricing, limits and feature matrix</p>
              </div>
            </div>
          </div>
          <UpiQueue />
          <ApprovedPayments />
        </div>
      </div>
      {modal !== undefined && <EditPlanModal key={modal ?? "new"} initial={modal} onClose={() => setModal(undefined)} />}
    </>
  );
}
