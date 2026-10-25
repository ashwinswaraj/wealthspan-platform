import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Story";
import socialImage from "@/assets/story-social.jpg.asset.json";

const socialImageUrl = `https://mirror-job-quest.lovable.app${socialImage.url}`;

export const Route = createFileRoute("/story")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Our Story | Jobrio" },
      {
        name: "description",
        content:
          "Why Jobrio replaces bidding marketplaces with a guaranteed-outcome workforce pipeline — the story behind Workforce-as-a-Service.",
      },
      { property: "og:title", content: "Our Story | Jobrio" },
      {
        property: "og:description",
        content:
          "The story behind Jobrio: ending bidding marketplaces and delivering guaranteed outcomes through Workforce-as-a-Service.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/story" },
      { property: "og:image", content: socialImageUrl },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "640" },
      {
        property: "og:image:alt",
        content: "The Jobrio team building a structured global work pipeline",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: socialImageUrl },
      {
        name: "twitter:image:alt",
        content: "The Jobrio team building a structured global work pipeline",
      },
    ],
    links: [{ rel: "canonical", href: "/story" }],
  }),
});
