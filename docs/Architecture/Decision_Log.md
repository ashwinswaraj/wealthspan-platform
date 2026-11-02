# Decision Log

Newest first. One entry per decision: what, why, who.

## 2026-11-01 — Hardening and access (owner: Ashwin Swaraj)

- Security layer in `apps/api/src/middleware/security.ts`: CSRF header, in-memory rate limits, JSON error handler.
- Admin rights pinned by `ADMIN_EMAILS` + `ADMIN_USER_IDS`; trials made unique per user with `sub_key`.
- Chat requires an active plan or trial and a daily quota (40 messages per IST day).
- Payments in Phase 1: manual UPI with a UTR reference, approved by an admin. Payment gateway: TBD.

## 2026-10-25 — Login is Catalyst Embedded Authentication

Replaced the planned custom email-OTP `auth` function with Catalyst Cloud Scale Embedded Authentication (Google, Zoho, email). No custom login function and no `login_codes` table; the user is read from the session in every function. Web Client Hosting serves the apps under `/app/` and `/app/admin/`, same domain as `/server/<function>`.

## 2026-10-24 — Wealthspan direction

1. **Product:** AI personal accountant ("The full arc of your money"), built on a repo converted from an earlier product.
2. **Frontend:** rebuilt in `apps/web` using the existing feature structure and design system; the owner's old single-file app is only a visual reference.
3. **Backend:** everything on Zoho Catalyst: Advanced I/O functions (Express, 30 s limit), Data Store (ZCQL), Authentication. The previous product's database and login code is leftover and pending removal.
4. **AI provider:** Sarvam (`sarvam-105b`) behind one adapter file so it can be swapped.
5. **Data model:** `docs/Database/41_Wealthspan_Data_Model.md`. Money is integer paise.
