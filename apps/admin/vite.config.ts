import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { fileURLToPath } from "node:url";

/**
 * Admin panel app config. Mirrors the platform pipeline so the admin surface
 * can build and run independently, consuming `@jobrio/*` packages from source.
 */
const pkg = (name: string) => fileURLToPath(new URL(`../../packages/${name}/src`, import.meta.url));

const workspacePackages = [
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
    // `pnpm build:static`: a plain static SPA for Catalyst Web Client Hosting, served under /admin/.
    ...(process.env.WEALTHSPAN_STATIC ? { spa: { enabled: true } } : {}),
  },
  vite: {
    base: process.env.WEALTHSPAN_STATIC ? "/admin/" : "/",
    resolve: {
      alias,
      dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
    },
  },
});
