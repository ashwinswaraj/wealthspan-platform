import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Professionals";
import socialImage from "@/assets/professionals-social.jpg.asset.json";

const socialImageUrl = `https://mirror-job-quest.lovable.app${socialImage.url}`;

export const Route = createFileRoute("/professionals")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Vetted Professionals | Jobrio" },
      {
        name: "description",
        content:
          "Meet the vetted, tiered professionals powering Jobrio's execution pipeline — verified identities, live performance, and quality tiers you can trust.",
      },
      { property: "og:title", content: "Vetted Professionals | Jobrio" },
      {
        property: "og:description",
        content:
          "Vetted, tiered professionals with verified identities and live performance metrics — the workforce behind Jobrio's guaranteed outcomes.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/professionals" },
      { property: "og:image", content: socialImageUrl },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "640" },
      {
        property: "og:image:alt",
        content: "Vetted Jobrio professionals collaborating on a client project",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: socialImageUrl },
      {
        name: "twitter:image:alt",
        content: "Vetted Jobrio professionals collaborating on a client project",
      },
    ],
    links: [{ rel: "canonical", href: "/professionals" }],
  }),
});
