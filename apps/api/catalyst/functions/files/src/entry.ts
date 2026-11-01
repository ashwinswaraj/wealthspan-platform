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
import { SHEETS, SHEET_KEYS, type SheetKey, type SheetRef } from "@jobrio/constants/sheets";
import { monthRange, recordDate, type SheetRecord } from "@jobrio/utils/sheet";
import {
  buildReport,
  FILE_FORMATS,
  renderFile,
  type FileFormat,
} from "../../../../src/features/files";

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
// Each export reads every row and builds a PDF/Excel/Word file, so keep it to a few a minute.
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 5,
    key: (req) =>
      String(req.headers["x-forwarded-for"] ?? req.ip ?? "anon")
        .split(",")[0]
        .trim(),
  }),
);
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const q = (v: unknown) => (typeof v === "string" && v ? v : undefined);
const date = (v: unknown) => {
  const s = q(v);
  return s && DATE.test(s) ? s : undefined;
};

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
  if (!format)
    return res
      .status(400)
      .json({ error: "validation", message: `format must be one of: ${FILE_FORMATS.join(", ")}` });
  const from = date(req.query.from);
  const to = date(req.query.to);
  if ((req.query.from && !from) || (req.query.to && !to))
    return res
      .status(400)
      .json({ error: "validation", message: "Dates must look like 2026-04-01." });

  try {
    const projectId = q(req.query.projectId);
    const [list, summary] = await Promise.all([
      svc.listTransactions(userId, { from, to, projectId, limit: 200 }),
      svc.getSummary(userId, { from, to, projectId }),
    ]);
    // listTransactions pages by 200; keep reading until everything is in the file.
    const transactions = [...list.items];
    while (transactions.length < list.total) {
      const next = await svc.listTransactions(userId, {
        from,
        to,
        projectId,
        limit: 200,
        offset: transactions.length,
      });
      if (!next.items.length) break;
      transactions.push(...next.items);
    }
    const [projects, accounts, events] = await Promise.all([
      catalog.list("projects", userId),
      catalog.list("accounts", userId),
      catalog.list("events", userId),
    ]);
    const map = (rows: { id: string; name: string }[]) =>
      Object.fromEntries(rows.map((r) => [r.id, r.name]));
    const names = { projects: map(projects), accounts: map(accounts), events: map(events) };
    const out = await renderFile(format, buildReport({ transactions, summary, from, to, names }));
    res.setHeader("Content-Type", out.mime);
    res.setHeader("Content-Disposition", `attachment; filename="${out.fileName}"`);
    res.setHeader("Cache-Control", "no-store");
    res.send(out.body);
  } catch (e) {
    console.error(
      "files error:",
      String((e as { message?: string })?.message ?? typeof e).slice(0, 300),
    );
    res.status(500).json({ error: "server", message: "Could not make the file. Try again." });
  }
});

/**
 * GET /sheet?sheet=income|expense|debt-loan|savings-investing|festivals-functions|accounts|project&month=YYYY-MM|all&projectId=
 * The dashboard's own sheet as a real .xlsx (same columns as the app). The user always comes from the session.
 */
app.get("/sheet", async (req, res) => {
  let userId: string;
  let c: ReturnType<typeof catalyst.initialize>;
  try {
    c = catalyst.initialize(req);
    const user = await c.userManagement().getCurrentUser();
    userId = String(user?.user_id ?? user?.userId ?? "");
    if (!userId) throw new Error("no user");
  } catch {
    return res.status(401).json({ error: "unauthorized", message: "Please log in." });
  }
  const key = SHEET_KEYS.find((k) => k === req.query.sheet) as SheetKey | undefined;
  if (!key)
    return res
      .status(400)
      .json({ error: "validation", message: `sheet must be one of: ${SHEET_KEYS.join(", ")}` });
  const month =
    typeof req.query.month === "string" && /^\d{4}-\d{2}$/.test(req.query.month)
      ? req.query.month
      : "all";
  const projectId = q(req.query.projectId);
  if (projectId && !/^\d{1,20}$/.test(projectId))
    return res.status(400).json({ error: "validation", message: "Bad project." });
  const def = SHEETS[key];

  try {
    const catalog = createCatalystCatalogStore(c);
    const svc = createFinanceService({ store: createCatalystFinanceStore(c) });
    let rows: SheetRecord[];
    if (def.source === "transactions") {
      const { from, to } = monthRange(month);
      const type = def.fixed?.type as "income" | "expense" | undefined;
      const first = await svc.listTransactions(userId, { from, to, projectId, type, limit: 200 });
      const all = [...first.items];
      while (all.length < first.total) {
        const next = await svc.listTransactions(userId, {
          from,
          to,
          projectId,
          type,
          limit: 200,
          offset: all.length,
        });
        if (!next.items.length) break;
        all.push(...next.items);
      }
      rows = all as unknown as SheetRecord[];
    } else {
      const list = (await catalog.list(def.source, userId)) as unknown as SheetRecord[];
      const { from, to } = monthRange(month);
      rows = list.filter(
        (r) =>
          (!projectId || r.projectId === projectId) &&
          (!from || (recordDate(r) >= from && recordDate(r) <= (to as string))),
      );
    }
    const refs: SheetRef[] = ["projects", "accounts", "events", "loans", "investments"];
    const names: Partial<Record<SheetRef, Record<string, string>>> = {};
    for (const ref of refs) {
      if (!def.columns.some((col) => col.ref === ref) && !(ref === "projects" && projectId))
        continue;
      const items = (await catalog.list(ref, userId)) as unknown as Array<{
        id: string;
        name?: string;
        lender?: string;
      }>;
      names[ref] = Object.fromEntries(items.map((i) => [i.id, i.name ?? i.lender ?? i.id]));
    }
    const title =
      key === "project" && projectId ? (names.projects?.[projectId] ?? def.title) : def.title;
    const body = await buildSheetXlsx(def, rows, names, title);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${sheetFileName(def, month)}"`);
    res.setHeader("Cache-Control", "no-store");
    res.send(body);
  } catch (e) {
    console.error(
      "sheet error:",
      String((e as { message?: string })?.message ?? typeof e).slice(0, 300),
    );
    res.status(500).json({ error: "server", message: "Could not make the file. Try again." });
  }
});

app.use(notFound());
app.use(jsonErrors());

module.exports = app;
