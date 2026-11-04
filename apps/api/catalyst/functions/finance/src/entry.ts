/**
 * finance — Catalyst Advanced I/O function (Express). Built into ../index.js by
 * `pnpm --filter @wealthspan/api build:catalyst`; don't edit index.js by hand.
 *
 *   GET    /transactions?from&to&projectId&accountId&type&limit&offset
 *   POST   /transactions
 *   PATCH  /transactions/:id
 *   DELETE /transactions/:id        (soft delete)
 *   GET    /me                      (200 when logged in, else 401)
 *   GET    /summary?from&to&projectId
 *   GET/POST /projects|accounts|events|loans|investments ; PATCH/DELETE /<entity>/:id
 *   POST   /events/:id/conclude|reopen, /loans/:id/close|reopen, /projects|accounts/:id/archive|unarchive
 *   GET    /subscription ; POST /subscription/trial ; GET|POST /subscription/payments ; GET /plans ; GET /broadcasts
 *   GET    /admin/me                       (any logged-in user: are they an admin?)
 *   GET    /admin/overview|users|payments|ledger|audit|health ; POST /admin/payments/:id/approve|reject   (admins only)
 *   GET    /admin/plans ; PUT /admin/plans/:id ; GET|POST /admin/broadcasts   (admins only)
 *
 * The user is ALWAYS taken from the Catalyst login session, never from the request.
 */
import express from "express";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const catalyst = require("zcatalyst-sdk-node");
import {
  createCatalystFinanceStore,
  createFinanceService,
  FinanceError,
} from "../../../../src/features/finance";
import {
  CatalogError,
  createCatalogService,
  createCatalystCatalogStore,
  type CatalogEntity,
} from "../../../../src/features/catalog";
import {
  createSubscriptionService,
  createCatalystSubscriptionStore,
  loadPlans,
  SubscriptionError,
} from "../../../../src/features/subscription";
import { createAdminService, createCatalystAdminStore } from "../../../../src/features/admin";
import {
  hardenApp,
  jsonErrors,
  notFound,
  rateLimit,
  requestGuard,
} from "../../../../src/middleware/security";

const app = express();
hardenApp(app);
app.use(requestGuard());
app.use(express.json({ limit: "32kb" }));

type Req = express.Request & {
  userId?: string;
  email?: string;
  name?: string;
  svc?: ReturnType<typeof createFinanceService>;
  cat?: ReturnType<typeof createCatalogService>;
  sub?: ReturnType<typeof createSubscriptionService>;
  admin?: ReturnType<typeof createAdminService>;
  c?: { zcql(): { executeZCQLQuery(q: string): Promise<unknown[]> } };
};

/**
 * Admin rights come from env variables only, never from the client:
 *  ADMIN_EMAILS    comma separated e-mails
 *  ADMIN_USER_IDS  comma separated Catalyst user ids; when set, an admin needs BOTH (e-mail + id)
 */
const list = (v: string | undefined) => String(v ?? "").split(",");
const ADMIN_EMAILS = () => list(process.env.ADMIN_EMAILS);
const ADMIN_USER_IDS = () => list(process.env.ADMIN_USER_IDS);

/**
 * Catalyst answers /project-user/current with `data: null` for this app, although its gateway has already
 * authenticated the request (the function is protected, so an anonymous call never reaches this code) and
 * passes the user's id in `x-zc-user-id`. Use that id, then read the profile (e-mail, name) as admin.
 */
async function userFromGateway(
  req: express.Request,
  c: { userManagement(): { getUserDetails(id: string): Promise<Record<string, unknown>> } },
) {
  const id = String(req.headers["x-zc-user-id"] ?? "");
  const hasCred = Boolean(req.headers["x-zc-user-cred-token"]);
  if (!/^\d{6,24}$/.test(id) || !hasCred) return undefined;
  try {
    const details = await c.userManagement().getUserDetails(id);
    return { ...(details ?? {}), user_id: id } as Record<string, unknown>;
  } catch (e) {
    console.error("auth: getUserDetails failed", e instanceof Error ? e.message : e);
    return { user_id: id } as Record<string, unknown>;
  }
}

