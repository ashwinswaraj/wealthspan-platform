import * as React from "react";
import { cn } from "@wealthspan/utils/utils";

export interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/** Dashboard page header (page title + optional actions row). */
export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) => (
  <header
    className={cn("flex flex-col md:flex-row md:items-end md:justify-between gap-4", className)}
  >
    <div className="min-w-0">
      {eyebrow ? (
        <p className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-sm text-on-surface-variant max-w-2xl">{description}</p>
      ) : null}
    </div>
    {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
  </header>
);

export const SectionHeader = ({
  title,
  hint,
  actions,
  className,
}: {
  title: React.ReactNode;
  hint?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>
    <div>
      <h2 className="text-sm font-extrabold uppercase tracking-wider text-on-surface">{title}</h2>
      {hint ? <p className="mt-1 text-xs text-on-surface-variant">{hint}</p> : null}
    </div>
    {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
  </div>
);
