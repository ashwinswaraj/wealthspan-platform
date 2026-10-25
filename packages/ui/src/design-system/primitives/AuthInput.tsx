import * as React from "react";

/**
 * Auth-only Input / Select / Textarea — pixel-locked to
 * `src/components/signup/FormField.tsx`.
 *
 * Use these ONLY on Sign In, Sign Up, Forgot Password
 * (outside the authenticated dashboard). Inside the dashboard,
 * use the canonical `Input` / `Select` / `Textarea` primitives.
 *
 * Validation UI: pass `invalid` to paint the error state, and render the
 * message through `AuthFieldShell`'s `error` prop (or `AuthErrorText`).
 * Jobrio NEVER uses the browser's native validation bubble — every form that
 * uses these primitives must set `noValidate`.
 */

const REST_BORDER = "#c3c6d7";
const FOCUS_BORDER = "#191c1e";
const ERROR_BORDER = "#b3261e";
const REST_SHADOW = "0 1px 2px 0 rgba(0,0,0,0.05)";
const FOCUS_SHADOW = "0 1px 2px 0 rgba(0,0,0,0.05), 0 0 0 1px rgba(25,28,30,0.30)";
const ERROR_SHADOW = "0 1px 2px 0 rgba(0,0,0,0.05), 0 0 0 1px rgba(179,38,30,0.35)";

const styleFor = (invalid?: boolean): React.CSSProperties => ({
  background: "#ffffff",
  border: `1px solid ${invalid ? ERROR_BORDER : REST_BORDER}`,
  color: "#191c1e",
  outline: "none",
  boxShadow: invalid ? ERROR_SHADOW : REST_SHADOW,
});

const focus = (el: HTMLElement, invalid?: boolean) => {
  el.style.borderColor = invalid ? ERROR_BORDER : FOCUS_BORDER;
  el.style.boxShadow = invalid ? ERROR_SHADOW : FOCUS_SHADOW;
};
const blur = (el: HTMLElement, invalid?: boolean) => {
  el.style.borderColor = invalid ? ERROR_BORDER : REST_BORDER;
  el.style.boxShadow = invalid ? ERROR_SHADOW : REST_SHADOW;
};

export interface AuthControlProps {
  /** Paints the error state (red border + ring). */
  invalid?: boolean;
}

export const AuthInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & AuthControlProps
>(({ className, invalid, ...props }, ref) => {
  console.log("[AuthInput] type:", props.type, "value:", props.value, "onChange:", typeof props.onChange);
  return (
    <input
      ref={ref}
      {...props}
      aria-invalid={invalid || undefined}
      className={`block w-full h-12 rounded-xl px-4 transition-all duration-300 placeholder:text-[#737686] placeholder:opacity-0 focus:placeholder:opacity-100 ${className ?? ""}`}
      style={styleFor(invalid)}
      onFocus={(e) => {
        focus(e.currentTarget, invalid);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        blur(e.currentTarget, invalid);
        props.onBlur?.(e);
      }}
    />
  );
});
AuthInput.displayName = "AuthInput";

export const AuthTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & AuthControlProps
>(({ className, invalid, ...props }, ref) => (
  <textarea
    ref={ref}
    {...props}
    aria-invalid={invalid || undefined}
    className={`block w-full rounded-xl px-4 py-3 transition-all duration-300 placeholder:text-[#737686] placeholder:opacity-0 focus:placeholder:opacity-100 ${className ?? ""}`}
    style={styleFor(invalid)}
    onFocus={(e) => {
      focus(e.currentTarget, invalid);
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      blur(e.currentTarget, invalid);
      props.onBlur?.(e);
    }}
  />
));
AuthTextarea.displayName = "AuthTextarea";

export const AuthSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & AuthControlProps
>(({ className, children, invalid, ...props }, ref) => (
  <select
    ref={ref}
    {...props}
    aria-invalid={invalid || undefined}
    className={`block w-full h-12 rounded-xl px-4 transition-all duration-300 ${className ?? ""}`}
    style={{ ...styleFor(invalid), color: props.value ? "#191c1e" : "#737686" }}
    onFocus={(e) => {
      focus(e.currentTarget, invalid);
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      blur(e.currentTarget, invalid);
      props.onBlur?.(e);
    }}
  >
    {children}
  </select>
));
AuthSelect.displayName = "AuthSelect";

/**
 * AuthErrorText — Jobrio's custom validation message.
 * Replaces the browser's native validation bubble everywhere.
 */
export const AuthErrorText = ({ children }: { children: React.ReactNode }) => {
  if (!children) return null;
  return (
    <span
      role="alert"
      aria-live="polite"
      className="mt-1.5 ml-1 flex items-start gap-1.5 text-xs font-semibold"
      style={{ color: "#b3261e" }}
    >
      <svg className="mt-[1px] h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2 1 21h22L12 2z" fill="currentColor" />
        <path d="M11.1 8.6h1.8l-.25 5.6h-1.3l-.25-5.6z" fill="#ffffff" />
        <circle cx="12" cy="17.1" r="1" fill="#ffffff" />
      </svg>
      <span>{children}</span>
    </span>
  );
};

const hasControlValue = (node: React.ReactNode): boolean =>
  React.Children.toArray(node).some((child) => {
    if (!React.isValidElement<{ value?: unknown; children?: React.ReactNode }>(child)) return false;
    const value = child.props.value;
    if (value !== undefined && value !== null && String(value).length > 0) return true;
    return hasControlValue(child.props.children);
  });

export const AuthFieldShell = ({
  label,
  hint,
  required: _required,
  error,
  children,
  className,
  labelExtra,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  /** Custom inline validation message (never the browser bubble). */
  error?: string | null;
  children: React.ReactNode;
  className?: string;
  labelExtra?: React.ReactNode;
}) => {
  const [focused, setFocused] = React.useState(false);
  const floated = focused || hasControlValue(children);
  if (label === "Phone number" || label === "Full name") {
    const child = React.Children.toArray(children)[0] as any;
    console.log("[AuthFieldShell]", label, "type:", child?.type?.displayName || child?.type?.name, "keys:", child ? Object.keys(child.props || {}) : [], "value:", child?.props?.value, "floated:", floated);
  }

  return (
    <label className={`block ${className ?? ""}`}>
      <span className="relative block">
        <span
          className={`pointer-events-none absolute left-3 z-10 px-1 font-semibold transition-all duration-300 ease-out ${
            floated ? "-top-2 text-xs" : "top-3.5 text-sm"
          }`}
          style={{ color: error ? ERROR_BORDER : focused ? FOCUS_BORDER : "#434655", background: floated ? "#ffffff" : "transparent" }}
        >
          {label}
        </span>
        <span
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
          }}
        >
          {children}
        </span>
        {labelExtra ? <span className="absolute right-1 -top-7">{labelExtra}</span> : null}
      </span>
      {error ? (
        <AuthErrorText>{error}</AuthErrorText>
      ) : hint ? (
        <span className="text-xs mt-1 ml-1 block" style={{ color: "#737686" }}>
          {hint}
        </span>
      ) : null}
    </label>
  );
};
