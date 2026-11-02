/**
 * Daily chat quota per user, kept in the Data Store table `chat_usage` (usage_key UNIQUE = "<userId>:<day>").
 * Counting is not perfectly atomic (two parallel messages can both read the same number), so it can
 * overshoot by a few; the point is a hard ceiling on cost per user, not exact billing.
 */
export interface ChatUsageStore {
  get(key: string): Promise<{ rowId: string; uses: number } | null>;
  insert(key: string, userId: string): Promise<void>;
  setUses(rowId: string, uses: number): Promise<void>;
}

export const DAILY_CHAT_LIMIT = 40;
const IST_OFFSET_MS = 5.5 * 3_600_000;

export const createChatQuota = (deps: {
  store: ChatUsageStore;
  limit?: number;
  now?: () => Date;
}) => {
  const limit = deps.limit ?? DAILY_CHAT_LIMIT;
  const day = () =>
    new Date((deps.now?.() ?? new Date()).getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
  return {
    limit,
    /** Counts one message. `ok: false` means today's limit is used up. */
    async consume(userId: string): Promise<{ ok: boolean; used: number; limit: number }> {
      const key = `${userId}:${day()}`;
      let row = await deps.store.get(key);
      if (!row) {
        try {
          await deps.store.insert(key, userId);
          return { ok: true, used: 1, limit };
        } catch {
          row = await deps.store.get(key); // a parallel request created it first
          if (!row) throw new Error("chat usage unavailable");
        }
      }
      if (row.uses >= limit) return { ok: false, used: row.uses, limit };
      const next = row.uses + 1;
      await deps.store.setUses(row.rowId, next);
      return { ok: true, used: next, limit };
    },
  };
};

type Zcql = {
  zcql(): { executeZCQLQuery(q: string): Promise<Array<Record<string, Record<string, unknown>>>> };
  datastore(): {
    table(n: string): {
      insertRow(r: Record<string, unknown>): Promise<unknown>;
      updateRow(r: Record<string, unknown>): Promise<unknown>;
    };
  };
};
const esc = (s: string) => String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");

export const createCatalystChatUsageStore = (app: Zcql): ChatUsageStore => ({
  async get(key) {
    const rows = await app
      .zcql()
      .executeZCQLQuery(
        `SELECT ROWID, uses FROM chat_usage WHERE usage_key = '${esc(key)}' LIMIT 0,1`,
      );
    const r = rows[0]?.chat_usage ?? Object.values(rows[0] ?? {})[0];
    return r ? { rowId: String(r.ROWID), uses: Number(r.uses ?? 0) } : null;
  },
  async insert(key, userId) {
    await app
      .datastore()
      .table("chat_usage")
      .insertRow({ usage_key: key, user_id: userId, uses: 1 });
  },
  async setUses(rowId, uses) {
    if (!/^\d{1,20}$/.test(rowId)) throw new Error("bad id");
    await app.datastore().table("chat_usage").updateRow({ ROWID: rowId, uses });
  },
});
