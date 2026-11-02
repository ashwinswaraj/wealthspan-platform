import { describe, it, expect } from "vitest";
import { getSession } from "../../../src/features/auth/controller";
import type { AuthContext } from "../../../src/features/auth/types";

const req = new Request("http://localhost/auth/session");
const ctx = (user: Awaited<ReturnType<AuthContext["getCurrentUser"]>>, admin = false): AuthContext => ({
  getCurrentUser: async () => user,
  isAdmin: () => admin,
});

describe("getSession", () => {
  it("returns 401 when nobody is signed in", async () => {
    const res = await getSession(req, ctx(null));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 when Catalyst throws", async () => {
    const res = await getSession(req, {
      getCurrentUser: async () => {
        throw new Error("no session");
      },
      isAdmin: () => false,
    });
    expect(res.status).toBe(401);
  });

  it("returns the session with role user", async () => {
    const res = await getSession(req, ctx({ user_id: "u1", email_id: "a@b.com" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ userId: "u1", email: "a@b.com", role: "user" });
  });

  it("marks pinned admins as admin", async () => {
    const res = await getSession(req, ctx({ user_id: "u1", email_id: "a@b.com" }, true));
    expect(((await res.json()) as { role: string }).role).toBe("admin");
  });
});
