import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

export interface SessionState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// The generated Supabase browser client binds `localStorage` at module scope,
// so it is imported lazily and only in the browser to keep SSR safe.
const getSupabase = async () => (await import("@jobrio/database")).supabase;

/**
 * Single source of truth for the signed-in session across both apps.
 * Registers the auth listener first, then hydrates the current session.
 */
export function useSession(): SessionState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const supabase = await getSupabase();
      if (cancelled) return;

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        setLoading(false);
      });
      unsubscribe = () => subscription.unsubscribe();

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(data.session);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = await getSupabase();
    await supabase.auth.signOut();
  }, []);

  return { session, user: session?.user ?? null, loading, signOut };
}

export default useSession;
