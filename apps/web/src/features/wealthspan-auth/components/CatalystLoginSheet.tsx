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
export function CatalystLoginSheet({
  onClose,
  provider,
}: {
  onClose: () => void;
  /** When set, the form loads providers-only and the matching button is clicked automatically; the sheet stays hidden unless that fails. */
  provider?: "google" | "zoho";
}) {
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(!provider);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        await loadScript(SDK);
        await loadScript(INIT);
        if (!window.catalyst) throw new Error("sdk");
        window.catalyst.auth.signIn(BOX_ID, {
          service_url: `${import.meta.env.BASE_URL}index.html`,
          ...(provider ? { signin_providers_only: true } : {}),
        });
        if (provider) {
          let tries = 0;
          const timer = window.setInterval(() => {
            tries += 1;
            try {
              const frame = document.querySelector<HTMLIFrameElement>(`#${BOX_ID} iframe`);
              const doc = frame?.contentDocument;
              const els = doc
                ? Array.from(doc.querySelectorAll<HTMLElement>("a,button,div,span,img"))
                : [];
              const hit = els.find(
                (e) =>
                  `${e.textContent ?? ""} ${e.id} ${e.className} ${e.getAttribute("alt") ?? ""} ${e.getAttribute("href") ?? ""}`
                    .toLowerCase()
                    .includes(provider) &&
                  (e.tagName === "A" || e.tagName === "BUTTON" || e.onclick || e.tagName === "DIV"),
              );
              if (hit) {
                window.clearInterval(timer);
                hit.click();
                return;
              }
            } catch {
              /* cross-origin iframe: fall back to showing the form */
            }
            if (tries >= 12) {
              window.clearInterval(timer);
              setVisible(true);
            }
          }, 400);
        }
        window.setTimeout(() => {
          if (!document.querySelector(`#${BOX_ID} iframe`)) {
            setVisible(true);
            setError(
              "Login form did not load. Reload the page from the Wealthspan app address and try again.",
            );
          }
        }, 8000);
      } catch {
        setVisible(true);
        setError("Login is available only on the Wealthspan app address (Catalyst hosting).");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 ${visible ? "" : "invisible pointer-events-none"}`}
    >
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#18181b] p-4 shadow-xl">
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="text-sm text-neutral-500 px-2 py-1">
            Close
          </button>
        </div>
        {error ? (
          <p className="text-sm text-red-500 px-2 pb-3">
            {error}{" "}
            <a className="underline" href="/__catalyst/auth/login">
              Open hosted sign-in
            </a>
          </p>
        ) : null}
        <div
          id={BOX_ID}
          style={{ height: 460 }}
          className="w-full overflow-hidden rounded-2xl [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
        />
      </div>
    </div>
  );
}
