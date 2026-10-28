/**
 * files — Catalyst Advanced I/O function (Express). Built into ../index.js by
 * `pnpm --filter @jobrio/api build:catalyst`; don't edit index.js by hand.
 *
 *   GET /export?format=csv|xlsx|docx|pdf&from=YYYY-MM-DD&to=YYYY-MM-DD&projectId=
 *
 * The user is ALWAYS taken from the Catalyst login session. The chatbot's
 * generate_file tool will call the same buildReport/renderFile code.
 */
import express from "express";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const catalyst = require("zcatalyst-sdk-node");
import { createCatalystFinanceStore, createFinanceService } from "../../../../src/features/finance";
import { createCatalystCatalogStore } from "../../../../src/features/catalog";
import { buildReport, FILE_FORMATS, renderFile, type FileFormat } from "../../../../src/features/files";

const app = express();
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const q = (v: unknown) => (typeof v === "string" && v ? v : undefined);
const date = (v: unknown) => { const s = q(v); return s && DATE.test(s) ? s : undefined; };

app.get("/export", async (req, res) => {
  let userId: string;
  let svc: ReturnType<typeof createFinanceService>;
  let catalog: ReturnType<typeof createCatalystCatalogStore>;
  try {
    const c = catalyst.initialize(req);
    const user = await c.userManagement().getCurrentUser();
    userId = String(user?.user_id ?? user?.userId ?? "");
    if (!userId) throw new Error("no user");
    svc = createFinanceService({ store: createCatalystFinanceStore(c) });
    catalog = createCatalystCatalogStore(c);
  } catch {
    return res.status(401).json({ error: "unauthorized", message: "Please log in." });
  }
  const format = FILE_FORMATS.find((f) => f === req.query.format) as FileFormat | undefined;
  if (!format) return res.status(400).json({ error: "validation", message: `format must be one of: ${FILE_FORMATS.join(", ")}` });
  const from = date(req.query.from);
  const to = date(req.query.to);
  if ((req.query.from && !from) || (req.query.to && !to)) return res.status(400).json({ error: "validation", message: "Dates must look like 2026-04-01." });

  try {
    const projectId = q(req.query.projectId);
    const [list, summary] = await Promise.all([
      svc.listTransactions(userId, { from, to, projectId, limit: 200 }),
      svc.getSummary(userId, { from, to, projectId }),
    ]);
    // listTransactions pages by 200; keep reading until everything is in the file.
    const transactions = [...list.items];
    while (transactions.length < list.total) {
      const next = await svc.listTransactions(userId, { from, to, projectId, limit: 200, offset: transactions.length });
      if (!next.items.length) break;
      transactions.push(...next.items);
    }
    const [projects, accounts, events] = await Promise.all([
      catalog.list("projects", userId), catalog.list("accounts", userId), catalog.list("events", userId),
    ]);
    const map = (rows: { id: string; name: string }[]) => Object.fromEntries(rows.map((r) => [r.id, r.name]));
    const names = { projects: map(projects), accounts: map(accounts), events: map(events) };
    const out = await renderFile(format, buildReport({ transactions, summary, from, to, names }));
    res.setHeader("Content-Type", out.mime);
    res.setHeader("Content-Disposition", `attachment; filename="${out.fileName}"`);
    res.setHeader("Cache-Control", "no-store");
    res.send(out.body);
  } catch (e) {
    console.error("files error:", String((e as { message?: string })?.message ?? typeof e).slice(0, 300));
    res.status(500).json({ error: "server", message: "Could not make the file. Try again." });
  }
});

module.exports = app;
