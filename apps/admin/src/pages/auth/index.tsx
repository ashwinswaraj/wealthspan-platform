import { useEffect, useRef, useState } from "react";
import { catalystSignIn } from "@admin/features/admin-dashboard/lib/catalystAuth";

/** Admin sign-in: Catalyst's embedded login form (Google / Zoho / email, as enabled in the console). */
export default function AdminAuthPage() {
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    catalystSignIn("admin-login-box", "/admin/dashboard/admin").catch(() =>
      setError("Sign-in works only on the Wealthspan app address (Catalyst hosting)."),
    );
  }, []);

  return (
    <main className="min-h-dvh grid place-items-center bg-white dark:bg-[#16191f] p-4">
      <div className="w-full max-w-sm rounded-3xl border border-[#ebebeb] dark:border-[#262a33] bg-white dark:bg-[#1e232d] p-6 shadow-xs">
        <h1 className="text-xl font-semibold text-[#0d0d0d] dark:text-[#ececec]">Wealthspan Admin</h1>
        <p className="mt-1 mb-4 text-sm text-neutral-500 dark:text-neutral-400">Sign in to continue.</p>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <div id="admin-login-box" className="min-h-[280px]" />
      </div>
    </main>
  );
}
