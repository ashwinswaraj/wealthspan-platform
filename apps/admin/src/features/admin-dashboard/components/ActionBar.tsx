/* ------------------------------------------------------------------
 * ActionBar — the single way an admin surface renders CTAs.
 *
 * It takes the output of `getAvailableActions()` (never a hand-written
 * list), lays it out as primary → secondary → overflow, and enforces the
 * confirmation / reason capture the action definition asks for.
 *
 * Because the input is already state- and permission-resolved, a surface
 * physically cannot render an action that is invalid for the resource's
 * current state. Execution still goes through the authority layer in
 * `@jobrio/constants` — this component is presentation only.
 * ------------------------------------------------------------------ */

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@jobrio/utils/utils";
import type { ResolvedAction } from "@jobrio/constants";

const TONES = {
  primary: "bg-primary text-on-primary hover:opacity-90",
  neutral:
    "bg-surface-container-low border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container",
  warning: "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
  danger: "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
} as const;

export type ActionButtonProps = {
  label: string;
  onClick?: () => void;
  tone?: keyof typeof TONES;
  icon?: string;
  disabled?: boolean;
  title?: string;
};

export const ActionButton = ({
  label,
  onClick,
  tone = "primary",
  icon,
  disabled,
  title,
}: ActionButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-disabled={disabled || undefined}
    className={cn(
      "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      TONES[tone],
      disabled && "opacity-50 cursor-not-allowed",
    )}
  >
    {icon && (
      <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 14 }}>
        {icon}
      </span>
    )}
    {label}
  </button>
);

/* ------------------------------------------------------------------ */

type PendingAction<S extends string, R> = {
  action: ResolvedAction<S, R>;
  reason: string;
};

const ConfirmDialog = <S extends string, R>({
  pending,
  onCancel,
  onConfirm,
  onReasonChange,
}: {
  pending: PendingAction<S, R>;
  onCancel: () => void;
  onConfirm: () => void;
  onReasonChange: (value: string) => void;
}) => {
  const titleId = useId();
  const descId = useId();
  const firstFieldRef = useRef<HTMLTextAreaElement | HTMLButtonElement | null>(null);
  const { action, reason } = pending;
  const needsReason = action.requiresReason;
  const blocked = needsReason && !reason.trim();

  useEffect(() => {
    firstFieldRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 w-full max-w-md bg-surface rounded-2xl shadow-2xl p-5 space-y-4"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
            {action.destructive ? "Destructive action" : "Confirm action"}
          </p>
          <h2 id={titleId} className="text-lg font-extrabold text-on-surface">
            {action.label}
          </h2>
          <p id={descId} className="text-xs text-on-surface-variant mt-1">
            {action.to
              ? `This moves the record to "${action.to}". It is recorded in the audit trail.`
              : "This is recorded in the audit trail."}
          </p>
        </div>

        {needsReason && (
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline">
              Reason (required)
            </span>
            <textarea
              ref={firstFieldRef as React.RefObject<HTMLTextAreaElement>}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-outline-variant/50 bg-surface-container-low px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Why is this action being taken?"
            />
          </label>
        )}

        <div className="flex justify-end gap-2">
          <ActionButton label="Cancel" tone="neutral" onClick={onCancel} />
          <ActionButton
            label={action.label}
            tone={action.destructive ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={blocked}
            {...(blocked ? { title: "Enter a reason to continue." } : {})}
          />
        </div>
      </div>
    </div>
  );
};

export type ActionBarProps<S extends string, R> = {
  /** Already resolved by `getAvailableActions` — never a static list. */
  actions: readonly ResolvedAction<S, R>[];
  /** Runs the action. Must route through the authority layer. */
  onRun: (action: ResolvedAction<S, R>, reason?: string) => void;
  /** Rendered when the resource's state offers no valid action. */
  emptyMessage?: string;
  className?: string;
};

export const ActionBar = <S extends string, R>({
  actions,
  onRun,
  emptyMessage,
  className,
}: ActionBarProps<S, R>) => {
  const [pending, setPending] = useState<PendingAction<S, R> | null>(null);

  const start = (action: ResolvedAction<S, R>) => {
    if (action.disabled) return;
    if (action.requiresConfirmation || action.requiresReason) {
      setPending({ action, reason: "" });
      return;
    }
    onRun(action);
  };

  if (actions.length === 0)
    return emptyMessage ? (
      <p className="text-xs text-on-surface-variant">{emptyMessage}</p>
    ) : null;

  const ordered = [
    ...actions.filter((a) => a.group === "primary"),
    ...actions.filter((a) => a.group === "secondary"),
    ...actions.filter((a) => a.group === "overflow"),
  ];

  return (
    <>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {ordered.map((action) => (
          <ActionButton
            key={action.id}
            label={action.label}
            tone={action.tone}
            {...(action.icon ? { icon: action.icon } : {})}
            disabled={action.disabled}
            {...(action.disabledReason ? { title: action.disabledReason } : {})}
            onClick={() => start(action)}
          />
        ))}
      </div>
      {pending && (
        <ConfirmDialog
          pending={pending}
          onCancel={() => setPending(null)}
          onReasonChange={(reason) => setPending((p) => (p ? { ...p, reason } : p))}
          onConfirm={() => {
            onRun(pending.action, pending.reason);
            setPending(null);
          }}
        />
      )}
    </>
  );
};

export default ActionBar;
