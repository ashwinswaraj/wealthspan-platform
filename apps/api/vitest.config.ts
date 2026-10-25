import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // catalyst/functions/*/test use node:test (run with `npm test` inside each function)
    include: ["tests/**/*.test.ts"],
  },
});
