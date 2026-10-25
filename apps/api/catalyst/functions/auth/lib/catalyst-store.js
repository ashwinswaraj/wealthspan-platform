"use strict";
/** login_codes table access through Catalyst Data Store (ZCQL for reads). */
const TABLE = "login_codes";

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");

const toRow = (r) => {
  const x = r[TABLE] ?? r;
  return {
    id: x.ROWID,
    email: x.email,
    method: x.method,
    secretHash: x.secret_hash,
    createdMs: Number(x.created_ms),
    expiresMs: Number(x.expires_ms),
    attempts: Number(x.attempts ?? 0),
    usedMs: x.used_at ? Date.parse(String(x.used_at).replace(" ", "T") + "Z") || 1 : null,
  };
};

const createCatalystStore = (app) => ({
  async recent(email, limit = 20) {
    const q =
      `SELECT ROWID, email, method, secret_hash, created_ms, expires_ms, attempts, used_at ` +
      `FROM ${TABLE} WHERE email = '${esc(email)}' ORDER BY CREATEDTIME DESC LIMIT 0,${Number(limit)}`;
    const res = await app.zcql().executeZCQLQuery(q);
    return res.map(toRow);
  },
  async insert(r) {
    await app.datastore().table(TABLE).insertRow({
      email: r.email,
      method: r.method,
      secret_hash: r.secretHash,
      created_ms: r.createdMs,
      expires_ms: r.expiresMs,
      attempts: 0,
      expires_at: new Date(r.expiresMs).toISOString().slice(0, 19).replace("T", " "),
    });
  },
  async update(id, patch) {
    const row = { ROWID: id };
    if (patch.attempts !== undefined) row.attempts = patch.attempts;
    if (patch.usedMs !== undefined) row.used_at = new Date(patch.usedMs).toISOString().slice(0, 19).replace("T", " ");
    await app.datastore().table(TABLE).updateRow(row);
  },
});

module.exports = { createCatalystStore };
