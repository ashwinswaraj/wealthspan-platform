import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@wealthspan/utils/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral:
          "bg-surface-container-low text-on-surface-variant border border-outline-variant/40",
        primary: "bg-primary/10 text-primary",
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-amber-50 text-amber-700",
        danger: "bg-rose-50 text-rose-700",
        info: "bg-primary-container/10 text-primary-container",
        muted: "bg-slate-100 text-slate-700",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, tone, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ tone }), className)} {...props} />
);

export const Tag = Badge;
export const StatusChip = Badge;
