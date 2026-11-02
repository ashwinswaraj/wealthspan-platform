# AI Services

> Status: Draft · Last updated: 2026-11-01

**Provider: Sarvam AI, model `sarvam-105b`** (`apps/api/src/features/chat/sarvam.ts`, the only file that knows Sarvam's HTTP shape; swap the provider by changing it).

- Key: `SARVAM_API_KEY` in the `chat` function's env vars (set in the Catalyst console after each deploy; never in the repo or logs).
- Timeout kept below Catalyst's 30 s function limit; errors map to `AiError` (`no_key`, `timeout`, `provider`, `bad_response`).
- Sent to Sarvam: a short system prompt plus the user's last 12 chat messages (2000 characters each). Ledger data is **not** sent today.
- Guards: login, active plan or trial (402 otherwise), 40 messages per user per IST day (429).
- Today it is plain Q&A. **Planned:** tool calls (search, summary, create/update/delete entries, generate file) with server-side confirmation; the model never computes numbers or touches the database. Tool-calling quality with `sarvam-105b` is unverified.
- Users should be told that chat text is processed by Sarvam (see the Privacy Policy draft).
