// Supabase browser client.
//
// The backend is not connected yet: this app is UI/UX-only for now. The client
// is therefore created lazily on first use, and missing env vars no longer throw
// at import time (which used to crash the signup pages). Once real credentials
// exist in the environment, everything below starts working unchanged.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Import the supabase client like this:
// import { supabase } from "@jobrio/database/client";

let instance: SupabaseClient<Database> | null = null;

export const isSupabaseConfigured = () =>
  Boolean(import.meta.env["VITE_SUPABASE_URL"] && import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]);

const getClient = (): SupabaseClient<Database> => {
  if (instance) return instance;
  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;
  if (!url || !key) {
    throw new Error("Backend is not connected yet.");
  }
  instance = createClient<Database>(url, key, {
    auth: {
      storage: typeof window === "undefined" ? undefined : window.localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return instance;
};

/** Lazy proxy: nothing touches env or localStorage until a property is read. */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get: (_target, prop, receiver) => Reflect.get(getClient(), prop, receiver),
});
