import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/ForgotPassword";

export const Route = createFileRoute("/forgot-password")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Reset Password | Jobrio" },
      {
        name: "description",
        content: "Reset the password for your Jobrio account and regain access to your dashboard.",
      },
      { property: "og:title", content: "Reset Password | Jobrio" },
      {
        property: "og:description",
        content: "Reset your Jobrio password and regain access to your dashboard.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/forgot-password" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/forgot-password" }],
  }),
});
