"use strict";
/**
 * Email OTP / magic-link login rules. Pure logic: the database, the mailer
 * and the clock are injected so every rule can be tested without Catalyst.
 */
const { generateOtp, generateLinkToken, hashSecret, safeEqualHex } = require("./secrets");

const METHODS = ["otp", "link"];
const EXPIRY_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MIN_GAP_MS = 60 * 1000;
const MAX_PER_HOUR = 5;
const EMAIL_RE = /^[^\s@'"\;]{1,64}@[^\s@'"\;]{1,189}\.[^\s@'"\;]{2,}$/;

const normalizeEmail = (v) => String(v ?? "").trim().toLowerCase();
const isValidEmail = (v) => v.length <= 254 && EMAIL_RE.test(v);

class LoginError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

/**
 * store: { recent(email, limit) -> rows newest first, insert(row), update(rowId, patch) }
 *   row: { id, email, method, secretHash, createdMs, expiresMs, attempts, usedMs }
 * mailer: { send({ to, method, secret, email }) }
 */
const createLoginService = ({ store, mailer, now = () => Date.now() }) => ({
  async send({ email, method }) {
    const to = normalizeEmail(email);
    if (!isValidEmail(to)) throw new LoginError("bad_email", "Enter a valid email address.");
    if (!METHODS.includes(method)) throw new LoginError("bad_method", "Choose code or link.");

    const t = now();
    const recent = await store.recent(to, 20);
    if (recent.some((r) => t - r.createdMs < MIN_GAP_MS))
      throw new LoginError("too_soon", "Please wait a minute before asking again.", 429);
    if (recent.filter((r) => t - r.createdMs < 3_600_000).length >= MAX_PER_HOUR)
      throw new LoginError("too_many", "Too many requests. Try again later.", 429);

    const secret = method === "otp" ? generateOtp() : generateLinkToken();
    await store.insert({
      email: to, method, secretHash: hashSecret(secret),
      createdMs: t, expiresMs: t + EXPIRY_MS, attempts: 0,
    });
    await mailer.send({ to, method, secret, email: to });
    return { sent: true, expiresInSeconds: EXPIRY_MS / 1000 };
  },

  /** Returns the verified email. Never says which part was wrong. */
  async verify({ email, method, secret }) {
    const to = normalizeEmail(email);
    const fail = () => new LoginError("invalid", "That code or link is not valid or has expired.", 401);
    if (!isValidEmail(to) || !METHODS.includes(method) || !secret) throw fail();

    const t = now();
    const rows = await store.recent(to, 20);
    const row = rows.find((r) => r.method === method && !r.usedMs && r.expiresMs > t);
    if (!row) throw fail();
    if (row.attempts >= MAX_ATTEMPTS) throw new LoginError("locked", "Too many wrong tries. Ask for a new code.", 429);

    if (!safeEqualHex(hashSecret(secret), row.secretHash)) {
      await store.update(row.id, { attempts: row.attempts + 1 });
      throw fail();
    }
    await store.update(row.id, { usedMs: t });
    return { email: to };
  },
});

module.exports = { createLoginService, LoginError, normalizeEmail, isValidEmail, METHODS, EXPIRY_MS, MAX_ATTEMPTS };
