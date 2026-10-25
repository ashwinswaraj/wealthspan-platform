# Decision Log

Newest first. One entry per decision: what, why, who, what it replaces.

## 2026-10-24 — Wealthspan direction (owner: Ashwin Swaraj)

1. **Product:** this repo is being converted from Jobrio to **Wealthspan**
   (AI personal accountant). Jobrio-specific code (orders, professionals,
   QA, escrow registries) stays untouched until the owner approves removing it.
2. **Frontend:** the owner's existing Wealthspan frontend exists only as a
   compiled single HTML file (no source). It is used as the visual and
   behavioural reference; the app is rebuilt inside `apps/web` using the
   existing structure (features/, packages/ui design system, TanStack).
3. **Backend:** server functions run on **Zoho Catalyst** (owner's choice).
   Functions are written in Node.js (Catalyst supports Java, Node.js, Python).
   To verify before building: function execution-time limit and outbound HTTP
   from functions (needed for the AI API) — not stated in the docs read so far.
4. **AI provider:** **Sarvam** (owner's choice). Keep the provider behind a
   small adapter so it can be swapped (Claude was evaluated as the alternative).
   To verify before relying on it: tool/function-calling quality for
   create/edit/delete actions.
5. **Database and login:** **everything on Zoho Catalyst** (owner: "Sab
   catalyst pr") — Data Store (ZCQL) + Catalyst Authentication. Supabase is
   dropped for Wealthspan; old Jobrio Supabase code stays until removal is
   approved. Verified from Catalyst docs: Advanced I/O timeout 30 s; Express
   supported; ZCQL has SUM/COUNT/MIN/MAX/AVG, GROUP BY, HAVING, LIMIT
   offset,count, max 4 JOINs, no documented row cap; column types Text, Var
   Char(255), Date, DateTime, Int(10 digits), BigInt(19), Double, Boolean,
   Foreign Key, Encrypted text; every table has ROWID/CREATORID/CREATEDTIME/
   MODIFIEDTIME; Google social login needs own Client ID/Secret + Public
   Signup. STILL UNVERIFIED: email-code (OTP) login, outbound HTTP from
   functions to Sarvam, free-tier insert/row limits at real usage, function
   memory. Money columns must be BigInt (paise); Int (10 digits) overflows at ~₹10 crore, below our ₹100 crore input cap.
6. **Data model:** see `docs/Database/41_Wealthspan_Data_Model.md`.
7. **Money** is integer paise everywhere (the old frontend used floats).
