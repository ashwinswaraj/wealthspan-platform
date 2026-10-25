import { Check, X } from "lucide-react";
import { passwordStrength, type PasswordStrengthLevel } from "@jobrio/validation";
import { cn } from "@jobrio/utils/utils";

const BAR_COLOR: Record<PasswordStrengthLevel, string> = {
  empty: "#c3c6d7",
  weak: "#b3261e",
  fair: "#c77700",
  good: "#0b7a4b",
  strong: "#004AC6",
};

export interface PasswordStrengthProps {
  value: string;
  /** Show the per-rule checklist under the meter. */
  showChecklist?: boolean;
  className?: string;
}

/**
 * PasswordStrength — live strength indicator.
 * Updates on every keystroke: segmented meter + label + rule checklist.
 */
export const PasswordStrength = ({
  value,
  showChecklist = true,
  className,
}: PasswordStrengthProps) => {
  const result = passwordStrength(value);
  const color = BAR_COLOR[result.level];
  const segments = 5;
  const filled = value ? result.score + 1 : 0;

  return (
    <div className={cn("mt-2 space-y-2", className)} aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: segments }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{ background: i < filled ? color : "rgba(195,198,215,0.45)" }}
            />
          ))}
        </div>
        {result.label && (
          <span className="w-14 text-right text-xs font-bold" style={{ color }}>
            {result.label}
          </span>
        )}
      </div>

      {showChecklist && value.length > 0 && (
        <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {result.checks.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-1.5 text-[11px] font-medium"
              style={{ color: c.passed ? "#0b7a4b" : "#737686" }}
            >
              {c.passed ? (
                <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
              ) : (
                <X className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
              )}
              {c.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