app.use(async (req: Req, res, next) => {
  try {
    const c = catalyst.initialize(req);
    let user: Record<string, unknown> | undefined;
    // The logged-in user is only visible to an SDK initialised in USER scope; the default (admin) scope returns nothing.
    for (const scope of ["user", "admin"] as const) {
      try {
        user = await catalyst.initialize(req, { scope }).userManagement().getCurrentUser();
      } catch (e) {
        console.error(`auth: getCurrentUser (${scope}) failed`, e instanceof Error ? e.message : e);
      }
      if (user?.user_id ?? user?.userId) break;
    }
    const userId = user?.user_id ?? user?.userId;
    if (!userId) {
      // Ask Catalyst directly and log exactly what it answers (status + body), then use it if it holds a user.
      try {
        const um = catalyst.initialize(req, { scope: "user" }).userManagement();
        const resp = await um.requester.send({
          method: "GET",
          path: "/project-user/current",
          catalyst: true,
          user: "user",
        });
        const body = resp.data;
        console.error(
          "auth: raw /project-user/current",
          resp.statusCode,
          JSON.stringify(body)?.slice(0, 300),
        );
        const raw = body?.data ?? body;
        if (raw && (raw.user_id ?? raw.userId)) user = raw;
      } catch (e) {
        console.error("auth: raw call failed", e instanceof Error ? e.message : e);
      }
    }
    if (!(user?.user_id ?? user?.userId)) user = await userFromGateway(req, c);
    const userId2 = user?.user_id ?? user?.userId;
    if (!userId2)
      console.error(
        "auth: debug x-zc headers =",
        Object.keys(req.headers)
          .filter((k) => k.startsWith("x-zc"))
          .join(","),
        "; user raw =",
        JSON.stringify(user ?? null)?.slice(0, 200),
      );
    if (!userId2)
      console.error(
        "auth: no user id; user keys =",
        user ? Object.keys(user).join(",") : "none",
        "; has session headers =",
        Boolean(req.headers["x-zc-user-cred-token"] || req.headers.cookie),
      );
    if (!userId2) return res.status(401).json({ error: "unauthorized", message: "Please log in." });
    req.userId = String(userId2);
    req.email = String(user?.email_id ?? user?.emailId ?? "");
    req.name = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
    req.c = c;
    const fin = createCatalystFinanceStore(c);
    const subStore = createCatalystSubscriptionStore(c);
    req.sub = createSubscriptionService({
      store: subStore,
      plans: () => loadPlans(subStore),
      adminIds: [],
    });
    req.admin = createAdminService({
      store: createCatalystAdminStore(c),
      plans: subStore,
      adminEmails: ADMIN_EMAILS(),
      adminUserIds: ADMIN_USER_IDS(),
    });
    req.svc = createFinanceService({ store: fin });
    req.cat = createCatalogService({ store: createCatalystCatalogStore(c), finance: fin });
    next();
  } catch (e) {
    // The user IS logged in here: a setup problem must not look like "logged out" (that causes a login loop).
    console.error("auth: setup failed", e instanceof Error ? e.stack : e);
    res
      .status(500)
      .json({ error: "server_error", message: "Server setup problem. Please try again." });
  }
});

/** Brake on abuse: writes 90/min, reads 300/min per user (per function instance). */
app.use(rateLimit({ windowMs: 60_000, max: 90, methods: ["POST", "PATCH", "PUT", "DELETE"] }));
app.use(rateLimit({ windowMs: 60_000, max: 300, methods: ["GET"] }));

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const q = (v: unknown) => (typeof v === "string" && v ? v : undefined);
const date = (v: unknown) => {
  const s = q(v);
  return s && DATE.test(s) ? s : undefined;
};
const int = (v: unknown) => {
  const n = Number(q(v));
  return Number.isInteger(n) ? n : undefined;
};
const TYPES = ["income", "expense", "transfer"] as const;

const wrap =
  (fn: (req: Req) => Promise<unknown>): express.RequestHandler =>
  async (req, res) => {
    try {
      res.json(await fn(req as Req));
    } catch (e) {
      if (e instanceof CatalogError)
        return res.status(e.status).json({ error: e.code, message: e.message, fields: e.fields });
      if (e instanceof SubscriptionError)
        return res.status(e.status).json({ error: e.code, message: e.message });
      if (e instanceof FinanceError)
        return res.status(e.status).json({ error: e.code, message: e.message, fields: e.fields });
      console.error(
        "finance error:",
        String((e as { message?: string })?.message ?? typeof e).slice(0, 300),
      );
      res.status(500).json({ error: "server", message: "Something went wrong. Try again." });
    }
  };

