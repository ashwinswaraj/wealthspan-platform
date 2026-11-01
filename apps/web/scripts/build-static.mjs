// Builds the web app as a static SPA and lays it out for Catalyst Web Client Hosting
// at apps/api/catalyst/client (served at /app/, index.html at /app/index.html).
import { execSync } from "node:child_process";
import { cpSync, rmSync, copyFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const web = fileURLToPath(new URL("..", import.meta.url));
const out = fileURLToPath(new URL("../../api/catalyst/client", import.meta.url));

execSync("npx vite build", { cwd: web, stdio: "inherit", env: { ...process.env, WEALTHSPAN_STATIC: "1" } });
rmSync(out, { recursive: true, force: true });
cpSync(`${web}/.output/public`, out, { recursive: true });
copyFileSync(`${out}/_shell.html`, `${out}/index.html`);
writeFileSync(
  `${out}/client-package.json`,
  JSON.stringify({ name: "wealthspan", version: "1.0.0", homepage: "index.html", login_redirect: "/app/index.html" }, null, 2) + "\n",
);
console.log("Static client ready in", out);
