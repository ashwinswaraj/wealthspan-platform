import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@jobrio/utils/utils";

export const SectionHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-end justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-on-background">
        {title}
      </h1>
      {subtitle && <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      "bg-surface-container-low rounded-3xl border border-outline-variant/30 p-5",
      className,
    )}
  >
    {children}
  </div>
);

export const Pill = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
      active
        ? "bg-primary text-on-primary shadow-sm"
        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
    )}
  >
    {children}
  </button>
);

export const StatusBadge = ({
  status,
  label,
}: {
  status: "paid" | "pending" | "active" | "completed" | "disputed" | "cancelled";
  label?: string;
}) => {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    paid: {
      label: "Paid",
      cls: "bg-emerald-50 text-emerald-700",
      icon: <CheckCircle2 size={12} />,
    },
    pending: { label: "Pending", cls: "bg-amber-50 text-amber-700", icon: <Clock size={12} /> },
    active: {
      label: "Active",
      cls: "bg-primary-container/10 text-primary-container",
      icon: <Clock size={12} />,
    },
    completed: {
      label: "Completed",
      cls: "bg-emerald-50 text-emerald-700",
      icon: <CheckCircle2 size={12} />,
    },
    disputed: { label: "Disputed", cls: "bg-rose-50 text-rose-700", icon: <XCircle size={12} /> },
    cancelled: {
      label: "Cancelled",
      cls: "bg-slate-100 text-slate-600",
      icon: <XCircle size={12} />,
    },
  };
  const c = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
        c.cls,
      )}
    >
      {c.icon}
      {label ?? c.label}
    </span>
  );
};
