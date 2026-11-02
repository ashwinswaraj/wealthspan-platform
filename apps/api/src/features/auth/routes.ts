import { getSession } from "./controller";

export const authRoutes = {
  "GET /auth/session": getSession,
} as const;

export default authRoutes;
