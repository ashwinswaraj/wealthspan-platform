import * as React from "react";
import { SlidersHorizontal, ArrowDownWideNarrow, type LucideIcon } from "lucide-react";
import { cn } from "@wealthspan/utils/utils";

interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  count?: number;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ icon: Icon, label, count, onClick, disabled, active }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "group flex-1 inline-flex items-center justify-center gap-2 py-3 px-4",
        "text-[16px] font-semibold text-on-surface",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "disabled:opacity-50 disabled:pointer-events-none",
        "hover:bg-surface-container-low/60",
        active && "bg-surface-container-low/80",
      )}
    >
      <Icon size={20} strokeWidth={1.75} className="shrink-0" />
      <span>{label}</span>
      {typeof count === "number" && count > 0 && (
        <span className="inline-flex items-center justify-center h-[22px] min-w-[22px] px-1.5 rounded-full bg-primary text-on-primary text-[11px] font-semibold leading-none">
          {count}
        </span>
      )}
    </button>
  ),
);
ToolbarButton.displayName = "ToolbarButton";

export interface WealthspanToolbarProps {
  filterLabel?: string;
  filterCount?: number;
  onFilterClick?: () => void;
  filterActive?: boolean;
  sortLabel?: string;
  sortCount?: number;
  onSortClick?: () => void;
  sortActive?: boolean;
  className?: string;
}

export const WealthspanFilterButton = (
  props: Omit<ToolbarButtonProps, "icon"> & { icon?: LucideIcon },
) => <ToolbarButton icon={props.icon ?? SlidersHorizontal} {...props} />;

export const WealthspanSortButton = (
  props: Omit<ToolbarButtonProps, "icon"> & { icon?: LucideIcon },
) => <ToolbarButton icon={props.icon ?? ArrowDownWideNarrow} {...props} />;

export const WealthspanToolbar = ({
  filterLabel = "Filter",
  filterCount,
  onFilterClick,
  filterActive,
  sortLabel = "Sort",
  sortCount,
  onSortClick,
  sortActive,
  className,
}: WealthspanToolbarProps) => (
  <div
    className={cn(
      "flex items-stretch bg-surface rounded-2xl border border-outline-variant/40 overflow-hidden",
      className,
    )}
    role="toolbar"
    aria-label="Filter and sort"
  >
    <WealthspanFilterButton
      label={filterLabel}
      count={filterCount}
      onClick={onFilterClick}
      active={filterActive}
    />
    <div aria-hidden className="w-px my-2 bg-outline-variant/60" />
    <WealthspanSortButton
      label={sortLabel}
      count={sortCount}
      onClick={onSortClick}
      active={sortActive}
    />
  </div>
);
