import * as React from "react";
import { cn } from "@jobrio/utils/utils";

/**
 * Dashboard Input / Select / Textarea — pixel-locked to
 * Services Desk → Create Service (SDInput/SDSelect/SDTextarea).
 *
 * Use these inside the authenticated dashboard.
 * For auth surfaces (Sign In / Sign Up / Forgot Password),
 * use `AuthInput`, `AuthSelect`, `AuthTextarea` instead.
 */

const baseField =
  "w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30 transition-colors";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(baseField, className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(baseField, className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn(baseField, className)} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";

export const FieldLabel = ({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) => (
  <label
    htmlFor={htmlFor}
    className={cn("text-[10px] font-bold uppercase tracking-wider text-outline", className)}
  >
    {children}
  </label>
);

export const FieldHint = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-1 text-xs text-on-surface-variant">{children}</p>
);
