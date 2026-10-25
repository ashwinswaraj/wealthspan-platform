let lastError: unknown = null;

if (typeof globalThis !== "undefined") {
  const g = globalThis as unknown as {
    addEventListener?: (e: string, h: (ev: { error?: unknown; reason?: unknown }) => void) => void;
  };
  g.addEventListener?.("error", (ev) => {
    lastError = ev.error;
  });
  g.addEventListener?.("unhandledrejection", (ev) => {
    lastError = ev.reason;
  });
}

export function consumeLastCapturedError(): unknown {
  const e = lastError;
  lastError = null;
  return e;
}
