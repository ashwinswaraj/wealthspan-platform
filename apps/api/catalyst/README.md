# Catalyst functions

Project: Wealthspan (Catalyst). Deploy from this folder with the Catalyst CLI:

    npm i -g zcatalyst-cli
    catalyst login
    catalyst init        # pick the existing "Wealthspan" project
    catalyst deploy

## functions/finance (transactions API)

Routes: `GET/POST /transactions`, `PATCH/DELETE /transactions/:id`, `GET /summary`. Login required; the user comes from the Catalyst session.
`functions/finance/index.js` is GENERATED: after changing anything in `apps/api/src/features/finance`, run
`pnpm --filter @wealthspan/api build:catalyst`, commit the result, then deploy (`catalyst deploy` from this folder; run `npm install` in `functions/finance` first).
Not yet run on real Catalyst (unverified): `userManagement().getCurrentUser()` field names, how bigint ids / NULLs come back, ZCQL row cap.
Only transactions have routes so far; projects, accounts, events, loans and investments need their own routes (and the chatbot) next.

Note: `catalyst deploy` overwrites a function's env variables with `env_variables` from its `catalyst-config.json`.
Non-secret values (ADMIN_EMAILS, ADMIN_USER_IDS) live there. Secrets (SARVAM_API_KEY, etc.) must NEVER be put in the repo:
set them in the console or via the connector AFTER each deploy until a better way is chosen.

## files function (PDF / Excel / CSV / Word)

`GET /server/files/export?format=csv|xlsx|docx|pdf&from=YYYY-MM-DD&to=YYYY-MM-DD&projectId=` (login required).
Shared report code: `apps/api/src/features/files`. PDF uses "Rs." because built-in PDF fonts have no ₹ glyph.
Project, account and event names are looked up from the catalog store.
Build all functions with `pnpm --filter @wealthspan/api build:catalyst` (script: `apps/api/catalyst/build.mjs`).

## Catalog routes (finance function)

`GET/POST /projects|accounts|events|loans|investments`, `PATCH|DELETE /<entity>/:id`,
`POST /events/:id/conclude|reopen`, `POST /loans/:id/close|reopen`, `POST /projects|accounts/:id/archive|unarchive`.
Code: `apps/api/src/features/catalog`. Deleting something still used by transactions answers 409.

## Login

There is no custom login function. Sign-in is Catalyst Cloud Scale Authentication (Google / Zoho / email) through the Embedded Auth sheet; every function reads the user from the session.