app.get(
  "/transactions",
  wrap((req) =>
    req.svc!.listTransactions(req.userId!, {
      from: date(req.query.from),
      to: date(req.query.to),
      projectId: q(req.query.projectId),
      accountId: q(req.query.accountId),
      type: TYPES.find((t) => t === req.query.type),
      limit: int(req.query.limit),
      offset: int(req.query.offset),
    }),
  ),
);

app.post(
  "/transactions",
  wrap((req) => req.svc!.createTransaction(req.userId!, req.body ?? {}, "manual")),
);
app.patch(
  "/transactions/:id",
  wrap((req) => req.svc!.updateTransaction(req.userId!, req.params.id, req.body ?? {}, "manual")),
);
app.delete(
  "/transactions/:id",
  wrap(async (req) => {
    await req.svc!.deleteTransaction(req.userId!, req.params.id, "manual");
    return { deleted: true };
  }),
);

app.get(
  "/summary",
  wrap((req) =>
    req.svc!.getSummary(req.userId!, {
      from: date(req.query.from),
      to: date(req.query.to),
      projectId: q(req.query.projectId),
    }),
  ),
);

/** Is there a valid login? Used by the app to decide between the login screen and the app. */
app.get(
  "/me",
  wrap(async (req) => ({ userId: req.userId, email: req.email ?? "", name: req.name ?? "" })),
);

/* ---- projects, accounts, events, loans, investments ---- */
const ENTITIES: CatalogEntity[] = ["projects", "accounts", "events", "loans", "investments"];
for (const entity of ENTITIES) {
  app.get(
    `/${entity}`,
    wrap((req) => req.cat!.list(entity, req.userId!).then((items) => ({ items }))),
  );
  app.post(
    `/${entity}`,
    wrap((req) => req.cat!.create(entity, req.userId!, req.body ?? {}, "manual")),
  );
  app.patch(
    `/${entity}/:id`,
    wrap((req) => req.cat!.update(entity, req.userId!, req.params.id, req.body ?? {}, "manual")),
  );
  app.delete(
    `/${entity}/:id`,
    wrap(async (req) => {
      await req.cat!.remove(entity, req.userId!, req.params.id, "manual");
      return { deleted: true };
    }),
  );
}
app.post(
  "/events/:id/conclude",
  wrap((req) => req.cat!.setEventStatus(req.userId!, req.params.id, "concluded")),
);
app.post(
  "/events/:id/reopen",
  wrap((req) => req.cat!.setEventStatus(req.userId!, req.params.id, "open")),
);
app.post(
  "/loans/:id/close",
  wrap((req) => req.cat!.setLoanStatus(req.userId!, req.params.id, "closed")),
);
app.post(
  "/loans/:id/reopen",
  wrap((req) => req.cat!.setLoanStatus(req.userId!, req.params.id, "active")),
);
for (const entity of ["projects", "accounts"] as const) {
  app.post(
    `/${entity}/:id/archive`,
    wrap((req) => req.cat!.archive(entity, req.userId!, req.params.id, true)),
  );
  app.post(
    `/${entity}/:id/unarchive`,
    wrap((req) => req.cat!.archive(entity, req.userId!, req.params.id, false)),
  );
}

/* ---- subscription (the signed-in user's own plan) ---- */
app.get(
  "/subscription",
  wrap((req) => req.sub!.getEntitlement(req.userId!)),
);
app.post(
  "/subscription/trial",
  wrap((req) => req.sub!.startTrial(req.userId!)),
);
app.get(
  "/subscription/payments",
  wrap((req) => req.sub!.listMyPayments(req.userId!).then((payments) => ({ payments }))),
);
app.post(
  "/subscription/payments",
  wrap((req) => req.sub!.submitPayment(req.userId!, req.body ?? {})),
);
/** Current plan prices (admin-editable), for the upgrade screen. */
app.get(
  "/plans",
  wrap((req) => req.sub!.getPlans().then((plans) => ({ plans }))),
);
/** Announcements for this user's tier: everyone, plus Free / Go / Pro as it applies. */
app.get(
  "/broadcasts",
  wrap(async (req) => {
    const e = await req.sub!.getEntitlement(req.userId!);
    const tier = !e.active ? "FREE" : e.plan === "trial" ? "GO" : "PRO";
    return { broadcasts: await req.admin!.broadcastsFor(tier) };
  }),
);

