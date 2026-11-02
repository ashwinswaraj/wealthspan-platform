/**
 * Types for the auth feature.
 *
 * Identity is owned by Zoho Catalyst Cloud Scale Authentication (Embedded Auth: Google, Zoho, email).
 * Catalyst sets the session cookie; the Advanced I/O function resolves the current user from it. These types
 * only describe what this app hands to other services.
 */
export interface CatalystUser {
  user_id: string;
  email_id?: string | null;
}

export interface AuthContext {
  /** Resolves the signed-in Catalyst user from the request cookie, or null. */
  getCurrentUser: () => Promise<CatalystUser | null>;
  /** True when this identity is a pinned admin (ADMIN_EMAILS + ADMIN_USER_IDS). */
  isAdmin: (who: { email?: string | null; userId?: string | null }) => boolean;
}

export interface SessionPayload {
  userId: string;
  email: string | null;
  role: "user" | "admin";
}
