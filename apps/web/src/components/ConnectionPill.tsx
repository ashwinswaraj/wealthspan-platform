import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@wealthspan/utils/utils";

/**
 * Global connection-status pill.
 *
 * Renders a floating top-center pill on every page when the browser
 * loses network and while it is reconnecting. Auto-dismisses shortly
 * after reaching "Connected"; can also be dismissed manually via ✕.
 *
 * UI: [ red/green dot ] | vertical grey divider | label | close ✕
 */
type Status = "connected" | "reconnecting";

const ConnectionPill = () => {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<Status>("connected");
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const clearDismiss = () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
        dismissTimer.current = null;
      }
    };

    const handleOffline = () => {
      clearDismiss();
      setStatus("reconnecting");
      setVisible(true);
    };

    const handleOnline = () => {
      clearDismiss();
      setStatus("connected");
      setVisible(true);
      dismissTimer.current = setTimeout(() => setVisible(false), 2200);
    };

    // Initial state: only show if actually offline.
    if (navigator.onLine === false) {
      setStatus("reconnecting");
      setVisible(true);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      clearDismiss();
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <div
        className="pointer-events-auto inline-flex items-stretch bg-surface rounded-full border border-outline-variant/40 shadow-lg overflow-hidden text-[11px] font-semibold"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center pl-3 pr-2 py-1.5">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              status === "connected" ? "bg-emerald-500" : "bg-rose-500 animate-pulse",
            )}
          />
        </div>
        <div aria-hidden className="w-px my-2 bg-outline-variant/60" />
        <div className="flex items-center px-3 py-1.5 text-on-surface">
          {status === "connected" ? "Connected" : "Reconnecting…"}
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Dismiss connection status"
          className="px-3 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low/60 transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
};

export default ConnectionPill;
