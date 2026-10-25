"use strict";
const crypto = require("node:crypto");

/** 6-digit code, uniform (no modulo bias). */
const generateOtp = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

/** 32 random bytes as url-safe text, for magic links. */
const generateLinkToken = () => crypto.randomBytes(32).toString("base64url");

/** Only this hash is stored — never the code or token itself. */
const hashSecret = (secret) => crypto.createHash("sha256").update(String(secret)).digest("hex");

const safeEqualHex = (a, b) => {
  const x = Buffer.from(String(a), "utf8");
  const y = Buffer.from(String(b), "utf8");
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

module.exports = { generateOtp, generateLinkToken, hashSecret, safeEqualHex };
