"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { createLoginService, MAX_ATTEMPTS } = require("../lib/login-service");

const setup = () => {
  const rows = [];
  const sent = [];
  let t = 1_000_000_000_000;
  const store = {
    recent: async (email) => rows.filter((r) => r.email === email).sort((a, b) => b.createdMs - a.createdMs),
    insert: async (r) => { rows.push({ id: String(rows.length + 1), usedMs: null, ...r }); },
    update: async (id, patch) => { Object.assign(rows.find((r) => r.id === id), patch); },
  };
  const mailer = { send: async (m) => { sent.push(m); } };
  const svc = createLoginService({ store, mailer, now: () => t });
  return { svc, rows, sent, advance: (ms) => { t += ms; } };
};

test("otp: send then verify works once, secret never stored in plain", async () => {
  const { svc, rows, sent } = setup();
  await svc.send({ email: " A@B.com ", method: "otp" });
  assert.match(sent[0].secret, /^\d{6}$/);
  assert.notEqual(rows[0].secretHash, sent[0].secret);
  assert.deepEqual(await svc.verify({ email: "a@b.com", method: "otp", secret: sent[0].secret }), { email: "a@b.com" });
  await assert.rejects(svc.verify({ email: "a@b.com", method: "otp", secret: sent[0].secret }), { code: "invalid" });
});

test("link method works and an otp cannot be used as a link", async () => {
  const { svc, sent } = setup();
  await svc.send({ email: "a@b.com", method: "link" });
  await assert.rejects(svc.verify({ email: "a@b.com", method: "otp", secret: sent[0].secret }), { code: "invalid" });
  assert.ok((await svc.verify({ email: "a@b.com", method: "link", secret: sent[0].secret })).email);
});

test("expires after 10 minutes", async () => {
  const { svc, sent, advance } = setup();
  await svc.send({ email: "a@b.com", method: "otp" });
  advance(10 * 60 * 1000 + 1);
  await assert.rejects(svc.verify({ email: "a@b.com", method: "otp", secret: sent[0].secret }), { code: "invalid" });
});

test("locks after too many wrong tries, even with the right code", async () => {
  const { svc, sent } = setup();
  await svc.send({ email: "a@b.com", method: "otp" });
  for (let i = 0; i < MAX_ATTEMPTS; i++)
    await assert.rejects(svc.verify({ email: "a@b.com", method: "otp", secret: "000000x" }), { code: "invalid" });
  await assert.rejects(svc.verify({ email: "a@b.com", method: "otp", secret: sent[0].secret }), { code: "locked" });
});

test("send is rate limited: 1/minute and 5/hour", async () => {
  const { svc, advance } = setup();
  await svc.send({ email: "a@b.com", method: "otp" });
  await assert.rejects(svc.send({ email: "a@b.com", method: "otp" }), { code: "too_soon" });
  for (let i = 0; i < 4; i++) { advance(61_000); await svc.send({ email: "a@b.com", method: "otp" }); }
  advance(61_000);
  await assert.rejects(svc.send({ email: "a@b.com", method: "otp" }), { code: "too_many" });
});

test("rejects bad email, quotes and unknown method", async () => {
  const { svc } = setup();
  await assert.rejects(svc.send({ email: "nope", method: "otp" }), { code: "bad_email" });
  await assert.rejects(svc.send({ email: "a'b@c.com", method: "otp" }), { code: "bad_email" });
  await assert.rejects(svc.send({ email: "a@b.com", method: "sms" }), { code: "bad_method" });
});
