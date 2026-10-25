"use strict";
/**
 * auth — Advanced I/O function (Express).
 *   POST /send    { email, method: "otp" | "link" }
 *   POST /verify  { email, method, secret }  -> { token }  (Catalyst custom token)
 * The Catalyst/SDK glue here is NOT unit-tested; the rules are (lib/login-service.js).
 */
const express = require("express");
const catalyst = require("zcatalyst-sdk-node");
const { createLoginService, LoginError } = require("./lib/login-service");
const { createCatalystStore } = require("./lib/catalyst-store");
const { createMailer } = require("./lib/mailer");

const app = express();
app.use(express.json({ limit: "4kb" }));

const serviceFor = (req) => {
  const c = catalyst.initialize(req);
  return {
    c,
    svc: createLoginService({
      store: createCatalystStore(c),
      mailer: createMailer(c, {
        fromEmail: process.env.FROM_EMAIL,
        appUrl: process.env.APP_URL,
      }),
    }),
  };
};

const handle = (fn) => async (req, res) => {
  try {
    res.json(await fn(req));
  } catch (e) {
    if (e instanceof LoginError) return res.status(e.status).json({ error: e.code, message: e.message });
    console.error("auth error", e?.message); // never log codes, tokens or hashes
    res.status(500).json({ error: "server", message: "Something went wrong. Try again." });
  }
};

app.post("/send", handle(async (req) => serviceFor(req).svc.send(req.body ?? {})));

app.post("/verify", handle(async (req) => {
  const { c, svc } = serviceFor(req);
  const { email } = await svc.verify(req.body ?? {});
  const token = await c.userManagement().generateCustomToken({
    type: "web",
    user_details: { email_id: email, first_name: email.split("@")[0].slice(0, 50), last_name: "User" },
  });
  return { token };
}));

module.exports = app;
