/**
 * chat — Catalyst Advanced I/O function (Express). Built into ../index.js by
 * `pnpm --filter @wealthspan/api build:catalyst`; don't edit index.js by hand.
 *
 *   POST /chat   { messages: [{role, content}] }   (login + active plan or trial, daily limit)
 *
 * Tools (add/edit/delete with confirmation) come next. When they do, the confirmation MUST be kept on the
 * server (a pending action stored for this user, used once), never a "confirmed: true" sent by the browser.
 */
import express from "express";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const catalyst = require("zcatalyst-sdk-node");
import {
  AiError,
  createCatalystChatUsageStore,
  createChatQuota,
  createSarvamClient,
  type ChatMessage,
} from "../../../../src/features/chat";
import {
  createCatalystSubscriptionStore,
  createSubscriptionService,
} from "../../../../src/features/subscription";
import {
  hardenApp,
  jsonErrors,
  notFound,
  rateLimit,
  requestGuard,
} from "../../../../src/middleware/security";

/** Catalyst's gateway has authenticated the call and passes the user id; /project-user/current returns null for this app. */
const gatewayUserId = (req: { headers: Record<string, unknown> }): string => {
  const id = String(req.headers["x-zc-user-id"] ?? "");
  return /^\d{6,24}$/.test(id) && req.headers["x-zc-user-cred-token"] ? id : "";
};

const app = express();
hardenApp(app);
app.use(requestGuard());
app.use(express.json({ limit: "32kb" }));

const ai = () => createSarvamClient({ apiKey: process.env.SARVAM_API_KEY });

const SYSTEM =
  "You are Wealthspan's accountant assistant for an Indian user. Amounts are in rupees. " +
  "Reply briefly in the user's language (Hindi, Hinglish or English).";

const fail = (res: express.Response, e: unknown) => {
  if (e instanceof AiError) return res.status(e.status).json({ error: e.code, message: e.message });
  console.error(
    "chat error:",
    String((e as { message?: string })?.message ?? typeof e).slice(0, 200),
  );
  return res.status(500).json({ error: "server", message: "Something went wrong. Try again." });
};

app.post("/chat", async (req, res) => {
  let userId: string;
  let c: ReturnType<typeof catalyst.initialize>;
  try {
    c = catalyst.initialize(req);
    const user =
      (await catalyst.initialize(req, { scope: "user" }).userManagement().getCurrentUser()) ||
      (await c.userManagement().getCurrentUser());
    userId = String(user?.user_id ?? user?.userId ?? gatewayUserId(req));
    if (!userId) throw new Error("no user");
  } catch {
    return res.status(401).json({ error: "unauthorized", message: "Please log in." });
  }
  try {
    // Only people with a live trial or paid plan may use the (paid) AI.
    const entitlement = await createSubscriptionService({
      store: createCatalystSubscriptionStore(c),
    }).getEntitlement(userId);
    if (!entitlement.active)
      return res.status(402).json({
        error: "subscription_required",
        message: "Start your free trial or subscribe to chat with your accountant.",
      });
    const quota = await createChatQuota({ store: createCatalystChatUsageStore(c) }).consume(userId);
    if (!quota.ok)
      return res.status(429).json({
        error: "daily_limit",
        message: `Daily chat limit (${quota.limit} messages) reached. Try again tomorrow.`,
      });
  } catch (e) {
    return fail(res, e);
  }

  const raw = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages: ChatMessage[] = raw
    .filter(
      (m: { role?: string; content?: unknown }) =>
        (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string",
    )
    .slice(-12)
    .map((m: { role: "user" | "assistant"; content: string }) => ({
      role: m.role,
      content: m.content.slice(0, 2000),
    }));
  if (!messages.length)
    return res.status(400).json({ error: "validation", message: "Send at least one message." });
  try {
    const r = await ai().chat({ messages: [{ role: "system", content: SYSTEM }, ...messages] });
    res.json({ reply: r.content ?? "", usage: r.usage });
  } catch (e) {
    fail(res, e);
  }
});

app.use(notFound());
app.use(jsonErrors());

module.exports = app;
