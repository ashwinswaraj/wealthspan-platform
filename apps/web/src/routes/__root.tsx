import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { Toaster as Sonner } from "@wealthspan/ui/components/sonner";
import { Toaster } from "@wealthspan/ui/components/toaster";
import { TooltipProvider } from "@wealthspan/ui/components/tooltip";
import ConnectionPill from "@/components/ConnectionPill";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "Wealthspan" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { property: "og:site_name", content: "Wealthspan" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Wealthspan",
          url: "/",
          description: "Your personal AI accountant: the full arc of your money.",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
});

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
}

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hash) {
      const el = document.querySelector(`#${hash}`);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 80);
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

/** Clickjacking brake: static hosting cannot send X-Frame-Options, so a page inside someone else's frame hides itself. */
function useFrameGuard() {
  useEffect(() => {
    try {
      if (window.top !== window.self) document.documentElement.style.display = "none";
    } catch {
      document.documentElement.style.display = "none";
    }
  }, []);
}

function RootComponent() {
  useFrameGuard();
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ConnectionPill />
        <ScrollToTop />
        <Outlet />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
