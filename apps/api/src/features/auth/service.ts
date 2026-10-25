import type { AuthContext, SessionPayload } from "./types";

/** Resolves a Supabase user from a bearer token. Returns null if invalid. */
export async function fetchSupabaseUser(
  token: string,
  ctx: AuthContext,
): Promise<SessionPayload | null> {
  const response = await fetch(`${ctx.supabaseUrl}/auth/v1/user`, {
    headers: { apikey: ctx.supabasePublishableKey, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;

  const user = (await response.json()) as {
    id: string;
    email?: string | null;
    app_metadata?: { role?: string };
  };

  return {
    userId: user.id,
    email: user.email ?? null,
    role: user.app_metadata?.role ?? "user",
  };
}

/** Revokes a Supabase user's refresh tokens for the given bearer token. */
export async function revokeSupabaseSession(token: string, ctx: AuthContext): Promise<void> {
  await fetch(`${ctx.supabaseUrl}/auth/v1/logout`, {
    method: "POST",
    headers: { apikey: ctx.supabasePublishableKey, Authorization: `Bearer ${token}` },
  });
}
