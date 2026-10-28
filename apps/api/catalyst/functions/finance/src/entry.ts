/**
 * finance — Catalyst Advanced I/O function (Express). Built into ../index.js by
 * `pnpm --filter @jobrio/api build:catalyst`; don't edit index.js by hand.
 *
 *   GET    /transactions?from&to&projectId&accountId&type&limit&offset
 *   POST   /transactions
 *   PATCH  /transactions/:id
 *   DELETE /transactions/:id        (soft delete)
 *   GET    /me                      (200 when logged in, else 401)
 *   GET    /summary?from&to&projectId
 *   GET/POST /projects|accounts|events|loans|investments ; PATCH/DELETE /<entity>/:id
 *   POST   /events/:id/conclude|reopen, /loans/:id/close|reopen, /projects|accounts/:id/archive|unarchive
 *
 * The user is ALWAYS taken from the Catalyst login session, never from the request.
 */
import express from "express";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const catalyst = require("zcatalyst-sdk-node");
import { createCatalystFinanceStore, createFinanceService, FinanceError } from "../../../../src/features/finance";
import { CatalogError, createCatalogService, createCatalystCatalogStore, type CatalogEntity } from "../../../../src/features/catalog";

const app = express();
app.use(express.json({ limit: "32kb" }));

type Req = express.Request & { userId?: string; svc?: ReturnType<typeof createFinanceService>; cat?: ReturnType<typeof createCatalogService> };

app.use(async (req: Req, res, next) => {
  try {
    const c = catalyst.initialize(req);
    const user = await c.userManagement().getCurrentUser();
    const userId = user?.user_id ?? user?.userId;
    if (!userId) throw new Error("no user");
    req.userId = String(userId);
    const fin = createCatalystFinanceStore(c);
    req.svc = createFinanceService({ store: fin });
    req.cat = createCatalogService({ store: createCatalystCatalogStore(c), finance: fin });
    next();
  } catch {
    res.status(401).json({ error: "unauthorized", message: "Please log in." });
  }
});

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const q = (v: unknown) => (typeof v === "string" && v ? v : undefined);
const date = (v: unknown) => { const s = q(v); return s && DATE.test(s) ? s : undefined; };
const int = (v: unknown) => { const n = Number(q(v)); return Number.isInteger(n) ? n : undefined; };
const TYPES = ["income", "expense", "transfer"] as const;

const wrap = (fn: (req: Req) => Promise<unknown>): express.RequestHandler => async (req, res) => {
  try {
    res.json(await fn(req as Req));
  } catch (e) {
    if (e instanceof CatalogError) return res.status(e.status).json({ error: e.code, message: e.message, fields: e.fields });
    if (e instanceof FinanceError) return res.status(e.status).json({ error: e.code, message: e.message, fields: e.fields });
    console.error("finance error:", String((e as { message?: string })?.message ?? typeof e).slice(0, 300));
    res.status(500).json({ error: "server", message: "Something went wrong. Try again." });
  }
};

app.get("/transactions", wrap((req) =>
  req.svc!.listTransactions(req.userId!, {
    from: date(req.query.from), to: date(req.query.to), projectId: q(req.query.projectId), accountId: q(req.query.accountId),
    type: TYPES.find((t) => t === req.query.type), limit: int(req.query.limit), offset: int(req.query.offset),
  })));

app.post("/transactions", wrap((req) => req.svc!.createTransaction(req.userId!, req.body ?? {}, "manual")));
app.patch("/transactions/:id", wrap((req) => req.svc!.updateTransaction(req.userId!, req.params.id, req.body ?? {}, "manual")));
app.delete("/transactions/:id", wrap(async (req) => { await req.svc!.deleteTransaction(req.userId!, req.params.id, "manual"); return { deleted: true }; }));

app.get("/summary", wrap((req) =>
  req.svc!.getSummary(req.userId!, { from: date(req.query.from), to: date(req.query.to), projectId: q(req.query.projectId) })));

/** Is there a valid login? Used by the app to decide between the login screen and the app. */
app.get("/me", wrap(async (req) => ({ userId: req.userId })));

/* ---- projects, accounts, events, loans, investments ---- */
const ENTITIES: CatalogEntity[] = ["projects", "accounts", "events", "loans", "investments"];
for (const entity of ENTITIES) {
  app.get(`/${entity}`, wrap((req) => req.cat!.list(entity, req.userId!).then((items) => ({ items }))));
  app.post(`/${entity}`, wrap((req) => req.cat!.create(entity, req.userId!, req.body ?? {}, "manual")));
  app.patch(`/${entity}/:id`, wrap((req) => req.cat!.update(entity, req.userId!, req.params.id, req.body ?? {}, "manual")));
  app.delete(`/${entity}/:id`, wrap(async (req) => { await req.cat!.remove(entity, req.userId!, req.params.id, "manual"); return { deleted: true }; }));
}
app.post("/events/:id/conclude", wrap((req) => req.cat!.setEventStatus(req.userId!, req.params.id, "concluded")));
app.post("/events/:id/reopen", wrap((req) => req.cat!.setEventStatus(req.userId!, req.params.id, "open")));
app.post("/loans/:id/close", wrap((req) => req.cat!.setLoanStatus(req.userId!, req.params.id, "closed")));
app.post("/loans/:id/reopen", wrap((req) => req.cat!.setLoanStatus(req.userId!, req.params.id, "active")));
for (const entity of ["projects", "accounts"] as const) {
  app.post(`/${entity}/:id/archive`, wrap((req) => req.cat!.archive(entity, req.userId!, req.params.id, true)));
  app.post(`/${entity}/:id/unarchive`, wrap((req) => req.cat!.archive(entity, req.userId!, req.params.id, false)));
}

module.exports = app;
