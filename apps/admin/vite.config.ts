import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { fileURLToPath } from "node:url";

/**
 * Admin panel app config. Mirrors the platform pipeline so the admin surface
 * can build and run independently, consuming `@jobrio/*` packages from source.
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

const adminSrc = fileURLToPath(new URL("./src", import.meta.url));

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
