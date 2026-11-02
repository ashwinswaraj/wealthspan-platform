// Builds the admin app as a static SPA under /admin/ inside the Catalyst client folder
// (apps/api/catalyst/client/admin). Run AFTER the web app's build:static, which recreates that folder.
import { execSync } from "node:child_process";
import { cpSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const admin = fileURLToPath(new URL("..", import.meta.url));
const out = fileURLToPath(new URL("../../api/catalyst/client/admin", import.meta.url));

execSync("npx vite build", {
  cwd: admin,
  stdio: "inherit",
  env: { ...process.env, WEALTHSPAN_STATIC: "1" },
});
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(`${admin}/.output/public`, out, { recursive: true });
copyFileSync(`${out}/_shell.html`, `${out}/index.html`);
console.log("Static admin ready in", out);
