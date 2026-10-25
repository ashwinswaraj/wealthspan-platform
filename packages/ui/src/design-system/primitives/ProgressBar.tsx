import { cn } from "@jobrio/utils/utils";

export const ProgressBar = ({
  value,
  max = 100,
  className,
  tone = "primary",
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: "primary" | "success" | "warning" | "danger";
}) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const toneClass =
    tone === "success"
      ? "bg-tertiary"
      : tone === "warning"
        ? "bg-amber-500"
        : tone === "danger"
          ? "bg-destructive"
          : "bg-primary";
  return (
    <div
      className={cn("w-full h-2 rounded-full bg-surface-container-high overflow-hidden", className)}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-300", toneClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};
