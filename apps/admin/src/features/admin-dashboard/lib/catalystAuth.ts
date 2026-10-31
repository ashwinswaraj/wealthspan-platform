/**
 * Catalyst web SDK helpers (Embedded Authentication). The SDK scripts exist only on the Catalyst app domain,
 * so on any other host these calls reject and the caller shows a message.
 */
const SDK = "https://static.zohocdn.com/catalyst/sdk/js/4.6.2/catalystWebSDK.js";
const INIT = "/__catalyst/sdk/init.js";

interface CatalystGlobal {
  auth: {
    signIn: (elementId: string, config?: Record<string, unknown>) => void;
    signOut: (redirectUrl?: string) => void;
  };
}
declare global {
  interface Window {
    catalyst?: CatalystGlobal;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(src));
    document.body.appendChild(s);
  });
}

export async function loadCatalyst(): Promise<CatalystGlobal> {
  await loadScript(SDK);
  await loadScript(INIT);
  if (!window.catalyst) throw new Error("Catalyst SDK not available");
  return window.catalyst;
}

export async function catalystSignIn(elementId: string, serviceUrl: string) {
  const c = await loadCatalyst();
  c.auth.signIn(elementId, { service_url: serviceUrl });
}

export async function catalystSignOut(redirectUrl: string) {
  const c = await loadCatalyst();
  c.auth.signOut(redirectUrl);
}
