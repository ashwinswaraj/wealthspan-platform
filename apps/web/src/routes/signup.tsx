import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/signup")({
  component: () => <Outlet />,
  head: () => ({
    meta: [
      { title: "Create your Jobrio account" },
      {
        name: "description",
        content:
          "Sign up for Jobrio to submit outcomes as a client or join the vetted workforce as a professional.",
      },
      { property: "og:title", content: "Create your Jobrio account" },
      {
        property: "og:description",
        content: "Sign up for Jobrio as a client or as a vetted professional.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/signup" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/signup" }],
  }),
});
