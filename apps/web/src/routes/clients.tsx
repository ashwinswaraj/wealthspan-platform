import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Clients";
import socialImage from "@/assets/clients-social.jpg.asset.json";

const socialImageUrl = `https://mirror-job-quest.lovable.app${socialImage.url}`;

export const Route = createFileRoute("/clients")({
  component: Page,
  head: () => ({
    meta: [
      { title: "For Clients | Jobrio" },
      {
        name: "description",
        content:
          "How Jobrio serves clients: submit an outcome, skip the bidding, and receive verified deliverables from vetted professionals on a guaranteed timeline.",
      },
      { property: "og:title", content: "For Clients | Jobrio" },
      {
        property: "og:description",
        content:
          "Submit outcomes, skip bidding, and receive verified deliverables from vetted professionals — Jobrio for clients.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/clients" },
      { property: "og:image", content: socialImageUrl },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "640" },
      {
        property: "og:image:alt",
        content: "A Jobrio delivery team presenting verified work to clients",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: socialImageUrl },
      {
        name: "twitter:image:alt",
        content: "A Jobrio delivery team presenting verified work to clients",
      },
    ],
    links: [{ rel: "canonical", href: "/clients" }],
  }),
});
