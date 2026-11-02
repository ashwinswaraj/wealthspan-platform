# @wealthspan/api

Backend for Wealthspan: Zoho Catalyst Advanced I/O functions (`catalyst/functions/{finance,chat,files}`) built
from the shared code in `src/`. Identity is Catalyst Authentication; data is the Catalyst Data Store.

## Layout

```
src/
  features/<domain>/  one folder per business domain: controller.ts (HTTP
                      handling), service.ts (business logic / external calls), types.ts,
                      routes.ts, index.ts (barrel). Domains: auth, finance, chat,
                      files, subscription, catalog, admin.
  config/             runtime configuration (Catalyst env vars)
  middleware/         cross-cutting middleware (CSRF header, rate limits, JSON errors)
  utils/              generic helpers (not business logic)
catalyst/             Catalyst project: functions, client hosting, catalyst.json
tests/
```

## Current state

All three functions are deployed to the Development environment. Deploy steps are in
`docs/DevOps/64_Deployment.md`; endpoint contracts are in `docs/API/`. Copy `.env.example` to `.env` for local
runs; on Catalyst the same names are set in `catalyst-config.json` (and `SARVAM_API_KEY` in the console).
