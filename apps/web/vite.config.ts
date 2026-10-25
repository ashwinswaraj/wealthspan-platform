import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { fileURLToPath } from "node:url";

/**
 * Shared workspace packages (`@jobrio/*`) are consumed straight from source.
 * Lovable builds from the repo root, so every alias must be absolute.
 */
const pkg = (name: string) => fileURLToPath(new URL(`../../packages/${name}/src`, import.meta.url));

const workspacePackages = [
  "auth",
  "config",
  "constants",
  "database",
  "hooks",
  "sdk",
  "types",
  "ui",
  "utils",
  "validation",
];

const adminSrc = fileURLToPath(new URL("../admin/src", import.meta.url));

const alias = [
  { find: "@admin/", replacement: `${adminSrc}/` },
  ...workspacePackages.flatMap((name) => [
    { find: `@jobrio/${name}/`, replacement: `${pkg(name)}/` },
    { find: `@jobrio/${name}`, replacement: pkg(name) },
  ]),
];

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    resolve: {
      alias,
      dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
    },
  },
});
