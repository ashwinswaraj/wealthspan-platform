import { useEffect, useRef, useState } from "react";

const SDK = "https://static.zohocdn.com/catalyst/sdk/js/4.6.2/catalystWebSDK.js";
const INIT = "/__catalyst/sdk/init.js";
const BOX_ID = "catalyst-login-box";

declare global {
  interface Window {
    catalyst?: { auth: { signIn: (id: string, config?: Record<string, unknown>) => void } };
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing?.dataset.loaded === "1") return resolve();
    const s = existing ?? document.createElement("script");
    s.addEventListener("load", () => {
      s.dataset.loaded = "1";
      resolve();
    });
    s.addEventListener("error", () => reject(new Error(src)));
    if (!existing) {
      s.src = src;
      document.body.appendChild(s);
    }
  });
}

/**
 * Catalyst's own Embedded Authentication form (Google, Zoho and email, whatever is switched on in the
 * console). Works only when the app is served from the Catalyst app domain, because `/__catalyst/sdk/init.js`
 * exists only there. After sign-in Catalyst sets the session cookie and sends the user to `service_url`.
 */
export function CatalystLoginSheet({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        await loadScript(SDK);
        await loadScript(INIT);
        if (!window.catalyst) throw new Error("sdk");
        window.catalyst.auth.signIn(BOX_ID, { service_url: `${import.meta.env.BASE_URL}index.html` });
        window.setTimeout(() => {
          if (!document.querySelector(`#${BOX_ID} iframe`))
            setError("Login form did not load. Reload the page from the Wealthspan app address and try again.");
        }, 8000);
      } catch {
        setError("Login is available only on the Wealthspan app address (Catalyst hosting).");
      }
    })();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#18181b] p-4 shadow-xl">
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="text-sm text-neutral-500 px-2 py-1">
            Close
          </button>
        </div>
        {error ? <p className="text-sm text-red-500 px-2 pb-3">{error}</p> : null}
        <div id={BOX_ID} style={{ height: 460 }} className="w-full overflow-hidden rounded-2xl [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0" />
      </div>
    </div>
  );
}
