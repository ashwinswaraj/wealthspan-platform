/** Zoho Catalyst Data Store table names (see docs/Database/42_Catalyst_Data_Store_Schema.md). */
export const TABLES = [
  "accounts",
  "projects",
  "transactions",
  "loans",
  "investments",
  "events",
  "subscriptions",
  "payment_submissions",
  "chat_usage",
] as const;

export type TableName = (typeof TABLES)[number];
