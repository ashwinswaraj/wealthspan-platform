import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";
import { cn } from "@jobrio/utils/utils";
import { Card } from "@admin/features/admin-dashboard/components/sections";

/**
 * Cross-section display atoms for the admin dashboard.
 *
 * These are used by more than one section file (confirmed by usage count
 * before extraction — see CODING_STANDARDS.md §5), which is what makes
 * them "shared" rather than section-private. Per the circular-import rule
 * in CODING_STANDARDS.md §4, this file must never import from a
 * `sections/*.tsx` file or from `adminSections.tsx` — only the reverse.
 */

/** A single stat tile: label, big value, icon chip, optional hint line. */
export const Stat = ({
  label,
  value,
  icon: Icon,
  tint,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tint: string;
  hint?: string;
}) => (
  <Card className="!p-3 @container">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider break-words">
          {label}
        </p>
        <p className="text-lg @[10rem]:text-xl @[14rem]:text-2xl font-extrabold text-on-surface mt-1 whitespace-nowrap">
          {value}
        </p>
        {hint && <p className="text-[10px] text-outline mt-1">{hint}</p>}
      </div>
      <div
        className={cn(
          "w-8 h-8 @[10rem]:w-10 @[10rem]:h-10 rounded-xl flex items-center justify-center shrink-0",
          tint,
        )}
      >
        <Icon size={18} />
      </div>
    </div>
  </Card>
);

/** A single labeled count row, used inside pipeline/queue summary cards. */
export const Pipe = ({
  label,
  count,
  tint,
}: {
  label: string;
  count: number | string;
  tint: string;
}) => (
  <div
    className={cn(
      "rounded-xl border border-outline-variant/30 px-3 py-2.5 bg-surface-container-low flex items-center justify-between",
    )}
  >
    <span className="text-[11px] font-semibold text-on-surface-variant">{label}</span>
    <span className={cn("text-sm font-extrabold px-2 py-0.5 rounded-md", tint)}>{count}</span>
  </div>
);

/** Generic pill-tab row with an optional count badge per tab. */
export const Tabs = <T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {tabs.map((t) => {
      const on = value === t.key;
      return (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border",
            on
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface text-on-surface-variant border-outline-variant/40 hover:border-primary/40",
          )}
        >
          {t.label}
          {typeof t.count === "number" && (
            <span
              className={cn(
                "ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
                on ? "bg-white/20 text-on-primary" : "bg-surface-container-low text-outline",
              )}
            >
              {t.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

/**
 * Simple CSS-grid row layout for stat tiles / cards.
 *
 * `cols` is the desktop column count; on narrow screens the row always falls
 * back to 1–2 columns so tile labels never get squeezed into one-letter-per-line
 * vertical strings on mobile.
 */
export const Row = ({
  cols,
  children,
  className,
}: {
  cols: number;
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "grid gap-3 sm:gap-4 grid-cols-1 min-[380px]:grid-cols-2 md:[grid-template-columns:repeat(var(--row-cols),minmax(0,1fr))]",
      className,
    )}
    style={{ "--row-cols": cols } as CSSProperties}
  >
    {children}
  </div>
);

/** Small rounded status/label chip — tone is a full Tailwind class string. */
export const Badge = ({ tone, children }: { tone: string; children: ReactNode }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
      tone,
    )}
  >
    {children}
  </span>
);

/** Label-over-value key/detail pair, used in overlay/detail panels. */
export const Detail = ({ k, v }: { k: string; v: string }) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase tracking-wider text-outline font-bold">{k}</span>
    <span className="text-on-surface font-semibold">{v}</span>
  </div>
);

/** Small uppercase section heading with an optional trailing hint. */
export const SectionTitle = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="flex items-end justify-between gap-3 mb-3">
    <h3 className="text-sm font-extrabold uppercase tracking-widest text-on-surface">{title}</h3>
    {hint && <span className="text-[10px] text-outline">{hint}</span>}
  </div>
);

/** Colored status dot + label for workforce/service health indicators. */
export const HealthDot = ({ status }: { status: "healthy" | "watch" | "shortage" }) => {
  const m = {
    healthy: { c: "bg-emerald-500", l: "Healthy", t: "text-emerald-700 bg-emerald-50" },
    watch: { c: "bg-amber-500", l: "Watch", t: "text-amber-700 bg-amber-50" },
    shortage: { c: "bg-rose-500", l: "Shortage", t: "text-rose-700 bg-rose-50" },
  }[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
        m.t,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", m.c)} />
      {m.l}
    </span>
  );
};

