import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/Index";

export const Route = createFileRoute("/")({
  component: Page,
  head: () => ({ meta: [{ title: "Wealthspan Admin" }] }),
});
