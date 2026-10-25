import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/signup/client/Step3ClientType";
export const Route = createFileRoute("/signup/client/step-3")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Client Type Setup | Jobrio" },
      {
        name: "description",
        content: "Set up your Jobrio client type so the platform can match your order workflow.",
      },
      { property: "og:title", content: "Client Type Setup | Jobrio" },
      {
        property: "og:description",
        content: "Set your client type and continue Jobrio account onboarding.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/signup/client/step-3" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/signup/client/step-3" }],
  }),
});
