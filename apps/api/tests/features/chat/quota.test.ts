import { describe, expect, it } from "vitest";
import { createChatQuota, type ChatUsageStore } from "../../../src/features/chat";

function mem(): ChatUsageStore {
  const rows = new Map<string, { rowId: string; uses: number }>();
  return {
    get: async (k) => rows.get(k) ?? null,
    insert: async (k) => {
      if (rows.has(k)) throw new Error("duplicate");
      rows.set(k, { rowId: String(rows.size + 1), uses: 1 });
    },
    setUses: async (id, uses) => {
      for (const r of rows.values()) if (r.rowId === id) r.uses = uses;
    },
  };
}

describe("daily chat quota", () => {
  it("allows up to the limit, then refuses", async () => {
    const q = createChatQuota({
      store: mem(),
      limit: 3,
      now: () => new Date("2026-10-31T06:00:00Z"),
    });
    expect((await q.consume("u")).ok).toBe(true);
    expect((await q.consume("u")).ok).toBe(true);
    expect(await q.consume("u")).toMatchObject({ ok: true, used: 3 });
    expect(await q.consume("u")).toMatchObject({ ok: false, used: 3 });
  });
  it("is per user", async () => {
    const q = createChatQuota({ store: mem(), limit: 1 });
    expect((await q.consume("a")).ok).toBe(true);
    expect((await q.consume("b")).ok).toBe(true);
    expect((await q.consume("a")).ok).toBe(false);
  });
  it("resets the next day (IST)", async () => {
    let t = new Date("2026-10-31T06:00:00Z");
    const q = createChatQuota({ store: mem(), limit: 1, now: () => t });
    await q.consume("u");
    expect((await q.consume("u")).ok).toBe(false);
    t = new Date("2026-11-01T06:00:00Z");
    expect((await q.consume("u")).ok).toBe(true);
  });
});
