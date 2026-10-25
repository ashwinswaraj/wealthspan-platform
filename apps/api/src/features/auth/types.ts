/**
 * Types for the auth feature.
 *
 * The API app is a thin edge layer: identity itself is handled by the
 * Supabase Auth service, so these types only describe the resolved
 * session/role handed back to other services.
 */
export interface AuthContext {
  supabaseUrl: string;
  supabasePublishableKey: string;
}

export interface SessionPayload {
  userId: string;
  email: string | null;
  role: string;
}
