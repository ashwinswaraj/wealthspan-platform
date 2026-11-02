import type { TableName } from "./types";

/**
 * Data Store access happens only inside the Catalyst functions (`zcql()` + table API, in `apps/api`), never
 * in the browser. This file holds the small helpers shared by those queries.
 */

/** Escapes a value for a single-quoted ZCQL literal. */
export const esc = (v: string): string => v.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

/** Narrow guard so a table name taken from input can never reach a query unchecked. */
export const isTable = (name: string, tables: readonly string[]): name is TableName =>
  tables.includes(name);
