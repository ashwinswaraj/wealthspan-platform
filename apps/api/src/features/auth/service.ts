import type { AuthContext, SessionPayload } from "./types";

/** Resolves the caller's session from Catalyst. Returns null when nobody is signed in. */
export async function resolveSession(ctx: AuthContext): Promise<SessionPayload | null> {
  let user;
  try {
    user = await ctx.getCurrentUser();
  } catch {
    return null;
  }
  if (!user?.user_id) return null;
  const email = user.email_id ?? null;
  return {
    userId: user.user_id,
    email,
    role: ctx.isAdmin({ email, userId: user.user_id }) ? "admin" : "user",
  };
}
