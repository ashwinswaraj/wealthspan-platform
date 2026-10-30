/**
 * Thin client for the Wealthspan Catalyst functions (auth, finance, chat, files).
 * Base URL comes from VITE_API_BASE (e.g. https://<project>.development.catalystserverless.in/server).
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

export async function api<T>(
  fn: "auth" | "finance" | "chat" | "files",
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${base()}/${fn}${path}`, {
      method: init.method ?? "GET",
      credentials: "include",
      headers: init.body ? { "content-type": "application/json" } : undefined,
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
