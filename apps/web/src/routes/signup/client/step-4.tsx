import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/signup/client/Step4Billing";
export const Route = createFileRoute("/signup/client/step-4")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Client Billing Setup | Jobrio" },
      {
        name: "description",
        content: "Add billing details to finish setting up your Jobrio client account.",
      },
      { property: "og:title", content: "Client Billing Setup | Jobrio" },
      {
        property: "og:description",
        content: "Add billing details to finish your Jobrio client onboarding.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/signup/client/step-4" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/signup/client/step-4" }],
  }),
});
