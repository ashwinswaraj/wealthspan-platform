import { useCallback, useEffect, useState } from "react";

export interface SessionState {
  /** "in" = signed in, "out" = needs login, "loading" = still checking. */
  status: "loading" | "in" | "out" | "error";
  refetch: () => void;
}

/**
 * Session check against the Catalyst function (`/server/finance/me`, same domain, cookie-based).
 * Network errors report "error", never "out", so a flaky connection does not log anyone out.
 */
export function useSession(base = "/server"): SessionState {
  const [status, setStatus] = useState<SessionState["status"]>("loading");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`${base}/finance/me`, {
          credentials: "include",
          headers: { "X-Requested-With": "wealthspan" },
        });
        if (cancelled) return;
        setStatus(res.status === 401 || res.status === 403 ? "out" : res.ok ? "in" : "error");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [base, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { status, refetch };
}

export default useSession;
