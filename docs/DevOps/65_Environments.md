# Environments

> Status: Draft · Last updated: 2026-11-01

| Environment | Where                                                                                        | Notes                                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Local       | `pnpm dev` (web only, port per `apps/web`); admin with `pnpm --filter @wealthspan/admin dev` | API functions are not run locally by default; use `VITE_API_BASE` to point at a deployed Catalyst function URL |
| Development | Catalyst Development environment                                                             | Current Data Store schema lives here ([42](../Database/42_Catalyst_Data_Store_Schema.md))                      |
| Production  | Catalyst Production environment                                                              | Created by deploying/promoting Development; not live yet                                                       |

Config that differs per environment: function env vars (`ADMIN_EMAILS`, `ADMIN_USER_IDS`, `SARVAM_API_KEY`), the Catalyst project id, and the Embedded Authentication provider settings (Google needs its own Client ID/Secret).
