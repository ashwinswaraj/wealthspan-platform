/**
 * Thin client for the Wealthspan Catalyst functions (finance, chat, files).
 * Base URL comes from VITE_API_BASE (default "/server": the app and the functions share one Catalyst domain).
 * The browser session cookie identifies the user; this client never sends a user id.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
  get unauthorized() {
    return this.status === 401;
  }
}

const base = () => String(import.meta.env.VITE_API_BASE ?? "/server").replace(/\/$/, "");

/** URL of a function endpoint (for downloads the browser opens itself, e.g. the Excel file). */
export const apiUrl = (fn: "finance" | "chat" | "files", path: string) => `${base()}/${fn}${path}`;

export async function api<T>(
  fn: "finance" | "chat" | "files",
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${base()}/${fn}${path}`, {
      method: init.method ?? "GET",
      credentials: "include",
      // X-Requested-With is the CSRF guard: the functions refuse writes without it (see api/src/middleware/security.ts).
      headers: {
        "X-Requested-With": "wealthspan",
        ...(init.body ? { "content-type": "application/json" } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "network", "No internet connection. Please try again.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok)
    throw new ApiError(
      res.status,
      data?.error ?? "server",
      data?.message ?? "Something went wrong. Try again.",
      data?.fields,
    );
  return data as T;
}
