import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

/** Catalyst's address is ".../app/index.html"; the router only knows "/app/", so drop the file name from the URL. */
const dropIndexHtml = () => {
  if (typeof window === "undefined" || !/\/index\.html$/.test(window.location.pathname)) return;
  const { pathname, search, hash } = window.location;
  window.history.replaceState(
    window.history.state,
    "",
    pathname.replace(/index\.html$/, "") + search + hash,
  );
};

export const getRouter = () => {
  dropIndexHtml();
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    // "/app" when built for Catalyst hosting (vite base "/app/"), "/" otherwise.
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
