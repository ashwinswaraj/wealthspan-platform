import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster as Sonner } from "@wealthspan/ui/components/sonner";
import { Toaster } from "@wealthspan/ui/components/toaster";
import { TooltipProvider } from "@wealthspan/ui/components/tooltip";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Wealthspan Admin" },
      {
        name: "description",
        content: "Internal Wealthspan admin console: subscription payment approvals.",
      },
      { name: "author", content: "Wealthspan" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { property: "og:site_name", content: "Wealthspan Admin" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
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
        <p className="mb-4 text-xl text-muted-foreground">Admin page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Go to Admin Home
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
        <Outlet />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
