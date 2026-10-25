import { getSession, signOut } from "./controller";

export const authRoutes = {
  "GET /auth/session": getSession,
  "POST /auth/signout": signOut,
} as const;

export default authRoutes;