/** Small material-symbols icon span — `name` is the glyph name. Used for
 * inline icons across nav pills, action buttons, and detail rows. */
export const AEIcon = ({ name, className }: { name: string; className?: string }) => (
  <span className={cn("material-symbols-outlined", className)} style={{ fontSize: 16 }}>
    {name}
  </span>
);

/** Label-over-value info tile — used in overlay/detail panels across
 * Dashboard, Assignments, QA, Finance, and Disputes. */
export const InfoChip = ({
  k,
  v,
  tone = "text-on-surface",
}: {
  k: string;
  v: string;
  tone?: string;
}) => (
  <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2">
    <p className="text-[10px] uppercase tracking-wider text-outline font-bold">{k}</p>
    <p className={cn("text-sm font-extrabold mt-0.5", tone)}>{v}</p>
  </div>
);

/** Small pill action button without a fake success fallback when no
 * onClick is supplied — used throughout every table/overlay action row. */
export const ActionBtn = ({
  label,
  icon,
  tone = "primary",
  onClick,
  disabled: disabledProp,
}: {
  label: string;
  icon?: string;
  tone?: "primary" | "neutral" | "danger" | "warn" | "success";
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const tones: Record<string, string> = {
    primary: "bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/80",
    neutral:
      "bg-surface-container-low text-on-surface border border-outline-variant/40 hover:bg-surface-container active:bg-surface-container-high",
    danger: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800",
    warn: "bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800",
  };
  const handleClick = () => {
    if (onClick) onClick();
  };
  const disabled = disabledProp ?? !onClick;
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={disabled}
      title={disabled ? "This action is not wired in this build." : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        disabled
          ? "bg-surface-container text-outline border border-outline-variant/40 cursor-not-allowed opacity-70"
          : cn("cursor-pointer", tones[tone]),
      )}
    >
      {icon && <AEIcon name={icon} />}
      {label}
    </button>
  );
};

/** Reusable data table shell — header row from `head`, body rows passed
 * in directly. Used by both Audit & Logs and Security. */
export const AudTable = ({ head, body }: { head: string[]; body: ReactNode }) => (
  <Card className="!p-0 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-surface-container-low">
          <tr>
            {head.map((h) => (
              <th
                key={h}
                className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-outline whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container-high/60">{body}</tbody>
      </table>
    </div>
  </Card>
);

/** Full-screen modal shell (title, subtitle, optional badge, close button)
 * used for detail/overlay panels — shared across Workforce, Broadcasts,
 * Services, and Roles (confirmed by usage span before moving). */
export const WFShell = ({
  title,
  subtitle,
  badge,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) => (
  <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center p-0 md:p-6">
    <div className="absolute inset-0 bg-black/50" onClick={onClose} />
    <div className="relative z-10 w-full md:max-w-5xl bg-surface rounded-none md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-screen md:max-h-[92vh]">
      <div className="flex items-start gap-4 px-5 py-4 border-b border-surface-container-high">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-outline">{subtitle}</p>
          <p className="text-lg font-extrabold text-on-surface truncate">{title}</p>
        </div>
        {badge}
        <button
          onClick={onClose}
          className="ml-2 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container-low"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-on-surface-variant" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">{children}</div>
    </div>
  </div>
);

/* ------------------------------------------------------------------
 * Cross-file service catalog data.
 * SD_SERVICES is consumed by both ServicesSection (sections/services.tsx)
 * and GlobalSearchOverlay.tsx (via the ADMIN_SERVICES alias exported from
 * adminSections.tsx) — lives here so neither has to import a leaf
 * section file.
 * ------------------------------------------------------------------ */
export type { SDCategory, SDService } from "@jobrio/constants";
export { SD_CATEGORIES, SD_SERVICES } from "@jobrio/constants";
/* ------------------------------------------------------------------
 * Cross-file order catalog data.
 * ORDERS is consumed by both OrdersSection (sections/order-desk.tsx)
 * and GlobalSearchOverlay.tsx (via the ADMIN_ORDERS alias exported from
 * adminSections.tsx) -- lives here so neither has to import a leaf
 * section file. Moved to @jobrio/constants (orders.ts) so the platform
 * app can submit new orders into the same shared registry.
 * ------------------------------------------------------------------ */
export type { OrderStatus, OrderRow } from "@jobrio/constants";
export { ORDERS } from "@jobrio/constants";
