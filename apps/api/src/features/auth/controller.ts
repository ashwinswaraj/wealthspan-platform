/**
 * Auth HTTP handlers for the API app.
 *
 * The API app is a thin edge layer: identity itself is handled by the
 * Supabase Auth service (see ./service), so these handlers only verify a
 * bearer token and expose the resolved session/role to other services.
 */
import { z } from "zod";
import type { AuthContext } from "./types";
import { fetchSupabaseUser, revokeSupabaseSession } from "./service";

const bearerSchema = z.string().regex(/^Bearer\s+.+$/, "Missing bearer token");

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/** GET /auth/session — resolve the caller's session from the Authorization header. */
export async function getSession(request: Request, ctx: AuthContext): Promise<Response> {
  const header = request.headers.get("authorization") ?? "";
  const parsed = bearerSchema.safeParse(header);
  if (!parsed.success) return json({ error: "Unauthorized" }, 401);

  const token = header.replace(/^Bearer\s+/, "");
  const payload = await fetchSupabaseUser(token, ctx);
  if (!payload) return json({ error: "Unauthorized" }, 401);

  return json(payload);
}

/** POST /auth/signout — revoke the caller's refresh tokens. */
export async function signOut(request: Request, ctx: AuthContext): Promise<Response> {
  const header = request.headers.get("authorization") ?? "";
  if (!bearerSchema.safeParse(header).success) return json({ error: "Unauthorized" }, 401);

  const token = header.replace(/^Bearer\s+/, "");
  await revokeSupabaseSession(token, ctx);
  return json({ ok: true });
}
