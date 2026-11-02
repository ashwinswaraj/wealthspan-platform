/**
 * Server settings read from the Catalyst function's environment variables
 * (set in catalyst-config.json; anything not listed there is wiped on deploy).
 * SARVAM_API_KEY is the one secret set in the Catalyst console after each deploy.
 */
export interface ServerEnv {
  NODE_ENV: "development" | "production" | "test";
  ADMIN_EMAILS: string[];
  ADMIN_USER_IDS: string[];
  SARVAM_API_KEY: string | undefined;
}

const list = (v: string | undefined): string[] =>
  (v ?? "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);

export const readEnv = (source: Record<string, string | undefined> = process.env): ServerEnv => {
  const mode = source["NODE_ENV"];
  return {
    NODE_ENV: mode === "production" || mode === "test" ? mode : "development",
    ADMIN_EMAILS: list(source["ADMIN_EMAILS"]),
    ADMIN_USER_IDS: list(source["ADMIN_USER_IDS"]),
    SARVAM_API_KEY: source["SARVAM_API_KEY"] || undefined,
  };
};
