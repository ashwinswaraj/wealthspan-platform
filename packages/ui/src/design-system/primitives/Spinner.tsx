import { Loader2 } from "lucide-react";
import { cn } from "@wealthspan/utils/utils";

const sizes = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
} as const;

export interface SpinnerProps {
  size?: keyof typeof sizes;
  className?: string;
  label?: string;
}

export const Spinner = ({ size = "md", className, label }: SpinnerProps) => (
  <span
    role="status"
    aria-live="polite"
    className={cn("inline-flex items-center gap-2 text-on-surface-variant", className)}
  >
    <Loader2 className={cn("animate-spin", sizes[size])} strokeWidth={1.5} />
    {label ? <span className="text-sm">{label}</span> : null}
  </span>
);
