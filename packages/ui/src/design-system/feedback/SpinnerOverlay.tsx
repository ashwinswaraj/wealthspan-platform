import * as React from "react";
import { Spinner } from "@jobrio/ui/design-system/primitives/Spinner";
import { cn } from "@jobrio/utils/utils";

/**
 * Auth-surface loading language.
 *
 * Auth pages (sign in / sign up / forgot password / signup steps / intent)
 * intentionally do NOT use skeletons — they use spinners:
 *  - `PageSpinner`    : full-screen centered spinner (route/page level)
 *  - `OverlaySpinner` : blocking overlay on top of an existing surface
 *  - `ButtonSpinner`  : inline spinner inside a submit button
 */

export const PageSpinner = ({ label, className }: { label?: string; className?: string }) => (
  <div
    className={cn(
      "min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-surface",
      className,
    )}
    role="status"
    aria-live="polite"
  >
    <Spinner size="xl" />
    {label ? <p className="text-sm font-medium text-on-surface-variant">{label}</p> : null}
  </div>
);

export const OverlaySpinner = ({ show, label }: { show: boolean; label?: string }) => {
  if (!show) return null;
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 rounded-[inherit] backdrop-blur-[2px]"
      style={{ background: "rgba(255,255,255,0.72)" }}
      role="status"
      aria-live="polite"
    >
      <Spinner size="xl" />
      {label ? <p className="text-sm font-semibold text-on-surface-variant">{label}</p> : null}
    </div>
  );
};

export const ButtonSpinner = ({ className }: { className?: string }) => (
  <span
    className={cn(
      "inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white",
      className,
    )}
    aria-hidden
  />
);

/** Wraps children in a relatively-positioned box so OverlaySpinner can anchor. */
export const SpinnerBoundary = ({
  loading,
  label,
  children,
  className,
}: {
  loading: boolean;
  label?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("relative", className)} aria-busy={loading}>
    {children}
    <OverlaySpinner show={loading} label={label} />
  </div>
);
