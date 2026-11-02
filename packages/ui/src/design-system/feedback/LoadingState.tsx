import { Spinner } from "@wealthspan/ui/design-system/primitives/Spinner";
import { cn } from "@wealthspan/utils/utils";

export const LoadingState = ({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) => (
  <div
    className={cn("flex flex-col items-center justify-center text-center p-10 gap-3", className)}
  >
    <Spinner size="lg" />
    <p className="text-sm text-on-surface-variant">{label}</p>
  </div>
);
