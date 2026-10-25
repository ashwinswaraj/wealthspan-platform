import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@jobrio/utils/utils";

/**
 * FieldError — Jobrio's custom inline validation message.
 *
 * Replaces the browser's native validation bubble everywhere. Forms MUST set
 * `noValidate` so the native tooltip never renders and this component is the
 * single validation surface.
 */
export const FieldError = ({
  children,
  id,
  className,
}: {
  children?: React.ReactNode;
  id?: string;
  className?: string;
}) => {
  if (!children) return null;
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={cn(
        "mt-1.5 ml-1 flex items-start gap-1.5 text-xs font-medium text-[#b3261e]",
        className,
      )}
    >
      <AlertCircle className="mt-[1px] h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      <span className="min-w-0 break-words">{children}</span>
    </p>
  );
};

/**
 * FormError — form-level (not field-level) custom error banner.
 */
export const FormError = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  if (!children) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex items-start gap-2 rounded-xl border border-[#f2b8b5] bg-[#fceeee] px-4 py-3 text-sm font-medium text-[#b3261e]",
        className,
      )}
    >
      <AlertCircle className="mt-[2px] h-4 w-4 shrink-0" strokeWidth={2} />
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
};
