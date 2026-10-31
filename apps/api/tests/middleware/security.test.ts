import { describe, expect, it } from "vitest";
import { jsonErrors, rateLimit, requestGuard } from "../../src/middleware/security";

const res = () => {
  const r: { code?: number; body?: unknown; headers: Record<string, string> } = { headers: {} };
  const o = {
    setHeader: (k: string, v: string) => {
      r.headers[k] = v;
    },
    status: (c: number) => {
      r.code = c;
      return o;
    },
    json: (b: unknown) => {
      r.body = b;
      return o;
    },
  };
  return { r, o: o as never };
};
const run = (mw: (a: never, b: never, c: () => void) => unknown, req: object) => {
  const { r, o } = res();
  let next = false;
  mw(req as never, o, () => {
    next = true;
  });
  return { next, ...r };
};

describe("requestGuard (CSRF)", () => {
  const g = requestGuard();
  it("lets reads through", () =>
    expect(run(g as never, { method: "GET", headers: {} }).next).toBe(true));
  it("blocks writes without the custom header", () => {
    const r = run(g as never, { method: "POST", headers: {} });
    expect(r.next).toBe(false);
    expect(r.code).toBe(403);
  });
  it("blocks cross-site writes even with the header", () => {
    expect(
      run(g as never, {
        method: "POST",
        headers: { "x-requested-with": "wealthspan", "sec-fetch-site": "cross-site" },
      }).code,
    ).toBe(403);
  });
  it("allows same-origin writes with the header", () => {
    expect(
      run(g as never, {
        method: "DELETE",
        headers: { "x-requested-with": "wealthspan", "sec-fetch-site": "same-origin" },
      }).next,
    ).toBe(true);
  });
});

describe("rateLimit", () => {
  it("counts per user and answers 429 over the limit, then recovers", () => {
    let t = 0;
    const l = rateLimit({ windowMs: 1000, max: 2, now: () => t });
    const req = (u: string) => ({ method: "POST", userId: u, headers: {} });
    expect(run(l as never, req("a")).next).toBe(true);
    expect(run(l as never, req("a")).next).toBe(true);
    const blocked = run(l as never, req("a"));
    expect(blocked.next).toBe(false);
    expect(blocked.code).toBe(429);
    expect(run(l as never, req("b")).next).toBe(true);
    t = 1500;
    expect(run(l as never, req("a")).next).toBe(true);
  });
});

describe("jsonErrors", () => {
  const e = jsonErrors();
  const call = (err: object) => {
    const { r, o } = res();
    (e as never as (a: object, b: object, c: never, d: () => void) => void)(err, {}, o, () => {});
    return r;
  };
  it("bad JSON is a short 400, no stack", () => {
    const r = call({ status: 400, message: "Unexpected token", stack: "at /var/task/secret.js" });
    expect(r.code).toBe(400);
    expect(JSON.stringify(r.body)).not.toContain("secret");
  });
  it("too large is 413", () => expect(call({ status: 413 }).code).toBe(413));
  it("anything else is a generic 500", () =>
    expect(call(new Error("db password is hunter2")).body).toEqual({
      error: "server",
      message: "Something went wrong. Try again.",
    }));
});
