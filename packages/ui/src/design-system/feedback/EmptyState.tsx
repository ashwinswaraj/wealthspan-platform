import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@jobrio/utils/utils";
import { Button } from "@jobrio/ui/design-system/primitives/Button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-outline-variant/60 bg-surface-container-lowest p-10 gap-3",
      className,
    )}
  >
    <span className="w-12 h-12 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center">
      <Icon className="w-6 h-6" strokeWidth={1.5} />
    </span>
    <h3 className="text-base font-bold text-on-surface">{title}</h3>
    {description ? <p className="text-sm text-on-surface-variant max-w-sm">{description}</p> : null}
    {actionLabel && onAction ? (
      <Button variant="primary" size="md" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </div>
);
