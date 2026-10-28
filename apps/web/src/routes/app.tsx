import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/app/Home";
export const Route = createFileRoute("/app")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Wealthspan" },
      { name: "description", content: "Your personal AI accountant — the full arc of your money." },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
});
