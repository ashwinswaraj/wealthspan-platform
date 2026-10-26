/**
 * chat — Catalyst Advanced I/O function (Express). Built into ../index.js by
 * `pnpm --filter @jobrio/api build:catalyst`; don't edit index.js by hand.
 *
 *   POST /chat   { messages: [{role, content}] }   (login required)
 *   GET  /ping   tiny Sarvam connectivity check     (TEMPORARY, no login — remove before launch)
 *
 * Tools (add/edit/delete with confirmation) come next; this step only proves Sarvam is reachable.
 */
import express from "express";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const catalyst = require("zcatalyst-sdk-node");
import { AiError, createSarvamClient, type ChatMessage } from "../../../../src/features/chat";

const app = express();
app.use(express.json({ limit: "64kb" }));

const ai = () => createSarvamClient({ apiKey: process.env.SARVAM_API_KEY });

const SYSTEM =
  "You are Wealthspan's accountant assistant for an Indian user. Amounts are in rupees. " +
  "Reply briefly in the user's language (Hindi, Hinglish or English).";

const fail = (res: express.Response, e: unknown) => {
  if (e instanceof AiError) return res.status(e.status).json({ error: e.code, message: e.message });
  console.error("chat error:", String((e as { message?: string })?.message ?? typeof e).slice(0, 200));
  return res.status(500).json({ error: "server", message: "Something went wrong. Try again." });
};

app.get("/ping", async (_req, res) => {
  try {
    const r = await ai().chat({ messages: [{ role: "user", content: "Say OK" }], maxTokens: 8 });
    res.json({ ok: true, reply: r.content, usage: r.usage });
  } catch (e) {
    fail(res, e);
  }
});

app.post("/chat", async (req, res) => {
  try {
    const user = await catalyst.initialize(req).userManagement().getCurrentUser();
    if (!(user?.user_id ?? user?.userId)) throw new Error("no user");
  } catch {
    return res.status(401).json({ error: "unauthorized", message: "Please log in." });
  }
  const raw = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages: ChatMessage[] = raw
    .filter((m: { role?: string; content?: unknown }) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (!messages.length) return res.status(400).json({ error: "validation", message: "Send at least one message." });
  try {
    const r = await ai().chat({ messages: [{ role: "system", content: SYSTEM }, ...messages] });
    res.json({ reply: r.content ?? "", usage: r.usage });
  } catch (e) {
    fail(res, e);
  }
});

module.exports = app;
