import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@wealthspan/utils/utils";

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tint?: string;
  className?: string;
}

export const StatCard = ({
  label,
  value,
  hint,
  icon: Icon,
  tint = "bg-primary/10 text-primary",
  className,
}: StatCardProps) => (
  <div
    className={cn(
      "rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm flex items-start gap-4",
      className,
    )}
  >
    {Icon ? (
      <span className={cn("shrink-0 w-10 h-10 rounded-xl flex items-center justify-center", tint)}>
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </span>
    ) : null}
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-outline">{label}</p>
      <p className="text-2xl font-extrabold text-on-surface mt-1 truncate">{value}</p>
      {hint ? <p className="text-xs text-on-surface-variant mt-1">{hint}</p> : null}
    </div>
  </div>
);
