import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    // "/admin" when built for Catalyst hosting (vite base "/admin/"), "/" otherwise.
    basepath: import.meta.env.BASE_URL.replace(/\/$/, "") || "/",
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadDelay: 0,
    defaultPreloadStaleTime: 30_000,
    defaultPendingMs: 0,
  });

  return router;
};
