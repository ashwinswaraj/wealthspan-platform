import { describe, expect, it } from "vitest";
import {
  createSubscriptionService,
  SubscriptionError,
  type PaymentSubmission,
  type Subscription,
  type SubscriptionStore,
} from "../../../src/features/subscription";

function memStore(): SubscriptionStore {
  const subs: Subscription[] = [];
  const pays: PaymentSubmission[] = [];
  let n = 0;
  return {
    listSubscriptions: async (u) => subs.filter((s) => s.userId === u),
    insertSubscription: async (s) => {
      // like the unique sub_key column: a second insert with the same key fails
      if (s.subKey && subs.some((x) => x.subKey === s.subKey)) throw new Error("duplicate sub_key");
      const r = { ...s, id: String(++n) };
      subs.push(r);
      return r;
    },
    listPayments: async (u) => pays.filter((p) => p.userId === u),
    getPayment: async (id) => pays.find((p) => p.id === id) ?? null,
    findPaymentByUtr: async (utr) => pays.find((p) => p.utr === utr) ?? null,
    insertPayment: async (p) => {
      const r = { ...p, id: String(++n) };
      pays.push(r);
      return r;
    },
    updatePayment: async (id, patch) => {
      const p = pays.find((x) => x.id === id)!;
      Object.assign(p, patch);
      return p;
    },
    listPendingPayments: async () => pays.filter((p) => p.status === "pending"),
  };
}
let clock = new Date("2026-10-27T10:00:00Z");
const mk = () =>
  createSubscriptionService({ store: memStore(), now: () => clock, adminIds: ["admin"] });
const code = async (p: Promise<unknown>) =>
  p.then(
    () => "ok",
    (e: SubscriptionError) => e.code,
  );

describe("trial", () => {
  it("gives 30 days once", async () => {
    const s = mk();
    expect(await s.getEntitlement("u")).toMatchObject({ plan: "free", active: false });
    await s.startTrial("u");
    expect(await s.getEntitlement("u")).toMatchObject({
      plan: "trial",
      active: true,
      endsOn: "2026-11-25",
      daysLeft: 30,
      trialUsed: true,
    });
    expect(await code(s.startTrial("u"))).toBe("conflict");
  });
});

describe("races", () => {
  it("ten parallel trial requests give exactly one trial", async () => {
    const s = mk();
    const results = await Promise.all(Array.from({ length: 10 }, () => code(s.startTrial("u"))));
    expect(results.filter((r) => r === "ok")).toHaveLength(1);
    expect(results.filter((r) => r === "conflict")).toHaveLength(9);
    expect((await s.getEntitlement("u")).endsOn).toBe("2026-11-25");
  });
  it("two parallel approvals of one payment give exactly one subscription", async () => {
    const s = mk();
    const p = await s.submitPayment("u", {
      plan: "pro_monthly",
      utr: "123456789012",
      amountRupees: 199,
    });
    const results = await Promise.all([
      code(s.review("admin", p.id, "approve")),
      code(s.review("admin", p.id, "approve")),
    ]);
    expect(results.sort()).toEqual(["conflict", "ok"]);
    expect((await s.getEntitlement("u")).daysLeft).toBe(30);
  });
});

describe("payments", () => {
  const pay = { plan: "pro_monthly", utr: "123456789012", amountRupees: 199 };
  it("validates plan, utr, amount", async () => {
    const s = mk();
    expect(await code(s.submitPayment("u", { ...pay, plan: "trial" }))).toBe("validation");
    expect(await code(s.submitPayment("u", { ...pay, utr: "12345" }))).toBe("validation");
    expect(await code(s.submitPayment("u", { ...pay, amountRupees: 1 }))).toBe("validation");
    expect(await code(s.submitPayment("u", { ...pay, utr: "1234 5678 9012" }))).toBe("ok");
  });
  it("one UTR only once, even for another user", async () => {
    const s = mk();
    await s.submitPayment("u", pay);
    expect(await code(s.submitPayment("v", pay))).toBe("conflict");
  });
  it("limits pending submissions to 3", async () => {
    const s = mk();
    for (const u of ["111111111111", "222222222222", "333333333333"])
      await s.submitPayment("u", { ...pay, utr: u });
    expect(await code(s.submitPayment("u", { ...pay, utr: "444444444444" }))).toBe("conflict");
  });
  it("submitting alone gives no access", async () => {
    const s = mk();
    await s.submitPayment("u", pay);
    expect((await s.getEntitlement("u")).active).toBe(false);
  });
  it("only admins review; approve starts access, stacks after existing, can't repeat", async () => {
    const s = mk();
    await s.startTrial("u");
    const p = await s.submitPayment("u", pay);
    expect(await code(s.review("u", p.id, "approve"))).toBe("forbidden");
    const r = await s.review("admin", p.id, "approve");
    expect(r.subscription).toMatchObject({
      plan: "pro_monthly",
      startsOn: "2026-11-26",
      endsOn: "2026-12-25",
    });
    expect(await code(s.review("admin", p.id, "approve"))).toBe("conflict");
    clock = new Date("2026-11-30T10:00:00Z");
    expect(await s.getEntitlement("u")).toMatchObject({
      plan: "pro_monthly",
      active: true,
      daysLeft: 26,
    });
    clock = new Date("2026-10-27T10:00:00Z");
  });
  it("reject gives nothing", async () => {
    const s = mk();
    const p = await s.submitPayment("u", pay);
    expect(
      (await s.review("admin", p.id, "reject", "not found in statement")).subscription,
    ).toBeNull();
    expect((await s.getEntitlement("u")).active).toBe(false);
    expect(await s.listPending("admin")).toHaveLength(0);
  });
  it("annual is 365 days", async () => {
    const s = mk();
    const p = await s.submitPayment("u", {
      plan: "pro_annual",
      utr: "999999999999",
      amountRupees: 1999,
    });
    expect((await s.review("admin", p.id, "approve")).subscription!.endsOn).toBe("2027-10-26");
  });
});
