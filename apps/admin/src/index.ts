/**
 * Admin app entry — the admin surface is served by TanStack Start through
 * `server.ts` (SSR entry) and `router.tsx` (router factory). This module is the
 * package entry point and re-exports the router factory for tooling/tests.
 */
export { getRouter } from "./router";
