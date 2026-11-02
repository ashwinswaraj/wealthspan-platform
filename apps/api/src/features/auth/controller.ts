/**
 * Auth HTTP handlers for the API app.
 *
 * Identity itself is handled by Catalyst Authentication (see ./service); these handlers only expose the
 * resolved session/role. Sign-in and sign-out run on Catalyst (`catalyst.auth.signIn` / `signOut` in the
 * browser), which sets and clears the session cookie.
 */
import type { AuthContext } from "./types";
import { resolveSession } from "./service";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/** GET /auth/session: who is signed in (never trusts a user id from the request). */
export async function getSession(_request: Request, ctx: AuthContext): Promise<Response> {
  const payload = await resolveSession(ctx);
  if (!payload) return json({ error: "Unauthorized" }, 401);
  return json(payload);
}