/* ---- admin console ---- */
const isAdmin = (req: Req) => req.admin!.isAdmin({ email: req.email, userId: req.userId });
app.get(
  "/admin/me",
  wrap(async (req) => {
    const ok = isAdmin(req);
    // A listed e-mail that is not pinned yet may read its own user id, to put into ADMIN_USER_IDS.
    const needsPin = !ok && req.admin!.isAdminEmail(req.email) && !req.admin!.isPinned();
    return {
      email: req.email ?? "",
      name: req.name || req.email || "",
      isAdmin: ok,
      ...(needsPin || (ok && !req.admin!.isPinned()) ? { userId: req.userId } : {}),
      idPinned: req.admin!.isPinned(),
    };
  }),
);

app.use("/admin", (req: Req, res, next) => {
  if (!isAdmin(req)) {
    if (req.admin!.isAdminEmail(req.email))
      console.warn("admin e-mail with a different user id was refused");
    return res.status(403).json({ error: "forbidden", message: "Admins only." });
  }
  next();
});

const PAYMENT_STATUS = ["pending", "approved", "rejected"] as const;
app.get(
  "/admin/overview",
  wrap((req) => req.admin!.overview()),
);
app.get(
  "/admin/users",
  wrap((req) => req.admin!.users().then((users) => ({ users }))),
);
app.get(
  "/admin/payments",
  wrap((req) =>
    req
      .admin!.payments(PAYMENT_STATUS.find((s) => s === req.query.status))
      .then((payments) => ({ payments })),
  ),
);
app.get(
  "/admin/plans",
  wrap((req) => req.admin!.plans().then((plans) => ({ plans }))),
);
app.put(
  "/admin/plans/:id",
  wrap((req) => req.admin!.savePlan(req.userId!, req.params.id, req.body ?? {})),
);
app.get(
  "/admin/broadcasts",
  wrap((req) => req.admin!.broadcasts().then((broadcasts) => ({ broadcasts }))),
);
app.post(
  "/admin/broadcasts",
  wrap((req) => req.admin!.sendBroadcast(req.userId!, req.body ?? {})),
);
app.get(
  "/admin/ledger",
  wrap((req) => req.admin!.ledger().then((rows) => ({ rows }))),
);
app.get(
  "/admin/audit",
  wrap((req) => req.admin!.audit().then((rows) => ({ rows }))),
);
for (const decision of ["approve", "reject"] as const) {
  app.post(
    `/admin/payments/:id/${decision}`,
    wrap(async (req) => {
      // The admin check already passed, so this service instance may review.
      const svc = createSubscriptionService({
        store: createCatalystSubscriptionStore(req.c as never),
        plans: () => loadPlans(createCatalystSubscriptionStore(req.c as never)),
        adminIds: [req.userId!],
      });
      const note = typeof req.body?.note === "string" ? req.body.note : undefined;
      const r = await svc.review(req.userId!, req.params.id, decision, note);
      return { payment: r.payment };
    }),
  );
}
/** Real checks only: how fast the API and the Data Store answer right now. Other services are "not checked". */
app.get(
  "/admin/health",
  wrap(async (req) => {
    const t0 = Date.now();
    let dataOk = true;
    try {
      await req.c!.zcql().executeZCQLQuery("SELECT ROWID FROM projects LIMIT 0,1");
    } catch {
      dataOk = false;
    }
    const dataMs = Date.now() - t0;
    return {
      checks: [
        { name: "Core API (finance)", ok: true, latencyMs: null },
        { name: "Data Store", ok: dataOk, latencyMs: dataOk ? dataMs : null },
        { name: "Chat (Sarvam)", ok: null, latencyMs: null },
        { name: "Files", ok: null, latencyMs: null },
      ],
    };
  }),
);

app.use(notFound());
app.use(jsonErrors());

module.exports = app;
