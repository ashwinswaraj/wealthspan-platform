export function renderErrorPage(): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Error</title></head><body style="font-family:system-ui;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#f5f7fa;color:#0f172a"><div style="text-align:center;padding:2rem"><h1 style="font-size:1.5rem;margin:0 0 .5rem">Something went wrong</h1><p style="color:#64748b">Please try again in a moment.</p></div></body></html>`;
}
