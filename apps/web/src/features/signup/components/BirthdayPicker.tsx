import { useState } from "react";
import { Calendar } from "@jobrio/ui/components/calendar";
import { cn } from "@jobrio/utils/utils";

interface BirthdayPickerProps {
  value?: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatDisplay = (iso?: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
};

const parseIso = (iso?: string): Date | undefined => {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
};

const toIso = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const BirthdayPicker = ({
  value,
  onChange,
  placeholder = "",
  minYear = 1947,
  maxYear,
}: BirthdayPickerProps) => {
  const [open, setOpen] = useState(false);
  const selected = parseIso(value);
  const today = new Date();
  const endYear = maxYear ?? today.getFullYear();
  const minDate = new Date(minYear, 0, 1);
  const maxDate = new Date(endYear, 11, 31);
  const display = formatDisplay(value);
  const defaultMonth = selected ?? new Date(2000, 0, 1);

  return (
    <>
      <button
        type="button"
        value={value ?? ""}
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-left text-on-surface transition-all duration-300"
      >
        <span className={display ? "text-on-surface" : "text-muted-foreground"}>
          {display || placeholder}
        </span>
        <span
          className="material-symbols-outlined text-on-surface-variant"
          style={{ fontSize: 20 }}
        >
          calendar_month
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-stretch md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-surface w-full md:max-w-md md:rounded-2xl rounded-none border border-outline-variant/40 shadow-2xl overflow-hidden max-h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 p-4 border-b border-surface-container-high">
              <div>
                <p className="text-sm font-extrabold text-on-surface">Date of birth</p>
                <p className="text-xs text-outline mt-0.5">
                  {display || "Select your date of birth"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-1 rounded-full text-outline hover:text-on-surface hover:bg-surface-container"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  close
                </span>
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={(date) => {
                  if (!date) return;
                  if (date > today) return;
                  onChange(toIso(date));
                  setOpen(false);
                }}
                defaultMonth={defaultMonth}
                captionLayout="dropdown"
                startMonth={minDate}
                endMonth={maxDate}
                disabled={(date) => date > today || date < minDate}
                initialFocus
                classNames={{ root: "w-full", month: "flex w-full flex-col gap-4" }}
                className={cn(
                  "w-full p-0 pointer-events-auto bg-transparent [--cell-size:clamp(2.25rem,calc((100%-1rem)/7),3rem)]",
                )}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BirthdayPicker;
