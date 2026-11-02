import { z } from "zod";

/**
 * Server settings read from the Catalyst function's environment variables
 * (set in catalyst-config.json; anything not listed there is wiped on deploy).
 * SARVAM_API_KEY is the one secret set in the Catalyst console after each deploy.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  ADMIN_EMAILS: z.string().default(""),
  ADMIN_USER_IDS: z.string().default(""),
  SARVAM_API_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof envSchema>;

export const readEnv = (source: Record<string, string | undefined> = process.env): ServerEnv =>
  envSchema.parse(source);
