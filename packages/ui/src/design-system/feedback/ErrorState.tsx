import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@jobrio/utils/utils";
import { Button } from "@jobrio/ui/design-system/primitives/Button";

export const ErrorState = ({
  title = "Something went wrong",
  description,
  onRetry,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center text-center rounded-2xl border border-destructive/20 bg-destructive/5 p-10 gap-3",
      className,
    )}
  >
    <span className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
      <AlertTriangle className="w-6 h-6" strokeWidth={1.5} />
    </span>
    <h3 className="text-base font-bold text-on-surface">{title}</h3>
    {description ? <p className="text-sm text-on-surface-variant max-w-sm">{description}</p> : null}
    {onRetry ? (
      <Button variant="secondary" size="md" onClick={onRetry}>
        Try again
      </Button>
    ) : null}
  </div>
);
